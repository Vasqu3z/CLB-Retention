'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      transparent: true,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 3

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);

          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.3;
          vec2 shift = vec2(100);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.4;
          }
          return v;
        }

        void main() {
          // Subtle shake effect
          vec2 shake = vec2(sin(iTime * 0.6) * 0.002, cos(iTime * 1.05) * 0.002);
          vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5) / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2 v;
          vec4 o = vec4(0.0);

          float f = 2.0 + fbm(p + vec2(iTime * 2.5, 0.0)) * 0.5;

          // Dynamic meteors shifting between blue/violet and orange
          for (float i = 0.0; i < 30.0; i++) {
            v = p + cos(i * i + (iTime + p.x * 0.08) * 0.02 + i * vec2(13.0, 11.0)) * 3.5 + vec2(sin(iTime * 1.5 + i) * 0.002, cos(iTime * 1.75 - i) * 0.002);
            float tailNoise = fbm(v + vec2(iTime * 0.3, i)) * 0.25 * (1.0 - (i / 30.0));

            // Alternating meteor colors: blue/violet and orange
            // Use time + index to create shifting colors for each meteor
            float colorShift = sin(i * 0.8 + iTime * 0.3) * 0.5 + 0.5;

            // Orange spectrum (orange #FF6B35, coral #FF8C61)
            vec3 orangeColor = mix(
              vec3(1.0, 0.42, 0.21),  // nebula-orange
              vec3(1.0, 0.55, 0.38),  // coral
              sin(i * 0.2 + iTime * 0.15) * 0.5 + 0.5
            );

            // Blue/Violet spectrum (violet #8B5CF6, blue #3B82F6)
            vec3 blueVioletColor = mix(
              vec3(0.545, 0.361, 0.965),  // violet
              vec3(0.231, 0.510, 0.965),  // blue
              sin(i * 0.25 + iTime * 0.2) * 0.5 + 0.5
            );

            // Each meteor shifts between orange and blue/violet
            vec3 finalColor = mix(orangeColor, blueVioletColor, colorShift);

            vec4 auroraColors = vec4(finalColor, 1.0);
            vec4 currentContribution = auroraColors * exp(sin(i * i + iTime * 0.4)) / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
            float thinnessFactor = smoothstep(0.0, 1.0, i / 30.0) * 0.5;
            o += currentContribution * (1.0 + tailNoise * 0.6) * thinnessFactor;
          }

          // Less aggressive tone mapping for brighter output
          o = tanh(pow(o / 40.0, vec4(1.5)));

          // Increase brightness significantly (was 0.35)
          gl_FragColor = o * 0.9;
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const animate = () => {
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ opacity: 0.75 }}
    />
  );
};

export default AnimatedBackground;

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
          float a = 0.5;
          vec2 shift = vec2(100);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          vec2 p = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;

          vec4 color = vec4(0.0);

          // Multiple meteor streams
          for (float i = 0.0; i < 50.0; i++) {
            float t = iTime * 0.3 + i * 0.8;

            // Meteor trajectory - diagonal movement
            vec2 meteorPos = vec2(
              cos(t * 0.4 + i * 2.1) * 2.5,
              sin(t * 0.5 + i * 1.7) * 1.5 - mod(t + i * 0.3, 3.0) + 1.5
            );

            // Distance from meteor
            vec2 diff = p - meteorPos;
            float dist = length(diff);

            // Meteor tail direction
            vec2 tailDir = normalize(vec2(
              sin(t * 0.3 + i),
              cos(t * 0.4 + i * 0.9)
            ));

            // Create elongated tail
            float tailDot = dot(normalize(diff), tailDir);
            float tailFactor = smoothstep(-0.3, 0.9, tailDot);

            // Meteor intensity - MUCH BRIGHTER
            float intensity = 0.04 / (dist + 0.03);  // Increased from 0.015 to 0.04
            intensity *= tailFactor * 0.7 + 0.3;

            // Dynamic color shifting based on time and position
            float colorPhase = fract(t * 0.2 + i * 0.15);
            vec3 meteorColor;

            if (colorPhase < 0.33) {
              // Orange to Gold transition
              float mix1 = colorPhase / 0.33;
              meteorColor = mix(
                vec3(1.0, 0.42, 0.21),  // nebula-orange
                vec3(1.0, 0.65, 0.17),  // solar-gold
                mix1
              );
            } else if (colorPhase < 0.66) {
              // Gold to Cyan transition
              float mix2 = (colorPhase - 0.33) / 0.33;
              meteorColor = mix(
                vec3(1.0, 0.65, 0.17),  // solar-gold
                vec3(0.0, 0.83, 1.0),   // nebula-cyan
                mix2
              );
            } else {
              // Cyan to Orange transition (completing the cycle)
              float mix3 = (colorPhase - 0.66) / 0.34;
              meteorColor = mix(
                vec3(0.0, 0.83, 1.0),   // nebula-cyan
                vec3(1.0, 0.42, 0.21),  // nebula-orange
                mix3
              );
            }

            // Add bright highlights with noise
            float noiseVal = fbm(p * 2.0 + vec2(iTime * 0.1, i));
            meteorColor = mix(meteorColor, vec3(1.2, 1.2, 1.0), noiseVal * 0.4);  // Brighter highlights

            // Accumulate color
            color.rgb += meteorColor * intensity;
          }

          // Add subtle background nebula - DARKER
          vec2 nebulaUV = p * 0.8 + vec2(iTime * 0.02, 0.0);
          float nebula = fbm(nebulaUV) * 0.08;  // Reduced from 0.15 to 0.08
          vec3 nebulaColor = mix(
            vec3(0.8, 0.3, 0.15),   // Dark orange
            vec3(0.0, 0.6, 0.7),    // Dim teal
            fbm(nebulaUV * 1.5 + vec2(iTime * 0.05, 0.0))
          );
          color.rgb += nebulaColor * nebula;

          // Apply tone mapping for better color
          color.rgb = pow(color.rgb, vec3(0.9));
          color.a = 1.0;

          gl_FragColor = color;
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
      style={{ opacity: 0.5 }}
    />
  );
};

export default AnimatedBackground;

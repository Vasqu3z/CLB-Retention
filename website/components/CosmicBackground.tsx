"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * CosmicBackground - Animated space background with twinkling stars and nebulas
 * Creates an immersive cosmic atmosphere matching the original arcade design
 */
export default function CosmicBackground() {
  // Generate stars once on mount - 150 stars for performance balance
  const stars = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1, // 1-3px
      opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8
      duration: Math.random() * 3 + 2, // 2-5s twinkle
      delay: Math.random() * 5, // Stagger the animations
    }));
  }, []);

  return (
    <>
      {/* Deep space background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#0a0a12] via-[#050510] to-[#020208]">

        {/* Starfield */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
              }}
              animate={{
                opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: star.delay,
              }}
            />
          ))}
        </div>

        {/* Nebula clouds - larger and more diffuse than before */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,243,255,0.15) 0%, transparent 70%)",
            filter: "blur(80px)",
            top: "-10%",
            left: "-15%",
          }}
          animate={{
            y: [0, 60, 0],
            x: [0, 40, 0],
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-[900px] h-[900px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 70%)",
            filter: "blur(100px)",
            top: "20%",
            right: "-20%",
          }}
          animate={{
            y: [0, -70, 0],
            x: [0, -50, 0],
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />

        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(244,208,63,0.1) 0%, transparent 70%)",
            filter: "blur(90px)",
            bottom: "-5%",
            left: "20%",
          }}
          animate={{
            y: [0, 50, 0],
            x: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
        />

        {/* Additional subtle nebula for depth */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,243,255,0.08) 0%, transparent 60%)",
            filter: "blur(70px)",
            bottom: "30%",
            right: "10%",
          }}
          animate={{
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 15,
          }}
        />

        {/* Vignette effect - darker edges */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(2,2,8,0.7) 100%)",
          }}
        />
      </div>

      {/* Scanlines overlay - increased opacity to match original */}
      <div className="fixed inset-0 pointer-events-none z-[1] scanlines opacity-[0.08]" />
    </>
  );
}

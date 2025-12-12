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
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#050508]">

        {/* Nebula clouds - much brighter and more visible */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, #00F3FF 0%, rgba(0,243,255,0.4) 30%, transparent 70%)",
            filter: "blur(120px)",
            top: "-15%",
            left: "-10%",
          }}
          animate={{
            y: [0, 60, 0],
            x: [0, 40, 0],
            scale: [1, 1.1, 1],
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
            background: "radial-gradient(circle, #BD00FF 0%, rgba(189,0,255,0.3) 30%, transparent 70%)",
            filter: "blur(140px)",
            top: "30%",
            right: "-15%",
          }}
          animate={{
            y: [0, -70, 0],
            x: [0, -50, 0],
            scale: [1, 1.15, 1],
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
            background: "radial-gradient(circle, #F4D03F 0%, rgba(244,208,63,0.3) 30%, transparent 70%)",
            filter: "blur(100px)",
            bottom: "-10%",
            left: "15%",
          }}
          animate={{
            y: [0, 50, 0],
            x: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
        />

        {/* Secondary cyan nebula for depth */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,243,255,0.5) 0%, rgba(0,243,255,0.2) 30%, transparent 60%)",
            filter: "blur(80px)",
            bottom: "20%",
            right: "5%",
          }}
          animate={{
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 15,
          }}
        />

        {/* Starfield - rendered on top of nebulas */}
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

        {/* Vignette effect - darker edges */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(5,5,8,0.8) 100%)",
          }}
        />
      </div>

      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] scanlines opacity-[0.06]" />
    </>
  );
}

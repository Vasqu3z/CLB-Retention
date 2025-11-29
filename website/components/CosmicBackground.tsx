"use client";

import { motion } from "framer-motion";

/**
 * CosmicBackground - Animated space background with floating orbs
 * Provides subtle ambient motion to make the site feel more alive
 */
export default function CosmicBackground() {
  return (
    <>
      {/* Cosmic background orbs - high z-index to appear over page backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5] mix-blend-screen">
        {/* Floating orbs - increased opacity for visibility */}
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full blur-[120px]"
          style={{
            background: "var(--comets-cyan)",
            opacity: 0.18,
            top: "0%",
            left: "-20%",
          }}
          animate={{
            y: [0, 40, 0],
            x: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full blur-[150px]"
          style={{
            background: "var(--comets-purple)",
            opacity: 0.2,
            top: "35%",
            right: "-15%",
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: "var(--comets-yellow)",
            opacity: 0.12,
            bottom: "0%",
            left: "10%",
          }}
          animate={{
            y: [0, 30, 0],
            x: [0, -25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.07,
            backgroundImage: `
              linear-gradient(to right, rgba(0,243,255,0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,243,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Vignette effect */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(5,5,5,0.5) 100%)",
          }}
        />
      </div>

      {/* Scanlines overlay - on top of everything */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanlines opacity-[0.04]" />
    </>
  );
}

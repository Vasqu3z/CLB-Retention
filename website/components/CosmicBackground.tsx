"use client";

import { motion } from "framer-motion";

/**
 * CosmicBackground - Animated space background with floating orbs
 * Provides subtle ambient motion to make the site feel more alive
 */
export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface-dark" />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
        style={{
          background: "radial-gradient(circle, var(--comets-cyan) 0%, transparent 70%)",
          top: "10%",
          left: "-10%",
        }}
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, var(--comets-purple) 0%, transparent 70%)",
          top: "60%",
          right: "-5%",
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.02]"
        style={{
          background: "radial-gradient(circle, var(--comets-yellow) 0%, transparent 70%)",
          bottom: "20%",
          left: "30%",
        }}
        animate={{
          y: [0, 20, 0],
          x: [0, -15, 0],
          scale: [1, 1.2, 1],
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
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,243,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,243,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * CosmicBackground - Atmospheric edge glow with twinkling starfield
 *
 * Design: Color emanates from screen edges/corners rather than floating orbs.
 * Uses pure CSS gradients (no blur filter) for organic diffusion.
 */
export default function CosmicBackground() {
  // Generate stars once on mount - 200 to match original design
  const stars = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => ({
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
      {/* Atmospheric background with edge glows */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        style={{
          backgroundColor: "#050508",
          backgroundImage: `
            /* Cyan glow from top-left */
            radial-gradient(
              ellipse 90% 70% at 0% 0%,
              rgba(0, 243, 255, 0.15) 0%,
              rgba(0, 243, 255, 0.05) 30%,
              transparent 60%
            ),
            /* Purple glow from bottom-right */
            radial-gradient(
              ellipse 80% 90% at 100% 100%,
              rgba(189, 0, 255, 0.12) 0%,
              rgba(189, 0, 255, 0.04) 30%,
              transparent 60%
            ),
            /* Yellow accent from bottom-left */
            radial-gradient(
              ellipse 60% 50% at 0% 100%,
              rgba(244, 208, 63, 0.10) 0%,
              rgba(244, 208, 63, 0.03) 30%,
              transparent 50%
            ),
            /* Subtle cyan accent top-right for balance */
            radial-gradient(
              ellipse 50% 40% at 100% 0%,
              rgba(0, 243, 255, 0.06) 0%,
              transparent 50%
            )
          `,
        }}
      >
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

        {/* Vignette effect - darker edges to frame content */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(5,5,8,0.6) 100%)",
          }}
        />
      </div>

      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] scanlines opacity-[0.08]" />
    </>
  );
}

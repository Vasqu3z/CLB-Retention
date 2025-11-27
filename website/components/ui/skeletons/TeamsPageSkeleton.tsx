"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

/**
 * TeamsPageSkeleton
 *
 * Arcade-style loading state for the teams grid page.
 * Shows animated card placeholders materializing into view.
 */
export default function TeamsPageSkeleton() {
  // Generate 12 team card placeholders (typical league size)
  const teamCards = Array.from({ length: 12 }, (_, i) => i);

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-comets-blue/10 to-transparent -z-10" />

      {/* Cosmic background blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-1/4 right-1/3 w-[600px] h-[600px] bg-comets-yellow/10 blur-[100px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-4">
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users size={14} className="text-comets-cyan" />
            </motion.div>
            <motion.span
              className="text-comets-cyan text-xs font-mono uppercase tracking-widest"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              League Roster
            </motion.span>
          </div>

          {/* Title with scanline reveal */}
          <div className="relative inline-block">
            <h1 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">
              Select{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                Team
              </span>
            </h1>

            {/* Scanline reveal animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
              initial={{ y: "0%" }}
              animate={{ y: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Loading text */}
          <motion.div
            className="font-mono text-xs uppercase tracking-[0.5em] text-comets-cyan mt-4"
            animate={{
              opacity: [0.3, 1, 0.3],
              textShadow: [
                "0 0 0px #00F3FF",
                "0 0 10px #00F3FF",
                "0 0 0px #00F3FF"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Teams
          </motion.div>
        </motion.div>

        {/* The Grid - Team Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamCards.map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="group relative"
            >
              <div className="relative bg-surface-dark border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all">
                {/* Scanlines */}
                <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-comets-cyan/10 to-transparent"
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                />

                {/* Card content */}
                <div className="relative p-6">
                  {/* Team logo placeholder */}
                  <div className="aspect-square mb-4 flex items-center justify-center">
                    <motion.div
                      className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center relative overflow-hidden"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                    >
                      {/* Rotating shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />

                      {/* Center pulse */}
                      <motion.div
                        className="w-16 h-16 rounded-full bg-white/10"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                      />
                    </motion.div>
                  </div>

                  {/* Team name placeholder */}
                  <motion.div
                    className="h-7 bg-white/10 rounded mb-2"
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.08 }}
                  />

                  {/* Team code placeholder */}
                  <motion.div
                    className="h-4 bg-white/5 rounded w-16 mb-4"
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.08 + 0.2 }}
                  />

                  {/* Stats row */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    {/* Record */}
                    <div className="space-y-1">
                      <motion.div
                        className="h-3 bg-white/5 rounded w-12"
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 }}
                      />
                      <motion.div
                        className="h-5 bg-white/10 rounded w-16"
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 + 0.1 }}
                      />
                    </div>

                    {/* AVG */}
                    <div className="space-y-1 text-right">
                      <motion.div
                        className="h-3 bg-white/5 rounded w-12 ml-auto"
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 + 0.15 }}
                      />
                      <motion.div
                        className="h-5 bg-comets-cyan/20 rounded w-16 ml-auto relative overflow-hidden"
                        animate={{
                          borderColor: ["rgba(0,243,255,0.2)", "rgba(0,243,255,0.4)", "rgba(0,243,255,0.2)"]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.08 }}
                      >
                        {/* Data stream effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-cyan/30 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outer glow pulse */}
              <motion.div
                className="absolute inset-0 rounded-lg border border-comets-cyan/0 pointer-events-none"
                animate={{
                  borderColor: ["rgba(0,243,255,0)", "rgba(0,243,255,0.2)", "rgba(0,243,255,0)"],
                  boxShadow: [
                    "0 0 0px rgba(0,243,255,0)",
                    "0 0 20px rgba(0,243,255,0.15)",
                    "0 0 0px rgba(0,243,255,0)"
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.1 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-2 mt-16"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: [
                  "rgba(255,255,255,0.2)",
                  "rgba(0,243,255,1)",
                  "rgba(255,255,255,0.2)"
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
    </main>
  );
}

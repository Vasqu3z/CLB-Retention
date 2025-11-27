"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * SchedulePageSkeleton
 *
 * Arcade-style loading state for the schedule page.
 * Shows animated matchup cards materializing into the schedule grid.
 */
export default function SchedulePageSkeleton() {
  // Show 8 matchup placeholders
  const matchups = Array.from({ length: 8 }, (_, i) => i);

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-comets-cyan/10 blur-[120px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] bg-comets-red/10 blur-[100px] rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.12, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Page Header */}
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
              <Calendar size={14} className="text-comets-cyan" />
            </motion.div>
            <motion.span
              className="text-comets-cyan text-xs font-mono uppercase tracking-widest"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading Schedule
            </motion.span>
          </div>

          {/* Title with scanline reveal */}
          <div className="relative inline-block">
            <h1 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">
              Game{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                Schedule
              </span>
            </h1>

            {/* Scanline effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
              animate={{ y: ["0%", "100%"] }}
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
            Retrieving Matchups
          </motion.div>
        </motion.div>

        {/* Week Selector Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {/* Previous button */}
          <motion.div
            className="w-10 h-10 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronLeft size={20} className="text-white/40" />
          </motion.div>

          {/* Week indicators */}
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className={`px-4 py-2 rounded-lg border ${
                  i === 2 ? "bg-comets-cyan/20 border-comets-cyan/40" : "bg-surface-dark border-white/10"
                }`}
                animate={{
                  opacity: i === 2 ? [0.5, 0.8, 0.5] : [0.2, 0.4, 0.2],
                  borderColor: i === 2
                    ? ["rgba(0,243,255,0.4)", "rgba(0,243,255,0.6)", "rgba(0,243,255,0.4)"]
                    : "rgba(255,255,255,0.1)"
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              >
                <motion.div
                  className="h-4 w-12 bg-white/10 rounded"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Next button */}
          <motion.div
            className="w-10 h-10 rounded-lg bg-surface-dark border border-white/10 flex items-center justify-center"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            <ChevronRight size={20} className="text-white/40" />
          </motion.div>
        </motion.div>

        {/* Matchup Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchups.map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5 + index * 0.05,
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
                  className="absolute inset-0 bg-gradient-to-br from-comets-cyan/5 to-transparent"
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                />

                {/* Card content */}
                <div className="relative p-6">
                  {/* Date/Time header */}
                  <div className="flex justify-between items-center mb-6">
                    <motion.div
                      className="h-4 w-24 bg-white/10 rounded"
                      animate={{ opacity: [0.1, 0.2, 0.1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.08 }}
                    />
                    <motion.div
                      className="h-4 w-16 bg-white/5 rounded"
                      animate={{ opacity: [0.05, 0.15, 0.05] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.08 + 0.2 }}
                    />
                  </div>

                  {/* Teams matchup */}
                  <div className="space-y-4">
                    {/* Away team */}
                    <div className="flex items-center gap-4">
                      {/* Team logo */}
                      <motion.div
                        className="w-12 h-12 rounded bg-white/10 flex items-center justify-center relative overflow-hidden flex-shrink-0"
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
                      </motion.div>

                      {/* Team name */}
                      <motion.div
                        className="flex-1 h-5 bg-white/10 rounded"
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 }}
                      />

                      {/* Score placeholder */}
                      <motion.div
                        className="w-16 h-8 bg-white/5 rounded relative overflow-hidden"
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 + 0.1 }}
                      >
                        {/* Data stream */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-cyan/20 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: index * 0.15 }}
                        />
                      </motion.div>
                    </div>

                    {/* VS divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <motion.div
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10"
                        animate={{
                          borderColor: ["rgba(255,255,255,0.1)", "rgba(0,243,255,0.3)", "rgba(255,255,255,0.1)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                      >
                        <span className="font-mono text-xs text-white/40">VS</span>
                      </motion.div>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Home team */}
                    <div className="flex items-center gap-4">
                      {/* Team logo */}
                      <motion.div
                        className="w-12 h-12 rounded bg-white/10 flex items-center justify-center relative overflow-hidden flex-shrink-0"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 + 0.5 }}
                      >
                        {/* Rotating shimmer */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 0.5 }}
                        />
                      </motion.div>

                      {/* Team name */}
                      <motion.div
                        className="flex-1 h-5 bg-white/10 rounded"
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 + 0.15 }}
                      />

                      {/* Score placeholder */}
                      <motion.div
                        className="w-16 h-8 bg-white/5 rounded relative overflow-hidden"
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 + 0.2 }}
                      >
                        {/* Data stream */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-cyan/20 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: index * 0.15 + 0.5 }}
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
          transition={{ delay: 1 }}
          className="flex justify-center gap-2 mt-12"
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

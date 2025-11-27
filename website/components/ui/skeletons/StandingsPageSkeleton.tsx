"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

/**
 * StandingsPageSkeleton
 *
 * Arcade-style loading state for the standings table.
 * Shows animated rankings materializing into the leaderboard.
 */
export default function StandingsPageSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-1/3 left-1/3 w-[700px] h-[700px] bg-comets-yellow/10 blur-[120px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy size={24} className="text-comets-yellow" />
              </motion.div>

              <motion.div
                className="h-4 w-24 bg-comets-yellow/20 rounded"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            {/* Title with scanline reveal */}
            <div className="relative">
              <h1 className="font-display text-4xl md:text-6xl uppercase text-white leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                  League Standings
                </span>
              </h1>

              {/* Scanline effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
                animate={{ y: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="font-mono text-xs uppercase tracking-[0.5em] text-comets-cyan text-center mb-8"
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
          Calculating Rankings
        </motion.div>

        {/* The Table Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-dark border border-white/10 rounded-lg overflow-hidden relative"
        >
          {/* Scanlines */}
          <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

          {/* Table Header */}
          <div className="grid grid-cols-[50px_2fr_repeat(6,1fr)] gap-4 p-4 border-b border-white/10 bg-white/5">
            {["#", "Team", "W", "L", "PCT", "GB", "STRK", "RD"].map((_, i) => (
              <motion.div
                key={i}
                className="h-4 bg-white/10 rounded"
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(12)].map((_, rowIdx) => (
            <motion.div
              key={rowIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + rowIdx * 0.05 }}
              className="grid grid-cols-[50px_2fr_repeat(6,1fr)] gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5"
            >
              {/* Rank with podium highlighting */}
              <motion.div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  rowIdx < 3 ? "bg-comets-yellow/20" : "bg-white/5"
                }`}
                animate={{
                  opacity: rowIdx < 3 ? [0.3, 0.5, 0.3] : [0.1, 0.2, 0.1],
                  scale: rowIdx < 3 ? [1, 1.05, 1] : 1
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: rowIdx * 0.08 }}
              />

              {/* Team column with logo */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded bg-white/10 flex-shrink-0"
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: rowIdx * 0.08 }}
                />

                <div className="flex-1 space-y-1">
                  <motion.div
                    className="h-4 bg-white/10 rounded w-3/4"
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.08 + 0.1 }}
                  />
                  <motion.div
                    className="h-3 bg-white/5 rounded w-16"
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.08 + 0.2 }}
                  />
                </div>
              </div>

              {/* Stats columns with data streams */}
              {[...Array(6)].map((_, colIdx) => (
                <motion.div
                  key={colIdx}
                  className={`h-4 rounded relative overflow-hidden ${
                    colIdx === 2 ? "bg-comets-cyan/10" : "bg-white/5"
                  }`}
                  animate={{
                    opacity: [0.05, 0.15, 0.05]
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.08 + colIdx * 0.03 }}
                >
                  {/* Data stream on PCT column */}
                  {colIdx === 2 && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-cyan/30 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: rowIdx * 0.1
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        {/* Legend / Info - Loading State */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-white/20 border-t border-white/5 pt-8"
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <motion.div
                className="h-3 bg-white/5 rounded w-32"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
              />
              <motion.div
                className="h-3 bg-white/5 rounded w-full"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 + 0.15 }}
              />
            </div>
          ))}
        </motion.div>

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
                  "rgba(244,208,63,1)",
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

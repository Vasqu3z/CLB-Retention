"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

/**
 * PlayersPageSkeleton
 *
 * Arcade-style loading state for the players table page.
 * Shows animated table rows with player avatars loading in sequence.
 */
export default function PlayersPageSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-comets-cyan/10 blur-[120px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
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
              Loading Stats
            </motion.span>
          </div>

          {/* Title with scanline reveal */}
          <div className="relative inline-block">
            <h1 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">
              All{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                Players
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
            Retrieving Player Data
          </motion.div>
        </motion.div>

        {/* Toggle Button Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex gap-2 bg-surface-dark p-1 rounded-full border border-white/10">
            {["Regular", "Playoff"].map((label, idx) => (
              <motion.div
                key={label}
                className="px-6 py-2 rounded-full bg-white/5 relative overflow-hidden"
                animate={{
                  borderColor: idx === 0 ? ["rgba(0,243,255,0.2)", "rgba(0,243,255,0.4)", "rgba(0,243,255,0.2)"] : "transparent"
                }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
              >
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 bg-comets-cyan/10"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: idx * 0.3 }}
                />

                <motion.div
                  className="relative h-4 w-16 bg-white/10 rounded"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Table Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface-dark border border-white/10 rounded-lg overflow-hidden"
        >
          {/* Scanlines */}
          <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

          {/* Table Header */}
          <div className="grid grid-cols-[50px_2fr_1fr_repeat(6,1fr)] gap-4 p-4 border-b border-white/10 bg-white/5">
            {["#", "Player", "Team", "GP", "AVG", "HR", "RBI", "SB", "OPS"].map((_, i) => (
              <motion.div
                key={i}
                className="h-4 bg-white/10 rounded"
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(15)].map((_, rowIdx) => (
            <motion.div
              key={rowIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + rowIdx * 0.04 }}
              className="grid grid-cols-[50px_2fr_1fr_repeat(6,1fr)] gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5"
            >
              {/* Rank */}
              <motion.div
                className="h-4 bg-white/5 rounded w-8"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.06 }}
              />

              {/* Player column with avatar */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded bg-white/10 flex-shrink-0"
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: rowIdx * 0.06 }}
                />
                <motion.div
                  className="h-4 bg-white/10 rounded flex-1 max-w-[150px]"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.06 + 0.1 }}
                />
              </div>

              {/* Team */}
              <motion.div
                className="h-4 bg-white/5 rounded"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.06 + 0.15 }}
              />

              {/* Stats columns - with data stream effect on some */}
              {[...Array(6)].map((_, colIdx) => (
                <motion.div
                  key={colIdx}
                  className={`h-4 rounded relative overflow-hidden ${
                    colIdx === 1 || colIdx === 5 ? "bg-comets-cyan/10" : "bg-white/5"
                  }`}
                  animate={{
                    opacity: [0.05, 0.15, 0.05]
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.06 + colIdx * 0.03 }}
                >
                  {/* Data stream on highlighted stats */}
                  {(colIdx === 1 || colIdx === 5) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-cyan/30 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: rowIdx * 0.1 + colIdx * 0.2
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
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

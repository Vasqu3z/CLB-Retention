"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Activity, Users, Zap } from "lucide-react";

/**
 * PlayerDetailPageSkeleton
 *
 * Arcade-style loading state for individual player profile pages.
 * Shows player card, stats grid, attributes, and chemistry loading.
 */
export default function PlayerDetailPageSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-1/4 right-1/3 w-[700px] h-[700px] bg-comets-cyan/10 blur-[120px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-comets-yellow/10 blur-[100px] rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.12, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header with loading text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
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
              <User size={14} className="text-comets-cyan" />
            </motion.div>
            <motion.span
              className="text-comets-cyan text-xs font-mono uppercase tracking-widest"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading Player Profile
            </motion.span>
          </div>
        </motion.div>

        {/* Player Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-dark border border-white/10 rounded-lg overflow-hidden mb-8 relative"
        >
          {/* Scanlines */}
          <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div className="relative p-8 flex items-center gap-8">
            {/* Player Avatar Placeholder */}
            <motion.div
              className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center relative overflow-hidden flex-shrink-0"
              animate={{
                borderColor: ["rgba(255,255,255,0.2)", "rgba(0,243,255,0.4)", "rgba(255,255,255,0.2)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Rotating shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-comets-cyan/20 to-transparent"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              {/* Center pulse */}
              <motion.div
                className="w-20 h-20 rounded-full bg-white/10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Player Info */}
            <div className="flex-1 space-y-4">
              {/* Team badge */}
              <motion.div
                className="h-5 w-32 bg-white/10 rounded-full"
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              {/* Player name - scanline reveal */}
              <div className="relative">
                <motion.div
                  className="h-12 bg-white/10 rounded w-3/4"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Scanline effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
                  animate={{ y: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Position/Role */}
              <motion.div
                className="h-4 w-24 bg-white/5 rounded"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[...Array(8)].map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
              className="bg-surface-dark border border-white/10 rounded-lg p-4 relative overflow-hidden"
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-comets-cyan/5"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
              />

              <div className="relative">
                {/* Stat label */}
                <motion.div
                  className="h-3 w-12 bg-white/10 rounded mb-2"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.08 }}
                />

                {/* Stat value with data stream */}
                <motion.div
                  className="h-8 bg-comets-cyan/10 rounded relative overflow-hidden"
                  animate={{
                    borderColor: ["rgba(0,243,255,0.1)", "rgba(0,243,255,0.3)", "rgba(0,243,255,0.1)"]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.1 }}
                >
                  {/* Data stream effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-cyan/30 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: idx * 0.15 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Attributes and Chemistry Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attributes Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-surface-dark border border-white/10 rounded-lg p-6 relative overflow-hidden"
          >
            {/* Scanlines */}
            <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="p-2 bg-comets-cyan/10 rounded-lg"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="text-comets-cyan" size={20} />
              </motion.div>

              <motion.div
                className="h-6 w-32 bg-white/10 rounded"
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            {/* Radar chart placeholder */}
            <div className="aspect-square flex items-center justify-center">
              <motion.div
                className="w-48 h-48 rounded-full border-4 border-white/10 relative"
                animate={{
                  borderColor: ["rgba(255,255,255,0.1)", "rgba(0,243,255,0.2)", "rgba(255,255,255,0.1)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Rotating scanner line */}
                <motion.div
                  className="absolute top-1/2 left-1/2 w-24 h-0.5 bg-comets-cyan origin-left"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Center pulse */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-comets-cyan"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Chemistry Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-surface-dark border border-white/10 rounded-lg p-6 relative overflow-hidden"
          >
            {/* Scanlines */}
            <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="p-2 bg-comets-yellow/10 rounded-lg"
                animate={{
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Users className="text-comets-yellow" size={20} />
              </motion.div>

              <motion.div
                className="h-6 w-32 bg-white/10 rounded"
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
            </div>

            {/* Chemistry list */}
            <div className="space-y-3">
              {[...Array(5)].map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.08 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                >
                  {/* Icon */}
                  <motion.div
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.1 }}
                  >
                    <Zap size={14} className="text-comets-cyan" />
                  </motion.div>

                  {/* Player name */}
                  <motion.div
                    className="flex-1 h-4 bg-white/10 rounded"
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.08 }}
                  />

                  {/* Value */}
                  <motion.div
                    className="w-16 h-6 bg-comets-cyan/10 rounded relative overflow-hidden"
                    animate={{
                      borderColor: ["rgba(0,243,255,0.1)", "rgba(0,243,255,0.3)", "rgba(0,243,255,0.1)"]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.1 }}
                  >
                    {/* Data stream */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-cyan/30 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: idx * 0.2 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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

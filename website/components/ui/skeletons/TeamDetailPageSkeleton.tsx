"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Activity } from "lucide-react";

/**
 * TeamDetailPageSkeleton
 *
 * Arcade-style loading state for individual team detail pages.
 * Mimics the locker room banner, tabs, and data displays.
 */
export default function TeamDetailPageSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Team Header (Locker Room Banner) */}
      <div className="relative h-[50vh] overflow-hidden flex items-end pb-12">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Pulsing glow */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-comets-cyan/10 blur-[120px] rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-5" />

        <div className="container mx-auto px-4 relative z-10 flex items-end gap-8">
          {/* Animated Logo Placeholder */}
          <motion.div
            className="w-32 h-32 md:w-48 md:h-48 bg-surface-dark border-4 border-white/20 rounded-xl flex items-center justify-center relative overflow-hidden"
            animate={{
              borderColor: ["rgba(255,255,255,0.2)", "rgba(0,243,255,0.4)", "rgba(255,255,255,0.2)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Rotating glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-comets-cyan/20 to-transparent"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Pulsing center */}
            <motion.div
              className="w-20 h-20 rounded-full bg-white/10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Team Info Placeholder */}
          <motion.div
            className="mb-4 flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Badges Row */}
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-6 w-20 bg-white/10 rounded-full"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>

            {/* Team Name Placeholder - scanline reveal */}
            <div className="relative mb-3">
              <motion.div
                className="h-16 md:h-24 bg-white/10 rounded-lg w-3/4"
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

            {/* Record Placeholder */}
            <motion.div
              className="h-6 w-40 bg-white/5 rounded"
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </motion.div>
        </div>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-comets-cyan"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          {[
            { id: "roster", label: "Active Roster", icon: Users },
            { id: "schedule", label: "Season Schedule", icon: Calendar },
            { id: "stats", label: "Team Stats", icon: Activity },
          ].map((tab, index) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative px-6 py-3 rounded-t-lg bg-surface-dark border border-white/10 flex items-center gap-2 whitespace-nowrap"
            >
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
              >
                <tab.icon size={16} className="text-white/40" />
              </motion.div>

              <motion.div
                className="h-4 w-24 bg-white/10 rounded"
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
              />

              {/* Active indicator on first tab */}
              {index === 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-comets-yellow"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
          <div className="flex-1 border-b border-white/20 translate-y-[1px]" />
        </div>

        {/* Tab Content - Roster Table Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="min-h-[500px]"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <motion.div
              className="h-8 w-40 bg-white/10 rounded"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-4 w-24 bg-white/5 rounded"
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          </div>

          {/* Table Skeleton */}
          <div className="bg-surface-dark border border-white/10 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 bg-white/5">
              {["Player", "GP", "AVG", "HR", "OPS"].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-4 bg-white/10 rounded"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>

            {/* Table Rows */}
            {[...Array(8)].map((_, rowIdx) => (
              <motion.div
                key={rowIdx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + rowIdx * 0.05 }}
                className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 last:border-0"
              >
                {/* Player column with avatar */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-8 h-8 rounded bg-white/10"
                    animate={{
                      opacity: [0.1, 0.2, 0.1],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: rowIdx * 0.1 }}
                  />
                  <motion.div
                    className="h-4 bg-white/10 rounded flex-1"
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.1 }}
                  />
                </div>

                {/* Stat columns */}
                {[...Array(4)].map((_, colIdx) => (
                  <motion.div
                    key={colIdx}
                    className="h-4 bg-white/5 rounded"
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: rowIdx * 0.1 + colIdx * 0.05 }}
                  />
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center gap-2 mt-12"
      >
        {[0, 1, 2, 3].map((i) => (
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
    </main>
  );
}

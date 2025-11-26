"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Zap, Target } from "lucide-react";

/**
 * LeadersPageSkeleton
 * 
 * Arcade-style loading state for the Leaders page.
 * Design philosophy: Loading isn't just waiting—it's part of the game experience.
 * Think: Arcade cabinet booting up, stats materializing from the void.
 */
export default function LeadersPageSkeleton() {
  // Podium categories to show loading state
  const categories = [
    { icon: Target, name: "BATTING AVERAGE" },
    { icon: Zap, name: "HOME RUNS" },
    { icon: TrendingUp, name: "RUNS BATTED IN" },
  ];

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      
      {/* Cosmic background - same as real page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-comets-cyan/10 blur-[120px] rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-comets-yellow/10 blur-[100px] rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.12, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header - glitching in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-16 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-2 text-comets-cyan mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Loading Stats</span>
          </motion.div>
          
          {/* Title - scanline reveal effect */}
          <div className="relative inline-block">
            <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                LEAGUE
                <br />
                LEADERS
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

          {/* Loading indicator */}
          <motion.div
            className="font-mono text-xs uppercase tracking-[0.5em] text-comets-cyan"
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
            Calculating Statistics
          </motion.div>
        </motion.div>

        {/* Category toggle skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-3 mb-12"
        >
          {["BATTING", "PITCHING"].map((label, idx) => (
            <motion.div
              key={label}
              className="relative px-8 py-4 rounded-full border-2 border-white/10 bg-surface-dark overflow-hidden"
              animate={{ 
                borderColor: idx === 0 ? ["rgba(255,255,255,0.1)", "rgba(0,243,255,0.3)", "rgba(255,255,255,0.1)"] : "rgba(255,255,255,0.1)"
              }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
            >
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 bg-comets-cyan/20"
                animate={{ 
                  x: ["-100%", "100%"]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: idx * 0.3 }}
              />
              
              <span className="relative font-ui uppercase tracking-widest text-white/40 font-bold text-sm">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Podium cards skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {categories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.15, type: "spring", stiffness: 200 }}
              className="relative group"
            >
              <div className="relative bg-surface-dark border border-white/10 rounded-lg overflow-hidden p-8">
                
                {/* Scanlines */}
                <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />
                
                {/* Stat header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-2 bg-comets-cyan/10 rounded-lg"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                    >
                      <category.icon className="text-comets-cyan" size={24} />
                    </motion.div>
                    
                    {/* Category name glitch */}
                    <motion.h3 
                      className="font-display text-2xl uppercase text-white tracking-tight"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.3 }}
                    >
                      {category.name}
                    </motion.h3>
                  </div>
                  <div className="font-mono text-xs text-white/20 uppercase tracking-widest">
                    TOP 3
                  </div>
                </div>

                {/* Loading podium entries */}
                <div className="space-y-3">
                  {[0, 1, 2].map((rank) => (
                    <motion.div
                      key={rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.15 + rank * 0.1 }}
                      className="relative"
                    >
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        
                        {/* Rank badge - pulsing */}
                        <motion.div 
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display text-xl font-bold ${
                            rank === 0 ? "bg-comets-yellow/30" : "bg-white/10"
                          }`}
                          animate={{ 
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: rank * 0.2 }}
                        >
                          {rank + 1}
                        </motion.div>

                        {/* Player name placeholder - shimmer */}
                        <div className="flex-1 space-y-2">
                          <motion.div 
                            className="h-5 bg-white/10 rounded w-32"
                            animate={{ opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: rank * 0.15 }}
                          />
                          <motion.div 
                            className="h-3 bg-white/5 rounded w-20"
                            animate={{ opacity: [0.05, 0.15, 0.05] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: rank * 0.15 + 0.3 }}
                          />
                        </div>

                        {/* Value placeholder - data loading effect */}
                        <motion.div 
                          className="flex-shrink-0 px-6 py-2 bg-comets-cyan/10 border border-comets-cyan/30 rounded-full relative overflow-hidden"
                          animate={{ 
                            borderColor: ["rgba(0,243,255,0.3)", "rgba(0,243,255,0.5)", "rgba(0,243,255,0.3)"]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: rank * 0.2 }}
                        >
                          {/* Data stream effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-cyan/20 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: rank * 0.3 }}
                          />
                          
                          <span className="relative font-mono text-comets-cyan font-bold text-xl opacity-30">
                            ---
                          </span>
                        </motion.div>

                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>

              {/* Outer glow pulse */}
              <motion.div
                className="absolute inset-0 rounded-lg border border-comets-cyan/0 pointer-events-none"
                animate={{ 
                  borderColor: ["rgba(0,243,255,0)", "rgba(0,243,255,0.2)", "rgba(0,243,255,0)"],
                  boxShadow: [
                    "0 0 0px rgba(0,243,255,0)",
                    "0 0 20px rgba(0,243,255,0.2)",
                    "0 0 0px rgba(0,243,255,0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.4 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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

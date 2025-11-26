"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Zap, Target, Shield, Wind } from "lucide-react";

/**
 * AttributesPageSkeleton
 * 
 * Arcade-style loading state for Attribute Comparison.
 * Design philosophy: Power bars charging up, stats materializing.
 * Think: Character select screen loading in a fighting game.
 */
export default function AttributesPageSkeleton() {
  const attributes = [
    { icon: Zap, name: "POWER", color: "#FF4D4D" },
    { icon: Target, name: "CONTACT", color: "#00F3FF" },
    { icon: Wind, name: "SPEED", color: "#F4D03F" },
    { icon: Shield, name: "FIELDING", color: "#2ECC71" },
    { icon: Zap, name: "ARM", color: "#BD00FF" },
  ];

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-comets-purple/10 blur-[120px] rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-comets-cyan/10 blur-[100px] rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.12, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-2 text-comets-purple mb-4"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Users size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Analyzing Attributes</span>
          </motion.div>
          
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 inline-block"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            >
              ATTRIBUTE
            </motion.span>
            <br />
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 inline-block"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
            >
              COMPARISON
            </motion.span>
          </h1>

          <motion.div
            className="font-mono text-xs uppercase tracking-[0.5em] text-comets-purple"
            animate={{ 
              opacity: [0.3, 1, 0.3],
              textShadow: [
                "0 0 0px #BD00FF",
                "0 0 10px #BD00FF",
                "0 0 0px #BD00FF"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Player Data
          </motion.div>
        </motion.div>

        {/* Player selection skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-3 mb-12"
        >
          {[0, 1].map((idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + idx * 0.15, type: "spring" }}
              className="relative"
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-surface-dark border-2 border-white/10 rounded-full">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-white/20"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.3 }}
                />
                
                {/* Name shimmer */}
                <motion.div 
                  className="w-24 h-4 bg-white/10 rounded relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-purple/30 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: idx * 0.2 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Add player button skeleton */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="px-6 py-3 border-2 border-dashed border-white/10 rounded-full"
          >
            <motion.span 
              className="font-ui uppercase tracking-wider text-white/20 text-sm"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              + Add Player
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Attributes comparison skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-8"
        >
          {attributes.map((attr, idx) => (
            <motion.div
              key={attr.name}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + idx * 0.1, type: "spring" }}
              className="relative bg-surface-dark border border-white/10 rounded-lg p-8 overflow-hidden"
            >
              {/* Scanlines */}
              <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

              {/* Attribute header */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div 
                  className="p-3 rounded-lg relative"
                  style={{ backgroundColor: `${attr.color}20` }}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                >
                  <attr.icon 
                    size={24} 
                    style={{ color: attr.color }}
                  />
                  
                  {/* Power up ring */}
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2"
                    style={{ borderColor: attr.color }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  />
                </motion.div>

                <motion.h3 
                  className="font-display text-2xl uppercase tracking-wider"
                  style={{ color: attr.color }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.15 }}
                >
                  {attr.name}
                </motion.h3>
              </div>

              {/* Player bars skeleton */}
              <div className="space-y-4">
                {[0, 1].map((playerIdx) => (
                  <div key={playerIdx} className="flex items-center gap-4">
                    {/* Player name */}
                    <motion.div 
                      className="w-24 h-4 bg-white/10 rounded flex-shrink-0 relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: playerIdx * 0.3 }}
                      />
                    </motion.div>

                    {/* Charging bar */}
                    <div className="flex-1 h-12 bg-black/30 rounded-lg border border-white/10 relative overflow-hidden">
                      {/* Bar fill animation - charging effect */}
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{ 
                          background: `linear-gradient(90deg, ${attr.color}40, ${attr.color})`,
                          boxShadow: `0 0 20px ${attr.color}40`
                        }}
                        animate={{ 
                          width: ["0%", "70%", "0%"],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity, 
                          delay: idx * 0.3 + playerIdx * 0.15,
                          ease: "easeInOut"
                        }}
                      />

                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          ease: "linear",
                          delay: idx * 0.2 + playerIdx * 0.1
                        }}
                      />

                      {/* Value placeholder */}
                      <motion.div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold"
                        style={{ color: attr.color }}
                        animate={{ 
                          opacity: [0.2, 0.5, 0.2],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: playerIdx * 0.2 }}
                      >
                        --
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Energy pulse */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  background: `radial-gradient(circle at center, ${attr.color}10, transparent)`
                }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>

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
              className="w-2 h-2 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: [
                  "rgba(255,255,255,0.2)",
                  "rgba(189,0,255,1)",
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

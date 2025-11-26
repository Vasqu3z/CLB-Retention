"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Swords } from "lucide-react";

/**
 * PlayoffsPageSkeleton
 * 
 * Arcade-style loading state for Playoffs bracket.
 * Design philosophy: Bracket materializing from holographic projection.
 * Think: Tournament tree assembling itself in dramatic arcade fashion.
 */
export default function PlayoffsPageSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-comets-red/10 blur-[120px] rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-comets-yellow/10 blur-[100px] rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            opacity: [0.1, 0.12, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
            className="inline-flex items-center gap-2 text-comets-red mb-4"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Swords size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Bracket Loading</span>
          </motion.div>
          
          {/* Title with pixel reveal */}
          <div className="relative inline-block overflow-hidden">
            <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 inline-block"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
              >
                PLAYOFF
              </motion.span>
              <br />
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 inline-block"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 150 }}
              >
                BRACKET
              </motion.span>
            </h1>
          </div>

          {/* Loading sequence text */}
          <motion.div
            className="font-mono text-xs uppercase tracking-[0.5em] text-comets-red"
            animate={{ 
              opacity: [0.3, 1, 0.3],
              textShadow: [
                "0 0 0px #FF4D4D",
                "0 0 10px #FF4D4D",
                "0 0 0px #FF4D4D"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Assembling Matchups
          </motion.div>
        </motion.div>

        {/* Bracket grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Semifinals Column */}
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Trophy className="text-comets-yellow" size={28} />
              <h2 className="font-display text-3xl uppercase text-white">
                SEMIFINALS
              </h2>
            </motion.div>

            <div className="space-y-6">
              {[0, 1].map((matchIdx) => (
                <MatchupSkeleton key={matchIdx} delay={0.5 + matchIdx * 0.2} roundName="SF" />
              ))}
            </div>
          </div>

          {/* Finals Column */}
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Trophy className="text-comets-red" size={28} />
              <h2 className="font-display text-3xl uppercase text-white">
                FINALS
              </h2>
            </motion.div>

            <MatchupSkeleton delay={0.9} roundName="FINALS" isFinals />
          </div>

        </div>

        {/* Progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center gap-2 mt-16"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: [
                  "rgba(255,255,255,0.2)",
                  "rgba(255,77,77,1)",
                  "rgba(255,255,255,0.2)"
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

      </div>
    </main>
  );
}

// Matchup card skeleton component
function MatchupSkeleton({ delay, roundName, isFinals = false }: { delay: number; roundName: string; isFinals?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className="relative group"
    >
      <div className="relative bg-surface-dark border-2 border-white/10 rounded-lg overflow-hidden">
        
        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

        {/* Round badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full border border-white/20">
          <Swords size={12} className="text-comets-red" />
          <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
            {roundName}
          </span>
        </div>

        {/* Team A */}
        <TeamSkeleton delay={delay + 0.1} position="A" />
        
        {/* Divider with VS */}
        <motion.div 
          className="relative h-12 border-y border-white/10 flex items-center justify-center"
          animate={{ 
            borderColor: ["rgba(255,255,255,0.1)", "rgba(255,77,77,0.2)", "rgba(255,255,255,0.1)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span 
            className="font-display text-lg text-white/20 tracking-widest"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            VS
          </motion.span>
        </motion.div>

        {/* Team B */}
        <TeamSkeleton delay={delay + 0.2} position="B" />

      </div>

      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{ 
          boxShadow: [
            "0 0 0px rgba(255,77,77,0)",
            `0 0 ${isFinals ? '30' : '20'}px rgba(255,77,77,0.${isFinals ? '3' : '2'})`,
            "0 0 0px rgba(255,77,77,0)"
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: delay }}
      />
    </motion.div>
  );
}

// Team skeleton component
function TeamSkeleton({ delay, position }: { delay: number; position: "A" | "B" }) {
  return (
    <motion.div 
      className="relative p-6"
      initial={{ opacity: 0, x: position === "A" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          
          {/* Logo placeholder - rotating */}
          <motion.div 
            className="w-12 h-12 rounded-lg border-2 border-white/20 bg-white/5 flex items-center justify-center"
            animate={{ 
              rotate: [0, 360],
              borderColor: ["rgba(255,255,255,0.2)", "rgba(0,243,255,0.3)", "rgba(255,255,255,0.2)"]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              borderColor: { duration: 2, repeat: Infinity }
            }}
          >
            <motion.div
              className="w-6 h-6 rounded bg-comets-cyan/20"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Team name shimmer */}
          <div className="space-y-2">
            <motion.div 
              className="h-6 bg-white/10 rounded w-40 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <motion.div 
              className="h-3 bg-white/5 rounded w-24 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.3 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Win count skeleton */}
        <motion.div 
          className="flex flex-col items-center gap-1"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="font-mono text-xs text-white/20 uppercase tracking-widest">
            WINS
          </div>
          <motion.div 
            className="font-display text-3xl text-white/10"
            animate={{ 
              scale: [1, 1.1, 1],
              textShadow: [
                "0 0 0px rgba(244,208,63,0)",
                "0 0 10px rgba(244,208,63,0.3)",
                "0 0 0px rgba(244,208,63,0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            -
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

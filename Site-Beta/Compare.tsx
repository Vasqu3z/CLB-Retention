"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";

// Mock Data - In production, these would be state driven by a selector
const PLAYER_A = { 
  name: "Mario", 
  team: "Fireballs", 
  color: "#FF4D4D", 
  stats: { avg: ".412", hr: 24, ops: "1.240" } 
};

const PLAYER_B = { 
  name: "Bowser", 
  team: "Monsters", 
  color: "#F4D03F", 
  stats: { avg: ".280", hr: 35, ops: "1.100" } 
};

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-background pt-20 relative flex flex-col overflow-hidden">
      
      {/* Tool Header Floating */}
      <motion.div 
        className="absolute top-24 left-0 right-0 z-20 text-center pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="inline-flex items-center gap-2 bg-black/80 border border-white/10 px-4 py-1 rounded-full backdrop-blur-md">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Swords size={16} className="text-comets-cyan" />
          </motion.div>
          <span className="font-ui uppercase tracking-widest text-xs text-white">Head-to-Head</span>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 relative">
        
        {/* Center Divider Line with pulse */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block z-10">
          {/* VS Circle */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-white/20 rounded-full flex items-center justify-center font-display text-white/50 text-sm"
            animate={{
              boxShadow: [
                "0 0 0px rgba(255,255,255,0.2)",
                "0 0 20px rgba(0,243,255,0.3)",
                "0 0 0px rgba(255,255,255,0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            VS
          </motion.div>

          {/* Scanning effect */}
          <motion.div
            className="absolute left-0 w-full h-1 bg-comets-cyan/50 blur-sm"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Player A (Left) */}
        <motion.div 
          className="relative p-8 flex flex-col justify-center items-center md:items-end text-center md:text-right border-b md:border-b-0 border-white/10"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background gradient */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ 
              background: `linear-gradient(to right, transparent, ${PLAYER_A.color}30)` 
            }}
          />
          
          <div className="relative z-10 max-w-md">
            {/* Avatar */}
            <motion.div 
              className="w-24 h-24 rounded-xl bg-surface-dark border-2 mb-6 mx-auto md:mr-0 md:ml-auto flex items-center justify-center font-display text-4xl"
              style={{ borderColor: PLAYER_A.color, color: PLAYER_A.color }}
              animate={{ 
                y: [0, -5, 0],
                boxShadow: [
                  `0 0 0px ${PLAYER_A.color}`,
                  `0 0 20px ${PLAYER_A.color}`,
                  `0 0 0px ${PLAYER_A.color}`
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {PLAYER_A.name[0]}
            </motion.div>

            {/* Name & Team */}
            <h2 className="font-display text-5xl text-white uppercase mb-1">{PLAYER_A.name}</h2>
            <div className="font-ui text-white/50 tracking-widest uppercase mb-12">{PLAYER_A.team}</div>

            {/* Stats List */}
            <div className="space-y-6 w-full">
              <StatRow 
                label="AVG" 
                value={PLAYER_A.stats.avg} 
                isWinner={parseFloat(PLAYER_A.stats.avg) > parseFloat(PLAYER_B.stats.avg)} 
                color={PLAYER_A.color} 
                align="right" 
              />
              <StatRow 
                label="HR" 
                value={PLAYER_A.stats.hr} 
                isWinner={PLAYER_A.stats.hr < PLAYER_B.stats.hr} 
                color={PLAYER_A.color} 
                align="right" 
              />
              <StatRow 
                label="OPS" 
                value={PLAYER_A.stats.ops} 
                isWinner={parseFloat(PLAYER_A.stats.ops) > parseFloat(PLAYER_B.stats.ops)} 
                color={PLAYER_A.color} 
                align="right" 
              />
            </div>
          </div>
        </motion.div>

        {/* Player B (Right) */}
        <motion.div 
          className="relative p-8 flex flex-col justify-center items-center md:items-start text-center md:text-left"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background gradient */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ 
              background: `linear-gradient(to left, transparent, ${PLAYER_B.color}30)` 
            }}
          />
          
          <div className="relative z-10 max-w-md">
            {/* Avatar */}
            <motion.div 
              className="w-24 h-24 rounded-xl bg-surface-dark border-2 mb-6 mx-auto md:ml-0 md:mr-auto flex items-center justify-center font-display text-4xl"
              style={{ borderColor: PLAYER_B.color, color: PLAYER_B.color }}
              animate={{ 
                y: [0, -5, 0],
                boxShadow: [
                  `0 0 0px ${PLAYER_B.color}`,
                  `0 0 20px ${PLAYER_B.color}`,
                  `0 0 0px ${PLAYER_B.color}`
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              {PLAYER_B.name[0]}
            </motion.div>

            {/* Name & Team */}
            <h2 className="font-display text-5xl text-white uppercase mb-1">{PLAYER_B.name}</h2>
            <div className="font-ui text-white/50 tracking-widest uppercase mb-12">{PLAYER_B.team}</div>

            {/* Stats List */}
            <div className="space-y-6 w-full">
              <StatRow 
                label="AVG" 
                value={PLAYER_B.stats.avg} 
                isWinner={parseFloat(PLAYER_B.stats.avg) > parseFloat(PLAYER_A.stats.avg)} 
                color={PLAYER_B.color} 
                align="left" 
              />
              <StatRow 
                label="HR" 
                value={PLAYER_B.stats.hr} 
                isWinner={PLAYER_B.stats.hr > PLAYER_A.stats.hr} 
                color={PLAYER_B.color} 
                align="left" 
              />
              <StatRow 
                label="OPS" 
                value={PLAYER_B.stats.ops} 
                isWinner={parseFloat(PLAYER_B.stats.ops) > parseFloat(PLAYER_A.stats.ops)} 
                color={PLAYER_B.color} 
                align="left" 
              />
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}

// Helper Component for Stat Comparison Rows
function StatRow({ label, value, isWinner, color, align }: any) {
  return (
    <motion.div 
      className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.05, x: align === "right" ? -5 : 5 }}
    >
      <div className="text-xs font-mono text-white/30 mb-1">{label}</div>
      <motion.div 
        className={`text-3xl font-mono ${isWinner ? "font-bold" : "text-white/50"}`} 
        style={{ 
          color: isWinner ? color : undefined,
        }}
        animate={isWinner ? {
          textShadow: [
            `0 0 0px ${color}`,
            `0 0 15px ${color}`,
            `0 0 0px ${color}`
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {value}
      </motion.div>
      
      {/* Winner indicator */}
      {isWinner && (
        <motion.div
          className="mt-1 text-xs font-ui uppercase tracking-widest opacity-50"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
        >
          Leader
        </motion.div>
      )}
    </motion.div>
  );
}

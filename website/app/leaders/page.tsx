"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import RetroTabs from "@/components/ui/RetroTabs";

// Mock data - Replace with Google Sheets fetch
const MOCK_LEADERS = {
  batting: {
    avg: [
      { rank: 1, name: "Mario", team: "Fireballs", value: ".487", color: "#FF4D4D" },
      { rank: 2, name: "Luigi", team: "Knights", value: ".456", color: "#2ECC71" },
      { rank: 3, name: "Peach", team: "Monarchs", value: ".445", color: "#FF69B4" },
    ],
    hr: [
      { rank: 1, name: "Bowser", team: "Monsters", value: "28", color: "#F4D03F" },
      { rank: 2, name: "DK", team: "Wilds", value: "24", color: "#8D6E63" },
      { rank: 3, name: "Wario", team: "Muscles", value: "22", color: "#F1C40F" },
    ],
    rbi: [
      { rank: 1, name: "Bowser", team: "Monsters", value: "75", color: "#F4D03F" },
      { rank: 2, name: "Mario", team: "Fireballs", value: "68", color: "#FF4D4D" },
      { rank: 3, name: "DK", team: "Wilds", value: "64", color: "#8D6E63" },
    ],
  },
  pitching: {
    era: [
      { rank: 1, name: "Waluigi", team: "Spitballs", value: "1.24", color: "#9B59B6" },
      { rank: 2, name: "Yoshi", team: "Eggs", value: "1.89", color: "#2E86DE" },
      { rank: 3, name: "Luigi", team: "Knights", value: "2.15", color: "#2ECC71" },
    ],
    w: [
      { rank: 1, name: "Mario", team: "Fireballs", value: "14", color: "#FF4D4D" },
      { rank: 2, name: "Waluigi", team: "Spitballs", value: "13", color: "#9B59B6" },
      { rank: 3, name: "Yoshi", team: "Eggs", value: "12", color: "#2E86DE" },
    ],
    sv: [
      { rank: 1, name: "Toad", team: "Fireballs", value: "18", color: "#FF4D4D" },
      { rank: 2, name: "Birdo", team: "Bows", value: "15", color: "#E91E63" },
      { rank: 3, name: "Boo", team: "Spirits", value: "12", color: "#9C27B0" },
    ],
  }
};

interface LeaderEntry {
  rank: number;
  name: string;
  team: string;
  value: string;
  color: string;
}

function LeaderPodium({ leaders, statName, icon: Icon }: { leaders: LeaderEntry[], statName: string, icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Card container */}
      <div className="relative bg-surface-dark border border-white/10 rounded-lg overflow-hidden p-8 hover:border-white/30 transition-colors duration-300">
        
        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />
        
        {/* Stat header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-2 bg-comets-cyan/10 rounded-lg"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            >
              <Icon className="text-comets-cyan" size={24} />
            </motion.div>
            <h3 className="font-display text-2xl uppercase text-white tracking-tight">
              {statName}
            </h3>
          </div>
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest">
            TOP 3
          </div>
        </div>

        {/* Leader entries */}
        <div className="space-y-3">
          {leaders.map((leader, idx) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="relative group/item"
            >
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-comets-cyan/50 transition-all duration-200 cursor-pointer">
                
                {/* Rank badge */}
                <motion.div 
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display text-xl font-bold",
                    idx === 0 && "bg-comets-yellow text-black",
                    idx === 1 && "bg-white/20 text-white",
                    idx === 2 && "bg-white/10 text-white/80"
                  )}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                >
                  {leader.rank}
                </motion.div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="font-ui text-white font-bold uppercase tracking-wider text-lg truncate">
                    {leader.name}
                  </div>
                  <div className="font-mono text-xs text-white/40 uppercase tracking-widest truncate">
                    {leader.team}
                  </div>
                </div>

                {/* Value display */}
                <motion.div 
                  className="flex-shrink-0 px-6 py-2 bg-comets-cyan/20 border border-comets-cyan/50 rounded-full"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 243, 255, 0.3)" }}
                >
                  <span className="font-mono text-comets-cyan font-bold text-xl">
                    {leader.value}
                  </span>
                </motion.div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}

export default function LeadersPage() {
  const [category, setCategory] = useState<"batting" | "pitching">("batting");

  const stats = category === "batting" 
    ? [
        { key: "avg", name: "Batting Average", icon: Target, data: MOCK_LEADERS.batting.avg },
        { key: "hr", name: "Home Runs", icon: Zap, data: MOCK_LEADERS.batting.hr },
        { key: "rbi", name: "Runs Batted In", icon: TrendingUp, data: MOCK_LEADERS.batting.rbi },
      ]
    : [
        { key: "era", name: "Earned Run Avg", icon: Target, data: MOCK_LEADERS.pitching.era },
        { key: "w", name: "Wins", icon: Trophy, data: MOCK_LEADERS.pitching.w },
        { key: "sv", name: "Saves", icon: Zap, data: MOCK_LEADERS.pitching.sv },
      ];

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      
      {/* Cosmic background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-comets-cyan/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-comets-yellow/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-2 text-comets-yellow mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Trophy size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Statistical Leaders</span>
          </motion.div>
          
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              League
              <br />
              Leaders
            </span>
          </h1>
        </motion.div>

        {/* Category toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <RetroTabs
            tabs={[
              { value: "batting", label: "Batting", color: "yellow" },
              { value: "pitching", label: "Pitching", color: "cyan" }
            ]}
            value={category}
            onChange={(val) => setCategory(val as "batting" | "pitching")}
          />
        </motion.div>

        {/* Leaders grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <LeaderPodium 
                  leaders={stat.data} 
                  statName={stat.name}
                  icon={stat.icon}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </main>
  );
}

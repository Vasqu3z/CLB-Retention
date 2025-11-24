"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Calendar, Activity, Trophy, TrendingUp, Award } from "lucide-react";
import RetroTable from "@/components/ui/RetroTable";
import VersusCard from "@/components/ui/VersusCard";
import StatHighlight from "@/components/ui/StatHighlight";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---
interface Player {
  id: string;
  name: string;
  position: string;
  avg: string;
  hr: number;
  ops: string;
}

interface Matchup {
  id: string;
  home: { name: string; code: string; logoColor: string; score?: number };
  away: { name: string; code: string; logoColor: string; score?: number };
  date: string;
  time: string;
  isFinished: boolean;
}

// --- Mock Data (Replace with API calls) ---
const TEAM_DATA = {
  name: "Mario Fireballs",
  code: "MAR",
  logoColor: "#FF4D4D",
  record: "12-2",
  standing: "1st",
  streak: "W5",
  roster: [
    { id: "1", name: "Mario", position: "P", avg: ".412", hr: 24, ops: "1.240" },
    { id: "2", name: "Luigi", position: "C", avg: ".305", hr: 12, ops: ".890" },
    { id: "3", name: "Pianta", position: "1B", avg: ".280", hr: 5, ops: ".750" },
    { id: "4", name: "Noki", position: "2B", avg: ".265", hr: 3, ops: ".710" },
  ] as Player[],
  schedule: [
    { 
      id: "m1", 
      home: { name: "Mario Fireballs", code: "MAR", logoColor: "#FF4D4D", score: 5 }, 
      away: { name: "Bowser Monsters", code: "BOW", logoColor: "#F4D03F", score: 3 }, 
      date: "MAY 12", time: "FINAL", isFinished: true 
    },
    { 
      id: "m2", 
      home: { name: "DK Wilds", code: "DKW", logoColor: "#8D6E63" }, 
      away: { name: "Mario Fireballs", code: "MAR", logoColor: "#FF4D4D" }, 
      date: "MAY 15", time: "19:00", isFinished: false 
    },
  ] as Matchup[]
};

export default function TeamDetailPage({ params: _params }: { params: any }) {
  const [activeTab, setActiveTab] = useState<"roster" | "schedule" | "stats">("roster");

  // In production: 
  // const team = await fetchTeam(params.slug);
  // if (!team) return notFound();
  const team = TEAM_DATA; 

  // Roster Table Configuration
  const rosterColumns = [
    { 
      header: "Player", 
      cell: (p: Player) => (
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-display text-white"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            {p.name[0]}
          </motion.div>
          <Link href={`/players/${p.id}`} className="font-bold hover:text-comets-yellow transition-colors uppercase">
            {p.name}
          </Link>
        </div>
      )
    },
    { header: "Pos", accessorKey: "position" as keyof Player, className: "text-white/50" },
    { header: "AVG", accessorKey: "avg" as keyof Player, className: "font-mono text-comets-cyan", sortable: true },
    { header: "HR", accessorKey: "hr" as keyof Player, className: "font-mono text-comets-red", sortable: true },
    { header: "OPS", accessorKey: "ops" as keyof Player, className: "font-mono text-white font-bold", sortable: true },
  ];

  return (
    <main className="min-h-screen bg-background pb-24">
      
      {/* ENHANCED: Team Header (Locker Room Banner) */}
      <div className="relative h-[50vh] overflow-hidden flex items-end pb-12">
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 1 }}
          style={{ 
            background: `linear-gradient(135deg, ${team.logoColor}, transparent 70%)`,
          }} 
        />
        
        {/* Pulsing secondary gradient */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ 
            background: `radial-gradient(circle at top right, ${team.logoColor}40, transparent 60%)`,
          }}
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        
        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-5" />
        
        <div className="container mx-auto px-4 relative z-10 flex items-end gap-8">
          {/* ENHANCED: Animated Logo */}
          <motion.div 
            className="w-32 h-32 md:w-48 md:h-48 bg-surface-dark border-4 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden"
            style={{ borderColor: team.logoColor }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
            whileHover={{ 
              scale: 1.05, 
              rotate: 3,
              boxShadow: `0 0 40px ${team.logoColor}80`
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              style={{
                background: `radial-gradient(circle, ${team.logoColor}40, transparent)`
              }}
            />
            <div className="font-display text-8xl relative z-10" style={{ color: team.logoColor }}>
              {team.code[0]}
            </div>
          </motion.div>
          
          {/* Team Info */}
          <motion.div 
            className="mb-4 flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Badges Row */}
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <motion.span 
                className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono uppercase tracking-widest border border-white/5 backdrop-blur-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                Season 6
              </motion.span>
              
              <motion.div
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-comets-yellow/20 border border-comets-yellow/30 backdrop-blur-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Trophy size={14} className="text-comets-yellow" />
                <span className="text-comets-yellow font-bold text-xs uppercase tracking-wide">
                  {team.standing} Place
                </span>
              </motion.div>

              {/* Streak Badge */}
              <motion.div
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full border backdrop-blur-sm",
                  team.streak.startsWith("W")
                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                    : "bg-red-500/20 border-red-500/30 text-red-400"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <TrendingUp size={14} />
                <span className="font-bold text-xs uppercase tracking-wide">
                  {team.streak}
                </span>
              </motion.div>
            </div>
            
            {/* Team Name */}
            <motion.h1 
              className="font-display text-5xl md:text-7xl text-white uppercase leading-none tracking-tight mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {team.name}
            </motion.h1>
            
            {/* Record */}
            <motion.div 
              className="text-xl text-white/60 font-ui tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Record: <span className="text-white font-bold">{team.record}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: team.logoColor,
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
        
        {/* ENHANCED: Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          {[
            { id: "roster", label: "Active Roster", icon: Users },
            { id: "schedule", label: "Season Schedule", icon: Calendar },
            { id: "stats", label: "Team Stats", icon: Activity },
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative px-6 py-3 rounded-t-lg font-ui uppercase tracking-widest text-sm flex items-center gap-2 border-t border-x transition-all whitespace-nowrap focus-arcade",
                activeTab === tab.id 
                  ? "bg-background border-white/20 text-white" 
                  : "bg-surface-dark border-transparent text-white/40 hover:text-white hover:bg-surface-light"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <tab.icon size={16} />
              {tab.label}
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-comets-yellow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
          <div className="flex-1 border-b border-white/20 translate-y-[1px]" />
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          
          {/* Roster Tab */}
          {activeTab === "roster" && (
            <motion.div
              key="roster"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-2xl text-white">Starting Lineup</h3>
                <motion.button 
                  className="text-xs font-mono text-comets-cyan hover:underline uppercase arcade-press focus-arcade"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Download CSV
                </motion.button>
              </div>
              <RetroTable data={team.roster} columns={rosterColumns} />
            </motion.div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {team.schedule.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VersusCard {...match} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StatHighlight />
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}

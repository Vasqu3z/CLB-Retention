"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, X, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock player stats
const MOCK_PLAYERS = [
  {
    id: "mario",
    name: "Mario",
    team: "Fireballs",
    color: "#FF4D4D",
    stats: {
      batting: { avg: ".412", hr: 24, rbi: 68, ops: "1.240", sb: 12 },
      pitching: { era: "2.15", w: 14, l: 3, sv: 0, ip: "142.1" },
      fielding: { np: 28, e: 2, oaa: 15 }
    }
  },
  {
    id: "luigi",
    name: "Luigi",
    team: "Knights",
    color: "#2ECC71",
    stats: {
      batting: { avg: ".305", hr: 12, rbi: 45, ops: ".890", sb: 24 },
      pitching: { era: "1.89", w: 12, l: 4, sv: 2, ip: "128.2" },
      fielding: { np: 35, e: 1, oaa: 22 }
    }
  },
  {
    id: "bowser",
    name: "Bowser",
    team: "Monsters",
    color: "#F4D03F",
    stats: {
      batting: { avg: ".280", hr: 35, rbi: 85, ops: "1.100", sb: 2 },
      pitching: { era: "4.20", w: 8, l: 6, sv: 0, ip: "95.0" },
      fielding: { np: 18, e: 8, oaa: -5 }
    }
  },
  {
    id: "peach",
    name: "Peach",
    team: "Monarchs",
    color: "#FF69B4",
    stats: {
      batting: { avg: ".350", hr: 8, rbi: 52, ops: ".950", sb: 18 },
      pitching: { era: "3.45", w: 10, l: 5, sv: 1, ip: "110.1" },
      fielding: { np: 42, e: 1, oaa: 28 }
    }
  },
];

const STAT_CATEGORIES = [
  { 
    key: "batting", 
    name: "Batting", 
    icon: TrendingUp,
    stats: [
      { key: "avg", label: "AVG", color: "#00F3FF" },
      { key: "hr", label: "HR", color: "#FF4D4D" },
      { key: "rbi", label: "RBI", color: "#F4D03F" },
      { key: "ops", label: "OPS", color: "#BD00FF" },
      { key: "sb", label: "SB", color: "#2ECC71" },
    ]
  },
  { 
    key: "pitching", 
    name: "Pitching", 
    icon: Activity,
    stats: [
      { key: "era", label: "ERA", color: "#00F3FF" },
      { key: "w", label: "W", color: "#2ECC71" },
      { key: "l", label: "L", color: "#FF4D4D" },
      { key: "sv", label: "SV", color: "#F4D03F" },
      { key: "ip", label: "IP", color: "#BD00FF" },
    ]
  },
  { 
    key: "fielding", 
    name: "Fielding", 
    icon: BarChart3,
    stats: [
      { key: "np", label: "NP", color: "#2ECC71" },
      { key: "e", label: "E", color: "#FF4D4D" },
      { key: "oaa", label: "OAA", color: "#00F3FF" },
    ]
  },
];

export default function StatsComparisonPage() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(["mario", "luigi"]);
  const [category, setCategory] = useState<"batting" | "pitching" | "fielding">("batting");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const players = selectedPlayers
    .map(id => MOCK_PLAYERS.find(p => p.id === id))
    .filter(Boolean);

  const availablePlayers = MOCK_PLAYERS.filter(
    p => !selectedPlayers.includes(p.id) && 
         p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentCategory = STAT_CATEGORIES.find(c => c.key === category)!;

  const addPlayer = (id: string) => {
    if (selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, id]);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  const removePlayer = (id: string) => {
    if (selectedPlayers.length > 1) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== id));
    }
  };

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 right-1/4 w-[650px] h-[650px] bg-comets-cyan/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] bg-comets-red/10 blur-[100px] rounded-full animate-pulse-slow" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-2 text-comets-cyan mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <BarChart3 size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Statistical Analysis</span>
          </motion.div>
          
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              Stats
              <br />
              Comparison
            </span>
          </h1>
        </motion.div>

        {/* Player selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            {players.map((player: any, idx) => (
              <motion.div
                key={player.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: idx * 0.1, type: "spring" }}
              >
                <div 
                  className="flex items-center gap-3 px-6 py-3 bg-surface-dark border-2 rounded-full transition-all hover:scale-105"
                  style={{ borderColor: player.color }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-ui uppercase tracking-wider text-white font-bold">
                    {player.name}
                  </span>
                  {selectedPlayers.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removePlayer(player.id)}
                      className="text-white/40 hover:text-comets-red transition-colors"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}

            {selectedPlayers.length < 4 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className="px-6 py-3 border-2 border-dashed border-white/20 rounded-full font-ui uppercase tracking-wider text-white/60 hover:text-white hover:border-comets-cyan/50 transition-all"
              >
                + Add Player
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
                  <input
                    type="text"
                    placeholder="SEARCH PLAYERS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-white font-ui uppercase tracking-wider text-sm focus:border-comets-cyan outline-none"
                    autoFocus
                  />
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {availablePlayers.map((player, idx) => (
                      <motion.button
                        key={player.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => addPlayer(player.id)}
                        className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded transition-all"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="font-ui text-white uppercase tracking-wider">
                          {player.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-surface-dark border border-white/10 rounded-lg p-2 gap-2">
            {STAT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key as any)}
                  className={cn(
                    "relative px-6 py-3 font-ui uppercase tracking-widest text-sm transition-all rounded-lg flex items-center gap-2",
                    category === cat.key ? "text-black" : "text-white/60 hover:text-white"
                  )}
                >
                  {category === cat.key && (
                    <motion.div
                      layoutId="categoryBg"
                      className="absolute inset-0 bg-comets-cyan rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="relative z-10" size={16} />
                  <span className="relative z-10">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Stats grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6"
            style={{ 
              gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` 
            }}
          >
            {players.map((player: any, playerIdx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: playerIdx * 0.1 }}
                className="relative bg-surface-dark border-2 rounded-lg overflow-hidden"
                style={{ borderColor: player.color }}
              >
                {/* Scanlines */}
                <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

                {/* Player header */}
                <div 
                  className="p-6 border-b"
                  style={{ 
                    borderColor: `${player.color}30`,
                    backgroundColor: `${player.color}10`
                  }}
                >
                  <h3 className="font-display text-3xl uppercase text-white tracking-tight mb-1">
                    {player.name}
                  </h3>
                  <div className="font-mono text-xs text-white/40 uppercase tracking-widest">
                    {player.team}
                  </div>
                </div>

                {/* Stats list */}
                <div className="p-6 space-y-4">
                  {currentCategory.stats.map((stat, statIdx) => {
                    const value = player.stats[category][stat.key];
                    return (
                      <motion.div
                        key={stat.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + statIdx * 0.05 }}
                        className="flex items-center justify-between"
                      >
                        <span className="font-ui text-sm uppercase tracking-widest text-white/60">
                          {stat.label}
                        </span>
                        <motion.span 
                          className="font-mono text-2xl font-bold"
                          style={{ color: stat.color }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {value}
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </div>

              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </main>
  );
}

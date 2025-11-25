"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, Zap, Target, Shield, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock player data
const MOCK_PLAYERS = [
  { 
    id: "mario",
    name: "Mario",
    team: "Fireballs",
    color: "#FF4D4D",
    attributes: {
      power: 92,
      contact: 88,
      speed: 75,
      fielding: 82,
      arm: 90
    }
  },
  { 
    id: "luigi",
    name: "Luigi",
    team: "Knights",
    color: "#2ECC71",
    attributes: {
      power: 78,
      contact: 95,
      speed: 88,
      fielding: 90,
      arm: 85
    }
  },
  { 
    id: "bowser",
    name: "Bowser",
    team: "Monsters",
    color: "#F4D03F",
    attributes: {
      power: 99,
      contact: 65,
      speed: 55,
      fielding: 70,
      arm: 95
    }
  },
  { 
    id: "peach",
    name: "Peach",
    team: "Monarchs",
    color: "#FF69B4",
    attributes: {
      power: 68,
      contact: 92,
      speed: 82,
      fielding: 95,
      arm: 80
    }
  },
];

const ATTRIBUTES = [
  { key: "power", name: "Power", icon: Zap, color: "#FF4D4D" },
  { key: "contact", name: "Contact", icon: Target, color: "#00F3FF" },
  { key: "speed", name: "Speed", icon: Wind, color: "#F4D03F" },
  { key: "fielding", name: "Fielding", icon: Shield, color: "#2ECC71" },
  { key: "arm", name: "Arm", icon: Zap, color: "#BD00FF" },
];

export default function AttributeComparisonPage() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(["mario", "luigi"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const players = selectedPlayers
    .map(id => MOCK_PLAYERS.find(p => p.id === id))
    .filter(Boolean);

  const availablePlayers = MOCK_PLAYERS.filter(
    p => !selectedPlayers.includes(p.id) && 
         p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-comets-purple/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-comets-cyan/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-2 text-comets-purple mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Users size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Player Analysis</span>
          </motion.div>
          
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              Attribute
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
          className="mb-12"
        >
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Selected player pills */}
            {players.map((player: any, idx) => (
              <motion.div
                key={player.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                className="relative group"
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

            {/* Add player button */}
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

          {/* Search dropdown */}
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
                        <span className="ml-auto font-mono text-xs text-white/40">
                          {player.team}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Attribute comparison grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {ATTRIBUTES.map((attr, idx) => {
            const Icon = attr.icon;
            const maxValue = Math.max(...players.map((p: any) => p.attributes[attr.key]));

            return (
              <motion.div
                key={attr.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                className="relative bg-surface-dark border border-white/10 rounded-lg p-6 overflow-hidden group hover:border-white/30 transition-colors"
              >
                {/* Scanlines */}
                <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

                {/* Attribute header */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${attr.color}20` }}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  >
                    <Icon style={{ color: attr.color }} size={20} />
                  </motion.div>
                  <h3 className="font-display text-2xl uppercase text-white tracking-tight">
                    {attr.name}
                  </h3>
                </div>

                {/* Comparison bars */}
                <div className="space-y-3">
                  {players.map((player: any, playerIdx) => {
                    const value = player.attributes[attr.key];
                    const isMax = value === maxValue;

                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + playerIdx * 0.05 }}
                        className="relative"
                      >
                        <div className="flex items-center gap-4 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: player.color }}
                          />
                          <span className="font-ui text-sm uppercase tracking-wider text-white/60 w-24">
                            {player.name}
                          </span>
                          <div className="flex-1 relative h-8 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              transition={{ duration: 1, delay: 0.9 + playerIdx * 0.1, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full relative",
                                isMax && "ring-2 ring-comets-yellow"
                              )}
                              style={{ 
                                backgroundColor: player.color,
                                opacity: isMax ? 1 : 0.7
                              }}
                            >
                              {/* Shimmer effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              />
                            </motion.div>
                          </div>
                          <motion.span 
                            className="font-mono font-bold text-lg w-12 text-right"
                            style={{ color: isMax ? attr.color : "white" }}
                            animate={isMax ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.5, delay: 1 + playerIdx * 0.1 }}
                          >
                            {value}
                          </motion.span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </main>
  );
}

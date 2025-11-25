"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, X, Zap, Users, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock chemistry data
const MOCK_CHEMISTRY = {
  "Mario": { "Luigi": 150, "Peach": 120, "Bowser": -150, "Yoshi": 100 },
  "Luigi": { "Mario": 150, "Daisy": 140, "Waluigi": -120 },
  "Bowser": { "Mario": -150, "Wario": 130, "Bowser Jr": 180, "Peach": -100 },
  "Peach": { "Mario": 120, "Daisy": 150, "Bowser": -100, "Toad": 110 },
  "Yoshi": { "Mario": 100, "Birdo": 160, "Donkey Kong": 90 },
  "Wario": { "Waluigi": 170, "Bowser": 130, "Mario": -110 },
  "Waluigi": { "Wario": 170, "Luigi": -120, "Daisy": -100 },
  "Daisy": { "Peach": 150, "Luigi": 140, "Waluigi": -100 },
};

const MOCK_PLAYERS = [
  { id: "mario", name: "Mario", team: "Fireballs", color: "#FF4D4D" },
  { id: "luigi", name: "Luigi", team: "Knights", color: "#2ECC71" },
  { id: "bowser", name: "Bowser", team: "Monsters", color: "#F4D03F" },
  { id: "peach", name: "Peach", team: "Monarchs", color: "#FF69B4" },
  { id: "yoshi", name: "Yoshi", team: "Eggs", color: "#2E86DE" },
  { id: "wario", name: "Wario", team: "Muscles", color: "#F1C40F" },
  { id: "waluigi", name: "Waluigi", team: "Spitballs", color: "#9B59B6" },
  { id: "daisy", name: "Daisy", team: "Flowers", color: "#E67E22" },
];

interface Connection {
  player1: string;
  player2: string;
  value: number;
}

export default function ChemistryToolPage() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(["Mario", "Luigi"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const players = selectedPlayers
    .map(name => MOCK_PLAYERS.find(p => p.name === name))
    .filter(Boolean);

  const availablePlayers = MOCK_PLAYERS.filter(
    p => !selectedPlayers.includes(p.name) && 
         p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addPlayer = (name: string) => {
    if (selectedPlayers.length < 5) {
      setSelectedPlayers([...selectedPlayers, name]);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  const removePlayer = (name: string) => {
    if (selectedPlayers.length > 1) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== name));
    }
  };

  // Calculate chemistry data
  const chemistryData = useMemo(() => {
    const playerChemistry = selectedPlayers.map(playerName => {
      const relationships = MOCK_CHEMISTRY[playerName] || {};
      const positive: Array<{name: string, value: number}> = [];
      const negative: Array<{name: string, value: number}> = [];

      Object.entries(relationships).forEach(([other, value]) => {
        if (value >= 100) {
          positive.push({ name: other, value });
        } else if (value <= -100) {
          negative.push({ name: other, value });
        }
      });

      positive.sort((a, b) => b.value - a.value);
      negative.sort((a, b) => a.value - b.value);

      return {
        name: playerName,
        positive: positive.slice(0, 5), // Top 5
        negative: negative.slice(0, 5), // Top 5
      };
    });

    // Calculate internal connections
    const internalPositive: Connection[] = [];
    const internalNegative: Connection[] = [];

    for (let i = 0; i < selectedPlayers.length; i++) {
      for (let j = i + 1; j < selectedPlayers.length; j++) {
        const player1 = selectedPlayers[i];
        const player2 = selectedPlayers[j];
        const value = MOCK_CHEMISTRY[player1]?.[player2];

        if (value !== undefined && value !== 0) {
          if (value >= 100) {
            internalPositive.push({ player1, player2, value });
          } else if (value <= -100) {
            internalNegative.push({ player1, player2, value });
          }
        }
      }
    }

    return {
      playerChemistry,
      internalPositive,
      internalNegative,
    };
  }, [selectedPlayers]);

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-comets-purple/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-comets-cyan/10 blur-[100px] rounded-full" />
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
            <Network size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Chemistry Network</span>
          </motion.div>
          
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              Chemistry
              <br />
              Analysis
            </span>
          </h1>

          <p className="font-ui text-sm uppercase tracking-widest text-white/40">
            Explore player relationships • Build optimal teams
          </p>
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
                      onClick={() => removePlayer(player.name)}
                      className="text-white/40 hover:text-comets-red transition-colors"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Add player button */}
            {selectedPlayers.length < 5 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className="px-6 py-3 border-2 border-dashed border-white/20 rounded-full font-ui uppercase tracking-wider text-white/60 hover:text-white hover:border-comets-purple/50 transition-all"
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
                    className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-white font-ui uppercase tracking-wider text-sm focus:border-comets-purple outline-none"
                    autoFocus
                  />
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {availablePlayers.map((player, idx) => (
                      <motion.button
                        key={player.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => addPlayer(player.name)}
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

        {/* Team Analysis (if 2+ players) */}
        {selectedPlayers.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="relative bg-surface-dark border border-white/10 rounded-lg p-8 overflow-hidden">
              {/* Scanlines */}
              <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

              <h2 className="font-display text-3xl uppercase text-white mb-6 flex items-center gap-3">
                <Users className="text-comets-cyan" size={32} />
                Team Chemistry Network
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Positive Connections */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-comets-yellow" size={20} />
                    <h3 className="font-ui uppercase tracking-wider text-comets-yellow text-sm">
                      Positive Connections ({chemistryData.internalPositive.length})
                    </h3>
                  </div>
                  
                  {chemistryData.internalPositive.length > 0 ? (
                    <div className="space-y-2">
                      {chemistryData.internalPositive.map((conn, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + idx * 0.05 }}
                          className="relative group"
                        >
                          <div className="p-3 bg-comets-yellow/10 border border-comets-yellow/30 rounded-lg hover:bg-comets-yellow/20 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-ui text-white uppercase text-sm">
                                  {conn.player1}
                                </span>
                                <TrendingUp className="text-comets-yellow" size={16} />
                                <span className="font-ui text-white uppercase text-sm">
                                  {conn.player2}
                                </span>
                              </div>
                              <motion.span 
                                className="font-mono font-bold text-comets-yellow text-lg"
                                whileHover={{ scale: 1.1 }}
                              >
                                +{conn.value}
                              </motion.span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-white/5 rounded-lg text-center">
                      <p className="font-mono text-sm text-white/40 uppercase">
                        No positive connections
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Negative Connections */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-comets-red" size={20} />
                    <h3 className="font-ui uppercase tracking-wider text-comets-red text-sm">
                      Conflicts ({chemistryData.internalNegative.length})
                    </h3>
                  </div>
                  
                  {chemistryData.internalNegative.length > 0 ? (
                    <div className="space-y-2">
                      {chemistryData.internalNegative.map((conn, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + idx * 0.05 }}
                          className="relative group"
                        >
                          <div className="p-3 bg-comets-red/10 border border-comets-red/30 rounded-lg hover:bg-comets-red/20 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-ui text-white uppercase text-sm">
                                  {conn.player1}
                                </span>
                                <Zap className="text-comets-red" size={16} />
                                <span className="font-ui text-white uppercase text-sm">
                                  {conn.player2}
                                </span>
                              </div>
                              <motion.span 
                                className="font-mono font-bold text-comets-red text-lg"
                                whileHover={{ scale: 1.1 }}
                              >
                                {conn.value}
                              </motion.span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-white/5 rounded-lg text-center">
                      <p className="font-mono text-sm text-white/40 uppercase">
                        No conflicts detected
                      </p>
                    </div>
                  )}
                </motion.div>

              </div>
            </div>
          </motion.div>
        )}

        {/* Individual Player Chemistry */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {chemistryData.playerChemistry.map((playerChem, idx) => {
            const playerData = MOCK_PLAYERS.find(p => p.name === playerChem.name);
            
            return (
              <motion.div
                key={playerChem.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + idx * 0.1 }}
                className="relative bg-surface-dark border rounded-lg overflow-hidden hover:border-white/30 transition-all"
                style={{ borderColor: `${playerData?.color}30` }}
              >
                {/* Scanlines */}
                <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

                {/* Player header */}
                <div 
                  className="p-6 border-b"
                  style={{ 
                    borderColor: `${playerData?.color}30`,
                    backgroundColor: `${playerData?.color}10`
                  }}
                >
                  <h3 className="font-display text-2xl uppercase text-white mb-1">
                    {playerChem.name}
                  </h3>
                  <div className="font-mono text-xs text-white/40 uppercase tracking-widest">
                    {playerChem.positive.length} Positive • {playerChem.negative.length} Negative
                  </div>
                </div>

                {/* Chemistry lists */}
                <div className="p-6 space-y-4">
                  
                  {/* Positive */}
                  {playerChem.positive.length > 0 && (
                    <div>
                      <h4 className="font-ui text-xs uppercase tracking-widest text-comets-yellow mb-2 flex items-center gap-2">
                        <Sparkles size={12} />
                        Positive
                      </h4>
                      <div className="space-y-1">
                        {playerChem.positive.map((rel, relIdx) => (
                          <motion.div
                            key={rel.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.1 + idx * 0.1 + relIdx * 0.05 }}
                            className="flex items-center justify-between p-2 bg-comets-yellow/10 rounded hover:bg-comets-yellow/20 transition-all"
                          >
                            <span className="font-ui text-sm text-white uppercase">
                              {rel.name}
                            </span>
                            <span className="font-mono text-comets-yellow font-bold text-sm">
                              +{rel.value}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negative */}
                  {playerChem.negative.length > 0 && (
                    <div>
                      <h4 className="font-ui text-xs uppercase tracking-widest text-comets-red mb-2 flex items-center gap-2">
                        <AlertTriangle size={12} />
                        Negative
                      </h4>
                      <div className="space-y-1">
                        {playerChem.negative.map((rel, relIdx) => (
                          <motion.div
                            key={rel.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.1 + idx * 0.1 + relIdx * 0.05 }}
                            className="flex items-center justify-between p-2 bg-comets-red/10 rounded hover:bg-comets-red/20 transition-all"
                          >
                            <span className="font-ui text-sm text-white uppercase">
                              {rel.name}
                            </span>
                            <span className="font-mono text-comets-red font-bold text-sm">
                              {rel.value}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {playerChem.positive.length === 0 && playerChem.negative.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="font-mono text-xs text-white/40 uppercase">
                        No chemistry data
                      </p>
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Swords, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerData {
  name: string;
  team: string;
  color: string;
  stats: {
    avg?: string;
    hr?: number;
    ops?: string;
    era?: string;
    w?: number;
    sv?: number;
  };
}

interface CompareClientProps {
  players: PlayerData[];
}

export default function CompareClient({ players }: CompareClientProps) {
  const [playerA, setPlayerA] = useState(players[0]);
  const [playerB, setPlayerB] = useState(players[1] || players[0]);
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);

  const stats = [
    { key: "avg", label: "AVG", type: "rate" },
    { key: "hr", label: "HR", type: "counting" },
    { key: "ops", label: "OPS", type: "rate" },
    { key: "era", label: "ERA", type: "rate", lower: true },
    { key: "w", label: "W", type: "counting" },
    { key: "sv", label: "SV", type: "counting" },
  ];

  const compareValue = (key: string, valueA: any, valueB: any, lower = false) => {
    if (valueA === undefined || valueB === undefined) return "tie";
    const numA = typeof valueA === "string" ? parseFloat(valueA) : valueA;
    const numB = typeof valueB === "string" ? parseFloat(valueB) : valueB;
    if (numA === numB) return "tie";
    if (lower) return numA < numB ? "a" : "b";
    return numA > numB ? "a" : "b";
  };

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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            VS
          </motion.div>
        </div>

        {/* Player A Side */}
        <motion.div
          className="relative flex flex-col items-center justify-center p-8 min-h-[80vh]"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: `linear-gradient(135deg, ${playerA.color}15, transparent 70%)`,
          }}
        >
          {/* Player Selection Dropdown */}
          <div className="relative mb-12 pointer-events-auto">
            <button
              onClick={() => setShowDropdownA(!showDropdownA)}
              className="group flex items-center gap-3 px-8 py-4 bg-surface-dark border-2 rounded-lg hover:scale-105 transition-all"
              style={{ borderColor: playerA.color }}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: playerA.color }} />
              <div className="text-left">
                <div className="font-display text-2xl uppercase text-white">{playerA.name}</div>
                <div className="font-mono text-xs text-white/40 uppercase">{playerA.team}</div>
              </div>
              <ChevronDown
                className="text-white/40 group-hover:text-white transition-colors"
                size={20}
              />
            </button>

            {showDropdownA && (
              <div className="absolute top-full mt-2 w-full bg-surface-dark border border-white/10 rounded-lg max-h-64 overflow-y-auto z-30">
                {players.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setPlayerA(p);
                      setShowDropdownA(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-all text-left"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <div className="flex-1">
                      <div className="font-ui text-white uppercase text-sm">{p.name}</div>
                      <div className="font-mono text-xs text-white/40">{p.team}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats Display */}
          <div className="space-y-4 w-full max-w-md">
            {stats.map((stat, idx) => {
              const value = playerA.stats[stat.key as keyof typeof playerA.stats];
              const comparison = compareValue(
                stat.key,
                playerA.stats[stat.key as keyof typeof playerA.stats],
                playerB.stats[stat.key as keyof typeof playerB.stats],
                stat.lower
              );
              const isWinner = comparison === "a";
              const isTie = comparison === "tie";

              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all",
                    isWinner
                      ? "bg-comets-yellow/20 border-comets-yellow"
                      : isTie
                      ? "bg-white/5 border-white/10"
                      : "bg-white/5 border-white/10 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-ui text-sm uppercase tracking-wider text-white/60">
                      {stat.label}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-bold text-3xl",
                        isWinner ? "text-comets-yellow" : "text-white"
                      )}
                    >
                      {value ?? "-"}
                    </span>
                  </div>
                  {isWinner && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-comets-yellow">
                      <div className="w-6 h-6 rounded-full bg-comets-yellow/20 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Player B Side */}
        <motion.div
          className="relative flex flex-col items-center justify-center p-8 min-h-[80vh]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: `linear-gradient(225deg, ${playerB.color}15, transparent 70%)`,
          }}
        >
          {/* Player Selection Dropdown */}
          <div className="relative mb-12 pointer-events-auto">
            <button
              onClick={() => setShowDropdownB(!showDropdownB)}
              className="group flex items-center gap-3 px-8 py-4 bg-surface-dark border-2 rounded-lg hover:scale-105 transition-all"
              style={{ borderColor: playerB.color }}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: playerB.color }} />
              <div className="text-left">
                <div className="font-display text-2xl uppercase text-white">{playerB.name}</div>
                <div className="font-mono text-xs text-white/40 uppercase">{playerB.team}</div>
              </div>
              <ChevronDown
                className="text-white/40 group-hover:text-white transition-colors"
                size={20}
              />
            </button>

            {showDropdownB && (
              <div className="absolute top-full mt-2 w-full bg-surface-dark border border-white/10 rounded-lg max-h-64 overflow-y-auto z-30">
                {players.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setPlayerB(p);
                      setShowDropdownB(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-all text-left"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <div className="flex-1">
                      <div className="font-ui text-white uppercase text-sm">{p.name}</div>
                      <div className="font-mono text-xs text-white/40">{p.team}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats Display */}
          <div className="space-y-4 w-full max-w-md">
            {stats.map((stat, idx) => {
              const value = playerB.stats[stat.key as keyof typeof playerB.stats];
              const comparison = compareValue(
                stat.key,
                playerA.stats[stat.key as keyof typeof playerA.stats],
                playerB.stats[stat.key as keyof typeof playerB.stats],
                stat.lower
              );
              const isWinner = comparison === "b";
              const isTie = comparison === "tie";

              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all",
                    isWinner
                      ? "bg-comets-yellow/20 border-comets-yellow"
                      : isTie
                      ? "bg-white/5 border-white/10"
                      : "bg-white/5 border-white/10 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-ui text-sm uppercase tracking-wider text-white/60">
                      {stat.label}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-bold text-3xl",
                        isWinner ? "text-comets-yellow" : "text-white"
                      )}
                    >
                      {value ?? "-"}
                    </span>
                  </div>
                  {isWinner && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-comets-yellow">
                      <div className="w-6 h-6 rounded-full bg-comets-yellow/20 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swords, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import RetroEmptyState from "@/components/ui/RetroEmptyState";

interface PlayerData {
  name: string;
  team: string;
  color: string;
  imageUrl?: string;
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
  const [playerA, setPlayerA] = useState<PlayerData | null>(players[0] || null);
  const [playerB, setPlayerB] = useState<PlayerData | null>(players[1] || players[0] || null);
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);

  // Handle empty players array
  if (players.length === 0 || !playerA || !playerB) {
    return (
      <main className="min-h-screen pt-28 px-4 flex items-center justify-center">
        <RetroEmptyState
          title="No Players Available"
          message="Player data is currently loading or unavailable"
          icon="question-block"
        />
      </main>
    );
  }

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
    <main className="min-h-screen pt-28 relative flex flex-col overflow-hidden">
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
        {/* Diagonal Divider - Fighting Game Style - Desktop */}
        <div className="absolute inset-0 pointer-events-none hidden md:flex items-center justify-center z-10">
          {/* Diagonal slash line */}
          <div
            className="absolute w-[2px] bg-gradient-to-b from-transparent via-comets-cyan/60 to-transparent shadow-[0_0_15px_rgba(0,243,255,0.4)]"
            style={{
              height: '120%',
              transform: 'rotate(-15deg)',
            }}
          />
          {/* Secondary accent line */}
          <div
            className="absolute w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"
            style={{
              height: '120%',
              transform: 'rotate(-15deg) translateX(4px)',
            }}
          />
          {/* VS Badge - Fighting Game Style */}
          <motion.div
            className="relative w-16 h-16 bg-black border-2 border-comets-cyan rounded-full flex items-center justify-center font-display text-xl text-white shadow-[0_0_25px_rgba(0,243,255,0.5)]"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 3, -3, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Inner glow ring */}
            <div className="absolute inset-1 rounded-full border border-comets-cyan/30" />
            VS
          </motion.div>
        </div>

        {/* Mobile VS Divider */}
        <div className="md:hidden absolute left-0 right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
          {/* Horizontal line with glow */}
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-comets-cyan/40 to-transparent" />
          <motion.div
            className="relative px-5 py-2.5 bg-black border-2 border-comets-cyan rounded-full font-display text-white text-lg shadow-[0_0_20px_rgba(0,243,255,0.4)]"
            animate={{ scale: [1, 1.08, 1] }}
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
          <div className="relative mb-8 pointer-events-auto">
            {/* Player Image */}
            {playerA.imageUrl && (
              <motion.div
                className="w-24 h-24 mx-auto mb-4 rounded-full border-4 overflow-hidden"
                style={{ borderColor: playerA.color }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={playerA.name}
              >
                <Image
                  src={playerA.imageUrl}
                  alt={playerA.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
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
              <div
                data-lenis-prevent
                className="absolute top-full mt-2 w-full bg-surface-dark border border-white/10 rounded-lg max-h-64 overflow-y-auto z-30"
              >
                {players.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setPlayerA(p);
                      setShowDropdownA(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-all text-left"
                  >
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.color }} />
                    )}
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
          <div className="relative mb-8 pointer-events-auto">
            {/* Player Image */}
            {playerB.imageUrl && (
              <motion.div
                className="w-24 h-24 mx-auto mb-4 rounded-full border-4 overflow-hidden"
                style={{ borderColor: playerB.color }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={playerB.name}
              >
                <Image
                  src={playerB.imageUrl}
                  alt={playerB.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
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
              <div
                data-lenis-prevent
                className="absolute top-full mt-2 w-full bg-surface-dark border border-white/10 rounded-lg max-h-64 overflow-y-auto z-30"
              >
                {players.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setPlayerB(p);
                      setShowDropdownB(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-all text-left"
                  >
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.color }} />
                    )}
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
                                  </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";

export interface ComparePlayer {
  name: string;
  team: string;
  color: string;
  stats: { avg: string; hr: number; ops: string };
}

export function CompareClient({ playerA, playerB }: { playerA: ComparePlayer; playerB: ComparePlayer }) {
  return (
    <main className="min-h-screen bg-background pt-20 relative flex flex-col overflow-hidden">
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
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block z-10">
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

          <motion.div
            className="absolute left-0 w-full h-1 bg-comets-cyan/50 blur-sm"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <PlayerColumn player={playerA} align="right" />
        <PlayerColumn player={playerB} align="left" />
      </div>
    </main>
  );
}

function PlayerColumn({ player, align }: { player: ComparePlayer; align: "left" | "right" }) {
  const isLeft = align === "left";
  return (
    <motion.div
      className="relative p-8 flex flex-col justify-center items-center md:items-start text-center md:text-left"
      initial={{ opacity: 0, x: isLeft ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: `linear-gradient(to ${isLeft ? 'left' : 'right'}, transparent, ${player.color}30)` }}
      />

      <div className="relative z-10 max-w-md">
        <motion.div
          className="w-24 h-24 rounded-xl bg-surface-dark border-2 mb-6 mx-auto md:ml-0 md:mr-auto flex items-center justify-center font-display text-4xl"
          style={{ borderColor: player.color, color: player.color }}
          animate={{
            y: [0, -5, 0],
            boxShadow: [
              `0 0 0px ${player.color}`,
              `0 0 20px ${player.color}`,
              `0 0 0px ${player.color}`
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: isLeft ? 0 : 1.5 }}
          whileHover={{ scale: 1.1, rotate: isLeft ? -5 : 5 }}
        >
          {player.name[0]}
        </motion.div>

        <h2 className="font-display text-5xl text-white uppercase mb-1">{player.name}</h2>
        <div className="font-ui text-white/50 tracking-widest uppercase mb-12">{player.team}</div>

        <div className="space-y-6 w-full">
          <StatRow
            label="AVG"
            value={player.stats.avg}
            isWinner={false}
            color={player.color}
            align={align}
          />
          <StatRow
            label="HR"
            value={player.stats.hr}
            isWinner={false}
            color={player.color}
            align={align}
          />
          <StatRow
            label="OPS"
            value={player.stats.ops}
            isWinner={false}
            color={player.color}
            align={align}
          />
        </div>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value, isWinner, color, align }: { label: string; value: any; isWinner: boolean; color: string; align: "left" | "right"; }) {
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

export default CompareClient;

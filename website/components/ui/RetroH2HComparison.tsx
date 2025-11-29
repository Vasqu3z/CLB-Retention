"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Swords, Crown, ChevronDown } from "lucide-react";

/**
 * RetroH2HComparison - Head-to-Head player comparison component
 *
 * Dramatic versus-style comparison with:
 * - Split screen aesthetic with diagonal divider
 * - Player cards with team color theming
 * - Stat rows with winner highlighting
 * - Victory crown animation for the leader
 * - CRT screen effects and scan lines
 */

export interface H2HPlayer {
  id: string;
  name: string;
  team: string;
  color: string;
}

export interface H2HStat {
  key: string;
  label: string;
  valueA: number | string;
  valueB: number | string;
  lowerIsBetter?: boolean;
  format?: (v: number | string) => string;
}

interface RetroH2HComparisonProps {
  playerA: H2HPlayer;
  playerB: H2HPlayer;
  stats: H2HStat[];
  onSwapPlayers?: () => void;
  className?: string;
}

export default function RetroH2HComparison({
  playerA,
  playerB,
  stats,
  onSwapPlayers,
  className,
}: RetroH2HComparisonProps) {
  // Calculate wins for each player
  const winsA = stats.filter((stat) => {
    const a = typeof stat.valueA === "string" ? parseFloat(stat.valueA) : stat.valueA;
    const b = typeof stat.valueB === "string" ? parseFloat(stat.valueB) : stat.valueB;
    if (isNaN(a) || isNaN(b) || a === b) return false;
    return stat.lowerIsBetter ? a < b : a > b;
  }).length;

  const winsB = stats.filter((stat) => {
    const a = typeof stat.valueA === "string" ? parseFloat(stat.valueA) : stat.valueA;
    const b = typeof stat.valueB === "string" ? parseFloat(stat.valueB) : stat.valueB;
    if (isNaN(a) || isNaN(b) || a === b) return false;
    return stat.lowerIsBetter ? b < a : b > a;
  }).length;

  const overallWinner = winsA > winsB ? "A" : winsB > winsA ? "B" : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("relative overflow-hidden rounded-lg", className)}
    >
      {/* Background with split colors */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 w-1/2"
          style={{
            background: `linear-gradient(135deg, ${playerA.color}20 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute inset-0 left-1/2"
          style={{
            background: `linear-gradient(225deg, ${playerB.color}20 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

      <div className="relative z-10 p-6">
        {/* Player Headers */}
        <div className="flex items-stretch gap-4 mb-8">
          {/* Player A */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-1 relative"
          >
            <div
              className="p-4 bg-surface-dark/80 backdrop-blur border-2 rounded-lg transition-all"
              style={{
                borderColor: overallWinner === "A" ? playerA.color : "rgba(255,255,255,0.1)",
                boxShadow: overallWinner === "A" ? `0 0 30px ${playerA.color}40` : "none",
              }}
            >
              {/* Crown for winner */}
              {overallWinner === "A" && (
                <motion.div
                  initial={{ y: -20, opacity: 0, rotate: -20 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-3 -right-2 text-comets-yellow"
                >
                  <Crown size={24} fill="currentColor" />
                </motion.div>
              )}

              <div className="flex items-center gap-3">
                <motion.div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: playerA.color }}
                  animate={
                    overallWinner === "A"
                      ? { scale: [1, 1.3, 1], boxShadow: [`0 0 0 ${playerA.color}`, `0 0 20px ${playerA.color}`, `0 0 0 ${playerA.color}`] }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div>
                  <h3 className="font-display text-xl uppercase tracking-tight text-white">
                    {playerA.name}
                  </h3>
                  <p
                    className="font-mono text-xs uppercase tracking-widest"
                    style={{ color: playerA.color }}
                  >
                    {playerA.team}
                  </p>
                </div>
              </div>

              {/* Win count */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="font-ui text-xs uppercase text-white/40">Stat Wins</span>
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: playerA.color }}
                >
                  {winsA}
                </span>
              </div>
            </div>
          </motion.div>

          {/* VS Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className="flex-shrink-0 flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                className="w-16 h-16 rounded-full bg-surface-dark border-2 border-comets-red flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(255,77,77,0.3)",
                    "0 0 30px rgba(255,77,77,0.6)",
                    "0 0 10px rgba(255,77,77,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Swords className="text-comets-red" size={24} />
              </motion.div>

              {/* Swap button */}
              {onSwapPlayers && (
                <motion.button
                  onClick={onSwapPlayers}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-1 bg-surface-dark border border-white/20 rounded-full text-white/40 hover:text-white hover:border-white/40 transition-all focus-arcade"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9, rotate: 180 }}
                >
                  <ChevronDown size={14} className="rotate-90" />
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Player B */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-1 relative"
          >
            <div
              className="p-4 bg-surface-dark/80 backdrop-blur border-2 rounded-lg transition-all"
              style={{
                borderColor: overallWinner === "B" ? playerB.color : "rgba(255,255,255,0.1)",
                boxShadow: overallWinner === "B" ? `0 0 30px ${playerB.color}40` : "none",
              }}
            >
              {overallWinner === "B" && (
                <motion.div
                  initial={{ y: -20, opacity: 0, rotate: 20 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-3 -left-2 text-comets-yellow"
                >
                  <Crown size={24} fill="currentColor" />
                </motion.div>
              )}

              <div className="flex items-center gap-3 justify-end text-right">
                <div>
                  <h3 className="font-display text-xl uppercase tracking-tight text-white">
                    {playerB.name}
                  </h3>
                  <p
                    className="font-mono text-xs uppercase tracking-widest"
                    style={{ color: playerB.color }}
                  >
                    {playerB.team}
                  </p>
                </div>
                <motion.div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: playerB.color }}
                  animate={
                    overallWinner === "B"
                      ? { scale: [1, 1.3, 1] }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: playerB.color }}
                >
                  {winsB}
                </span>
                <span className="font-ui text-xs uppercase text-white/40">Stat Wins</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stat Rows */}
        <div className="space-y-2">
          {stats.map((stat, idx) => (
            <RetroH2HStatRow
              key={stat.key}
              stat={stat}
              playerAColor={playerA.color}
              playerBColor={playerB.color}
              delay={idx * 0.05}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Individual stat comparison row
 */
function RetroH2HStatRow({
  stat,
  playerAColor,
  playerBColor,
  delay = 0,
}: {
  stat: H2HStat;
  playerAColor: string;
  playerBColor: string;
  delay?: number;
}) {
  const format = stat.format || ((v) => String(v));
  const a = typeof stat.valueA === "string" ? parseFloat(stat.valueA) : stat.valueA;
  const b = typeof stat.valueB === "string" ? parseFloat(stat.valueB) : stat.valueB;

  let winner: "A" | "B" | null = null;
  if (!isNaN(a) && !isNaN(b) && a !== b) {
    if (stat.lowerIsBetter) {
      winner = a < b ? "A" : "B";
    } else {
      winner = a > b ? "A" : "B";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative flex items-center gap-4 p-3 bg-surface-dark/50 border border-white/5 rounded hover:border-white/10 transition-colors"
    >
      {/* Value A */}
      <motion.div
        className={cn(
          "flex-1 text-left font-mono text-lg tabular-nums",
          winner === "A" ? "font-bold" : "text-white/50"
        )}
        style={winner === "A" ? { color: playerAColor } : {}}
        animate={winner === "A" ? { textShadow: [`0 0 0px ${playerAColor}`, `0 0 10px ${playerAColor}`, `0 0 0px ${playerAColor}`] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {format(stat.valueA)}
        {winner === "A" && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-2 text-xs"
          >
            ◀
          </motion.span>
        )}
      </motion.div>

      {/* Stat label */}
      <div className="flex-shrink-0 px-4 py-1 bg-white/5 rounded">
        <span className="font-ui text-xs uppercase tracking-widest text-white/60">
          {stat.label}
        </span>
      </div>

      {/* Value B */}
      <motion.div
        className={cn(
          "flex-1 text-right font-mono text-lg tabular-nums",
          winner === "B" ? "font-bold" : "text-white/50"
        )}
        style={winner === "B" ? { color: playerBColor } : {}}
        animate={winner === "B" ? { textShadow: [`0 0 0px ${playerBColor}`, `0 0 10px ${playerBColor}`, `0 0 0px ${playerBColor}`] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {winner === "B" && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mr-2 text-xs"
          >
            ▶
          </motion.span>
        )}
        {format(stat.valueB)}
      </motion.div>

      {/* Winner glow line */}
      {winner && (
        <motion.div
          className="absolute bottom-0 h-0.5"
          style={{
            backgroundColor: winner === "A" ? playerAColor : playerBColor,
            left: winner === "A" ? 0 : "50%",
            right: winner === "A" ? "50%" : 0,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: delay + 0.2 }}
        />
      )}
    </motion.div>
  );
}

/**
 * Convenience wrapper for quick H2H setup
 */
export function QuickH2HComparison({
  playerA,
  playerB,
  statsConfig,
  playerAData,
  playerBData,
  className,
}: {
  playerA: H2HPlayer;
  playerB: H2HPlayer;
  statsConfig: Array<{
    key: string;
    label: string;
    lowerIsBetter?: boolean;
    format?: (v: number | string) => string;
  }>;
  playerAData: Record<string, number | string>;
  playerBData: Record<string, number | string>;
  className?: string;
}) {
  const stats: H2HStat[] = statsConfig.map((config) => ({
    ...config,
    valueA: playerAData[config.key] ?? 0,
    valueB: playerBData[config.key] ?? 0,
  }));

  return (
    <RetroH2HComparison
      playerA={playerA}
      playerB={playerB}
      stats={stats}
      className={className}
    />
  );
}

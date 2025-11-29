"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trophy, Minus } from "lucide-react";

/**
 * RetroComparisonBar - Arcade-style stat comparison bars
 *
 * Visual comparison of player stats with:
 * - Animated fill bars with team color coding
 * - Winner highlighting with trophy icon and glow
 * - Value display with neon treatment
 * - Staggered reveal animations
 * - Optional "higher is better" / "lower is better" logic
 */

export interface ComparisonPlayer {
  id: string;
  name: string;
  color: string;
  value: number | string;
}

interface RetroComparisonBarProps {
  statName: string;
  statKey: string;
  players: ComparisonPlayer[];
  lowerIsBetter?: boolean; // For stats like ERA where lower is better
  formatValue?: (value: number | string) => string;
  maxValue?: number; // Optional max for scaling bars
  delay?: number;
  className?: string;
}

export default function RetroComparisonBar({
  statName,
  statKey,
  players,
  lowerIsBetter = false,
  formatValue = (v) => String(v),
  maxValue,
  delay = 0,
  className,
}: RetroComparisonBarProps) {
  // Parse numeric values for comparison
  const numericValues = players.map((p) => {
    const val = typeof p.value === "string" ? parseFloat(p.value) : p.value;
    return isNaN(val) ? 0 : val;
  });

  // Determine winner(s)
  const bestValue = lowerIsBetter
    ? Math.min(...numericValues.filter((v) => v > 0))
    : Math.max(...numericValues);

  const winners = players.filter((_, idx) => {
    const val = numericValues[idx];
    if (val === 0 && bestValue !== 0) return false;
    return val === bestValue;
  });

  const isWinner = (playerId: string) => winners.some((w) => w.id === playerId);
  const isTie = winners.length > 1;

  // Calculate bar widths (0-100%)
  const calculatedMax = maxValue || Math.max(...numericValues) || 1;
  const getBarWidth = (value: number) => {
    if (value === 0) return 0;
    return Math.min(100, (value / calculatedMax) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative p-4 bg-surface-dark border border-white/10 rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

      {/* Stat header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display text-lg uppercase tracking-wide text-white">
          {statName}
        </h4>
        <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
          {statKey}
        </span>
      </div>

      {/* Comparison bars */}
      <div className="space-y-3">
        {players.map((player, idx) => {
          const numValue = numericValues[idx];
          const barWidth = getBarWidth(numValue);
          const playerIsWinner = isWinner(player.id);

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + idx * 0.1 }}
              className="relative"
            >
              {/* Player row */}
              <div className="flex items-center gap-3 mb-1.5">
                {/* Color dot */}
                <motion.div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: player.color,
                    boxShadow: playerIsWinner ? `0 0 10px ${player.color}` : "none",
                  }}
                  animate={
                    playerIsWinner
                      ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Player name */}
                <span
                  className={cn(
                    "flex-1 font-ui text-sm uppercase tracking-wide truncate",
                    playerIsWinner ? "text-white" : "text-white/60"
                  )}
                >
                  {player.name}
                </span>

                {/* Winner indicator */}
                {playerIsWinner && !isTie && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, delay: delay + 0.3 }}
                    className="text-comets-yellow"
                  >
                    <Trophy size={14} />
                  </motion.div>
                )}
                {isTie && playerIsWinner && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white/40"
                  >
                    <Minus size={14} />
                  </motion.div>
                )}

                {/* Value display */}
                <motion.span
                  className={cn(
                    "font-mono text-sm tabular-nums",
                    playerIsWinner
                      ? "text-comets-cyan font-bold"
                      : "text-white/50"
                  )}
                  style={
                    playerIsWinner
                      ? { textShadow: `0 0 10px ${player.color}80` }
                      : {}
                  }
                >
                  {formatValue(player.value)}
                </motion.span>
              </div>

              {/* Bar container */}
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                {/* Animated fill bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    backgroundColor: player.color,
                    boxShadow: playerIsWinner
                      ? `0 0 15px ${player.color}80, inset 0 1px 0 rgba(255,255,255,0.3)`
                      : `inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{
                    delay: delay + idx * 0.1 + 0.2,
                    duration: 0.8,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                />

                {/* Shimmer effect on winner */}
                {playerIsWinner && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      delay: delay + 0.8,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/**
 * RetroComparisonGrid - Grid layout for multiple stat comparisons
 */
export function RetroComparisonGrid({
  stats,
  players,
  className,
}: {
  stats: Array<{
    name: string;
    key: string;
    getValue: (player: any) => number | string;
    lowerIsBetter?: boolean;
    format?: (v: number | string) => string;
  }>;
  players: Array<{ id: string; name: string; color: string; [key: string]: any }>;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {stats.map((stat, idx) => (
        <RetroComparisonBar
          key={stat.key}
          statName={stat.name}
          statKey={stat.key}
          lowerIsBetter={stat.lowerIsBetter}
          formatValue={stat.format}
          delay={idx * 0.05}
          players={players.map((p) => ({
            id: p.id,
            name: p.name,
            color: p.color,
            value: stat.getValue(p),
          }))}
        />
      ))}
    </div>
  );
}

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  AlertTriangle,
  Zap,
  Heart,
  Skull,
  Link2,
  Unlink2,
  Users,
} from "lucide-react";

/**
 * RetroChemistryNode - Player chemistry visualization component
 *
 * Distinctive arcade-style chemistry display with:
 * - Glowing player node with team color
 * - Positive connections with sparkle animations
 * - Negative connections with warning pulses
 * - Connection strength visualization
 * - Network-style relationship badges
 */

export interface ChemistryRelationship {
  playerName: string;
  value: number; // Positive or negative chemistry value
}

export interface ChemistryPlayer {
  id: string;
  name: string;
  team: string;
  color: string;
  positiveConnections: ChemistryRelationship[];
  negativeConnections: ChemistryRelationship[];
}

interface RetroChemistryNodeProps {
  player: ChemistryPlayer;
  maxDisplay?: number; // Max connections to show per type
  delay?: number;
  className?: string;
}

export default function RetroChemistryNode({
  player,
  maxDisplay = 5,
  delay = 0,
  className,
}: RetroChemistryNodeProps) {
  const positives = player.positiveConnections.slice(0, maxDisplay);
  const negatives = player.negativeConnections.slice(0, maxDisplay);
  const hasConnections = positives.length > 0 || negatives.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative p-5 bg-surface-dark border-2 rounded-lg overflow-hidden",
        className
      )}
      style={{
        borderColor: `${player.color}60`,
        boxShadow: `0 0 30px ${player.color}20, inset 0 0 30px ${player.color}05`,
      }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

      {/* Ambient glow */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
        style={{ backgroundColor: player.color }}
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Player Header */}
      <div className="relative flex items-center gap-4 mb-5 pb-4 border-b border-white/10">
        {/* Player avatar/indicator */}
        <motion.div
          className="relative w-14 h-14 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${player.color}20`,
            border: `2px solid ${player.color}`,
          }}
          animate={{
            boxShadow: [
              `0 0 10px ${player.color}40`,
              `0 0 25px ${player.color}60`,
              `0 0 10px ${player.color}40`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Users size={24} style={{ color: player.color }} />

          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2"
            style={{ borderColor: player.color }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Player info */}
        <div className="flex-1">
          <h3 className="font-display text-xl uppercase tracking-tight text-white">
            {player.name}
          </h3>
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: player.color }}
          >
            {player.team}
          </p>
        </div>

        {/* Chemistry summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-400">
            <Link2 size={14} />
            <span className="font-mono text-sm">{player.positiveConnections.length}</span>
          </div>
          <div className="flex items-center gap-1 text-comets-red">
            <Unlink2 size={14} />
            <span className="font-mono text-sm">{player.negativeConnections.length}</span>
          </div>
        </div>
      </div>

      {/* Connections Grid */}
      {hasConnections ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Positive Connections */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={16} className="text-emerald-400" />
              </motion.div>
              <span className="font-ui text-xs uppercase tracking-widest text-emerald-400">
                Synergy
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {positives.map((rel, idx) => (
                  <RetroChemistryBadge
                    key={rel.playerName}
                    relationship={rel}
                    type="positive"
                    delay={delay + idx * 0.05}
                  />
                ))}
              </AnimatePresence>

              {positives.length === 0 && (
                <div className="text-white/30 font-mono text-xs italic py-2">
                  No synergies found
                </div>
              )}

              {player.positiveConnections.length > maxDisplay && (
                <div className="text-emerald-400/50 font-mono text-xs">
                  +{player.positiveConnections.length - maxDisplay} more
                </div>
              )}
            </div>
          </div>

          {/* Negative Connections */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle size={16} className="text-comets-red" />
              </motion.div>
              <span className="font-ui text-xs uppercase tracking-widest text-comets-red">
                Conflicts
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {negatives.map((rel, idx) => (
                  <RetroChemistryBadge
                    key={rel.playerName}
                    relationship={rel}
                    type="negative"
                    delay={delay + idx * 0.05}
                  />
                ))}
              </AnimatePresence>

              {negatives.length === 0 && (
                <div className="text-white/30 font-mono text-xs italic py-2">
                  No conflicts found
                </div>
              )}

              {player.negativeConnections.length > maxDisplay && (
                <div className="text-comets-red/50 font-mono text-xs">
                  +{player.negativeConnections.length - maxDisplay} more
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-white/40 font-mono text-sm">
          No significant chemistry relationships
        </div>
      )}
    </motion.div>
  );
}

/**
 * Individual chemistry relationship badge
 */
function RetroChemistryBadge({
  relationship,
  type,
  delay = 0,
}: {
  relationship: ChemistryRelationship;
  type: "positive" | "negative";
  delay?: number;
}) {
  const isPositive = type === "positive";
  const color = isPositive ? "#10B981" : "#FF4D4D"; // emerald-500 / comets-red
  const Icon = isPositive ? Heart : Skull;

  return (
    <motion.div
      initial={{ opacity: 0, x: isPositive ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay, type: "spring", stiffness: 400 }}
      className="group relative flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-all cursor-default"
      whileHover={{ x: isPositive ? 2 : -2 }}
    >
      {/* Icon */}
      <motion.div
        className="flex-shrink-0"
        style={{ color }}
        animate={
          isPositive
            ? { scale: [1, 1.15, 1] }
            : { rotate: [0, -5, 5, 0] }
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon size={14} />
      </motion.div>

      {/* Player name */}
      <span className="flex-1 font-ui text-xs uppercase tracking-wide text-white/80 truncate group-hover:text-white transition-colors">
        {relationship.playerName}
      </span>

      {/* Value badge */}
      <motion.div
        className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-mono font-bold"
        style={{
          backgroundColor: `${color}20`,
          color,
          border: `1px solid ${color}40`,
        }}
        whileHover={{ scale: 1.1 }}
      >
        {isPositive ? "+" : ""}
        {relationship.value}
      </motion.div>

      {/* Glow on hover */}
      <motion.div
        className="absolute inset-0 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: `inset 0 0 15px ${color}20`,
        }}
      />
    </motion.div>
  );
}

/**
 * RetroChemistryConnection - Shows connection between two specific players
 * Use this for internal team chemistry display
 */
export function RetroChemistryConnection({
  player1,
  player2,
  value,
  delay = 0,
}: {
  player1: { name: string; color: string };
  player2: { name: string; color: string };
  value: number;
  delay?: number;
}) {
  const isPositive = value >= 0;
  const connectionColor = isPositive ? "#10B981" : "#FF4D4D";
  const Icon = isPositive ? Zap : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, type: "spring", stiffness: 300 }}
      className="flex items-center gap-3 p-3 bg-surface-dark/50 border border-white/10 rounded-lg"
    >
      {/* Player 1 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: player1.color }}
        />
        <span className="font-ui text-sm uppercase tracking-wide text-white truncate">
          {player1.name}
        </span>
      </div>

      {/* Connection indicator */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${connectionColor}20`,
          border: `1px solid ${connectionColor}`,
        }}
        animate={{
          boxShadow: [
            `0 0 5px ${connectionColor}40`,
            `0 0 15px ${connectionColor}60`,
            `0 0 5px ${connectionColor}40`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon size={14} style={{ color: connectionColor }} />
        <span
          className="font-mono text-sm font-bold"
          style={{ color: connectionColor }}
        >
          {isPositive ? "+" : ""}
          {value}
        </span>
      </motion.div>

      {/* Player 2 */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="font-ui text-sm uppercase tracking-wide text-white truncate">
          {player2.name}
        </span>
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: player2.color }}
        />
      </div>
    </motion.div>
  );
}

/**
 * RetroChemistryTeamSummary - Summary card for team chemistry analysis
 */
export function RetroChemistryTeamSummary({
  positiveConnections,
  negativeConnections,
  className,
}: {
  positiveConnections: Array<{ player1: string; player2: string; value: number }>;
  negativeConnections: Array<{ player1: string; player2: string; value: number }>;
  className?: string;
}) {
  const totalPositive = positiveConnections.reduce((sum, c) => sum + c.value, 0);
  const totalNegative = negativeConnections.reduce((sum, c) => sum + c.value, 0);
  const netChemistry = totalPositive + totalNegative;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-5 bg-surface-dark border border-white/10 rounded-lg overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

      <h4 className="font-display text-lg uppercase tracking-wide text-white mb-4">
        Team Chemistry
      </h4>

      <div className="grid grid-cols-3 gap-4">
        {/* Positive */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="font-ui text-xs uppercase text-emerald-400">Synergy</span>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400">
            {positiveConnections.length}
          </div>
          <div className="font-mono text-xs text-white/40">
            +{totalPositive}
          </div>
        </div>

        {/* Net */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap size={14} className="text-comets-cyan" />
            <span className="font-ui text-xs uppercase text-comets-cyan">Net</span>
          </div>
          <motion.div
            className={cn(
              "font-mono text-2xl font-bold",
              netChemistry >= 0 ? "text-emerald-400" : "text-comets-red"
            )}
            animate={{
              textShadow: netChemistry >= 0
                ? ["0 0 5px #10B981", "0 0 15px #10B981", "0 0 5px #10B981"]
                : ["0 0 5px #FF4D4D", "0 0 15px #FF4D4D", "0 0 5px #FF4D4D"],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {netChemistry >= 0 ? "+" : ""}{netChemistry}
          </motion.div>
        </div>

        {/* Negative */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle size={14} className="text-comets-red" />
            <span className="font-ui text-xs uppercase text-comets-red">Conflicts</span>
          </div>
          <div className="font-mono text-2xl font-bold text-comets-red">
            {negativeConnections.length}
          </div>
          <div className="font-mono text-xs text-white/40">
            {totalNegative}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

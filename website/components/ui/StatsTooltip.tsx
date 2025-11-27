"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import RetroTooltip from "./RetroTooltip";

/**
 * StatsTooltip - Arcade-style stat explanation tooltip
 *
 * Diegetic design: HUD-style data popup with scanlines and neon glow
 * Appears on hover to explain stat abbreviations (GP, AB, HR, etc.)
 */

interface StatsTooltipProps {
  stat: string;
  children: React.ReactNode;
  description?: string;
  context?: "batting" | "pitching" | "fielding" | "team";
}

// Stat definitions database with context awareness
const STAT_DEFINITIONS = {
  // Context-specific stats (different meanings in different contexts)
  batting: {
    "BB": "Walks (Base on Balls)",
    "H": "Hits",
    "K": "Strikeouts",
    "AVG": "Batting Average",
    "OBP": "On-Base Percentage",
    "SLG": "Slugging Percentage",
    "OPS": "On-Base Plus Slugging",
    "SB": "Stolen Bases",
  },
  pitching: {
    "BB": "Walks Allowed",
    "H": "Hits Allowed",
    "K": "Strikeouts",
    "W": "Wins",
    "L": "Losses",
    "ERA": "Earned Run Average",
    "IP": "Innings Pitched",
    "SV": "Saves",
    "WHIP": "Walks + Hits per Inning",
    "BAA": "Batting Average Against",
  },
  fielding: {
    "PO": "Put Outs",
    "A": "Assists",
    "E": "Errors",
    "FLD%": "Fielding Percentage",
    "TC": "Total Chances",
    "NP": "Nice Plays",
    "ROB": "Hits Robbed",
    "CS": "Caught Stealing",
    "OAA": "Outs Above Average",
  },
  team: {
    "W": "Wins",
    "L": "Losses",
    "PCT": "Winning Percentage",
    "GB": "Games Back",
    "STRK": "Streak",
    "RS": "Runs Scored",
    "RA": "Runs Against",
    "DIFF": "Run Differential",
    "R/G": "Runs Per Game",
    "DER": "Defensive Efficiency Rating",
    "OAA": "Outs Above Average",
    "NP": "Nice Plays",
  },
  // General stats (work across all contexts)
  general: {
    "GP": "Games Played",
    "AB": "At Bats",
    "HR": "Home Runs",
    "RBI": "Runs Batted In",
    "R": "Runs Scored",
    "SO": "Strikeouts",
    "DP": "Double Plays Hit Into",
  }
} as const;

export default function StatsTooltip({ stat, children, description, context }: StatsTooltipProps) {
  // Look up stat definition with context awareness
  const getDefinition = () => {
    if (description) return description;

    // Try context-specific lookup first
    if (context) {
      const contextDefs = STAT_DEFINITIONS[context] as Record<string, string>;
      if (contextDefs[stat]) {
        return contextDefs[stat];
      }
    }

    // Fall back to general lookup
    const generalDefs = STAT_DEFINITIONS.general as Record<string, string>;
    if (generalDefs[stat]) {
      return generalDefs[stat];
    }

    // Check all contexts as last resort
    for (const ctx of ["batting", "pitching", "fielding", "team"] as const) {
      const ctxDefs = STAT_DEFINITIONS[ctx] as Record<string, string>;
      if (ctxDefs[stat]) {
        return ctxDefs[stat];
      }
    }

    return "Statistical Metric";
  };

  const definition = getDefinition();

  return (
    <RetroTooltip
      title={stat}
      content={definition}
      accentColor="#00F3FF" // comets-cyan
    >
      <div className="inline-flex items-center gap-1 cursor-help">
        {children}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <HelpCircle size={12} className="text-white/20" />
        </motion.div>
      </div>
    </RetroTooltip>
  );
}

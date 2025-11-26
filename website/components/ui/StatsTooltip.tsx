"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";

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
    "BB": "Walks",
    "H": "Hits",
    "K": "Strikeouts",
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
    "HLD": "Holds",
    "WHIP": "Walks + Hits per Inning",
  },
  fielding: {
    "PO": "Put Outs",
    "A": "Assists",
    "E": "Errors",
    "FLD%": "Fielding Percentage",
    "TC": "Total Chances",
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
    "SB": "Stolen Bases",
    "AVG": "Batting Average",
    "OBP": "On-Base Percentage",
    "SLG": "Slugging Percentage",
    "OPS": "On-Base Plus Slugging",
    "DP": "Double Plays",
  }
} as const;

export default function StatsTooltip({ stat, children, description, context }: StatsTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

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
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Trigger element */}
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

      {/* Tooltip popup */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: -12, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none whitespace-nowrap"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-comets-cyan/20 blur-xl rounded-lg" />

            {/* Tooltip card */}
            <div className="relative bg-surface-dark border-2 border-comets-cyan/50 rounded-lg px-4 py-2 shadow-2xl overflow-hidden">

              {/* Scanlines */}
              <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

              {/* Content */}
              <div className="relative z-10">
                <div className="font-ui text-xs uppercase tracking-[0.2em] text-comets-cyan font-bold mb-0.5">
                  {stat}
                </div>
                <div className="font-body text-xs text-white/90">
                  {definition}
                </div>
              </div>

              {/* Corner accent */}
              <motion.div
                className="absolute top-0 right-0 w-8 h-8"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-full h-full bg-gradient-to-bl from-comets-cyan/30 to-transparent" />
              </motion.div>

              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-comets-cyan/50" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

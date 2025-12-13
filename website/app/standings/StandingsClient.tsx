"use client";

import React from "react";
import Link from "next/link";
import StandingsTable, { TeamStanding } from "./StandingsTable";
import { Trophy } from "lucide-react";
import HUDFrame from "@/components/ui/HUDFrame";
import { LEAGUE_CONFIG } from "@/config/league";
import { motion } from "framer-motion";

interface StandingsClientProps {
  data: TeamStanding[];
}

export default function StandingsClient({ data }: StandingsClientProps) {
  return (
    <main className="min-h-screen pb-24 pt-28 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 text-comets-yellow mb-2">
              <Trophy size={24} />
              <span className="font-ui uppercase tracking-[0.2em] font-bold text-sm">Season {LEAGUE_CONFIG.currentSeason}</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl uppercase leading-none tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Standings</span>
            </h1>
          </div>

          {/* Playoffs Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/playoffs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-ui uppercase tracking-wider text-sm transition-all bg-comets-yellow/20 text-comets-yellow border border-comets-yellow/40 hover:bg-comets-yellow/30 hover:border-comets-yellow/60 hover:shadow-[0_0_15px_rgba(244,208,63,0.3)] focus-arcade"
            >
              <Trophy size={16} />
              <span>View Playoffs</span>
            </Link>
          </motion.div>
        </div>

        {/* The Table - always show all stats */}
        <HUDFrame size="md" animate={true} delay={0.3} scanlines scanlinesOpacity={0.03} innerPadding>
          <StandingsTable data={data} showAdvanced={true} />
        </HUDFrame>

        {/* Legend / Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-white/30 border-t border-white/5 pt-8">
          <div>
            <span className="font-ui text-comets-yellow block mb-1 font-bold">RANKING CRITERIA</span>
            Win Percentage &gt; Head-to-Head &gt; Run Differential
          </div>
          <div>
            <span className="font-ui text-comets-cyan block mb-1 font-bold">PLAYOFF STATUS</span>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-ui font-bold bg-green-900/40 text-green-400 border border-green-500/40 rounded">x</span>
                <span>Clinched</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-ui font-bold bg-red-900/40 text-red-400 border border-red-500/40 rounded">e</span>
                <span>Eliminated</span>
              </div>
            </div>
          </div>
          <div className="md:text-right">
            <span className="font-ui text-white/50 block mb-1 font-bold">TOP 5 QUALIFY</span>
            Kingdom Cup Semifinals
          </div>
        </div>

      </div>
    </main>
  );
}

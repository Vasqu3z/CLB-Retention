"use client";

import React, { useState } from "react";
import StandingsTable, { TeamStanding } from "./StandingsTable";
import { Trophy } from "lucide-react";
import { StatsToggle } from "@/components/ui/RetroSegmentedControl";

interface StandingsClientProps {
  data: TeamStanding[];
}

export default function StandingsClient({ data }: StandingsClientProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <main className="min-h-screen bg-background pb-24 pt-28 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-comets-yellow mb-2">
              <Trophy size={24} />
              <span className="font-ui uppercase tracking-[0.2em] font-bold text-sm">Season 2</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase text-white leading-none">
              League Standings
            </h1>
          </div>

          {/* Stats Toggle */}
          <StatsToggle showAdvanced={showAdvanced} onChange={setShowAdvanced} size="sm" />
        </div>

        {/* The Table */}
        <StandingsTable data={data} showAdvanced={showAdvanced} />

        {/* Legend / Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-white/30 border-t border-white/5 pt-8">
          <div>
            <span className="text-comets-yellow block mb-1 font-bold">RANKING CRITERIA</span>
            Win Percentage &gt; Head-to-Head &gt; Run Differential
          </div>
          <div>
            <span className="text-comets-cyan block mb-1 font-bold">PLAYOFF STATUS</span>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-900/40 text-green-400 border border-green-500/40 rounded">x</span>
                <span>Clinched</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-900/40 text-red-400 border border-red-500/40 rounded">e</span>
                <span>Eliminated</span>
              </div>
            </div>
          </div>
          <div className="md:text-right">
            <span className="text-white/50 block mb-1 font-bold">TOP 4 QUALIFY</span>
            Star Cup Semifinals
          </div>
        </div>

      </div>
    </main>
  );
}

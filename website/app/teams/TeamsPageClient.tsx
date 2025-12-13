"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import TeamSelectCard from "@/components/ui/TeamSelectCard";
import TeamStatsView from "./TeamStatsView";
import { TeamData, StandingsRow } from "@/lib/sheets";

interface TeamCardData {
  name: string;
  code: string;
  logoColor: string;
  logoUrl?: string;
  emblemUrl?: string;
  rank?: number;
  stats: {
    wins: number;
    losses: number;
    avg: string;
  };
  href: string;
}

interface TeamRegistry {
  teamName: string;
  abbr: string;
  color: string;
  emblemUrl?: string;
  status?: string;
}

interface TeamsPageClientProps {
  teams: TeamCardData[];
  regularTeamData: TeamData[];
  regularStandings: StandingsRow[];
  playoffTeamData: TeamData[];
  playoffStandings: StandingsRow[];
  teamRegistry: TeamRegistry[];
}

type ViewMode = "grid" | "stats";

export default function TeamsPageClient({
  teams,
  regularTeamData,
  regularStandings,
  playoffTeamData,
  playoffStandings,
  teamRegistry,
}: TeamsPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <main className="min-h-screen pb-24 pt-32 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-comets-blue/10 to-transparent -z-10" />

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-comets-cyan text-xs font-mono uppercase tracking-widest mb-4">
                <Users size={14} />
                League Roster
              </div>
              <h1 className="font-display text-5xl md:text-7xl uppercase leading-none tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                  {viewMode === "grid" ? "Team Select" : "Team Stats"}
                </span>
              </h1>
            </div>

            {/* View Toggle */}
            <div className="flex justify-center md:justify-end">
              <div className="flex rounded-lg border border-white/10 overflow-hidden bg-surface-dark">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-4 py-2.5 flex items-center gap-2 text-xs font-ui uppercase tracking-wider transition-colors",
                    viewMode === "grid"
                      ? "bg-comets-cyan/20 text-comets-cyan"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Users size={14} />
                  Teams
                </button>
                <button
                  onClick={() => setViewMode("stats")}
                  className={cn(
                    "px-4 py-2.5 flex items-center gap-2 text-xs font-ui uppercase tracking-wider transition-colors",
                    viewMode === "stats"
                      ? "bg-comets-yellow/20 text-comets-yellow"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <BarChart3 size={14} />
                  Stats
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Team Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teams.map((team) => (
                  <TeamSelectCard key={team.code} {...team} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Team Stats Tables */}
              <TeamStatsView
                regularTeamData={regularTeamData}
                regularStandings={regularStandings}
                playoffTeamData={playoffTeamData}
                playoffStandings={playoffStandings}
                teamRegistry={teamRegistry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

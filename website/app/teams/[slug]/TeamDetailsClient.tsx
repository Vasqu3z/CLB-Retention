"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import RetroTable from "@/components/ui/RetroTable";
import VersusCard from "@/components/ui/VersusCard";
import { Team } from "@/config/league";
import { PlayerStats, ScheduleGame, StandingsRow } from "@/lib/sheets";
import { cn } from "@/lib/utils";

interface TeamDetailsClientProps {
  team: Team;
  roster: PlayerStats[];
  schedule: ScheduleGame[];
  standing?: StandingsRow;
}

interface MatchDisplay {
  id: string;
  home: { name: string; code: string; logoColor: string; score?: number };
  away: { name: string; code: string; logoColor: string; score?: number };
  date: string;
  time: string;
  isFinished: boolean;
}

function toCode(name: string) {
  return name.slice(0, 3).toUpperCase();
}

export function TeamDetailsClient({ team, roster, schedule, standing }: TeamDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<"roster" | "schedule">("roster");

  const rows = useMemo(
    () =>
      roster.map((player, idx) => ({
        id: player.name ?? `player-${idx}`,
        name: player.name ?? "Unknown",
        avg: player.avg ?? "-.--",
        hr: Number(player.hr) || 0,
        ops: player.ops ?? "-.--",
        gp: player.gp ?? 0,
      })),
    [roster]
  );

  const matches: MatchDisplay[] = useMemo(() => {
    return schedule.map((game, index) => ({
      id: `${game.week}-${index}`,
      home: {
        name: game.homeTeam,
        code: toCode(game.homeTeam),
        logoColor: game.homeTeam === team.name ? team.primaryColor : "var(--comets-blue)",
        score: game.homeScore,
      },
      away: {
        name: game.awayTeam,
        code: toCode(game.awayTeam),
        logoColor: game.awayTeam === team.name ? team.primaryColor : "var(--comets-blue)",
        score: game.awayScore,
      },
      date: `Week ${game.week}`,
      time: game.played ? "FINAL" : "Scheduled",
      isFinished: game.played,
    }));
  }, [schedule, team]);

  const record = standing ? `${standing.wins}-${standing.losses}` : undefined;

  const rosterColumns = [
    {
      header: "Player",
      cell: (p: (typeof rows)[number]) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-display text-white"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            {p.name[0]}
          </motion.div>
          <span className="font-bold uppercase">{p.name}</span>
        </div>
      ),
    },
    { header: "GP", accessorKey: "gp" as const, className: "text-white/60", sortable: true },
    { header: "AVG", accessorKey: "avg" as const, className: "font-mono text-comets-cyan", sortable: true },
    { header: "HR", accessorKey: "hr" as const, className: "font-mono text-comets-red", sortable: true },
    { header: "OPS", accessorKey: "ops" as const, className: "font-mono text-comets-yellow", sortable: true },
  ];

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="relative h-[50vh] overflow-hidden flex items-end pb-12">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 1 }}
          style={{ background: `linear-gradient(135deg, ${team.primaryColor}, transparent 70%)` }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: `radial-gradient(circle at top right, ${team.primaryColor}40, transparent 60%)` }}
        />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute inset-0 scanlines opacity-5" />

        <div className="container mx-auto px-4 relative z-10 flex items-end gap-8">
          <motion.div
            className="w-32 h-32 md:w-48 md:h-48 bg-surface-dark border-4 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden"
            style={{ borderColor: team.primaryColor }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
            whileHover={{ scale: 1.05, rotate: 3, boxShadow: `0 0 40px ${team.primaryColor}80` }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: `radial-gradient(circle, ${team.primaryColor}40, transparent)` }}
            />
            <div className="font-display text-8xl relative z-10" style={{ color: team.primaryColor }}>
              {toCode(team.name)[0]}
            </div>
          </motion.div>

          <motion.div
            className="mb-4 flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <motion.span
                className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono uppercase tracking-widest border border-white/5 backdrop-blur-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                Active Roster
              </motion.span>

              {record && (
                <motion.div
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-comets-yellow/20 border border-comets-yellow/30 backdrop-blur-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <span className="text-comets-yellow font-bold text-xs uppercase tracking-wide">
                    Record {record}
                  </span>
                </motion.div>
              )}
            </div>

            <div className="font-display text-4xl md:text-5xl text-white uppercase leading-tight mb-2">
              {team.name}
            </div>
            <div className="font-ui text-white/60 uppercase tracking-widest">{team.shortName}</div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10">
        <div className="flex items-center gap-4 mb-6">
          {[{ key: "roster", label: "Roster" }, { key: "schedule", label: "Schedule" }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "roster" | "schedule")}
              className={cn(
                "px-4 py-2 rounded-full font-ui uppercase tracking-widest text-sm border transition-all focus-arcade",
                activeTab === tab.key
                  ? "bg-comets-yellow text-black border-comets-yellow"
                  : "border-white/10 text-white/70 hover:text-white hover:border-white/30"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "roster" ? (
          <RetroTable data={rows} columns={rosterColumns} />
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <VersusCard key={match.id} {...match} />
            ))}
            {matches.length === 0 && (
              <div className="text-white/50 font-ui uppercase tracking-widest">No games found.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

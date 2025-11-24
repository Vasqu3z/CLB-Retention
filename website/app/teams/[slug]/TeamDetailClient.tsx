"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Calendar, Activity, Trophy, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import RetroTable from "@/components/ui/RetroTable";
import VersusCard from "@/components/ui/VersusCard";
import StatHighlight from "@/components/ui/StatHighlight";
import { cn } from "@/lib/utils";

interface PlayerRow {
  id: string;
  name: string;
  position: string;
  avg: string;
  hr: number;
  ops: string;
}

interface TeamSummary {
  name: string;
  code: string;
  logoColor: string;
  record: string;
  standing?: string;
  streak?: string;
}

interface Matchup {
  id: string;
  home: { name: string; code: string; logoColor: string; score?: number };
  away: { name: string; code: string; logoColor: string; score?: number };
  date: string;
  time: string;
  isFinished: boolean;
}

interface TeamDetailClientProps {
  team: TeamSummary;
  roster: PlayerRow[];
  schedule: Matchup[];
}

export default function TeamDetailClient({ team, roster, schedule }: TeamDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"roster" | "schedule" | "stats">("roster");

  const streakIsWin = team.streak?.startsWith("W");

  const rosterColumns = [
    {
      header: "Player",
      cell: (p: PlayerRow) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-display text-white"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            {p.name[0]}
          </motion.div>
          <Link href={`/players/${p.id}`} className="font-bold hover:text-comets-yellow transition-colors uppercase">
            {p.name}
          </Link>
        </div>
      )
    },
    { header: "Pos", accessorKey: "position" as keyof PlayerRow, className: "text-white/50" },
    { header: "AVG", accessorKey: "avg" as keyof PlayerRow, className: "font-mono text-comets-cyan", sortable: true },
    { header: "HR", accessorKey: "hr" as keyof PlayerRow, className: "font-mono text-comets-red", sortable: true },
    { header: "OPS", accessorKey: "ops" as keyof PlayerRow, className: "font-mono text-white font-bold", sortable: true },
  ];

  return (
    <main className="min-h-screen bg-background pb-24">

      {/* ENHANCED: Team Header (Locker Room Banner) */}
      <div className="relative h-[50vh] overflow-hidden flex items-end pb-12">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 1 }}
          style={{
            background: `linear-gradient(135deg, ${team.logoColor}, transparent 70%)`,
          }}
        />

        {/* Pulsing secondary gradient */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(circle at top right, ${team.logoColor}40, transparent 60%)`,
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-5" />

        <div className="container mx-auto px-4 relative z-10 flex items-end gap-8">
          {/* ENHANCED: Animated Logo */}
          <motion.div
            className="w-32 h-32 md:w-48 md:h-48 bg-surface-dark border-4 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden"
            style={{ borderColor: team.logoColor }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
            whileHover={{
              scale: 1.05,
              rotate: 3,
              boxShadow: `0 0 40px ${team.logoColor}80`
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              style={{
                background: `radial-gradient(circle, ${team.logoColor}40, transparent)`
              }}
            />
            <div className="font-display text-8xl relative z-10" style={{ color: team.logoColor }}>
              {team.code[0]}
            </div>
          </motion.div>

          {/* Team Info */}
          <motion.div
            className="mb-4 flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Badges Row */}
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <motion.span
                className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono uppercase tracking-widest border border-white/5 backdrop-blur-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                Season 6
              </motion.span>

              <motion.div
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-comets-yellow/20 border border-comets-yellow/30 backdrop-blur-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Trophy size={14} className="text-comets-yellow" />
                <span className="text-comets-yellow font-bold text-xs uppercase tracking-wide">
                  {team.standing ?? "Pending"}
                </span>
              </motion.div>

              {/* Streak Badge */}
              <motion.div
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full border backdrop-blur-sm",
                  streakIsWin === true
                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                    : streakIsWin === false
                      ? "bg-red-500/20 border-red-500/30 text-red-400"
                      : "bg-white/10 border-white/20 text-white/70"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <Activity size={14} />
                <span className="text-xs font-mono uppercase tracking-wide">{team.streak ?? "N/A"}</span>
              </motion.div>
            </div>

            <h1 className="font-display text-6xl text-white uppercase leading-none mb-2">
              {team.name}
            </h1>
            <p className="text-white/50 font-ui uppercase tracking-widest text-sm">{team.code}</p>

            {/* Record */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-comets-yellow/20 border border-comets-yellow/30 flex items-center justify-center">
                    <Users size={18} className="text-comets-yellow" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-widest">Record</div>
                    <div className="text-white font-display text-2xl">{team.record}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-comets-cyan/20 border border-comets-cyan/30 flex items-center justify-center">
                    <Calendar size={18} className="text-comets-cyan" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-widest">Next Game</div>
                    <div className="text-white font-display text-xl">{schedule[0]?.date ?? "TBD"}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-comets-purple/20 border border-comets-purple/30 flex items-center justify-center">
                    <TrendingUp size={18} className="text-comets-purple" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs uppercase tracking-widest">Momentum</div>
                    <div className="text-white font-display text-xl">{team.streak ?? "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-12 space-y-8">

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatHighlight
            label="Team Identity"
            value={team.name}
            subtext={team.code}
            glowColor={team.logoColor}
          />
          <StatHighlight
            label="Current Standing"
            value={team.standing ?? "Pending"}
            subtext={team.record}
            glowColor="#00F3FF"
          />
          <StatHighlight
            label="Momentum"
            value={team.streak ?? "N/A"}
            subtext="Recent Form"
            glowColor="#F5B700"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 bg-surface-dark border border-white/10 rounded-lg p-2">
          {["roster", "schedule", "stats"].map(tab => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "relative px-4 py-2 rounded-md font-ui uppercase tracking-widest text-sm transition-all focus-arcade",
                activeTab === tab
                  ? "text-black"
                  : "text-white/60 hover:text-white"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-comets-yellow rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 capitalize">{tab}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-surface-dark border border-white/10 rounded-lg p-6">
          {activeTab === "roster" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Roster Depth</div>
                  <h2 className="font-display text-3xl text-white">Active Players</h2>
                </div>
                <motion.button
                  className="px-4 py-2 bg-comets-cyan/10 border border-comets-cyan/30 rounded-md text-comets-cyan font-mono text-xs uppercase tracking-widest"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Export CSV
                </motion.button>
              </div>

              <RetroTable
                data={roster}
                columns={rosterColumns}
              />
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-comets-cyan" />
                <div>
                  <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Upcoming & Recent</div>
                  <h2 className="font-display text-3xl text-white">Schedule</h2>
                </div>
              </div>

              <div className="space-y-4">
                {schedule.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <VersusCard
                      home={match.home}
                      away={match.away}
                      date={match.date}
                      time={match.time}
                      isFinished={match.isFinished}
                    />
                  </motion.div>
                ))}
                {schedule.length === 0 && (
                  <div className="text-white/60 font-ui text-sm">Schedule will appear here once games are scheduled.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map((item) => (
                <motion.div
                  key={item}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item * 0.05 }}
                >
                  <div className="w-10 h-10 rounded-full bg-comets-purple/20 border border-comets-purple/30 flex items-center justify-center">
                    <Award size={18} className="text-comets-purple" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/40">Team Metric</div>
                    <div className="text-white font-display text-2xl">Live data coming soon</div>
                    <div className="text-white/40 text-sm">Hook into Sheets metrics to populate these cards.</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

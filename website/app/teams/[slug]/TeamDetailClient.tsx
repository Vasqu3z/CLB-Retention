"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Calendar, Activity, Trophy, TrendingUp } from "lucide-react";
import RetroTable from "@/components/ui/RetroTable";
import VersusCard from "@/components/ui/VersusCard";
import StatsTooltip from "@/components/ui/StatsTooltip";
import { StatsToggle } from "@/components/ui/RetroSegmentedControl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PlayerStats } from "@/lib/sheets";

interface Matchup {
  id: string;
  home: { name: string; code: string; logoColor: string; logoUrl?: string; score?: number };
  away: { name: string; code: string; logoColor: string; logoUrl?: string; score?: number };
  date: string;
  time: string;
  isFinished: boolean;
}

interface TeamStats {
  gp: number;
  wins: number;
  losses: number;
  hitting: {
    ab: number;
    h: number;
    hr: number;
    rbi: number;
    bb: number;
    k: number;
    rob: number;
    dp: number;
    tb: number;
  };
  pitching: {
    ip: number;
    bf: number;
    h: number;
    hr: number;
    r: number;
    bb: number;
    k: number;
    sv: number;
  };
  fielding: {
    np: number;
    e: number;
    sb: number;
    cs: number;
  };
}

interface TeamDetailClientProps {
  teamName: string;
  teamCode: string;
  logoColor: string;
  logoUrl: string;
  emblemUrl: string;
  rank: number;
  wins: number;
  losses: number;
  streak: string;
  roster: PlayerStats[];
  schedule: Matchup[];
  stats: TeamStats | null;
}

export default function TeamDetailClient({
  teamName,
  teamCode,
  logoColor,
  logoUrl,
  emblemUrl,
  rank,
  wins,
  losses,
  streak,
  roster,
  schedule,
  stats,
}: TeamDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"roster" | "schedule" | "stats">("roster");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const record = `${wins}-${losses}`;
  const standing = `${rank}${getRankSuffix(rank)}`;

  // Add IDs to roster for RetroTable
  const rosterWithIds = roster.map((player, idx) => ({
    ...player,
    id: `${player.name}-${idx}`,
  }));

  // Roster Table Configuration
  const rosterColumns = [
    {
      header: "Player",
      cell: (p: PlayerStats & { id: string }) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-display text-white"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            {p.name[0]}
          </motion.div>
          <span className="font-bold hover:text-comets-yellow transition-colors uppercase">
            {p.name}
          </span>
        </div>
      ),
    },
    { header: <StatsTooltip stat="GP">GP</StatsTooltip>, accessorKey: "gp" as const, className: "text-white/50", condensed: true },
    { header: <StatsTooltip stat="AVG" context="batting">AVG</StatsTooltip>, accessorKey: "avg" as const, className: "font-mono text-comets-cyan", sortable: true },
    { header: <StatsTooltip stat="HR" context="batting">HR</StatsTooltip>, accessorKey: "hr" as const, className: "font-mono text-comets-red", sortable: true },
    { header: <StatsTooltip stat="OPS" context="batting">OPS</StatsTooltip>, accessorKey: "ops" as const, className: "font-mono text-white font-bold", sortable: true },
  ];

  // Calculate team stats
  const teamAvg = stats && stats.hitting.ab > 0 ? (stats.hitting.h / stats.hitting.ab).toFixed(3) : ".000";
  const teamERA = stats && stats.pitching.ip > 0 ? ((stats.pitching.r * 9) / stats.pitching.ip).toFixed(2) : "0.00";
  const teamOPS = stats && stats.hitting.ab > 0
    ? calculateOPS(stats.hitting.h, stats.hitting.ab, stats.hitting.bb, stats.hitting.tb)
    : "0.000";

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Team Header (Locker Room Banner) */}
      <div className="relative h-[50vh] overflow-hidden flex items-end pb-12">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 1 }}
          style={{
            background: `linear-gradient(135deg, ${logoColor}, transparent 70%)`,
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
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle at top right, ${logoColor}40, transparent 60%)`,
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-5" />

        <div className="container mx-auto px-4 relative z-10 flex items-end gap-8">
          {/* Animated Logo */}
          <motion.div
            className="w-32 h-32 md:w-48 md:h-48 bg-surface-dark border-4 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden p-4"
            style={{ borderColor: logoColor }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
            whileHover={{
              scale: 1.05,
              rotate: 3,
              boxShadow: `0 0 40px ${logoColor}80`,
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
                background: `radial-gradient(circle, ${logoColor}40, transparent)`,
              }}
            />
            {/* Team Logo */}
            {emblemUrl ? (
              <Image
                src={emblemUrl}
                alt={`${teamName} logo`}
                width={192}
                height={192}
                className="relative z-10 w-full h-full object-contain"
                priority
              />
            ) : (
              <div className="font-display text-8xl relative z-10" style={{ color: logoColor }}>
                {teamCode[0]}
              </div>
            )}
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
                  {standing} Place
                </span>
              </motion.div>

              {/* Streak Badge */}
              <motion.div
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full border backdrop-blur-sm",
                  streak.startsWith("W")
                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                    : "bg-red-500/20 border-red-500/30 text-red-400"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <TrendingUp size={14} />
                <span className="font-bold text-xs uppercase tracking-wide">{streak}</span>
              </motion.div>
            </div>

            {/* Team Name */}
            <motion.h1
              className="font-display text-5xl md:text-7xl text-white uppercase leading-none tracking-tight mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {teamName}
            </motion.h1>

            {/* Record */}
            <motion.div
              className="text-xl text-white/60 font-ui tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Record: <span className="text-white font-bold">{record}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: logoColor,
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          {[
            { id: "roster", label: "Active Roster", icon: Users },
            { id: "schedule", label: "Season Schedule", icon: Calendar },
            { id: "stats", label: "Team Stats", icon: Activity },
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative px-6 py-3 rounded-t-lg font-ui uppercase tracking-widest text-sm flex items-center gap-2 border-t border-x transition-all whitespace-nowrap focus-arcade",
                activeTab === tab.id
                  ? "bg-background border-white/20 text-white"
                  : "bg-surface-dark border-transparent text-white/40 hover:text-white hover:bg-surface-light"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <tab.icon size={16} />
              {tab.label}

              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-comets-yellow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
          <div className="flex-1 border-b border-white/20 translate-y-[1px]" />
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Roster Tab */}
          {activeTab === "roster" && (
            <motion.div
              key="roster"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-2xl text-white">Team Roster</h3>
                <div className="flex items-center gap-4">
                  <div className="text-xs font-mono text-white/40">
                    {roster.length} {roster.length === 1 ? "PLAYER" : "PLAYERS"}
                  </div>
                  <StatsToggle showAdvanced={showAdvanced} onChange={setShowAdvanced} size="sm" />
                </div>
              </div>
              <RetroTable data={rosterWithIds} columns={rosterColumns} showAdvanced={showAdvanced} />
            </motion.div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {schedule.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <VersusCard {...match} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && stats && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hitting Stats */}
                <StatCard title="Team Hitting" color={logoColor}>
                  <StatRow label={<StatsTooltip stat="AVG" context="batting">AVG</StatsTooltip>} value={teamAvg} />
                  <StatRow label={<StatsTooltip stat="HR" context="batting">HR</StatsTooltip>} value={stats.hitting.hr} />
                  <StatRow label={<StatsTooltip stat="RBI" context="batting">RBI</StatsTooltip>} value={stats.hitting.rbi} />
                  <StatRow label={<StatsTooltip stat="OPS" context="batting">OPS</StatsTooltip>} value={teamOPS} />
                </StatCard>

                {/* Pitching Stats */}
                <StatCard title="Team Pitching" color={logoColor}>
                  <StatRow label={<StatsTooltip stat="ERA" context="pitching">ERA</StatsTooltip>} value={teamERA} />
                  <StatRow label={<StatsTooltip stat="IP" context="pitching">IP</StatsTooltip>} value={stats.pitching.ip.toFixed(1)} />
                  <StatRow label={<StatsTooltip stat="K" context="pitching">K</StatsTooltip>} value={stats.pitching.k} />
                  <StatRow label={<StatsTooltip stat="SV" context="pitching">SV</StatsTooltip>} value={stats.pitching.sv} />
                </StatCard>

                {/* Fielding Stats */}
                <StatCard title="Team Fielding" color={logoColor}>
                  <StatRow label={<StatsTooltip stat="NP" context="fielding">NP</StatsTooltip>} value={stats.fielding.np} />
                  <StatRow label={<StatsTooltip stat="E" context="fielding">E</StatsTooltip>} value={stats.fielding.e} />
                  <StatRow label={<StatsTooltip stat="SB" context="batting">SB</StatsTooltip>} value={stats.fielding.sb} />
                  <StatRow label="CS" value={stats.fielding.cs} />
                </StatCard>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

// Helper components
function StatCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-dark border border-white/10 rounded-lg p-6 hover:border-white/30 transition-colors">
      <h4 className="font-display text-lg uppercase text-white mb-4 pb-2 border-b border-white/10" style={{ borderColor: `${color}40` }}>
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: React.ReactNode; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/60 text-sm font-mono uppercase">{label}</span>
      <span className="text-white font-mono font-bold text-lg">{value}</span>
    </div>
  );
}

function getRankSuffix(rank: number): string {
  if (rank === 1) return "st";
  if (rank === 2) return "nd";
  if (rank === 3) return "rd";
  return "th";
}

function calculateOPS(h: number, ab: number, bb: number, tb: number): string {
  if (ab === 0) return "0.000";
  const obp = (h + bb) / (ab + bb);
  const slg = tb / ab;
  return (obp + slg).toFixed(3);
}

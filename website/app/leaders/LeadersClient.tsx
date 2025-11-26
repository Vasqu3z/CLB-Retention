"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import RetroTabs from "@/components/ui/RetroTabs";
import StatsTooltip from "@/components/ui/StatsTooltip";
import { SeasonToggle } from "@/components/ui/RetroSegmentedControl";
import { LeaderEntry } from "@/lib/sheets";

interface LeadersData {
  avg: LeaderEntry[];
  hits: LeaderEntry[];
  hr: LeaderEntry[];
  rbi: LeaderEntry[];
  slg: LeaderEntry[];
  ops: LeaderEntry[];
  ip: LeaderEntry[];
  wins: LeaderEntry[];
  losses: LeaderEntry[];
  saves: LeaderEntry[];
  era: LeaderEntry[];
  whip: LeaderEntry[];
  baa: LeaderEntry[];
}

interface LeadersClientProps {
  regularBattingLeaders: any;
  regularPitchingLeaders: any;
  playoffBattingLeaders: any;
  playoffPitchingLeaders: any;
}

interface LeaderEntryDisplay {
  rank: number;
  name: string;
  team: string;
  value: string;
  color: string;
}

function LeaderPodium({
  leaders,
  statName,
  statKey,
  context,
  icon: Icon,
}: {
  leaders: LeaderEntry[];
  statName: string;
  statKey: string;
  context: "batting" | "pitching";
  icon: any;
}) {
  // Convert LeaderEntry[] to display format with team colors
  const displayLeaders = leaders.slice(0, 3).map((leader, idx) => ({
    rank: parseInt(leader.rank.replace("T-", "")) || idx + 1,
    name: leader.player,
    team: leader.team,
    value: leader.value,
    color: getTeamColor(leader.team),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Card container */}
      <div className="relative bg-surface-dark border border-white/10 rounded-lg overflow-hidden p-8 hover:border-white/30 transition-colors duration-300">
        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

        {/* Stat header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 bg-comets-cyan/10 rounded-lg"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            >
              <Icon className="text-comets-cyan" size={24} />
            </motion.div>
            <h3 className="font-display text-2xl uppercase text-white tracking-tight">
              <StatsTooltip stat={statKey.toUpperCase()} context={context}>
                {statName}
              </StatsTooltip>
            </h3>
          </div>
          <div className="font-mono text-xs text-white/40 uppercase tracking-widest">TOP 3</div>
        </div>

        {/* Leader entries */}
        <div className="space-y-3">
          {displayLeaders.map((leader, idx) => (
            <motion.div
              key={leader.name + idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="relative group/item"
            >
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-comets-cyan/50 transition-all duration-200 cursor-pointer">
                {/* Rank badge */}
                <motion.div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display text-xl font-bold",
                    idx === 0 && "bg-comets-yellow text-black",
                    idx === 1 && "bg-white/20 text-white",
                    idx === 2 && "bg-white/10 text-white/80"
                  )}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                >
                  {leader.rank}
                </motion.div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="font-ui text-white font-bold uppercase tracking-wider text-lg truncate">
                    {leader.name}
                  </div>
                  <div
                    className="font-mono text-xs uppercase tracking-widest truncate"
                    style={{ color: leader.color }}
                  >
                    {leader.team}
                  </div>
                </div>

                {/* Value display */}
                <motion.div
                  className="flex-shrink-0 px-6 py-2 bg-comets-cyan/20 border border-comets-cyan/50 rounded-full"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 243, 255, 0.3)" }}
                >
                  <span className="font-mono text-comets-cyan font-bold text-xl">{leader.value}</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Helper to get team color (simplified - could be enhanced with team registry)
function getTeamColor(teamName: string): string {
  const colors: Record<string, string> = {
    Fireballs: "#FF4D4D",
    Knights: "#2ECC71",
    Monarchs: "#FF69B4",
    Monsters: "#F4D03F",
    Wilds: "#8D6E63",
    Muscles: "#F1C40F",
    Eggs: "#2E86DE",
    Spitballs: "#9B59B6",
    Bows: "#E91E63",
    Spirits: "#9C27B0",
  };
  return colors[teamName] || "#FFFFFF";
}

export default function LeadersClient({
  regularBattingLeaders,
  regularPitchingLeaders,
  playoffBattingLeaders,
  playoffPitchingLeaders,
}: LeadersClientProps) {
  const [category, setCategory] = useState<"batting" | "pitching">("batting");
  const [isPlayoffs, setIsPlayoffs] = useState(false);

  const battingLeaders = isPlayoffs ? playoffBattingLeaders : regularBattingLeaders;
  const pitchingLeaders = isPlayoffs ? playoffPitchingLeaders : regularPitchingLeaders;

  const stats =
    category === "batting"
      ? [
          { key: "avg", name: "Batting Average", icon: Target, data: battingLeaders.avg },
          { key: "hr", name: "Home Runs", icon: Zap, data: battingLeaders.hr },
          { key: "rbi", name: "Runs Batted In", icon: TrendingUp, data: battingLeaders.rbi },
          { key: "ops", name: "On-Base Plus Slugging", icon: Trophy, data: battingLeaders.ops },
        ]
      : [
          { key: "era", name: "Earned Run Avg", icon: Target, data: pitchingLeaders.era },
          { key: "w", name: "Wins", icon: Trophy, data: pitchingLeaders.wins },
          { key: "sv", name: "Saves", icon: Zap, data: pitchingLeaders.saves },
          { key: "whip", name: "WHIP", icon: TrendingUp, data: pitchingLeaders.whip },
        ];

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      {/* Cosmic background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-comets-cyan/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-comets-yellow/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              className="inline-flex items-center gap-2 text-comets-yellow mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Trophy size={24} />
              <span className="font-ui uppercase tracking-[0.3em] text-sm">Statistical Leaders</span>
            </motion.div>

            <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                League
                <br />
                Leaders
              </span>
            </h1>
          </motion.div>

          {/* Season Toggle */}
          <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
        </div>

        {/* Category toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <RetroTabs
            tabs={[
              { value: "batting", label: "Batting", color: "yellow" },
              { value: "pitching", label: "Pitching", color: "cyan" },
            ]}
            value={category}
            onChange={(val) => setCategory(val as "batting" | "pitching")}
          />
        </motion.div>

        {/* Leaders grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category + (isPlayoffs ? "-playoffs" : "-regular")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <LeaderPodium
                  leaders={stat.data}
                  statName={stat.name}
                  statKey={stat.key}
                  context={category}
                  icon={stat.icon}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

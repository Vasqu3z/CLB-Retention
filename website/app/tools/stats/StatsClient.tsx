"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Activity, Shield, Users } from "lucide-react";
import RetroTabs from "@/components/ui/RetroTabs";
import { SeasonToggle } from "@/components/ui/RetroSegmentedControl";
import RetroPlayerSelector, { type PlayerOption } from "@/components/ui/RetroPlayerSelector";
import RetroComparisonBar from "@/components/ui/RetroComparisonBar";

/**
 * Full player stats from Google Sheets
 */
interface PlayerStats {
  id: string;
  name: string;
  team: string;
  color: string;
  stats: {
    batting: {
      gp: number;
      ab: number;
      h: number;
      hr: number;
      rbi: number;
      rob: number;
      dp: number;
      sb: number;
      avg: string;
      obp: string;
      slg: string;
      ops: string;
    };
    pitching: {
      ip: number;
      w: number;
      l: number;
      sv: number;
      hAllowed: number;
      hrAllowed: number;
      era: string;
      whip: string;
      baa: string;
    };
    fielding: {
      np: number;
      e: number;
      oaa: number;
      cs: number;
    };
  };
}

interface StatsClientProps {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
}

type StatCategory = "batting" | "pitching" | "fielding";

interface StatConfig {
  key: string;
  label: string;
  name: string;
  isRate?: boolean;
  lowerIsBetter?: boolean;
}

// Stat definitions by category
const BATTING_STATS: StatConfig[] = [
  { key: "gp", label: "GP", name: "Games Played" },
  { key: "ab", label: "AB", name: "At Bats" },
  { key: "h", label: "H", name: "Hits" },
  { key: "hr", label: "HR", name: "Home Runs" },
  { key: "rbi", label: "RBI", name: "Runs Batted In" },
  { key: "sb", label: "SB", name: "Stolen Bases" },
  { key: "rob", label: "ROB", name: "Hits Robbed" },
  { key: "dp", label: "DP", name: "Double Plays" },
  { key: "avg", label: "AVG", name: "Batting Average", isRate: true },
  { key: "obp", label: "OBP", name: "On-Base Percentage", isRate: true },
  { key: "slg", label: "SLG", name: "Slugging", isRate: true },
  { key: "ops", label: "OPS", name: "OPS", isRate: true },
];

const PITCHING_STATS: StatConfig[] = [
  { key: "ip", label: "IP", name: "Innings Pitched" },
  { key: "w", label: "W", name: "Wins" },
  { key: "l", label: "L", name: "Losses", lowerIsBetter: true },
  { key: "sv", label: "SV", name: "Saves" },
  { key: "hAllowed", label: "H", name: "Hits Allowed", lowerIsBetter: true },
  { key: "hrAllowed", label: "HR", name: "Home Runs Allowed", lowerIsBetter: true },
  { key: "era", label: "ERA", name: "Earned Run Average", isRate: true, lowerIsBetter: true },
  { key: "whip", label: "WHIP", name: "WHIP", isRate: true, lowerIsBetter: true },
  { key: "baa", label: "BAA", name: "Batting Avg Against", isRate: true, lowerIsBetter: true },
];

const FIELDING_STATS: StatConfig[] = [
  { key: "np", label: "NP", name: "Nice Plays" },
  { key: "e", label: "E", name: "Errors", lowerIsBetter: true },
  { key: "oaa", label: "OAA", name: "Outs Above Average" },
  { key: "cs", label: "CS", name: "Caught Stealing" },
];

export default function StatsClient({ regularPlayers, playoffPlayers }: StatsClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<StatCategory>("batting");

  // Get active player list based on season
  const activePlayers = isPlayoffs ? playoffPlayers : regularPlayers;

  // Build player options from active season
  const playerOptions: PlayerOption[] = useMemo(() => {
    return activePlayers.map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team,
      color: p.color,
    }));
  }, [activePlayers]);

  // Get selected player data
  const selectedPlayers = useMemo(() => {
    return selectedIds
      .map((id) => activePlayers.find((p) => p.id === id))
      .filter(Boolean) as PlayerStats[];
  }, [selectedIds, activePlayers]);

  // Filter out players not in current season when switching
  const handleSeasonChange = (playoffs: boolean) => {
    setIsPlayoffs(playoffs);
    const newPlayers = playoffs ? playoffPlayers : regularPlayers;
    const newPlayerIds = new Set(newPlayers.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => newPlayerIds.has(id)));
  };

  // Get current stats config
  const getStatsConfig = () => {
    switch (activeTab) {
      case "batting":
        return BATTING_STATS;
      case "pitching":
        return PITCHING_STATS;
      case "fielding":
        return FIELDING_STATS;
      default:
        return BATTING_STATS;
    }
  };

  const tabs = [
    { value: "batting", label: "Batting", icon: TrendingUp, color: "red" as const },
    { value: "pitching", label: "Pitching", icon: Activity, color: "yellow" as const },
    { value: "fielding", label: "Fielding", icon: Shield, color: "cyan" as const },
  ];

  return (
    <main className="min-h-screen pb-24 pt-28 px-4">
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 right-1/4 w-[650px] h-[650px] bg-comets-cyan/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] bg-comets-red/10 blur-[100px] rounded-full animate-pulse-slow" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 text-comets-cyan mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <BarChart3 size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">
              Statistical Analysis
            </span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              Stats
              <br />
              Comparison
            </span>
          </h1>

          <p className="font-mono text-white/40 text-sm">
            Compare 2-5 players side-by-side for hitting, pitching, and fielding
          </p>
        </motion.div>

        {/* Season Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 flex justify-center"
        >
          <SeasonToggle
            isPlayoffs={isPlayoffs}
            onChange={handleSeasonChange}
            size="lg"
          />
        </motion.div>

        {/* Player Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <RetroPlayerSelector
            players={playerOptions}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            maxSelections={5}
            placeholder={`Search ${isPlayoffs ? "playoff" : "regular season"} players...`}
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <RetroTabs
            tabs={tabs}
            value={activeTab}
            onChange={(val) => setActiveTab(val as StatCategory)}
          />
        </motion.div>

        {/* Stats Comparison Content */}
        <AnimatePresence mode="wait">
          {selectedPlayers.length >= 2 ? (
            <motion.div
              key={`${activeTab}-${isPlayoffs}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor:
                      activeTab === "batting"
                        ? "rgba(255, 77, 77, 0.2)"
                        : activeTab === "pitching"
                        ? "rgba(244, 208, 63, 0.2)"
                        : "rgba(0, 243, 255, 0.2)",
                  }}
                >
                  {activeTab === "batting" && <TrendingUp className="text-comets-red" size={20} />}
                  {activeTab === "pitching" && <Activity className="text-comets-yellow" size={20} />}
                  {activeTab === "fielding" && <Shield className="text-comets-cyan" size={20} />}
                </div>
                <h2 className="font-display text-2xl uppercase text-white tracking-tight">
                  {activeTab === "batting" && "Hitting Statistics"}
                  {activeTab === "pitching" && "Pitching Statistics"}
                  {activeTab === "fielding" && "Fielding & Running"}
                </h2>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getStatsConfig().map((stat, idx) => (
                  <RetroComparisonBar
                    key={stat.key}
                    statName={stat.name}
                    statKey={stat.label}
                    lowerIsBetter={stat.lowerIsBetter}
                    delay={0.1 + idx * 0.03}
                    players={selectedPlayers.map((p) => {
                      const categoryStats = p.stats[activeTab];
                      const value = categoryStats[stat.key as keyof typeof categoryStats];
                      return {
                        id: p.id,
                        name: p.name,
                        color: p.color,
                        value: value,
                      };
                    })}
                    formatValue={(v) => {
                      if (stat.isRate) return String(v);
                      if (typeof v === "number") {
                        return stat.key === "ip" ? v.toFixed(1) : String(v);
                      }
                      return String(v);
                    }}
                  />
                ))}
              </div>

              {/* Summary Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative bg-surface-dark border border-white/10 rounded-lg overflow-hidden mt-8"
              >
                <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

                <div
                  className="px-4 py-3 border-b border-white/10"
                  style={{
                    background:
                      activeTab === "batting"
                        ? "linear-gradient(90deg, rgba(255,77,77,0.2), transparent)"
                        : activeTab === "pitching"
                        ? "linear-gradient(90deg, rgba(244,208,63,0.2), transparent)"
                        : "linear-gradient(90deg, rgba(0,243,255,0.2), transparent)",
                  }}
                >
                  <h3 className="font-display text-lg uppercase text-white tracking-tight">
                    Full Comparison Table
                  </h3>
                </div>

                <div data-lenis-prevent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left font-ui text-xs uppercase tracking-widest text-white/40 bg-white/5 sticky left-0">
                          Stat
                        </th>
                        {selectedPlayers.map((player) => (
                          <th
                            key={player.id}
                            className="px-4 py-3 text-center font-ui text-xs uppercase tracking-widest min-w-[100px]"
                            style={{ color: player.color }}
                          >
                            {player.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                      {getStatsConfig().map((stat) => {
                        const values = selectedPlayers.map((p) => {
                          const categoryStats = p.stats[activeTab];
                          return categoryStats[stat.key as keyof typeof categoryStats];
                        });

                        // Find best value
                        const numericValues = values.map((v) =>
                          typeof v === "string" ? parseFloat(v) : v
                        );
                        const validValues = numericValues.filter((v) => v > 0);
                        const bestValue = validValues.length > 0
                          ? (stat.lowerIsBetter ? Math.min(...validValues) : Math.max(...validValues))
                          : null;

                        return (
                          <tr
                            key={stat.key}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-2 text-white/60 bg-white/5 sticky left-0">
                              {stat.label}
                              <span className="ml-2 text-white/30 text-xs hidden md:inline">
                                {stat.name}
                              </span>
                            </td>
                            {selectedPlayers.map((player, idx) => {
                              const value = values[idx];
                              const numValue =
                                typeof value === "string" ? parseFloat(value) : value;
                              const isBest = bestValue !== null && numValue === bestValue && numValue > 0;

                              return (
                                <td
                                  key={player.id}
                                  className={`px-4 py-2 text-center ${
                                    isBest
                                      ? "text-comets-cyan font-bold"
                                      : "text-white/80"
                                  }`}
                                  style={
                                    isBest
                                      ? { textShadow: `0 0 10px ${player.color}` }
                                      : {}
                                  }
                                >
                                  {stat.key === "ip" && typeof value === "number"
                                    ? (value as number).toFixed(1)
                                    : (value ?? "-")}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            // Empty state
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center py-20"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-comets-cyan/20 blur-3xl rounded-full"
                />
                <Users size={64} className="text-white/20 relative" />
              </div>
              <h3 className="mt-6 font-display text-2xl uppercase text-white/40">
                Select Players to Compare
              </h3>
              <p className="mt-2 font-mono text-sm text-white/20">
                Choose at least 2 players using the search above
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

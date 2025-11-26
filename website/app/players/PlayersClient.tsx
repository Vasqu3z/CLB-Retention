"use client";

import React, { useState, useMemo } from "react";
import RetroTable from "@/components/ui/RetroTable";
import { Search, SlidersHorizontal, X, TrendingUp, Filter, Target, Flame, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SeasonToggle } from "@/components/ui/RetroSegmentedControl";
import RetroEmptyState from "@/components/ui/RetroEmptyState";
import StatsTooltip from "@/components/ui/StatsTooltip";
import RetroTabs from "@/components/ui/RetroTabs";
import { PlayerStats } from "@/lib/sheets";

type Tab = "hitting" | "pitching" | "fielding";

interface PlayersClientProps {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
}

const TEAMS = ["All Teams", "Fireballs", "Monsters", "Monarchs", "Eggs", "Muscles", "Knights", "Wilds"];

export default function PlayersClient({ regularPlayers, playoffPlayers }: PlayersClientProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("hitting");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [showFilters, setShowFilters] = useState(false);

  // Use appropriate data based on toggle
  const players = isPlayoffs ? playoffPlayers : regularPlayers;

  // Filter players by search and team
  const filteredPlayers = useMemo(() => {
    let result = players;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.team.toLowerCase().includes(query)
      );
    }

    // Filter by team
    if (selectedTeam !== "All Teams") {
      result = result.filter((p) => p.team === selectedTeam);
    }

    return result;
  }, [players, searchQuery, selectedTeam]);

  // Filter by category
  const displayPlayers = useMemo(() => {
    if (activeTab === "hitting") {
      return filteredPlayers.filter((p) => p.ab && p.ab > 0);
    } else if (activeTab === "pitching") {
      return filteredPlayers.filter((p) => p.ip && p.ip > 0);
    } else {
      return filteredPlayers.filter(
        (p) => (p.np && p.np > 0) || (p.e && p.e > 0) || (p.sb && p.sb > 0)
      );
    }
  }, [filteredPlayers, activeTab]);

  const hasActiveFilters = selectedTeam !== "All Teams" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setSelectedTeam("All Teams");
    setSearchQuery("");
  };

  // Define columns based on active tab
  const hittingColumns = [
    {
      header: "Player",
      cell: (item: PlayerStats) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-surface-light rounded flex items-center justify-center font-display text-white/80"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            {item.name[0]}
          </motion.div>
          <span className="font-bold text-white uppercase tracking-wider">{item.name}</span>
        </div>
      ),
    },
    { header: "Team", accessorKey: "team" as const, className: "text-white/60", sortable: true },
    { header: <StatsTooltip stat="GP">GP</StatsTooltip>, accessorKey: "gp" as const, className: "text-white/40 text-xs", sortable: true },
    {
      header: <StatsTooltip stat="AVG" context="batting">AVG</StatsTooltip>,
      accessorKey: "avg" as const,
      className: "text-comets-cyan font-mono font-bold",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="H" context="batting">H</StatsTooltip>,
      accessorKey: "h" as const,
      className: "text-white/90 font-mono",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="HR" context="batting">HR</StatsTooltip>,
      accessorKey: "hr" as const,
      className: "text-comets-red font-mono font-bold",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="RBI" context="batting">RBI</StatsTooltip>,
      accessorKey: "rbi" as const,
      className: "text-white/90 font-mono",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="OPS" context="batting">OPS</StatsTooltip>,
      accessorKey: "ops" as const,
      className: "text-comets-yellow font-mono font-bold",
      sortable: true,
    },
  ];

  const pitchingColumns = [
    {
      header: "Player",
      cell: (item: PlayerStats) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-surface-light rounded flex items-center justify-center font-display text-white/80"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            {item.name[0]}
          </motion.div>
          <span className="font-bold text-white uppercase tracking-wider">{item.name}</span>
        </div>
      ),
    },
    { header: "Team", accessorKey: "team" as const, className: "text-white/60", sortable: true },
    { header: <StatsTooltip stat="GP">GP</StatsTooltip>, accessorKey: "gp" as const, className: "text-white/40 text-xs", sortable: true },
    {
      header: <StatsTooltip stat="ERA" context="pitching">ERA</StatsTooltip>,
      accessorKey: "era" as const,
      className: "text-comets-cyan font-mono font-bold",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="W" context="pitching">W</StatsTooltip>,
      accessorKey: "w" as const,
      className: "text-green-400 font-mono",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="L" context="pitching">L</StatsTooltip>,
      accessorKey: "l" as const,
      className: "text-red-400 font-mono",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="SV" context="pitching">SV</StatsTooltip>,
      accessorKey: "sv" as const,
      className: "text-comets-yellow font-mono",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="IP" context="pitching">IP</StatsTooltip>,
      accessorKey: "ip" as const,
      className: "text-white/90 font-mono",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="WHIP" context="pitching">WHIP</StatsTooltip>,
      accessorKey: "whip" as const,
      className: "text-comets-purple font-mono",
      sortable: true,
    },
  ];

  const fieldingColumns = [
    {
      header: "Player",
      cell: (item: PlayerStats) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-surface-light rounded flex items-center justify-center font-display text-white/80"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            {item.name[0]}
          </motion.div>
          <span className="font-bold text-white uppercase tracking-wider">{item.name}</span>
        </div>
      ),
    },
    { header: "Team", accessorKey: "team" as const, className: "text-white/60", sortable: true },
    { header: <StatsTooltip stat="GP">GP</StatsTooltip>, accessorKey: "gp" as const, className: "text-white/40 text-xs", sortable: true },
    {
      header: <StatsTooltip stat="NP" context="fielding">NP</StatsTooltip>,
      accessorKey: "np" as const,
      className: "text-comets-cyan font-mono font-bold",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="E" context="fielding">E</StatsTooltip>,
      accessorKey: "e" as const,
      className: "text-red-400 font-mono",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="SB" context="batting">SB</StatsTooltip>,
      accessorKey: "sb" as const,
      className: "text-comets-yellow font-mono",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="OAA" context="fielding">OAA</StatsTooltip>,
      accessorKey: "oaa" as const,
      className: "text-comets-purple font-mono font-bold",
      sortable: true,
    },
  ];

  const columns = activeTab === "hitting" ? hittingColumns : activeTab === "pitching" ? pitchingColumns : fieldingColumns;

  return (
    <main className="min-h-screen bg-background pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-comets-cyan uppercase tracking-widest mb-2">
              Database Access
            </div>
            <h1 className="font-display text-5xl text-white uppercase">Player Registry</h1>

            {/* Player Count Badge */}
            <motion.div
              className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <TrendingUp size={12} className="text-comets-cyan" />
              <span className="text-xs font-mono text-white/60">
                {displayPlayers.length} {displayPlayers.length === 1 ? "Player" : "Players"}
              </span>
            </motion.div>
          </div>

          {/* Season Toggle */}
          <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <RetroTabs
            tabs={[
              { value: "hitting", label: "Hitting", icon: Target, color: "yellow" },
              { value: "pitching", label: "Pitching", icon: Flame, color: "cyan" },
              { value: "fielding", label: "Fielding", icon: Shield, color: "purple" },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as Tab)}
          />
        </div>

        {/* Search & Filter Controls */}
        <div className="flex gap-2 w-full md:w-auto mb-6">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH..."
              className="w-full bg-surface-dark border border-white/10 rounded-sm py-2 pl-10 pr-10 text-white font-mono text-sm focus:border-comets-yellow outline-none uppercase placeholder:text-white/20 transition-colors focus-arcade"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </motion.button>
            )}
          </div>
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "relative px-4 py-2 bg-surface-dark border rounded-sm transition-all focus-arcade",
              showFilters || hasActiveFilters
                ? "border-comets-cyan text-comets-cyan"
                : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal size={18} />
            {hasActiveFilters && (
              <motion.div
                layoutId="filterBadge"
                className="absolute -top-1 -right-1 w-3 h-3 bg-comets-yellow rounded-full border-2 border-background"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
          </motion.button>
        </div>

        {/* ENHANCED: Animated Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-surface-dark border border-white/10 rounded-lg p-6 space-y-4">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-comets-cyan" />
                    <span className="font-ui text-sm uppercase tracking-widest text-white">
                      Filters
                    </span>
                  </div>
                  {hasActiveFilters && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={clearFilters}
                      className="text-xs font-ui uppercase tracking-widest text-comets-red hover:text-red-400 transition-colors flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={12} />
                      Clear All
                    </motion.button>
                  )}
                </div>

                {/* Team Filter Pills */}
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                    Team
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TEAMS.map((team, index) => (
                      <motion.button
                        key={team}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedTeam(team)}
                        className={cn(
                          "relative px-4 py-2 rounded-full font-ui text-sm uppercase tracking-wider transition-all focus-arcade",
                          selectedTeam === team
                            ? "text-black"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {selectedTeam === team && (
                          <motion.div
                            layoutId="activeTeam"
                            className="absolute inset-0 bg-comets-yellow rounded-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10">{team}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Players Table */}
        <RetroTable
          data={displayPlayers}
          columns={columns}
          onRowClick={(p) => console.log("View Player", p.name)}
        />

        {/* Empty State */}
        {displayPlayers.length === 0 && (
          <RetroEmptyState
            title="No Players Found"
            message="Try adjusting your filters"
            icon="search"
            action={
              hasActiveFilters
                ? {
                    label: "Clear Filters",
                    onClick: clearFilters,
                  }
                : undefined
            }
          />
        )}

        {/* Pagination Info */}
        {displayPlayers.length > 0 && (
          <div className="mt-8 flex justify-center gap-2 font-mono text-xs text-white/40">
            <span>
              PAGE 1 OF {Math.ceil(displayPlayers.length / 10)}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

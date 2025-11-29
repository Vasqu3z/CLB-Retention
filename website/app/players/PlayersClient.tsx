"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RetroTable from "@/components/ui/RetroTable";
import { Search, SlidersHorizontal, X, TrendingUp, Filter, Target, Flame, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, playerNameToSlug } from "@/lib/utils";
import { SeasonToggle, StatsToggle } from "@/components/ui/RetroSegmentedControl";
import RetroEmptyState from "@/components/ui/RetroEmptyState";
import StatsTooltip from "@/components/ui/StatsTooltip";
import RetroTabs from "@/components/ui/RetroTabs";
import { PlayerStats } from "@/lib/sheets";

type Tab = "hitting" | "pitching" | "fielding";

interface PlayersClientProps {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
}

export default function PlayersClient({ regularPlayers, playoffPlayers }: PlayersClientProps) {
  // Get unique team names from actual player data
  const TEAMS = useMemo(() => {
    const uniqueTeams = new Set<string>();
    [...regularPlayers, ...playoffPlayers].forEach(p => {
      if (p.team) uniqueTeams.add(p.team);
    });
    return ["All Teams", ...Array.from(uniqueTeams).sort()];
  }, [regularPlayers, playoffPlayers]);
  const router = useRouter();
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("hitting");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // Navigate to player detail page
  const handlePlayerClick = (player: PlayerStats) => {
    router.push(`/players/${playerNameToSlug(player.name)}`);
  };

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

  // Filter by category (all players, for total count)
  const allFilteredPlayers = useMemo(() => {
    let filtered: PlayerStats[];
    if (activeTab === "hitting") {
      filtered = filteredPlayers.filter((p) => p.ab && p.ab > 0);
    } else if (activeTab === "pitching") {
      filtered = filteredPlayers.filter((p) => p.ip && p.ip > 0);
    } else {
      filtered = filteredPlayers.filter(
        (p) => (p.np && p.np > 0) || (p.e && p.e > 0) || (p.sb && p.sb > 0)
      );
    }
    // Add id property for RetroTable compatibility
    return filtered.map((p, idx) => ({ ...p, id: `${p.name}-${idx}` }));
  }, [filteredPlayers, activeTab]);

  // Paginated players for display
  const totalPages = Math.ceil(allFilteredPlayers.length / ITEMS_PER_PAGE);
  const displayPlayers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredPlayers.slice(start, start + ITEMS_PER_PAGE);
  }, [allFilteredPlayers, currentPage, ITEMS_PER_PAGE]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTeam, activeTab, isPlayoffs]);

  const hasActiveFilters = selectedTeam !== "All Teams" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setSelectedTeam("All Teams");
    setSearchQuery("");
  };

  // Define columns based on active tab
  // Default shows: Player, Team, GP, AB, H, HR, RBI, AVG, SLG, OPS (10 columns)
  // Advanced adds: DP, ROB, OBP (niche stats)
  const hittingColumns = [
    {
      header: "Player",
      cell: (item: PlayerStats & { imageUrl?: string }) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-surface-light rounded overflow-hidden flex items-center justify-center font-display text-white/80 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{item.name[0]}</span>
            )}
          </motion.div>
          <div className="min-w-0">
            <span className="font-bold text-white uppercase tracking-wider block truncate">{item.name}</span>
            <span className="text-[10px] text-white/40 md:hidden">{item.team}</span>
          </div>
        </div>
      ),
    },
    { header: "Team", accessorKey: "team" as const, className: "text-white/60 hidden md:table-cell", sortable: true },
    { header: <StatsTooltip stat="GP">GP</StatsTooltip>, accessorKey: "gp" as const, className: "text-white/40 text-center text-xs", sortable: true },
    {
      header: <StatsTooltip stat="AB" context="batting">AB</StatsTooltip>,
      accessorKey: "ab" as const,
      className: "text-white/70 font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="H" context="batting">H</StatsTooltip>,
      accessorKey: "h" as const,
      className: "text-white/90 font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="HR" context="batting">HR</StatsTooltip>,
      accessorKey: "hr" as const,
      className: "text-comets-red font-mono font-bold text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="RBI" context="batting">RBI</StatsTooltip>,
      accessorKey: "rbi" as const,
      className: "text-white/90 font-mono text-center",
      sortable: true,
    },
    // Advanced stats - hidden by default (niche stats)
    {
      header: <StatsTooltip stat="DP" context="batting">DP</StatsTooltip>,
      accessorKey: "dp" as const,
      className: "text-white/70 font-mono text-center text-sm",
      sortable: true,
      condensed: true,
    },
    {
      header: <StatsTooltip stat="ROB" context="fielding">ROB</StatsTooltip>,
      accessorKey: "rob" as const,
      className: "text-white/70 font-mono text-center text-sm",
      sortable: true,
      condensed: true,
    },
    {
      header: <StatsTooltip stat="AVG" context="batting">AVG</StatsTooltip>,
      accessorKey: "avg" as const,
      className: "text-comets-cyan font-mono font-bold text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="OBP" context="batting">OBP</StatsTooltip>,
      accessorKey: "obp" as const,
      className: "text-comets-cyan font-mono text-center",
      sortable: true,
      condensed: true,
    },
    {
      header: <StatsTooltip stat="SLG" context="batting">SLG</StatsTooltip>,
      accessorKey: "slg" as const,
      className: "text-comets-cyan font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="OPS" context="batting">OPS</StatsTooltip>,
      accessorKey: "ops" as const,
      className: "text-comets-yellow font-mono font-bold text-center",
      sortable: true,
    },
  ];

  // Default shows: Player, Team, GP, IP, H, HR, ERA, WHIP, BAA (9 columns)
  // Advanced adds: W, L, SV (record stats)
  const pitchingColumns = [
    {
      header: "Player",
      cell: (item: PlayerStats & { imageUrl?: string }) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-surface-light rounded overflow-hidden flex items-center justify-center font-display text-white/80 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{item.name[0]}</span>
            )}
          </motion.div>
          <div className="min-w-0">
            <span className="font-bold text-white uppercase tracking-wider block truncate">{item.name}</span>
            <span className="text-[10px] text-white/40 md:hidden">{item.team}</span>
          </div>
        </div>
      ),
    },
    { header: "Team", accessorKey: "team" as const, className: "text-white/60 hidden md:table-cell", sortable: true },
    { header: <StatsTooltip stat="GP">GP</StatsTooltip>, accessorKey: "gp" as const, className: "text-white/40 text-center text-xs", sortable: true },
    {
      header: <StatsTooltip stat="IP" context="pitching">IP</StatsTooltip>,
      accessorKey: "ip" as const,
      className: "text-white/90 font-mono text-center",
      sortable: true,
    },
    // Advanced stats - hidden by default (record stats)
    {
      header: <StatsTooltip stat="W" context="pitching">W</StatsTooltip>,
      accessorKey: "w" as const,
      className: "text-green-400 font-mono text-center text-sm",
      sortable: true,
      condensed: true,
    },
    {
      header: <StatsTooltip stat="L" context="pitching">L</StatsTooltip>,
      accessorKey: "l" as const,
      className: "text-red-400 font-mono text-center text-sm",
      sortable: true,
      condensed: true,
    },
    {
      header: <StatsTooltip stat="SV" context="pitching">SV</StatsTooltip>,
      accessorKey: "sv" as const,
      className: "text-comets-yellow font-mono text-center text-sm",
      sortable: true,
      condensed: true,
    },
    {
      header: <StatsTooltip stat="H" context="pitching">H</StatsTooltip>,
      accessorKey: "hAllowed" as const,
      className: "text-white/90 font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="HR" context="pitching">HR</StatsTooltip>,
      accessorKey: "hrAllowed" as const,
      className: "text-white/90 font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="ERA" context="pitching">ERA</StatsTooltip>,
      accessorKey: "era" as const,
      className: "text-comets-cyan font-mono font-bold text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="WHIP" context="pitching">WHIP</StatsTooltip>,
      accessorKey: "whip" as const,
      className: "text-comets-cyan font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="BAA" context="pitching">BAA</StatsTooltip>,
      accessorKey: "baa" as const,
      className: "text-comets-cyan font-mono text-center",
      sortable: true,
    },
  ];

  // Default shows: Player, Team, GP, NP, E, SB, CS, OAA (8 columns)
  // Fielding has fewer stats, no condensed columns needed
  const fieldingColumns = [
    {
      header: "Player",
      cell: (item: PlayerStats & { imageUrl?: string }) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-surface-light rounded overflow-hidden flex items-center justify-center font-display text-white/80 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{item.name[0]}</span>
            )}
          </motion.div>
          <div className="min-w-0">
            <span className="font-bold text-white uppercase tracking-wider block truncate">{item.name}</span>
            <span className="text-[10px] text-white/40 md:hidden">{item.team}</span>
          </div>
        </div>
      ),
    },
    { header: "Team", accessorKey: "team" as const, className: "text-white/60 hidden md:table-cell", sortable: true },
    { header: <StatsTooltip stat="GP">GP</StatsTooltip>, accessorKey: "gp" as const, className: "text-white/40 text-center text-xs", sortable: true },
    {
      header: <StatsTooltip stat="NP" context="fielding">NP</StatsTooltip>,
      accessorKey: "np" as const,
      className: "text-comets-cyan font-mono font-bold text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="E" context="fielding">E</StatsTooltip>,
      accessorKey: "e" as const,
      className: "text-red-400 font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="SB" context="batting">SB</StatsTooltip>,
      accessorKey: "sb" as const,
      className: "text-comets-yellow font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="CS" context="fielding">CS</StatsTooltip>,
      accessorKey: "cs" as const,
      className: "text-white/90 font-mono text-center",
      sortable: true,
    },
    {
      header: <StatsTooltip stat="OAA" context="fielding">OAA</StatsTooltip>,
      accessorKey: "oaa" as const,
      className: "text-comets-purple font-mono font-bold text-center",
      sortable: true,
    },
  ];

  const columns = activeTab === "hitting" ? hittingColumns : activeTab === "pitching" ? pitchingColumns : fieldingColumns;

  return (
    <main className="min-h-screen bg-background pt-28 px-4 pb-12">
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
                {allFilteredPlayers.length} {allFilteredPlayers.length === 1 ? "Player" : "Players"}
              </span>
            </motion.div>
          </div>

          {/* Toggles */}
          <div className="flex gap-3">
            <StatsToggle showAdvanced={showAdvanced} onChange={setShowAdvanced} size="sm" />
            <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} size="sm" />
          </div>
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
          onRowClick={handlePlayerClick}
          showAdvanced={showAdvanced}
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

        {/* Pagination Controls */}
        {allFilteredPlayers.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <motion.button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded border transition-all focus-arcade",
                currentPage === 1
                  ? "border-white/10 text-white/20 cursor-not-allowed"
                  : "border-white/20 text-white/60 hover:border-comets-cyan hover:text-comets-cyan"
              )}
              whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            >
              <ChevronLeft size={18} />
            </motion.button>

            <div className="flex items-center gap-2 font-mono text-sm">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <motion.button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded border transition-all focus-arcade",
                      currentPage === pageNum
                        ? "border-comets-cyan bg-comets-cyan/20 text-comets-cyan"
                        : "border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 rounded border transition-all focus-arcade",
                currentPage === totalPages
                  ? "border-white/10 text-white/20 cursor-not-allowed"
                  : "border-white/20 text-white/60 hover:border-comets-cyan hover:text-comets-cyan"
              )}
              whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
              whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        )}

        {/* Results count */}
        {allFilteredPlayers.length > 0 && (
          <div className="mt-4 text-center font-mono text-xs text-white/30">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, allFilteredPlayers.length)} of {allFilteredPlayers.length} players
          </div>
        )}
      </div>
    </main>
  );
}

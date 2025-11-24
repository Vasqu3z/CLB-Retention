"use client";

import React, { useMemo, useState } from "react";
import RetroTable from "@/components/ui/RetroTable";
import { Search, SlidersHorizontal, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PlayerStats } from "@/lib/sheets";

interface PlayerRow {
  id: string;
  name: string;
  team: string;
  avg: string;
  hr: number;
  ops: string;
}

function buildRows(players: PlayerStats[]): PlayerRow[] {
  return players.map((player, idx) => ({
    id: player.name ?? `player-${idx}`,
    name: player.name ?? "Unknown",
    team: player.team || "Free Agent",
    avg: player.avg ?? "-.--",
    hr: Number(player.hr) || 0,
    ops: player.ops ?? "-.--",
  }));
}

export function PlayersClient({ players }: { players: PlayerStats[] }) {
  const rows = useMemo(() => buildRows(players), [players]);
  const teams = useMemo(
    () => ["All Teams", ...Array.from(new Set(rows.map((p) => p.team)))],
    [rows]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPlayers = useMemo(() => {
    return rows.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = selectedTeam === "All Teams" || player.team === selectedTeam;
      return matchesSearch && matchesTeam;
    });
  }, [rows, searchQuery, selectedTeam]);

  const hasActiveFilters = selectedTeam !== "All Teams";

  const columns = [
    {
      header: "Player",
      cell: (item: PlayerRow) => (
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
    { header: "AVG", accessorKey: "avg" as const, className: "text-comets-cyan font-mono", sortable: true },
    { header: "HR", accessorKey: "hr" as const, className: "text-comets-red font-mono", sortable: true },
    { header: "OPS", accessorKey: "ops" as const, className: "text-comets-yellow font-mono font-bold", sortable: true },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-comets-cyan uppercase tracking-widest mb-2">Database Access</div>
            <h1 className="font-display text-5xl text-white uppercase">Player Registry</h1>

            <motion.div
              className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <span className="text-xs font-mono text-white/60">
                {filteredPlayers.length} {filteredPlayers.length === 1 ? 'Player' : 'Players'}
              </span>
            </motion.div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
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
        </div>

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-comets-cyan" />
                    <span className="font-ui text-sm uppercase tracking-widest text-white">Filters</span>
                  </div>
                  {hasActiveFilters && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => setSelectedTeam("All Teams")}
                      className="text-xs font-ui uppercase tracking-widest text-comets-red hover:text-red-400 transition-colors flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={12} />
                      Clear All
                    </motion.button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                    Team
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {teams.map((team, index) => (
                      <motion.button
                        key={team}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedTeam(team)}
                        className={cn(
                          "relative px-4 py-2 rounded-full font-ui text-sm uppercase tracking-wider transition-all focus-arcade",
                          selectedTeam === team
                            ? "bg-comets-yellow text-black"
                            : "bg-white/5 text-white/70 hover:text-white"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {selectedTeam === team && (
                          <motion.div
                            layoutId="teamFilter"
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

        <RetroTable data={filteredPlayers} columns={columns} />
      </div>
    </main>
  );
}

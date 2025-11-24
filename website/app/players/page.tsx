"use client";

import React, { useState, useMemo } from "react";
import RetroTable, { type Column } from "@/components/ui/RetroTable";
import { Search, SlidersHorizontal, X, TrendingUp, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock Data - Replace with Google Sheets fetch
const PLAYERS = [
  { id: 1, name: "Mario", team: "Fireballs", position: "P", avg: ".412", hr: 24, ops: "1.240", stamina: 90 },
  { id: 2, name: "Luigi", team: "Fireballs", position: "C", avg: ".305", hr: 12, ops: ".890", stamina: 85 },
  { id: 3, name: "Bowser", team: "Monsters", position: "1B", avg: ".280", hr: 35, ops: "1.100", stamina: 95 },
  { id: 4, name: "Peach", team: "Monarchs", position: "CF", avg: ".350", hr: 8, ops: ".950", stamina: 70 },
  { id: 5, name: "Yoshi", team: "Eggs", position: "RF", avg: ".298", hr: 15, ops: ".875", stamina: 80 },
  { id: 6, name: "Wario", team: "Muscles", position: "LF", avg: ".245", hr: 28, ops: ".820", stamina: 88 },
];

type Player = typeof PLAYERS[number];

const TEAMS = ["All Teams", "Fireballs", "Monsters", "Monarchs", "Eggs", "Muscles"];
const POSITIONS = ["All Positions", "P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [selectedPosition, setSelectedPosition] = useState("All Positions");
  const [showFilters, setShowFilters] = useState(false);

  // Filter players based on search and filters
  const filteredPlayers = useMemo(() => {
    return PLAYERS.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           player.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = selectedTeam === "All Teams" || player.team === selectedTeam;
      const matchesPosition = selectedPosition === "All Positions" || player.position === selectedPosition;
      
      return matchesSearch && matchesTeam && matchesPosition;
    });
  }, [searchQuery, selectedTeam, selectedPosition]);

  const hasActiveFilters = selectedTeam !== "All Teams" || selectedPosition !== "All Positions";

  const clearFilters = () => {
    setSelectedTeam("All Teams");
    setSelectedPosition("All Positions");
    setSearchQuery("");
  };

  const columns: Column<Player>[] = [
    {
      header: "Player",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 bg-surface-light rounded flex items-center justify-center font-display text-white/80"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            {item.name[0]}
          </motion.div>
          <span className="font-bold text-white uppercase tracking-wider">{item.name}</span>
        </div>
      )
    },
    { header: "Team", accessorKey: "team", className: "text-white/60", sortable: true },
    { header: "Pos", accessorKey: "position", className: "text-white/40 text-xs", sortable: true },
    { header: "AVG", accessorKey: "avg", className: "text-comets-cyan font-mono", sortable: true },
    { header: "HR", accessorKey: "hr", className: "text-comets-red font-mono", sortable: true },
    { header: "OPS", accessorKey: "ops", className: "text-comets-yellow font-mono font-bold", sortable: true },
    {
      header: "Stamina",
      cell: (item) => (
        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${item.stamina}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-comets-purple" 
          />
        </div>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-background pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-comets-cyan uppercase tracking-widest mb-2">Database Access</div>
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
                {filteredPlayers.length} {filteredPlayers.length === 1 ? 'Player' : 'Players'}
              </span>
            </motion.div>
          </div>
          
          {/* Search & Filter Controls */}
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
                    <span className="font-ui text-sm uppercase tracking-widest text-white">Filters</span>
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

                {/* Position Filter Pills */}
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                    Position
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map((position, index) => (
                      <motion.button
                        key={position}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedPosition(position)}
                        className={cn(
                          "relative px-4 py-2 rounded-full font-mono text-sm transition-all focus-arcade",
                          selectedPosition === position
                            ? "text-black"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {selectedPosition === position && (
                          <motion.div
                            layoutId="activePosition"
                            className="absolute inset-0 bg-comets-cyan rounded-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10">{position}</span>
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
          data={filteredPlayers} 
          columns={columns} 
          onRowClick={(p) => console.log("View Player", p.name)} 
        />
        
        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4 opacity-20">🔍</div>
            <div className="font-display text-2xl text-white/40 mb-2">No Players Found</div>
            <div className="font-ui text-sm text-white/20 uppercase tracking-widest mb-4">
              Try adjusting your filters
            </div>
            {hasActiveFilters && (
              <motion.button
                onClick={clearFilters}
                className="px-6 py-2 bg-comets-yellow text-black font-ui uppercase tracking-widest text-sm rounded-sm arcade-press focus-arcade"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            )}
          </motion.div>
        )}
        
        {/* Pagination Info */}
        {filteredPlayers.length > 0 && (
          <div className="mt-8 flex justify-center gap-2 font-mono text-xs text-white/40">
            <span>PAGE 1 OF {Math.ceil(filteredPlayers.length / 10)}</span>
          </div>
        )}

      </div>
    </main>
  );
}

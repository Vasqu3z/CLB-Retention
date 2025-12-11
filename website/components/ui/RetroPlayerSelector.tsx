"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RetroPlayerSelector - Arcade-style player selection component
 *
 * A distinctive multi-select dropdown with CRT aesthetics:
 * - Glowing search input with scan line animation
 * - Player chips with team color accents and satisfying remove animations
 * - Dropdown with staggered reveal and hover power-up effects
 * - Maximum selection enforcement with visual feedback
 */

export interface PlayerOption {
  id: string;
  name: string;
  team: string;
  color: string; // Team color hex
}

interface RetroPlayerSelectorProps {
  players: PlayerOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
  className?: string;
}

export default function RetroPlayerSelector({
  players,
  selectedIds,
  onChange,
  maxSelections = 5,
  placeholder = "Search players...",
  className,
}: RetroPlayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPlayers = players.filter((p) => selectedIds.includes(p.id));
  const availablePlayers = players.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canAddMore = selectedIds.length < maxSelections;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addPlayer = (id: string) => {
    if (canAddMore) {
      onChange([...selectedIds, id]);
      setSearchQuery("");
      if (selectedIds.length + 1 >= maxSelections) {
        setIsOpen(false);
      }
    }
  };

  const removePlayer = (id: string) => {
    onChange(selectedIds.filter((pid) => pid !== id));
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected Players Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <AnimatePresence mode="popLayout">
          {selectedPlayers.map((player, idx) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -20 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: idx * 0.02,
              }}
              className="group relative"
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-dark border-2 rounded-sm cursor-default transition-all duration-200 hover:brightness-110"
                style={{
                  borderColor: player.color,
                  boxShadow: `0 0 10px ${player.color}40, inset 0 0 10px ${player.color}10`,
                }}
              >
                {/* Team color indicator dot */}
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: player.color }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <span className="font-ui text-sm uppercase tracking-wide text-white">
                  {player.name}
                </span>

                {/* Remove button */}
                <motion.button
                  onClick={() => removePlayer(player.id)}
                  className="ml-1 p-0.5 rounded-sm bg-white/0 hover:bg-comets-red/20 text-white/40 hover:text-comets-red transition-all focus-arcade"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.8 }}
                  aria-label={`Remove ${player.name}`}
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* Scanline overlay */}
              <div className="absolute inset-0 scanlines opacity-10 pointer-events-none rounded-sm" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Selection count indicator */}
        {selectedPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 px-2 py-1.5 text-white/30 font-mono text-xs"
          >
            <Users size={12} />
            {selectedIds.length}/{maxSelections}
          </motion.div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <motion.div
          className={cn(
            "relative flex items-center gap-3 px-4 py-3 bg-surface-dark border-2 rounded transition-all cursor-text",
            isOpen
              ? "border-comets-cyan shadow-[0_0_20px_rgba(0,243,255,0.3)]"
              : "border-white/10 hover:border-white/30"
          )}
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          whileHover={!isOpen ? { borderColor: "rgba(255,255,255,0.3)" } : {}}
        >
          {/* Search icon with pulse when active */}
          <motion.div
            animate={
              isOpen
                ? {
                    color: "#00F3FF",
                    scale: [1, 1.1, 1],
                  }
                : { color: "rgba(255,255,255,0.4)" }
            }
            transition={{ duration: 0.3 }}
          >
            <Search size={18} />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={canAddMore ? placeholder : "Maximum players selected"}
            disabled={!canAddMore}
            className="flex-1 bg-transparent font-ui text-sm text-white placeholder:text-white/30 focus:outline-none disabled:cursor-not-allowed"
          />

          {/* Dropdown indicator */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-white/40"
          >
            <ChevronDown size={18} />
          </motion.div>

          {/* Scanning line effect when open */}
          {isOpen && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-comets-cyan/0 via-comets-cyan/10 to-comets-cyan/0 pointer-events-none"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && canAddMore && (
            <motion.div
              initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ originY: 0 }}
              data-lenis-prevent
              className="absolute z-50 top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-surface-dark border-2 border-comets-cyan/50 rounded shadow-[0_0_30px_rgba(0,243,255,0.2)]"
            >
              {/* Scanlines overlay */}
              <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

              {availablePlayers.length === 0 ? (
                <div className="p-4 text-center text-white/40 font-mono text-sm">
                  {searchQuery ? "No players found" : "No more players available"}
                </div>
              ) : (
                <div className="py-1">
                  {availablePlayers.slice(0, 50).map((player, idx) => (
                    <motion.button
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => addPlayer(player.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-all group focus-arcade"
                      whileHover={{ x: 4 }}
                    >
                      {/* Team color indicator */}
                      <div
                        className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                        style={{
                          backgroundColor: player.color,
                          boxShadow: `0 0 8px ${player.color}60`,
                        }}
                      />

                      {/* Player name */}
                      <span className="flex-1 font-ui text-sm uppercase tracking-wide text-white group-hover:text-comets-cyan transition-colors">
                        {player.name}
                      </span>

                      {/* Team name */}
                      <span
                        className="font-mono text-xs uppercase tracking-widest opacity-50 group-hover:opacity-80 transition-opacity"
                        style={{ color: player.color }}
                      >
                        {player.team}
                      </span>

                      {/* Add icon on hover */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="text-comets-cyan"
                      >
                        <UserPlus size={14} />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Results count footer */}
              {availablePlayers.length > 50 && (
                <div className="px-4 py-2 border-t border-white/10 text-white/30 font-mono text-xs text-center">
                  Showing 50 of {availablePlayers.length} players
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * RetroPlayerPill - Standalone pill component for displaying selected players
 * Use this when you need just the pill without the full selector
 */
export function RetroPlayerPill({
  player,
  onRemove,
  showRemove = true,
}: {
  player: PlayerOption;
  onRemove?: () => void;
  showRemove?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-surface-dark border-2 rounded-sm"
      style={{
        borderColor: player.color,
        boxShadow: `0 0 10px ${player.color}40`,
      }}
    >
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: player.color }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <span className="font-ui text-sm uppercase tracking-wide text-white">
        {player.name}
      </span>

      {showRemove && onRemove && (
        <motion.button
          onClick={onRemove}
          className="ml-1 p-0.5 text-white/40 hover:text-comets-red transition-colors focus-arcade"
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.8 }}
        >
          <X size={14} />
        </motion.button>
      )}

      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none rounded-sm" />
    </motion.div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import useLenisScrollLock from "@/hooks/useLenisScrollLock";

interface Player {
  id: string;
  name: string;
  team: string;
  teamColor: string;
  imageUrl?: string;
  stats: {
    avg: string;
    power: number;
    speed: number;
    chemistry: { name: string; value: number }[];
  };
}

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (player: Player) => void;
  availablePlayers: Player[];
  title: string;
}

export default function PlayerSearchModal({
  isOpen,
  onClose,
  onSelect,
  availablePlayers,
  title,
}: PlayerSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const playerListRef = useLenisScrollLock<HTMLDivElement>();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Filter players based on search query
  const filteredPlayers = availablePlayers.filter(
    (player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (player: Player) => {
    onSelect(player);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-surface-dark border border-comets-cyan/30 rounded-xl shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden"
          >
            {/* Scanlines overlay */}
            <div className="absolute inset-0 scanlines opacity-5 pointer-events-none z-10" />

            {/* Glow effect at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-comets-cyan to-transparent" />

            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl text-white uppercase tracking-wider">
                  {title}
                </h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-white/40 hover:text-white transition-colors focus-arcade"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search players or teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-comets-cyan focus:shadow-[0_0_10px_rgba(0,243,255,0.3)] transition-all"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Player List */}
            <div ref={playerListRef} className="max-h-[50vh] overflow-y-auto custom-scrollbar">
              {filteredPlayers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-white/30 font-mono text-sm">
                    {searchQuery
                      ? `No players found matching "${searchQuery}"`
                      : "No players available"}
                  </div>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredPlayers.map((player, index) => (
                    <motion.button
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handleSelect(player)}
                      className={cn(
                        "w-full p-3 rounded-lg border transition-all duration-200 text-left",
                        "bg-black/20 border-white/5 hover:border-comets-cyan/50 hover:bg-comets-cyan/5",
                        "focus:outline-none focus:border-comets-cyan focus:bg-comets-cyan/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {player.imageUrl ? (
                          <div
                            className="w-10 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0"
                            style={{ borderColor: player.teamColor }}
                          >
                            <Image
                              src={player.imageUrl}
                              alt={player.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-lg border-2 flex-shrink-0"
                            style={{
                              borderColor: player.teamColor,
                              color: player.teamColor,
                              backgroundColor: `${player.teamColor}15`,
                            }}
                          >
                            {player.name[0]}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-white truncate">
                            {player.name}
                          </div>
                          <div className="text-xs font-mono text-white/40">
                            {player.team} • {player.stats.avg}
                          </div>
                        </div>

                        {/* Stats bars */}
                        <div className="hidden sm:flex flex-col gap-1 w-16">
                          <div className="flex items-center gap-1">
                            <div className="text-[9px] text-white/30 w-5">PWR</div>
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-comets-red"
                                style={{ width: `${player.stats.power}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="text-[9px] text-white/30 w-5">SPD</div>
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-comets-cyan"
                                style={{ width: `${player.stats.speed}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-black/20">
              <div className="flex items-center justify-between text-xs font-mono text-white/40">
                <span>{filteredPlayers.length} players available</span>
                <span>Press ESC to close</span>
              </div>
            </div>
          </motion.div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(0, 243, 255, 0.3);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 243, 255, 0.5);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

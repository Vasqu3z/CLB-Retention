"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap, AlertCircle, CheckCircle2, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BuilderPlayer {
  id: string;
  name: string;
  team: string;
  teamColor: string;
  position: string;
  stats: {
    avg: string;
    power: number;
    speed: number;
    chemistry: string[];
  };
}

interface Roster {
  [position: string]: BuilderPlayer | null;
}

interface LineupBuilderClientProps {
  availablePlayers: BuilderPlayer[];
}

const POSITIONS = {
  P: { top: "50%", left: "50%", label: "Pitcher" },
  C: { top: "85%", left: "50%", label: "Catcher" },
  "1B": { top: "50%", left: "80%", label: "First Base" },
  "2B": { top: "20%", left: "65%", label: "Second Base" },
  "3B": { top: "50%", left: "20%", label: "Third Base" },
  SS: { top: "20%", left: "35%", label: "Shortstop" },
  LF: { top: "10%", left: "15%", label: "Left Field" },
  CF: { top: "5%", left: "50%", label: "Center Field" },
  RF: { top: "10%", left: "85%", label: "Right Field" },
};

export default function LineupBuilderClient({ availablePlayers }: LineupBuilderClientProps) {
  const [roster, setRoster] = useState<Roster>({
    P: null, C: null, "1B": null, "2B": null, "3B": null, SS: null, LF: null, CF: null, RF: null
  });
  const [selectedPlayer, setSelectedPlayer] = useState<BuilderPlayer | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);

  const calculateChemistry = () => {
    let goodConnections = 0;
    const filledPositions = Object.entries(roster).filter(([_, player]) => player !== null);

    filledPositions.forEach(([_, player]) => {
      if (player) {
        filledPositions.forEach(([_, otherPlayer]) => {
          if (otherPlayer && player.id !== otherPlayer.id) {
            if (player.stats.chemistry.includes(otherPlayer.name)) {
              goodConnections++;
            }
          }
        });
      }
    });

    return goodConnections;
  };

  const chemistryScore = calculateChemistry();
  const filledPositions = Object.values(roster).filter(p => p !== null).length;

  const handlePlayerSelect = (player: BuilderPlayer) => {
    setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
  };

  const handlePositionClick = (position: string) => {
    if (selectedPlayer) {
      if (selectedPlayer.position.includes(position)) {
        setRoster({ ...roster, [position]: selectedPlayer });
        setSelectedPlayer(null);
      }
    } else if (roster[position]) {
      setRoster({ ...roster, [position]: null });
    }
  };

  const handleReset = () => {
    setRoster({
      P: null, C: null, "1B": null, "2B": null, "3B": null, SS: null, LF: null, CF: null, RF: null
    });
    setSelectedPlayer(null);
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-comets-blue/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-comets-purple mb-2">
            <Users size={20} />
            <span className="font-ui uppercase tracking-widest text-xs">Lineup Builder</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-white uppercase">Build Your Dream Lineup</h1>
          <p className="text-white/60 max-w-2xl mt-2">
            Select players from the league roster and assign them to positions on the field. Chemistry is boosted when teammates love playing together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="relative bg-surface-dark/60 border border-white/10 rounded-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-comets-cyan/5 via-transparent to-comets-purple/10 pointer-events-none" />

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="text-comets-cyan" />
                    <div>
                      <div className="font-ui text-white/70 text-xs uppercase tracking-widest">Chemistry Score</div>
                      <div className="font-display text-3xl text-white">{chemistryScore}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="arcade-button" onClick={handleReset}>
                      <RotateCcw size={16} className="mr-2" /> Reset
                    </button>
                    <button className="arcade-button-secondary">
                      <Save size={16} className="mr-2" /> Save Draft
                    </button>
                  </div>
                </div>

                <div className="col-span-3 relative bg-white/5 border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.08)_0%,transparent_60%)]" />
                  <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />

                  <AnimatePresence>
                    {Object.entries(POSITIONS).map(([pos, coords]) => {
                      const player = roster[pos];
                      return (
                        <motion.button
                          key={pos}
                          className={cn(
                            "absolute px-3 py-2 rounded-lg border text-xs font-ui uppercase tracking-widest transition-all",
                            "bg-black/60 border-white/20 text-white shadow-lg",
                            player && "border-white/60 bg-white/10",
                            selectedPlayer?.position.includes(pos) && "ring-2 ring-comets-cyan",
                            hoveredPosition === pos && !player && "border-comets-cyan/80",
                          )}
                          style={{ top: coords.top, left: coords.left, transform: "translate(-50%, -50%)" }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handlePositionClick(pos)}
                          onMouseEnter={() => setHoveredPosition(pos)}
                          onMouseLeave={() => setHoveredPosition(null)}
                        >
                          <div className="text-[10px] text-white/60">{coords.label}</div>
                          <div className="font-display text-white text-sm">
                            {player ? player.name : "Open"}
                          </div>
                          {player && (
                            <div className="text-[10px] text-white/50">
                              {player.team}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>

                  <div className="absolute bottom-3 right-3 text-[10px] text-white/40 uppercase tracking-[0.3em]">Click position to assign</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-comets-cyan">
              <Users size={18} />
              <span className="font-ui uppercase tracking-widest text-xs">Available Players</span>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
              {availablePlayers.length === 0 && (
                <div className="text-white/60 text-sm">No player data available yet.</div>
              )}
              {availablePlayers.map((player) => (
                <motion.button
                  key={player.id}
                  className={cn(
                    "w-full text-left bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between",
                    "transition-all duration-200",
                    selectedPlayer?.id === player.id && "border-comets-cyan/70 bg-comets-cyan/10"
                  )}
                  whileHover={{ y: -2 }}
                  onClick={() => handlePlayerSelect(player)}
                >
                  <div>
                    <div className="font-display text-lg text-white">{player.name}</div>
                    <div className="font-ui text-white/50 uppercase tracking-widest text-[10px]">{player.team}</div>
                    <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
                      <span>AVG: {player.stats.avg}</span>
                      <span>POW: {player.stats.power}</span>
                      <span>SPD: {player.stats.speed}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex gap-2">
                      {player.stats.chemistry.slice(0, 3).map((c) => (
                        <span key={c} className="text-[10px] text-comets-yellow bg-white/5 px-2 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                          {c}
                        </span>
                      ))}
                    </div>
                    <span
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-display text-xs"
                      style={{ borderColor: player.teamColor, color: player.teamColor }}
                    >
                      {player.position.split("/")[0]}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/70">
              <div className="flex items-start gap-2 text-comets-yellow mb-2">
                <AlertCircle size={16} />
                <span className="font-ui uppercase tracking-widest text-[10px]">Pro Tip</span>
              </div>
              <p>Assign players who share chemistry tags to maximize your score. Click a filled position to clear it.</p>
              <div className="mt-3 text-xs text-white/50">Filled Positions: {filledPositions} / 9</div>
              <div className="flex items-center gap-2 mt-3 text-comets-green">
                <CheckCircle2 size={16} />
                <span className="text-xs">Auto-saves coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

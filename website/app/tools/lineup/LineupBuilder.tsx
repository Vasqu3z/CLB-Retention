"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, AlertCircle, CheckCircle2, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChemistryMatrix } from "@/lib/sheets";

type FieldPosition = "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF";

interface PlayerStats {
  avg: string;
  power: number;
  speed: number;
}

export interface LineupPlayer {
  id: string;
  name: string;
  team: string;
  teamColor: string;
  positions: FieldPosition[];
  stats: PlayerStats;
  chemistry?: string[];
}

interface LineupBuilderProps {
  players: LineupPlayer[];
  chemistryMatrix: ChemistryMatrix;
  positiveChemistryThreshold: number;
}

const POSITIONS: Record<FieldPosition, { top: string; left: string; label: string }> = {
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

function canPlayPosition(player: LineupPlayer, position: FieldPosition) {
  return player.positions.length === 0 || player.positions.includes(position);
}

function formatPositions(player: LineupPlayer) {
  return player.positions.length > 0 ? player.positions.join(" / ") : "Any Position";
}

export default function LineupBuilder({
  players,
  chemistryMatrix,
  positiveChemistryThreshold,
}: LineupBuilderProps) {
  const [roster, setRoster] = useState<Record<FieldPosition, LineupPlayer | null>>({
    P: null,
    C: null,
    "1B": null,
    "2B": null,
    "3B": null,
    SS: null,
    LF: null,
    CF: null,
    RF: null,
  });
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<FieldPosition | null>(null);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.name.localeCompare(b.name)),
    [players]
  );

  const filledPositions = useMemo(
    () => Object.values(roster).filter(player => player !== null).length,
    [roster]
  );

  const chemistryScore = useMemo(() => {
    const filled = Object.values(roster).filter(Boolean) as LineupPlayer[];
    let goodConnections = 0;

    filled.forEach((player, idx) => {
      for (let j = idx + 1; j < filled.length; j++) {
        const otherPlayer = filled[j];
        const value = chemistryMatrix[player.name]?.[otherPlayer.name] ?? 0;
        if (value >= positiveChemistryThreshold) {
          goodConnections++;
        }
      }
    });

    return goodConnections;
  }, [roster, chemistryMatrix, positiveChemistryThreshold]);

  const chemistryConnections = useMemo(() => {
    const connections: Array<{
      pos1: FieldPosition;
      pos2: FieldPosition;
      value: number;
    }> = [];

    (Object.entries(roster) as Array<[FieldPosition, LineupPlayer | null]>).forEach(
      ([pos1, player1], idx) => {
        if (!player1) return;

        (Object.entries(roster) as Array<[FieldPosition, LineupPlayer | null]>)
          .slice(idx + 1)
          .forEach(([pos2, player2]) => {
            if (!player2) return;

            const value = chemistryMatrix[player1.name]?.[player2.name] ?? 0;
            if (value >= positiveChemistryThreshold) {
              connections.push({ pos1, pos2, value });
            }
          });
      }
    );

    return connections;
  }, [roster, chemistryMatrix, positiveChemistryThreshold]);

  const handlePlayerSelect = (player: LineupPlayer) => {
    setSelectedPlayer(current => (current?.id === player.id ? null : player));
  };

  const handlePositionClick = (position: FieldPosition) => {
    if (selectedPlayer) {
      if (canPlayPosition(selectedPlayer, position)) {
        setRoster(current => ({ ...current, [position]: selectedPlayer }));
        setSelectedPlayer(null);
      }
    } else if (roster[position]) {
      setRoster(current => ({ ...current, [position]: null }));
    }
  };

  const handleReset = () => {
    setRoster({
      P: null,
      C: null,
      "1B": null,
      "2B": null,
      "3B": null,
      SS: null,
      LF: null,
      CF: null,
      RF: null,
    });
    setSelectedPlayer(null);
  };

  const isPlayerAssigned = (playerId: string) =>
    Object.values(roster).some(player => player?.id === playerId);

  return (
    <main className="min-h-screen bg-background pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-comets-blue/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-comets-purple mb-2">
            <Users size={20} />
            <span className="font-ui uppercase tracking-widest text-sm font-bold">Tactical Manager</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-white uppercase leading-none mb-4">
            Lineup Builder
          </h1>
          <p className="text-white/60 max-w-2xl">
            Construct your ultimate roster. Click a player, then click a position to assign.
            Build chemistry by pairing compatible teammates.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-white/40 uppercase">Roster</div>
                <div className="text-3xl font-display text-white">{filledPositions}/9</div>
              </div>
              <CheckCircle2
                className={cn(
                  "transition-colors",
                  filledPositions === 9 ? "text-comets-yellow" : "text-white/20"
                )}
                size={32}
              />
            </div>
          </div>

          <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-white/40 uppercase">Chemistry</div>
                <div className="text-3xl font-display text-comets-cyan">{chemistryScore}</div>
              </div>
              <Zap className="text-comets-cyan" size={32} />
            </div>
          </div>

          <div className="bg-surface-dark border border-white/10 rounded-lg p-4 flex items-center justify-between">
            <motion.button
              onClick={handleReset}
              className="flex items-center gap-2 text-white/60 hover:text-comets-red transition-colors font-ui uppercase tracking-widest text-sm arcade-press focus-arcade"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={18} />
              Reset
            </motion.button>
            <motion.button
              className="flex items-center gap-2 bg-comets-yellow text-black px-6 py-2 rounded-sm font-display uppercase text-sm arcade-press focus-arcade"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={filledPositions < 9}
            >
              <Save size={18} />
              Save
            </motion.button>
          </div>
        </motion.div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Player Deck */}
          <motion.div
            className="lg:col-span-5 space-y-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-white uppercase">Available Players</h2>
              <div className="text-xs font-mono text-white/40">{sortedPlayers.length} players</div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {sortedPlayers.map((player, index) => {
                const isAssigned = isPlayerAssigned(player.id);
                const isSelected = selectedPlayer?.id === player.id;

                return (
                  <motion.button
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.02 }}
                    onClick={() => !isAssigned && handlePlayerSelect(player)}
                    disabled={isAssigned}
                    className={cn(
                      "w-full p-4 rounded-lg border transition-all duration-300 text-left arcade-press focus-arcade",
                      isSelected
                        ? "bg-white/10 border-comets-cyan shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                        : isAssigned
                          ? "bg-surface-dark/50 border-white/5 opacity-50 cursor-not-allowed"
                          : "bg-surface-dark border-white/10 hover:border-white/30 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center font-display text-xl border-2"
                        style={{
                          borderColor: player.teamColor,
                          color: player.teamColor,
                          backgroundColor: `${player.teamColor}10`,
                        }}
                      >
                        {player.name[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-lg text-white">{player.name}</span>
                          {isAssigned && (
                            <span className="text-xs font-mono text-comets-yellow">✓ IN LINEUP</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-white/50">
                          <span>{player.team}</span>
                          <span>•</span>
                          <span>{formatPositions(player)}</span>
                          <span>•</span>
                          <span>{player.stats.avg}</span>
                        </div>
                      </div>

                      {/* Stats bars */}
                      <div className="hidden md:flex flex-col gap-1 w-20">
                        <div className="flex items-center gap-1">
                          <div className="text-[10px] text-white/30 w-6">PWR</div>
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-comets-red"
                              style={{ width: `${player.stats.power}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="text-[10px] text-white/30 w-6">SPD</div>
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
                );
              })}
            </div>
          </motion.div>

          {/* Right: Holographic Field */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="sticky top-24">
              <div className="mb-4">
                <h2 className="font-display text-2xl text-white uppercase mb-2">Field Positions</h2>
                {selectedPlayer && (
                  <motion.div
                    className="flex items-center gap-2 text-comets-cyan text-sm font-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertCircle size={16} />
                    Click a valid position for {selectedPlayer.name} ({formatPositions(selectedPlayer)})
                  </motion.div>
                )}
              </div>

              {/* The Field */}
              <div className="relative w-full aspect-square max-w-2xl mx-auto perspective-1000">
                {/* Field container */}
                <motion.div
                  className="absolute inset-0 transform rotate-x-45 scale-90 bg-black/20 border border-white/10 rounded-full backdrop-blur-sm overflow-hidden"
                  animate={{
                    boxShadow: [
                      "0 0 50px rgba(0,243,255,0.1)",
                      "0 0 80px rgba(0,243,255,0.2)",
                      "0 0 50px rgba(0,243,255,0.1)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {/* Grid */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #00F3FF 1px, transparent 1px), linear-gradient(to bottom, #00F3FF 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />

                  {/* Diamond */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rotate-45 border-2 border-comets-cyan/30"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(0,243,255,0.2)",
                        "0 0 40px rgba(0,243,255,0.4)",
                        "0 0 20px rgba(0,243,255,0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Scanning line */}
                  <motion.div
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-2 bg-comets-cyan/70 blur-sm"
                    style={{ boxShadow: "0 0 20px #00F3FF" }}
                  />
                </motion.div>

                {/* Position Nodes */}
                {Object.entries(POSITIONS).map(([pos, coords]) => {
                  const typedPos = pos as FieldPosition;
                  const player = roster[typedPos];
                  const isValidForSelected = selectedPlayer ? canPlayPosition(selectedPlayer, typedPos) : false;
                  const isHovered = hoveredPosition === typedPos;

                  return (
                    <motion.button
                      key={pos}
                      onClick={() => handlePositionClick(typedPos)}
                      onMouseEnter={() => setHoveredPosition(typedPos)}
                      onMouseLeave={() => setHoveredPosition(null)}
                      whileHover={{ scale: 1.3, y: -8 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "absolute w-14 h-14 -ml-7 -mt-7 rounded-full border-2 flex flex-col items-center justify-center z-10 transition-all duration-300 cursor-pointer focus-yellow",
                        player
                          ? "border-comets-yellow bg-black shadow-[0_0_15px_#F4D03F]"
                          : selectedPlayer && isValidForSelected
                            ? "border-comets-cyan bg-comets-cyan/20 shadow-[0_0_15px_#00F3FF] animate-pulse"
                            : "border-white/20 bg-black/50 hover:border-comets-cyan hover:bg-comets-cyan/10"
                      )}
                      style={{ top: coords.top, left: coords.left }}
                      disabled={!selectedPlayer && !player}
                    >
                      {player ? (
                        <>
                          <div className="font-bold text-xs text-comets-yellow">{player.name[0]}</div>
                          <div className="text-[8px] text-white/50 font-mono">{pos}</div>
                        </>
                      ) : (
                        <div className="text-[10px] text-white/50 font-mono">{pos}</div>
                      )}

                      {/* Pulse for filled */}
                      {player && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-comets-yellow"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      {/* Tooltip */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 border border-white/20 rounded text-xs whitespace-nowrap pointer-events-none"
                        >
                          {coords.label}
                          {player && ` - ${player.name}`}
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}

                {/* Chemistry Lines */}
                <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                  {chemistryConnections.map(connection => {
                    const coords1 = POSITIONS[connection.pos1];
                    const coords2 = POSITIONS[connection.pos2];

                    return (
                      <motion.line
                        key={`${connection.pos1}-${connection.pos2}`}
                        x1={coords1.left}
                        y1={coords1.top}
                        x2={coords2.left}
                        y2={coords2.top}
                        stroke="#00F3FF"
                        strokeWidth="2"
                        opacity="0.3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1 }}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
    </main>
  );
}

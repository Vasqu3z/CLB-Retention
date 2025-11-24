"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, CheckCircle2, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LineupPlayer {
  name: string;
  team?: string;
  teamColor?: string;
  position?: string;
  stats?: {
    avg?: string;
    power?: number;
    speed?: number;
    chemistry?: string[];
  };
}

type LineupPlayerWithDefaults = LineupPlayer & {
  id: string;
  team: string;
  teamColor: string;
  position: string;
  stats: {
    avg: string;
    power: number;
    speed: number;
    chemistry: string[];
  };
};

interface Roster {
  [position: string]: LineupPlayerWithDefaults | null;
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

export default function LineupBuilder({ players }: { players: LineupPlayer[] }) {
  const availablePlayers = useMemo<LineupPlayerWithDefaults[]>(() => {
    return players.map((player, index) => ({
      id: `${player.name}-${index}`,
      name: player.name,
      team: player.team ?? "",
      teamColor: player.teamColor ?? "#00F3FF",
      position: player.position ?? "UTIL",
      stats: {
        avg: player.stats?.avg ?? ".300",
        power: player.stats?.power ?? 70,
        speed: player.stats?.speed ?? 70,
        chemistry: player.stats?.chemistry ?? [],
      },
    }));
  }, [players]);

  const [roster, setRoster] = useState<Roster>({
    P: null, C: null, "1B": null, "2B": null, "3B": null, SS: null, LF: null, CF: null, RF: null
  });
  const [selectedPlayer, setSelectedPlayer] = useState<(typeof availablePlayers)[number] | null>(null);
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

  const handlePlayerSelect = (player: (typeof availablePlayers)[number]) => {
    setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
  };

  const handlePositionClick = (position: string) => {
    if (selectedPlayer) {
      if (selectedPlayer.position.includes(position) || selectedPlayer.position === "UTIL") {
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            className="lg:col-span-5 space-y-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-white uppercase">Available Players</h2>
              <div className="text-xs font-mono text-white/40">{availablePlayers.length} players</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {availablePlayers.map((player) => (
                <motion.button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-lg border text-left transition-all focus-arcade",
                    selectedPlayer?.id === player.id
                      ? "border-comets-cyan bg-comets-cyan/10"
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-10 h-10 rounded bg-black/40 flex items-center justify-center font-display text-white text-lg"
                    style={{ color: player.teamColor }}
                  >
                    {player.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-white uppercase leading-tight">{player.name}</div>
                    <div className="font-ui text-white/40 text-xs uppercase tracking-wider">
                      {player.position}
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono text-white/50">
                    AVG {player.stats.avg}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-7 bg-surface-dark border border-white/10 rounded-xl p-4 relative overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="absolute inset-0 scanlines opacity-5" />
            <div className="relative aspect-[4/3]">
              {Object.entries(POSITIONS).map(([position, coords]) => {
                const isFilled = roster[position];
                const isHovered = hoveredPosition === position;
                return (
                  <motion.button
                    key={position}
                    onClick={() => handlePositionClick(position)}
                    onMouseEnter={() => setHoveredPosition(position)}
                    onMouseLeave={() => setHoveredPosition(null)}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center text-center transition-all focus-arcade",
                      isFilled
                        ? "bg-comets-yellow text-black border-comets-yellow shadow-[0_0_30px_rgba(244,208,63,0.4)]"
                        : "bg-black/60 text-white/60 border-white/10 hover:border-white/40"
                    )}
                    style={{ top: coords.top, left: coords.left }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-xs font-mono text-white/40">{coords.label}</div>
                    <div className="font-display text-lg">{position}</div>
                    {isFilled && <div className="text-[10px] uppercase tracking-widest">{isFilled.name}</div>}
                    {!isFilled && isHovered && (
                      <div className="text-[10px] uppercase tracking-widest text-white/40">Empty</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

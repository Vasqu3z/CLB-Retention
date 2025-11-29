"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Network, Users } from "lucide-react";
import RetroPlayerSelector, { type PlayerOption } from "@/components/ui/RetroPlayerSelector";
import RetroChemistryNode, {
  RetroChemistryTeamSummary,
  RetroChemistryConnection,
} from "@/components/ui/RetroChemistryNode";

interface PlayerData {
  id: string;
  name: string;
  team: string;
  color: string;
}

interface ChemistryClientProps {
  players: PlayerData[];
  chemistryMatrix: Record<string, Record<string, number>>;
}

interface Connection {
  player1: string;
  player2: string;
  value: number;
}

export default function ChemistryClient({ players, chemistryMatrix }: ChemistryClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Convert players to PlayerOption format
  const playerOptions: PlayerOption[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    team: p.team,
    color: p.color,
  }));

  // Get selected player data
  const selectedPlayers = selectedIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as PlayerData[];

  // Calculate chemistry data
  const chemistryData = useMemo(() => {
    const playerChemistry = selectedPlayers.map((player) => {
      const relationships = chemistryMatrix[player.name] || {};
      const positive: Array<{ playerName: string; value: number }> = [];
      const negative: Array<{ playerName: string; value: number }> = [];

      Object.entries(relationships).forEach(([other, value]) => {
        if (value >= 100) {
          positive.push({ playerName: other, value });
        } else if (value <= -100) {
          negative.push({ playerName: other, value });
        }
      });

      positive.sort((a, b) => b.value - a.value);
      negative.sort((a, b) => a.value - b.value);

      return {
        id: player.id,
        name: player.name,
        team: player.team,
        color: player.color,
        positiveConnections: positive,
        negativeConnections: negative,
      };
    });

    // Calculate internal connections between selected players
    const internalPositive: Connection[] = [];
    const internalNegative: Connection[] = [];

    for (let i = 0; i < selectedPlayers.length; i++) {
      for (let j = i + 1; j < selectedPlayers.length; j++) {
        const player1 = selectedPlayers[i];
        const player2 = selectedPlayers[j];
        const value = chemistryMatrix[player1.name]?.[player2.name];

        if (value !== undefined && value !== 0) {
          if (value >= 100) {
            internalPositive.push({ player1: player1.name, player2: player2.name, value });
          } else if (value <= -100) {
            internalNegative.push({ player1: player1.name, player2: player2.name, value });
          }
        }
      }
    }

    return {
      playerChemistry,
      internalPositive,
      internalNegative,
    };
  }, [selectedPlayers, chemistryMatrix]);

  return (
    <main className="min-h-screen bg-background pb-24 pt-28 px-4">
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-comets-purple/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-comets-cyan/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 text-comets-purple mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Network size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">
              Chemistry Network
            </span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              Chemistry
              <br />
              Analysis
            </span>
          </h1>

          <p className="font-mono text-white/40 text-sm">
            Explore player relationships and build optimal teams
          </p>
        </motion.div>

        {/* Player Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <RetroPlayerSelector
            players={playerOptions}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            maxSelections={5}
            placeholder="Search players to analyze..."
          />
        </motion.div>

        {/* Team Chemistry Summary (if 2+ players) */}
        {selectedPlayers.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <RetroChemistryTeamSummary
              positiveConnections={chemistryData.internalPositive}
              negativeConnections={chemistryData.internalNegative}
            />
          </motion.div>
        )}

        {/* Internal Team Connections */}
        {selectedPlayers.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <div className="relative bg-surface-dark border border-white/10 rounded-lg p-6 overflow-hidden">
              <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

              <h2 className="font-display text-2xl uppercase text-white mb-6 flex items-center gap-3">
                <Users className="text-comets-cyan" size={24} />
                Team Connections
              </h2>

              {chemistryData.internalPositive.length > 0 || chemistryData.internalNegative.length > 0 ? (
                <div className="space-y-3">
                  {/* Show all internal connections */}
                  {[...chemistryData.internalPositive, ...chemistryData.internalNegative]
                    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                    .map((conn, idx) => {
                      const p1 = selectedPlayers.find((p) => p.name === conn.player1);
                      const p2 = selectedPlayers.find((p) => p.name === conn.player2);
                      if (!p1 || !p2) return null;

                      return (
                        <RetroChemistryConnection
                          key={`${conn.player1}-${conn.player2}`}
                          player1={{ name: p1.name, color: p1.color }}
                          player2={{ name: p2.name, color: p2.color }}
                          value={conn.value}
                          delay={idx * 0.05}
                        />
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 font-mono text-sm">
                  No significant chemistry between selected players
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Individual Player Chemistry Nodes */}
        {selectedPlayers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="font-display text-2xl uppercase text-white mb-6 flex items-center gap-3">
              <Network className="text-comets-purple" size={24} />
              Individual Relationships
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {chemistryData.playerChemistry.map((playerChem, idx) => (
                <RetroChemistryNode
                  key={playerChem.id}
                  player={playerChem}
                  maxDisplay={5}
                  delay={0.1 + idx * 0.1}
                />
              ))}
            </div>
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
                className="absolute inset-0 bg-comets-purple/20 blur-3xl rounded-full"
              />
              <Network size={64} className="text-white/20 relative" />
            </div>
            <h3 className="mt-6 font-display text-2xl uppercase text-white/40">
              Select Players to Analyze
            </h3>
            <p className="mt-2 font-mono text-sm text-white/20">
              Choose players using the search above to explore their chemistry
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}

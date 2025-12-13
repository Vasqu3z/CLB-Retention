"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, Target, Shield, Wind, Gauge, Award } from "lucide-react";
import RetroTabs from "@/components/ui/RetroTabs";
import RetroPlayerSelector, { type PlayerOption } from "@/components/ui/RetroPlayerSelector";
import RetroComparisonBar from "@/components/ui/RetroComparisonBar";
import RetroEmptyState from "@/components/ui/RetroEmptyState";
import HUDFrame from "@/components/ui/HUDFrame";

/**
 * Full player attribute data from Google Sheets
 */
interface PlayerAttributeData {
  id: string;
  name: string;
  team: string;
  color: string;
  imageUrl?: string;
  // Character info
  characterClass: string;
  captain: string;
  mii: string;
  miiColor: string;
  battingSide: string;
  armSide: string;
  weight: number;
  ability: string;
  // Overall stats
  pitchingOverall: number;
  battingOverall: number;
  fieldingOverall: number;
  speedOverall: number;
  // Pitching attributes
  starPitch: string;
  fastballSpeed: number;
  curveballSpeed: number;
  curve: number;
  stamina: number;
  // Hitting attributes
  starSwing: string;
  hitCurve: number;
  hittingTrajectory: string;
  slapHitContact: number;
  chargeHitContact: number;
  slapHitPower: number;
  chargeHitPower: number;
  preCharge: string;
  // Fielding & Running
  fielding: number;
  throwingSpeed: number;
  speed: number;
  bunting: number;
}

interface AttributesClientProps {
  players: PlayerAttributeData[];
}

type AttributeTab = "hitting" | "pitching" | "fielding";

// Attribute definitions grouped by category
// Most attributes are on 1-10 scale, speeds are in raw values
const OVERALL_ATTRIBUTES = [
  { key: "pitchingOverall", name: "Pitching Overall", maxValue: 10 },
  { key: "battingOverall", name: "Batting Overall", maxValue: 10 },
  { key: "fieldingOverall", name: "Fielding Overall", maxValue: 10 },
  { key: "speedOverall", name: "Speed Overall", maxValue: 10 },
];

const HITTING_ATTRIBUTES = [
  { key: "hitCurve", name: "Hit Curve", type: "boolean" as const },
  { key: "slapHitContact", name: "Slap Hit Contact", maxValue: 100 },
  { key: "chargeHitContact", name: "Charge Hit Contact", maxValue: 100 },
  { key: "slapHitPower", name: "Slap Hit Power", maxValue: 150 },
  { key: "chargeHitPower", name: "Charge Hit Power", maxValue: 100 },
];

const PITCHING_ATTRIBUTES = [
  { key: "fastballSpeed", name: "Fastball Speed", maxValue: 200 },
  { key: "curveballSpeed", name: "Curveball Speed", maxValue: 200 },
  { key: "curve", name: "Curve", maxValue: 100 },
  { key: "stamina", name: "Stamina", maxValue: 100 },
];

const FIELDING_ATTRIBUTES = [
  { key: "fielding", name: "Fielding", maxValue: 100 },
  { key: "throwingSpeed", name: "Throwing Speed", maxValue: 100 },
  { key: "speed", name: "Speed", maxValue: 150 },
  { key: "bunting", name: "Bunting", maxValue: 100 },
];

export default function AttributesClient({ players }: AttributesClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AttributeTab>("hitting");

  // Convert players to PlayerOption format for selector
  const playerOptions: PlayerOption[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    team: p.team,
    color: p.color,
    imageUrl: p.imageUrl,
  }));

  // Get selected player data
  const selectedPlayers = selectedIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as PlayerAttributeData[];

  // Get current category attributes
  const getCategoryAttributes = () => {
    switch (activeTab) {
      case "hitting":
        return HITTING_ATTRIBUTES;
      case "pitching":
        return PITCHING_ATTRIBUTES;
      case "fielding":
        return FIELDING_ATTRIBUTES;
      default:
        return HITTING_ATTRIBUTES;
    }
  };

  const tabs = [
    { value: "hitting", label: "Hitting", color: "red" as const },
    { value: "pitching", label: "Pitching", color: "yellow" as const },
    { value: "fielding", label: "Fielding & Running", color: "cyan" as const },
  ];

  return (
    <main className="min-h-screen pb-24 pt-28 px-4">
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-comets-purple/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-comets-cyan/10 blur-[100px] rounded-full" />
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
            <Users size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">
              Player Analysis
            </span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              Attribute
              <br />
              Comparison
            </span>
          </h1>
        </motion.div>

        {/* Player Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <RetroPlayerSelector
            players={playerOptions}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            maxSelections={5}
            placeholder="Search players to compare..."
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <RetroTabs
            tabs={tabs}
            value={activeTab}
            onChange={(val) => setActiveTab(val as AttributeTab)}
          />
        </motion.div>

        {/* Comparison Content */}
        <HUDFrame size="md" animate={true} delay={0.5} scanlines scanlinesOpacity={0.03} innerPadding>
        {selectedPlayers.length >= 2 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            {/* Overall Stats Section - Always visible */}
            <section>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-2 bg-comets-yellow/20 rounded-lg">
                  <Award className="text-comets-yellow" size={20} />
                </div>
                <h2 className="font-display text-2xl uppercase text-white tracking-tight">
                  Overall Stats
                </h2>
              </motion.div>

              <div className="grid gap-4 md:grid-cols-2">
                {OVERALL_ATTRIBUTES.map((attr, idx) => (
                  <RetroComparisonBar
                    key={attr.key}
                    statName={attr.name}
                    statKey={attr.key.toUpperCase()}
                    maxValue={attr.maxValue}
                    delay={0.1 + idx * 0.05}
                    players={selectedPlayers.map((p) => ({
                      id: p.id,
                      name: p.name,
                      color: p.color,
                      value: p[attr.key as keyof PlayerAttributeData] as number,
                    }))}
                  />
                ))}
              </div>
            </section>

            {/* Category-specific attributes */}
            <section>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor:
                      activeTab === "hitting"
                        ? "rgba(255, 77, 77, 0.2)"
                        : activeTab === "pitching"
                        ? "rgba(244, 208, 63, 0.2)"
                        : "rgba(0, 243, 255, 0.2)",
                  }}
                >
                  {activeTab === "hitting" && (
                    <Target className="text-comets-red" size={20} />
                  )}
                  {activeTab === "pitching" && (
                    <Zap className="text-comets-yellow" size={20} />
                  )}
                  {activeTab === "fielding" && (
                    <Shield className="text-comets-cyan" size={20} />
                  )}
                </div>
                <h2 className="font-display text-2xl uppercase text-white tracking-tight">
                  {activeTab === "hitting" && "Hitting Attributes"}
                  {activeTab === "pitching" && "Pitching Attributes"}
                  {activeTab === "fielding" && "Fielding & Running"}
                </h2>
              </motion.div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getCategoryAttributes().map((attr, idx) => (
                  <RetroComparisonBar
                    key={attr.key}
                    statName={attr.name}
                    statKey={attr.key.toUpperCase()}
                    maxValue={"maxValue" in attr ? attr.maxValue : undefined}
                    type={"type" in attr ? attr.type : "number"}
                    delay={0.2 + idx * 0.05}
                    players={selectedPlayers.map((p) => ({
                      id: p.id,
                      name: p.name,
                      color: p.color,
                      value: p[attr.key as keyof PlayerAttributeData] as number,
                    }))}
                  />
                ))}
              </div>
            </section>

            {/* Character Info Section */}
            <section>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-2 bg-comets-purple/20 rounded-lg">
                  <Gauge className="text-comets-purple" size={20} />
                </div>
                <h2 className="font-display text-2xl uppercase text-white tracking-tight">
                  Character Info
                </h2>
              </motion.div>

              <div className="relative bg-surface-dark border border-white/10 rounded-lg overflow-hidden">
                <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

                <div data-lenis-prevent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left font-ui text-xs uppercase tracking-widest text-white/40 bg-white/5">
                          Attribute
                        </th>
                        {selectedPlayers.map((player) => (
                          <th
                            key={player.id}
                            className="px-4 py-3 text-center font-ui text-xs uppercase tracking-widest min-w-[120px]"
                            style={{ color: player.color }}
                          >
                            {player.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                      <CharacterInfoRow
                        label="Class"
                        players={selectedPlayers}
                        getValue={(p) => p.characterClass}
                      />
                      <CharacterInfoRow
                        label="Captain"
                        players={selectedPlayers}
                        getValue={(p) => p.captain}
                      />
                      <CharacterInfoRow
                        label="Star Pitch"
                        players={selectedPlayers}
                        getValue={(p) => p.starPitch}
                      />
                      <CharacterInfoRow
                        label="Star Swing"
                        players={selectedPlayers}
                        getValue={(p) => p.starSwing}
                      />
                      <CharacterInfoRow
                        label="Ability"
                        players={selectedPlayers}
                        getValue={(p) => p.ability}
                      />
                      <CharacterInfoRow
                        label="Batting Side"
                        players={selectedPlayers}
                        getValue={(p) => p.battingSide}
                      />
                      <CharacterInfoRow
                        label="Arm Side"
                        players={selectedPlayers}
                        getValue={(p) => p.armSide}
                      />
                      <CharacterInfoRow
                        label="Hit Trajectory"
                        players={selectedPlayers}
                        getValue={(p) => p.hittingTrajectory}
                      />
                      <CharacterInfoRow
                        label="Pre-Charge"
                        players={selectedPlayers}
                        getValue={(p) => p.preCharge}
                      />
                      <CharacterInfoRow
                        label="Weight"
                        players={selectedPlayers}
                        getValue={(p) => String(p.weight)}
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <RetroEmptyState
            title="Select Players to Compare"
            message="Choose at least 2 players using the search above"
            icon="question-block"
          />
        )}
        </HUDFrame>
      </div>
    </main>
  );
}

/**
 * Character info table row component
 */
function CharacterInfoRow({
  label,
  players,
  getValue,
}: {
  label: string;
  players: PlayerAttributeData[];
  getValue: (player: PlayerAttributeData) => string;
}) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-4 py-2 text-white/60 bg-white/5">{label}</td>
      {players.map((player) => (
        <td key={player.id} className="px-4 py-2 text-center text-white/80">
          {getValue(player) || "-"}
        </td>
      ))}
    </tr>
  );
}

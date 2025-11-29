"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Activity, Zap, Users, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import StatsTooltip from "@/components/ui/StatsTooltip";
import { StatsToggle } from "@/components/ui/RetroSegmentedControl";

interface PlayerStats {
  name: string;
  team: string;
  gp: number;
  // Hitting
  ab?: number;
  h?: number;
  hr?: number;
  rbi?: number;
  avg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
  // Pitching
  ip?: number;
  w?: number;
  l?: number;
  sv?: number;
  era?: string;
  whip?: string;
  // Fielding
  np?: number;
  e?: number;
  sb?: number;
  oaa?: number;
}

interface PlayerAttributes {
  pitchingOverall: number;
  battingOverall: number;
  fieldingOverall: number;
  speedOverall: number;
  starPitch: string;
  starSwing: string;
}

interface ChemistryRelation {
  name: string;
  value: number;
}

interface PlayerProfileClientProps {
  player: PlayerStats;
  playerImageUrl?: string;
  attributes: PlayerAttributes | null;
  teamColor: string;
  positiveChemistry: ChemistryRelation[];
  negativeChemistry: ChemistryRelation[];
}

export default function PlayerProfileClient({
  player,
  playerImageUrl,
  attributes,
  teamColor,
  positiveChemistry,
  negativeChemistry,
}: PlayerProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "attributes" | "chemistry">("stats");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasHittingStats = (player.ab || 0) > 0;
  const hasPitchingStats = (player.ip || 0) > 0;
  const hasFieldingStats = (player.np || 0) > 0;

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Player Hero Header */}
      <div className="relative h-[45vh] min-h-[360px] overflow-hidden flex items-end pb-12">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          style={{
            background: `linear-gradient(135deg, ${teamColor}, transparent 70%)`,
          }}
        />

        <div className="absolute inset-0 scanlines opacity-5" />

        <div className="container mx-auto px-4 relative z-10 flex items-end gap-8">
          {/* Player Image */}
          {playerImageUrl && (
            <motion.div
              className="hidden md:block w-40 h-40 lg:w-48 lg:h-48 rounded-xl border-4 overflow-hidden bg-surface-dark shadow-2xl flex-shrink-0"
              style={{ borderColor: teamColor }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <Image
                src={playerImageUrl}
                alt={player.name}
                width={192}
                height={192}
                className="w-full h-full object-cover"
                priority
              />
            </motion.div>
          )}

          <div className="flex-1">
            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-8xl uppercase text-white leading-none tracking-tight mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {player.name}
            </motion.h1>

            <motion.div
              className="text-lg md:text-xl text-white/60 font-ui tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span style={{ color: teamColor }}>{player.team}</span> • {player.gp} GP
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 -mt-8 relative z-20">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "stats", label: "Season Stats", icon: Activity },
            { id: "attributes", label: "Attributes", icon: Zap },
            { id: "chemistry", label: "Chemistry", icon: Users },
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative px-6 py-3 rounded-t-lg font-ui uppercase tracking-widest text-sm flex items-center gap-2 border-t border-x transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-background border-white/20 text-white"
                  : "bg-surface-dark border-transparent text-white/40 hover:text-white hover:bg-surface-light"
              )}
            >
              <tab.icon size={16} />
              {tab.label}

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activePlayerTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-comets-yellow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
          <div className="flex-1 border-b border-white/20 translate-y-[1px]" />
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Stats Tab */}
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Toggle */}
              <div className="flex justify-end">
                <StatsToggle showAdvanced={showAdvanced} onChange={setShowAdvanced} size="sm" />
              </div>
              {hasHittingStats && (
                <StatCard title="Hitting" color={teamColor}>
                  <StatRow label={<StatsTooltip stat="AVG" context="batting">AVG</StatsTooltip>} value={player.avg || ".000"} />
                  {showAdvanced && <StatRow label={<StatsTooltip stat="OBP" context="batting">OBP</StatsTooltip>} value={player.obp || ".000"} />}
                  {showAdvanced && <StatRow label={<StatsTooltip stat="SLG" context="batting">SLG</StatsTooltip>} value={player.slg || ".000"} />}
                  <StatRow label={<StatsTooltip stat="OPS" context="batting">OPS</StatsTooltip>} value={player.ops || ".000"} highlight />
                  <StatRow label={<StatsTooltip stat="AB" context="batting">AB</StatsTooltip>} value={player.ab || 0} />
                  <StatRow label={<StatsTooltip stat="H" context="batting">H</StatsTooltip>} value={player.h || 0} />
                  <StatRow label={<StatsTooltip stat="HR" context="batting">HR</StatsTooltip>} value={player.hr || 0} />
                  <StatRow label={<StatsTooltip stat="RBI" context="batting">RBI</StatsTooltip>} value={player.rbi || 0} />
                </StatCard>
              )}

              {hasPitchingStats && (
                <StatCard title="Pitching" color={teamColor}>
                  <StatRow label={<StatsTooltip stat="ERA" context="pitching">ERA</StatsTooltip>} value={player.era || "0.00"} highlight />
                  <StatRow label={<StatsTooltip stat="WHIP" context="pitching">WHIP</StatsTooltip>} value={player.whip || "0.00"} />
                  {showAdvanced && <StatRow label={<StatsTooltip stat="W" context="pitching">W</StatsTooltip>} value={player.w || 0} />}
                  {showAdvanced && <StatRow label={<StatsTooltip stat="L" context="pitching">L</StatsTooltip>} value={player.l || 0} />}
                  {showAdvanced && <StatRow label={<StatsTooltip stat="SV" context="pitching">SV</StatsTooltip>} value={player.sv || 0} />}
                  <StatRow label={<StatsTooltip stat="IP" context="pitching">IP</StatsTooltip>} value={player.ip?.toFixed(1) || "0.0"} />
                </StatCard>
              )}

              {hasFieldingStats && (
                <StatCard title="Fielding" color={teamColor}>
                  <StatRow label={<StatsTooltip stat="NP" context="fielding">NP</StatsTooltip>} value={player.np || 0} />
                  <StatRow label={<StatsTooltip stat="E" context="fielding">E</StatsTooltip>} value={player.e || 0} />
                  <StatRow label={<StatsTooltip stat="SB" context="batting">SB</StatsTooltip>} value={player.sb || 0} />
                  <StatRow label={<StatsTooltip stat="OAA" context="fielding">OAA</StatsTooltip>} value={player.oaa || 0} highlight />
                </StatCard>
              )}

              {!hasHittingStats && !hasPitchingStats && !hasFieldingStats && (
                <div className="p-12 text-center text-white/40 font-mono uppercase text-sm">
                  No stats available for this player
                </div>
              )}
            </motion.div>
          )}

          {/* Attributes Tab */}
          {activeTab === "attributes" && attributes && (
            <motion.div
              key="attributes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <AttributeBar
                name="Pitching"
                value={attributes.pitchingOverall}
                color="#FF4D4D"
                icon={Zap}
                detail={attributes.starPitch}
              />
              <AttributeBar
                name="Batting"
                value={attributes.battingOverall}
                color="#00F3FF"
                icon={Target}
                detail={attributes.starSwing}
              />
              <AttributeBar
                name="Fielding"
                value={attributes.fieldingOverall}
                color="#2ECC71"
                icon={Shield}
              />
              <AttributeBar
                name="Speed"
                value={attributes.speedOverall}
                color="#F4D03F"
                icon={Activity}
              />
            </motion.div>
          )}

          {/* Chemistry Tab */}
          {activeTab === "chemistry" && (
            <motion.div
              key="chemistry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-surface-dark border border-white/10 rounded-lg p-6">
                <h3 className="font-display text-2xl uppercase text-comets-yellow mb-4">
                  Positive Chemistry
                </h3>
                {positiveChemistry.length > 0 ? (
                  <div className="space-y-2">
                    {positiveChemistry.map((rel, idx) => (
                      <motion.div
                        key={rel.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 bg-comets-yellow/10 rounded hover:bg-comets-yellow/20 transition-all"
                      >
                        <span className="font-ui text-white uppercase">{rel.name}</span>
                        <span className="font-mono text-comets-yellow font-bold">+{rel.value}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 font-mono text-sm uppercase">No positive chemistry</p>
                )}
              </div>

              <div className="bg-surface-dark border border-white/10 rounded-lg p-6">
                <h3 className="font-display text-2xl uppercase text-comets-red mb-4">
                  Negative Chemistry
                </h3>
                {negativeChemistry.length > 0 ? (
                  <div className="space-y-2">
                    {negativeChemistry.map((rel, idx) => (
                      <motion.div
                        key={rel.name}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 bg-comets-red/10 rounded hover:bg-comets-red/20 transition-all"
                      >
                        <span className="font-ui text-white uppercase">{rel.name}</span>
                        <span className="font-mono text-comets-red font-bold">{rel.value}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 font-mono text-sm uppercase">No negative chemistry</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

// Helper components
function StatCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-dark border border-white/10 rounded-lg p-6">
      <h3
        className="font-display text-2xl uppercase text-white mb-4 pb-2 border-b border-white/10"
        style={{ borderColor: `${color}40` }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: React.ReactNode; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-white/60 text-xs font-mono uppercase mb-1">{label}</span>
      <span className={cn("font-mono font-bold text-2xl", highlight ? "text-comets-cyan" : "text-white")}>
        {value}
      </span>
    </div>
  );
}

function AttributeBar({
  name,
  value,
  color,
  icon: Icon,
  detail,
}: {
  name: string;
  value: number;
  color: string;
  icon: any;
  detail?: string;
}) {
  return (
    <div className="bg-surface-dark border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon style={{ color }} size={20} />
          </div>
          <h3 className="font-display text-xl uppercase text-white">{name}</h3>
        </div>
        <span className="font-mono font-bold text-2xl" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {detail && (
        <div className="mt-2 text-sm font-mono text-white/60 uppercase">
          Special: {detail}
        </div>
      )}
    </div>
  );
}

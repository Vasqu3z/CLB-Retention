"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Activity, Zap, Users, Target, Shield, ThumbsUp, ThumbsDown } from "lucide-react";
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
  // Overall stats
  pitchingOverall: number;
  battingOverall: number;
  fieldingOverall: number;
  speedOverall: number;
  // Character info
  characterClass?: string;
  captain?: string;
  ability?: string;
  battingSide?: string;
  armSide?: string;
  weight?: number;
  // Pitching attributes
  starPitch: string;
  fastballSpeed?: number;
  curveballSpeed?: number;
  curve?: number;
  stamina?: number;
  // Hitting attributes
  starSwing: string;
  hitCurve?: number;
  hittingTrajectory?: string;
  slapHitContact?: number;
  chargeHitContact?: number;
  slapHitPower?: number;
  chargeHitPower?: number;
  preCharge?: string;
  // Fielding attributes
  fielding?: number;
  throwingSpeed?: number;
  // Running attributes
  speed?: number;
  bunting?: number;
}

interface ChemistryRelation {
  name: string;
  value: number;
  imageUrl?: string;
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
    <main className="min-h-screen pb-24">
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
              className="hidden md:block w-32 h-32 lg:w-40 lg:h-40 rounded-xl border-2 overflow-hidden shadow-2xl flex-shrink-0"
              style={{
                borderColor: teamColor,
                background: `linear-gradient(135deg, ${teamColor}30, transparent)`,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <Image
                src={playerImageUrl}
                alt={player.name}
                width={160}
                height={160}
                className="w-full h-full object-contain"
                priority
              />
            </motion.div>
          )}

          <div className="flex-1">
            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-none tracking-tighter mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                {player.name}
              </span>
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
              className="space-y-8"
            >
              {/* Overall Stats */}
              <div>
                <h3 className="font-display text-xl uppercase text-comets-yellow mb-4">Overall Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttributeBar
                    name="Pitching"
                    value={attributes.pitchingOverall}
                    color="#FF4D4D"
                    icon={Zap}
                    detail={attributes.starPitch}
                    delay={0}
                  />
                  <AttributeBar
                    name="Batting"
                    value={attributes.battingOverall}
                    color="#00F3FF"
                    icon={Target}
                    detail={attributes.starSwing}
                    delay={0.05}
                  />
                  <AttributeBar
                    name="Fielding"
                    value={attributes.fieldingOverall}
                    color="#2ECC71"
                    icon={Shield}
                    delay={0.1}
                  />
                  <AttributeBar
                    name="Speed"
                    value={attributes.speedOverall}
                    color="#F4D03F"
                    icon={Activity}
                    delay={0.15}
                  />
                </div>
              </div>

              {/* Detailed Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pitching Attributes */}
                <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
                  <h4 className="font-display text-lg uppercase text-comets-red mb-3 flex items-center gap-2">
                    <Zap size={16} /> Pitching
                  </h4>
                  <div className="space-y-2 font-mono text-sm">
                    <DetailRow label="Fastball Speed" value={attributes.fastballSpeed} suffix=" mph" />
                    <DetailRow label="Curveball Speed" value={attributes.curveballSpeed} suffix=" mph" />
                    <DetailRow label="Curve" value={attributes.curve} max={10} />
                    <DetailRow label="Stamina" value={attributes.stamina} max={10} />
                  </div>
                </div>

                {/* Hitting Attributes */}
                <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
                  <h4 className="font-display text-lg uppercase text-comets-cyan mb-3 flex items-center gap-2">
                    <Target size={16} /> Hitting
                  </h4>
                  <div className="space-y-2 font-mono text-sm">
                    <DetailRow label="Hit Curve" value={attributes.hitCurve} max={10} />
                    <DetailRow label="Slap Contact" value={attributes.slapHitContact} max={10} />
                    <DetailRow label="Charge Contact" value={attributes.chargeHitContact} max={10} />
                    <DetailRow label="Slap Power" value={attributes.slapHitPower} max={10} />
                    <DetailRow label="Charge Power" value={attributes.chargeHitPower} max={10} />
                    {attributes.hittingTrajectory && (
                      <div className="flex justify-between text-white/60">
                        <span>Trajectory</span>
                        <span className="text-white">{attributes.hittingTrajectory}</span>
                      </div>
                    )}
                    {attributes.preCharge && (
                      <div className="flex justify-between text-white/60">
                        <span>Pre-Charge</span>
                        <span className="text-white">{attributes.preCharge}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fielding & Running */}
                <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
                  <h4 className="font-display text-lg uppercase text-comets-green mb-3 flex items-center gap-2">
                    <Shield size={16} /> Fielding & Running
                  </h4>
                  <div className="space-y-2 font-mono text-sm">
                    <DetailRow label="Fielding" value={attributes.fielding} max={10} />
                    <DetailRow label="Throwing Speed" value={attributes.throwingSpeed} max={10} />
                    <DetailRow label="Speed" value={attributes.speed} max={10} />
                    <DetailRow label="Bunting" value={attributes.bunting} max={10} />
                  </div>
                </div>
              </div>

              {/* Character Info */}
              {(attributes.characterClass || attributes.ability || attributes.battingSide) && (
                <div className="bg-surface-dark border border-white/10 rounded-lg p-4">
                  <h4 className="font-display text-lg uppercase text-comets-purple mb-3">Character Info</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-sm">
                    {attributes.characterClass && (
                      <div>
                        <span className="text-white/40 block">Class</span>
                        <span className="text-white">{attributes.characterClass}</span>
                      </div>
                    )}
                    {attributes.ability && (
                      <div>
                        <span className="text-white/40 block">Ability</span>
                        <span className="text-white">{attributes.ability}</span>
                      </div>
                    )}
                    {attributes.battingSide && (
                      <div>
                        <span className="text-white/40 block">Bats</span>
                        <span className="text-white">{attributes.battingSide}</span>
                      </div>
                    )}
                    {attributes.armSide && (
                      <div>
                        <span className="text-white/40 block">Throws</span>
                        <span className="text-white">{attributes.armSide}</span>
                      </div>
                    )}
                    {attributes.captain && (
                      <div>
                        <span className="text-white/40 block">Captain</span>
                        <span className="text-white">{attributes.captain}</span>
                      </div>
                    )}
                    {attributes.weight && (
                      <div>
                        <span className="text-white/40 block">Weight</span>
                        <span className="text-white">{attributes.weight}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                <h3 className="font-display text-2xl uppercase text-comets-green mb-4">
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
                        className="flex items-center justify-between p-3 bg-comets-green/10 rounded hover:bg-comets-green/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                            {rel.imageUrl ? (
                              <img
                                src={rel.imageUrl}
                                alt={rel.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/10 font-display text-xs text-white/60">
                                {rel.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="font-ui text-white uppercase">{rel.name}</span>
                        </div>
                        <ThumbsUp size={18} className="text-comets-green" />
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                            {rel.imageUrl ? (
                              <img
                                src={rel.imageUrl}
                                alt={rel.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/10 font-display text-xs text-white/60">
                                {rel.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="font-ui text-white uppercase">{rel.name}</span>
                        </div>
                        <ThumbsDown size={18} className="text-comets-red" />
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

function DetailRow({ label, value, max, suffix }: { label: string; value?: number; max?: number; suffix?: string }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex justify-between items-center text-white/60">
      <span>{label}</span>
      <span className="text-white">
        {value}{suffix}
        {max && <span className="text-white/40">/{max}</span>}
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
  delay = 0,
}: {
  name: string;
  value: number;
  color: string;
  icon: any;
  detail?: string;
  delay?: number;
}) {
  // Determine tier for styling
  const tier = value >= 80 ? 'elite' : value >= 60 ? 'good' : value >= 40 ? 'average' : 'low';

  return (
    <motion.div
      className="bg-surface-dark border border-white/10 rounded-lg p-6 relative overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

      {/* Glow effect for high stats */}
      {tier === 'elite' && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${color}15, transparent 70%)`,
          }}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-lg relative"
            style={{ backgroundColor: `${color}20` }}
            whileHover={{ scale: 1.1 }}
            animate={tier === 'elite' ? {
              boxShadow: [`0 0 10px ${color}40`, `0 0 20px ${color}60`, `0 0 10px ${color}40`]
            } : {}}
            transition={tier === 'elite' ? { duration: 2, repeat: Infinity } : {}}
          >
            <Icon style={{ color }} size={20} />
          </motion.div>
          <h3 className="font-display text-xl uppercase text-white">{name}</h3>
        </div>
        <motion.span
          className="font-mono font-bold text-2xl relative"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5, type: "spring", stiffness: 300 }}
        >
          {Math.round(value / 10)}
          {tier === 'elite' && (
            <motion.span
              className="absolute -top-1 -right-2 text-xs text-comets-yellow"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.8, type: "spring" }}
            >
              ★
            </motion.span>
          )}
        </motion.span>
      </div>

      <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 9%, rgba(255,255,255,0.1) 10%, transparent 11%)',
          backgroundSize: '10% 100%',
        }} />

        {/* Animated fill bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{
            delay: delay + 0.3,
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1] // Bounce effect
          }}
          className="h-full rounded-full relative"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 15px ${color}60, inset 0 1px 0 rgba(255,255,255,0.3)`,
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              delay: delay + 1,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        </motion.div>

        {/* Notch markers at 25%, 50%, 75% */}
        <div className="absolute inset-0 flex justify-between pointer-events-none px-[25%]">
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="w-0.5 h-full bg-white/10"
              style={{ marginLeft: mark === 25 ? 0 : `${25}%` }}
            />
          ))}
        </div>
      </div>

      {detail && (
        <motion.div
          className="mt-3 text-sm font-mono uppercase flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.6 }}
        >
          <span className="text-white/40">Special:</span>
          <span className="text-white/80 px-2 py-0.5 bg-white/5 rounded border border-white/10">
            {detail}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

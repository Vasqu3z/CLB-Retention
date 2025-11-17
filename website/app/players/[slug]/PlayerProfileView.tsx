'use client';

import { useState } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import { PlayerStats, PlayerAttributes, PlayerChemistry, PlayerRegistryEntry } from '@/lib/sheets';

interface PlayerProfileViewProps {
  playerName: string;
  regularStats: PlayerStats | null;
  playoffStats: PlayerStats | null;
  attributes: PlayerAttributes | null;
  chemistry: PlayerChemistry | null;
  registryEntry: PlayerRegistryEntry | null;
}

type TabType = 'stats' | 'attributes' | 'chemistry';

export default function PlayerProfileView({
  playerName,
  regularStats,
  playoffStats,
  attributes,
  chemistry,
  registryEntry,
}: PlayerProfileViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [season, setSeason] = useState<'regular' | 'playoffs'>('regular');

  const currentStats = season === 'regular' ? regularStats : playoffStats;
  const hasPlayoffStats = !!playoffStats;

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <FadeIn delay={0} direction="down">
        <div className="glass-card p-6">
          <div className="flex items-start gap-6">
            {/* Player Image */}
            {registryEntry?.imageUrl && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-nebula-orange/50 flex-shrink-0 hover:border-nebula-orange transition-all duration-300 hover:drop-shadow-[0_0_16px_rgba(255,107,53,0.6)]">
                <img
                  src={registryEntry.imageUrl}
                  alt={playerName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Player Info */}
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent text-shadow-glow-orange">
                {playerName}
              </h1>
              <div className="flex flex-wrap gap-4 text-star-gray font-mono">
                {registryEntry?.team && (
                  <span>Team: <span className="text-nebula-orange font-semibold">{registryEntry.team}</span></span>
                )}
                {attributes?.characterClass && (
                  <span>Class: <span className="text-nebula-coral font-semibold">{attributes.characterClass}</span></span>
                )}
                {attributes?.captain && (
                  <span>Captain: <span className="text-solar-gold font-semibold">{attributes.captain}</span></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Tab Navigation */}
      <FadeIn delay={0.1} direction="up">
        <div className="flex gap-2 border-b border-cosmic-border">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-display font-semibold transition-all duration-300 ${
              activeTab === 'stats'
                ? 'text-nebula-orange border-b-2 border-nebula-orange'
                : 'text-star-gray hover:text-star-white hover:border-b-2 hover:border-star-dim'
            }`}
          >
            Stats
          </button>
          {attributes && (
            <button
              onClick={() => setActiveTab('attributes')}
              className={`px-6 py-3 font-display font-semibold transition-all duration-300 ${
                activeTab === 'attributes'
                  ? 'text-nebula-orange border-b-2 border-nebula-orange'
                  : 'text-star-gray hover:text-star-white hover:border-b-2 hover:border-star-dim'
              }`}
            >
              Attributes
            </button>
          )}
          {chemistry && (
            <button
              onClick={() => setActiveTab('chemistry')}
              className={`px-6 py-3 font-display font-semibold transition-all duration-300 ${
                activeTab === 'chemistry'
                  ? 'text-nebula-orange border-b-2 border-nebula-orange'
                  : 'text-star-gray hover:text-star-white hover:border-b-2 hover:border-star-dim'
              }`}
            >
              Chemistry
            </button>
          )}
        </div>
      </FadeIn>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <FadeIn delay={0.15} direction="up">
          <div className="space-y-6">
            {/* Season Toggle */}
            {hasPlayoffStats && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSeason('regular')}
                  className={`px-4 py-2 font-display font-semibold text-sm rounded-lg transition-all duration-300 ${
                    season === 'regular'
                      ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                      : 'bg-space-navy/50 text-star-gray hover:text-star-white hover:bg-space-blue/50 border border-cosmic-border'
                  }`}
                >
                  Regular Season
                </button>
                <button
                  onClick={() => setSeason('playoffs')}
                  className={`px-4 py-2 font-display font-semibold text-sm rounded-lg transition-all duration-300 ${
                    season === 'playoffs'
                      ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                      : 'bg-space-navy/50 text-star-gray hover:text-star-white hover:bg-space-blue/50 border border-cosmic-border'
                  }`}
                >
                  Playoffs
                </button>
              </div>
            )}

            {currentStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hitting Stats */}
                <div className="glass-card p-6 hover:border-nebula-orange/50">
                  <h3 className="text-xl font-display font-bold text-nebula-orange mb-4 text-shadow">Hitting</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <StatRow label="GP" value={currentStats.gp} />
                    <StatRow label="AB" value={currentStats.ab} />
                    <StatRow label="H" value={currentStats.h} />
                    <StatRow label="HR" value={currentStats.hr} />
                    <StatRow label="RBI" value={currentStats.rbi} />
                    <StatRow label="ROB" value={currentStats.rob} />
                    <StatRow label="DP" value={currentStats.dp} />
                    <StatRow label="AVG" value={currentStats.avg} highlight />
                    <StatRow label="OBP" value={currentStats.obp} highlight />
                    <StatRow label="SLG" value={currentStats.slg} highlight />
                    <StatRow label="OPS" value={currentStats.ops} highlight />
                  </div>
                </div>

                {/* Pitching Stats */}
                <div className="glass-card p-6 hover:border-solar-gold/50">
                  <h3 className="text-xl font-display font-bold text-solar-gold mb-4 text-shadow">Pitching</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <StatRow label="IP" value={currentStats.ip?.toFixed(2)} />
                    <StatRow label="W" value={currentStats.w} />
                    <StatRow label="L" value={currentStats.l} />
                    <StatRow label="SV" value={currentStats.sv} />
                    <StatRow label="H" value={currentStats.hAllowed} />
                    <StatRow label="HR" value={currentStats.hrAllowed} />
                    <StatRow label="ERA" value={currentStats.era} highlight />
                    <StatRow label="WHIP" value={currentStats.whip} highlight />
                    <StatRow label="BAA" value={currentStats.baa} highlight />
                  </div>
                </div>

                {/* Fielding Stats */}
                <div className="glass-card p-6 hover:border-nebula-coral/50">
                  <h3 className="text-xl font-display font-bold text-nebula-coral mb-4 text-shadow">Fielding</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <StatRow label="NP" value={currentStats.np} />
                    <StatRow label="E" value={currentStats.e} />
                    <StatRow label="SB" value={currentStats.sb} />
                    <StatRow label="CS" value={currentStats.cs} />
                    <StatRow label="OAA" value={currentStats.oaa} highlight />
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-star-gray font-mono">
                  No {season === 'playoffs' ? 'playoff' : 'regular season'} stats available for this player.
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* Attributes Tab */}
      {activeTab === 'attributes' && attributes && (
        <FadeIn delay={0.15} direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Ratings */}
            <div className="glass-card p-6 hover:border-nebula-orange/50">
              <h3 className="text-xl font-display font-bold text-nebula-orange mb-4 text-shadow">Overall Ratings</h3>
              <div className="space-y-2 font-mono text-sm">
                <StatRow label="Pitching" value={attributes.pitchingOverall} highlight />
                <StatRow label="Batting" value={attributes.battingOverall} highlight />
                <StatRow label="Fielding" value={attributes.fieldingOverall} highlight />
                <StatRow label="Speed" value={attributes.speedOverall} highlight />
              </div>
            </div>

            {/* Character Info */}
            <div className="glass-card p-6 hover:border-solar-gold/50">
              <h3 className="text-xl font-display font-bold text-solar-gold mb-4 text-shadow">Character Info</h3>
              <div className="space-y-2 font-mono text-sm">
                <StatRow label="Weight" value={attributes.weight} />
                <StatRow label="Ability" value={attributes.ability} />
                <StatRow label="Arm Side" value={attributes.armSide} />
                <StatRow label="Batting Side" value={attributes.battingSide} />
                {attributes.mii === 'Yes' && (
                  <StatRow label="Mii Color" value={attributes.miiColor} />
                )}
              </div>
            </div>

            {/* Pitching Attributes */}
            <div className="glass-card p-6 hover:border-nebula-orange/50">
              <h3 className="text-xl font-display font-bold text-nebula-orange mb-4 text-shadow">Pitching</h3>
              <div className="space-y-2 font-mono text-sm">
                <StatRow label="Star Pitch" value={attributes.starPitch} />
                <StatRow label="Fastball Speed" value={attributes.fastballSpeed} />
                <StatRow label="Curveball Speed" value={attributes.curveballSpeed} />
                <StatRow label="Curve" value={attributes.curve} />
                <StatRow label="Stamina" value={attributes.stamina} />
                <StatRow label="Pitching Avg" value={attributes.pitchingAverage.toFixed(2)} highlight />
              </div>
            </div>

            {/* Hitting Attributes */}
            <div className="glass-card p-6 hover:border-nebula-coral/50">
              <h3 className="text-xl font-display font-bold text-nebula-coral mb-4 text-shadow">Hitting</h3>
              <div className="space-y-2 font-mono text-sm">
                <StatRow label="Star Swing" value={attributes.starSwing} />
                <StatRow label="Hit Trajectory" value={attributes.hittingTrajectory} />
                <StatRow label="Hit Curve" value={attributes.hitCurve} />
                <StatRow label="Slap Contact" value={attributes.slapHitContact} />
                <StatRow label="Charge Contact" value={attributes.chargeHitContact} />
                <StatRow label="Slap Power" value={attributes.slapHitPower} />
                <StatRow label="Charge Power" value={attributes.chargeHitPower} />
                <StatRow label="Pre-Charge" value={attributes.preCharge} />
                <StatRow label="Batting Avg" value={attributes.battingAverage.toFixed(2)} highlight />
              </div>
            </div>

            {/* Fielding & Speed Attributes */}
            <div className="glass-card p-6 lg:col-span-2 hover:border-comet-yellow/50">
              <h3 className="text-xl font-display font-bold text-comet-yellow mb-4 text-shadow">Fielding & Speed</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 font-mono text-sm">
                  <StatRow label="Fielding" value={attributes.fielding} />
                  <StatRow label="Throwing Speed" value={attributes.throwingSpeed} />
                  <StatRow label="Fielding Avg" value={attributes.fieldingAverage.toFixed(2)} highlight />
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <StatRow label="Speed" value={attributes.speed} />
                  <StatRow label="Bunting" value={attributes.bunting} />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Chemistry Tab */}
      {activeTab === 'chemistry' && chemistry && (
        <FadeIn delay={0.15} direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Positive Chemistry */}
            <div className="glass-card p-6 border-green-400/30 hover:border-green-400/50">
              <h3 className="text-xl font-display font-bold text-green-400 mb-4 text-shadow">
                Positive Chemistry ({chemistry.posCount})
              </h3>
              {chemistry.positive.length > 0 ? (
                <div className="max-h-96 overflow-y-auto pr-2 space-y-1">
                  {chemistry.positive.map((player, idx) => (
                    <div
                      key={idx}
                      className="text-star-gray hover:text-green-400 transition-all duration-200 font-mono text-sm py-1 px-2 rounded hover:bg-green-400/10 cursor-default"
                    >
                      {player}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-star-gray font-mono text-sm">No positive chemistry</div>
              )}
            </div>

            {/* Negative Chemistry */}
            <div className="glass-card p-6 border-red-400/30 hover:border-red-400/50">
              <h3 className="text-xl font-display font-bold text-red-400 mb-4 text-shadow">
                Negative Chemistry ({chemistry.negCount})
              </h3>
              {chemistry.negative.length > 0 ? (
                <div className="max-h-96 overflow-y-auto pr-2 space-y-1">
                  {chemistry.negative.map((player, idx) => (
                    <div
                      key={idx}
                      className="text-star-gray hover:text-red-400 transition-all duration-200 font-mono text-sm py-1 px-2 rounded hover:bg-red-400/10 cursor-default"
                    >
                      {player}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-star-gray font-mono text-sm">No negative chemistry</div>
              )}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

// Helper component for displaying stat rows
function StatRow({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  const displayValue = value === undefined || value === null ? '-' : value;

  return (
    <div className="flex justify-between items-center py-1 hover:bg-space-blue/20 transition-colors duration-200 px-2 rounded">
      <span className="text-star-gray">{label}</span>
      <span className={highlight ? 'text-nebula-orange font-semibold' : 'text-star-white'}>
        {displayValue}
      </span>
    </div>
  );
}

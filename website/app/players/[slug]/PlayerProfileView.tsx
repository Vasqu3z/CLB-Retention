'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SeasonToggle from '@/components/SeasonToggle';
import LiveStatsIndicator from '@/components/LiveStatsIndicator';
import { PlayerStats, PlayerAttributes, PlayerChemistry, PlayerRegistryEntry } from '@/lib/sheets';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import { playerNameToSlug } from '@/lib/utils';

interface PlayerProfileViewProps {
  playerName: string;
  regularStats: PlayerStats | null;
  playoffStats: PlayerStats | null;
  attributes: PlayerAttributes | null;
  chemistry: PlayerChemistry | null;
  registryEntry: PlayerRegistryEntry | null;
}

type TabType = 'stats' | 'attributes' | 'chemistry';

// Helper function to get class color
function getClassColor(characterClass: string): string {
  switch (characterClass) {
    case 'Power':
      return 'text-red-400';
    case 'Technique':
      return 'text-solar-gold';
    case 'Balanced':
      return 'text-green-400';
    case 'Speed':
      return 'text-blue-400';
    default:
      return 'text-nebula-coral';
  }
}

export default function PlayerProfileView({
  playerName,
  regularStats,
  playoffStats,
  attributes,
  chemistry,
  registryEntry,
}: PlayerProfileViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [isPlayoffs, setIsPlayoffs] = useState(false);

  const currentStats = isPlayoffs ? playoffStats : regularStats;
  const hasPlayoffStats = !!playoffStats;

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="glass-card p-6 relative">
          <div className="flex items-start gap-6">
            {/* Player Image */}
            {registryEntry?.imageUrl && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-nebula-orange/50 flex-shrink-0 hover:border-nebula-orange transition-all duration-300 hover:drop-shadow-[0_0_16px_rgba(255,107,53,0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={registryEntry.imageUrl}
                  alt={playerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  loading="eager"
                />
              </div>
            )}

            {/* Player Info */}
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent">
                {playerName}
              </h1>
              <div className="mb-4">
                <LiveStatsIndicator />
              </div>
              <div className="flex flex-wrap gap-4 text-star-gray font-mono text-sm">
                {attributes?.characterClass && (
                  <span>Class: <span className={`${getClassColor(attributes.characterClass)} font-semibold`}>{attributes.characterClass}</span></span>
                )}
                {attributes?.weight && (
                  <span>Weight: <span className="text-star-white font-semibold">{attributes.weight}</span></span>
                )}
                {attributes?.battingSide && (
                  <span>Bats: <span className="text-star-white font-semibold">{attributes.battingSide}</span></span>
                )}
                {attributes?.armSide && (
                  <span>Throws: <span className="text-star-white font-semibold">{attributes.armSide}</span></span>
                )}
                {attributes?.ability && (
                  <span>Ability: <span className="text-nebula-orange font-semibold">{attributes.ability}</span></span>
                )}
              </div>
            </div>
          </div>

          {/* Team Emblem Watermark */}
          {registryEntry?.team && (
            <div className="absolute bottom-4 right-4 w-16 h-16 opacity-20">
              <Image
                src={getTeamLogoPaths(registryEntry.team).emblem}
                alt={registryEntry.team}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
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
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
            {/* Season Toggle */}
            {hasPlayoffStats && (
              <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
            )}

            {currentStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hitting Stats */}
                <div className="glass-card p-6 hover:border-nebula-orange/50">
                  <h3 className="text-xl font-display font-bold text-nebula-orange mb-4 text-shadow">Hitting</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <StatRowWithLabel label="Games Played (GP)" value={currentStats.gp} />
                    <StatRowWithLabel label="At Bats (AB)" value={currentStats.ab} />
                    <StatRowWithLabel label="Hits (H)" value={currentStats.h} />
                    <StatRowWithLabel label="Home Runs (HR)" value={currentStats.hr} />
                    <StatRowWithLabel label="RBI" value={currentStats.rbi} />
                    <StatRowWithLabel label="Hits Robbed (ROB)" value={currentStats.rob} />
                    <StatRowWithLabel label="Double Plays (DP)" value={currentStats.dp} />
                    <StatRowWithLabel label="Batting Average (AVG)" value={currentStats.avg} highlight />
                    <StatRowWithLabel label="On-Base Percentage (OBP)" value={currentStats.obp} highlight />
                    <StatRowWithLabel label="Slugging (SLG)" value={currentStats.slg} highlight />
                    <StatRowWithLabel label="OPS" value={currentStats.ops} highlight />
                  </div>
                </div>

                {/* Pitching Stats */}
                <div className="glass-card p-6 hover:border-solar-gold/50">
                  <h3 className="text-xl font-display font-bold text-solar-gold mb-4 text-shadow">Pitching</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <StatRowWithLabel label="Innings Pitched (IP)" value={currentStats.ip?.toFixed(2)} />
                    <StatRowWithLabel label="Wins (W)" value={currentStats.w} />
                    <StatRowWithLabel label="Losses (L)" value={currentStats.l} />
                    <StatRowWithLabel label="Saves (SV)" value={currentStats.sv} />
                    <StatRowWithLabel label="Hits Allowed (H)" value={currentStats.hAllowed} />
                    <StatRowWithLabel label="Home Runs Allowed (HR)" value={currentStats.hrAllowed} />
                    <StatRowWithLabel label="ERA" value={currentStats.era} highlight />
                    <StatRowWithLabel label="WHIP" value={currentStats.whip} highlight />
                    <StatRowWithLabel label="Batting Average Against (BAA)" value={currentStats.baa} highlight />
                  </div>
                </div>

                {/* Fielding Stats */}
                <div className="glass-card p-6 hover:border-emerald-500/50">
                  <h3 className="text-xl font-display font-bold text-emerald-500 mb-4 text-shadow">Fielding</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <StatRowWithLabel label="Number of Plays (NP)" value={currentStats.np} />
                    <StatRowWithLabel label="Errors (E)" value={currentStats.e} />
                    <StatRowWithLabel label="Stolen Bases (SB)" value={currentStats.sb} />
                    <StatRowWithLabel label="Caught Stealing (CS)" value={currentStats.cs} />
                    <StatRowWithLabel label="Outs Above Average (OAA)" value={currentStats.oaa} highlight />
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-star-gray font-mono">
                  No {isPlayoffs ? 'playoff' : 'regular season'} stats available for this player.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attributes Tab */}
      {activeTab === 'attributes' && attributes && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pitching Attributes */}
            <div className="glass-card p-6 hover:border-solar-gold/50">
              <h3 className="text-xl font-display font-bold text-solar-gold mb-4 text-shadow">Pitching</h3>
              <div className="space-y-2 font-mono text-sm">
                <StatRow label="Overall" value={attributes.pitchingOverall} highlight />
                <StatRow label="Pre-Charge" value={attributes.preCharge} />
                <StatRow label="Star Pitch" value={attributes.starPitch} />
                <StatRow label="Fastball Speed" value={attributes.fastballSpeed} />
                <StatRow label="Curveball Speed" value={attributes.curveballSpeed} />
                <StatRow label="Curve" value={attributes.curve} />
                <StatRow label="Stamina" value={attributes.stamina} />
              </div>
            </div>

            {/* Hitting Attributes */}
            <div className="glass-card p-6 hover:border-nebula-orange/50">
              <h3 className="text-xl font-display font-bold text-nebula-orange mb-4 text-shadow">Hitting</h3>
              <div className="space-y-2 font-mono text-sm">
                <StatRow label="Overall" value={attributes.battingOverall} highlight />
                <StatRow label="Star Swing" value={attributes.starSwing} />
                <StatRow label="Hit Trajectory" value={attributes.hittingTrajectory} />
                <StatRow label="Hit Curve" value={attributes.hitCurve} />
                <StatRow label="Slap Contact" value={attributes.slapHitContact} />
                <StatRow label="Charge Contact" value={attributes.chargeHitContact} />
                <StatRow label="Slap Power" value={attributes.slapHitPower} />
                <StatRow label="Charge Power" value={attributes.chargeHitPower} />
              </div>
            </div>

            {/* Fielding & Speed Attributes */}
            <div className="glass-card p-6 hover:border-emerald-500/50">
              <h3 className="text-xl font-display font-bold text-emerald-500 mb-4 text-shadow">Fielding & Speed</h3>
              <div className="space-y-2 font-mono text-sm">
                <StatRow label="Fielding Overall" value={attributes.fieldingOverall} highlight />
                <StatRow label="Speed Overall" value={attributes.speedOverall} highlight />
                <StatRow label="Fielding" value={attributes.fielding} />
                <StatRow label="Throwing Speed" value={attributes.throwingSpeed} />
                <StatRow label="Speed" value={attributes.speed} />
                <StatRow label="Bunting" value={attributes.bunting} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chemistry Tab */}
      {activeTab === 'chemistry' && chemistry && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Positive Chemistry */}
            <div className="glass-card p-6 border-green-400/30 hover:border-green-400/50">
              <h3 className="text-xl font-display font-bold text-green-400 mb-4 text-shadow">
                Positive Chemistry ({chemistry.posCount})
              </h3>
              {chemistry.positive.length > 0 ? (
                <div className="max-h-96 overflow-y-auto pr-2 space-y-1" onWheel={(e) => e.stopPropagation()}>
                  {chemistry.positive.map((player, idx) => (
                    <Link
                      key={idx}
                      href={`/players/${playerNameToSlug(player)}`}
                      className="block text-star-gray hover:text-green-400 transition-all duration-200 font-mono text-sm py-1 px-2 rounded hover:bg-green-400/10 underline decoration-green-400/30 hover:decoration-green-400"
                    >
                      {player}
                    </Link>
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
                <div className="max-h-96 overflow-y-auto pr-2 space-y-1" onWheel={(e) => e.stopPropagation()}>
                  {chemistry.negative.map((player, idx) => (
                    <Link
                      key={idx}
                      href={`/players/${playerNameToSlug(player)}`}
                      className="block text-star-gray hover:text-red-400 transition-all duration-200 font-mono text-sm py-1 px-2 rounded hover:bg-red-400/10 underline decoration-red-400/30 hover:decoration-red-400"
                    >
                      {player}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-star-gray font-mono text-sm">No negative chemistry</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for displaying stat rows
function StatRowWithLabel({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  const displayValue = value === undefined || value === null ? '-' : value;

  return (
    <div className="flex justify-between items-center py-1 hover:bg-space-blue/20 transition-colors duration-200 px-2 rounded">
      <span className="text-star-gray text-xs">{label}:</span>
      <span className={highlight ? 'text-nebula-orange font-semibold' : 'text-star-white'}>
        {displayValue}
      </span>
    </div>
  );
}

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

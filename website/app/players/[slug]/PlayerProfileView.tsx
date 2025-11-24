'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SeasonToggle from '@/components/SeasonToggle';
import LiveStatsIndicator from '@/components/LiveStatsIndicator';
import { PlayerStats, PlayerAttributes, PlayerChemistry, PlayerRegistryEntry } from '@/lib/sheets';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import { playerNameToSlug } from '@/lib/utils';
import { RetroButton } from '@/components/ui/RetroButton';

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

  const panelClass =
    'relative rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.45)]';

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className={`${panelClass} p-6 lg:p-8`}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 20% 20%, #ff6b35 0%, transparent 40%)' }} />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-nebula-orange via-solar-gold to-nebula-orange" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* Player Image */}
          {registryEntry?.imageUrl && (
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-nebula-orange/60 flex-shrink-0 shadow-[0_0_25px_rgba(255,107,53,0.4)]">
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
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-4xl lg:text-5xl font-display font-black uppercase tracking-tight text-shadow-neon">
                <span className="bg-gradient-to-r from-nebula-orange via-solar-gold to-star-pink bg-clip-text text-transparent">
                  {playerName}
                </span>
              </h1>
              {registryEntry?.team && (
                <span className="px-3 py-1 rounded-sm bg-white/10 border border-white/10 text-xs font-mono uppercase tracking-[0.15em] text-white/70">
                  {registryEntry.team}
                </span>
              )}
            </div>

            <div className="mb-4">
              <LiveStatsIndicator />
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono uppercase tracking-[0.12em] text-white/70">
              {attributes?.characterClass && (
                <span className="px-3 py-2 rounded-sm bg-white/5 border border-white/10">
                  Class: <span className={`${getClassColor(attributes.characterClass)} font-bold`}>{attributes.characterClass}</span>
                </span>
              )}
              {attributes?.weight && (
                <span className="px-3 py-2 rounded-sm bg-white/5 border border-white/10">
                  Weight: <span className="text-star-white font-semibold">{attributes.weight}</span>
                </span>
              )}
              {attributes?.battingSide && (
                <span className="px-3 py-2 rounded-sm bg-white/5 border border-white/10">
                  Bats: <span className="text-star-white font-semibold">{attributes.battingSide}</span>
                </span>
              )}
              {attributes?.armSide && (
                <span className="px-3 py-2 rounded-sm bg-white/5 border border-white/10">
                  Throws: <span className="text-star-white font-semibold">{attributes.armSide}</span>
                </span>
              )}
              {attributes?.ability && (
                <span className="px-3 py-2 rounded-sm bg-white/5 border border-white/10">
                  Ability: <span className="text-nebula-orange font-semibold">{attributes.ability}</span>
                </span>
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

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3">
        <RetroButton
          variant={activeTab === 'stats' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('stats')}
          size="sm"
        >
          Stats
        </RetroButton>
        {attributes && (
          <RetroButton
            variant={activeTab === 'attributes' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('attributes')}
            size="sm"
          >
            Attributes
          </RetroButton>
        )}
        {chemistry && (
          <RetroButton
            variant={activeTab === 'chemistry' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('chemistry')}
            size="sm"
          >
            Chemistry
          </RetroButton>
        )}
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
              <div className={`${panelClass} p-6 border-nebula-orange/40`}>
                <SectionHeader title="Hitting" color="text-nebula-orange" />
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
              <div className={`${panelClass} p-6 border-solar-gold/40`}>
                <SectionHeader title="Pitching" color="text-solar-gold" />
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
              <div className={`${panelClass} p-6 border-emerald-500/40`}>
                <SectionHeader title="Fielding & Running" color="text-emerald-400" />
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
            <div className={`${panelClass} p-12 text-center`}>
              <p className="text-star-gray font-mono">
                No {isPlayoffs ? 'playoff' : 'regular season'} stats available for this player.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attributes Tab */}
      {activeTab === 'attributes' && attributes && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitching Attributes */}
          <div className={`${panelClass} p-6 border-solar-gold/40`}>
            <SectionHeader title="Pitching" color="text-solar-gold" />
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
          <div className={`${panelClass} p-6 border-nebula-orange/40`}>
            <SectionHeader title="Hitting" color="text-nebula-orange" />
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
          <div className={`${panelClass} p-6 border-emerald-500/40`}>
            <SectionHeader title="Fielding & Speed" color="text-emerald-400" />
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
      )}

      {/* Chemistry Tab */}
      {activeTab === 'chemistry' && chemistry && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Positive Chemistry */}
          <div className={`${panelClass} p-6 border-green-400/40`}>
            <SectionHeader title={`Positive Chemistry (${chemistry.posCount})`} color="text-green-400" />
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
          <div className={`${panelClass} p-6 border-red-400/40`}>
            <SectionHeader title={`Negative Chemistry (${chemistry.negCount})`} color="text-red-400" />
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
      )}
    </div>
  );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-lg font-display font-black uppercase tracking-[0.2em] ${color} flex items-center gap-2`}>
        <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
        {title}
      </h3>
      <div className="h-px flex-1 ml-4 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
    </div>
  );
}

// Helper component for displaying stat rows
function StatRowWithLabel({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  const displayValue = value === undefined || value === null ? '-' : value;

  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white/5 border border-white/5 rounded-sm hover:border-nebula-orange/40 transition-colors duration-200">
      <span className="text-white/60 text-[11px] font-mono uppercase tracking-[0.12em]">{label}</span>
      <span className={highlight ? 'text-nebula-orange font-semibold' : 'text-star-white'}>
        {displayValue}
      </span>
    </div>
  );
}

function StatRow({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  const displayValue = value === undefined || value === null ? '-' : value;

  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white/5 border border-white/5 rounded-sm hover:border-nebula-orange/40 transition-colors duration-200">
      <span className="text-white/70 font-mono text-xs uppercase tracking-[0.12em]">{label}</span>
      <span className={highlight ? 'text-nebula-orange font-semibold' : 'text-star-white'}>
        {displayValue}
      </span>
    </div>
  );
}

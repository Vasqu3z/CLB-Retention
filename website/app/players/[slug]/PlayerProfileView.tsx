'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import RetroButton from '@/components/ui/RetroButton';
import StatHighlight from '@/components/ui/StatHighlight';
import SeasonToggle from '@/components/SeasonToggle';
import { PlayerAttributes, PlayerChemistry, PlayerRegistryEntry, PlayerStats } from '@/lib/sheets';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import { playerNameToSlug } from '@/lib/utils';
import { getTeamByName } from '@/config/league';

type TabType = 'stats' | 'attributes' | 'chemistry';

type PlayerProfileViewProps = {
  playerName: string;
  regularStats: PlayerStats | null;
  playoffStats: PlayerStats | null;
  attributes: PlayerAttributes | null;
  chemistry: PlayerChemistry | null;
  registryEntry: PlayerRegistryEntry | null;
};

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

  const statHighlights = useMemo(() => {
    if (!currentStats) return [] as JSX.Element[];

    const teamColor = registryEntry?.team
      ? getTeamByName(registryEntry.team)?.primaryColor || '#00F3FF'
      : '#00F3FF';

    return [
      <StatHighlight
        key="avg"
        label="AVG"
        value={currentStats.avg || '-'}
        subtext={isPlayoffs ? 'Playoffs' : 'Season'}
        glowColor={teamColor}
        size="sm"
      />,
      <StatHighlight
        key="ops"
        label="OPS"
        value={currentStats.ops || '-'}
        subtext="On-base + Slugging"
        glowColor="#F4D03F"
        size="sm"
      />,
      <StatHighlight
        key="era"
        label="ERA"
        value={currentStats.era || '-'}
        subtext="Pitching"
        glowColor="#FF4D4D"
        size="sm"
      />,
    ];
  }, [currentStats, registryEntry?.team, isPlayoffs]);

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-black/70 via-surface-dark/80 to-black/70 p-6 shadow-[0_0_32px_rgba(0,243,255,0.14)]">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(0,243,255,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,77,77,0.2),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-6 items-start">
            {registryEntry?.imageUrl && (
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_18px_rgba(0,243,255,0.35)]">
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
            <div>
              <p className="font-mono text-sm uppercase text-white/60">Player Profile</p>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-3">
                {playerName}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm font-mono text-white/80">
                {registryEntry?.team && <Badge label={`Team: ${registryEntry.team}`} />}
                {attributes?.characterClass && <Badge label={`Class: ${attributes.characterClass}`} />}
                {attributes?.battingSide && <Badge label={`Bats: ${attributes.battingSide}`} />}
                {attributes?.armSide && <Badge label={`Throws: ${attributes.armSide}`} />}
                {attributes?.ability && <Badge label={`Ability: ${attributes.ability}`} accent="cyan" />}
              </div>
            </div>
          </div>
          {registryEntry?.team && (
            <div className="opacity-30 lg:opacity-100">
              <Image
                src={getTeamLogoPaths(registryEntry.team).emblem}
                alt={registryEntry.team}
                width={96}
                height={96}
                className="object-contain"
              />
            </div>
          )}
        </div>
      </header>

      {currentStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="presentation">
          {statHighlights}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <RetroButton
          size="sm"
          variant={activeTab === 'stats' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </RetroButton>
        {attributes && (
          <RetroButton
            size="sm"
            variant={activeTab === 'attributes' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('attributes')}
          >
            Attributes
          </RetroButton>
        )}
        {chemistry && (
          <RetroButton
            size="sm"
            variant={activeTab === 'chemistry' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('chemistry')}
          >
            Chemistry
          </RetroButton>
        )}
        {hasPlayoffStats && (
          <div className="ml-auto">
            <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
          </div>
        )}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {currentStats ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SectionCard title="Hitting" accent="from-comets-cyan/25 to-comets-purple/20">
                <div className="space-y-2 font-mono text-sm">
                  <StatRowWithLabel label="Games Played (GP)" value={currentStats.gp} />
                  <StatRowWithLabel label="At Bats (AB)" value={currentStats.ab} />
                  <StatRowWithLabel label="Hits (H)" value={currentStats.h} />
                  <StatRowWithLabel label="Home Runs (HR)" value={currentStats.hr} />
                  <StatRowWithLabel label="RBI" value={currentStats.rbi} />
                  <StatRowWithLabel label="Hits Robbed (ROB)" value={currentStats.rob} />
                  <StatRowWithLabel label="Double Plays (DP)" value={currentStats.dp} />
                  <StatRowWithLabel label="AVG" value={currentStats.avg} highlight />
                  <StatRowWithLabel label="OBP" value={currentStats.obp} highlight />
                  <StatRowWithLabel label="SLG" value={currentStats.slg} highlight />
                  <StatRowWithLabel label="OPS" value={currentStats.ops} highlight />
                </div>
              </SectionCard>

              <SectionCard title="Pitching" accent="from-comets-yellow/25 to-comets-red/20">
                <div className="space-y-2 font-mono text-sm">
                  <StatRowWithLabel label="Innings Pitched (IP)" value={currentStats.ip?.toFixed(2)} />
                  <StatRowWithLabel label="Wins (W)" value={currentStats.w} />
                  <StatRowWithLabel label="Losses (L)" value={currentStats.l} />
                  <StatRowWithLabel label="Saves (SV)" value={currentStats.sv} />
                  <StatRowWithLabel label="Hits Allowed (H)" value={currentStats.hAllowed} />
                  <StatRowWithLabel label="Home Runs Allowed (HR)" value={currentStats.hrAllowed} />
                  <StatRowWithLabel label="ERA" value={currentStats.era} highlight />
                  <StatRowWithLabel label="WHIP" value={currentStats.whip} highlight />
                  <StatRowWithLabel label="BAA" value={currentStats.baa} highlight />
                </div>
              </SectionCard>

              <SectionCard title="Fielding & Running" accent="from-emerald-400/25 to-comets-cyan/15">
                <div className="space-y-2 font-mono text-sm">
                  <StatRowWithLabel label="Number of Plays (NP)" value={currentStats.np} />
                  <StatRowWithLabel label="Errors (E)" value={currentStats.e} />
                  <StatRowWithLabel label="Stolen Bases (SB)" value={currentStats.sb} />
                  <StatRowWithLabel label="Caught Stealing (CS)" value={currentStats.cs} />
                  <StatRowWithLabel label="Outs Above Average (OAA)" value={currentStats.oaa} highlight />
                </div>
              </SectionCard>
            </div>
          ) : (
            <SectionCard title="No stats yet" accent="from-white/10 to-white/5">
              <p className="text-white/70 font-mono text-sm">
                No {isPlayoffs ? 'playoff' : 'regular season'} stats available for this player.
              </p>
            </SectionCard>
          )}
        </div>
      )}

      {activeTab === 'attributes' && attributes && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionCard title="Pitching" accent="from-comets-yellow/25 to-comets-red/20">
            <div className="space-y-2 font-mono text-sm">
              <StatRow label="Overall" value={attributes.pitchingOverall} highlight />
              <StatRow label="Pre-Charge" value={attributes.preCharge} />
              <StatRow label="Star Pitch" value={attributes.starPitch} />
              <StatRow label="Fastball Speed" value={attributes.fastballSpeed} />
              <StatRow label="Curveball Speed" value={attributes.curveballSpeed} />
              <StatRow label="Curve" value={attributes.curve} />
              <StatRow label="Stamina" value={attributes.stamina} />
            </div>
          </SectionCard>

          <SectionCard title="Hitting" accent="from-comets-cyan/25 to-comets-purple/20">
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
          </SectionCard>

          <SectionCard title="Fielding & Speed" accent="from-emerald-400/25 to-comets-cyan/15">
            <div className="space-y-2 font-mono text-sm">
              <StatRow label="Fielding Overall" value={attributes.fieldingOverall} highlight />
              <StatRow label="Speed Overall" value={attributes.speedOverall} highlight />
              <StatRow label="Fielding" value={attributes.fielding} />
              <StatRow label="Throwing Speed" value={attributes.throwingSpeed} />
              <StatRow label="Speed" value={attributes.speed} />
              <StatRow label="Bunting" value={attributes.bunting} />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'chemistry' && chemistry && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title={`Positive Chemistry (${chemistry.posCount})`} accent="from-emerald-400/20 to-comets-cyan/15">
            {chemistry.positive.length > 0 ? (
              <div className="max-h-96 overflow-y-auto pr-2 space-y-2" onWheel={(e) => e.stopPropagation()}>
                {chemistry.positive.map((player, idx) => (
                  <Link
                    key={idx}
                    href={`/players/${playerNameToSlug(player)}`}
                    className="block rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-comets-cyan/10 hover:text-white transition"
                  >
                    {player}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-white/70 font-mono text-sm">No positive chemistry</p>
            )}
          </SectionCard>

          <SectionCard title={`Negative Chemistry (${chemistry.negCount})`} accent="from-comets-red/20 to-comets-yellow/15">
            {chemistry.negative.length > 0 ? (
              <div className="max-h-96 overflow-y-auto pr-2 space-y-2" onWheel={(e) => e.stopPropagation()}>
                {chemistry.negative.map((player, idx) => (
                  <Link
                    key={idx}
                    href={`/players/${playerNameToSlug(player)}`}
                    className="block rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-comets-red/20 hover:text-white transition"
                  >
                    {player}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-white/70 font-mono text-sm">No negative chemistry</p>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-dark/80 shadow-[0_0_24px_rgba(0,243,255,0.12)] overflow-hidden">
      <div className={`px-4 py-3 border-b border-white/10 bg-gradient-to-r ${accent}`}>
        <h3 className="text-lg font-display font-bold text-white text-shadow">{title}</h3>
      </div>
      <div className="p-6 space-y-3">{children}</div>
    </div>
  );
}

function StatRowWithLabel({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  const displayValue = value === undefined || value === null ? '-' : value;

  return (
    <div className="flex justify-between items-center py-1 px-2 rounded-md bg-white/0 hover:bg-white/5 transition">
      <span className="text-white/60 text-xs uppercase tracking-wide">{label}</span>
      <span className={highlight ? 'text-comets-yellow font-semibold' : 'text-white'}>{displayValue}</span>
    </div>
  );
}

function StatRow({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  const displayValue = value === undefined || value === null ? '-' : value;

  return (
    <div className="flex justify-between items-center py-1 px-2 rounded-md bg-white/0 hover:bg-white/5 transition">
      <span className="text-white/80">{label}</span>
      <span className={highlight ? 'text-comets-yellow font-semibold' : 'text-white'}>{displayValue}</span>
    </div>
  );
}

function Badge({ label, accent = 'orange' }: { label: string; accent?: 'orange' | 'cyan' }) {
  const accentClass = accent === 'cyan' ? 'from-comets-cyan/40 to-comets-purple/30' : 'from-comets-yellow/50 to-comets-red/30';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r ${accentClass} border border-white/10 shadow-[0_0_12px_rgba(255,255,255,0.15)]`}>
      {label}
    </span>
  );
}

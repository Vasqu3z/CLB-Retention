'use client';

import { ReactNode, useState } from 'react';
import { PlayerStats } from '@/lib/sheets';
import PlayerMultiSelect from '@/components/PlayerMultiSelect';
import SeasonToggle from '@/components/SeasonToggle';
import useLenisScrollLock from '@/hooks/useLenisScrollLock';
import LiveStatsIndicator from '@/components/LiveStatsIndicator';
import { RetroButton } from '@/components/ui/RetroButton';

type StatTab = 'hitting' | 'pitching' | 'fielding';

interface Props {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
}

export default function StatsComparisonView({ regularPlayers, playoffPlayers }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<StatTab>('hitting');

  const activePlayers = isPlayoffs ? playoffPlayers : regularPlayers;

  const selectedPlayers = selectedPlayerNames
    .map(name => activePlayers.find(p => p.name === name))
    .filter((p): p is PlayerStats => p !== undefined);

  // Get players available in the active season
  const availablePlayerNames = activePlayers.map(p => p.name).sort();

  const panelClass =
    'relative rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.45)]';

  return (
    <div className="space-y-6">
      <div className={`${panelClass} p-6 lg:p-8`}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 15% 20%, #22d1ee 0%, transparent 45%)' }} />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-sm bg-white/10 border border-white/10 text-[11px] font-mono uppercase tracking-[0.2em] text-white/70">Tool</span>
            <h1 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tight text-shadow-neon">
              <span className="bg-gradient-to-r from-field-green via-nebula-teal to-solar-gold bg-clip-text text-transparent">Stats Comparator</span>
            </h1>
          </div>
          <p className="text-white/70 font-mono text-sm lg:text-base">Compare 2-5 players side-by-side for hitting, pitching, and fielding statistics.</p>
          <LiveStatsIndicator />
        </div>
      </div>

      {/* Season Toggle */}
      <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />

      {/* Stat Category Tabs */}
      <div className={`${panelClass} p-4 flex flex-wrap gap-3`}>
        <RetroButton
          onClick={() => setActiveTab('hitting')}
          variant={activeTab === 'hitting' ? 'primary' : 'outline'}
          size="sm"
          className="flex-1"
        >
          Hitting
        </RetroButton>
        <RetroButton
          onClick={() => setActiveTab('pitching')}
          variant={activeTab === 'pitching' ? 'primary' : 'outline'}
          size="sm"
          className="flex-1"
        >
          Pitching
        </RetroButton>
        <RetroButton
          onClick={() => setActiveTab('fielding')}
          variant={activeTab === 'fielding' ? 'primary' : 'outline'}
          size="sm"
          className="flex-1"
        >
          Fielding & Running
        </RetroButton>
      </div>

      {/* Player Selection */}
      <div className={`${panelClass} p-4 lg:p-6`}>
        <PlayerMultiSelect
          className="mb-2"
          players={availablePlayerNames}
          selectedPlayers={selectedPlayerNames}
          onSelectionChange={setSelectedPlayerNames}
          maxSelections={5}
          placeholder={`Search ${isPlayoffs ? 'playoff' : 'regular season'} players...`}
        />
        <p className="text-white/60 font-mono text-xs uppercase tracking-[0.14em]">Select at least 2 players to view the retro comparison grid.</p>
      </div>

      {/* Comparison Tables */}
      {selectedPlayers.length >= 2 && (
        <div className="space-y-6">
          {/* Hitting Stats */}
          {activeTab === 'hitting' && (
            <div className={`${panelClass} overflow-hidden`}>
              <div className="bg-gradient-to-r from-nebula-orange/30 to-nebula-coral/30 px-4 py-3 border-b border-white/10">
                <h3 className="text-lg font-display font-black uppercase tracking-[0.18em] text-nebula-orange">Hitting Statistics</h3>
              </div>
              <ScrollableTable>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/60">
                      <th className="px-4 py-3 text-left font-display font-bold text-nebula-orange sticky left-0 bg-black/80 backdrop-blur-md z-10 border-r border-white/10">
                        Stat
                      </th>
                      {selectedPlayers.map(player => (
                        <th
                          key={player.name}
                          className="px-4 py-3 text-center font-display font-semibold text-star-white min-w-[120px] uppercase tracking-[0.14em]"
                        >
                          {player.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <StatRow label="GP" players={selectedPlayers} getValue={p => p.gp} numeric />
                    <StatRow label="AB" players={selectedPlayers} getValue={p => p.ab} numeric />
                    <StatRow label="H" players={selectedPlayers} getValue={p => p.h} numeric />
                    <StatRow label="HR" players={selectedPlayers} getValue={p => p.hr} numeric />
                    <StatRow label="RBI" players={selectedPlayers} getValue={p => p.rbi} numeric />
                    <StatRow label="Hits Robbed (ROB)" players={selectedPlayers} getValue={p => p.rob} numeric />
                    <StatRow label="Double Plays Hit Into (DP)" players={selectedPlayers} getValue={p => p.dp} numeric />
                    <StatRow label="AVG" players={selectedPlayers} getValue={p => p.avg} highlight />
                    <StatRow label="OBP" players={selectedPlayers} getValue={p => p.obp} highlight />
                    <StatRow label="SLG" players={selectedPlayers} getValue={p => p.slg} highlight />
                    <StatRow label="OPS" players={selectedPlayers} getValue={p => p.ops} highlight />
                  </tbody>
                </table>
              </ScrollableTable>
            </div>
          )}

          {/* Pitching Stats */}
          {activeTab === 'pitching' && (
            <div className={`${panelClass} overflow-hidden`}>
              <div className="bg-gradient-to-r from-solar-gold/30 to-comet-yellow/30 px-4 py-3 border-b border-white/10">
                <h3 className="text-lg font-display font-black uppercase tracking-[0.18em] text-solar-gold">Pitching Statistics</h3>
              </div>
              <ScrollableTable>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/60">
                      <th className="px-4 py-3 text-left font-display font-bold text-solar-gold sticky left-0 bg-black/80 backdrop-blur-md z-10 border-r border-white/10">
                        Stat
                      </th>
                      {selectedPlayers.map(player => (
                        <th
                          key={player.name}
                          className="px-4 py-3 text-center font-display font-semibold text-star-white min-w-[120px] uppercase tracking-[0.14em]"
                        >
                          {player.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <StatRow label="IP" players={selectedPlayers} getValue={p => p.ip} numeric />
                    <StatRow label="W" players={selectedPlayers} getValue={p => p.w} numeric />
                    <StatRow label="L" players={selectedPlayers} getValue={p => p.l} numeric />
                    <StatRow label="SV" players={selectedPlayers} getValue={p => p.sv} numeric />
                    <StatRow label="H" players={selectedPlayers} getValue={p => p.hAllowed} numeric />
                    <StatRow label="HR" players={selectedPlayers} getValue={p => p.hrAllowed} numeric />
                    <StatRow label="ERA" players={selectedPlayers} getValue={p => p.era} highlight />
                    <StatRow label="WHIP" players={selectedPlayers} getValue={p => p.whip} highlight />
                    <StatRow label="BAA" players={selectedPlayers} getValue={p => p.baa} highlight />
                  </tbody>
                </table>
              </ScrollableTable>
            </div>
          )}

          {/* Fielding Stats */}
          {activeTab === 'fielding' && (
            <div className={`${panelClass} overflow-hidden`}>
              <div className="bg-gradient-to-r from-field-green/30 to-nebula-teal/30 px-4 py-3 border-b border-white/10">
                <h3 className="text-lg font-display font-black uppercase tracking-[0.18em] text-field-green">Fielding & Running Statistics</h3>
              </div>
              <ScrollableTable>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/60">
                      <th className="px-4 py-3 text-left font-display font-bold text-field-green sticky left-0 bg-black/80 backdrop-blur-md z-10 border-r border-white/10">
                        Stat
                      </th>
                      {selectedPlayers.map(player => (
                        <th
                          key={player.name}
                          className="px-4 py-3 text-center font-display font-semibold text-star-white min-w-[120px] uppercase tracking-[0.14em]"
                        >
                          {player.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <StatRow label="NP" players={selectedPlayers} getValue={p => p.np} numeric />
                    <StatRow label="E" players={selectedPlayers} getValue={p => p.e} numeric />
                    <StatRow label="OAA" players={selectedPlayers} getValue={p => p.oaa} numeric highlight />
                    <StatRow label="SB" players={selectedPlayers} getValue={p => p.sb} numeric />
                    <StatRow label="CS" players={selectedPlayers} getValue={p => p.cs} numeric />
                  </tbody>
                </table>
              </ScrollableTable>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StatRowProps {
  label: string;
  players: PlayerStats[];
  getValue: (player: PlayerStats) => string | number | undefined;
  numeric?: boolean;
  highlight?: boolean;
}

function StatRow({ label, players, getValue, numeric = false, highlight = false }: StatRowProps) {
  const values = players.map(p => getValue(p));

  // Find max value for numeric highlighting (only for counting stats, not rate stats)
  const maxValue = numeric && !highlight
    ? Math.max(...values.map(v => typeof v === 'number' ? v : 0))
    : null;

  return (
    <tr className="border-b border-cosmic-border hover:bg-space-blue/20 transition-colors duration-200">
      <td className={`px-4 py-2 font-medium text-star-gray sticky left-0 bg-space-navy/90 backdrop-blur-md border-r border-cosmic-border ${highlight ? 'font-bold text-star-white' : ''}`}>
        {label}
      </td>
      {players.map((player) => {
        const value = getValue(player);
        const isMax = numeric && maxValue !== null && value === maxValue && (value as number) > 0;
        const displayValue = value !== undefined && value !== null && value !== 0 ? value : '-';

        return (
          <td
            key={player.name}
            className={`px-4 py-2 text-center ${
              isMax ? 'bg-green-400/20 font-bold text-green-400' : 'text-star-white'
            } ${highlight ? 'font-semibold text-nebula-orange' : ''}`}
          >
            {displayValue}
          </td>
        );
      })}
    </tr>
  );
}

function ScrollableTable({ children }: { children: ReactNode }) {
  const ref = useLenisScrollLock<HTMLDivElement>();

  return (
    <div ref={ref} className="relative overflow-auto max-h-[70vh]" onWheel={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}

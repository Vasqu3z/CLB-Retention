'use client';

import { ReactNode, useState } from 'react';
import { PlayerStats } from '@/lib/sheets';
import PlayerMultiSelect from '@/components/PlayerMultiSelect';
import SeasonToggle from '@/components/SeasonToggle';
import useLenisScrollLock from '@/hooks/useLenisScrollLock';

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

  // Get unique player names from both datasets
  const allPlayerNames = Array.from(
    new Set([...regularPlayers.map(p => p.name), ...playoffPlayers.map(p => p.name)])
  ).sort();

  // Get players available in the active season
  const availablePlayerNames = activePlayers.map(p => p.name).sort();

  return (
    <div className="space-y-8">
      <div className="relative">
        {/* Baseball stitching accent */}
        <div className="absolute -left-4 top-0 w-1 h-24 bg-gradient-to-b from-field-green/50 to-transparent rounded-full" />

        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-field-green via-nebula-teal to-solar-gold bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          📊 Player Stats Comparison
        </h1>
        <p className="text-star-gray font-mono text-lg">
          Compare 2-5 players side-by-side for hitting, pitching, and fielding statistics
        </p>
      </div>

      {/* Season Toggle */}
      <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />

      {/* Stat Category Tabs */}
      <div className="glass-card p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('hitting')}
              className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
                activeTab === 'hitting'
                  ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                  : 'text-star-gray hover:text-star-white hover:bg-space-blue/30'
              }`}
            >
              Hitting
            </button>
            <button
              onClick={() => setActiveTab('pitching')}
              className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
                activeTab === 'pitching'
                  ? 'bg-gradient-to-r from-solar-gold to-comet-yellow text-space-black shadow-lg'
                  : 'text-star-gray hover:text-star-white hover:bg-space-blue/30'
              }`}
            >
              Pitching
            </button>
            <button
              onClick={() => setActiveTab('fielding')}
              className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
                activeTab === 'fielding'
                  ? 'bg-gradient-to-r from-field-green to-nebula-teal text-white shadow-lg'
                  : 'text-star-gray hover:text-star-white hover:bg-space-blue/30'
              }`}
            >
              Fielding
            </button>
          </div>
      </div>

      {/* Player Selection */}
      <PlayerMultiSelect
        className="mb-2"
        players={availablePlayerNames}
        selectedPlayers={selectedPlayerNames}
        onSelectionChange={setSelectedPlayerNames}
        maxSelections={5}
        placeholder={`Search ${isPlayoffs ? 'playoff' : 'regular season'} players...`}
      />

      {/* Comparison Tables */}
      {selectedPlayers.length >= 2 && (
        <div className="space-y-6">
          {/* Hitting Stats */}
          {activeTab === 'hitting' && (
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-nebula-orange/30 to-nebula-coral/30 px-4 py-3 border-b border-cosmic-border">
                <h3 className="text-lg font-display font-bold text-nebula-orange text-shadow">⚾ Hitting Statistics</h3>
              </div>
              <ScrollableTable>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-space-blue/30 border-b border-cosmic-border">
                      <th className="px-4 py-3 text-left font-display font-bold text-nebula-orange sticky left-0 bg-space-navy/90 backdrop-blur-md z-10 border-r border-cosmic-border">
                        Stat
                      </th>
                      {selectedPlayers.map(player => (
                        <th
                          key={player.name}
                          className="px-4 py-3 text-center font-display font-bold text-star-white min-w-[120px]"
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
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/30 to-green-400/30 px-4 py-3 border-b border-cosmic-border">
                <h3 className="text-lg font-display font-bold text-green-400 text-shadow">🎯 Pitching Statistics</h3>
              </div>
              <ScrollableTable>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-space-blue/30 border-b border-cosmic-border">
                      <th className="px-4 py-3 text-left font-display font-bold text-green-400 sticky left-0 bg-space-navy/90 backdrop-blur-md z-10 border-r border-cosmic-border">
                        Stat
                      </th>
                      {selectedPlayers.map(player => (
                        <th
                          key={player.name}
                          className="px-4 py-3 text-center font-display font-bold text-star-white min-w-[120px]"
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
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-comet-yellow/30 to-nebula-orange/30 px-4 py-3 border-b border-cosmic-border">
                <h3 className="text-lg font-display font-bold text-comet-yellow text-shadow">🧤 Fielding Statistics</h3>
              </div>
              <ScrollableTable>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-space-blue/30 border-b border-cosmic-border">
                      <th className="px-4 py-3 text-left font-display font-bold text-comet-yellow sticky left-0 bg-space-navy/90 backdrop-blur-md z-10 border-r border-cosmic-border">
                        Stat
                      </th>
                      {selectedPlayers.map(player => (
                        <th
                          key={player.name}
                          className="px-4 py-3 text-center font-display font-bold text-star-white min-w-[120px]"
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
    <div ref={ref} className="relative overflow-auto max-h-[70vh]">
      {children}
    </div>
  );
}

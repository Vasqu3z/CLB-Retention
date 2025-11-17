'use client';

import { useState } from 'react';
import { PlayerStats } from '@/lib/sheets';

interface Props {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
}

export default function StatsComparisonView({ regularPlayers, playoffPlayers }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);
  const [isPlayoffs, setIsPlayoffs] = useState(false);

  const activePlayers = isPlayoffs ? playoffPlayers : regularPlayers;

  const selectedPlayers = selectedPlayerNames
    .map(name => activePlayers.find(p => p.name === name))
    .filter((p): p is PlayerStats => p !== undefined);

  // Get unique player names from both datasets
  const allPlayerNames = Array.from(
    new Set([...regularPlayers.map(p => p.name), ...playoffPlayers.map(p => p.name)])
  ).sort();

  const handlePlayerToggle = (playerName: string) => {
    if (selectedPlayerNames.includes(playerName)) {
      setSelectedPlayerNames(selectedPlayerNames.filter(n => n !== playerName));
    } else if (selectedPlayerNames.length < 5) {
      setSelectedPlayerNames([...selectedPlayerNames, playerName]);
    }
  };

  const handleClearAll = () => {
    setSelectedPlayerNames([]);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent text-shadow-glow-orange">
            📊 Player Stats Comparison
          </h1>
          <p className="text-star-gray font-mono text-lg">
            Compare 2-5 players side-by-side for hitting, pitching, and fielding statistics
          </p>
        </div>

        {/* Season Toggle */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-star-white">Season:</span>
            <button
              onClick={() => setIsPlayoffs(false)}
              className={`px-4 py-2 rounded-lg font-display font-semibold transition-all duration-300 ${
                !isPlayoffs
                  ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                  : 'bg-space-blue/50 text-star-gray hover:text-star-white hover:bg-space-blue/70 border border-cosmic-border'
              }`}
            >
              Regular Season
            </button>
            <button
              onClick={() => setIsPlayoffs(true)}
              className={`px-4 py-2 rounded-lg font-display font-semibold transition-all duration-300 ${
                isPlayoffs
                  ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                  : 'bg-space-blue/50 text-star-gray hover:text-star-white hover:bg-space-blue/70 border border-cosmic-border'
              }`}
            >
              Playoffs
            </button>
          </div>
        </div>

        {/* Player Selection */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-star-white">
              Select Players <span className="text-nebula-orange">({selectedPlayerNames.length}/5)</span>
            </h2>
            {selectedPlayerNames.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-400 hover:text-red-300 font-display font-semibold transition-colors duration-200"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {allPlayerNames.map(playerName => {
              const isSelected = selectedPlayerNames.includes(playerName);
              const isDisabled = !isSelected && selectedPlayerNames.length >= 5;
              const existsInActiveSeason = activePlayers.some(p => p.name === playerName);

              return (
                <button
                  key={playerName}
                  onClick={() => handlePlayerToggle(playerName)}
                  disabled={isDisabled || !existsInActiveSeason}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-300
                    ${isSelected
                      ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : !existsInActiveSeason
                      ? 'bg-space-blue/10 text-star-dim/50 cursor-not-allowed border border-cosmic-border/30'
                      : isDisabled
                      ? 'bg-space-blue/20 text-star-dim cursor-not-allowed border border-cosmic-border'
                      : 'bg-space-blue/50 text-star-gray hover:text-star-white hover:bg-space-blue/70 hover:border-nebula-orange/50 border border-cosmic-border'
                    }
                  `}
                  title={!existsInActiveSeason ? `No ${isPlayoffs ? 'playoff' : 'regular season'} data` : ''}
                >
                  {playerName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Tables */}
        {selectedPlayers.length >= 2 ? (
          <div className="space-y-6">
            {/* Hitting Stats */}
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-nebula-orange/30 to-nebula-coral/30 px-4 py-3 border-b border-cosmic-border">
                <h3 className="text-lg font-display font-bold text-nebula-orange text-shadow">⚾ Hitting Statistics</h3>
              </div>
              <div className="overflow-x-auto">
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
                    <StatRow label="ROB" players={selectedPlayers} getValue={p => p.rob} numeric />
                    <StatRow label="DP" players={selectedPlayers} getValue={p => p.dp} numeric />
                    <StatRow label="AVG" players={selectedPlayers} getValue={p => p.avg} highlight />
                    <StatRow label="OBP" players={selectedPlayers} getValue={p => p.obp} highlight />
                    <StatRow label="SLG" players={selectedPlayers} getValue={p => p.slg} highlight />
                    <StatRow label="OPS" players={selectedPlayers} getValue={p => p.ops} highlight />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pitching Stats */}
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/30 to-green-400/30 px-4 py-3 border-b border-cosmic-border">
                <h3 className="text-lg font-display font-bold text-green-400 text-shadow">🎯 Pitching Statistics</h3>
              </div>
              <div className="overflow-x-auto">
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
              </div>
            </div>

            {/* Fielding Stats */}
            <div className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-comet-yellow/30 to-nebula-orange/30 px-4 py-3 border-b border-cosmic-border">
                <h3 className="text-lg font-display font-bold text-comet-yellow text-shadow">🧤 Fielding Statistics</h3>
              </div>
              <div className="overflow-x-auto">
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
              </div>
            </div>
          </div>
        ) : selectedPlayers.length === 1 ? (
          <div className="glass-card p-8 text-center border-nebula-orange/30">
            <p className="text-nebula-orange text-lg font-display font-semibold">
              Please select at least one more player to compare
            </p>
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-star-gray text-lg font-mono">
              Select 2-5 players above to start comparing statistics
            </p>
          </div>
        )}
      </div>
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

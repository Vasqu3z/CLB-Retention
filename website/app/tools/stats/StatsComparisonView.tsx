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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Player Stats Comparison
          </h1>
          <p className="text-gray-600">
            Compare 2-5 players side-by-side for hitting, pitching, and fielding statistics
          </p>
        </div>

        {/* Season Toggle */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-900">Season:</span>
            <button
              onClick={() => setIsPlayoffs(false)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                !isPlayoffs
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Regular Season
            </button>
            <button
              onClick={() => setIsPlayoffs(true)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isPlayoffs
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Playoffs
            </button>
          </div>
        </div>

        {/* Player Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Players ({selectedPlayerNames.length}/5)
            </h2>
            {selectedPlayerNames.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
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
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : !existsInActiveSeason
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <div className="bg-orange-100 px-4 py-3 border-b border-orange-200">
                <h3 className="text-lg font-bold text-gray-900">⚾ Hitting Statistics</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10">
                      Stat
                    </th>
                    {selectedPlayers.map(player => (
                      <th
                        key={player.name}
                        className="px-4 py-3 text-center font-semibold text-gray-900 min-w-[120px]"
                      >
                        {player.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
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

            {/* Pitching Stats */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                <h3 className="text-lg font-bold text-gray-900">🎯 Pitching Statistics</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10">
                      Stat
                    </th>
                    {selectedPlayers.map(player => (
                      <th
                        key={player.name}
                        className="px-4 py-3 text-center font-semibold text-gray-900 min-w-[120px]"
                      >
                        {player.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
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

            {/* Fielding Stats */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                <h3 className="text-lg font-bold text-gray-900">🧤 Fielding Statistics</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10">
                      Stat
                    </th>
                    {selectedPlayers.map(player => (
                      <th
                        key={player.name}
                        className="px-4 py-3 text-center font-semibold text-gray-900 min-w-[120px]"
                      >
                        {player.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <StatRow label="NP" players={selectedPlayers} getValue={p => p.np} numeric />
                  <StatRow label="E" players={selectedPlayers} getValue={p => p.e} numeric />
                  <StatRow label="OAA" players={selectedPlayers} getValue={p => p.oaa} numeric highlight />
                  <StatRow label="SB" players={selectedPlayers} getValue={p => p.sb} numeric />
                  <StatRow label="CS" players={selectedPlayers} getValue={p => p.cs} numeric />
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedPlayers.length === 1 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-800 text-lg">
              Please select at least one more player to compare
            </p>
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
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
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className={`px-4 py-2 font-medium text-gray-700 sticky left-0 bg-white ${highlight ? 'font-bold' : ''}`}>
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
              isMax ? 'bg-green-100 font-bold text-green-900' : 'text-gray-900'
            } ${highlight ? 'font-semibold' : ''}`}
          >
            {displayValue}
          </td>
        );
      })}
    </tr>
  );
}

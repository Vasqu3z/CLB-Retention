'use client';

import { useState } from 'react';
import { PlayerAttributes } from '@/lib/sheets';

interface Props {
  players: PlayerAttributes[];
}

export default function AttributeComparisonView({ players }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);

  const selectedPlayers = selectedPlayerNames
    .map(name => players.find(p => p.name === name))
    .filter((p): p is PlayerAttributes => p !== undefined);

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
            ⚾ Player Attribute Comparison
          </h1>
          <p className="text-gray-600">
            Compare 2-5 players side-by-side across all 30 attributes
          </p>
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
            {players.map(player => {
              const isSelected = selectedPlayerNames.includes(player.name);
              const isDisabled = !isSelected && selectedPlayerNames.length >= 5;

              return (
                <button
                  key={player.name}
                  onClick={() => handlePlayerToggle(player.name)}
                  disabled={isDisabled}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  {player.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedPlayers.length >= 2 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10">
                    Attribute
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
                {/* Character Info Section */}
                <tr className="bg-blue-50">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-bold text-gray-900">
                    Character Info
                  </td>
                </tr>
                <AttributeRow label="Class" players={selectedPlayers} getValue={p => p.characterClass} />
                <AttributeRow label="Captain" players={selectedPlayers} getValue={p => p.captain} />
                <AttributeRow label="Mii" players={selectedPlayers} getValue={p => p.mii} />
                <AttributeRow label="Mii Color" players={selectedPlayers} getValue={p => p.miiColor} />
                <AttributeRow label="Batting Side" players={selectedPlayers} getValue={p => p.battingSide} />
                <AttributeRow label="Arm Side" players={selectedPlayers} getValue={p => p.armSide} />
                <AttributeRow label="Weight" players={selectedPlayers} getValue={p => p.weight} />
                <AttributeRow label="Ability" players={selectedPlayers} getValue={p => p.ability} />

                {/* Overall Stats Section */}
                <tr className="bg-purple-50">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-bold text-gray-900">
                    Overall Stats
                  </td>
                </tr>
                <AttributeRow label="Pitching Overall" players={selectedPlayers} getValue={p => p.pitchingOverall} numeric />
                <AttributeRow label="Batting Overall" players={selectedPlayers} getValue={p => p.battingOverall} numeric />
                <AttributeRow label="Fielding Overall" players={selectedPlayers} getValue={p => p.fieldingOverall} numeric />
                <AttributeRow label="Speed Overall" players={selectedPlayers} getValue={p => p.speedOverall} numeric />

                {/* Pitching Attributes Section */}
                <tr className="bg-green-50">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-bold text-gray-900">
                    Pitching Attributes
                  </td>
                </tr>
                <AttributeRow label="Star Pitch" players={selectedPlayers} getValue={p => p.starPitch} />
                <AttributeRow label="Fastball Speed" players={selectedPlayers} getValue={p => p.fastballSpeed} numeric />
                <AttributeRow label="Curveball Speed" players={selectedPlayers} getValue={p => p.curveballSpeed} numeric />
                <AttributeRow label="Curve" players={selectedPlayers} getValue={p => p.curve} numeric />
                <AttributeRow label="Stamina" players={selectedPlayers} getValue={p => p.stamina} numeric />
                <AttributeRow label="Pitching Average" players={selectedPlayers} getValue={p => p.pitchingAverage} numeric highlight />

                {/* Hitting Attributes Section */}
                <tr className="bg-orange-50">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-bold text-gray-900">
                    Hitting Attributes
                  </td>
                </tr>
                <AttributeRow label="Star Swing" players={selectedPlayers} getValue={p => p.starSwing} />
                <AttributeRow label="Hit Curve" players={selectedPlayers} getValue={p => p.hitCurve} numeric />
                <AttributeRow label="Hitting Trajectory" players={selectedPlayers} getValue={p => p.hittingTrajectory} />
                <AttributeRow label="Slap Hit Contact" players={selectedPlayers} getValue={p => p.slapHitContact} numeric />
                <AttributeRow label="Charge Hit Contact" players={selectedPlayers} getValue={p => p.chargeHitContact} numeric />
                <AttributeRow label="Slap Hit Power" players={selectedPlayers} getValue={p => p.slapHitPower} numeric />
                <AttributeRow label="Charge Hit Power" players={selectedPlayers} getValue={p => p.chargeHitPower} numeric />
                <AttributeRow label="Pre-Charge" players={selectedPlayers} getValue={p => p.preCharge} />
                <AttributeRow label="Batting Average" players={selectedPlayers} getValue={p => p.battingAverage} numeric highlight />

                {/* Fielding & Running Section */}
                <tr className="bg-yellow-50">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-bold text-gray-900">
                    Fielding & Running
                  </td>
                </tr>
                <AttributeRow label="Fielding" players={selectedPlayers} getValue={p => p.fielding} numeric />
                <AttributeRow label="Throwing Speed" players={selectedPlayers} getValue={p => p.throwingSpeed} numeric />
                <AttributeRow label="Fielding Average" players={selectedPlayers} getValue={p => p.fieldingAverage} numeric highlight />
                <AttributeRow label="Speed" players={selectedPlayers} getValue={p => p.speed} numeric />
                <AttributeRow label="Bunting" players={selectedPlayers} getValue={p => p.bunting} numeric />
              </tbody>
            </table>
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
              Select 2-5 players above to start comparing attributes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AttributeRowProps {
  label: string;
  players: PlayerAttributes[];
  getValue: (player: PlayerAttributes) => string | number;
  numeric?: boolean;
  highlight?: boolean;
}

function AttributeRow({ label, players, getValue, numeric = false, highlight = false }: AttributeRowProps) {
  const values = players.map(p => getValue(p));

  // Find max value for numeric highlighting
  const maxValue = numeric ? Math.max(...values.map(v => typeof v === 'number' ? v : 0)) : null;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className={`px-4 py-2 font-medium text-gray-700 sticky left-0 bg-white ${highlight ? 'font-bold' : ''}`}>
        {label}
      </td>
      {players.map((player, idx) => {
        const value = getValue(player);
        const isMax = numeric && maxValue !== null && value === maxValue && value > 0;

        return (
          <td
            key={player.name}
            className={`px-4 py-2 text-center ${
              isMax ? 'bg-green-100 font-bold text-green-900' : 'text-gray-900'
            } ${highlight ? 'font-semibold' : ''}`}
          >
            {value || '-'}
          </td>
        );
      })}
    </tr>
  );
}

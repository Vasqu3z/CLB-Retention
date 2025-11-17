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
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent text-shadow-glow-orange">
            ⚾ Player Attribute Comparison
          </h1>
          <p className="text-star-gray font-mono text-lg">
            Compare 2-5 players side-by-side across all 30 attributes
          </p>
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
            {players.map(player => {
              const isSelected = selectedPlayerNames.includes(player.name);
              const isDisabled = !isSelected && selectedPlayerNames.length >= 5;

              return (
                <button
                  key={player.name}
                  onClick={() => handlePlayerToggle(player.name)}
                  disabled={isDisabled}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-300
                    ${isSelected
                      ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : isDisabled
                      ? 'bg-space-blue/20 text-star-dim cursor-not-allowed border border-cosmic-border'
                      : 'bg-space-blue/50 text-star-gray hover:text-star-white hover:bg-space-blue/70 hover:border-nebula-orange/50 border border-cosmic-border'
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
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-space-blue/30 border-b border-cosmic-border">
                  <th className="px-4 py-3 text-left font-display font-bold text-nebula-orange sticky left-0 bg-space-navy/90 backdrop-blur-md z-10 border-r border-cosmic-border">
                    Attribute
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
                {/* Character Info Section */}
                <tr className="bg-gradient-to-r from-nebula-orange/20 to-nebula-coral/20">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-nebula-orange text-shadow">
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
                <tr className="bg-gradient-to-r from-solar-gold/20 to-comet-yellow/20">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-solar-gold text-shadow">
                    Overall Stats
                  </td>
                </tr>
                <AttributeRow label="Pitching Overall" players={selectedPlayers} getValue={p => p.pitchingOverall} numeric />
                <AttributeRow label="Batting Overall" players={selectedPlayers} getValue={p => p.battingOverall} numeric />
                <AttributeRow label="Fielding Overall" players={selectedPlayers} getValue={p => p.fieldingOverall} numeric />
                <AttributeRow label="Speed Overall" players={selectedPlayers} getValue={p => p.speedOverall} numeric />

                {/* Pitching Attributes Section */}
                <tr className="bg-gradient-to-r from-green-500/20 to-green-400/20">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-green-400 text-shadow">
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
                <tr className="bg-gradient-to-r from-nebula-coral/20 to-star-pink/20">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-nebula-coral text-shadow">
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
                <tr className="bg-gradient-to-r from-comet-yellow/20 to-nebula-orange/20">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-comet-yellow text-shadow">
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
          <div className="glass-card p-8 text-center border-nebula-orange/30">
            <p className="text-nebula-orange text-lg font-display font-semibold">
              Please select at least one more player to compare
            </p>
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-star-gray text-lg font-mono">
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
    <tr className="border-b border-cosmic-border hover:bg-space-blue/20 transition-colors duration-200">
      <td className={`px-4 py-2 font-medium text-star-gray sticky left-0 bg-space-navy/90 backdrop-blur-md border-r border-cosmic-border ${highlight ? 'font-bold text-star-white' : ''}`}>
        {label}
      </td>
      {players.map((player, idx) => {
        const value = getValue(player);
        const isMax = numeric && maxValue !== null && value === maxValue && value > 0;

        return (
          <td
            key={player.name}
            className={`px-4 py-2 text-center ${
              isMax ? 'bg-green-400/20 font-bold text-green-400' : 'text-star-white'
            } ${highlight ? 'font-semibold text-nebula-orange' : ''}`}
          >
            {value || '-'}
          </td>
        );
      })}
    </tr>
  );
}

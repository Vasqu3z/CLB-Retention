'use client';

import { useState, useMemo } from 'react';
import { ChemistryMatrix } from '@/lib/sheets';

interface Props {
  chemistryMatrix: ChemistryMatrix;
  playerNames: string[];
}

const POSITIVE_MIN = 100;
const NEGATIVE_MAX = -100;

interface ChemistryRelationship {
  player: string;
  value: number;
}

interface TeamAnalysis {
  internalPositive: Array<{ player1: string; player2: string; value: number }>;
  internalNegative: Array<{ player1: string; player2: string; value: number }>;
  sharedPositive: Record<string, string[]>; // character → players with positive chemistry
  sharedNegative: Record<string, string[]>; // character → players with negative chemistry
  mixedRelationships: Record<string, { positive: string[]; negative: string[] }>;
}

export default function ChemistryToolView({ chemistryMatrix, playerNames }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);

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

  // Calculate chemistry data for selected players
  const selectedPlayersData = useMemo(() => {
    return selectedPlayerNames.map(playerName => {
      const playerChemistry = chemistryMatrix[playerName] || {};

      const positive: ChemistryRelationship[] = [];
      const negative: ChemistryRelationship[] = [];

      Object.entries(playerChemistry).forEach(([otherPlayer, value]) => {
        if (value >= POSITIVE_MIN) {
          positive.push({ player: otherPlayer, value });
        } else if (value <= NEGATIVE_MAX) {
          negative.push({ player: otherPlayer, value });
        }
      });

      // Sort by value (positive descending, negative ascending)
      positive.sort((a, b) => b.value - a.value);
      negative.sort((a, b) => a.value - b.value);

      return {
        name: playerName,
        positive,
        negative,
        posCount: positive.length,
        negCount: negative.length,
      };
    });
  }, [selectedPlayerNames, chemistryMatrix]);

  // Calculate team analysis
  const teamAnalysis = useMemo((): TeamAnalysis => {
    if (selectedPlayerNames.length < 2) {
      return {
        internalPositive: [],
        internalNegative: [],
        sharedPositive: {},
        sharedNegative: {},
        mixedRelationships: {},
      };
    }

    const analysis: TeamAnalysis = {
      internalPositive: [],
      internalNegative: [],
      sharedPositive: {},
      sharedNegative: {},
      mixedRelationships: {},
    };

    // Find internal connections (chemistry between selected players)
    for (let i = 0; i < selectedPlayerNames.length; i++) {
      for (let j = i + 1; j < selectedPlayerNames.length; j++) {
        const player1 = selectedPlayerNames[i];
        const player2 = selectedPlayerNames[j];
        const value = chemistryMatrix[player1]?.[player2];

        if (value !== undefined && value !== 0) {
          if (value >= POSITIVE_MIN) {
            analysis.internalPositive.push({ player1, player2, value });
          } else if (value <= NEGATIVE_MAX) {
            analysis.internalNegative.push({ player1, player2, value });
          }
        }
      }
    }

    // Find shared chemistry (external characters that multiple selected players have chemistry with)
    const externalChemistry: Record<string, Record<string, number>> = {}; // character → player → value

    selectedPlayerNames.forEach(playerName => {
      const playerChemistry = chemistryMatrix[playerName] || {};

      Object.entries(playerChemistry).forEach(([otherPlayer, value]) => {
        // Skip if otherPlayer is in selected list (those are internal)
        if (selectedPlayerNames.includes(otherPlayer)) return;
        if (value === 0 || (value > NEGATIVE_MAX && value < POSITIVE_MIN)) return;

        if (!externalChemistry[otherPlayer]) {
          externalChemistry[otherPlayer] = {};
        }
        externalChemistry[otherPlayer][playerName] = value;
      });
    });

    // Analyze shared chemistry
    Object.entries(externalChemistry).forEach(([character, playerValues]) => {
      const playersWithThis = Object.keys(playerValues);

      if (playersWithThis.length >= 2) {
        const positiveWith: string[] = [];
        const negativeWith: string[] = [];

        playersWithThis.forEach(player => {
          if (playerValues[player] >= POSITIVE_MIN) {
            positiveWith.push(player);
          } else if (playerValues[player] <= NEGATIVE_MAX) {
            negativeWith.push(player);
          }
        });

        // Shared positive
        if (positiveWith.length >= 2) {
          analysis.sharedPositive[character] = positiveWith;
        }

        // Shared negative
        if (negativeWith.length >= 2) {
          analysis.sharedNegative[character] = negativeWith;
        }

        // Mixed relationships (some positive, some negative)
        if (positiveWith.length > 0 && negativeWith.length > 0) {
          analysis.mixedRelationships[character] = {
            positive: positiveWith,
            negative: negativeWith,
          };
        }
      }
    });

    return analysis;
  }, [selectedPlayerNames, chemistryMatrix]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚡ Player Chemistry Tool
          </h1>
          <p className="text-gray-600">
            Analyze chemistry relationships and team compatibility for up to 5 players
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
            {playerNames.map(playerName => {
              const isSelected = selectedPlayerNames.includes(playerName);
              const isDisabled = !isSelected && selectedPlayerNames.length >= 5;

              return (
                <button
                  key={playerName}
                  onClick={() => handlePlayerToggle(playerName)}
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
                  {playerName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chemistry Display */}
        {selectedPlayersData.length > 0 && (
          <div className="space-y-6">
            {/* Individual Player Chemistry */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {selectedPlayersData.map(player => (
                <div key={player.name} className="bg-white rounded-lg shadow">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-t-lg">
                    <h3 className="font-bold text-lg">{player.name}</h3>
                    <p className="text-sm text-blue-100">
                      {player.posCount} positive • {player.negCount} negative
                    </p>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Positive Chemistry */}
                    {player.positive.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <span className="text-lg">✅</span>
                          Positive Chemistry ({player.positive.length})
                        </h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {player.positive.map(rel => (
                            <div
                              key={rel.player}
                              className="flex justify-between items-center text-sm bg-green-50 px-2 py-1 rounded"
                            >
                              <span className="text-gray-900">{rel.player}</span>
                              <span className="font-semibold text-green-700">+{rel.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Negative Chemistry */}
                    {player.negative.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <span className="text-lg">❌</span>
                          Negative Chemistry ({player.negative.length})
                        </h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {player.negative.map(rel => (
                            <div
                              key={rel.player}
                              className="flex justify-between items-center text-sm bg-red-50 px-2 py-1 rounded"
                            >
                              <span className="text-gray-900">{rel.player}</span>
                              <span className="font-semibold text-red-700">{rel.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {player.positive.length === 0 && player.negative.length === 0 && (
                      <p className="text-gray-500 text-sm italic">No chemistry relationships</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Team Analysis (only show if 2+ players selected) */}
            {selectedPlayerNames.length >= 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📊 Team Chemistry Analysis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Internal Positive */}
                  <div>
                    <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <span>✨</span>
                      Internal Positive Connections ({teamAnalysis.internalPositive.length})
                    </h3>
                    {teamAnalysis.internalPositive.length > 0 ? (
                      <div className="space-y-1">
                        {teamAnalysis.internalPositive.map((conn, idx) => (
                          <div key={idx} className="bg-green-50 px-3 py-2 rounded text-sm">
                            <span className="font-medium">{conn.player1}</span>
                            {' ↔ '}
                            <span className="font-medium">{conn.player2}</span>
                            <span className="ml-2 text-green-700 font-bold">+{conn.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No internal positive chemistry</p>
                    )}
                  </div>

                  {/* Internal Negative */}
                  <div>
                    <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      Internal Negative Connections ({teamAnalysis.internalNegative.length})
                    </h3>
                    {teamAnalysis.internalNegative.length > 0 ? (
                      <div className="space-y-1">
                        {teamAnalysis.internalNegative.map((conn, idx) => (
                          <div key={idx} className="bg-red-50 px-3 py-2 rounded text-sm">
                            <span className="font-medium">{conn.player1}</span>
                            {' ↔ '}
                            <span className="font-medium">{conn.player2}</span>
                            <span className="ml-2 text-red-700 font-bold">{conn.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No internal conflicts</p>
                    )}
                  </div>

                  {/* Shared Positive Chemistry */}
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <span>🤝</span>
                      Shared Positive Chemistry ({Object.keys(teamAnalysis.sharedPositive).length})
                    </h3>
                    {Object.keys(teamAnalysis.sharedPositive).length > 0 ? (
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {Object.entries(teamAnalysis.sharedPositive).map(([character, players]) => (
                          <div key={character} className="bg-blue-50 px-3 py-2 rounded text-sm">
                            <div className="font-medium text-blue-900">{character}</div>
                            <div className="text-gray-700 text-xs mt-1">
                              {players.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No shared positive chemistry</p>
                    )}
                  </div>

                  {/* Mixed Relationships */}
                  <div>
                    <h3 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <span>⚡</span>
                      Conflicting Chemistry ({Object.keys(teamAnalysis.mixedRelationships).length})
                    </h3>
                    {Object.keys(teamAnalysis.mixedRelationships).length > 0 ? (
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {Object.entries(teamAnalysis.mixedRelationships).map(([character, rel]) => (
                          <div key={character} className="bg-orange-50 px-3 py-2 rounded text-sm">
                            <div className="font-medium text-orange-900">{character}</div>
                            <div className="text-xs mt-1">
                              <span className="text-green-700">✅ {rel.positive.join(', ')}</span>
                              <br />
                              <span className="text-red-700">❌ {rel.negative.join(', ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No conflicting relationships</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedPlayerNames.length === 0 && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
              Select 1-5 players above to analyze their chemistry relationships
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

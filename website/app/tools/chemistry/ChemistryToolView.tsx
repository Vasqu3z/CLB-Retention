'use client';

import { useState, useMemo } from 'react';
import { ChemistryMatrix } from '@/lib/sheets';
import PlayerMultiSelect from '@/components/PlayerMultiSelect';
import FadeIn from '@/components/animations/FadeIn';
import LiveStatsIndicator from '@/components/LiveStatsIndicator';
import SurfaceCard from '@/components/SurfaceCard';

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
    <div className="space-y-8">
      <FadeIn delay={0.1} direction="up">
        <div className="relative">
          {/* Baseball stitching accent */}
          <div className="absolute -left-4 top-0 w-1 h-24 bg-gradient-to-b from-nebula-teal/50 to-transparent rounded-full" />

          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-nebula-teal via-nebula-cyan to-cosmic-purple bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Player Chemistry Tool
          </h1>
          <p className="text-star-gray font-mono text-lg mb-3">
            Analyze chemistry relationships and team compatibility for up to 5 players
          </p>
          <LiveStatsIndicator />
        </div>
      </FadeIn>

      {/* Player Selection */}
      <FadeIn delay={0.2} direction="up">
        <PlayerMultiSelect
          className="mb-2"
          players={playerNames}
          selectedPlayers={selectedPlayerNames}
          onSelectionChange={setSelectedPlayerNames}
          maxSelections={5}
          placeholder="Search players..."
        />
      </FadeIn>

      {/* Chemistry Display */}
      {selectedPlayersData.length > 0 && (
        <FadeIn delay={0.3} direction="up">
          <div className="space-y-6">
          {/* Individual Player Chemistry */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedPlayersData.map(player => (
                <SurfaceCard key={player.name} className="overflow-hidden hover:border-nebula-orange/50 transition-all duration-300">
                  <div className="bg-gradient-to-r from-nebula-orange/30 to-nebula-coral/30 px-4 py-3 border-b border-cosmic-border">
                    <h3 className="font-display font-bold text-lg text-star-white">{player.name}</h3>
                    <p className="text-sm text-star-gray font-mono">
                      {player.posCount} positive • {player.negCount} negative
                    </p>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Positive Chemistry */}
                    {player.positive.length > 0 && (
                      <div>
                        <h4 className="font-display font-semibold text-green-400 mb-2 flex items-center gap-2">
                          <span className="text-lg">✅</span>
                          Positive Chemistry ({player.positive.length})
                        </h4>
                        <div
                          className="space-y-1 max-h-48 overflow-y-auto pr-2"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {player.positive.map(rel => (
                            <div
                              key={rel.player}
                              className="flex justify-between items-center text-sm bg-green-400/10 hover:bg-green-400/20 px-2 py-1 rounded font-mono transition-colors duration-200"
                            >
                              <span className="text-star-white">{rel.player}</span>
                              <span className="font-semibold text-green-400">+</span>
                </SurfaceCard>
            ))}
          </div>
                      </div>
                    )}

                    {/* Negative Chemistry */}
                    {player.negative.length > 0 && (
                      <div>
                        <h4 className="font-display font-semibold text-red-400 mb-2 flex items-center gap-2">
                          <span className="text-lg">❌</span>
                          Negative Chemistry ({player.negative.length})
                        </h4>
                        <div
                          className="space-y-1 max-h-48 overflow-y-auto pr-2"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {player.negative.map(rel => (
                            <div
                              key={rel.player}
                              className="flex justify-between items-center text-sm bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded font-mono transition-colors duration-200"
                            >
                              <span className="text-star-white">{rel.player}</span>
                              <span className="font-semibold text-red-400">-</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {player.positive.length === 0 && player.negative.length === 0 && (
                      <p className="text-star-gray text-sm italic font-mono">No chemistry relationships</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Team Analysis (only show if 2+ players selected) */}
            {selectedPlayerNames.length >= 2 && (
              <SurfaceCard className="p-6">
                <h2 className="text-2xl font-display font-bold text-star-white mb-4">
                  📊 Team Chemistry Analysis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Internal Positive */}
                  <div>
                    <h3 className="font-display font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <span>✨</span>
                      Internal Positive Connections ({teamAnalysis.internalPositive.length})
                    </h3>
                    {teamAnalysis.internalPositive.length > 0 ? (
                      <div className="space-y-1">
                        {teamAnalysis.internalPositive.map((conn, idx) => (
                          <div key={idx} className="bg-green-400/10 px-3 py-2 rounded text-sm font-mono hover:bg-green-400/20 transition-colors duration-200">
                            <span className="font-medium text-star-white">{conn.player1}</span>
                            <span className="text-star-gray"> ↔ </span>
                            <span className="font-medium text-star-white">{conn.player2}</span>
                            <span className="ml-2 text-green-400 font-bold">+{conn.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-star-gray text-sm italic font-mono">No internal positive chemistry</p>
                    )}
                  </div>

                  {/* Internal Negative */}
                  <div>
                    <h3 className="font-display font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      Internal Negative Connections ({teamAnalysis.internalNegative.length})
                    </h3>
                    {teamAnalysis.internalNegative.length > 0 ? (
                      <div className="space-y-1">
                        {teamAnalysis.internalNegative.map((conn, idx) => (
                          <div key={idx} className="bg-red-400/10 px-3 py-2 rounded text-sm font-mono hover:bg-red-400/20 transition-colors duration-200">
                            <span className="font-medium text-star-white">{conn.player1}</span>
                            <span className="text-star-gray"> ↔ </span>
                            <span className="font-medium text-star-white">{conn.player2}</span>
                            <span className="ml-2 text-red-400 font-bold">{conn.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-star-gray text-sm italic font-mono">No internal conflicts</p>
                    )}
                  </div>

                  {/* Shared Positive Chemistry */}
                  <div>
                    <h3 className="font-display font-semibold text-nebula-cyan mb-2 flex items-center gap-2">
                      <span>🤝</span>
                      Shared Positive Chemistry ({Object.keys(teamAnalysis.sharedPositive).length})
                    </h3>
                    {Object.keys(teamAnalysis.sharedPositive).length > 0 ? (
                      <div className="space-y-1 max-h-64 overflow-y-auto pr-2" onWheel={(e) => e.stopPropagation()}>
                        {Object.entries(teamAnalysis.sharedPositive).map(([character, players]) => (
                          <div key={character} className="bg-nebula-cyan/10 px-3 py-2 rounded text-sm hover:bg-nebula-cyan/20 transition-colors duration-200">
                            <div className="font-medium text-nebula-cyan font-display">{character}</div>
                            <div className="text-star-gray text-xs mt-1 font-mono">
                              {players.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-star-gray text-sm italic font-mono">No shared positive chemistry</p>
                    )}
                  </div>

                  {/* Mixed Relationships */}
                  <div>
                    <h3 className="font-display font-semibold text-nebula-orange mb-2 flex items-center gap-2">
                      <span>⚡</span>
                      Conflicting Chemistry ({Object.keys(teamAnalysis.mixedRelationships).length})
                    </h3>
                    {Object.keys(teamAnalysis.mixedRelationships).length > 0 ? (
                      <div className="space-y-1 max-h-64 overflow-y-auto pr-2" onWheel={(e) => e.stopPropagation()}>
                        {Object.entries(teamAnalysis.mixedRelationships).map(([character, rel]) => (
                          <div key={character} className="bg-nebula-orange/10 px-3 py-2 rounded text-sm hover:bg-nebula-orange/20 transition-colors duration-200">
                            <div className="font-medium text-nebula-orange font-display">{character}</div>
                            <div className="text-xs mt-1 font-mono">
                              <span className="text-green-400">✅ {rel.positive.join(', ')}</span>
                              <br />
                              <span className="text-red-400">❌ {rel.negative.join(', ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-star-gray text-sm italic font-mono">No conflicting relationships</p>
                    )}
                  </div>
                </div>
              </SurfaceCard>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}

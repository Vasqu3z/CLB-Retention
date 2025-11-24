'use client';

import { useState, useMemo } from 'react';
import { ChemistryMatrix } from '@/lib/sheets';
import PlayerMultiSelect from '@/components/PlayerMultiSelect';
import LiveStatsIndicator from '@/components/LiveStatsIndicator';
import { RetroButton } from '@/components/ui/RetroButton';

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

  const panelClass =
    'relative rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.45)]';

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
    <div className="space-y-6">
      <div className={`${panelClass} p-6 lg:p-8`}>
        <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 30% 20%, #22d1ee 0%, transparent 45%)' }} />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-sm bg-white/10 border border-white/10 text-[11px] font-mono uppercase tracking-[0.2em] text-white/70">Tool</span>
            <h1 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tight text-shadow-neon">
              <span className="bg-gradient-to-r from-nebula-teal via-nebula-cyan to-cosmic-purple bg-clip-text text-transparent">Chemistry Analyzer</span>
            </h1>
          </div>
          <p className="text-white/70 font-mono text-sm lg:text-base">Analyze chemistry relationships and team compatibility for up to 5 players.</p>
          <LiveStatsIndicator />
        </div>
      </div>

      <div className={`${panelClass} p-4 lg:p-6`}>
        <PlayerMultiSelect
          className="mb-2"
          players={playerNames}
          selectedPlayers={selectedPlayerNames}
          onSelectionChange={setSelectedPlayerNames}
          maxSelections={5}
          placeholder="Search players..."
        />
        <div className="flex gap-2 text-xs font-mono uppercase tracking-[0.12em] text-white/50">
          <span className="px-2 py-1 rounded-sm bg-white/5 border border-white/5">Positive ≥ 100</span>
          <span className="px-2 py-1 rounded-sm bg-white/5 border border-white/5">Negative ≤ -100</span>
        </div>
      </div>

      {/* Chemistry Display */}
      {selectedPlayersData.length > 0 && (
        <div className="space-y-6">
          {/* Individual Player Chemistry */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedPlayersData.map(player => (
              <div
                key={player.name}
                className={`${panelClass} overflow-hidden border-nebula-orange/30 hover:border-nebula-orange/60 transition-colors duration-300`}
              >
                <div className="bg-gradient-to-r from-nebula-orange/30 to-nebula-coral/30 px-4 py-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black uppercase tracking-[0.18em] text-star-white text-sm">{player.name}</h3>
                    <span className="text-[11px] font-mono text-white/70">{player.posCount}+/ {player.negCount}-</span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Positive Chemistry */}
                  {player.positive.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-green-300 uppercase font-display text-xs tracking-[0.14em] mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-300 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                        Positive ({player.positive.length})
                      </div>
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negative Chemistry */}
                  {player.negative.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-red-300 uppercase font-display text-xs tracking-[0.14em] mb-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" />
                        Negative ({player.negative.length})
                      </div>
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
            <div className={`${panelClass} p-6 space-y-4`}>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-display font-black uppercase tracking-[0.2em] text-star-white">Team Chemistry Analysis</h2>
                <RetroButton size="sm" variant="outline" onClick={() => setSelectedPlayerNames([])}>
                  Reset Selection
                </RetroButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Internal Positive */}
                <div>
                  <div className="flex items-center gap-2 text-green-300 uppercase font-display text-xs tracking-[0.14em] mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-300 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                    Internal Positive ({teamAnalysis.internalPositive.length})
                  </div>
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
                  <div className="flex items-center gap-2 text-red-300 uppercase font-display text-xs tracking-[0.14em] mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" />
                    Internal Negative ({teamAnalysis.internalNegative.length})
                  </div>
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
                  <div className="flex items-center gap-2 text-nebula-cyan uppercase font-display text-xs tracking-[0.14em] mb-2">
                    <span className="w-2 h-2 rounded-full bg-nebula-cyan shadow-[0_0_12px_rgba(21,244,255,0.8)]" />
                    Shared Positive ({Object.keys(teamAnalysis.sharedPositive).length})
                  </div>
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
                  <div className="flex items-center gap-2 text-nebula-orange uppercase font-display text-xs tracking-[0.14em] mb-2">
                    <span className="w-2 h-2 rounded-full bg-nebula-orange shadow-[0_0_12px_rgba(255,107,53,0.8)]" />
                    Conflicting ({Object.keys(teamAnalysis.mixedRelationships).length})
                  </div>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

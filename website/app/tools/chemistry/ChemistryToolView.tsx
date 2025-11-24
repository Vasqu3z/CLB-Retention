'use client';

import { useMemo, useState } from 'react';
import PlayerMultiSelect from '@/components/PlayerMultiSelect';
import RetroButton from '@/components/ui/RetroButton';
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

    const externalChemistry: Record<string, Record<string, number>> = {};

    selectedPlayerNames.forEach(playerName => {
      const playerChemistry = chemistryMatrix[playerName] || {};

      Object.entries(playerChemistry).forEach(([otherPlayer, value]) => {
        if (selectedPlayerNames.includes(otherPlayer)) return;
        if (value === 0 || (value > NEGATIVE_MAX && value < POSITIVE_MIN)) return;

        if (!externalChemistry[otherPlayer]) {
          externalChemistry[otherPlayer] = {};
        }
        externalChemistry[otherPlayer][playerName] = value;
      });
    });

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

        if (positiveWith.length >= 2) {
          analysis.sharedPositive[character] = positiveWith;
        }

        if (negativeWith.length >= 2) {
          analysis.sharedNegative[character] = negativeWith;
        }

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
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-black/60 via-surface-dark/80 to-black/60 p-6 shadow-[0_0_24px_rgba(0,243,255,0.12)]">
        <p className="font-mono text-sm uppercase text-white/60">Tools / Chemistry</p>
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-3">Player Chemistry Tool</h1>
        <p className="text-white/70 font-mono text-base">Analyze chemistry relationships and team compatibility for up to 5 players.</p>
      </header>

      <div className="flex gap-3 items-center">
        <RetroButton size="sm" variant="primary" className="pointer-events-none opacity-80">
          Select up to 5 players
        </RetroButton>
      </div>

      <PlayerMultiSelect
        className="mb-2"
        players={playerNames}
        selectedPlayers={selectedPlayerNames}
        onSelectionChange={setSelectedPlayerNames}
        maxSelections={5}
        placeholder="Search players..."
      />

      {selectedPlayersData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {selectedPlayersData.map(player => (
            <div
              key={player.name}
              className="rounded-2xl border border-white/10 bg-surface-dark/80 p-5 shadow-[0_0_24px_rgba(0,243,255,0.12)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">{player.name}</h3>
                  <p className="text-sm text-white/60 font-mono">Positive {player.posCount} • Negative {player.negCount}</p>
                </div>
                <div className="text-xs uppercase tracking-wide text-white/60">Chemistry</div>
              </div>

              <div className="space-y-3">
                <ChemistryList title="Positive Links" entries={player.positive} color="text-emerald-300" />
                <ChemistryList title="Negative Links" entries={player.negative} color="text-rose-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlayersData.length >= 2 && (
        <div className="rounded-2xl border border-white/10 bg-surface-dark/80 shadow-[0_0_24px_rgba(0,243,255,0.12)] overflow-hidden">
          <div className="bg-gradient-to-r from-comets-cyan/15 via-comets-purple/10 to-comets-red/15 px-4 py-3 border-b border-white/10">
            <h2 className="text-lg font-display font-semibold text-white">Team Compatibility</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <ChemistryBlock
              title="Internal Positives"
              items={teamAnalysis.internalPositive.map(({ player1, player2, value }) => `${player1} + ${player2} (${value})`)}
              emptyLabel="No positive internal links"
            />
            <ChemistryBlock
              title="Internal Negatives"
              items={teamAnalysis.internalNegative.map(({ player1, player2, value }) => `${player1} vs ${player2} (${value})`)}
              emptyLabel="No negative internal links"
            />
            <ChemistryBlock
              title="Shared Positives"
              items={Object.entries(teamAnalysis.sharedPositive).map(([character, players]) => `${character}: ${players.join(', ')}`)}
              emptyLabel="No shared positive chemistry"
            />
            <ChemistryBlock
              title="Shared Negatives"
              items={Object.entries(teamAnalysis.sharedNegative).map(([character, players]) => `${character}: ${players.join(', ')}`)}
              emptyLabel="No shared negative chemistry"
            />
            <ChemistryBlock
              title="Mixed Relationships"
              items={Object.entries(teamAnalysis.mixedRelationships).map(([character, details]) =>
                `${character}: +${details.positive.join(', ')} / -${details.negative.join(', ')}`
              )}
              emptyLabel="No mixed relationships"
            />
          </div>
        </div>
      )}

      {selectedPlayersData.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/20 bg-surface-dark/60 p-6 text-white/70 font-mono">
          Select players to see their chemistry links.
        </div>
      )}
    </div>
  );
}

function ChemistryList({
  title,
  entries,
  color,
}: {
  title: string;
  entries: ChemistryRelationship[];
  color: string;
}) {
  return (
    <div>
      <div className={`text-xs uppercase font-semibold tracking-wide mb-2 ${color}`}>{title}</div>
      {entries.length > 0 ? (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.player} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-white/90">
              <span>{entry.player}</span>
              <span className="font-mono text-xs text-white/70">{entry.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/60 text-sm">No connections</p>
      )}
    </div>
  );
}

function ChemistryBlock({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-white font-display text-lg">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/60 text-sm">{emptyLabel}</p>
      )}
    </div>
  );
}

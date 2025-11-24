'use client';

import React, { useMemo, useState } from 'react';
import PlayerMultiSelect from '@/components/PlayerMultiSelect';
import RetroButton from '@/components/ui/RetroButton';
import SeasonToggle from '@/components/SeasonToggle';
import useLenisScrollLock from '@/hooks/useLenisScrollLock';
import { PlayerStats } from '@/lib/sheets';

type StatTab = 'hitting' | 'pitching' | 'fielding';

type Props = {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
};

export default function StatsComparisonView({ regularPlayers, playoffPlayers }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<StatTab>('hitting');

  const activePlayers = isPlayoffs ? playoffPlayers : regularPlayers;

  const selectedPlayers = useMemo(
    () =>
      selectedPlayerNames
        .map((name) => activePlayers.find((p) => p.name === name))
        .filter((p): p is PlayerStats => p !== undefined),
    [selectedPlayerNames, activePlayers]
  );

  const availablePlayerNames = useMemo(() => activePlayers.map((p) => p.name).sort(), [activePlayers]);

  const tableScrollRef = useLenisScrollLock<HTMLDivElement>();

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-black/60 via-surface-dark/80 to-black/60 p-6 shadow-[0_0_24px_rgba(0,243,255,0.12)]">
        <p className="font-mono text-sm uppercase text-white/60">Tools / Stats</p>
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-3">Player Stats Comparison</h1>
        <p className="text-white/70 font-mono text-base">
          Compare 2-5 players side-by-side for hitting, pitching, and fielding statistics with the retro UI kit.
        </p>
      </header>

      <div className="flex flex-wrap gap-3 items-center">
        <RetroButton
          size="sm"
          variant={activeTab === 'hitting' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('hitting')}
        >
          Hitting
        </RetroButton>
        <RetroButton
          size="sm"
          variant={activeTab === 'pitching' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('pitching')}
        >
          Pitching
        </RetroButton>
        <RetroButton
          size="sm"
          variant={activeTab === 'fielding' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('fielding')}
        >
          Fielding & Running
        </RetroButton>

        <div className="ml-auto">
          <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
        </div>
      </div>

      <PlayerMultiSelect
        className="mb-2"
        players={availablePlayerNames}
        selectedPlayers={selectedPlayerNames}
        onSelectionChange={setSelectedPlayerNames}
        maxSelections={5}
        placeholder={`Search ${isPlayoffs ? 'playoff' : 'regular season'} players...`}
      />

      {selectedPlayers.length >= 2 && (
        <div className="rounded-2xl border border-white/10 bg-surface-dark/80 shadow-[0_0_24px_rgba(0,243,255,0.12)] overflow-hidden space-y-6">
          <StatSection
            title="Hitting Statistics"
            accent="from-comets-cyan/15 to-comets-purple/10"
            visible={activeTab === 'hitting'}
          >
            <StatsTable
              ref={tableScrollRef}
              selectedPlayers={selectedPlayers}
              rows={[
                { label: 'GP', value: (p) => p.gp, numeric: true },
                { label: 'AB', value: (p) => p.ab, numeric: true },
                { label: 'H', value: (p) => p.h, numeric: true },
                { label: 'HR', value: (p) => p.hr, numeric: true },
                { label: 'RBI', value: (p) => p.rbi, numeric: true },
                { label: 'Hits Robbed (ROB)', value: (p) => p.rob, numeric: true },
                { label: 'Double Plays Hit Into (DP)', value: (p) => p.dp, numeric: true },
                { label: 'AVG', value: (p) => p.avg, highlight: true },
                { label: 'OBP', value: (p) => p.obp, highlight: true },
                { label: 'SLG', value: (p) => p.slg, highlight: true },
                { label: 'OPS', value: (p) => p.ops, highlight: true },
              ]}
            />
          </StatSection>

          <StatSection
            title="Pitching Statistics"
            accent="from-comets-yellow/15 to-comets-red/10"
            visible={activeTab === 'pitching'}
          >
            <StatsTable
              selectedPlayers={selectedPlayers}
              rows={[
                { label: 'IP', value: (p) => p.ip, numeric: true },
                { label: 'W', value: (p) => p.w, numeric: true },
                { label: 'L', value: (p) => p.l, numeric: true },
                { label: 'SV', value: (p) => p.sv, numeric: true },
                { label: 'H', value: (p) => p.hAllowed, numeric: true },
                { label: 'HR', value: (p) => p.hrAllowed, numeric: true },
                { label: 'ERA', value: (p) => p.era, highlight: true },
                { label: 'WHIP', value: (p) => p.whip, highlight: true },
                { label: 'BAA', value: (p) => p.baa, highlight: true },
              ]}
            />
          </StatSection>

          <StatSection
            title="Fielding & Running Statistics"
            accent="from-emerald-400/15 to-comets-cyan/10"
            visible={activeTab === 'fielding'}
          >
            <StatsTable
              selectedPlayers={selectedPlayers}
              rows={[
                { label: 'NP', value: (p) => p.np, numeric: true },
                { label: 'E', value: (p) => p.e, numeric: true },
                { label: 'SB', value: (p) => p.sb, numeric: true },
                { label: 'CS', value: (p) => p.cs, numeric: true },
                { label: 'OAA', value: (p) => p.oaa, highlight: true },
              ]}
            />
          </StatSection>
        </div>
      )}
    </div>
  );
}

type StatsTableRow = {
  label: string;
  value: (player: PlayerStats) => any;
  numeric?: boolean;
  highlight?: boolean;
};

type StatsTableProps = {
  selectedPlayers: PlayerStats[];
  rows: StatsTableRow[];
};

const StatsTable = React.forwardRef<HTMLDivElement, StatsTableProps>(function StatsTable(
  { selectedPlayers, rows },
  ref
) {
  return (
    <div ref={ref} className="relative overflow-auto" onWheel={(e) => e.stopPropagation()}>
      <table className="w-full text-sm text-white/80">
        <thead>
          <tr className="bg-black/40 border-b border-white/10">
            <th className="px-4 py-3 text-left font-display font-bold text-comets-yellow sticky left-0 bg-surface-dark/95 backdrop-blur z-10 border-r border-white/10">
              Stat
            </th>
            {selectedPlayers.map((player) => (
              <th
                key={player.name}
                className="px-4 py-3 text-center font-display font-bold text-white min-w-[120px]"
              >
                {player.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-white/5">
              <td className="px-4 py-3 text-left text-white/80 font-semibold sticky left-0 bg-surface-dark/95 backdrop-blur z-10 border-r border-white/10">
                {row.label}
              </td>
              {selectedPlayers.map((player) => {
                const value = row.value(player);
                const display = row.numeric && typeof value === 'number' ? value.toFixed(0) : value ?? '-';
                return (
                  <td
                    key={player.name}
                    className={`px-4 py-3 text-center ${row.highlight ? 'text-comets-yellow font-semibold' : 'text-white'}`}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

type StatSectionProps = {
  title: string;
  accent: string;
  visible: boolean;
  children: React.ReactNode;
};

function StatSection({ title, accent, visible, children }: StatSectionProps) {
  if (!visible) return null;
  return (
    <div className="overflow-hidden">
      <div className={`px-4 py-3 border-b border-white/10 bg-gradient-to-r ${accent}`}>
        <h3 className="text-lg font-display font-semibold text-white">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { LeaderEntry } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import { playerNameToSlug } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import SeasonToggle from "@/components/SeasonToggle";
import RetroTable, { type Column } from "@/components/ui/RetroTable";

interface LeadersViewProps {
  initialBattingLeaders: any;
  initialPitchingLeaders: any;
  initialFieldingLeaders: any;
  playoffBattingLeaders: any;
  playoffPitchingLeaders: any;
  playoffFieldingLeaders: any;
}

type Tab = 'batting' | 'pitching' | 'fielding';

type LeaderRow = {
  id: string;
  rank: string;
  player: string;
  team?: string;
  value: string;
  teamSlug?: string;
  teamColor?: string;
  isTieSummary?: boolean;
  emblem?: string;
};

function buildLeaderRows(leaders: LeaderEntry[]): LeaderRow[] {
  return leaders.map((leader, idx) => {
    const teamConfig = leader.team ? getTeamByName(leader.team) : null;
    const logos = teamConfig ? getTeamLogoPaths(teamConfig.name) : null;

    return {
      id: `${leader.player}-${idx}`,
      rank: leader.rank,
      player: leader.player,
      team: leader.team,
      value: leader.value,
      teamSlug: teamConfig?.slug,
      teamColor: teamConfig?.primaryColor,
      isTieSummary: leader.isTieSummary,
      ...(logos ? { emblem: logos.emblem } : {}),
    };
  });
}

const leaderColumns: Column<LeaderRow>[] = [
  {
    header: '#',
    accessorKey: 'rank',
    sortable: true,
    className: 'text-center text-comets-yellow font-bold',
  },
  {
    header: 'Player',
    cell: (leader) => leader.isTieSummary ? (
      <span className="font-mono text-white/70">{leader.player}</span>
    ) : (
      <div className="flex items-center gap-2">
        {leader.emblem && (
          <div className="w-5 h-5 relative flex-shrink-0">
            <Image src={leader.emblem} alt={leader.team || leader.player} width={20} height={20} className="object-contain" />
          </div>
        )}
        <Link
          href={`/players/${playerNameToSlug(leader.player)}`}
          className="font-semibold text-white hover:text-comets-yellow transition-colors"
        >
          {leader.player}
        </Link>
      </div>
    ),
  },
  {
    header: 'Team',
    cell: (leader) => leader.isTieSummary ? (
      <span className="text-white/60 font-mono">—</span>
    ) : (
      <Link
        href={leader.teamSlug ? `/teams/${leader.teamSlug}` : '#'}
        className="text-sm font-semibold"
        style={{ color: leader.teamColor || '#E8EDF5' }}
      >
        {leader.team}
      </Link>
    ),
  },
  {
    header: 'Stat',
    accessorKey: 'value',
    sortable: true,
    className: 'text-right font-mono text-comets-cyan',
  },
];

export default function LeadersView({
  initialBattingLeaders,
  initialPitchingLeaders,
  initialFieldingLeaders,
  playoffBattingLeaders,
  playoffPitchingLeaders,
  playoffFieldingLeaders,
}: LeadersViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('batting');

  const battingLeaders = isPlayoffs ? playoffBattingLeaders : initialBattingLeaders;
  const pitchingLeaders = isPlayoffs ? playoffPitchingLeaders : initialPitchingLeaders;
  const fieldingLeaders = isPlayoffs ? playoffFieldingLeaders : initialFieldingLeaders;

  const battingRows = useMemo(() => ({
    avg: buildLeaderRows(battingLeaders.avg),
    hits: buildLeaderRows(battingLeaders.hits),
    hr: buildLeaderRows(battingLeaders.hr),
    rbi: buildLeaderRows(battingLeaders.rbi),
    slg: buildLeaderRows(battingLeaders.slg),
    ops: buildLeaderRows(battingLeaders.ops),
  }), [battingLeaders]);

  const pitchingRows = useMemo(() => ({
    ip: buildLeaderRows(pitchingLeaders.ip),
    wins: buildLeaderRows(pitchingLeaders.wins),
    losses: buildLeaderRows(pitchingLeaders.losses),
    saves: buildLeaderRows(pitchingLeaders.saves),
    era: buildLeaderRows(pitchingLeaders.era),
    whip: buildLeaderRows(pitchingLeaders.whip),
    baa: buildLeaderRows(pitchingLeaders.baa),
  }), [pitchingLeaders]);

  const fieldingRows = useMemo(() => ({
    nicePlays: buildLeaderRows(fieldingLeaders.nicePlays),
    errors: buildLeaderRows(fieldingLeaders.errors),
    stolenBases: buildLeaderRows(fieldingLeaders.stolenBases),
  }), [fieldingLeaders]);

  const renderCategory = (label: string, rows: LeaderRow[]) => (
    <div className="space-y-2">
      <div className="font-ui text-xs tracking-[0.2em] uppercase text-white/60">{label}</div>
      <RetroTable data={rows} columns={leaderColumns} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1" />
        <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
      </div>

      <div className="p-2 rounded-xl border border-white/10 bg-white/5">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('batting')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'batting'
                ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Batting
          </button>
          <button
            onClick={() => setActiveTab('pitching')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'pitching'
                ? 'bg-gradient-to-r from-solar-gold to-comet-yellow text-space-black shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Pitching
          </button>
          <button
            onClick={() => setActiveTab('fielding')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'fielding'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Fielding & Running
          </button>
        </nav>
      </div>

      {activeTab === 'batting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCategory('AVG', battingRows.avg)}
          {renderCategory('Hits', battingRows.hits)}
          {renderCategory('HR', battingRows.hr)}
          {renderCategory('RBI', battingRows.rbi)}
          {renderCategory('SLG', battingRows.slg)}
          {renderCategory('OPS', battingRows.ops)}
        </div>
      )}

      {activeTab === 'pitching' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCategory('IP', pitchingRows.ip)}
          {renderCategory('Wins', pitchingRows.wins)}
          {renderCategory('Losses', pitchingRows.losses)}
          {renderCategory('Saves', pitchingRows.saves)}
          {renderCategory('ERA', pitchingRows.era)}
          {renderCategory('WHIP', pitchingRows.whip)}
          {renderCategory('BAA', pitchingRows.baa)}
        </div>
      )}

      {activeTab === 'fielding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCategory('Nice Plays', fieldingRows.nicePlays)}
          {renderCategory('Errors', fieldingRows.errors)}
          {renderCategory('Stolen Bases', fieldingRows.stolenBases)}
        </div>
      )}
    </div>
  );
}

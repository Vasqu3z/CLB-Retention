'use client';

import { useMemo, useState } from 'react';
import { TeamData } from '@/lib/sheets';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveTeams } from '@/config/league';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import SeasonToggle from '@/components/SeasonToggle';
import DataTable, { Column } from '@/components/DataTable';
import ControlShelf from '@/components/ControlShelf';

type Tab = 'hitting' | 'pitching' | 'fielding';

function formatRateStat(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '.000';
  }
  const fixed = value.toFixed(3);
  return value >= 1 ? fixed : fixed.substring(1);
}

interface TeamStatsViewProps {
  regularTeamData: TeamData[];
  playoffTeamData: TeamData[];
  regularRunsByTeam: Record<string, number>;
  playoffRunsByTeam: Record<string, number>;
  playoffEligibleTeams: string[];
}

interface EnhancedTeam extends TeamData {
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  era: string;
  whip: string;
  baa: string;
  rGame: string;
  oaa: number;
  der: string;
  color: string;
  slug: string;
  emblemPath?: string;
}

type LeagueTeam = ReturnType<typeof getActiveTeams>[number];

export default function TeamStatsView({
  regularTeamData,
  playoffTeamData,
  regularRunsByTeam,
  playoffRunsByTeam,
  playoffEligibleTeams
}: TeamStatsViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('hitting');
  const [teamFilter, setTeamFilter] = useState('all');
  const [highlightSeeds, setHighlightSeeds] = useState(false);

  const teams = useMemo(() => getActiveTeams(), []);
  const teamLookup = useMemo(() => {
    const map = new Map<string, LeagueTeam>();
    teams.forEach((team) => map.set(team.name, team));
    return map;
  }, [teams]);

  const teamData = useMemo(
    () => (isPlayoffs ? playoffTeamData : regularTeamData),
    [isPlayoffs, playoffTeamData, regularTeamData]
  );

  const runsByTeam = useMemo(
    () => (isPlayoffs ? playoffRunsByTeam : regularRunsByTeam),
    [isPlayoffs, playoffRunsByTeam, regularRunsByTeam]
  );

  const enhancedTeamData: EnhancedTeam[] = useMemo(() => {
    const activeTeamNames = teams.map((team) => team.name);

    return teamData
      .filter((team) => activeTeamNames.includes(team.teamName))
      .map((team) => {
        const runsScored = runsByTeam[team.teamName] ?? 0;

        // Calculate rate stats
        const avgValue = team.hitting.ab > 0 ? team.hitting.h / team.hitting.ab : null;
        const obpValue = team.hitting.ab + team.hitting.bb > 0
          ? (team.hitting.h + team.hitting.bb) / (team.hitting.ab + team.hitting.bb)
          : null;
        const slgValue = team.hitting.ab > 0 ? team.hitting.tb / team.hitting.ab : null;
        const ops = obpValue !== null && slgValue !== null
          ? (obpValue + slgValue).toFixed(3)
          : '0.000';

        const avg = formatRateStat(avgValue);
        const obp = formatRateStat(obpValue);
        const slg = formatRateStat(slgValue);

        const era = team.pitching.ip > 0 ? ((team.pitching.r * 9) / team.pitching.ip).toFixed(2) : '0.00';
        const whip = team.pitching.ip > 0 ? ((team.pitching.h + team.pitching.bb) / team.pitching.ip).toFixed(2) : '0.00';
        const baaValue = team.pitching.bf > 0 ? team.pitching.h / team.pitching.bf : null;
        const baa = formatRateStat(baaValue);

        const rGame = team.gp > 0 ? (runsScored / team.gp).toFixed(2) : '0.00';
        const oaa = team.fielding.np - team.fielding.e;
        const der = team.gp > 0 ? (oaa / team.gp).toFixed(2) : '0.00';

        const teamConfig = teamLookup.get(team.teamName);
        const logos = teamConfig ? getTeamLogoPaths(teamConfig.name) : null;

        return {
          ...team,
          avg,
          obp,
          slg,
          ops,
          era,
          whip,
          baa,
          rGame,
          oaa,
          der,
          color: teamConfig?.primaryColor || '#000000',
          slug: teamConfig?.slug || '',
          emblemPath: logos?.emblem,
        };
      });
  }, [teamData, runsByTeam, teams, teamLookup]);

  const filteredTeamData = useMemo(() => {
    if (teamFilter === 'all') {
      return enhancedTeamData;
    }
    return enhancedTeamData.filter((team) => team.slug === teamFilter);
  }, [enhancedTeamData, teamFilter]);

  const highlightRow = highlightSeeds
    ? (team: EnhancedTeam) => playoffEligibleTeams.includes(team.teamName)
    : undefined;

  // Define hitting columns
  const hittingColumns: Column<EnhancedTeam>[] = useMemo(() => [
    {
      key: 'teamName',
      label: 'Team',
      sortable: true,
      align: 'left',
      render: (team) => (
        <Link href={`/teams/${team.slug}`} className="hover:underline font-semibold transition-colors flex items-center gap-2" style={{ color: team.color }}>
          {team.emblemPath && (
            <div className="w-5 h-5 relative flex-shrink-0">
              <Image
                src={team.emblemPath}
                alt={team.teamName}
                width={20}
                height={20}
                className="object-contain"
                loading="lazy"
                sizes="20px"
              />
            </div>
          )}
          {team.teamName}
        </Link>
      ),
    },
    { key: 'gp', label: 'GP', align: 'center', className: 'text-star-gray' },
    { key: 'rGame', label: 'R/G', align: 'center', className: 'font-bold text-nebula-orange' },
    { key: 'hitting.ab', label: 'AB', align: 'center', condensed: true, render: (team) => team.hitting.ab },
    { key: 'hitting.h', label: 'H', align: 'center', condensed: true, render: (team) => team.hitting.h },
    { key: 'hitting.hr', label: 'HR', align: 'center', render: (team) => team.hitting.hr },
    { key: 'hitting.rbi', label: 'RBI', align: 'center', render: (team) => team.hitting.rbi },
    { key: 'hitting.dp', label: 'DP', align: 'center', condensed: true, render: (team) => team.hitting.dp },
    { key: 'hitting.rob', label: 'ROB', align: 'center', condensed: true, render: (team) => team.hitting.rob },
    { key: 'avg', label: 'AVG', align: 'center', className: 'text-nebula-cyan' },
    { key: 'obp', label: 'OBP', align: 'center', className: 'text-nebula-cyan', condensed: true },
    { key: 'slg', label: 'SLG', align: 'center', className: 'text-nebula-cyan' },
    { key: 'ops', label: 'OPS', align: 'center', className: 'text-nebula-cyan' },
  ], []);

  // Define pitching columns
  const pitchingColumns: Column<EnhancedTeam>[] = useMemo(() => [
    {
      key: 'teamName',
      label: 'Team',
      sortable: true,
      align: 'left',
      render: (team) => (
        <Link href={`/teams/${team.slug}`} className="hover:underline font-semibold transition-colors flex items-center gap-2" style={{ color: team.color }}>
          {team.emblemPath && (
            <div className="w-5 h-5 relative flex-shrink-0">
              <Image
                src={team.emblemPath}
                alt={team.teamName}
                width={20}
                height={20}
                className="object-contain"
                loading="lazy"
                sizes="20px"
              />
            </div>
          )}
          {team.teamName}
        </Link>
      ),
    },
    { key: 'gp', label: 'GP', align: 'center', className: 'text-star-gray' },
    { key: 'era', label: 'ERA', align: 'center', className: 'font-bold text-nebula-teal' },
    { key: 'pitching.ip', label: 'IP', align: 'center', render: (team) => team.pitching.ip.toFixed(2) },
    { key: 'wins', label: 'W', align: 'center', condensed: true },
    { key: 'losses', label: 'L', align: 'center', condensed: true },
    { key: 'pitching.sv', label: 'SV', align: 'center', condensed: true, render: (team) => team.pitching.sv },
    { key: 'pitching.h', label: 'H', align: 'center', render: (team) => team.pitching.h },
    { key: 'pitching.hr', label: 'HR', align: 'center', render: (team) => team.pitching.hr },
    { key: 'whip', label: 'WHIP', align: 'center', className: 'text-nebula-cyan' },
    { key: 'baa', label: 'BAA', align: 'center', className: 'text-nebula-cyan' },
  ], []);

  // Define fielding columns
  const fieldingColumns: Column<EnhancedTeam>[] = useMemo(() => [
    {
      key: 'teamName',
      label: 'Team',
      sortable: true,
      align: 'left',
      render: (team) => (
        <Link href={`/teams/${team.slug}`} className="hover:underline font-semibold transition-colors flex items-center gap-2" style={{ color: team.color }}>
          {team.emblemPath && (
            <div className="w-5 h-5 relative flex-shrink-0">
              <Image
                src={team.emblemPath}
                alt={team.teamName}
                width={20}
                height={20}
                className="object-contain"
                loading="lazy"
                sizes="20px"
              />
            </div>
          )}
          {team.teamName}
        </Link>
      ),
    },
    { key: 'gp', label: 'GP', align: 'center', className: 'text-star-gray' },
    {
      key: 'der',
      label: 'DER',
      align: 'center',
      className: 'font-bold text-solar-gold',
      render: (team) => `${parseFloat(team.der) > 0 ? '+' : ''}${team.der}`
    },
    { key: 'fielding.np', label: 'NP', align: 'center', render: (team) => team.fielding.np },
    { key: 'fielding.e', label: 'E', align: 'center', render: (team) => team.fielding.e },
    {
      key: 'oaa',
      label: 'OAA',
      align: 'center',
      className: 'text-nebula-cyan',
      render: (team) => `${team.oaa > 0 ? '+' : ''}${team.oaa}`
    },
    { key: 'fielding.sb', label: 'SB', align: 'center', render: (team) => team.fielding.sb },
    { key: 'fielding.cs', label: 'CS', align: 'center', render: (team) => team.fielding.cs },
  ], []);

  return (
    <div className="space-y-8">
      <ControlShelf
        title="Control Deck"
        description="Pin the season, focus on a single club, or light up the playoff seeds."
      >
        <div className="flex flex-wrap gap-3 items-center">
          <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
          <nav className="flex flex-wrap gap-2" aria-label="Stat groups">
            {(['hitting', 'pitching', 'fielding'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full border text-sm font-semibold uppercase tracking-wide transition-all ${
                  activeTab === tab
                    ? 'border-nebula-orange text-nebula-orange bg-nebula-orange/10 shadow-[0_0_20px_rgba(255,107,53,0.35)]'
                    : 'border-cosmic-border/70 text-star-gray hover:text-star-white hover:border-nebula-orange/50'
                }`}
                aria-pressed={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full">
          <label className="flex flex-col text-xs font-mono uppercase tracking-widest text-star-gray/80 gap-1">
            Team focus
            <select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              className="min-w-[220px] rounded-lg border border-cosmic-border bg-space-blue/40 px-3 py-2 text-sm text-star-white focus:outline-none focus:ring-2 focus:ring-nebula-orange"
            >
              <option value="all">All teams</option>
              {teams.map((team) => (
                <option key={team.slug} value={team.slug}>
                  {team.shortName}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setHighlightSeeds((prev) => !prev)}
            aria-pressed={highlightSeeds}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              highlightSeeds
                ? 'border-nebula-teal text-nebula-teal bg-nebula-teal/10 shadow-[0_0_12px_rgba(0,255,198,0.35)]'
                : 'border-cosmic-border/70 text-star-gray hover:text-star-white hover:border-nebula-teal/40'
            }`}
          >
            {highlightSeeds ? 'Playoff seeds highlighted' : 'Highlight playoff seeds'}
          </button>
        </div>
      </ControlShelf>

      {/* Hitting Table */}
      {activeTab === 'hitting' && (
        <DataTable
          columns={hittingColumns}
          data={filteredTeamData}
          getRowKey={(team) => team.teamName}
          defaultSortKey="rGame"
          defaultSortDirection="desc"
          enableCondensed={true}
          highlightRow={highlightRow}
        />
      )}

      {/* Pitching Table */}
      {activeTab === 'pitching' && (
        <DataTable
          columns={pitchingColumns}
          data={filteredTeamData}
          getRowKey={(team) => team.teamName}
          defaultSortKey="era"
          defaultSortDirection="asc"
          enableCondensed={true}
          highlightRow={highlightRow}
        />
      )}

      {/* Fielding Table */}
      {activeTab === 'fielding' && (
        <DataTable
          columns={fieldingColumns}
          data={filteredTeamData}
          getRowKey={(team) => team.teamName}
          defaultSortKey="der"
          defaultSortDirection="desc"
          enableCondensed={true}
          highlightRow={highlightRow}
        />
      )}
    </div>
  );
}

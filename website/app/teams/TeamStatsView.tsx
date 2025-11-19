'use client';

import { useState } from 'react';
import { TeamData, StandingsRow } from '@/lib/sheets';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveTeams } from '@/config/league';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import SeasonToggle from '@/components/SeasonToggle';
import DataTable, { Column } from '@/components/DataTable';
import StatTooltip from '@/components/StatTooltip';

type Tab = 'hitting' | 'pitching' | 'fielding';

interface TeamStatsViewProps {
  regularTeamData: TeamData[];
  regularStandings: StandingsRow[];
  playoffTeamData: TeamData[];
  playoffStandings: StandingsRow[];
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

export default function TeamStatsView({
  regularTeamData,
  regularStandings,
  playoffTeamData,
  playoffStandings
}: TeamStatsViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('hitting');

  // Use appropriate data based on toggle
  const teamData = isPlayoffs ? playoffTeamData : regularTeamData;
  const standings = isPlayoffs ? playoffStandings : regularStandings;

  const teams = getActiveTeams();

  // Helper to get team color
  const getTeamColor = (teamName: string) => {
    const team = teams.find(t => t.name === teamName);
    return team?.primaryColor || '#000000';
  };

  // Helper to get team slug
  const getTeamSlug = (teamName: string) => {
    const team = teams.find(t => t.name === teamName);
    return team?.slug || '';
  };

  // Calculate derived stats and prepare data (filter to active teams only)
  const activeTeamNames = teams.map(t => t.name);
  const enhancedTeamData: EnhancedTeam[] = teamData
    .filter(team => activeTeamNames.includes(team.teamName))
    .map(team => {
      // Get runs scored from standings (regular season) or use RBI as proxy (playoffs)
      // Note: Playoffs don't have standings, so we use RBI as a reasonable approximation
      const standingsEntry = standings.find(s => s.team === team.teamName);
      const runsScored = standingsEntry?.runsScored || team.hitting.rbi;

    // Calculate rate stats
    const avg = team.hitting.ab > 0 ? (team.hitting.h / team.hitting.ab).toFixed(3).substring(1) : '.000';

    // OBP can be >= 1.000 in rare cases, handle accordingly
    const obpValue = (team.hitting.ab + team.hitting.bb) > 0
      ? (team.hitting.h + team.hitting.bb) / (team.hitting.ab + team.hitting.bb)
      : 0;
    const obp = obpValue >= 1 ? obpValue.toFixed(3) : (obpValue > 0 ? obpValue.toFixed(3).substring(1) : '.000');

    // SLG can be >= 1.000, so only remove leading zero if < 1
    const slgValue = team.hitting.ab > 0 ? team.hitting.tb / team.hitting.ab : 0;
    const slg = slgValue >= 1 ? slgValue.toFixed(3) : (slgValue > 0 ? slgValue.toFixed(3).substring(1) : '.000');

    const ops = team.hitting.ab > 0 && (team.hitting.ab + team.hitting.bb) > 0
      ? ((team.hitting.h + team.hitting.bb) / (team.hitting.ab + team.hitting.bb) +
         team.hitting.tb / team.hitting.ab).toFixed(3)
      : '0.000';

    const era = team.pitching.ip > 0 ? ((team.pitching.r * 9) / team.pitching.ip).toFixed(2) : '0.00';
    const whip = team.pitching.ip > 0 ? ((team.pitching.h + team.pitching.bb) / team.pitching.ip).toFixed(2) : '0.00';
    const baa = team.pitching.bf > 0 ? (team.pitching.h / team.pitching.bf).toFixed(3).substring(1) : '.000';

    // New derived stats
    const rGame = team.gp > 0 ? (runsScored / team.gp).toFixed(2) : '0.00'; // Runs scored per game
    const oaa = team.fielding.np - team.fielding.e; // Outs Above Average
    const der = team.gp > 0 ? (oaa / team.gp).toFixed(2) : '0.00'; // Defensive Efficiency Rating (OAA/Game)

    const teamConfig = teams.find(t => t.name === team.teamName);
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
      color: getTeamColor(team.teamName),
      slug: getTeamSlug(team.teamName),
      emblemPath: logos?.emblem,
    };
  });

  // Define hitting columns
  const hittingColumns: Column<EnhancedTeam>[] = [
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
              />
            </div>
          )}
          {team.teamName}
        </Link>
      ),
    },
    { key: 'gp', label: <StatTooltip stat="GP">GP</StatTooltip>, align: 'center', className: 'text-star-gray' },
    { key: 'rGame', label: <StatTooltip stat="R/G">R/G</StatTooltip>, align: 'center', className: 'font-bold text-nebula-orange' },
    { key: 'hitting.ab', label: <StatTooltip stat="AB">AB</StatTooltip>, align: 'center', condensed: true, render: (team) => team.hitting.ab },
    { key: 'hitting.h', label: <StatTooltip stat="H">H</StatTooltip>, align: 'center', condensed: true, render: (team) => team.hitting.h },
    { key: 'hitting.hr', label: <StatTooltip stat="HR">HR</StatTooltip>, align: 'center', render: (team) => team.hitting.hr },
    { key: 'hitting.rbi', label: <StatTooltip stat="RBI">RBI</StatTooltip>, align: 'center', render: (team) => team.hitting.rbi },
    { key: 'hitting.dp', label: <StatTooltip stat="DP">DP</StatTooltip>, align: 'center', condensed: true, render: (team) => team.hitting.dp },
    { key: 'hitting.rob', label: <StatTooltip stat="ROB">ROB</StatTooltip>, align: 'center', condensed: true, render: (team) => team.hitting.rob },
    { key: 'avg', label: <StatTooltip stat="AVG">AVG</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
    { key: 'obp', label: <StatTooltip stat="OBP">OBP</StatTooltip>, align: 'center', className: 'text-nebula-cyan', condensed: true },
    { key: 'slg', label: <StatTooltip stat="SLG">SLG</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
    { key: 'ops', label: <StatTooltip stat="OPS">OPS</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
  ];

  // Define pitching columns
  const pitchingColumns: Column<EnhancedTeam>[] = [
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
              />
            </div>
          )}
          {team.teamName}
        </Link>
      ),
    },
    { key: 'gp', label: <StatTooltip stat="GP">GP</StatTooltip>, align: 'center', className: 'text-star-gray' },
    { key: 'era', label: <StatTooltip stat="ERA">ERA</StatTooltip>, align: 'center', className: 'font-bold text-nebula-teal' },
    { key: 'pitching.ip', label: <StatTooltip stat="IP">IP</StatTooltip>, align: 'center', render: (team) => team.pitching.ip.toFixed(2) },
    { key: 'wins', label: <StatTooltip stat="W_TEAM">W</StatTooltip>, align: 'center', condensed: true },
    { key: 'losses', label: <StatTooltip stat="L_TEAM">L</StatTooltip>, align: 'center', condensed: true },
    { key: 'pitching.sv', label: <StatTooltip stat="SV">SV</StatTooltip>, align: 'center', condensed: true, render: (team) => team.pitching.sv },
    { key: 'pitching.h', label: <StatTooltip stat="H">H</StatTooltip>, align: 'center', render: (team) => team.pitching.h },
    { key: 'pitching.hr', label: <StatTooltip stat="HR">HR</StatTooltip>, align: 'center', render: (team) => team.pitching.hr },
    { key: 'whip', label: <StatTooltip stat="WHIP">WHIP</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
    { key: 'baa', label: <StatTooltip stat="BAA">BAA</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
  ];

  // Define fielding columns
  const fieldingColumns: Column<EnhancedTeam>[] = [
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
              />
            </div>
          )}
          {team.teamName}
        </Link>
      ),
    },
    { key: 'gp', label: <StatTooltip stat="GP">GP</StatTooltip>, align: 'center', className: 'text-star-gray' },
    {
      key: 'der',
      label: <StatTooltip stat="DER">DER</StatTooltip>,
      align: 'center',
      className: 'font-bold text-solar-gold',
      render: (team) => `${parseFloat(team.der) > 0 ? '+' : ''}${team.der}`
    },
    { key: 'fielding.np', label: <StatTooltip stat="NP">NP</StatTooltip>, align: 'center', render: (team) => team.fielding.np },
    { key: 'fielding.e', label: <StatTooltip stat="E">E</StatTooltip>, align: 'center', render: (team) => team.fielding.e },
    {
      key: 'oaa',
      label: <StatTooltip stat="OAA">OAA</StatTooltip>,
      align: 'center',
      className: 'text-nebula-cyan',
      render: (team) => `${team.oaa > 0 ? '+' : ''}${team.oaa}`
    },
    { key: 'fielding.sb', label: <StatTooltip stat="SB">SB</StatTooltip>, align: 'center', render: (team) => team.fielding.sb },
    { key: 'fielding.cs', label: <StatTooltip stat="CS">CS</StatTooltip>, align: 'center', render: (team) => team.fielding.cs },
  ];

  return (
    <div className="space-y-8">
      {/* Season Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1" /> {/* Spacer */}
        <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('hitting')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'hitting'
                ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Hitting
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

      {/* Hitting Table */}
      {activeTab === 'hitting' && (
        <DataTable
          columns={hittingColumns}
          data={enhancedTeamData}
          getRowKey={(team) => team.teamName}
          defaultSortKey="rGame"
          defaultSortDirection="desc"
          enableCondensed={true}
        />
      )}

      {/* Pitching Table */}
      {activeTab === 'pitching' && (
        <DataTable
          columns={pitchingColumns}
          data={enhancedTeamData}
          getRowKey={(team) => team.teamName}
          defaultSortKey="era"
          defaultSortDirection="asc"
          enableCondensed={true}
        />
      )}

      {/* Fielding Table */}
      {activeTab === 'fielding' && (
        <DataTable
          columns={fieldingColumns}
          data={enhancedTeamData}
          getRowKey={(team) => team.teamName}
          defaultSortKey="der"
          defaultSortDirection="desc"
          enableCondensed={true}
        />
      )}
    </div>
  );
}

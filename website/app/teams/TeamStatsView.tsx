'use client';

import { useState } from 'react';
import { TeamData, StandingsRow } from '@/lib/sheets';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveTeams } from '@/config/league';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import SeasonToggle from '@/components/SeasonToggle';
import RetroTable, { type Column } from '@/components/ui/RetroTable';
import StatTooltip from '@/components/StatTooltip';
import SurfaceCard from '@/components/SurfaceCard';

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

type EnhancedTeamRow = EnhancedTeam & {
  id: string;
  hittingAb: number;
  hittingH: number;
  hittingHr: number;
  hittingRbi: number;
  hittingDp: number;
  hittingRob: number;
  pitchingIp: number;
  pitchingSv: number;
  pitchingH: number;
  pitchingHr: number;
};

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

  const activeTeamNames = teams.map(t => t.name);
  const getTeamColor = (teamName: string) => teams.find(t => t.name === teamName)?.primaryColor || '#000000';
  const getTeamSlug = (teamName: string) => teams.find(t => t.name === teamName)?.slug || '';

  const enhancedTeamData: EnhancedTeamRow[] = teamData
    .filter(team => activeTeamNames.includes(team.teamName))
    .map(team => {
      const standingsEntry = standings.find(s => s.team === team.teamName);
      const runsScored = standingsEntry?.runsScored || team.hitting.rbi;

      const avg = team.hitting.ab > 0 ? (team.hitting.h / team.hitting.ab).toFixed(3).substring(1) : '.000';
      const obpValue = (team.hitting.ab + team.hitting.bb) > 0
        ? (team.hitting.h + team.hitting.bb) / (team.hitting.ab + team.hitting.bb)
        : 0;
      const obp = obpValue >= 1 ? obpValue.toFixed(3) : (obpValue > 0 ? obpValue.toFixed(3).substring(1) : '.000');

      const slgValue = team.hitting.ab > 0 ? team.hitting.tb / team.hitting.ab : 0;
      const slg = slgValue >= 1 ? slgValue.toFixed(3) : (slgValue > 0 ? slgValue.toFixed(3).substring(1) : '.000');

      const ops = team.hitting.ab > 0 && (team.hitting.ab + team.hitting.bb) > 0
        ? ((team.hitting.h + team.hitting.bb) / (team.hitting.ab + team.hitting.bb) + team.hitting.tb / team.hitting.ab).toFixed(3)
        : '0.000';

      const era = team.pitching.ip > 0 ? ((team.pitching.r * 9) / team.pitching.ip).toFixed(2) : '0.00';
      const whip = team.pitching.ip > 0 ? ((team.pitching.h + team.pitching.bb) / team.pitching.ip).toFixed(2) : '0.00';
      const baa = team.pitching.bf > 0 ? (team.pitching.h / team.pitching.bf).toFixed(3).substring(1) : '.000';

      const rGame = team.gp > 0 ? (runsScored / team.gp).toFixed(2) : '0.00';
      const oaa = team.fielding.np - team.fielding.e;
      const der = team.gp > 0 ? (oaa / team.gp).toFixed(2) : '0.00';

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
        id: team.teamName,
        hittingAb: team.hitting.ab,
        hittingH: team.hitting.h,
        hittingHr: team.hitting.hr,
        hittingRbi: team.hitting.rbi,
        hittingDp: team.hitting.dp,
        hittingRob: team.hitting.rob,
        pitchingIp: team.pitching.ip,
        pitchingSv: team.pitching.sv,
        pitchingH: team.pitching.h,
        pitchingHr: team.pitching.hr,
      };
    });

  const hittingColumns: Column<EnhancedTeamRow>[] = [
    {
      header: 'Team',
      sortable: true,
      cell: (team) => (
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
    { header: <StatTooltip stat="GP">GP</StatTooltip>, accessorKey: 'gp', sortable: true, className: 'text-center text-white/70' },
    { header: <StatTooltip stat="R/G">R/G</StatTooltip>, accessorKey: 'rGame', sortable: true, className: 'text-center font-bold text-comets-orange' },
    { header: <StatTooltip stat="AB">AB</StatTooltip>, accessorKey: 'hittingAb', sortable: true, className: 'text-center' },
    { header: <StatTooltip stat="H">H</StatTooltip>, accessorKey: 'hittingH', sortable: true, className: 'text-center' },
    { header: <StatTooltip stat="HR">HR</StatTooltip>, accessorKey: 'hittingHr', sortable: true, className: 'text-center' },
    { header: <StatTooltip stat="RBI">RBI</StatTooltip>, accessorKey: 'hittingRbi', sortable: true, className: 'text-center' },
    { header: <StatTooltip stat="DP">DP</StatTooltip>, accessorKey: 'hittingDp', sortable: true, className: 'text-center' },
    { header: <StatTooltip stat="ROB">ROB</StatTooltip>, accessorKey: 'hittingRob', sortable: true, className: 'text-center' },
    { header: <StatTooltip stat="AVG">AVG</StatTooltip>, accessorKey: 'avg', sortable: true, className: 'text-center text-comets-cyan' },
    { header: <StatTooltip stat="OBP">OBP</StatTooltip>, accessorKey: 'obp', sortable: true, className: 'text-center text-comets-cyan' },
    { header: <StatTooltip stat="SLG">SLG</StatTooltip>, accessorKey: 'slg', sortable: true, className: 'text-center text-comets-cyan' },
    { header: <StatTooltip stat="OPS">OPS</StatTooltip>, accessorKey: 'ops', sortable: true, className: 'text-center text-comets-cyan' },
  ];

  const pitchingColumns: Column<EnhancedTeamRow>[] = [
    {
      header: 'Team',
      sortable: true,
      cell: (team) => (
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
    { header: <StatTooltip stat="GP">GP</StatTooltip>, accessorKey: 'gp', sortable: true, className: 'text-center text-white/70' },
    { header: <StatTooltip stat="ERA">ERA</StatTooltip>, accessorKey: 'era', sortable: true, className: 'text-center font-bold text-comets-teal' },
    { header: <StatTooltip stat="IP">IP</StatTooltip>, accessorKey: 'pitchingIp', sortable: true, className: 'text-center', cell: (team) => team.pitchingIp.toFixed(2) },
    { header: <StatTooltip stat="W_TEAM">W</StatTooltip>, accessorKey: 'wins', sortable: true, className: 'text-center' },
    { header: <StatTooltip stat="L_TEAM">L</StatTooltip>, accessorKey: 'losses', sortable: true, className: 'text-center' },
    { header: <StatTooltip stat="SV">SV</StatTooltip>, accessorKey: 'pitchingSv', sortable: true, className: 'text-center', cell: (team) => team.pitchingSv },
    { header: <StatTooltip stat="H">H</StatTooltip>, accessorKey: 'pitchingH', sortable: true, className: 'text-center', cell: (team) => team.pitchingH },
    { header: <StatTooltip stat="HR">HR</StatTooltip>, accessorKey: 'pitchingHr', sortable: true, className: 'text-center', cell: (team) => team.pitchingHr },
    { header: <StatTooltip stat="WHIP">WHIP</StatTooltip>, accessorKey: 'whip', sortable: true, className: 'text-center text-comets-cyan' },
    { header: <StatTooltip stat="BAA">BAA</StatTooltip>, accessorKey: 'baa', sortable: true, className: 'text-center text-comets-cyan' },
  ];

  const fieldingColumns: Column<EnhancedTeamRow>[] = [
    {
      header: 'Team',
      sortable: true,
      cell: (team) => (
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
    { header: <StatTooltip stat="GP">GP</StatTooltip>, accessorKey: 'gp', sortable: true, className: 'text-center text-white/70' },
    {
      header: <StatTooltip stat="DER">DER</StatTooltip>,
      accessorKey: 'der',
      sortable: true,
      className: 'text-center font-bold text-comets-yellow',
      cell: (team) => `${parseFloat(team.der) > 0 ? '+' : ''}${team.der}`
    },
    { header: <StatTooltip stat="NP">NP</StatTooltip>, sortable: false, className: 'text-center', cell: (team) => team.fielding.np },
    { header: <StatTooltip stat="E">E</StatTooltip>, sortable: false, className: 'text-center', cell: (team) => team.fielding.e },
    {
      header: <StatTooltip stat="OAA">OAA</StatTooltip>,
      accessorKey: 'oaa',
      sortable: true,
      className: 'text-center text-comets-cyan',
      cell: (team) => `${team.oaa > 0 ? '+' : ''}${team.oaa}`
    },
    { header: <StatTooltip stat="SB">SB</StatTooltip>, sortable: false, className: 'text-center', cell: (team) => team.fielding.sb },
    { header: <StatTooltip stat="CS">CS</StatTooltip>, sortable: false, className: 'text-center', cell: (team) => team.fielding.cs },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1" />
        <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
      </div>

      <SurfaceCard className="p-2">
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
      </SurfaceCard>

      {activeTab === 'hitting' && (
        <RetroTable
          columns={hittingColumns}
          data={enhancedTeamData}
        />
      )}

      {activeTab === 'pitching' && (
        <RetroTable
          columns={pitchingColumns}
          data={enhancedTeamData}
        />
      )}

      {activeTab === 'fielding' && (
        <RetroTable
          columns={fieldingColumns}
          data={enhancedTeamData}
        />
      )}
    </div>
  );
}

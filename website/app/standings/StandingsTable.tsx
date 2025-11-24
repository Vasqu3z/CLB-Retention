'use client';

import Link from "next/link";
import Image from "next/image";
import { StandingsRow } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import RetroTable, { type Column } from "@/components/ui/RetroTable";
import StatTooltip from "@/components/StatTooltip";

interface StandingsRowWithColor extends StandingsRow {
  id: string;
  teamColor?: string;
  teamSlug?: string;
  emblemPath?: string;
  numericRank: number;
}

interface StandingsTableProps {
  standings: StandingsRow[];
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  // Enhance standings with team info
  const enhancedStandings: StandingsRowWithColor[] = standings.map((team) => {
    const teamConfig = getTeamByName(team.team);
    const logos = teamConfig ? getTeamLogoPaths(teamConfig.name) : null;

    return {
      ...team,
      id: team.team,
      teamColor: teamConfig?.primaryColor,
      teamSlug: teamConfig?.slug,
      emblemPath: logos?.emblem,
      numericRank: Number(team.rank) || 0,
    };
  });

  // Define columns for RetroTable
  const columns: Column<StandingsRowWithColor>[] = [
    {
      header: '#',
      accessorKey: 'numericRank',
      sortable: true,
      className: 'text-center font-bold text-comets-yellow',
      cell: (row) => (
        <span className={row.rank === '1' ? 'text-comets-orange' : ''}>
          {row.rank}
        </span>
      ),
    },
    {
      header: 'Team',
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.emblemPath && (
            <div className="w-6 h-6 relative flex-shrink-0">
              <Image
                src={row.emblemPath}
                alt={row.team}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          )}
          {row.teamSlug ? (
            <Link
              href={`/teams/${row.teamSlug}`}
              className="hover:text-comets-yellow transition-colors font-semibold"
              style={{ color: row.teamColor }}
              title={row.h2hNote}
            >
              {row.team}
            </Link>
          ) : (
            <span className="font-semibold" style={{ color: row.teamColor }} title={row.h2hNote}>
              {row.team}
            </span>
          )}
        </div>
      ),
    },
    {
      header: <StatTooltip stat="W_TEAM">W</StatTooltip>,
      accessorKey: 'wins',
      sortable: true,
      className: 'text-center font-semibold',
    },
    {
      header: <StatTooltip stat="L_TEAM">L</StatTooltip>,
      accessorKey: 'losses',
      sortable: true,
      className: 'text-center font-semibold',
    },
    {
      header: <StatTooltip stat="PCT">Win %</StatTooltip>,
      accessorKey: 'winPct',
      sortable: true,
      className: 'text-center font-bold text-comets-yellow',
    },
    {
      header: <StatTooltip stat="RS">RS</StatTooltip>,
      accessorKey: 'runsScored',
      sortable: true,
      className: 'text-center',
    },
    {
      header: <StatTooltip stat="RA">RA</StatTooltip>,
      accessorKey: 'runsAllowed',
      sortable: true,
      className: 'text-center',
    },
    {
      header: <StatTooltip stat="DIFF">Diff</StatTooltip>,
      accessorKey: 'runDiff',
      sortable: true,
      className: 'text-center font-semibold',
      cell: (row) => (
        <span className={row.runDiff > 0 ? 'text-comets-cyan' : row.runDiff < 0 ? 'text-comets-red' : 'text-white/70'}>
          {row.runDiff > 0 ? '+' : ''}{row.runDiff}
        </span>
      ),
    },
  ];

  return (
    <RetroTable
      columns={columns}
      data={enhancedStandings}
    />
  );
}

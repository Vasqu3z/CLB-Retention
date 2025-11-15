'use client';

import Link from "next/link";
import Image from "next/image";
import { StandingsRow } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import DataTable, { Column } from "@/components/DataTable";

interface StandingsRowWithColor extends StandingsRow {
  teamColor?: string;
  teamSlug?: string;
  emblemPath?: string;
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
      teamColor: teamConfig?.primaryColor,
      teamSlug: teamConfig?.slug,
      emblemPath: logos?.emblem,
    };
  });

  // Define columns for DataTable
  const columns: Column<StandingsRowWithColor>[] = [
    {
      key: 'rank',
      label: 'Rank',
      align: 'center',
      className: 'font-bold text-solar-gold',
      render: (row) => (
        <span className={row.rank === '1' ? 'text-nebula-orange' : ''}>
          {row.rank}
        </span>
      ),
    },
    {
      key: 'team',
      label: 'Team',
      align: 'left',
      sortable: false,
      render: (row) => (
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
              className="hover:text-nebula-orange transition-colors font-semibold"
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
      key: 'wins',
      label: 'W',
      align: 'center',
      className: 'font-semibold',
    },
    {
      key: 'losses',
      label: 'L',
      align: 'center',
      className: 'font-semibold',
    },
    {
      key: 'winPct',
      label: 'Win %',
      align: 'center',
      className: 'font-bold text-comet-yellow',
    },
    {
      key: 'runsScored',
      label: 'RS',
      align: 'center',
      condensed: true,
    },
    {
      key: 'runsAllowed',
      label: 'RA',
      align: 'center',
      condensed: true,
    },
    {
      key: 'runDiff',
      label: 'Diff',
      align: 'center',
      className: 'font-semibold',
      render: (row) => (
        <span className={row.runDiff > 0 ? 'text-nebula-teal' : row.runDiff < 0 ? 'text-nebula-coral' : 'text-star-gray'}>
          {row.runDiff > 0 ? '+' : ''}{row.runDiff}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={enhancedStandings}
      getRowKey={(row) => row.team}
      defaultSortKey="rank"
      defaultSortDirection="asc"
      highlightRow={(row) => row.rank === '1'}
      enableCondensed={true}
    />
  );
}

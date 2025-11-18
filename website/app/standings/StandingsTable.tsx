'use client';

import Link from "next/link";
import Image from "next/image";
import { StandingsRow } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import DataTable, { Column } from "@/components/DataTable";
import { Info } from "lucide-react";

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

  const playoffCutoff = 4;

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
        <div className="flex flex-col gap-1">
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
              >
                {row.team}
              </Link>
            ) : (
              <span className="font-semibold" style={{ color: row.teamColor }}>
                {row.team}
              </span>
            )}
            {row.h2hNote && (
              <span className="text-star-gray" aria-label={row.h2hNote} title={row.h2hNote}>
                <Info className="w-4 h-4" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest">
            {Number(row.rank) <= playoffCutoff && (
              <span className="rounded-full bg-nebula-orange/10 px-2 py-0.5 text-nebula-orange">Clinched</span>
            )}
            <span className="text-star-gray">Run Diff: {row.runDiff > 0 ? `+${row.runDiff}` : row.runDiff}</span>
          </div>
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
      render: (row) => {
        const pct = Math.min(Math.max(parseFloat(row.winPct) || 0, 0), 1) * 100;
        return (
          <div className="flex flex-col items-center gap-1">
            <span>{row.winPct}</span>
            <span className="relative h-1.5 w-20 rounded-full bg-space-blue/60 overflow-hidden">
              <span
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-nebula-teal via-nebula-orange to-solar-gold"
                style={{ width: `${pct}%` }}
              />
            </span>
          </div>
        );
      }
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

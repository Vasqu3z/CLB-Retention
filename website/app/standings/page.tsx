import { getStandings } from "@/lib/sheets";
import Link from "next/link";
import Image from "next/image";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import DataTable, { Column } from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { Trophy, TrendingUp, TrendingDown, Award } from "lucide-react";

export const revalidate = 60;

interface StandingsRowWithColor {
  rank: string;
  team: string;
  wins: number;
  losses: number;
  winPct: string;
  runsScored: number;
  runsAllowed: number;
  runDiff: number;
  h2hNote?: string;
  teamColor?: string;
  teamSlug?: string;
  emblemPath?: string;
}

export default async function StandingsPage() {
  const standings = await getStandings();

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

  // Calculate stats for stat cards
  const topTeam = enhancedStandings[0];
  const totalGames = enhancedStandings.reduce((sum, t) => sum + t.wins + t.losses, 0);
  const avgRunsScored = enhancedStandings.reduce((sum, t) => sum + t.runsScored, 0) / enhancedStandings.length;
  const bestRunDiff = Math.max(...enhancedStandings.map(t => t.runDiff));

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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent">
          League Standings
        </h1>
        <p className="text-star-gray font-mono">
          Regular Season • Updated in real-time
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="League Leader"
          value={topTeam?.team || '-'}
          icon={Trophy}
          sublabel={`${topTeam?.wins}-${topTeam?.losses} (${topTeam?.winPct})`}
          color="orange"
        />

        <StatCard
          label="Games Played"
          value={totalGames}
          icon={Award}
          sublabel="Total across all teams"
          color="gold"
        />

        <StatCard
          label="Avg Runs/Team"
          value={avgRunsScored.toFixed(1)}
          icon={TrendingUp}
          sublabel="League average"
          color="cyan"
        />

        <StatCard
          label="Best Run Diff"
          value={`+${bestRunDiff}`}
          icon={TrendingDown}
          sublabel={enhancedStandings.find(t => t.runDiff === bestRunDiff)?.team}
          color="teal"
        />
      </div>

      {/* Standings Table */}
      <DataTable
        columns={columns}
        data={enhancedStandings}
        getRowKey={(row) => row.team}
        defaultSortKey="rank"
        defaultSortDirection="asc"
        highlightRow={(row) => row.rank === '1'}
        enableCondensed={true}
      />

      {/* Legend */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-nebula-orange mb-4 uppercase tracking-wider">
          Legend
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-mono">
          <div>
            <span className="text-star-gray">W</span>
            <span className="text-star-white ml-2">Wins</span>
          </div>
          <div>
            <span className="text-star-gray">L</span>
            <span className="text-star-white ml-2">Losses</span>
          </div>
          <div>
            <span className="text-star-gray">Win %</span>
            <span className="text-star-white ml-2">Winning Percentage</span>
          </div>
          <div>
            <span className="text-star-gray">Diff</span>
            <span className="text-star-white ml-2">Run Differential</span>
          </div>
          <div>
            <span className="text-star-gray">RS</span>
            <span className="text-star-white ml-2">Runs Scored</span>
          </div>
          <div>
            <span className="text-star-gray">RA</span>
            <span className="text-star-white ml-2">Runs Allowed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getStandings } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import StatCard from "@/components/StatCard";
import StandingsTable from "./StandingsTable";
import { Trophy, TrendingUp, TrendingDown, Award } from "lucide-react";

export const revalidate = 60;

export default async function StandingsPage() {
  const standings = await getStandings();

  // Enhance standings with team info for stat card calculations
  const enhancedStandings = standings.map((team) => {
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          League Standings
        </h1>
        <p className="text-star-gray font-mono text-shadow">
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
      <StandingsTable standings={standings} />

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

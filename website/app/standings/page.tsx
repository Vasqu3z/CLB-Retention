import { getStandings } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import StandingsTable from "./StandingsTable";
import FadeIn from "@/components/animations/FadeIn";
import LiveStatsIndicator from "@/components/LiveStatsIndicator";
import StatHighlight from "@/components/ui/StatHighlight";

export const revalidate = 60;

export default async function StandingsPage() {
  const standings = await getStandings();

  // Enhance standings with team info for stat card calculations
  const enhancedStandings = standings.map((team) => {
    const teamConfig = getTeamByName(team.team);
    const logos = teamConfig ? getTeamLogoPaths(teamConfig.name) : null;

    return {
      ...team,
      teamConfig,
      teamColor: teamConfig?.primaryColor,
      teamSlug: teamConfig?.slug,
      emblemPath: logos?.emblem,
      fullLogoPath: logos?.full,
    };
  });

  // Calculate stats for stat cards - with safe defaults for empty arrays
  const topTeam = enhancedStandings[0] || null;
  const totalGames = enhancedStandings.reduce((sum, t) => sum + t.wins + t.losses, 0) / 2; // Divide by 2 since each game involves 2 teams

  // Highest Runs/Game team
  const teamsWithGames = enhancedStandings.map(t => {
    const gamesPlayed = t.wins + t.losses;
    return {
      ...t,
      gamesPlayed,
      runsPerGame: gamesPlayed > 0 ? t.runsScored / gamesPlayed : 0,
    };
  });

  // Safe reduce with initial value for empty arrays
  const highestRunsPerGameTeam = teamsWithGames.length > 0
    ? teamsWithGames.reduce((max, t) => t.runsPerGame > max.runsPerGame ? t : max, teamsWithGames[0])
    : null;

  // Lowest ERA team (Runs Allowed / Games) - safe reduce with initial value
  const lowestERATeam = teamsWithGames.length > 0
    ? teamsWithGames.reduce((min, t) => {
        const era = t.gamesPlayed > 0 ? t.runsAllowed / t.gamesPlayed : 999;
        const minEra = min.gamesPlayed > 0 ? min.runsAllowed / min.gamesPlayed : 999;
        return era < minEra ? t : min;
      }, teamsWithGames[0])
    : null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn delay={0} direction="down">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            League Standings
          </h1>
          <LiveStatsIndicator />
        </div>
      </FadeIn>

      {/* Stat Cards */}
      <FadeIn delay={0.15} direction="up">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatHighlight
            label="League Leader"
            value={topTeam ? `${topTeam.wins}-${topTeam.losses}` : 'N/A'}
            subtext={topTeam ? `Win %: ${topTeam.winPct}` : 'No data available'}
            glowColor="#F4D03F"
          />

          <StatHighlight
            label="Games Played"
            value={totalGames}
            subtext="Total games this season"
            glowColor="#00F3FF"
          />

          <StatHighlight
            label="Highest Scoring"
            value={highestRunsPerGameTeam ? highestRunsPerGameTeam.runsPerGame.toFixed(2) : 'N/A'}
            subtext={highestRunsPerGameTeam ? highestRunsPerGameTeam.team : undefined}
            glowColor="#6EE7FF"
          />

          <StatHighlight
            label="Lowest ERA"
            value={lowestERATeam ? (lowestERATeam.gamesPlayed > 0 ? lowestERATeam.runsAllowed / lowestERATeam.gamesPlayed : 0).toFixed(2) : 'N/A'}
            subtext={lowestERATeam ? lowestERATeam.team : undefined}
            glowColor="#7C3AED"
          />
        </div>
      </FadeIn>

      {/* Standings Table */}
      <FadeIn delay={0.3} direction="up">
        <StandingsTable standings={standings} />
      </FadeIn>

      {/* Legend */}
      <FadeIn delay={0.45} direction="up">
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <h3 className="text-sm font-display font-semibold text-comets-orange mb-4 uppercase tracking-wider">
            Legend
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-mono text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-comets-yellow font-semibold">W</span>
              <span className="text-white/70">Wins</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-comets-yellow font-semibold">L</span>
              <span className="text-white/70">Losses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-comets-cyan font-semibold">Win %</span>
              <span className="text-white/70">Winning Percentage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-comets-cyan font-semibold">Diff</span>
              <span className="text-white/70">Run Differential</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80">RS</span>
              <span className="text-white/70">Runs Scored</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80">RA</span>
              <span className="text-white/70">Runs Allowed</span>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

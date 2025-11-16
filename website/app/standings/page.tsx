import { getStandings } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import StatCard from "@/components/StatCard";
import StandingsTable from "./StandingsTable";
import { Trophy, TrendingUp, TrendingDown, Award } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import Image from "next/image";

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

  // Calculate stats for stat cards
  const topTeam = enhancedStandings[0];
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
  const highestRunsPerGameTeam = teamsWithGames.reduce((max, t) =>
    t.runsPerGame > max.runsPerGame ? t : max
  );

  // Lowest ERA team (Runs Allowed / Games)
  const lowestERATeam = teamsWithGames.reduce((min, t) => {
    const era = t.gamesPlayed > 0 ? t.runsAllowed / t.gamesPlayed : 999;
    const minEra = min.gamesPlayed > 0 ? min.runsAllowed / min.gamesPlayed : 999;
    return era < minEra ? t : min;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn delay={0} direction="down">
        <div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            League Standings
          </h1>
          <p className="text-star-gray font-mono text-shadow">
            Regular Season • Updated in real-time
          </p>
        </div>
      </FadeIn>

      {/* Stat Cards */}
      <FadeIn delay={0.15} direction="up">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="League Leader"
            value={`${topTeam?.wins}-${topTeam?.losses}`}
            icon={Trophy}
            sublabel={`Win%: ${topTeam?.winPct}`}
            color="orange"
          >
            {topTeam?.fullLogoPath && (
              <div className="flex items-center justify-center pt-2">
                <div className="w-40 h-20 relative">
                  <Image
                    src={topTeam.fullLogoPath}
                    alt={topTeam.team}
                    width={160}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </StatCard>

          <StatCard
            label="Games Played"
            value={totalGames}
            icon={Award}
            sublabel="Total games this season"
            color="gold"
          />

          <StatCard
            label="Highest Scoring"
            value={highestRunsPerGameTeam.runsPerGame.toFixed(2)}
            icon={TrendingUp}
            sublabel="Runs scored per game"
            color="cyan"
          >
            {highestRunsPerGameTeam?.fullLogoPath && (
              <div className="flex items-center justify-center pt-2">
                <div className="w-40 h-20 relative">
                  <Image
                    src={highestRunsPerGameTeam.fullLogoPath}
                    alt={highestRunsPerGameTeam.team}
                    width={160}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </StatCard>

          <StatCard
            label="Lowest ERA"
            value={(lowestERATeam.gamesPlayed > 0 ? lowestERATeam.runsAllowed / lowestERATeam.gamesPlayed : 0).toFixed(2)}
            icon={TrendingDown}
            sublabel="Runs allowed per game"
            color="teal"
          >
            {lowestERATeam?.fullLogoPath && (
              <div className="flex items-center justify-center pt-2">
                <div className="w-40 h-20 relative">
                  <Image
                    src={lowestERATeam.fullLogoPath}
                    alt={lowestERATeam.team}
                    width={160}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </StatCard>
        </div>
      </FadeIn>

      {/* Standings Table */}
      <FadeIn delay={0.3} direction="up">
        <StandingsTable standings={standings} />
      </FadeIn>

      {/* Legend */}
      <FadeIn delay={0.45} direction="up">
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
      </FadeIn>
    </div>
  );
}

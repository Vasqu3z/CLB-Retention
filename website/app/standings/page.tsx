import { getStandings } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths, getLeagueLogo } from "@/lib/teamLogos";
import StatCard from "@/components/StatCard";
import StandingsTable from "./StandingsTable";
import { Trophy, TrendingUp, TrendingDown, Award } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import Image from "next/image";
import EmptyState from "@/components/EmptyState";

export const revalidate = 60;

export default async function StandingsPage() {
  const standings = await getStandings();
  const hasStandings = standings.length > 0;

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
  const highestRunsPerGameTeam = teamsWithGames.length > 0
    ? teamsWithGames.reduce((max, t) =>
        t.runsPerGame > max.runsPerGame ? t : max
      )
    : null;

  // Lowest ERA team (Runs Allowed / Games)
  const lowestERATeam = teamsWithGames.length > 0
    ? teamsWithGames.reduce((min, t) => {
        const era = t.gamesPlayed > 0 ? t.runsAllowed / t.gamesPlayed : 999;
        const minEra = min.gamesPlayed > 0 ? min.runsAllowed / min.gamesPlayed : 999;
        return era < minEra ? t : min;
      })
    : null;

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

      {hasStandings ? (
        <>
          {/* Stat Cards */}
          <FadeIn delay={0.15} direction="up">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="League Leader"
                value={topTeam ? `${topTeam.wins}-${topTeam.losses}` : '—'}
                icon={Trophy}
                sublabel={topTeam ? `Win %: ${topTeam.winPct}` : 'Awaiting results'}
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
              >
                <div className="flex items-center justify-center pt-2">
                  <div className="w-30 h-20 relative">
                    <Image
                      src={getLeagueLogo()}
                      alt="CLB Logo"
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                </div>
              </StatCard>

              <StatCard
                label="Highest Scoring"
                value={highestRunsPerGameTeam ? highestRunsPerGameTeam.runsPerGame.toFixed(2) : '0.00'}
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
                value={
                  lowestERATeam
                    ? (lowestERATeam.gamesPlayed > 0
                        ? lowestERATeam.runsAllowed / lowestERATeam.gamesPlayed
                        : 0
                      ).toFixed(2)
                    : '0.00'
                }
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
        </>
      ) : (
        <FadeIn delay={0.15} direction="up">
          <EmptyState
            icon="radar"
            title="Standings warming up"
            message="We're still collecting the first results of the season. Check back soon for live standings updates."
          />
        </FadeIn>
      )}
    </div>
  );
}

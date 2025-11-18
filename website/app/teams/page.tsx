import { getTeamData, getStandings, getPlayoffSchedule } from '@/lib/sheets';
import TeamStatsView from './TeamStatsView';
import FadeIn from "@/components/animations/FadeIn";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

function buildRunsMapFromStandings(standings: Awaited<ReturnType<typeof getStandings>>) {
  return standings.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.team] = entry.runsScored || 0;
    return acc;
  }, {});
}

function buildRunsMapFromPlayoffs(games: Awaited<ReturnType<typeof getPlayoffSchedule>>) {
  return games.reduce<Record<string, number>>((acc, game) => {
    if (!game.played || game.homeScore === undefined || game.awayScore === undefined) {
      return acc;
    }

    acc[game.homeTeam] = (acc[game.homeTeam] || 0) + (game.homeScore || 0);
    acc[game.awayTeam] = (acc[game.awayTeam] || 0) + (game.awayScore || 0);
    return acc;
  }, {});
}

export default async function TeamsPage() {
  // Fetch both regular season and playoff data
  const [regularTeamData, regularStandings, playoffTeamData, playoffSchedule] = await Promise.all([
    getTeamData(undefined, false),
    getStandings(false),
    getTeamData(undefined, true),
    getPlayoffSchedule(),
  ]);

  const regularRunsByTeam = buildRunsMapFromStandings(regularStandings);
  const playoffRunsByTeam = buildRunsMapFromPlayoffs(playoffSchedule);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn delay={0} direction="down">
        <div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Team Statistics
          </h1>
          <p className="text-star-gray font-mono text-shadow">
            Team Stats • Updated in real-time
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.15} direction="up">
        <TeamStatsView
          regularTeamData={regularTeamData}
          playoffTeamData={playoffTeamData}
          regularRunsByTeam={regularRunsByTeam}
          playoffRunsByTeam={playoffRunsByTeam}
        />
      </FadeIn>
    </div>
  );
}

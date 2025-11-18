import { getTeamData, getStandings, getPlayoffSchedule, StandingsRow, PlayoffGame, TeamData } from '@/lib/sheets';
import TeamStatsView from './TeamStatsView';
import FadeIn from "@/components/animations/FadeIn";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function TeamsPage() {
  // Fetch both regular season and playoff data
  const [regularTeamData, regularStandings, playoffTeamData, playoffSchedule] = await Promise.all([
    getTeamData(undefined, false),
    getStandings(false),
    getTeamData(undefined, true),
    getPlayoffSchedule(),
  ]);

  const regularRunsByTeam = mapRunsFromStandings(regularStandings);
  const playoffRunsByTeam = mapRunsFromPlayoffGames(playoffTeamData, playoffSchedule);

  const playoffEligibleTeams = regularStandings.slice(0, 4).map((row) => row.team);

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
          playoffEligibleTeams={playoffEligibleTeams}
        />
      </FadeIn>
    </div>
  );
}

function mapRunsFromStandings(standings: StandingsRow[]): Record<string, number> {
  return standings.reduce((acc, row) => {
    acc[row.team] = row.runsScored;
    return acc;
  }, {} as Record<string, number>);
}

function mapRunsFromPlayoffGames(teams: TeamData[], games: PlayoffGame[]): Record<string, number> {
  const baseMap = teams.reduce((acc, team) => {
    acc[team.teamName] = 0;
    return acc;
  }, {} as Record<string, number>);

  for (const game of games) {
    if (!game.played || typeof game.homeScore !== 'number' || typeof game.awayScore !== 'number') {
      continue;
    }

    if (game.homeTeam) {
      baseMap[game.homeTeam] = (baseMap[game.homeTeam] ?? 0) + game.homeScore;
    }

    if (game.awayTeam) {
      baseMap[game.awayTeam] = (baseMap[game.awayTeam] ?? 0) + game.awayScore;
    }
  }

  return baseMap;
}

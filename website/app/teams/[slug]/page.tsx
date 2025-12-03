import { getTeamBySlug, getTeamRoster, getSchedule, getStandings, getTeamData, getPlayoffSchedule } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import TeamPageView from './TeamPageView';

// Use Incremental Static Regeneration with 60-second revalidation
// Pages are generated on-demand (first request) to avoid API quota during build
export const revalidate = 60;
export const dynamicParams = true; // Allow dynamic params without pre-generation

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  // Fetch both regular season and playoff data
  const [
    regularRoster,
    regularFullSchedule,
    regularStandings,
    regularTeamDataList,
    playoffRoster,
    playoffFullSchedule,
    playoffStandings,
    playoffTeamDataList,
  ] = await Promise.all([
    getTeamRoster(team.name, false),
    getSchedule(),
    getStandings(false),
    getTeamData(team.name, false),
    getTeamRoster(team.name, true),
    getPlayoffSchedule(),
    getStandings(true),
    getTeamData(team.name, true),
  ]);

  // Filter schedules for this team
  const regularTeamSchedule = regularFullSchedule.filter(
    (game) => game.homeTeam === team.name || game.awayTeam === team.name
  );
  const playoffTeamSchedule = playoffFullSchedule.filter(
    (game) => game.homeTeam === team.name || game.awayTeam === team.name
  );

  // Find team's standings records
  const regularTeamStanding = regularStandings.find((s) => s.team === team.name);
  const playoffTeamStanding = playoffStandings.find((s) => s.team === team.name);

  // Get team data (should only be one result when filtered by team name)
  const regularTeamData = regularTeamDataList.length > 0 ? regularTeamDataList[0] : undefined;
  const playoffTeamData = playoffTeamDataList.length > 0 ? playoffTeamDataList[0] : undefined;

  return (
    <TeamPageView
      team={team}
      regularRoster={regularRoster}
      regularSchedule={regularTeamSchedule}
      regularStanding={regularTeamStanding}
      regularTeamData={regularTeamData}
      playoffRoster={playoffRoster}
      playoffSchedule={playoffTeamSchedule}
      playoffStanding={playoffTeamStanding}
      playoffTeamData={playoffTeamData}
    />
  );
}

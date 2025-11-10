import { getTeamBySlug } from '@/config/league';
import { getTeamRoster, getSchedule, getStandings } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import TeamPageView from './TeamPageView';

export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-dynamic'; // Prevent static generation to avoid API quota during build

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  // Fetch team roster, schedule, and standings
  const [roster, fullSchedule, standings] = await Promise.all([
    getTeamRoster(team.name),
    getSchedule(),
    getStandings(),
  ]);

  // Filter schedule for this team
  const teamSchedule = fullSchedule.filter(
    (game) => game.homeTeam === team.name || game.awayTeam === team.name
  );

  // Find team's standings record
  const teamStanding = standings.find((s) => s.team === team.name);

  return (
    <TeamPageView
      team={team}
      roster={roster}
      schedule={teamSchedule}
      standing={teamStanding}
    />
  );
}

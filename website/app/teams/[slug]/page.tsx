import { getTeamBySlug } from '@/config/league';
import { getTeamRoster, getSchedule } from '@/lib/sheets';
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

  // Fetch team roster and schedule
  const [roster, fullSchedule] = await Promise.all([
    getTeamRoster(team.name),
    getSchedule(),
  ]);

  // Filter schedule for this team
  const teamSchedule = fullSchedule.filter(
    (game) => game.homeTeam === team.name || game.awayTeam === team.name
  );

  return (
    <TeamPageView
      team={team}
      roster={roster}
      schedule={teamSchedule}
    />
  );
}

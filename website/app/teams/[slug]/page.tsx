import { getTeamBySlug, getActiveTeams } from '@/config/league';
import { getTeamRoster, getSchedule } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import TeamPageView from './TeamPageView';

export const revalidate = 60; // Revalidate every 60 seconds

// Generate static params for all active teams
export async function generateStaticParams() {
  const teams = getActiveTeams();
  return teams.map((team) => ({
    slug: team.slug,
  }));
}

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

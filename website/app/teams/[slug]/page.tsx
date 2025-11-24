import { getTeamBySlug } from '@/config/league';
import { getTeamRoster, getSchedule, getStandings } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import { TeamDetailsClient } from './TeamDetailsClient';

export const revalidate = 60;
export const dynamicParams = true;

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  const [roster, fullSchedule, standings] = await Promise.all([
    getTeamRoster(team.name, false),
    getSchedule(),
    getStandings(false),
  ]);

  const teamSchedule = fullSchedule.filter(
    (game) => game.homeTeam === team.name || game.awayTeam === team.name
  );

  const teamStanding = standings.find((s) => s.team === team.name);

  return (
    <TeamDetailsClient
      team={team}
      roster={roster}
      schedule={teamSchedule}
      standing={teamStanding}
    />
  );
}

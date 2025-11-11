import { getTeamData, getStandings } from '@/lib/sheets';
import TeamStatsView from './TeamStatsView';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function TeamsPage() {
  const [teamData, standings] = await Promise.all([
    getTeamData(),
    getStandings(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Team Statistics</h1>
      <TeamStatsView teamData={teamData} standings={standings} />
    </div>
  );
}

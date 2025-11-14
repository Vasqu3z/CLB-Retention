import { getTeamData, getStandings } from '@/lib/sheets';
import TeamStatsView from './TeamStatsView';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function TeamsPage() {
  // Fetch both regular season and playoff data
  const [regularTeamData, regularStandings, playoffTeamData, playoffStandings] = await Promise.all([
    getTeamData(undefined, false),
    getStandings(false),
    getTeamData(undefined, true),
    getStandings(true),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Team Statistics</h1>
      <TeamStatsView
        regularTeamData={regularTeamData}
        regularStandings={regularStandings}
        playoffTeamData={playoffTeamData}
        playoffStandings={playoffStandings}
      />
    </div>
  );
}

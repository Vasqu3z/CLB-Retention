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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent">
          Team Statistics
        </h1>
        <p className="text-star-gray font-mono">
          Comprehensive team performance metrics
        </p>
      </div>

      <TeamStatsView
        regularTeamData={regularTeamData}
        regularStandings={regularStandings}
        playoffTeamData={playoffTeamData}
        playoffStandings={playoffStandings}
      />
    </div>
  );
}

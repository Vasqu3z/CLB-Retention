import { getTeamData, getStandings } from '@/lib/sheets';
import TeamStatsView from './TeamStatsView';
import FadeIn from "@/components/animations/FadeIn";

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
          regularStandings={regularStandings}
          playoffTeamData={playoffTeamData}
          playoffStandings={playoffStandings}
        />
      </FadeIn>
    </div>
  );
}

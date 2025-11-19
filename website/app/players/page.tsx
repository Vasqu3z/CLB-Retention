import { getAllPlayers } from '@/lib/sheets';
import PlayersView from './PlayersView';
import FadeIn from "@/components/animations/FadeIn";
import LiveStatsIndicator from "@/components/LiveStatsIndicator";

// Use Incremental Static Regeneration with 60-second revalidation
export const revalidate = 60;

export default async function PlayersPage() {
  // Fetch both regular season and playoff player data
  const [regularPlayers, playoffPlayers] = await Promise.all([
    getAllPlayers(false),
    getAllPlayers(true),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn delay={0} direction="down">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-nebula-cyan to-nebula-teal bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Player Statistics
          </h1>
          <LiveStatsIndicator />
        </div>
      </FadeIn>

      <FadeIn delay={0.15} direction="up">
        <PlayersView
          regularPlayers={regularPlayers}
          playoffPlayers={playoffPlayers}
        />
      </FadeIn>
    </div>
  );
}

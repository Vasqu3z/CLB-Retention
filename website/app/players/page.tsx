import { getAllPlayers } from '@/lib/sheets';
import PlayersView from './PlayersView';

export const dynamic = 'force-dynamic';
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
      <div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-nebula-cyan to-nebula-teal bg-clip-text text-transparent">
          Player Statistics
        </h1>
        <p className="text-star-gray font-mono">
          Individual player performance across all teams
        </p>
      </div>

      <PlayersView
        regularPlayers={regularPlayers}
        playoffPlayers={playoffPlayers}
      />
    </div>
  );
}

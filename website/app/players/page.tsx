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
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Player Statistics</h1>
      <PlayersView
        regularPlayers={regularPlayers}
        playoffPlayers={playoffPlayers}
      />
    </div>
  );
}

import { getAllPlayers } from '@/lib/sheets';
import StatsComparisonView from './StatsComparisonView';

// Use Incremental Static Regeneration with 60-second revalidation
export const revalidate = 60;

/**
 * Player Stats Comparison Tool
 * Compare 2-5 players side-by-side for hitting, pitching, and fielding stats
 */
export default async function StatsComparisonPage() {
  // Fetch both regular season and playoff stats
  const [regularPlayers, playoffPlayers] = await Promise.all([
    getAllPlayers(false),
    getAllPlayers(true),
  ]);

  // Sort players alphabetically by name
  const sortedRegular = regularPlayers.sort((a, b) => a.name.localeCompare(b.name));
  const sortedPlayoffs = playoffPlayers.sort((a, b) => a.name.localeCompare(b.name));

  return <StatsComparisonView regularPlayers={sortedRegular} playoffPlayers={sortedPlayoffs} />;
}

export const metadata = {
  title: 'Stats Comparison - Comets League Baseball',
  description: 'Compare player hitting, pitching, and fielding statistics side-by-side',
};

import { getChemistryMatrix, getAllPlayerAttributes } from '@/lib/sheets';
import LineupBuilderView from './LineupBuilderView';

// Use Incremental Static Regeneration with 60-second revalidation
export const revalidate = 60;

/**
 * Lineup Builder Tool
 * Interactive baseball field with drag-and-drop player placement,
 * real-time chemistry visualization, and lineup saving
 */
export default async function LineupBuilderPage() {
  // Fetch chemistry matrix and player list
  const [chemistryMatrix, allPlayers] = await Promise.all([
    getChemistryMatrix(),
    getAllPlayerAttributes(),
  ]);

  // Get sorted list of player names
  const playerNames = allPlayers.map(p => p.name).sort();

  return <LineupBuilderView chemistryMatrix={chemistryMatrix} playerNames={playerNames} />;
}

export const metadata = {
  title: 'Lineup Builder - Comets League Baseball',
  description: 'Build and optimize your lineup with interactive chemistry visualization',
};

import { getChemistryMatrix, getAllPlayerAttributes } from '@/lib/sheets';
import ChemistryToolView from './ChemistryToolView';

// Use Incremental Static Regeneration with 60-second revalidation
export const revalidate = 60;

/**
 * Player Chemistry Tool
 * Multi-player chemistry comparison showing positive/negative relationships
 * and team analysis for shared chemistry and conflicts
 */
export default async function ChemistryToolPage() {
  // Fetch chemistry matrix and player list
  const [chemistryMatrix, allPlayers] = await Promise.all([
    getChemistryMatrix(),
    getAllPlayerAttributes(),
  ]);

  // Get sorted list of player names
  const playerNames = allPlayers.map(p => p.name).sort();

  return <ChemistryToolView chemistryMatrix={chemistryMatrix} playerNames={playerNames} />;
}

export const metadata = {
  title: 'Chemistry Tool - Comets League Baseball',
  description: 'Analyze player chemistry relationships and team compatibility',
};

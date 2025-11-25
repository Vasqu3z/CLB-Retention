import { getAllPlayerAttributes } from '@/lib/sheets';
import AttributeComparisonView from './AttributeComparisonView';

// Use Incremental Static Regeneration with 60-second revalidation
export const revalidate = 60;

/**
 * Player Attribute Comparison Tool
 * Compare 2-5 players side-by-side with all 30 attributes
 */
export default async function AttributeComparisonPage() {
  const allPlayers = await getAllPlayerAttributes();

  // Sort players alphabetically by name
  const sortedPlayers = allPlayers.sort((a, b) => a.name.localeCompare(b.name));

  return <AttributeComparisonView players={sortedPlayers} />;
}

export const metadata = {
  title: 'Attribute Comparison - Comets League Baseball',
  description: 'Compare player attributes side-by-side for all 30 stats',
};

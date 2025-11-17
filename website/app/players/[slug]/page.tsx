import { getAllPlayers, getPlayerAttributes, getPlayerChemistry, getPlayerRegistry } from '@/lib/sheets';
import { playerNameToSlug } from '@/lib/utils';
import { notFound } from 'next/navigation';
import PlayerProfileView from './PlayerProfileView';

// Use Incremental Static Regeneration with 60-second revalidation
export const revalidate = 60;

/**
 * Converts a URL slug back to a player name by matching against all players
 * Example: "mario" → "Mario", "luigi-jr" → "Luigi Jr."
 */
async function slugToPlayerName(slug: string): Promise<string | null> {
  const [regularPlayers, playoffPlayers, registry] = await Promise.all([
    getAllPlayers(false),
    getAllPlayers(true),
    getPlayerRegistry(),
  ]);

  // Combine all unique player names
  const allPlayerNames = new Set<string>();
  regularPlayers.forEach(p => allPlayerNames.add(p.name));
  playoffPlayers.forEach(p => allPlayerNames.add(p.name));
  registry.forEach(p => allPlayerNames.add(p.playerName));

  // Find player name matching this slug
  for (const playerName of allPlayerNames) {
    if (playerNameToSlug(playerName) === slug) {
      return playerName;
    }
  }

  return null;
}

/**
 * Generate static params for all players (for static generation at build time)
 */
export async function generateStaticParams() {
  const registry = await getPlayerRegistry();

  return registry.map((player) => ({
    slug: playerNameToSlug(player.playerName),
  }));
}

/**
 * Generate metadata for player profile pages
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playerName = await slugToPlayerName(slug);

  if (!playerName) {
    return {
      title: 'Player Not Found - Comets League Baseball',
    };
  }

  return {
    title: `${playerName} - Player Profile - Comets League Baseball`,
    description: `View comprehensive stats, attributes, and chemistry for ${playerName}`,
  };
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playerName = await slugToPlayerName(slug);

  if (!playerName) {
    notFound();
  }

  // Fetch all player data in parallel
  const [
    regularPlayers,
    playoffPlayers,
    attributes,
    chemistry,
    registry,
  ] = await Promise.all([
    getAllPlayers(false),
    getAllPlayers(true),
    getPlayerAttributes(playerName),
    getPlayerChemistry(playerName),
    getPlayerRegistry(),
  ]);

  // Find player stats
  const regularStats = regularPlayers.find(p => p.name === playerName);
  const playoffStats = playoffPlayers.find(p => p.name === playerName);

  // Find player registry entry (for team, image URL)
  const registryEntry = registry.find(p => p.playerName === playerName);

  // If player doesn't exist in any data source, show 404
  if (!regularStats && !playoffStats && !attributes) {
    notFound();
  }

  return (
    <PlayerProfileView
      playerName={playerName}
      regularStats={regularStats || null}
      playoffStats={playoffStats || null}
      attributes={attributes}
      chemistry={chemistry}
      registryEntry={registryEntry || null}
    />
  );
}

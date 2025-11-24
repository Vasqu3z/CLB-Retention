import { CHEMISTRY_LOOKUP_SHEET } from '@/config/sheets';
import {
  getChemistryMatrix,
  getAllPlayerAttributes,
  getPlayerRegistry,
  getTeamRegistry,
} from '@/lib/sheets';
import LineupBuilder, { LineupPlayer } from './LineupBuilder';

// Use Incremental Static Regeneration with 60-second revalidation
export const revalidate = 60;

/**
 * Lineup Builder Tool
 * Interactive baseball field with drag-and-drop player placement,
 * real-time chemistry visualization, and lineup saving
 */
export default async function LineupBuilderPage() {
  const [chemistryMatrix, allPlayers, registry, teams] = await Promise.all([
    getChemistryMatrix(),
    getAllPlayerAttributes(),
    getPlayerRegistry(),
    getTeamRegistry(),
  ]);

  const positiveThreshold = CHEMISTRY_LOOKUP_SHEET.THRESHOLDS.POSITIVE_MIN ?? 100;

  const teamColorByName = new Map(
    teams.map(team => [team.teamName, team.color || '#00F3FF'])
  );

  const registryByPlayer = new Map(
    registry.map(entry => [entry.playerName, entry])
  );

  const lineupPlayers: LineupPlayer[] = allPlayers.map(player => {
    const registryEntry = registryByPlayer.get(player.name);
    const teamName = registryEntry?.team || 'Free Agent';
    const chemistryPartners = Object.entries(chemistryMatrix[player.name] ?? {})
      .filter(([, value]) => value >= positiveThreshold)
      .map(([name]) => name);

    const powerValue = player.chargeHitPower ?? player.battingOverall ?? 0;
    const speedValue = player.speedOverall ?? player.speed ?? 0;

    return {
      id: player.name,
      name: player.name,
      team: teamName,
      teamColor: teamColorByName.get(teamName) || '#00F3FF',
      positions: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'],
      stats: {
        avg: (player.battingAverage ?? 0).toFixed(3).replace(/^0/, '.'),
        power: Math.min(
          100,
          Math.max(0, Math.round(powerValue))
        ),
        speed: Math.min(
          100,
          Math.max(0, Math.round(speedValue))
        ),
      },
      // Chemistry partners kept for compatibility with the neon builder visuals
      // even though connections are rendered via chemistryMatrix.
      chemistry: chemistryPartners,
    };
  });

  return (
    <LineupBuilder
      players={lineupPlayers}
      chemistryMatrix={chemistryMatrix}
      positiveChemistryThreshold={positiveThreshold}
    />
  );
}

export const metadata = {
  title: 'Lineup Builder - Comets League Baseball',
  description: 'Build and optimize your lineup with interactive chemistry visualization',
};

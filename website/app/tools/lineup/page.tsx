import React from "react";
import { getAllPlayers, getAllPlayerAttributes, getChemistryMatrix, getPlayerRegistry, getTeamRegistry } from "@/lib/sheets";
import LineupBuilderClient from "./LineupBuilderClient";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function LineupBuilderPage() {
  // Fetch all necessary data
  const [allPlayers, attributes, chemistryMatrix, playerRegistry, teamRegistry] = await Promise.all([
    getAllPlayers(false),
    getAllPlayerAttributes(),
    getChemistryMatrix(),
    getPlayerRegistry(),
    getTeamRegistry(),
  ]);

  // Create team color map
  const teamColorMap = new Map(
    teamRegistry.map(t => [t.teamName, t.color])
  );

  // Create attributes map
  const attributesMap = new Map(
    attributes.map(attr => [attr.name, attr])
  );

  // Create player image map
  const playerImageMap = new Map(
    playerRegistry.map(p => [p.playerName, p.imageUrl])
  );

  // Transform players data for lineup builder
  const players = allPlayers
    .filter(p => p.ab && p.ab > 0) // Only players with at-bats
    .map(player => {
      const playerAttributes = attributesMap.get(player.name);
      const playerChemistry = chemistryMatrix[player.name] || {};
      const teamColor = teamColorMap.get(player.team) || "#FFFFFF";

      // Build chemistry array with positive connections
      const chemistry = Object.entries(playerChemistry)
        .filter(([_, value]) => value >= 100)
        .map(([name, value]) => ({ name, value }));

      return {
        id: slugify(player.name),
        name: player.name,
        team: player.team,
        teamColor,
        imageUrl: playerImageMap.get(player.name) || "",
        stats: {
          avg: player.avg || ".000",
          power: playerAttributes?.battingOverall || 50,
          speed: playerAttributes?.speedOverall || 50,
          chemistry,
        },
      };
    })
    .sort((a, b) => parseFloat(b.stats.avg) - parseFloat(a.stats.avg)); // Sort by batting average

  return <LineupBuilderClient players={players} />;
}

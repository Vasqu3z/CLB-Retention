import React from "react";
import { getAllPlayers, getPlayerRegistry, getTeamRegistry } from "@/lib/sheets";
import CompareClient from "./CompareClient";

export default async function ComparePage() {
  // Fetch player data from Google Sheets
  const [allPlayers, playerRegistry, teamRegistry] = await Promise.all([
    getAllPlayers(false),
    getPlayerRegistry(),
    getTeamRegistry(),
  ]);

  // Create maps for player data
  const playerTeamMap = new Map(
    playerRegistry.map(p => [p.playerName, p.team])
  );
  const playerImageMap = new Map(
    playerRegistry.map(p => [p.playerName, p.imageUrl])
  );

  // Create a map of team names to colors
  const teamColorMap = new Map(
    teamRegistry.map(t => [t.teamName, t.color])
  );

  // Transform player data for comparison
  const players = allPlayers.map(player => {
    const teamName = playerTeamMap.get(player.name) || player.team;
    const teamColor = teamColorMap.get(teamName) || "#FFFFFF";
    const imageUrl = playerImageMap.get(player.name) || "";

    return {
      name: player.name,
      team: teamName,
      color: teamColor,
      imageUrl,
      stats: {
        avg: player.avg,
        hr: player.hr,
        ops: player.ops,
        era: player.era,
        w: player.w,
        sv: player.sv,
      },
    };
  });

  return <CompareClient players={players} />;
}

import React from "react";
import { getAllPlayers, getTeamRegistry } from "@/lib/sheets";
import StatsClient from "./StatsClient";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function StatsComparisonPage() {
  // Fetch all players and team data
  const [allPlayers, teamRegistry] = await Promise.all([
    getAllPlayers(false),
    getTeamRegistry(),
  ]);

  // Create team color map
  const teamColorMap = new Map(
    teamRegistry.map(t => [t.teamName, t.color])
  );

  // Transform player data for stats comparison
  const players = allPlayers.map(player => {
    const teamColor = teamColorMap.get(player.team) || "#FFFFFF";

    return {
      id: slugify(player.name),
      name: player.name,
      team: player.team,
      color: teamColor,
      stats: {
        batting: {
          avg: player.avg || ".000",
          hr: player.hr || 0,
          rbi: player.rbi || 0,
          ops: player.ops || "0.000",
          sb: player.sb || 0,
        },
        pitching: {
          era: player.era || "0.00",
          w: player.w || 0,
          l: player.l || 0,
          sv: player.sv || 0,
          ip: player.ip?.toFixed(1) || "0.0",
        },
        fielding: {
          np: player.np || 0,
          e: player.e || 0,
          oaa: player.oaa || 0,
        },
      },
    };
  });

  return <StatsClient players={players} />;
}

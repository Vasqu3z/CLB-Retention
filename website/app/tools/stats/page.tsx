import React from "react";
import { getAllPlayers, getTeamRegistry } from "@/lib/sheets";
import StatsClient from "./StatsClient";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function StatsComparisonPage() {
  // Fetch both regular season and playoff players, plus team data
  const [regularPlayers, playoffPlayers, teamRegistry] = await Promise.all([
    getAllPlayers(false), // Regular season
    getAllPlayers(true),  // Playoffs
    getTeamRegistry(),
  ]);

  // Create team color map
  const teamColorMap = new Map(
    teamRegistry.map(t => [t.teamName, t.color])
  );

  // Transform player data for stats comparison - include all stats
  const transformPlayers = (players: typeof regularPlayers) =>
    players.map(player => {
      const teamColor = teamColorMap.get(player.team) || "#FFFFFF";

      return {
        id: slugify(player.name),
        name: player.name,
        team: player.team,
        color: teamColor,
        stats: {
          batting: {
            gp: player.gp || 0,
            ab: player.ab || 0,
            h: player.h || 0,
            hr: player.hr || 0,
            rbi: player.rbi || 0,
            rob: player.rob || 0,
            dp: player.dp || 0,
            sb: player.sb || 0,
            avg: player.avg || ".000",
            obp: player.obp || ".000",
            slg: player.slg || ".000",
            ops: player.ops || ".000",
          },
          pitching: {
            ip: player.ip || 0,
            w: player.w || 0,
            l: player.l || 0,
            sv: player.sv || 0,
            hAllowed: player.hAllowed || 0,
            hrAllowed: player.hrAllowed || 0,
            era: player.era || "0.00",
            whip: player.whip || "0.00",
            baa: player.baa || ".000",
          },
          fielding: {
            np: player.np || 0,
            e: player.e || 0,
            oaa: player.oaa || 0,
            cs: player.cs || 0,
          },
        },
      };
    });

  return (
    <StatsClient
      regularPlayers={transformPlayers(regularPlayers)}
      playoffPlayers={transformPlayers(playoffPlayers)}
    />
  );
}

export const metadata = {
  title: "Stats Comparison - Comets League Baseball",
  description: "Compare player statistics side-by-side for hitting, pitching, and fielding",
};

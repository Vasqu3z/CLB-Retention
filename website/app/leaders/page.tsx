import React from "react";
import {
  getCalculatedBattingLeaders,
  getCalculatedPitchingLeaders,
  getCalculatedFieldingLeaders,
  getPlayerRegistry,
} from "@/lib/sheets";
import LeadersClient from "./LeadersClient";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function LeadersPage() {
  // Fetch regular season and playoff leaders for all categories
  const [
    regularBattingLeaders,
    regularPitchingLeaders,
    regularFieldingLeaders,
    playoffBattingLeaders,
    playoffPitchingLeaders,
    playoffFieldingLeaders,
    playerRegistry,
  ] = await Promise.all([
    getCalculatedBattingLeaders(false),
    getCalculatedPitchingLeaders(false),
    getCalculatedFieldingLeaders(false),
    getCalculatedBattingLeaders(true),
    getCalculatedPitchingLeaders(true),
    getCalculatedFieldingLeaders(true),
    getPlayerRegistry(),
  ]);

  // Create player image map
  const playerImageMap: Record<string, string> = {};
  playerRegistry.forEach(p => {
    playerImageMap[p.playerName] = p.imageUrl;
  });

  return (
    <LeadersClient
      regularBattingLeaders={regularBattingLeaders}
      regularPitchingLeaders={regularPitchingLeaders}
      regularFieldingLeaders={regularFieldingLeaders}
      playoffBattingLeaders={playoffBattingLeaders}
      playoffPitchingLeaders={playoffPitchingLeaders}
      playoffFieldingLeaders={playoffFieldingLeaders}
      playerImageMap={playerImageMap}
    />
  );
}

export const metadata = {
  title: "League Leaders - Comets League Baseball",
  description: "Top players in batting, pitching, and fielding statistics",
};

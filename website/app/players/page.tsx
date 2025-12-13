import React from "react";
import { getAllPlayers, getPlayerRegistry } from "@/lib/sheets";
import PlayersClient from "./PlayersClient";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function PlayersPage() {
  // Fetch both regular season and playoff data, plus player registry for images
  const [regularPlayers, playoffPlayers, playerRegistry] = await Promise.all([
    getAllPlayers(false),
    getAllPlayers(true),
    getPlayerRegistry(),
  ]);

  // Create a map of player names to their image URLs
  const playerImageMap = new Map(
    playerRegistry.map(p => [p.playerName, p.imageUrl])
  );

  // Merge image URLs into player stats
  const regularPlayersWithImages = regularPlayers.map(player => ({
    ...player,
    imageUrl: playerImageMap.get(player.name) || ""
  }));

  const playoffPlayersWithImages = playoffPlayers.map(player => ({
    ...player,
    imageUrl: playerImageMap.get(player.name) || ""
  }));

  return (
    <PlayersClient
      regularPlayers={regularPlayersWithImages}
      playoffPlayers={playoffPlayersWithImages}
    />
  );
}

import React from "react";
import { getAllPlayers } from "@/lib/sheets";
import PlayersClient from "./PlayersClient";

export default async function PlayersPage() {
  // Fetch both regular season and playoff data
  const [regularPlayers, playoffPlayers] = await Promise.all([
    getAllPlayers(false),
    getAllPlayers(true),
  ]);

  return <PlayersClient regularPlayers={regularPlayers} playoffPlayers={playoffPlayers} />;
}

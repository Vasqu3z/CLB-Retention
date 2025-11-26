import React from "react";
import { notFound } from "next/navigation";
import { getAllPlayers, getPlayerAttributes, getChemistryMatrix, getTeamRegistry } from "@/lib/sheets";
import PlayerProfileClient from "./PlayerProfileClient";

function deslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playerNameGuess = deslugify(slug);

  // Fetch all necessary data from Google Sheets
  const [allPlayers, teamRegistry, chemistryMatrix] = await Promise.all([
    getAllPlayers(false),
    getTeamRegistry(),
    getChemistryMatrix(),
  ]);

  // Find the player by matching the slug
  const player = allPlayers.find(
    p => p.name.toLowerCase().replace(/\s+/g, '-') === slug ||
         p.name.toLowerCase() === playerNameGuess.toLowerCase()
  );

  if (!player) {
    return notFound();
  }

  // Fetch player attributes
  const attributes = await getPlayerAttributes(player.name);

  // Get team color
  const team = teamRegistry.find(t => t.teamName === player.team);
  const teamColor = team?.color || "#FFFFFF";

  // Get player chemistry
  const playerChemistry = chemistryMatrix[player.name] || {};
  const positiveChemistry: Array<{name: string, value: number}> = [];
  const negativeChemistry: Array<{name: string, value: number}> = [];

  Object.entries(playerChemistry).forEach(([otherPlayer, value]) => {
    if (value >= 100) {
      positiveChemistry.push({ name: otherPlayer, value });
    } else if (value <= -100) {
      negativeChemistry.push({ name: otherPlayer, value });
    }
  });

  positiveChemistry.sort((a, b) => b.value - a.value);
  negativeChemistry.sort((a, b) => a.value - b.value);

  return (
    <PlayerProfileClient
      player={player}
      attributes={attributes}
      teamColor={teamColor}
      positiveChemistry={positiveChemistry.slice(0, 10)}
      negativeChemistry={negativeChemistry.slice(0, 10)}
    />
  );
}

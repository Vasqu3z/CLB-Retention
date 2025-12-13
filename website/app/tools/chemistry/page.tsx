import React from "react";
import { getChemistryMatrix, getPlayerRegistry, getTeamRegistry } from "@/lib/sheets";
import ChemistryClient from "./ChemistryClient";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function ChemistryToolPage() {
  // Fetch chemistry matrix and registries from Google Sheets
  const [chemistryMatrix, playerRegistry, teamRegistry] = await Promise.all([
    getChemistryMatrix(),
    getPlayerRegistry(),
    getTeamRegistry(),
  ]);

  // Create a map of player names to their teams
  const playerTeamMap = new Map(
    playerRegistry.map(p => [p.playerName, p.team])
  );

  // Create a map of team names to their colors
  const teamColorMap = new Map(
    teamRegistry.map(t => [t.teamName, t.color])
  );

  // Get all unique player names from the chemistry matrix
  const playerNamesSet = new Set<string>();
  Object.keys(chemistryMatrix).forEach(player => {
    playerNamesSet.add(player);
    Object.keys(chemistryMatrix[player] || {}).forEach(otherPlayer => {
      playerNamesSet.add(otherPlayer);
    });
  });

  // Transform player data for the client component
  const players = Array.from(playerNamesSet).map(name => {
    const teamName = playerTeamMap.get(name) || "Unknown";
    const teamColor = teamColorMap.get(teamName) || "#FFFFFF";

    return {
      id: slugify(name),
      name,
      team: teamName,
      color: teamColor,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return <ChemistryClient players={players} chemistryMatrix={chemistryMatrix} />;
}

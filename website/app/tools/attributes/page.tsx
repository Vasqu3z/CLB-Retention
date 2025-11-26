import React from "react";
import { getAllPlayerAttributes, getPlayerRegistry, getTeamRegistry } from "@/lib/sheets";
import AttributesClient from "./AttributesClient";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function AttributeComparisonPage() {
  // Fetch player attributes and registries from Google Sheets
  const [attributes, playerRegistry, teamRegistry] = await Promise.all([
    getAllPlayerAttributes(),
    getPlayerRegistry(),
    getTeamRegistry(),
  ]);

  // Create a map of player names to their teams
  const playerTeamMap = new Map(
    playerRegistry.map(p => [p.playerName, p.teamName])
  );

  // Create a map of team names to their colors
  const teamColorMap = new Map(
    teamRegistry.map(t => [t.teamName, t.color])
  );

  // Transform attributes data for the client component
  const players = attributes.map(attr => {
    const teamName = playerTeamMap.get(attr.name) || "Unknown";
    const teamColor = teamColorMap.get(teamName) || "#FFFFFF";

    return {
      id: slugify(attr.name),
      name: attr.name,
      team: teamName,
      color: teamColor,
      attributes: {
        pitchingOverall: attr.pitchingOverall,
        battingOverall: attr.battingOverall,
        fieldingOverall: attr.fieldingOverall,
        speedOverall: attr.speedOverall,
        curve: attr.curve,
        throwingSpeed: attr.throwingSpeed,
      },
    };
  });

  return <AttributesClient players={players} />;
}

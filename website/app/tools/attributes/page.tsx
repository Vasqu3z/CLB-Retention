import React from "react";
import { getAllPlayerAttributes, getPlayerRegistry, getTeamRegistry } from "@/lib/sheets";
import AttributesClient from "./AttributesClient";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

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
    playerRegistry.map(p => [p.playerName, p.team])
  );

  // Create a map of team names to their colors
  const teamColorMap = new Map(
    teamRegistry.map(t => [t.teamName, t.color])
  );

  // Transform attributes data for the client component - include ALL attributes
  const players = attributes.map(attr => {
    const teamName = playerTeamMap.get(attr.name) || "Unknown";
    const teamColor = teamColorMap.get(teamName) || "#FFFFFF";

    return {
      id: slugify(attr.name),
      name: attr.name,
      team: teamName,
      color: teamColor,
      // Character info
      characterClass: attr.characterClass,
      captain: attr.captain,
      mii: attr.mii,
      miiColor: attr.miiColor,
      battingSide: attr.battingSide,
      armSide: attr.armSide,
      weight: attr.weight,
      ability: attr.ability,
      // Overall stats
      pitchingOverall: attr.pitchingOverall,
      battingOverall: attr.battingOverall,
      fieldingOverall: attr.fieldingOverall,
      speedOverall: attr.speedOverall,
      // Pitching attributes
      starPitch: attr.starPitch,
      fastballSpeed: attr.fastballSpeed,
      curveballSpeed: attr.curveballSpeed,
      curve: attr.curve,
      stamina: attr.stamina,
      // Hitting attributes
      starSwing: attr.starSwing,
      hitCurve: attr.hitCurve,
      hittingTrajectory: attr.hittingTrajectory,
      slapHitContact: attr.slapHitContact,
      chargeHitContact: attr.chargeHitContact,
      slapHitPower: attr.slapHitPower,
      chargeHitPower: attr.chargeHitPower,
      preCharge: attr.preCharge,
      // Fielding & Running
      fielding: attr.fielding,
      throwingSpeed: attr.throwingSpeed,
      speed: attr.speed,
      bunting: attr.bunting,
    };
  });

  return <AttributesClient players={players} />;
}

export const metadata = {
  title: "Attribute Comparison - Comets League Baseball",
  description: "Compare player attributes side-by-side across all 30 stats",
};

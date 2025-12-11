import React from "react";
import TeamsPageClient from "./TeamsPageClient";
import { getTeamRegistry, getStandings, getTeamData } from "@/lib/sheets";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function TeamsPage() {
  // Fetch all required data (regular + playoffs)
  const [teamRegistry, regularStandings, regularTeamStats, playoffStandings, playoffTeamStats] = await Promise.all([
    getTeamRegistry(),
    getStandings(false),
    getTeamData(undefined, false),
    getStandings(true),
    getTeamData(undefined, true),
  ]);

  // Create a map of team names to their standings
  const standingsMap = new Map(
    regularStandings.map(s => [s.team, s])
  );

  // Create a map of team names to their stats
  const statsMap = new Map(
    regularTeamStats.map(s => [s.teamName, s])
  );

  // Transform team registry into the format expected by TeamSelectCard
  // Filter out inactive teams and sort by standings rank
  const teams = teamRegistry
    .filter(team => team.status?.toLowerCase() === 'active')
    .map(team => {
      const standing = standingsMap.get(team.teamName);
      const stats = statsMap.get(team.teamName);

      // Calculate team batting average from team stats
      const avg = stats && stats.hitting.ab > 0
        ? (stats.hitting.h / stats.hitting.ab).toFixed(3)
        : ".000";

      // Ensure rank is always a number for sorting (rank comes as string from sheets)
      const teamRank = standing?.rank ? parseInt(standing.rank, 10) : 99;

      return {
        name: team.teamName,
        code: team.abbr,
        logoColor: team.color,
        logoUrl: team.logoUrl,
        emblemUrl: team.emblemUrl,
        rank: teamRank,
        stats: {
          wins: standing?.wins || 0,
          losses: standing?.losses || 0,
          avg: avg,
        },
        href: `/teams/${slugify(team.teamName)}`,
      };
    })
    .sort((a, b) => a.rank! - b.rank!);

  return (
    <TeamsPageClient
      teams={teams}
      regularTeamData={regularTeamStats}
      regularStandings={regularStandings}
      playoffTeamData={playoffTeamStats}
      playoffStandings={playoffStandings}
      teamRegistry={teamRegistry}
    />
  );
}

import React from "react";
import StandingsClient from "./StandingsClient";
import { TeamStanding } from "./StandingsTable";
import { getStandings, getTeamRegistry, getSchedule } from "@/lib/sheets";

// Helper function to calculate streak from schedule
function calculateStreak(teamName: string, schedule: any[]): string {
  // Get only played games for this team, sorted by week descending
  const teamGames = schedule
    .filter(game =>
      game.played &&
      (game.homeTeam === teamName || game.awayTeam === teamName)
    )
    .sort((a, b) => b.week - a.week);

  if (teamGames.length === 0) return "-";

  // Determine if latest game was a win
  const latestGame = teamGames[0];
  const isWin = latestGame.winner === teamName;
  const streakType = isWin ? "W" : "L";

  // Count consecutive games of the same result
  let count = 0;
  for (const game of teamGames) {
    if (game.winner === teamName && isWin) {
      count++;
    } else if (game.winner !== teamName && !isWin) {
      count++;
    } else {
      break;
    }
  }

  return `${streakType}${count}`;
}

// Helper function to calculate games behind
function calculateGB(wins: number, losses: number, leaderWins: number, leaderLosses: number): string {
  if (wins === leaderWins && losses === leaderLosses) {
    return "-";
  }
  const gb = ((leaderWins - wins) + (losses - leaderLosses)) / 2;
  return gb.toFixed(1);
}

export default async function StandingsPage() {
  // Fetch data from Google Sheets (regular season only)
  const [standingsData, teamRegistry, schedule] = await Promise.all([
    getStandings(false),
    getTeamRegistry(),
    getSchedule()
  ]);

  // Create a map of team names to their metadata
  const teamMap = new Map(
    teamRegistry.map(team => [team.teamName, team])
  );

  // Find leader for GB calculation
  const leader = standingsData[0];
  if (!leader) {
    throw new Error("No standings data available");
  }

  // Transform data to match component interface
  const transformedData: TeamStanding[] = standingsData.map((row, index) => {
    const teamInfo = teamMap.get(row.team);
    const rank = parseInt(row.rank) || (index + 1);

    return {
      id: row.team.toLowerCase().replace(/\s+/g, '-'),
      rank,
      teamName: row.team,
      teamCode: teamInfo?.abbr || row.team.substring(0, 3).toUpperCase(),
      wins: row.wins,
      losses: row.losses,
      pct: row.winPct,
      gb: calculateGB(row.wins, row.losses, leader.wins, leader.losses),
      streak: calculateStreak(row.team, schedule),
      runDiff: row.runDiff,
      logoColor: teamInfo?.color || "#FFFFFF",
      logoUrl: teamInfo?.emblemUrl, // Use emblem (smaller icon) for standings table
      h2hNote: row.h2hNote // Head-to-head record for tiebreaker context
    };
  });

  return <StandingsClient data={transformedData} />;
}
import React from "react";
import StandingsClient from "./StandingsClient";
import { TeamStanding, ClinchStatus } from "./StandingsTable";
import { getStandings, getTeamRegistry, getSchedule } from "@/lib/sheets";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Configuration
const PLAYOFF_SPOTS = 4; // Top 4 teams make playoffs

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

// Helper function to calculate clinch/elimination status
function calculateClinchStatus(
  teamName: string,
  standings: { team: string; wins: number; losses: number }[],
  schedule: { homeTeam: string; awayTeam: string; played: boolean }[]
): ClinchStatus {
  // Find this team's position in standings
  const teamIndex = standings.findIndex(s => s.team === teamName);
  if (teamIndex === -1) return null;

  const team = standings[teamIndex];
  const gamesPlayed = team.wins + team.losses;

  // Count remaining games for this team
  const remainingGames = schedule.filter(
    g => !g.played && (g.homeTeam === teamName || g.awayTeam === teamName)
  ).length;

  // If season is over, clinch status is determined by final rank
  if (remainingGames === 0) {
    return teamIndex < PLAYOFF_SPOTS ? 'clinched' : 'eliminated';
  }

  // Get the team currently in the last playoff spot
  const lastPlayoffTeam = standings[PLAYOFF_SPOTS - 1];
  if (!lastPlayoffTeam) return null;

  // Get the team in first position outside playoffs (5th place)
  const firstOutTeam = standings[PLAYOFF_SPOTS];

  // Check if team has clinched:
  // Team clinches if even losing all remaining games, they'd still be ahead of 5th place
  // who wins all their remaining games
  if (firstOutTeam) {
    const firstOutRemainingGames = schedule.filter(
      g => !g.played && (g.homeTeam === firstOutTeam.team || g.awayTeam === firstOutTeam.team)
    ).length;

    const teamWorstCase = team.wins; // Current wins (lose all remaining)
    const firstOutBestCase = firstOutTeam.wins + firstOutRemainingGames; // Win all remaining

    // If team's worst case is still better than 5th place's best case, clinched
    if (teamWorstCase > firstOutBestCase) {
      return 'clinched';
    }
  }

  // Check if team is eliminated:
  // Team is eliminated if even winning all remaining games, they can't catch 4th place
  // who loses all their remaining games
  if (lastPlayoffTeam) {
    const lastPlayoffRemainingGames = schedule.filter(
      g => !g.played && (g.homeTeam === lastPlayoffTeam.team || g.awayTeam === lastPlayoffTeam.team)
    ).length;

    const teamBestCase = team.wins + remainingGames; // Current wins + win all remaining
    const lastPlayoffWorstCase = lastPlayoffTeam.wins; // Current wins (lose all remaining)

    // If team's best case can't reach 4th place's worst case, eliminated
    if (teamBestCase < lastPlayoffWorstCase) {
      return 'eliminated';
    }
  }

  return null; // Neither clinched nor eliminated yet
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
    // Return empty standings when no data available (e.g., during build without credentials)
    return <StandingsClient data={[]} />;
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
      h2hNote: row.h2hNote, // Head-to-head record for tiebreaker context
      clinchStatus: calculateClinchStatus(row.team, standingsData, schedule)
    };
  });

  return <StandingsClient data={transformedData} />;
}
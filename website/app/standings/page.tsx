import React from "react";
import StandingsTable, { TeamStanding } from "./StandingsTable";
import { Trophy } from "lucide-react";
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

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-comets-yellow mb-2">
              <Trophy size={24} />
              <span className="font-ui uppercase tracking-[0.2em] font-bold text-sm">Season 6</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase text-white leading-none">
              League Standings
            </h1>
          </div>
        </div>

        {/* The Table */}
        <StandingsTable data={transformedData} />

        {/* Legend / Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-white/30 border-t border-white/5 pt-8">
          <div>
            <span className="text-comets-yellow block mb-1 font-bold">RANKING CRITERIA</span>
            Win Percentage &gt; Head-to-Head &gt; Run Differential
          </div>
          <div>
            <span className="text-comets-cyan block mb-1 font-bold">PLAYOFF CLINCH</span>
            Top 4 teams advance to the Star Cup Semifinals.
          </div>
          <div className="md:text-right">
            <span className="text-white/50 block mb-1 font-bold">LAST UPDATED</span>
            2025-05-12 14:30 EST
          </div>
        </div>

      </div>
    </main>
  );
}
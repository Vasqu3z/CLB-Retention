import React from "react";
import ScheduleView, { Match } from "./ScheduleView";
import { getSchedule, getTeamRegistry } from "@/lib/sheets";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function SchedulePage() {
  // Fetch data from Google Sheets
  const [scheduleData, teamRegistry] = await Promise.all([
    getSchedule(),
    getTeamRegistry()
  ]);

  // Create a map of team names to their metadata
  const teamMap = new Map(
    teamRegistry.map(team => [team.teamName, team])
  );

  // Group games by week first for indexing
  const gamesByWeek: Record<number, typeof scheduleData> = {};
  scheduleData.forEach(game => {
    if (!gamesByWeek[game.week]) {
      gamesByWeek[game.week] = [];
    }
    gamesByWeek[game.week].push(game);
  });

  // Transform schedule data to Match format
  const matches: Match[] = scheduleData.map((game) => {
    const homeTeam = teamMap.get(game.homeTeam);
    const awayTeam = teamMap.get(game.awayTeam);

    // Find the index within this week
    const weekGames = gamesByWeek[game.week];
    const weekIndex = weekGames.indexOf(game);

    return {
      id: `w${game.week}-g${weekIndex + 1}`,
      home: {
        name: game.homeTeam,
        code: homeTeam?.abbr || game.homeTeam.substring(0, 3).toUpperCase(),
        logoColor: homeTeam?.color || "#FFFFFF",
        logoUrl: homeTeam?.emblemUrl,
        score: game.homeScore
      },
      away: {
        name: game.awayTeam,
        code: awayTeam?.abbr || game.awayTeam.substring(0, 3).toUpperCase(),
        logoColor: awayTeam?.color || "#FFFFFF",
        logoUrl: awayTeam?.emblemUrl,
        score: game.awayScore
      },
      date: `Game ${weekIndex + 1}`, // Simple game number instead of fake dates
      time: game.played ? "FINAL" : "TBD",
      isFinished: game.played,
      boxScoreUrl: game.boxScoreUrl
    };
  });

  // Group matches by week
  const matchesByWeek: Record<number, Match[]> = matches.reduce((acc, match) => {
    const weekNum = parseInt(match.id.split('-')[0].substring(1));
    if (!acc[weekNum]) {
      acc[weekNum] = [];
    }
    acc[weekNum].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  // Get list of weeks
  const weeks = Object.keys(matchesByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  // Find current week (or default to latest week with games)
  const currentWeek = weeks[weeks.length - 1] || 1;

  return (
    <ScheduleView
      matchesByWeek={matchesByWeek}
      weeks={weeks}
      initialWeek={currentWeek}
    />
  );
}

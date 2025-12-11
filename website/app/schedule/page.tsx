import React from "react";
import ScheduleView, { Match } from "./ScheduleView";
import { getSchedule, getTeamRegistry } from "@/lib/sheets";

// Helper to generate placeholder date from week number
function getWeekDate(weekNum: number, gameIndex: number): string {
  // Generate placeholder dates: Week 1 starts May 1, 2025
  // Each week is 7 days apart, games are spread across the week
  const baseDate = new Date('2025-05-01');
  const daysToAdd = (weekNum - 1) * 7 + (gameIndex % 3); // Spread games across week
  baseDate.setDate(baseDate.getDate() + daysToAdd);

  const month = baseDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = baseDate.getDate().toString().padStart(2, '0');
  return `${month} ${day}`;
}

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

    // Find the index within this week for date generation
    const weekGames = gamesByWeek[game.week];
    const weekIndex = weekGames.indexOf(game);

    // Generate placeholder date based on week number
    const gameDate = getWeekDate(game.week, weekIndex);
    const gameTime = game.played ? "FINAL" : "TBD";

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
      date: gameDate,
      time: gameTime,
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

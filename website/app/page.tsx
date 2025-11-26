import React from "react";
import { getSchedule, getCalculatedBattingLeaders, getCalculatedPitchingLeaders, getStandings } from "@/lib/sheets";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  // Fetch latest data for live ticker
  const [schedule, battingLeaders, pitchingLeaders, standings] = await Promise.all([
    getSchedule(),
    getCalculatedBattingLeaders(false),
    getCalculatedPitchingLeaders(false),
    getStandings(false),
  ]);

  // Get latest completed games (last 3)
  const recentGames = schedule
    .filter(g => g.played)
    .sort((a, b) => b.week - a.week)
    .slice(0, 3);

  // Build ticker items from real data
  const tickerItems: string[] = [];

  // Add recent game results
  recentGames.forEach(game => {
    tickerItems.push(`🏆 ${game.winner?.toUpperCase()} DEFEATS ${game.loser?.toUpperCase()} ${game.homeScore}-${game.awayScore}`);
  });

  // Add top batting leader
  if (battingLeaders.avg && battingLeaders.avg.length > 0) {
    const topAvg = battingLeaders.avg[0];
    tickerItems.push(`📊 ${topAvg.player.toUpperCase()} LEADS AVG (${topAvg.value})`);
  }

  // Add top HR leader
  if (battingLeaders.hr && battingLeaders.hr.length > 0) {
    const topHR = battingLeaders.hr[0];
    tickerItems.push(`🔥 ${topHR.player.toUpperCase()} LEADS WITH ${topHR.value} HR`);
  }

  // Add top pitching leader
  if (pitchingLeaders.era && pitchingLeaders.era.length > 0) {
    const topERA = pitchingLeaders.era[0];
    tickerItems.push(`⚡ ${topERA.player.toUpperCase()} ERA LEADER (${topERA.value})`);
  }

  // Add top team
  if (standings.length > 0) {
    const topTeam = standings[0];
    tickerItems.push(`🏅 ${topTeam.team.toUpperCase()} LEADS STANDINGS (${topTeam.wins}-${topTeam.losses})`);
  }

  // Add generic updates
  tickerItems.push(`📅 WEEK ${schedule[schedule.length - 1]?.week || 1} IN PROGRESS`);
  tickerItems.push(`🎮 FULL STATS AVAILABLE NOW`);

  // Fallback if no data
  if (tickerItems.length === 0) {
    tickerItems.push("🏟️ COMETS LEAGUE BASEBALL SEASON 6");
    tickerItems.push("📊 STATS UPDATING LIVE");
    tickerItems.push("🏆 PLAYOFF RACE HEATING UP");
  }

  return <HomeClient tickerItems={tickerItems} />;
}

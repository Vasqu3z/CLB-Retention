import React from "react";
import { getSchedule, getCalculatedBattingLeaders, getCalculatedPitchingLeaders, getCalculatedFieldingLeaders, getStandings } from "@/lib/sheets";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  // Fetch latest data for live ticker
  const [schedule, battingLeaders, pitchingLeaders, fieldingLeaders, standings] = await Promise.all([
    getSchedule(),
    getCalculatedBattingLeaders(false),
    getCalculatedPitchingLeaders(false),
    getCalculatedFieldingLeaders(false),
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
    const loser = game.winner === game.homeTeam ? game.awayTeam : game.homeTeam;
    tickerItems.push(`${game.winner?.toUpperCase()} DEFEAT ${loser.toUpperCase()} ${game.homeScore}-${game.awayScore}`);
  });

  // Add top batting leader (AVG)
  if (battingLeaders.avg && battingLeaders.avg.length > 0) {
    const topAvg = battingLeaders.avg[0];
    tickerItems.push(`${topAvg.player.toUpperCase()} LEADS CLB IN AVG WITH ${topAvg.value}`);
  }

  // Add top HR leader
  if (battingLeaders.hr && battingLeaders.hr.length > 0) {
    const topHR = battingLeaders.hr[0];
    tickerItems.push(`${topHR.player.toUpperCase()} LEADS CLB IN HR WITH ${topHR.value}`);
  }

  // Add top pitching leader (ERA)
  if (pitchingLeaders.era && pitchingLeaders.era.length > 0) {
    const topERA = pitchingLeaders.era[0];
    tickerItems.push(`${topERA.player.toUpperCase()} LEADS CLB IN ERA WITH ${topERA.value}`);
  }

  // Add top fielding leader (Nice Plays)
  if (fieldingLeaders.nicePlays && fieldingLeaders.nicePlays.length > 0) {
    const topNP = fieldingLeaders.nicePlays[0];
    tickerItems.push(`${topNP.player.toUpperCase()} LEADS CLB IN NICE PLAYS WITH ${topNP.value}`);
  }

  // Add top team
  if (standings.length > 0) {
    const topTeam = standings[0];
    tickerItems.push(`${topTeam.team.toUpperCase()} ATOP THE CLB STANDINGS (${topTeam.wins}-${topTeam.losses})`);
  }

  // Add current week
  tickerItems.push(`WEEK ${schedule[schedule.length - 1]?.week || 1} IN PROGRESS`);

  // Fallback if no data
  if (tickerItems.length === 0) {
    tickerItems.push("COMETS LEAGUE BASEBALL SEASON 6");
    tickerItems.push("STATS UPDATING LIVE");
    tickerItems.push("PLAYOFF RACE HEATING UP");
  }

  return <HomeClient tickerItems={tickerItems} />;
}

import React from "react";
import { notFound } from "next/navigation";
import { getTeamRegistry, getTeamRoster, getStandings, getSchedule, getTeamData, getPlayerRegistry } from "@/lib/sheets";
import TeamDetailClient from "./TeamDetailClient";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Generate static params for all teams at build time
export async function generateStaticParams() {
  try {
    const teams = await getTeamRegistry();
    return teams.map((team) => ({
      slug: team.teamName.toLowerCase().replace(/\s+/g, '-'),
    }));
  } catch (error) {
    // If credentials are missing during local build, return empty array
    // Pages will be generated on-demand via ISR
    console.warn('generateStaticParams: Could not fetch teams, falling back to on-demand generation');
    return [];
  }
}

function deslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

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

// Helper to generate date from week number
function getWeekDate(weekNum: number, gameIndex: number): string {
  const baseDate = new Date('2025-05-01');
  const daysToAdd = (weekNum - 1) * 7 + (gameIndex % 3);
  baseDate.setDate(baseDate.getDate() + daysToAdd);

  const month = baseDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = baseDate.getDate().toString().padStart(2, '0');
  return `${month} ${day}`;
}

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teamNameGuess = deslugify(slug);

  // Fetch all necessary data from Google Sheets
  const [teamRegistry, standings, allSchedule, teamStatsData, playerRegistry] = await Promise.all([
    getTeamRegistry(),
    getStandings(false),
    getSchedule(),
    getTeamData(undefined, false),
    getPlayerRegistry(),
  ]);

  // Find the team in the registry
  const team = teamRegistry.find(
    t => slugify(t.teamName) === slug || t.teamName.toLowerCase() === teamNameGuess.toLowerCase()
  );

  if (!team) {
    return notFound();
  }

  // Fetch team roster and merge with player registry for images
  const rosterData = await getTeamRoster(team.teamName, false);

  // Create lookup map for player images
  const playerImageMap = new Map(
    playerRegistry.map(p => [p.playerName, { imageUrl: p.imageUrl, slug: slugify(p.playerName) }])
  );

  // Enrich roster with images and slugs
  const roster = rosterData.map(player => ({
    ...player,
    imageUrl: playerImageMap.get(player.name)?.imageUrl || '',
    slug: playerImageMap.get(player.name)?.slug || slugify(player.name),
  }));

  // Find team in standings
  const standing = standings.find(s => s.team === team.teamName);
  const rank = standing ? parseInt(standing.rank) : 99;

  // Calculate streak
  const streak = calculateStreak(team.teamName, allSchedule);

  // Filter schedule for this team
  const teamSchedule = allSchedule
    .filter(game => game.homeTeam === team.teamName || game.awayTeam === team.teamName)
    .map((game, index) => {
      const homeTeamInfo = teamRegistry.find(t => t.teamName === game.homeTeam);
      const awayTeamInfo = teamRegistry.find(t => t.teamName === game.awayTeam);
      const isHome = game.homeTeam === team.teamName;

      return {
        id: `w${game.week}-g${index + 1}`,
        week: game.week,
        home: {
          name: game.homeTeam,
          code: homeTeamInfo?.abbr || game.homeTeam.substring(0, 3).toUpperCase(),
          logoColor: homeTeamInfo?.color || "#FFFFFF",
          logoUrl: homeTeamInfo?.logoUrl,
          score: game.homeScore,
        },
        away: {
          name: game.awayTeam,
          code: awayTeamInfo?.abbr || game.awayTeam.substring(0, 3).toUpperCase(),
          logoColor: awayTeamInfo?.color || "#FFFFFF",
          logoUrl: awayTeamInfo?.logoUrl,
          score: game.awayScore,
        },
        date: `Week ${game.week}`,
        time: game.played ? "FINAL" : "TBD",
        isFinished: game.played,
        isHome,
      };
    })
    .sort((a, b) => a.week - b.week);

  // Get team stats
  const stats = teamStatsData.find(s => s.teamName === team.teamName) || null;

  return (
    <TeamDetailClient
      teamName={team.teamName}
      teamCode={team.abbr}
      logoColor={team.color}
      logoUrl={team.logoUrl}
      emblemUrl={team.emblemUrl}
      rank={rank}
      wins={standing?.wins || 0}
      losses={standing?.losses || 0}
      streak={streak}
      roster={roster}
      schedule={teamSchedule}
      stats={stats}
    />
  );
}

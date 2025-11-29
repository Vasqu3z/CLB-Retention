import React from "react";
import { getPlayoffSchedule, getTeamRegistry, getStandings } from "@/lib/sheets";
import PlayoffsClient from "./PlayoffsClient";

export default async function PlayoffsPage() {
  // Fetch playoff schedule, team registry, and standings for seeds
  const [playoffGames, teamRegistry, standings] = await Promise.all([
    getPlayoffSchedule(),
    getTeamRegistry(),
    getStandings(false), // Regular season standings for playoff seeds
  ]);

  // Create team maps
  const teamColorMap = new Map(
    teamRegistry.map(t => [t.teamName, t.color])
  );
  const teamCodeMap = new Map(
    teamRegistry.map(t => [t.teamName, t.abbr])
  );
  const teamEmblemMap = new Map(
    teamRegistry.map(t => [t.teamName, t.emblemUrl || ""])
  );
  // Create seed map from standings (convert rank to number)
  const teamSeedMap = new Map(
    standings.map(s => [s.team, parseInt(String(s.rank)) || 0])
  );

  // Group games by series (using code prefix)
  const seriesGames: Record<string, typeof playoffGames> = {};
  playoffGames.forEach(game => {
    // Extract series code (e.g., "S1" from "S1-A", "F" from "F1")
    const seriesCode = game.code.match(/^[A-Z]+\d*/)?.[0] || game.code;
    if (!seriesGames[seriesCode]) {
      seriesGames[seriesCode] = [];
    }
    seriesGames[seriesCode].push(game);
  });

  // Helper to calculate series wins
  const calculateSeriesRecord = (games: typeof playoffGames, teamName: string) => {
    return games.filter(g => g.played && g.winner === teamName).length;
  };

  // Helper to get team info
  const getTeamInfo = (teamName: string) => ({
    name: teamName,
    code: teamCodeMap.get(teamName) || teamName.substring(0, 3).toUpperCase(),
    color: teamColorMap.get(teamName) || "#FFFFFF",
    emblem: teamEmblemMap.get(teamName) || "",
    seed: teamSeedMap.get(teamName) || 0,
  });

  // Parse semifinals (S1 and S2)
  const semifinals = ["S1", "S2"].map(code => {
    const games = seriesGames[code] || [];
    if (games.length === 0) return null;

    const firstGame = games[0];
    const teamAInfo = getTeamInfo(firstGame.homeTeam);
    const teamBInfo = getTeamInfo(firstGame.awayTeam);

    return {
      id: code.toLowerCase(),
      teamA: {
        ...teamAInfo,
        wins: calculateSeriesRecord(games, firstGame.homeTeam),
      },
      teamB: {
        ...teamBInfo,
        wins: calculateSeriesRecord(games, firstGame.awayTeam),
      },
      winner: games.find(g => g.played && calculateSeriesRecord(games, g.winner!) >= 3)?.winner || null,
      games: games.map((g, idx) => ({
        game: idx + 1,
        scoreA: g.played ? (g.homeScore ?? null) : null,
        scoreB: g.played ? (g.awayScore ?? null) : null,
        played: g.played,
      })),
    };
  }).filter(Boolean);

  // Parse finals (F)
  const finalsGames = seriesGames["F"] || [];
  let finals = null;
  if (finalsGames.length > 0) {
    const firstGame = finalsGames[0];
    const teamAInfo = getTeamInfo(firstGame.homeTeam);
    const teamBInfo = getTeamInfo(firstGame.awayTeam);

    finals = {
      id: "finals",
      teamA: {
        ...teamAInfo,
        wins: calculateSeriesRecord(finalsGames, firstGame.homeTeam),
      },
      teamB: {
        ...teamBInfo,
        wins: calculateSeriesRecord(finalsGames, firstGame.awayTeam),
      },
      winner: finalsGames.find(g => g.played && calculateSeriesRecord(finalsGames, g.winner!) >= 4)?.winner || null,
      games: finalsGames.map((g, idx) => ({
        game: idx + 1,
        scoreA: g.played ? (g.homeScore ?? null) : null,
        scoreB: g.played ? (g.awayScore ?? null) : null,
        played: g.played,
      })),
    };
  }

  return <PlayoffsClient semifinals={semifinals as any} finals={finals} />;
}

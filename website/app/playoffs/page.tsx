import React from "react";
import { getPlayoffSchedule, getTeamRegistry, getStandings } from "@/lib/sheets";
import PlayoffsClient from "./PlayoffsClient";

export default async function PlayoffsPage() {
  // Fetch playoff schedule and team registry (required)
  // Standings is optional - used for seeds, gracefully handle if it fails
  const [playoffGames, teamRegistry, standings] = await Promise.all([
    getPlayoffSchedule(),
    getTeamRegistry(),
    getStandings(false).catch(() => []), // Gracefully fallback to empty array
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

  // Group games by series suffix (A, B for semifinals, KC for finals)
  // Codes are like: CS1-A, CS2-A, CS3-A (Championship Series A)
  //                 CS1-B, CS2-B, CS3-B (Championship Series B)
  //                 KC1, KC2, KC3 (Koopa Championship / Finals)
  const seriesGames: Record<string, typeof playoffGames> = {};
  playoffGames.forEach(game => {
    let seriesKey: string;
    if (game.code.includes("-A")) {
      seriesKey = "CS-A";
    } else if (game.code.includes("-B")) {
      seriesKey = "CS-B";
    } else if (game.code.startsWith("KC")) {
      seriesKey = "KC";
    } else {
      // Fallback: try old format (S1, S2, F)
      seriesKey = game.code.match(/^[A-Z]+\d*/)?.[0] || game.code;
    }
    if (!seriesGames[seriesKey]) {
      seriesGames[seriesKey] = [];
    }
    seriesGames[seriesKey].push(game);
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

  // Parse semifinals (CS-A and CS-B, or fallback to S1 and S2)
  const semifinalKeys = seriesGames["CS-A"] ? ["CS-A", "CS-B"] : ["S1", "S2"];
  const semifinals = semifinalKeys.map(code => {
    const games = seriesGames[code] || [];
    if (games.length === 0) return null;

    const firstGame = games[0];
    const teamAInfo = getTeamInfo(firstGame.homeTeam);
    const teamBInfo = getTeamInfo(firstGame.awayTeam);

    return {
      id: code.toLowerCase().replace("-", ""),
      teamA: {
        ...teamAInfo,
        wins: calculateSeriesRecord(games, firstGame.homeTeam),
      },
      teamB: {
        ...teamBInfo,
        wins: calculateSeriesRecord(games, firstGame.awayTeam),
      },
      winner: games.find(g => g.played && calculateSeriesRecord(games, g.winner!) >= 2)?.winner || null,
      games: games.map((g, idx) => ({
        game: idx + 1,
        scoreA: g.played ? (g.homeScore ?? null) : null,
        scoreB: g.played ? (g.awayScore ?? null) : null,
        played: g.played,
      })),
    };
  }).filter(Boolean);

  // Parse finals (KC or fallback to F)
  const finalsKey = seriesGames["KC"] ? "KC" : "F";
  const finalsGames = seriesGames[finalsKey] || [];
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
      winner: finalsGames.find(g => g.played && calculateSeriesRecord(finalsGames, g.winner!) >= 2)?.winner || null,
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

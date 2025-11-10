// Google Sheets API Integration
// This module reads data from the Google Sheets spreadsheet

import { google } from 'googleapis';

const sheets = google.sheets('v4');

// Initialize Google Sheets API client
async function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return await auth.getClient();
}

// Generic function to read data from a sheet range
export async function getSheetData(range: string, spreadsheetId?: string): Promise<any[][]> {
  try {
    const auth = await getAuthClient();
    const sheetId = spreadsheetId || process.env.SHEETS_SPREADSHEET_ID;

    if (!sheetId) {
      throw new Error('No spreadsheet ID provided');
    }

    const response = await sheets.spreadsheets.values.get({
      auth: auth as any,
      spreadsheetId: sheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

// ===== STANDINGS =====
export interface StandingsRow {
  rank: string;
  team: string;
  wins: number;
  losses: number;
  winPct: string;
  runsScored: number;
  runsAllowed: number;
  runDiff: number;
  h2hNote?: string; // Head-to-head record tooltip
}

export async function getStandings(): Promise<StandingsRow[]> {
  // Read from "🏆 Rankings" sheet, rows 4-11 (8 teams), columns A-H
  const data = await getSheetData("'🏆 Rankings'!A4:H11");

  // Also fetch cell notes for H2H records (column B = team names)
  const auth = await getAuthClient();
  const sheetId = process.env.SHEETS_SPREADSHEET_ID;

  let notes: string[] = [];
  try {
    const response = await sheets.spreadsheets.get({
      auth: auth as any,
      spreadsheetId: sheetId,
      ranges: ["'🏆 Rankings'!B4:B11"],
      includeGridData: true,
    });

    // Extract notes from the response
    if (response.data.sheets && response.data.sheets[0].data) {
      const rowData = response.data.sheets[0].data[0].rowData || [];
      notes = rowData.map((row) => {
        const cell = row.values?.[0];
        return cell?.note || '';
      });
    }
  } catch (error) {
    console.error('Error fetching cell notes:', error);
    // Continue without notes if there's an error
  }

  return data.map((row, idx) => ({
    rank: String(row[0] || ''),
    team: String(row[1] || ''),
    wins: Number(row[2]) || 0,
    losses: Number(row[3]) || 0,
    winPct: String(row[4] || '0.000'),
    runsScored: Number(row[5]) || 0,
    runsAllowed: Number(row[6]) || 0,
    runDiff: Number(row[7]) || 0,
    h2hNote: notes[idx] || undefined,
  }));
}

// ===== LEAGUE LEADERS =====
// Note: The Rankings sheet already contains filtered/qualified leaders from Apps Script.
// Qualification thresholds (from LeagueConfig.js):
//   - Batting rate stats (OBP, SLG, OPS): AB >= teamGP * 2.7
//   - Pitching rate stats (ERA, WHIP, BAA): IP >= teamGP * 0.8
//   - Counting stats (Hits, HR, RBI, Wins, etc.): no minimum
export interface LeaderRow {
  rank: string;
  player: string;
  team: string;
  value: string;
  isTieSummary?: boolean;
}

function parseLeaderText(text: string): LeaderRow | null {
  // Format: "1. Player Name (Team): .350" or "T-1. Player Name (Team): .350"
  // Or tie summary: "T-1. 3 Players Tied w/ .350"
  // Player names may contain parentheses: "1. Yoshi (Red) (Yoshi Eggs): .350"

  // Check for tie summary format
  const tieSummaryMatch = text.match(/^(T-\d+)\.\s+(\d+)\s+Players?\s+Tied\s+w\/\s+(.+)$/);
  if (tieSummaryMatch) {
    return {
      rank: tieSummaryMatch[1],
      player: `${tieSummaryMatch[2]} Players Tied`,
      team: '',
      value: tieSummaryMatch[3].trim(),
      isTieSummary: true,
    };
  }

  // Regular player format - use greedy matching to handle parentheses in player names
  // The last (...) before : is the team name
  const match = text.match(/^(T-)?(\d+)\.\s+(.+)\s+\(([^)]+)\):\s+(.+)$/);
  if (match) {
    const rankPrefix = match[1] || '';
    const rankNum = match[2];
    return {
      rank: rankPrefix + rankNum,
      player: match[3].trim(),
      team: match[4].trim(),
      value: match[5].trim(),
      isTieSummary: false,
    };
  }

  return null;
}

function isHeaderRow(text: string): boolean {
  // Header rows contain '(' but NOT ': ' (which player rows have)
  // Examples:
  //   Header: "On-Base Percentage (OBP)"
  //   Player: "1. Player Name (Team): .350"
  return text.includes('(') && !text.includes(': ');
}

function parseLeaderCategory(data: any[][], startIndex: number): { leaders: LeaderRow[], nextIndex: number } {
  const leaders: LeaderRow[] = [];
  let i = startIndex;

  // Skip header row (category name)
  i++;

  // Parse leader rows until we hit a blank row or end of data
  while (i < data.length) {
    const text = String(data[i][0] || '').trim();

    if (!text) {
      // Blank row - end of this category
      i++;
      break;
    }

    const leader = parseLeaderText(text);
    if (leader) {
      leaders.push(leader);
    }
    i++;
  }

  return { leaders, nextIndex: i };
}

export async function getBattingLeaders(): Promise<{
  obp: LeaderRow[];
  hits: LeaderRow[];
  hr: LeaderRow[];
  rbi: LeaderRow[];
  slg: LeaderRow[];
  ops: LeaderRow[];
}> {
  // Batting leaders are in column J, starting at row 3
  // Format: Header, Leaders (1-5), Blank, Header, Leaders, Blank, etc.
  const data = await getSheetData("'🏆 Rankings'!J3:J60");

  const leaders = {
    obp: [] as LeaderRow[],
    hits: [] as LeaderRow[],
    hr: [] as LeaderRow[],
    rbi: [] as LeaderRow[],
    slg: [] as LeaderRow[],
    ops: [] as LeaderRow[],
  };

  let i = 0;
  const categories = ['obp', 'hits', 'hr', 'rbi', 'slg', 'ops'] as const;

  for (const category of categories) {
    if (i >= data.length) break;

    // Find next header row (contains '(' but not ': ')
    while (i < data.length) {
      const text = String(data[i][0] || '').trim();
      if (text && isHeaderRow(text)) {
        // Found a header row
        break;
      }
      i++;
    }

    if (i >= data.length) break;

    const result = parseLeaderCategory(data, i);
    leaders[category] = result.leaders;
    i = result.nextIndex;
  }

  return leaders;
}

export async function getPitchingLeaders(): Promise<{
  ip: LeaderRow[];
  wins: LeaderRow[];
  losses: LeaderRow[];
  saves: LeaderRow[];
  era: LeaderRow[];
  whip: LeaderRow[];
  baa: LeaderRow[];
}> {
  // Pitching leaders are in column L, starting at row 3
  const data = await getSheetData("'🏆 Rankings'!L3:L70");

  const leaders = {
    ip: [] as LeaderRow[],
    wins: [] as LeaderRow[],
    losses: [] as LeaderRow[],
    saves: [] as LeaderRow[],
    era: [] as LeaderRow[],
    whip: [] as LeaderRow[],
    baa: [] as LeaderRow[],
  };

  let i = 0;
  const categories = ['ip', 'wins', 'losses', 'saves', 'era', 'whip', 'baa'] as const;

  for (const category of categories) {
    if (i >= data.length) break;

    // Find next header row (contains '(' but not ': ')
    while (i < data.length) {
      const text = String(data[i][0] || '').trim();
      if (text && isHeaderRow(text)) {
        break;
      }
      i++;
    }

    if (i >= data.length) break;

    const result = parseLeaderCategory(data, i);
    leaders[category] = result.leaders;
    i = result.nextIndex;
  }

  return leaders;
}

export async function getFieldingLeaders(): Promise<{
  nicePlays: LeaderRow[];
  errors: LeaderRow[];
  stolenBases: LeaderRow[];
}> {
  // Fielding leaders are in column N, starting at row 3
  const data = await getSheetData("'🏆 Rankings'!N3:N40");

  const leaders = {
    nicePlays: [] as LeaderRow[],
    errors: [] as LeaderRow[],
    stolenBases: [] as LeaderRow[],
  };

  let i = 0;
  const categories = ['nicePlays', 'errors', 'stolenBases'] as const;

  for (const category of categories) {
    if (i >= data.length) break;

    // Find next header row (contains '(' but not ': ')
    while (i < data.length) {
      const text = String(data[i][0] || '').trim();
      if (text && isHeaderRow(text)) {
        break;
      }
      i++;
    }

    if (i >= data.length) break;

    const result = parseLeaderCategory(data, i);
    leaders[category] = result.leaders;
    i = result.nextIndex;
  }

  return leaders;
}

// ===== TEAM ROSTER =====
export interface PlayerStats {
  name: string;
  team: string;
  gp: number;
  // Hitting
  ab?: number;
  h?: number;
  hr?: number;
  rbi?: number;
  avg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
  // Pitching
  ip?: number;
  w?: number;
  l?: number;
  sv?: number;
  era?: string;
  whip?: string;
  // Fielding
  np?: number;
  e?: number;
  sb?: number;
}

export async function getTeamRoster(teamName: string): Promise<PlayerStats[]> {
  // Read from all stat sheets and filter by team
  const hittingData = await getSheetData("'🧮 Hitting'!A2:P100");
  const pitchingData = await getSheetData("'🧮 Pitching'!A2:P100");
  const fieldingData = await getSheetData("'🧮 Fielding & Running'!A2:F100");

  // Create a map of players by name
  const playersMap = new Map<string, PlayerStats>();

  // Process hitting stats
  for (const row of hittingData) {
    const playerName = String(row[0] || '').trim();
    const team = String(row[1] || '').trim();

    if (!playerName || team !== teamName) continue;

    playersMap.set(playerName, {
      name: playerName,
      team,
      gp: Number(row[2]) || 0,
      ab: Number(row[3]) || 0,
      h: Number(row[4]) || 0,
      hr: Number(row[5]) || 0,
      rbi: Number(row[6]) || 0,
      avg: String(row[12] || '0.000'),
      obp: String(row[13] || '0.000'),
      slg: String(row[14] || '0.000'),
      ops: String(row[15] || '0.000'),
    });
  }

  // Process pitching stats
  for (const row of pitchingData) {
    const playerName = String(row[0] || '').trim();
    const team = String(row[1] || '').trim();

    if (!playerName || team !== teamName) continue;

    const player = playersMap.get(playerName) || {
      name: playerName,
      team,
      gp: Number(row[2]) || 0,
    };

    player.ip = Number(row[7]) || 0;
    player.w = Number(row[3]) || 0;
    player.l = Number(row[4]) || 0;
    player.sv = Number(row[5]) || 0;
    player.era = String(row[6] || '0.00');
    player.whip = String(row[15] || '0.00');

    playersMap.set(playerName, player);
  }

  // Process fielding stats
  for (const row of fieldingData) {
    const playerName = String(row[0] || '').trim();
    const team = String(row[1] || '').trim();

    if (!playerName || team !== teamName) continue;

    const player = playersMap.get(playerName) || {
      name: playerName,
      team,
      gp: Number(row[2]) || 0,
    };

    player.np = Number(row[3]) || 0;
    player.e = Number(row[4]) || 0;
    player.sb = Number(row[5]) || 0;

    playersMap.set(playerName, player);
  }

  return Array.from(playersMap.values());
}

// ===== SCHEDULE =====
export interface ScheduleGame {
  week: number;
  homeTeam: string;
  awayTeam: string;
  played: boolean;
  homeScore?: number;
  awayScore?: number;
  winner?: string;
  boxScoreUrl?: string;
}

export async function getSchedule(): Promise<ScheduleGame[]> {
  // Read from "Season Schedule" sheet (Week, Home Team, Away Team)
  const scheduleData = await getSheetData("'Season Schedule'!A2:C100");

  // Read completed games from "📅 Schedule" sheet column J with hyperlinks
  const auth = await getAuthClient();
  const sheetId = process.env.SHEETS_SPREADSHEET_ID;

  // Get rich text with hyperlinks
  let completedGamesWithLinks: Array<{ text: string; url?: string }> = [];

  try {
    const response = await sheets.spreadsheets.get({
      auth: auth as any,
      spreadsheetId: sheetId,
      ranges: ["'📅 Schedule'!J3:J500"],
      includeGridData: true,
    });

    if (response.data.sheets && response.data.sheets[0].data) {
      const rowData = response.data.sheets[0].data[0].rowData || [];
      completedGamesWithLinks = rowData.map((row) => {
        const cell = row.values?.[0];
        const text = cell?.formattedValue || '';
        const url = cell?.hyperlink || undefined;
        return { text, url };
      });
    }
  } catch (error) {
    console.error('Error fetching schedule links:', error);
  }

  // Parse completed games into a map: "week_HomeTeam_vs_AwayTeam" -> { homeScore, awayScore, winner, url }
  const completedGamesMap = new Map<string, { homeScore: number; awayScore: number; winner: string; url?: string }>();

  let currentWeek = 0;

  for (const gameData of completedGamesWithLinks) {
    const text = gameData.text.trim();

    // Check for week headers to track which week we're in
    if (text.startsWith('Week ')) {
      const weekMatch = text.match(/^Week\s+(\d+)/);
      if (weekMatch) {
        currentWeek = parseInt(weekMatch[1]);
      }
      continue;
    }

    // Skip empty rows and non-game rows
    if (!text || !text.includes(' || ')) continue;

    // Parse format: "Team1: 5 || Team2: 3"
    const parts = text.split(' || ');
    if (parts.length !== 2) continue;

    const team1Match = parts[0].match(/^(.+):\s+(\d+)$/);
    const team2Match = parts[1].match(/^(.+):\s+(\d+)$/);

    if (!team1Match || !team2Match) continue;

    const team1 = team1Match[1].trim();
    const score1 = parseInt(team1Match[2]);
    const team2 = team2Match[1].trim();
    const score2 = parseInt(team2Match[2]);

    if (isNaN(score1) || isNaN(score2)) continue;

    const winner = score1 > score2 ? team1 : team2;

    // Create game keys with week number for precise matching
    // Try both possible matchup keys (home/away can be either team)
    const gameKey1 = `${currentWeek}_${team1}_vs_${team2}`;
    const gameKey2 = `${currentWeek}_${team2}_vs_${team1}`;

    completedGamesMap.set(gameKey1, { homeScore: score1, awayScore: score2, winner, url: gameData.url });
    completedGamesMap.set(gameKey2, { homeScore: score2, awayScore: score1, winner, url: gameData.url });
  }

  // Build schedule with results
  const schedule: ScheduleGame[] = [];

  for (const row of scheduleData) {
    const week = Number(row[0]) || 0;
    const homeTeam = String(row[1] || '').trim();
    const awayTeam = String(row[2] || '').trim();

    if (week === 0 || !homeTeam || !awayTeam) continue;

    // Look up game with week number for precise matching
    const gameKey = `${week}_${homeTeam}_vs_${awayTeam}`;
    const gameResult = completedGamesMap.get(gameKey);

    if (gameResult) {
      // Game has been played
      schedule.push({
        week,
        homeTeam,
        awayTeam,
        played: true,
        homeScore: gameResult.homeScore,
        awayScore: gameResult.awayScore,
        winner: gameResult.winner,
        boxScoreUrl: gameResult.url,
      });
    } else {
      // Game is upcoming
      schedule.push({
        week,
        homeTeam,
        awayTeam,
        played: false,
      });
    }
  }

  return schedule;
}

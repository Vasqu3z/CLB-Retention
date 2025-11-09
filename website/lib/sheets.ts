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
}

export async function getStandings(): Promise<StandingsRow[]> {
  // Read from "🏆 Rankings" sheet, rows 4-11 (8 teams), columns A-H
  const data = await getSheetData("'🏆 Rankings'!A4:H11");

  return data.map((row) => ({
    rank: String(row[0] || ''),
    team: String(row[1] || ''),
    wins: Number(row[2]) || 0,
    losses: Number(row[3]) || 0,
    winPct: String(row[4] || '0.000'),
    runsScored: Number(row[5]) || 0,
    runsAllowed: Number(row[6]) || 0,
    runDiff: Number(row[7]) || 0,
  }));
}

// ===== LEAGUE LEADERS =====
export interface LeaderRow {
  rank: number;
  text: string; // Full text like "1. Player Name (Team): .350"
  player: string;
  team: string;
  value: string;
}

function parseLeaderText(text: string, index: number): LeaderRow {
  // Format: "1. Player Name (Team): .350"
  const match = text.match(/^(\d+|T-\d+)\.\s+(.+?)\s+\((.+?)\):\s+(.+)$/);

  if (match) {
    return {
      rank: index + 1,
      text,
      player: match[2].trim(),
      team: match[3].trim(),
      value: match[4].trim(),
    };
  }

  return {
    rank: index + 1,
    text,
    player: '',
    team: '',
    value: '',
  };
}

export async function getBattingLeaders(): Promise<{
  obp: LeaderRow[];
  hits: LeaderRow[];
  hr: LeaderRow[];
  rbi: LeaderRow[];
  slg: LeaderRow[];
  ops: LeaderRow[];
}> {
  // Batting leaders are in column J (OBP, Hits, HR, RBI, SLG, OPS)
  // Each category has a header row and then 5 data rows, separated by 1 blank row
  const data = await getSheetData("'🏆 Rankings'!J4:J50");

  // Parse the data - need to identify where each category starts
  const leaders = {
    obp: [] as LeaderRow[],
    hits: [] as LeaderRow[],
    hr: [] as LeaderRow[],
    rbi: [] as LeaderRow[],
    slg: [] as LeaderRow[],
    ops: [] as LeaderRow[],
  };

  // This is a simplified parser - we'll read the first 5 non-empty rows for OBP
  // In production, you'd want to find the header row for each category
  let currentIndex = 0;
  for (let i = 0; i < data.length && currentIndex < 5; i++) {
    const text = String(data[i][0] || '').trim();
    if (text && !text.includes('Percentage') && !text.includes('On-Base')) {
      leaders.obp.push(parseLeaderText(text, currentIndex));
      currentIndex++;
    }
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
  // Pitching leaders are in column L
  const data = await getSheetData("'🏆 Rankings'!L4:L50");

  const leaders = {
    ip: [] as LeaderRow[],
    wins: [] as LeaderRow[],
    losses: [] as LeaderRow[],
    saves: [] as LeaderRow[],
    era: [] as LeaderRow[],
    whip: [] as LeaderRow[],
    baa: [] as LeaderRow[],
  };

  // Simplified parser - read first 5 for IP
  let currentIndex = 0;
  for (let i = 0; i < data.length && currentIndex < 5; i++) {
    const text = String(data[i][0] || '').trim();
    if (text && !text.includes('Innings') && !text.includes('Pitched')) {
      leaders.ip.push(parseLeaderText(text, currentIndex));
      currentIndex++;
    }
  }

  return leaders;
}

export async function getFieldingLeaders(): Promise<{
  nicePlays: LeaderRow[];
  errors: LeaderRow[];
  stolenBases: LeaderRow[];
}> {
  // Fielding leaders are in column N
  const data = await getSheetData("'🏆 Rankings'!N4:N50");

  const leaders = {
    nicePlays: [] as LeaderRow[],
    errors: [] as LeaderRow[],
    stolenBases: [] as LeaderRow[],
  };

  // Simplified parser - read first 5 for Nice Plays
  let currentIndex = 0;
  for (let i = 0; i < data.length && currentIndex < 5; i++) {
    const text = String(data[i][0] || '').trim();
    if (text && !text.includes('Nice') && !text.includes('Plays')) {
      leaders.nicePlays.push(parseLeaderText(text, currentIndex));
      currentIndex++;
    }
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

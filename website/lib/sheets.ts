// Google Sheets API Integration
// This module reads data from the Google Sheets spreadsheet
//
// SPREADSHEET CONFIGURATION:
// - SHEETS_SPREADSHEET_ID: League Hub spreadsheet (standings, players, schedule, registries)
// - DATABASE_SPREADSHEET_ID: Should point to League Hub (attributes and chemistry consolidated)
//   Previously these were in a separate Database spreadsheet, but now everything is consolidated
//   into the main League Hub spreadsheet.
//
// CONSOLIDATED SHEETS:
// - 🎮 Attributes (previously "Advanced Attributes" in Database)
// - 🎮 Chemistry (previously "Chemistry Lookup" in Database)
// - 📋 Player Registry (includes DATABASE_ID column for character name mapping)
//   Character Name Mapping is no longer needed - merged into Player Registry

import { google } from 'googleapis';
import { unstable_cache } from 'next/cache';
import {
  STANDINGS_SHEET,
  PLAYER_STATS_SHEET,
  TEAM_STATS_SHEET,
  SCHEDULE_SHEET,
  QUALIFICATION_THRESHOLDS,
  PLAYOFF_SERIES,
  DISPLAY_CONFIG,
  PLAYER_REGISTRY_SHEET,
  TEAM_REGISTRY_SHEET,
  DATABASE_ATTRIBUTES_SHEET,
  CHEMISTRY_LOOKUP_SHEET,
  buildSheetRange,
  buildFullRange,
} from '@/config/sheets';

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

// Generic function to read data from a sheet range (uncached)
async function getSheetDataUncached(range: string, spreadsheetId?: string): Promise<any[][]> {
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

// Cached version with 60-second revalidation
export const getSheetData = unstable_cache(
  async (range: string, spreadsheetId?: string) => {
    return getSheetDataUncached(range, spreadsheetId);
  },
  ['sheet-data'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['sheets'],
  }
);

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

/**
 * Fetches regular season standings with win/loss records and run differentials
 * @param isPlayoffs - If true, returns empty array (playoffs use bracket system instead)
 * @returns Array of team standings sorted by rank with optional H2H tooltips
 */
export async function getStandings(isPlayoffs: boolean = false): Promise<StandingsRow[]> {
  // Playoffs don't have standings - they use a bracket system
  if (isPlayoffs) {
    return [];
  }

  // Read from standings sheet, rows 4-11 (8 teams), columns A-H
  // Skip rows 1-3: row 1 = title, row 2 = blank, row 3 = headers
  const sheetName = STANDINGS_SHEET.NAME;

  try {
    const range = buildSheetRange(
      sheetName,
      STANDINGS_SHEET.DATA_START_ROW,
      STANDINGS_SHEET.DATA_END_ROW,
      STANDINGS_SHEET.START_COL,
      STANDINGS_SHEET.END_COL
    );
    const data = await getSheetData(range);

    // Also fetch cell notes for H2H records (column B = team names)
    const auth = await getAuthClient();
    const sheetId = process.env.SHEETS_SPREADSHEET_ID;

    let notes: string[] = [];
    try {
      const notesRange = buildSheetRange(
        sheetName,
        STANDINGS_SHEET.DATA_START_ROW,
        STANDINGS_SHEET.DATA_END_ROW,
        STANDINGS_SHEET.NOTES_COL,
        STANDINGS_SHEET.NOTES_COL
      );
      const response = await sheets.spreadsheets.get({
        auth: auth as any,
        spreadsheetId: sheetId,
        ranges: [notesRange],
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
      rank: String(row[STANDINGS_SHEET.COLUMNS.RANK] || ''),
      team: String(row[STANDINGS_SHEET.COLUMNS.TEAM] || ''),
      wins: Number(row[STANDINGS_SHEET.COLUMNS.WINS]) || 0,
      losses: Number(row[STANDINGS_SHEET.COLUMNS.LOSSES]) || 0,
      winPct: String(row[STANDINGS_SHEET.COLUMNS.WIN_PCT] || '0.000'),
      runsScored: Number(row[STANDINGS_SHEET.COLUMNS.RUNS_SCORED]) || 0,
      runsAllowed: Number(row[STANDINGS_SHEET.COLUMNS.RUNS_ALLOWED]) || 0,
      runDiff: Number(row[STANDINGS_SHEET.COLUMNS.RUN_DIFF]) || 0,
      h2hNote: notes[idx] || undefined,
    }));
  } catch (error) {
    console.error(`Error fetching standings:`, error);
    return [];
  }
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
  rob?: number; // Hits Robbed (defensive Nice Plays)
  dp?: number; // Double Plays Hit Into
  avg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
  // Pitching
  ip?: number;
  w?: number;
  l?: number;
  sv?: number;
  hAllowed?: number; // Hits Allowed
  hrAllowed?: number; // Home Runs Allowed
  era?: string;
  whip?: string;
  baa?: string;
  // Fielding
  np?: number;
  e?: number;
  sb?: number;
  cs?: number; // Caught Stealing
  oaa?: number; // Outs Above Average (NP - E)
}

export async function getTeamRoster(teamName: string, isPlayoffs: boolean = false): Promise<PlayerStats[]> {
  try {
    // Read from player stats sheet
    const sheetName = isPlayoffs ? PLAYER_STATS_SHEET.PLAYOFFS : PLAYER_STATS_SHEET.REGULAR_SEASON;
    const range = buildFullRange(
      sheetName,
      PLAYER_STATS_SHEET.DATA_START_ROW,
      PLAYER_STATS_SHEET.MAX_ROWS,
      PLAYER_STATS_SHEET.START_COL,
      PLAYER_STATS_SHEET.END_COL
    );
    const playerData = await getSheetData(range);

    return parsePlayerStats(playerData, teamName);
  } catch (error) {
    console.error(`Error fetching team roster (team=${teamName}, isPlayoffs=${isPlayoffs}):`, error);
    // Return empty array if playoff player data doesn't exist yet
    return [];
  }
}

/**
 * Parses raw player stat data from Google Sheets into structured PlayerStats objects
 * Calculates rate stats (AVG, OBP, SLG, OPS, ERA, WHIP, BAA) from counting stats
 * @param playerData - 2D array from Sheets API (columns A-Z)
 * @param teamFilter - Optional team name to filter roster by
 * @returns Array of PlayerStats with both counting and calculated rate stats
 */
function parsePlayerStats(playerData: any[][], teamFilter?: string): PlayerStats[] {
  const players: PlayerStats[] = [];

  for (const row of playerData) {
    const playerName = String(row[PLAYER_STATS_SHEET.COLUMNS.NAME] || '').trim();
    const team = String(row[PLAYER_STATS_SHEET.COLUMNS.TEAM] || '').trim();

    if (!playerName) continue;
    if (teamFilter && team !== teamFilter) continue;

    const gp = Number(row[PLAYER_STATS_SHEET.COLUMNS.GP]) || 0;

    // Hitting stats (columns D-L)
    const ab = Number(row[PLAYER_STATS_SHEET.COLUMNS.AB]) || 0;
    const h = Number(row[PLAYER_STATS_SHEET.COLUMNS.H]) || 0;
    const hr = Number(row[PLAYER_STATS_SHEET.COLUMNS.HR]) || 0;
    const rbi = Number(row[PLAYER_STATS_SHEET.COLUMNS.RBI]) || 0;
    const bb = Number(row[PLAYER_STATS_SHEET.COLUMNS.BB]) || 0;
    const k = Number(row[PLAYER_STATS_SHEET.COLUMNS.K]) || 0;
    const rob = Number(row[PLAYER_STATS_SHEET.COLUMNS.ROB]) || 0;
    const dp = Number(row[PLAYER_STATS_SHEET.COLUMNS.DP]) || 0;
    const tb = Number(row[PLAYER_STATS_SHEET.COLUMNS.TB]) || 0;

    // Calculate hitting rate stats
    const avg = ab > 0 ? (h / ab).toFixed(3).substring(1) : '.000';
    const obp = (ab + bb) > 0 ? ((h + bb) / (ab + bb)).toFixed(3).substring(1) : '.000';
    // SLG can be >= 1.000, so only remove leading zero if < 1
    const slgValue = ab > 0 ? tb / ab : 0;
    const slg = slgValue >= 1 ? slgValue.toFixed(3) : (slgValue > 0 ? slgValue.toFixed(3).substring(1) : '.000');
    const ops = ab > 0 && (ab + bb) > 0
      ? ((h + bb) / (ab + bb) + tb / ab).toFixed(3)
      : '0.000';

    // Pitching stats (columns M-O for W/L/SV, then P-V for pitching)
    const w = Number(row[PLAYER_STATS_SHEET.COLUMNS.W]) || 0;
    const l = Number(row[PLAYER_STATS_SHEET.COLUMNS.L]) || 0;
    const sv = Number(row[PLAYER_STATS_SHEET.COLUMNS.SV]) || 0;
    const ip = Number(row[PLAYER_STATS_SHEET.COLUMNS.IP]) || 0;
    const bf = Number(row[PLAYER_STATS_SHEET.COLUMNS.BF]) || 0;
    const pitchingH = Number(row[PLAYER_STATS_SHEET.COLUMNS.H_ALLOWED]) || 0;
    const pitchingHR = Number(row[PLAYER_STATS_SHEET.COLUMNS.HR_ALLOWED]) || 0;
    const r = Number(row[PLAYER_STATS_SHEET.COLUMNS.R]) || 0;
    const pitchingBB = Number(row[PLAYER_STATS_SHEET.COLUMNS.BB_ALLOWED]) || 0;
    const pitchingK = Number(row[PLAYER_STATS_SHEET.COLUMNS.K_PITCHED]) || 0;

    // Calculate pitching rate stats
    const era = ip > 0 ? ((r * 9) / ip).toFixed(2) : '0.00';
    const whip = ip > 0 ? ((pitchingH + pitchingBB) / ip).toFixed(2) : '0.00';
    const baa = bf > 0 ? (pitchingH / bf).toFixed(3).substring(1) : '.000';

    // Fielding stats (columns W-Z)
    const np = Number(row[PLAYER_STATS_SHEET.COLUMNS.NP]) || 0;
    const e = Number(row[PLAYER_STATS_SHEET.COLUMNS.E]) || 0;
    const sb = Number(row[PLAYER_STATS_SHEET.COLUMNS.SB]) || 0;
    const cs = Number(row[PLAYER_STATS_SHEET.COLUMNS.CS]) || 0;

    // Calculate OAA (Outs Above Average)
    const oaa = np - e;

    players.push({
      name: playerName,
      team,
      gp,
      // Hitting
      ab,
      h,
      hr,
      rbi,
      rob,
      dp,
      avg,
      obp,
      slg,
      ops,
      // Pitching
      ip,
      w,
      l,
      sv,
      hAllowed: pitchingH,
      hrAllowed: pitchingHR,
      era,
      whip,
      baa,
      // Fielding
      np,
      e,
      sb,
      cs,
      oaa,
    });
  }

  return players;
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
  mvp?: string;
  winningPitcher?: string;
  losingPitcher?: string;
  savePitcher?: string;
}

export async function getSchedule(): Promise<ScheduleGame[]> {
  // Read from "📅 Schedule" sheet - includes game results in columns D-L
  const range = buildFullRange(
    SCHEDULE_SHEET.REGULAR_SEASON,
    SCHEDULE_SHEET.DATA_START_ROW,
    SCHEDULE_SHEET.MAX_ROWS,
    SCHEDULE_SHEET.START_COL,
    SCHEDULE_SHEET.END_COL
  );
  const scheduleData = await getSheetData(range);

  const schedule: ScheduleGame[] = [];

  for (const row of scheduleData) {
    const week = Number(row[SCHEDULE_SHEET.COLUMNS.WEEK]) || 0;
    const awayTeam = String(row[SCHEDULE_SHEET.COLUMNS.AWAY_TEAM] || '').trim();
    const homeTeam = String(row[SCHEDULE_SHEET.COLUMNS.HOME_TEAM] || '').trim();

    if (week === 0 || !homeTeam || !awayTeam) continue;

    // Check if game has been played (column D will have away score if played)
    const awayScore = row[SCHEDULE_SHEET.COLUMNS.AWAY_SCORE];
    const homeScore = row[SCHEDULE_SHEET.COLUMNS.HOME_SCORE];
    const hasScores = awayScore !== undefined && awayScore !== null && awayScore !== '' &&
                      homeScore !== undefined && homeScore !== null && homeScore !== '';

    if (hasScores) {
      // Game has been played - read results from columns D-L
      const winner = String(row[SCHEDULE_SHEET.COLUMNS.WINNER] || '').trim();
      const loser = String(row[SCHEDULE_SHEET.COLUMNS.LOSER] || '').trim();
      const mvp = String(row[SCHEDULE_SHEET.COLUMNS.MVP] || '').trim();
      const winningPitcher = String(row[SCHEDULE_SHEET.COLUMNS.WINNING_PITCHER] || '').trim();
      const losingPitcher = String(row[SCHEDULE_SHEET.COLUMNS.LOSING_PITCHER] || '').trim();
      const savePitcher = String(row[SCHEDULE_SHEET.COLUMNS.SAVE_PITCHER] || '').trim();
      const boxScoreUrl = String(row[SCHEDULE_SHEET.COLUMNS.BOX_SCORE_URL] || '').trim();

      schedule.push({
        week,
        homeTeam,
        awayTeam,
        played: true,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        winner,
        boxScoreUrl,
        mvp,
        winningPitcher,
        losingPitcher,
        savePitcher,
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

// ===== PLAYOFF SCHEDULE =====
export interface PlayoffGame {
  code: string; // Q1, S1-A, F2, etc.
  homeTeam: string;
  awayTeam: string;
  played: boolean;
  homeScore?: number;
  awayScore?: number;
  winner?: string;
  boxScoreUrl?: string;
  mvp?: string;
  winningPitcher?: string;
  losingPitcher?: string;
  savePitcher?: string;
}

export async function getPlayoffSchedule(): Promise<PlayoffGame[]> {
  // Read from "🏆 Schedule" sheet - identical structure to regular schedule
  const range = buildFullRange(
    SCHEDULE_SHEET.PLAYOFFS,
    SCHEDULE_SHEET.DATA_START_ROW,
    SCHEDULE_SHEET.MAX_ROWS,
    SCHEDULE_SHEET.START_COL,
    SCHEDULE_SHEET.END_COL
  );
  const scheduleData = await getSheetData(range);

  const schedule: PlayoffGame[] = [];

  for (const row of scheduleData) {
    const code = String(row[SCHEDULE_SHEET.COLUMNS.WEEK] || '').trim();
    const awayTeam = String(row[SCHEDULE_SHEET.COLUMNS.AWAY_TEAM] || '').trim();
    const homeTeam = String(row[SCHEDULE_SHEET.COLUMNS.HOME_TEAM] || '').trim();

    if (!code || !homeTeam || !awayTeam) continue;

    // Check if game has been played
    const awayScore = row[SCHEDULE_SHEET.COLUMNS.AWAY_SCORE];
    const homeScore = row[SCHEDULE_SHEET.COLUMNS.HOME_SCORE];
    const hasScores = awayScore !== undefined && awayScore !== null && awayScore !== '' &&
                      homeScore !== undefined && homeScore !== null && homeScore !== '';

    if (hasScores) {
      // Game has been played
      const winner = String(row[SCHEDULE_SHEET.COLUMNS.WINNER] || '').trim();
      const loser = String(row[SCHEDULE_SHEET.COLUMNS.LOSER] || '').trim();
      const mvp = String(row[SCHEDULE_SHEET.COLUMNS.MVP] || '').trim();
      const winningPitcher = String(row[SCHEDULE_SHEET.COLUMNS.WINNING_PITCHER] || '').trim();
      const losingPitcher = String(row[SCHEDULE_SHEET.COLUMNS.LOSING_PITCHER] || '').trim();
      const savePitcher = String(row[SCHEDULE_SHEET.COLUMNS.SAVE_PITCHER] || '').trim();
      const boxScoreUrl = String(row[SCHEDULE_SHEET.COLUMNS.BOX_SCORE_URL] || '').trim();

      schedule.push({
        code,
        homeTeam,
        awayTeam,
        played: true,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        winner,
        boxScoreUrl,
        mvp,
        winningPitcher,
        losingPitcher,
        savePitcher,
      });
    } else {
      // Game is upcoming
      schedule.push({
        code,
        homeTeam,
        awayTeam,
        played: false,
      });
    }
  }

  return schedule;
}

// ===== PLAYOFF BRACKET BUILDER =====
export interface SeriesResult {
  seriesId: string; // Q1, S1-A, F1, etc.
  teamA: string;
  teamB: string;
  winsA: number;
  winsB: number;
  winner?: string; // Set when series is clinched
  games: PlayoffGame[];
}

export interface BracketRound {
  name: string; // "Quarterfinals", "Semifinals", "Finals"
  series: SeriesResult[];
}

/**
 * Groups playoff games by series and calculates wins
 * Returns a map of series ID → SeriesResult
 */
export function groupGamesBySeries(games: PlayoffGame[]): Map<string, SeriesResult> {
  const seriesMap = new Map<string, SeriesResult>();

  for (const game of games) {
    // Extract series ID from code
    // Examples: WC1, CS1-A, KC2 → WC, CS1-A, KC
    // Remove the game number suffix to get series ID
    let seriesId = game.code;

    // Match patterns like: WC1, CS1-A, KC2
    // Group 1: Round prefix (WC, CS, KC, Q, S, F)
    // Group 2: Game/Series number (1, 2, etc.)
    // Group 3: Optional series letter (A, B, etc.)
    const match = game.code.match(/^([A-Z]+)(\d+)(?:-([A-Z]))?$/);
    if (match) {
      const roundPrefix = match[1]; // WC, CS, KC, Q, S, F
      const number = match[2];      // 1, 2, 3, etc. (game number)
      const letter = match[3];      // A, B, or undefined (series letter)

      if (letter) {
        // Multi-series round: CS1-A, CS2-A → CS-A (drop game number, keep series letter)
        seriesId = `${roundPrefix}-${letter}`;
      } else {
        // Single series round: WC1, WC2, KC1 → WC, KC (just use prefix)
        seriesId = roundPrefix;
      }
    }

    if (!seriesMap.has(seriesId)) {
      seriesMap.set(seriesId, {
        seriesId,
        teamA: game.homeTeam || 'TBD',
        teamB: game.awayTeam || 'TBD',
        winsA: 0,
        winsB: 0,
        games: [],
      });
    }

    const series = seriesMap.get(seriesId)!;
    series.games.push(game);

    // Count wins if game is played
    if (game.played && game.winner) {
      if (game.winner === series.teamA) {
        series.winsA++;
      } else if (game.winner === series.teamB) {
        series.winsB++;
      }
    }
  }

  // Determine series winners based on wins required
  for (const series of seriesMap.values()) {
    if (series.winsA >= PLAYOFF_SERIES.BEST_OF_7_WINS_REQUIRED || series.winsB >= PLAYOFF_SERIES.BEST_OF_7_WINS_REQUIRED) {
      series.winner = series.winsA > series.winsB ? series.teamA : series.teamB;
    } else if (series.winsA >= PLAYOFF_SERIES.BEST_OF_5_WINS_REQUIRED || series.winsB >= PLAYOFF_SERIES.BEST_OF_5_WINS_REQUIRED) {
      series.winner = series.winsA > series.winsB ? series.teamA : series.teamB;
    } else if (series.winsA >= PLAYOFF_SERIES.BEST_OF_3_WINS_REQUIRED || series.winsB >= PLAYOFF_SERIES.BEST_OF_3_WINS_REQUIRED) {
      series.winner = series.winsA > series.winsB ? series.teamA : series.teamB;
    }
  }

  return seriesMap;
}

/**
 * Builds bracket structure organized by round
 * Detects rounds automatically based on series codes
 */
export function buildBracket(seriesMap: Map<string, SeriesResult>): BracketRound[] {
  const rounds: BracketRound[] = [];

  // Group series by round prefix (WC, CS, KC, Q, S, F)
  const roundMap = new Map<string, SeriesResult[]>();

  for (const series of seriesMap.values()) {
    // Extract round prefix from series ID
    // Examples: WC, CS1-A, KC → WC, CS, KC
    let roundPrefix = series.seriesId;

    // If series has a number-letter format (CS1-A), extract just the letter prefix
    const match = series.seriesId.match(/^([A-Z]+)/);
    if (match) {
      roundPrefix = match[1]; // Extract WC, CS, KC, Q, S, F
    }

    if (!roundMap.has(roundPrefix)) {
      roundMap.set(roundPrefix, []);
    }
    roundMap.get(roundPrefix)!.push(series);
  }

  // Convert to BracketRound array with proper names
  const roundNames: Record<string, string> = {
    'Q': 'Quarterfinals',
    'WC': 'Wildcard Round',
    'S': 'Semifinals',
    'CS': 'Castle Series',
    'F': 'Finals',
    'KC': 'Kingdom Cup',
  };

  // Sort by expected bracket order
  const order = ['Q', 'WC', 'S', 'CS', 'F', 'KC'];
  for (const prefix of order) {
    if (roundMap.has(prefix)) {
      rounds.push({
        name: roundNames[prefix] || `Round ${prefix}`,
        series: roundMap.get(prefix)!,
      });
    }
  }

  return rounds;
}

// ===== TEAM DATA =====
export interface TeamData {
  teamName: string;
  captain: string;
  gp: number;
  wins: number;
  losses: number;
  // Hitting totals (raw counting stats)
  hitting: {
    ab: number;
    h: number;
    hr: number;
    rbi: number;
    bb: number;
    k: number;
    rob: number;
    dp: number;
    tb: number;
  };
  // Pitching totals (raw counting stats)
  pitching: {
    ip: number;
    bf: number;
    h: number;
    hr: number;
    r: number;
    bb: number;
    k: number;
    sv: number;
  };
  // Fielding totals (raw counting stats)
  fielding: {
    np: number;
    e: number;
    sb: number;
    cs: number;
  };
}

export async function getTeamData(teamName?: string, isPlayoffs: boolean = false): Promise<TeamData[]> {
  try {
    // Read from team stats sheet
    const sheetName = isPlayoffs ? TEAM_STATS_SHEET.PLAYOFFS : TEAM_STATS_SHEET.REGULAR_SEASON;
    const range = buildFullRange(
      sheetName,
      TEAM_STATS_SHEET.DATA_START_ROW,
      TEAM_STATS_SHEET.MAX_ROWS,
      TEAM_STATS_SHEET.START_COL,
      TEAM_STATS_SHEET.END_COL
    );
    const data = await getSheetData(range);

    const teamDataList = data
      .filter((row) => row[TEAM_STATS_SHEET.COLUMNS.NAME] && String(row[TEAM_STATS_SHEET.COLUMNS.NAME]).trim() !== '')
      .map((row) => ({
        teamName: String(row[TEAM_STATS_SHEET.COLUMNS.NAME] || '').trim(),
        captain: String(row[TEAM_STATS_SHEET.COLUMNS.CAPTAIN] || '').trim(),
        gp: Number(row[TEAM_STATS_SHEET.COLUMNS.GP]) || 0,
        wins: Number(row[TEAM_STATS_SHEET.COLUMNS.WINS]) || 0,
        losses: Number(row[TEAM_STATS_SHEET.COLUMNS.LOSSES]) || 0,
        hitting: {
          ab: Number(row[TEAM_STATS_SHEET.COLUMNS.AB]) || 0,
          h: Number(row[TEAM_STATS_SHEET.COLUMNS.H]) || 0,
          hr: Number(row[TEAM_STATS_SHEET.COLUMNS.HR]) || 0,
          rbi: Number(row[TEAM_STATS_SHEET.COLUMNS.RBI]) || 0,
          bb: Number(row[TEAM_STATS_SHEET.COLUMNS.BB]) || 0,
          k: Number(row[TEAM_STATS_SHEET.COLUMNS.K]) || 0,
          rob: Number(row[TEAM_STATS_SHEET.COLUMNS.ROB]) || 0,
          dp: Number(row[TEAM_STATS_SHEET.COLUMNS.DP]) || 0,
          tb: Number(row[TEAM_STATS_SHEET.COLUMNS.TB]) || 0,
        },
        pitching: {
          ip: Number(row[TEAM_STATS_SHEET.COLUMNS.IP]) || 0,
          bf: Number(row[TEAM_STATS_SHEET.COLUMNS.BF]) || 0,
          h: Number(row[TEAM_STATS_SHEET.COLUMNS.H_ALLOWED]) || 0,
          hr: Number(row[TEAM_STATS_SHEET.COLUMNS.HR_ALLOWED]) || 0,
          r: Number(row[TEAM_STATS_SHEET.COLUMNS.R]) || 0,
          bb: Number(row[TEAM_STATS_SHEET.COLUMNS.BB_ALLOWED]) || 0,
          k: Number(row[TEAM_STATS_SHEET.COLUMNS.K_PITCHED]) || 0,
          sv: Number(row[TEAM_STATS_SHEET.COLUMNS.SV]) || 0,
        },
        fielding: {
          np: Number(row[TEAM_STATS_SHEET.COLUMNS.NP]) || 0,
          e: Number(row[TEAM_STATS_SHEET.COLUMNS.E]) || 0,
          sb: Number(row[TEAM_STATS_SHEET.COLUMNS.SB]) || 0,
          cs: Number(row[TEAM_STATS_SHEET.COLUMNS.CS]) || 0,
        },
      }));

    // If teamName is provided, filter to just that team
    if (teamName) {
      return teamDataList.filter((td) => td.teamName === teamName);
    }

    return teamDataList;
  } catch (error) {
    console.error(`Error fetching team data (isPlayoffs=${isPlayoffs}):`, error);
    // Return empty array if playoff team data doesn't exist yet
    return [];
  }
}

// ===== LEAGUE LEADERS (calculated from Player Data) =====
export interface LeaderEntry {
  rank: string;
  player: string;
  team: string;
  value: string;
  rawValue: number; // For sorting
  isTieSummary?: boolean;
}

/**
 * Fetches all players from the stats sheet without filtering by team
 * @param isPlayoffs - If true, reads from playoff sheet; otherwise regular season
 * @returns Array of all PlayerStats objects with calculated rate stats
 */
export async function getAllPlayers(isPlayoffs: boolean = false): Promise<PlayerStats[]> {
  try {
    // Read all players from player stats sheet (not filtered by team)
    const sheetName = isPlayoffs ? PLAYER_STATS_SHEET.PLAYOFFS : PLAYER_STATS_SHEET.REGULAR_SEASON;
    const range = buildFullRange(
      sheetName,
      PLAYER_STATS_SHEET.DATA_START_ROW,
      PLAYER_STATS_SHEET.MAX_ROWS,
      PLAYER_STATS_SHEET.START_COL,
      PLAYER_STATS_SHEET.END_COL
    );
    const playerData = await getSheetData(range);
    return parsePlayerStats(playerData);
  } catch (error) {
    console.error(`Error fetching all players (isPlayoffs=${isPlayoffs}):`, error);
    // Return empty array if playoff player data doesn't exist yet
    return [];
  }
}

/**
 * Calculates the average games played across all teams
 * Used as baseline for qualification thresholds (multiply by AB_MULTIPLIER or IP_MULTIPLIER)
 * @param isPlayoffs - If true, reads playoff team data; otherwise regular season
 * @returns Average games played per team, or 0 if no team data
 */
export async function getAverageTeamGP(isPlayoffs: boolean = false): Promise<number> {
  const teamData = await getTeamData(undefined, isPlayoffs);
  if (teamData.length === 0) return 0;
  const totalGP = teamData.reduce((sum, team) => sum + team.gp, 0);
  return totalGP / teamData.length;
}

/**
 * Formats leaderboard data with proper ranking, handling ties and display limits
 * Groups tied players and shows exactly 5 entries (individual players or tie summaries)
 * @param players - Array of player data with value and formatted string
 * @param isAscending - If true, sorts ascending (lower is better); false for descending
 * @returns Array of exactly 5 LeaderEntry objects with proper tie labeling (T-1, T-2, etc.)
 */
function formatLeaders(
  players: { player: string; team: string; value: number; formatted: string }[],
  isAscending: boolean = false
): LeaderEntry[] {
  if (players.length === 0) return [];

  // Sort by value
  const sorted = [...players].sort((a, b) =>
    isAscending ? a.value - b.value : b.value - a.value
  );

  // Group players by value
  const groups: { rank: number; players: typeof sorted }[] = [];
  let currentRank = 1;
  let currentValue: number | null = null;
  let currentGroup: typeof sorted = [];

  for (const player of sorted) {
    if (currentValue !== null && player.value !== currentValue) {
      groups.push({ rank: currentRank, players: currentGroup });
      currentRank += currentGroup.length;
      currentGroup = [];
    }
    currentGroup.push(player);
    currentValue = player.value;
  }
  if (currentGroup.length > 0) {
    groups.push({ rank: currentRank, players: currentGroup });
  }

  // Build leaders array, ensuring exactly DISPLAY_CONFIG.LEADERS_COUNT entries
  const leaders: LeaderEntry[] = [];

  for (const group of groups) {
    if (leaders.length >= DISPLAY_CONFIG.LEADERS_COUNT) break;

    const remainingSlots = DISPLAY_CONFIG.LEADERS_COUNT - leaders.length;

    if (group.players.length <= remainingSlots) {
      // Add all players individually
      for (const player of group.players) {
        const rankLabel = group.players.length > 1 ? `T-${group.rank}` : String(group.rank);
        leaders.push({
          rank: rankLabel,
          player: player.player,
          team: player.team,
          value: player.formatted,
          rawValue: player.value,
        });
      }
    } else {
      // Add tie summary (takes 1 slot)
      const rankLabel = group.players.length > 1 ? `T-${group.rank}` : String(group.rank);
      leaders.push({
        rank: rankLabel,
        player: `${group.players.length} players tied`,
        team: '',
        value: group.players[0].formatted,
        rawValue: group.players[0].value,
        isTieSummary: true,
      });
    }
  }

  return leaders;
}

/**
 * Calculates batting leaderboards across 6 categories (OBP, SLG, OPS, H, HR, RBI)
 * Rate stats (OBP/SLG/OPS) require qualification (AB >= avgTeamGP * 2.1, min 5 for playoffs)
 * Counting stats (H/HR/RBI) have no qualification requirement
 * @param isPlayoffs - If true, uses playoff data and lower minimum AB; otherwise regular season
 * @returns Object with 6 leaderboards, each containing top 5 leaders
 */
export async function getCalculatedBattingLeaders(isPlayoffs: boolean = false) {
  const [players, avgTeamGP] = await Promise.all([getAllPlayers(isPlayoffs), getAverageTeamGP(isPlayoffs)]);

  // Calculate qualifying AB threshold with minimum for playoffs
  const calculatedThreshold = avgTeamGP * QUALIFICATION_THRESHOLDS.BATTING.AB_MULTIPLIER;
  const qualifyingAB = isPlayoffs
    ? Math.max(calculatedThreshold, QUALIFICATION_THRESHOLDS.BATTING.PLAYOFF_MINIMUM_AB)
    : calculatedThreshold;

  // Rate stats require qualification
  const qualifiedHitters = players.filter(p => p.ab && p.ab >= qualifyingAB);

  const avg = formatLeaders(
    qualifiedHitters
      .filter(p => p.avg)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: parseFloat('0' + p.avg!),
        formatted: p.avg!,
      }))
  );

  const slg = formatLeaders(
    qualifiedHitters
      .filter(p => p.slg)
      .map(p => {
        // Handle SLG >= 1.000 (doesn't have leading zero removed)
        const slgValue = p.slg!.startsWith('.') ? parseFloat('0' + p.slg!) : parseFloat(p.slg!);
        return {
          player: p.name,
          team: p.team,
          value: slgValue,
          formatted: p.slg!,
        };
      })
  );

  const ops = formatLeaders(
    qualifiedHitters
      .filter(p => p.ops)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: parseFloat(p.ops!),
        formatted: p.ops!,
      }))
  );

  // Counting stats don't require qualification
  const hits = formatLeaders(
    players
      .filter(p => p.h && p.h > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.h!,
        formatted: String(p.h),
      }))
  );

  const hr = formatLeaders(
    players
      .filter(p => p.hr && p.hr > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.hr!,
        formatted: String(p.hr),
      }))
  );

  const rbi = formatLeaders(
    players
      .filter(p => p.rbi && p.rbi > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.rbi!,
        formatted: String(p.rbi),
      }))
  );

  return { avg, hits, hr, rbi, slg, ops };
}

/**
 * Calculates pitching leaderboards across 7 categories (IP, W, L, SV, ERA, WHIP, BAA)
 * Rate stats (ERA/WHIP/BAA) require qualification (IP >= avgTeamGP * 1.0, min 2 for playoffs)
 * Counting stats (IP/W/L/SV) have no qualification requirement
 * @param isPlayoffs - If true, uses playoff data and lower minimum IP; otherwise regular season
 * @returns Object with 7 leaderboards, each containing top 5 leaders
 */
export async function getCalculatedPitchingLeaders(isPlayoffs: boolean = false) {
  const [players, avgTeamGP] = await Promise.all([getAllPlayers(isPlayoffs), getAverageTeamGP(isPlayoffs)]);

  // Calculate qualifying IP threshold with minimum for playoffs
  const calculatedThreshold = avgTeamGP * QUALIFICATION_THRESHOLDS.PITCHING.IP_MULTIPLIER;
  const qualifyingIP = isPlayoffs
    ? Math.max(calculatedThreshold, QUALIFICATION_THRESHOLDS.PITCHING.PLAYOFF_MINIMUM_IP)
    : calculatedThreshold;

  // Rate stats require qualification
  const qualifiedPitchers = players.filter(p => p.ip && p.ip >= qualifyingIP);

  const era = formatLeaders(
    qualifiedPitchers
      .filter(p => p.era)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: parseFloat(p.era!),
        formatted: p.era!,
      })),
    true // Ascending (lower is better)
  );

  const whip = formatLeaders(
    qualifiedPitchers
      .filter(p => p.whip)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: parseFloat(p.whip!),
        formatted: p.whip!,
      })),
    true // Ascending (lower is better)
  );

  const baa = formatLeaders(
    qualifiedPitchers
      .filter(p => p.baa)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: parseFloat('0' + p.baa!),
        formatted: p.baa!,
      })),
    true // Ascending (lower is better)
  );

  // Counting stats don't require qualification
  const ip = formatLeaders(
    players
      .filter(p => p.ip && p.ip > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.ip!,
        formatted: p.ip!.toFixed(2),
      }))
  );

  const wins = formatLeaders(
    players
      .filter(p => p.w && p.w > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.w!,
        formatted: String(p.w),
      }))
  );

  const losses = formatLeaders(
    players
      .filter(p => p.l && p.l > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.l!,
        formatted: String(p.l),
      }))
  );

  const saves = formatLeaders(
    players
      .filter(p => p.sv && p.sv > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.sv!,
        formatted: String(p.sv),
      }))
  );

  return { ip, wins, losses, saves, era, whip, baa };
}

/**
 * Calculates fielding leaderboards across 3 categories (NP, E, SB)
 * All fielding stats are counting stats with no qualification requirement
 * @param isPlayoffs - If true, uses playoff data; otherwise regular season
 * @returns Object with 3 leaderboards (Nice Plays, Errors, Stolen Bases), each with top 5 leaders
 */
export async function getCalculatedFieldingLeaders(isPlayoffs: boolean = false) {
  const players = await getAllPlayers(isPlayoffs);

  const nicePlays = formatLeaders(
    players
      .filter(p => p.np && p.np > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.np!,
        formatted: String(p.np),
      }))
  );

  const errors = formatLeaders(
    players
      .filter(p => p.e && p.e > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.e!,
        formatted: String(p.e),
      }))
  );

  const stolenBases = formatLeaders(
    players
      .filter(p => p.sb && p.sb > 0)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: p.sb!,
        formatted: String(p.sb),
      }))
  );

  return { nicePlays, errors, stolenBases };
}

// ===== PLAYER REGISTRY (PHASE 1 FOUNDATION) =====
export interface PlayerRegistryEntry {
  playerName: string;
  team: string;
  status: string;
  databaseId: string;
  imageUrl: string;
  hasAttributes: string; // ✅ or ❌
}

/**
 * Fetches the Player Registry from League Hub (single source of truth for players)
 * @returns Array of all registered players with team assignments and metadata
 */
export async function getPlayerRegistry(): Promise<PlayerRegistryEntry[]> {
  try {
    const range = buildFullRange(
      PLAYER_REGISTRY_SHEET.NAME,
      PLAYER_REGISTRY_SHEET.DATA_START_ROW,
      PLAYER_REGISTRY_SHEET.MAX_ROWS,
      PLAYER_REGISTRY_SHEET.START_COL,
      PLAYER_REGISTRY_SHEET.END_COL
    );
    const data = await getSheetData(range);

    return data
      .filter((row) => row[PLAYER_REGISTRY_SHEET.COLUMNS.PLAYER_NAME])
      .map((row) => ({
        playerName: String(row[PLAYER_REGISTRY_SHEET.COLUMNS.PLAYER_NAME] || '').trim(),
        team: String(row[PLAYER_REGISTRY_SHEET.COLUMNS.TEAM] || '').trim(),
        status: String(row[PLAYER_REGISTRY_SHEET.COLUMNS.STATUS] || '').trim(),
        databaseId: String(row[PLAYER_REGISTRY_SHEET.COLUMNS.DATABASE_ID] || '').trim(),
        imageUrl: String(row[PLAYER_REGISTRY_SHEET.COLUMNS.IMAGE_URL] || '').trim(),
        hasAttributes: String(row[PLAYER_REGISTRY_SHEET.COLUMNS.HAS_ATTRIBUTES] || '').trim(),
      }));
  } catch (error) {
    console.error('Error fetching player registry:', error);
    return [];
  }
}

// ===== TEAM REGISTRY (PHASE 1 FOUNDATION) =====
export interface TeamRegistryEntry {
  teamName: string;
  abbr: string;
  captain: string;
  status: string;
  color: string;
  logoUrl: string;
  emblemUrl: string;
  discordRoleId: string;
}

/**
 * Fetches the Team Registry from League Hub (single source of truth for teams)
 * @returns Array of all registered teams with colors, logos, and metadata
 */
export async function getTeamRegistry(): Promise<TeamRegistryEntry[]> {
  try {
    const range = buildFullRange(
      TEAM_REGISTRY_SHEET.NAME,
      TEAM_REGISTRY_SHEET.DATA_START_ROW,
      TEAM_REGISTRY_SHEET.MAX_ROWS,
      TEAM_REGISTRY_SHEET.START_COL,
      TEAM_REGISTRY_SHEET.END_COL
    );
    const data = await getSheetData(range);

    return data
      .filter((row) => row[TEAM_REGISTRY_SHEET.COLUMNS.TEAM_NAME])
      .map((row) => ({
        teamName: String(row[TEAM_REGISTRY_SHEET.COLUMNS.TEAM_NAME] || '').trim(),
        abbr: String(row[TEAM_REGISTRY_SHEET.COLUMNS.ABBR] || '').trim(),
        captain: String(row[TEAM_REGISTRY_SHEET.COLUMNS.CAPTAIN] || '').trim(),
        status: String(row[TEAM_REGISTRY_SHEET.COLUMNS.STATUS] || '').trim(),
        color: String(row[TEAM_REGISTRY_SHEET.COLUMNS.COLOR] || '').trim(),
        logoUrl: String(row[TEAM_REGISTRY_SHEET.COLUMNS.LOGO_URL] || '').trim(),
        emblemUrl: String(row[TEAM_REGISTRY_SHEET.COLUMNS.EMBLEM_URL] || '').trim(),
        discordRoleId: String(row[TEAM_REGISTRY_SHEET.COLUMNS.DISCORD_ROLE_ID] || '').trim(),
      }));
  } catch (error) {
    console.error('Error fetching team registry:', error);
    return [];
  }
}

// ===== PLAYER ATTRIBUTES (DATABASE MODULE) =====
export interface PlayerAttributes {
  name: string;
  characterClass: string;
  captain: string;
  mii: string;
  miiColor: string;
  armSide: string;
  battingSide: string;
  weight: number;
  ability: string;

  // Overall stats
  pitchingOverall: number;
  battingOverall: number;
  fieldingOverall: number;
  speedOverall: number;

  // Pitching attributes
  starPitch: string;
  fastballSpeed: number;
  curveballSpeed: number;
  curve: number;
  stamina: number;

  // Hitting attributes
  starSwing: string;
  hitCurve: number;
  hittingTrajectory: string;
  slapHitContact: number;
  chargeHitContact: number;
  slapHitPower: number;
  chargeHitPower: number;
  preCharge: string;

  // Fielding attributes
  fielding: number;
  throwingSpeed: number;

  // Running attributes
  speed: number;
  bunting: number;

  // Calculated averages
  pitchingAverage: number;
  battingAverage: number;
  fieldingAverage: number;
}

/**
 * Parses raw attribute data from Database spreadsheet into structured PlayerAttributes objects
 * Calculates average stats: pitching, batting, and fielding averages
 * @param attributeData - 2D array from Sheets API (columns A-AD)
 * @param playerFilter - Optional player name to filter by
 * @returns Array of PlayerAttributes with both raw and calculated stats
 */
function parsePlayerAttributes(attributeData: any[][], playerFilter?: string): PlayerAttributes[] {
  const players: PlayerAttributes[] = [];

  for (const row of attributeData) {
    const playerName = String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.NAME] || '').trim();

    if (!playerName) continue;
    if (playerFilter && playerName !== playerFilter) continue;

    const fastballSpeed = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.FASTBALL_SPEED]) || 0;
    const curveballSpeed = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.CURVEBALL_SPEED]) || 0;
    const curve = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.CURVE]) || 0;
    const stamina = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.STAMINA]) || 0;

    const slapHitContact = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.SLAP_HIT_CONTACT]) || 0;
    const chargeHitContact = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.CHARGE_HIT_CONTACT]) || 0;
    const slapHitPower = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.SLAP_HIT_POWER]) || 0;
    const chargeHitPower = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.CHARGE_HIT_POWER]) || 0;

    const throwingSpeed = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.THROWING_SPEED]) || 0;
    const fielding = Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.FIELDING]) || 0;

    // Calculate averages (matches DatabaseAttributes.js logic)
    const pitchingAverage = ((curveballSpeed / 2) + (fastballSpeed / 2) + curve + stamina) / 4;
    const battingAverage = (slapHitContact + chargeHitContact + slapHitPower + chargeHitPower) / 4;
    const fieldingAverage = (throwingSpeed + fielding) / 2;

    players.push({
      name: playerName,
      characterClass: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.CHARACTER_CLASS] || ''),
      captain: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.CAPTAIN] || ''),
      mii: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.MII] || ''),
      miiColor: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.MII_COLOR] || ''),
      armSide: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.ARM_SIDE] || ''),
      battingSide: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.BATTING_SIDE] || ''),
      weight: Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.WEIGHT]) || 0,
      ability: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.ABILITY] || ''),

      // Overall stats
      pitchingOverall: Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.PITCHING_OVERALL]) || 0,
      battingOverall: Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.BATTING_OVERALL]) || 0,
      fieldingOverall: Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.FIELDING_OVERALL]) || 0,
      speedOverall: Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.SPEED_OVERALL]) || 0,

      // Pitching attributes
      starPitch: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.STAR_PITCH] || ''),
      fastballSpeed,
      curveballSpeed,
      curve,
      stamina,

      // Hitting attributes
      starSwing: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.STAR_SWING] || ''),
      hitCurve: Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.HIT_CURVE]) || 0,
      hittingTrajectory: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.HITTING_TRAJECTORY] || ''),
      slapHitContact,
      chargeHitContact,
      slapHitPower,
      chargeHitPower,
      preCharge: String(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.PRE_CHARGE] || ''),

      // Fielding attributes
      fielding,
      throwingSpeed,

      // Running attributes
      speed: Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.SPEED]) || 0,
      bunting: Number(row[DATABASE_ATTRIBUTES_SHEET.COLUMNS.BUNTING]) || 0,

      // Calculated averages
      pitchingAverage: Number(pitchingAverage.toFixed(2)),
      battingAverage: Number(battingAverage.toFixed(2)),
      fieldingAverage: Number(fieldingAverage.toFixed(2)),
    });
  }

  return players;
}

/**
 * Fetches player attributes for a specific player from the Database spreadsheet
 * @param playerName - Name of the player to fetch attributes for
 * @param databaseSpreadsheetId - Optional Database spreadsheet ID (defaults to env var)
 * @returns PlayerAttributes object or null if player not found
 */
export async function getPlayerAttributes(
  playerName: string,
  databaseSpreadsheetId?: string
): Promise<PlayerAttributes | null> {
  try {
    const range = buildFullRange(
      DATABASE_ATTRIBUTES_SHEET.NAME,
      DATABASE_ATTRIBUTES_SHEET.DATA_START_ROW,
      DATABASE_ATTRIBUTES_SHEET.MAX_ROWS,
      DATABASE_ATTRIBUTES_SHEET.START_COL,
      DATABASE_ATTRIBUTES_SHEET.END_COL
    );

    const dbId = databaseSpreadsheetId || process.env.DATABASE_SPREADSHEET_ID;
    const attributeData = await getSheetData(range, dbId);

    const players = parsePlayerAttributes(attributeData, playerName);
    return players.length > 0 ? players[0] : null;
  } catch (error) {
    console.error(`Error fetching player attributes (player=${playerName}):`, error);
    return null;
  }
}

/**
 * Fetches all player attributes from the Database spreadsheet
 * Used for comparison tools and league-wide analysis
 * @param databaseSpreadsheetId - Optional Database spreadsheet ID (defaults to env var)
 * @returns Array of all PlayerAttributes objects
 */
export async function getAllPlayerAttributes(
  databaseSpreadsheetId?: string
): Promise<PlayerAttributes[]> {
  try {
    const range = buildFullRange(
      DATABASE_ATTRIBUTES_SHEET.NAME,
      DATABASE_ATTRIBUTES_SHEET.DATA_START_ROW,
      DATABASE_ATTRIBUTES_SHEET.MAX_ROWS,
      DATABASE_ATTRIBUTES_SHEET.START_COL,
      DATABASE_ATTRIBUTES_SHEET.END_COL
    );

    const dbId = databaseSpreadsheetId || process.env.DATABASE_SPREADSHEET_ID;
    const attributeData = await getSheetData(range, dbId);

    return parsePlayerAttributes(attributeData);
  } catch (error) {
    console.error('Error fetching all player attributes:', error);
    return [];
  }
}

// ===== PLAYER CHEMISTRY (DATABASE MODULE) =====
export interface ChemistryPair {
  player1: string;
  player2: string;
  value: number;
  type: 'positive' | 'negative' | 'neutral';
}

export interface ChemistryMatrix {
  [playerName: string]: {
    [otherPlayerName: string]: number;
  };
}

export interface PlayerChemistry {
  name: string;
  positive: string[];  // Players with positive chemistry
  negative: string[];  // Players with negative chemistry
  posCount: number;
  negCount: number;
}

/**
 * Builds a chemistry matrix from raw lookup data for fast lookups
 * @param lookupData - 2D array from Chemistry Lookup sheet
 * @returns Chemistry matrix object with player1 → player2 → value
 */
function buildChemistryMatrix(lookupData: any[][]): ChemistryMatrix {
  const matrix: ChemistryMatrix = {};

  for (const row of lookupData) {
    const player1 = String(row[CHEMISTRY_LOOKUP_SHEET.COLUMNS.PLAYER_1] || '').trim();
    const player2 = String(row[CHEMISTRY_LOOKUP_SHEET.COLUMNS.PLAYER_2] || '').trim();
    const value = Number(row[CHEMISTRY_LOOKUP_SHEET.COLUMNS.CHEMISTRY_VALUE]) || 0;

    if (!player1 || !player2) continue;

    // Initialize nested objects
    if (!matrix[player1]) matrix[player1] = {};
    if (!matrix[player2]) matrix[player2] = {};

    // Chemistry is bidirectional
    matrix[player1][player2] = value;
    matrix[player2][player1] = value;
  }

  return matrix;
}

/**
 * Fetches the full chemistry matrix from the Database spreadsheet
 * @param databaseSpreadsheetId - Optional Database spreadsheet ID (defaults to env var)
 * @returns Chemistry matrix object for all player pairs
 */
export async function getChemistryMatrix(
  databaseSpreadsheetId?: string
): Promise<ChemistryMatrix> {
  try {
    const range = buildFullRange(
      CHEMISTRY_LOOKUP_SHEET.NAME,
      CHEMISTRY_LOOKUP_SHEET.DATA_START_ROW,
      CHEMISTRY_LOOKUP_SHEET.MAX_ROWS,
      CHEMISTRY_LOOKUP_SHEET.START_COL,
      CHEMISTRY_LOOKUP_SHEET.END_COL
    );

    const dbId = databaseSpreadsheetId || process.env.DATABASE_SPREADSHEET_ID;
    const lookupData = await getSheetData(range, dbId);

    return buildChemistryMatrix(lookupData);
  } catch (error) {
    console.error('Error fetching chemistry matrix:', error);
    return {};
  }
}

/**
 * Fetches chemistry data for a specific player
 * @param playerName - Name of the player to fetch chemistry for
 * @param databaseSpreadsheetId - Optional Database spreadsheet ID (defaults to env var)
 * @returns PlayerChemistry object with positive and negative chemistry lists
 */
export async function getPlayerChemistry(
  playerName: string,
  databaseSpreadsheetId?: string
): Promise<PlayerChemistry | null> {
  try {
    const matrix = await getChemistryMatrix(databaseSpreadsheetId);

    if (!matrix[playerName]) {
      return null;
    }

    const positive: string[] = [];
    const negative: string[] = [];

    Object.entries(matrix[playerName]).forEach(([otherPlayer, value]) => {
      if (value >= CHEMISTRY_LOOKUP_SHEET.THRESHOLDS.POSITIVE_MIN) {
        positive.push(otherPlayer);
      } else if (value <= CHEMISTRY_LOOKUP_SHEET.THRESHOLDS.NEGATIVE_MAX) {
        negative.push(otherPlayer);
      }
    });

    positive.sort();
    negative.sort();

    return {
      name: playerName,
      positive,
      negative,
      posCount: positive.length,
      negCount: negative.length,
    };
  } catch (error) {
    console.error(`Error fetching player chemistry (player=${playerName}):`, error);
    return null;
  }
}

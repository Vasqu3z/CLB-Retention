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

export async function getStandings(isPlayoffs: boolean = false): Promise<StandingsRow[]> {
  // Playoffs don't have standings - they use a bracket system
  if (isPlayoffs) {
    return [];
  }

  // Read from standings sheet, rows 4-11 (8 teams), columns A-H
  // Skip rows 1-3: row 1 = title, row 2 = blank, row 3 = headers
  const sheetName = "'🥇 Standings'";

  try {
    const data = await getSheetData(`${sheetName}!A4:H11`);

    // Also fetch cell notes for H2H records (column B = team names)
    const auth = await getAuthClient();
    const sheetId = process.env.SHEETS_SPREADSHEET_ID;

    let notes: string[] = [];
    try {
      const response = await sheets.spreadsheets.get({
        auth: auth as any,
        spreadsheetId: sheetId,
        ranges: [`${sheetName}!B4:B11`],
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
  rob?: number; // Runners on Base (performance vs expected)
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
    const sheetName = isPlayoffs ? "'🏆 Players'!A2:Z100" : "'🧮 Players'!A2:Z100";
    const playerData = await getSheetData(sheetName);

    return parsePlayerStats(playerData, teamName);
  } catch (error) {
    console.error(`Error fetching team roster (team=${teamName}, isPlayoffs=${isPlayoffs}):`, error);
    // Return empty array if playoff player data doesn't exist yet
    return [];
  }
}

// Helper function to parse player stats (used by both regular and playoff)
function parsePlayerStats(playerData: any[][], teamFilter?: string): PlayerStats[] {
  const players: PlayerStats[] = [];

  for (const row of playerData) {
    const playerName = String(row[0] || '').trim();
    const team = String(row[1] || '').trim();

    if (!playerName) continue;
    if (teamFilter && team !== teamFilter) continue;

    const gp = Number(row[2]) || 0;

    // Hitting stats (columns D-L, indices 3-11)
    const ab = Number(row[3]) || 0;
    const h = Number(row[4]) || 0;
    const hr = Number(row[5]) || 0;
    const rbi = Number(row[6]) || 0;
    const bb = Number(row[7]) || 0;
    const k = Number(row[8]) || 0;
    const rob = Number(row[9]) || 0;
    const dp = Number(row[10]) || 0;
    const tb = Number(row[11]) || 0;

    // Calculate hitting rate stats
    const avg = ab > 0 ? (h / ab).toFixed(3).substring(1) : '.000';
    const obp = (ab + bb) > 0 ? ((h + bb) / (ab + bb)).toFixed(3).substring(1) : '.000';
    // SLG can be >= 1.000, so only remove leading zero if < 1
    const slgValue = ab > 0 ? tb / ab : 0;
    const slg = slgValue >= 1 ? slgValue.toFixed(3) : (slgValue > 0 ? slgValue.toFixed(3).substring(1) : '.000');
    const ops = ab > 0 && (ab + bb) > 0
      ? ((h + bb) / (ab + bb) + tb / ab).toFixed(3)
      : '0.000';

    // Pitching stats (columns M-O for W/L/SV, then P-V for pitching, indices 12-21)
    const w = Number(row[12]) || 0;
    const l = Number(row[13]) || 0;
    const sv = Number(row[14]) || 0;
    const ip = Number(row[15]) || 0;
    const bf = Number(row[16]) || 0;
    const pitchingH = Number(row[17]) || 0;
    const pitchingHR = Number(row[18]) || 0;
    const r = Number(row[19]) || 0;
    const pitchingBB = Number(row[20]) || 0;
    const pitchingK = Number(row[21]) || 0;

    // Calculate pitching rate stats
    const era = ip > 0 ? ((r * 9) / ip).toFixed(2) : '0.00';
    const whip = ip > 0 ? ((pitchingH + pitchingBB) / ip).toFixed(2) : '0.00';
    const baa = bf > 0 ? (pitchingH / bf).toFixed(3).substring(1) : '.000';

    // Fielding stats (columns W-Z, indices 22-25)
    const np = Number(row[22]) || 0;
    const e = Number(row[23]) || 0;
    const sb = Number(row[24]) || 0;
    const cs = Number(row[25]) || 0;

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
  // Columns: A=Week, B=Away Team, C=Home Team, D=Away Score, E=Home Score,
  // F=Winning Team, G=Losing Team, H=MVP, I=WP, J=LP, K=SV, L=Box Score Link
  const scheduleData = await getSheetData("'📅 Schedule'!A2:L100");

  const schedule: ScheduleGame[] = [];

  for (const row of scheduleData) {
    const week = Number(row[0]) || 0;
    const awayTeam = String(row[1] || '').trim();
    const homeTeam = String(row[2] || '').trim();

    if (week === 0 || !homeTeam || !awayTeam) continue;

    // Check if game has been played (column D will have away score if played)
    const awayScore = row[3];
    const homeScore = row[4];
    const hasScores = awayScore !== undefined && awayScore !== null && awayScore !== '' &&
                      homeScore !== undefined && homeScore !== null && homeScore !== '';

    if (hasScores) {
      // Game has been played - read results from columns D-L
      const winner = String(row[5] || '').trim();
      const loser = String(row[6] || '').trim();
      const mvp = String(row[7] || '').trim();
      const winningPitcher = String(row[8] || '').trim();
      const losingPitcher = String(row[9] || '').trim();
      const savePitcher = String(row[10] || '').trim();
      const boxScoreUrl = String(row[11] || '').trim();

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
  // Columns: A=Week(code), B=Away Team, C=Home Team, D=Away Score, E=Home Score,
  // F=Winning Team, G=Losing Team, H=MVP, I=WP, J=LP, K=SV, L=Box Score Link
  const scheduleData = await getSheetData("'🏆 Schedule'!A2:L100");

  const schedule: PlayoffGame[] = [];

  for (const row of scheduleData) {
    const code = String(row[0] || '').trim();
    const awayTeam = String(row[1] || '').trim();
    const homeTeam = String(row[2] || '').trim();

    if (!code || !homeTeam || !awayTeam) continue;

    // Check if game has been played
    const awayScore = row[3];
    const homeScore = row[4];
    const hasScores = awayScore !== undefined && awayScore !== null && awayScore !== '' &&
                      homeScore !== undefined && homeScore !== null && homeScore !== '';

    if (hasScores) {
      // Game has been played
      const winner = String(row[5] || '').trim();
      const loser = String(row[6] || '').trim();
      const mvp = String(row[7] || '').trim();
      const winningPitcher = String(row[8] || '').trim();
      const losingPitcher = String(row[9] || '').trim();
      const savePitcher = String(row[10] || '').trim();
      const boxScoreUrl = String(row[11] || '').trim();

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
  // This is a simple heuristic: if one team has ≥2, ≥3, or ≥4 wins, they won
  for (const series of seriesMap.values()) {
    if (series.winsA >= 4 || series.winsB >= 4) {
      series.winner = series.winsA > series.winsB ? series.teamA : series.teamB;
    } else if (series.winsA >= 3 || series.winsB >= 3) {
      series.winner = series.winsA > series.winsB ? series.teamA : series.teamB;
    } else if (series.winsA >= 2 || series.winsB >= 2) {
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
    const sheetName = isPlayoffs ? "'🏆 Teams'!A2:Z20" : "'🧮 Teams'!A2:Z20";
    const data = await getSheetData(sheetName);

    const teamDataList = data
      .filter((row) => row[0] && String(row[0]).trim() !== '')
      .map((row) => ({
        teamName: String(row[0] || '').trim(),
        captain: String(row[1] || '').trim(),
        gp: Number(row[2]) || 0,
        wins: Number(row[3]) || 0,
        losses: Number(row[4]) || 0,
        hitting: {
          ab: Number(row[5]) || 0,
          h: Number(row[6]) || 0,
          hr: Number(row[7]) || 0,
          rbi: Number(row[8]) || 0,
          bb: Number(row[9]) || 0,
          k: Number(row[10]) || 0,
          rob: Number(row[11]) || 0,
          dp: Number(row[12]) || 0,
          tb: Number(row[13]) || 0,
        },
        pitching: {
          ip: Number(row[14]) || 0,
          bf: Number(row[15]) || 0,
          h: Number(row[16]) || 0,
          hr: Number(row[17]) || 0,
          r: Number(row[18]) || 0,
          bb: Number(row[19]) || 0,
          k: Number(row[20]) || 0,
          sv: Number(row[21]) || 0,
        },
        fielding: {
          np: Number(row[22]) || 0,
          e: Number(row[23]) || 0,
          sb: Number(row[24]) || 0,
          cs: Number(row[25]) || 0,
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

async function getAllPlayers(isPlayoffs: boolean = false): Promise<PlayerStats[]> {
  try {
    // Read all players from player stats sheet (not filtered by team)
    const sheetName = isPlayoffs ? "'🏆 Players'!A2:Z100" : "'🧮 Players'!A2:Z100";
    const playerData = await getSheetData(sheetName);
    return parsePlayerStats(playerData);
  } catch (error) {
    console.error(`Error fetching all players (isPlayoffs=${isPlayoffs}):`, error);
    // Return empty array if playoff player data doesn't exist yet
    return [];
  }
}

async function getAverageTeamGP(isPlayoffs: boolean = false): Promise<number> {
  const teamData = await getTeamData(undefined, isPlayoffs);
  if (teamData.length === 0) return 0;
  const totalGP = teamData.reduce((sum, team) => sum + team.gp, 0);
  return totalGP / teamData.length;
}

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

  // Build leaders array, ensuring exactly 5 entries
  const leaders: LeaderEntry[] = [];

  for (const group of groups) {
    if (leaders.length >= 5) break;

    const remainingSlots = 5 - leaders.length;

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

export async function getCalculatedBattingLeaders(isPlayoffs: boolean = false) {
  const [players, avgTeamGP] = await Promise.all([getAllPlayers(isPlayoffs), getAverageTeamGP(isPlayoffs)]);

  // Calculate qualifying AB threshold with a minimum of 5 ABs for playoffs
  const calculatedThreshold = avgTeamGP * 2.1;
  const qualifyingAB = isPlayoffs ? Math.max(calculatedThreshold, 5) : calculatedThreshold;

  // Rate stats require qualification
  const qualifiedHitters = players.filter(p => p.ab && p.ab >= qualifyingAB);

  const obp = formatLeaders(
    qualifiedHitters
      .filter(p => p.obp)
      .map(p => ({
        player: p.name,
        team: p.team,
        value: parseFloat('0' + p.obp!),
        formatted: p.obp!,
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

  return { obp, hits, hr, rbi, slg, ops };
}

export async function getCalculatedPitchingLeaders(isPlayoffs: boolean = false) {
  const [players, avgTeamGP] = await Promise.all([getAllPlayers(isPlayoffs), getAverageTeamGP(isPlayoffs)]);

  // Calculate qualifying IP threshold with a minimum of 2 IP for playoffs
  const calculatedThreshold = avgTeamGP * 1.0;
  const qualifyingIP = isPlayoffs ? Math.max(calculatedThreshold, 2) : calculatedThreshold;

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

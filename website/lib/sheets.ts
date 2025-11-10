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
  // Read from "Standings" sheet, rows 4-11 (8 teams), columns A-H
  // Skip rows 1-3: row 1 = title, row 2 = blank, row 3 = headers
  const data = await getSheetData("'Standings'!A4:H11");

  // Also fetch cell notes for H2H records (column B = team names)
  const auth = await getAuthClient();
  const sheetId = process.env.SHEETS_SPREADSHEET_ID;

  let notes: string[] = [];
  try {
    const response = await sheets.spreadsheets.get({
      auth: auth as any,
      spreadsheetId: sheetId,
      ranges: ["'Standings'!B4:B11"],
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

export async function getTeamRoster(teamName: string): Promise<PlayerStats[]> {
  // Read from Player Data sheet (raw stats only)
  // Columns: A=Name, B=Team, C=GP, D-L=Hitting(9), M-O=W/L/SV, P-V=Pitching(7), W-Z=Fielding(4)
  const playerData = await getSheetData("'Player Data'!A2:Z100");

  const players: PlayerStats[] = [];

  for (const row of playerData) {
    const playerName = String(row[0] || '').trim();
    const team = String(row[1] || '').trim();

    if (!playerName || team !== teamName) continue;

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
    const slg = ab > 0 ? (tb / ab).toFixed(3).substring(1) : '.000';
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
}

export async function getSchedule(): Promise<ScheduleGame[]> {
  // Read from "Schedule" sheet - includes game results in columns D-L
  // Columns: A=Week, B=Away Team, C=Home Team, D=Away Score, E=Home Score,
  // F=Winning Team, G=Losing Team, H=MVP, I=WP, J=LP, K=SV, L=Box Score Link
  const scheduleData = await getSheetData("'Schedule'!A2:L100");

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
  };
  // Fielding totals (raw counting stats)
  fielding: {
    np: number;
    e: number;
    sb: number;
    cs: number;
  };
}

export async function getTeamData(teamName?: string): Promise<TeamData[]> {
  // Read from "Team Data" sheet
  // Row 2 onwards: Team Name, Captain, GP, W, L, Hitting(9), Pitching(7), Fielding(4)
  // Columns A-B: Team, Captain
  // Columns C-E: GP, W, L
  // Columns F-N: AB, H, HR, RBI, BB, K, ROB, DP, TB (9 hitting stats)
  // Columns O-U: IP, BF, H, HR, R, BB, K (7 pitching stats)
  // Columns V-Y: NP, E, SB, CS (4 fielding stats)
  const data = await getSheetData("'Team Data'!A2:Y20");

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
      },
      fielding: {
        np: Number(row[21]) || 0,
        e: Number(row[22]) || 0,
        sb: Number(row[23]) || 0,
        cs: Number(row[24]) || 0,
      },
    }));

  // If teamName is provided, filter to just that team
  if (teamName) {
    return teamDataList.filter((td) => td.teamName === teamName);
  }

  return teamDataList;
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

async function getAllPlayers(): Promise<PlayerStats[]> {
  // Read all players from Player Data sheet (not filtered by team)
  const playerData = await getSheetData("'Player Data'!A2:Z100");
  const players: PlayerStats[] = [];

  for (const row of playerData) {
    const playerName = String(row[0] || '').trim();
    const team = String(row[1] || '').trim();

    if (!playerName) continue;

    const gp = Number(row[2]) || 0;

    // Hitting stats
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
    const slg = ab > 0 ? (tb / ab).toFixed(3).substring(1) : '.000';
    const ops = ab > 0 && (ab + bb) > 0
      ? ((h + bb) / (ab + bb) + tb / ab).toFixed(3)
      : '0.000';

    // Pitching stats
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

    // Fielding stats
    const np = Number(row[22]) || 0;
    const e = Number(row[23]) || 0;
    const sb = Number(row[24]) || 0;
    const cs = Number(row[25]) || 0;

    // Calculate OAA
    const oaa = np - e;

    players.push({
      name: playerName,
      team,
      gp,
      ab, h, hr, rbi, rob, dp, avg, obp, slg, ops,
      ip, w, l, sv, hrAllowed: pitchingHR, era, whip, baa,
      np, e, sb, cs, oaa,
    });
  }

  return players;
}

async function getAverageTeamGP(): Promise<number> {
  const teamData = await getTeamData();
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

  const leaders: LeaderEntry[] = [];
  let currentRank = 1;
  let previousValue: number | null = null;
  let tiedPlayers: typeof sorted = [];

  // Iterate through all players, but stop when we have 5 distinct ranks
  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i];

    if (previousValue !== null && player.value !== previousValue) {
      // Different value - add any tied players first
      if (tiedPlayers.length > 1) {
        leaders.push({
          rank: `T-${currentRank}`,
          player: `${tiedPlayers.length} Players Tied`,
          team: '',
          value: tiedPlayers[0].formatted,
          rawValue: tiedPlayers[0].value,
          isTieSummary: true,
        });
      } else if (tiedPlayers.length === 1) {
        leaders.push({
          rank: String(currentRank),
          player: tiedPlayers[0].player,
          team: tiedPlayers[0].team,
          value: tiedPlayers[0].formatted,
          rawValue: tiedPlayers[0].value,
        });
      }

      // If we've added 5 leader entries (distinct ranks), stop
      if (leaders.length >= 5) {
        break;
      }

      currentRank += tiedPlayers.length;
      tiedPlayers = [];
    }

    tiedPlayers.push(player);
    previousValue = player.value;
  }

  // Add remaining tied players (if we haven't reached 5 entries yet)
  if (leaders.length < 5 && tiedPlayers.length > 0) {
    if (tiedPlayers.length > 1) {
      leaders.push({
        rank: `T-${currentRank}`,
        player: `${tiedPlayers.length} Players Tied`,
        team: '',
        value: tiedPlayers[0].formatted,
        rawValue: tiedPlayers[0].value,
        isTieSummary: true,
      });
    } else if (tiedPlayers.length === 1) {
      leaders.push({
        rank: String(currentRank),
        player: tiedPlayers[0].player,
        team: tiedPlayers[0].team,
        value: tiedPlayers[0].formatted,
        rawValue: tiedPlayers[0].value,
      });
    }
  }

  return leaders;
}

export async function getCalculatedBattingLeaders() {
  const [players, avgTeamGP] = await Promise.all([getAllPlayers(), getAverageTeamGP()]);
  const qualifyingAB = avgTeamGP * 2.1;

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
      .map(p => ({
        player: p.name,
        team: p.team,
        value: parseFloat('0' + p.slg!),
        formatted: p.slg!,
      }))
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

export async function getCalculatedPitchingLeaders() {
  const [players, avgTeamGP] = await Promise.all([getAllPlayers(), getAverageTeamGP()]);
  const qualifyingIP = avgTeamGP * 1.0;

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

export async function getCalculatedFieldingLeaders() {
  const players = await getAllPlayers();

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

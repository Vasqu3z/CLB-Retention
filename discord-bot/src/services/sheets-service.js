/**
 * @file sheets-service.js
 * @description Google Sheets API service for CLB League Hub Discord Bot
 *
 * Purpose:
 * - Provides centralized access to Google Sheets data via API v4
 * - Implements caching layer to minimize API calls (P1: Read Once principle)
 * - Handles authentication and data parsing for all league statistics
 *
 * Key Responsibilities:
 * - Read player stats (hitting, pitching, fielding) and team data
 * - Parse schedule data with hyperlinks for box scores
 * - Calculate league leaders with qualification thresholds
 * - Manage in-memory cache with configurable TTL
 * - Provide image URL lookups for players, teams, and league logo
 *
 * Data Dependencies:
 * - Google Sheets API (requires service account credentials)
 * - Environment variables: GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY
 * - league-config.js (sheet names, column mappings, thresholds)
 *
 * Caching Strategy:
 * - All reads cached with configurable TTL (default: 5 minutes)
 * - Cache invalidation via refreshCache() method
 * - Follows P1: Read Once, Write Once principle
 */

import { google } from 'googleapis';
import {
  SHEET_NAMES,
  PLAYER_DATA_COLUMNS,
  SCHEDULE_COLUMNS,
  STANDINGS_COLUMNS,
  STAT_CALCULATORS,
  TEAM_STATS_COLUMNS,
  DATA_START_ROW,
  QUALIFICATION,
  CACHE_CONFIG,
  PLAYOFF_CODE_TO_ROUND,
  PLAYOFF_ROUNDS,
  PLAYER_REGISTRY_COLUMNS,
  TEAM_REGISTRY_COLUMNS,
  REGISTRY_STATUS,
  VISIBLE_PLAYER_STATUSES,
  VISIBLE_TEAM_STATUSES
} from '../config/league-config.js';
import logger from '../utils/logger.js';

class SheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.cache = new Map();
    this.cacheTTL = CACHE_CONFIG.DURATION_MS;
    this.lastCacheUpdate = 0;
  }

  async initialize() {
    if (this.sheets) return;

    // Handle private key - Railway and other platforms may format it differently
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // If the key doesn't have actual newlines, try to add them
    if (privateKey && !privateKey.includes('\n')) {
      // Replace literal \n with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async getSheetData(sheetName, range = null) {
    await this.initialize();

    // Wrap sheet name in single quotes to handle special characters (emojis, spaces)
    const fullRange = range ? `'${sheetName}'!${range}` : sheetName;
    const cacheKey = fullRange;

    if (this.isCacheValid() && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: fullRange
      });

      const data = response.data.values || [];
      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('SheetsService', `Error fetching data from ${fullRange}`, error);
      throw error;
    }
  }

  async getSheetDataWithHyperlinks(sheetName, range) {
    await this.initialize();

    // Wrap sheet name in single quotes to handle special characters (emojis, spaces)
    const fullRange = `'${sheetName}'!${range}`;
    const cacheKey = `${fullRange}_hyperlinks`;

    if (this.isCacheValid() && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Get the sheet ID for the range
      const sheetMetadata = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        fields: 'sheets.properties'
      });

      const sheet = sheetMetadata.data.sheets.find(s => s.properties.title === sheetName);
      if (!sheet) {
        throw new Error(`Sheet ${sheetName} not found`);
      }

      const sheetId = sheet.properties.sheetId;

      // Get cell data with hyperlinks
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        ranges: [fullRange],
        fields: 'sheets.data.rowData.values(formattedValue,hyperlink)'
      });

      const rows = response.data.sheets[0]?.data[0]?.rowData || [];

      // Transform into array format similar to getSheetData
      const data = rows.map(row => {
        const cells = row.values || [];
        return cells.map(cell => ({
          text: cell.formattedValue || '',
          hyperlink: cell.hyperlink || null
        }));
      });

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('SheetsService', `Error fetching hyperlinks from ${fullRange}`, error);
      throw error;
    }
  }

  isCacheValid() {
    return Date.now() - this.lastCacheUpdate < this.cacheTTL;
  }

  invalidateCache() {
    this.cache.clear();
    this.lastCacheUpdate = 0;
  }

  refreshCache() {
    this.lastCacheUpdate = Date.now();
  }

  /**
   * Helper to get the appropriate sheet name based on playoff status
   * @param {boolean} isPlayoffs - Whether to use playoff sheets
   * @returns {Object} Object with playerSheet, teamSheet, scheduleSheet names
   */
  getSheetNames(isPlayoffs = false) {
    if (isPlayoffs) {
      return {
        playerSheet: SHEET_NAMES.PLAYOFF_PLAYER_DATA,
        teamSheet: SHEET_NAMES.PLAYOFF_TEAM_DATA,
        scheduleSheet: SHEET_NAMES.PLAYOFF_SCHEDULE
      };
    }
    return {
      playerSheet: SHEET_NAMES.PLAYER_DATA,
      teamSheet: SHEET_NAMES.TEAM_DATA,
      scheduleSheet: SHEET_NAMES.SCHEDULE
    };
  }

  async getAllPlayerNames(isPlayoffs = false) {
    const { playerSheet } = this.getSheetNames(isPlayoffs);
    const data = await this.getSheetData(playerSheet, `A${DATA_START_ROW}:B`);
    return data
      .filter(row => row[0] && row[0].trim())
      .map(row => ({
        name: row[0].trim(),
        team: row[1]?.trim() || 'Unknown'
      }));
  }

  async getAllTeamNames(isPlayoffs = false) {
    const { teamSheet } = this.getSheetNames(isPlayoffs);
    const data = await this.getSheetData(teamSheet, `A${DATA_START_ROW}:B`);
    return data
      .filter(row => row[0] && row[0].trim())
      .map(row => ({
        name: row[0].trim(),
        captain: row[1]?.trim() || 'Unknown'
      }));
  }

  /**
   * Fetch comprehensive stats for a specific player across all categories
   * @param {string} playerName - Player name to search for (case-insensitive)
   * @param {boolean} isPlayoffs - Whether to fetch playoff stats instead of regular season
   * @returns {Promise<Object|null>} Player stats object with hitting, pitching, and fielding data, or null if not found
   * @description
   * - v2.0: Reads from single Player Data sheet (columns A-Y)
   * - v2.1: Supports playoff stats via isPlayoffs parameter
   * - Calculates derived stats (AVG, OBP, SLG, OPS, ERA, WHIP, BAA) on-the-fly
   * - Returns unified player object with all stats
   * - Missing stats default to '0'
   */
  async getPlayerStats(playerName, isPlayoffs = false) {
    if (!playerName) {
      return null;
    }

    const normalizedName = playerName.trim().toLowerCase();
    const { playerSheet } = this.getSheetNames(isPlayoffs);

    // v2.0: Single sheet read instead of 3 parallel reads
    const playerData = await this.getSheetData(playerSheet);

    const playerRow = playerData
      .slice(DATA_START_ROW - 1) // Skip header row
      .find(row => row[PLAYER_DATA_COLUMNS.PLAYER_NAME]?.toLowerCase() === normalizedName);

    if (!playerRow) {
      return null;
    }

    const getValue = (index) => playerRow[index] || '0';
    const getNum = (index) => parseFloat(getValue(index)) || 0;

    // Extract raw stats for derived calculations
    const ab = getNum(PLAYER_DATA_COLUMNS.AB);
    const h = getNum(PLAYER_DATA_COLUMNS.H);
    const bb = getNum(PLAYER_DATA_COLUMNS.BB);
    const tb = getNum(PLAYER_DATA_COLUMNS.TB);
    const ip = getNum(PLAYER_DATA_COLUMNS.IP);
    const bf = getNum(PLAYER_DATA_COLUMNS.BF);
    const r = getNum(PLAYER_DATA_COLUMNS.R);
    const hAllowed = getNum(PLAYER_DATA_COLUMNS.H_ALLOWED);
    const bbAllowed = getNum(PLAYER_DATA_COLUMNS.BB_ALLOWED);

    // Calculate derived stats
    const avg = STAT_CALCULATORS.AVG(h, ab);
    const obp = STAT_CALCULATORS.OBP(h, bb, ab);
    const slg = STAT_CALCULATORS.SLG(tb, ab);
    const ops = STAT_CALCULATORS.OPS(h, bb, tb, ab);
    const era = STAT_CALCULATORS.ERA(r, ip);
    const baa = STAT_CALCULATORS.BAA(hAllowed, bf);
    const whip = STAT_CALCULATORS.WHIP(hAllowed, bbAllowed, ip);

    return {
      name: getValue(PLAYER_DATA_COLUMNS.PLAYER_NAME),
      team: getValue(PLAYER_DATA_COLUMNS.TEAM),
      hitting: {
        gp: getValue(PLAYER_DATA_COLUMNS.GP),
        ab: getValue(PLAYER_DATA_COLUMNS.AB),
        h: getValue(PLAYER_DATA_COLUMNS.H),
        hr: getValue(PLAYER_DATA_COLUMNS.HR),
        rbi: getValue(PLAYER_DATA_COLUMNS.RBI),
        bb: getValue(PLAYER_DATA_COLUMNS.BB),
        k: getValue(PLAYER_DATA_COLUMNS.K),
        rob: getValue(PLAYER_DATA_COLUMNS.ROB),
        dp: getValue(PLAYER_DATA_COLUMNS.DP),
        tb: getValue(PLAYER_DATA_COLUMNS.TB),
        avg: avg.toFixed(3),
        obp: obp.toFixed(3),
        slg: slg.toFixed(3),
        ops: ops.toFixed(3)
      },
      pitching: {
        gp: getValue(PLAYER_DATA_COLUMNS.GP),
        w: getValue(PLAYER_DATA_COLUMNS.W),
        l: getValue(PLAYER_DATA_COLUMNS.L),
        sv: getValue(PLAYER_DATA_COLUMNS.SV),
        era: era.toFixed(2),
        ip: getValue(PLAYER_DATA_COLUMNS.IP),
        bf: getValue(PLAYER_DATA_COLUMNS.BF),
        h: getValue(PLAYER_DATA_COLUMNS.H_ALLOWED),
        hr: getValue(PLAYER_DATA_COLUMNS.HR_ALLOWED),
        r: getValue(PLAYER_DATA_COLUMNS.R),
        bb: getValue(PLAYER_DATA_COLUMNS.BB_ALLOWED),
        k: getValue(PLAYER_DATA_COLUMNS.K_PITCHED),
        baa: baa.toFixed(3),
        whip: whip.toFixed(2)
      },
      fielding: {
        gp: getValue(PLAYER_DATA_COLUMNS.GP),
        np: getValue(PLAYER_DATA_COLUMNS.NP),
        e: getValue(PLAYER_DATA_COLUMNS.E),
        sb: getValue(PLAYER_DATA_COLUMNS.SB)
      }
    };
  }

  async getTeamStats(teamName, isPlayoffs = false) {
    if (!teamName) {
      return null;
    }

    const normalizedName = teamName.trim().toLowerCase();
    const { teamSheet } = this.getSheetNames(isPlayoffs);

    // v2.0: Fetch Team Data and Standings to get Runs Scored
    // Note: Playoffs don't have standings, so we'll get runsScored from team data
    const [teamData, standingsData] = await Promise.all([
      this.getSheetData(teamSheet),
      isPlayoffs ? Promise.resolve([]) : this.getSheetData(SHEET_NAMES.STANDINGS, 'A2:H')
    ]);

    const teamRow = teamData
      .slice(1)
      .find(row => row[TEAM_STATS_COLUMNS.TEAM_NAME]?.toLowerCase() === normalizedName);

    if (!teamRow) {
      return null;
    }

    const getValue = (index) => teamRow[index] || '0';
    const getNum = (index) => parseFloat(getValue(index)) || 0;

    const gp = getNum(TEAM_STATS_COLUMNS.GP);

    // Get Runs Scored from Standings sheet (column F, index 5)
    const standingsRow = standingsData.find(row => row[1]?.toLowerCase().trim() === normalizedName);
    const runsScored = standingsRow ? (parseFloat(standingsRow[5]) || 0) : 0;

    // Parse hitting stats: AB, H, HR, RBI, BB, K, ROB, DP, TB
    const ab = getNum(TEAM_STATS_COLUMNS.HITTING_START + 0);
    const h = getNum(TEAM_STATS_COLUMNS.HITTING_START + 1);
    const hr = getNum(TEAM_STATS_COLUMNS.HITTING_START + 2);
    const rbi = getNum(TEAM_STATS_COLUMNS.HITTING_START + 3);
    const bb = getNum(TEAM_STATS_COLUMNS.HITTING_START + 4);
    const k = getNum(TEAM_STATS_COLUMNS.HITTING_START + 5);
    const rob = getNum(TEAM_STATS_COLUMNS.HITTING_START + 6);
    const dp = getNum(TEAM_STATS_COLUMNS.HITTING_START + 7);
    const tb = getNum(TEAM_STATS_COLUMNS.HITTING_START + 8);

    // Calculate hitting rate stats
    const avg = ab > 0 ? (h / ab).toFixed(3) : '.000';
    const obp = (ab + bb) > 0 ? ((h + bb) / (ab + bb)).toFixed(3) : '.000';
    const slg = ab > 0 ? (tb / ab).toFixed(3) : '.000';
    const ops = (parseFloat(obp) + parseFloat(slg)).toFixed(3);
    const runsPerGame = gp > 0 ? (runsScored / gp).toFixed(2) : '0.00';

    // Parse pitching stats: IP, BF, H, HR, R, BB, K
    const ip = getNum(TEAM_STATS_COLUMNS.PITCHING_START + 0);
    const bf = getNum(TEAM_STATS_COLUMNS.PITCHING_START + 1);
    const pH = getNum(TEAM_STATS_COLUMNS.PITCHING_START + 2);
    const pHR = getNum(TEAM_STATS_COLUMNS.PITCHING_START + 3);
    const r = getNum(TEAM_STATS_COLUMNS.PITCHING_START + 4);
    const pBB = getNum(TEAM_STATS_COLUMNS.PITCHING_START + 5);
    const pK = getNum(TEAM_STATS_COLUMNS.PITCHING_START + 6);

    // Calculate pitching rate stats
    const era = ip > 0 ? ((r * 9) / ip).toFixed(2) : '0.00';
    const baa = bf > 0 ? (pH / bf).toFixed(3) : '.000';
    const whip = ip > 0 ? ((pH + pBB) / ip).toFixed(2) : '0.00';

    // Parse fielding stats: NP, E, SB
    const np = getNum(TEAM_STATS_COLUMNS.FIELDING_START + 0);
    const e = getNum(TEAM_STATS_COLUMNS.FIELDING_START + 1);
    const sb = getNum(TEAM_STATS_COLUMNS.FIELDING_START + 2);

    // Calculate fielding rate stats
    const npPerGame = gp > 0 ? (np / gp).toFixed(2) : '0.00';

    return {
      name: teamRow[TEAM_STATS_COLUMNS.TEAM_NAME],
      captain: getValue(TEAM_STATS_COLUMNS.CAPTAIN),
      gp: gp.toString(),
      wins: getValue(TEAM_STATS_COLUMNS.WINS),
      losses: getValue(TEAM_STATS_COLUMNS.LOSSES),
      hitting: {
        ab, h, hr, rbi, bb, k, rob, dp, tb,
        runsScored: runsScored.toString(),
        // Rate stats
        runsPerGame,
        avg,
        obp,
        slg,
        ops
      },
      pitching: {
        ip, bf, h: pH, hr: pHR, r, bb: pBB, k: pK,
        // Rate stats
        era,
        baa,
        whip
      },
      fielding: {
        np, e, sb,
        // Rate stats
        npPerGame
      }
    };
  }

  async getStandings(isPlayoffs = false) {
    // Playoffs don't have standings - they use a bracket system
    if (isPlayoffs) {
      return [];
    }

    // v2.0: Standings sheet structure
    // Row 1 = "Standings" title, Row 2 = Blank, Row 3 = Headers, Row 4+ = Data
    // Columns: Rank, Team, W, L, Win%, RS, RA, Diff
    const data = await this.getSheetData(SHEET_NAMES.STANDINGS, 'A4:H');
    return data
      .filter(row => row[0] && row[1] && row[1].trim()) // Filter valid rows with team names
      .map(row => ({
        rank: row[0] || '',
        team: row[1]?.trim() || '',
        wins: row[2] || '0',
        losses: row[3] || '0',
        winPct: row[4] || '.000',
        runsScored: row[5] || '0',
        runsAllowed: row[6] || '0',
        runDiff: row[7] || '0'
      }));
  }

  async getLeagueLeaders(category, stat, isPlayoffs = false) {
    // v2.0: Read from single Player Data sheet and calculate derived stats
    // v2.1: Supports playoff stats via isPlayoffs parameter
    const { playerSheet, teamSheet } = this.getSheetNames(isPlayoffs);
    const [playerData, teamData] = await Promise.all([
      this.getSheetData(playerSheet),
      this.getSheetData(teamSheet, `A${DATA_START_ROW}:C`)
    ]);

    const leaders = [];

    // Create team GP map
    const teamGPMap = {};
    teamData.forEach(row => {
      const teamName = row[0]?.trim();
      const gp = parseFloat(row[2]) || 0;
      if (teamName) teamGPMap[teamName] = gp;
    });

    // Process Player Data rows (skip header)
    playerData.slice(DATA_START_ROW - 1).forEach(row => {
      const playerName = row[PLAYER_DATA_COLUMNS.PLAYER_NAME];
      const team = row[PLAYER_DATA_COLUMNS.TEAM];
      if (!playerName || !team) return;

      const teamGP = teamGPMap[team] || 0;

      if (category === 'batting') {
        const ab = parseFloat(row[PLAYER_DATA_COLUMNS.AB]) || 0;
        const h = parseFloat(row[PLAYER_DATA_COLUMNS.H]) || 0;
        const hr = parseFloat(row[PLAYER_DATA_COLUMNS.HR]) || 0;
        const rbi = parseFloat(row[PLAYER_DATA_COLUMNS.RBI]) || 0;
        const bb = parseFloat(row[PLAYER_DATA_COLUMNS.BB]) || 0;
        const tb = parseFloat(row[PLAYER_DATA_COLUMNS.TB]) || 0;

        // For playoffs, use minimum of 5 ABs or calculated threshold
        const calculatedAB = teamGP * QUALIFICATION.MIN_AB_MULTIPLIER;
        const qualifyingAB = isPlayoffs ? Math.max(calculatedAB, 5) : calculatedAB;

        let value = 0;
        let qualified = true;

        switch (stat) {
          case 'obp':
            value = STAT_CALCULATORS.OBP(h, bb, ab);
            qualified = ab >= qualifyingAB;
            break;
          case 'hits':
            value = h;
            qualified = h > 0;
            break;
          case 'hr':
            value = hr;
            qualified = hr > 0;
            break;
          case 'rbi':
            value = rbi;
            qualified = rbi > 0;
            break;
          case 'slg':
            value = STAT_CALCULATORS.SLG(tb, ab);
            qualified = ab >= qualifyingAB;
            break;
          case 'ops':
            value = STAT_CALCULATORS.OPS(h, bb, tb, ab);
            qualified = ab >= qualifyingAB;
            break;
        }

        if (qualified && value > 0) {
          leaders.push({ name: playerName, team, value });
        }
      } else if (category === 'pitching') {
        const ip = parseFloat(row[PLAYER_DATA_COLUMNS.IP]) || 0;
        const bf = parseFloat(row[PLAYER_DATA_COLUMNS.BF]) || 0;
        const h = parseFloat(row[PLAYER_DATA_COLUMNS.H_ALLOWED]) || 0;
        const r = parseFloat(row[PLAYER_DATA_COLUMNS.R]) || 0;
        const bb = parseFloat(row[PLAYER_DATA_COLUMNS.BB_ALLOWED]) || 0;
        const w = parseFloat(row[PLAYER_DATA_COLUMNS.W]) || 0;
        const l = parseFloat(row[PLAYER_DATA_COLUMNS.L]) || 0;
        const sv = parseFloat(row[PLAYER_DATA_COLUMNS.SV]) || 0;

        // For playoffs, use minimum of 2 IP or calculated threshold
        const calculatedIP = teamGP * QUALIFICATION.MIN_IP_MULTIPLIER;
        const qualifyingIP = isPlayoffs ? Math.max(calculatedIP, 2) : calculatedIP;

        let value = 0;
        let qualified = true;

        switch (stat) {
          case 'ip':
            value = ip;
            qualified = ip > 0;
            break;
          case 'wins':
            value = w;
            qualified = w > 0;
            break;
          case 'losses':
            value = l;
            qualified = l > 0;
            break;
          case 'saves':
            value = sv;
            qualified = sv > 0;
            break;
          case 'era':
            value = STAT_CALCULATORS.ERA(r, ip);
            qualified = ip >= qualifyingIP;
            break;
          case 'whip':
            value = STAT_CALCULATORS.WHIP(h, bb, ip);
            qualified = ip >= qualifyingIP;
            break;
          case 'baa':
            value = STAT_CALCULATORS.BAA(h, bf);
            qualified = ip >= qualifyingIP;
            break;
        }

        if (qualified && value > 0) {
          leaders.push({ name: playerName, team, value });
        }
      } else if (category === 'fielding') {
        const np = parseFloat(row[PLAYER_DATA_COLUMNS.NP]) || 0;
        const e = parseFloat(row[PLAYER_DATA_COLUMNS.E]) || 0;
        const sb = parseFloat(row[PLAYER_DATA_COLUMNS.SB]) || 0;

        let value = 0;

        switch (stat) {
          case 'niceplays':
            value = np;
            break;
          case 'errors':
            value = e;
            break;
          case 'stolenbases':
            value = sb;
            break;
        }

        if (value > 0) {
          leaders.push({ name: playerName, team, value });
        }
      }
    });

    // Sort (ERA, WHIP, BAA are lower is better)
    const lowerIsBetter = ['era', 'whip', 'baa'].includes(stat);
    leaders.sort((a, b) => lowerIsBetter ? a.value - b.value : b.value - a.value);

    // Return top 5
    return leaders.slice(0, 5);
  }

  async getTeamRoster(teamName, isPlayoffs = false) {
    if (!teamName) {
      return null;
    }

    const normalizedName = teamName.trim().toLowerCase();
    const { playerSheet, teamSheet } = this.getSheetNames(isPlayoffs);
    const [playerData, teamData] = await Promise.all([
      this.getSheetData(playerSheet, `A${DATA_START_ROW}:B`),
      this.getSheetData(teamSheet, `A${DATA_START_ROW}:B`)
    ]);

    // Find the team
    const teamRow = teamData.find(row => row[0]?.toLowerCase().trim() === normalizedName);
    if (!teamRow) {
      return null;
    }

    // Get players on this team
    const players = playerData
      .filter(row => row[1]?.toLowerCase().trim() === normalizedName)
      .map(row => row[0]?.trim())
      .filter(name => name);

    return {
      teamName: teamRow[0].trim(),
      captain: teamRow[1]?.trim() || 'Unknown',
      players: players.sort()
    };
  }

  async getScheduleData(filter, isPlayoffs = false) {
    // v2.0: Read consolidated Schedule sheet
    // v2.1: Supports playoff schedule via isPlayoffs parameter
    // Columns: Week, Away Team, Home Team, Away Score, Home Score, Winner, Game #, Date, MVP, Home RS, Away RS, Box Score URL
    const { scheduleSheet } = this.getSheetNames(isPlayoffs);
    const scheduleData = await this.getSheetData(scheduleSheet, 'A2:L');

    // Build games array from Schedule sheet data
    const games = scheduleData
      .filter(row => row[SCHEDULE_COLUMNS.WEEK] && row[SCHEDULE_COLUMNS.AWAY_TEAM] && row[SCHEDULE_COLUMNS.HOME_TEAM])
      .map(row => {
        const weekRaw = row[SCHEDULE_COLUMNS.WEEK];

        // For playoffs, extract round prefix from game codes; for regular season, parse as integer
        let week;
        let roundName = null;
        let seriesId = null;
        if (isPlayoffs) {
          // Playoff schedule uses game codes like: WC1, WC2, CS1-A, CS2-B, KC1, KC2
          // Extract: round prefix (WC, CS, KC), game number, and optional series letter (A, B)
          const gameCode = weekRaw.trim();
          const match = gameCode.match(/^([A-Z]+)(\d+)(?:-([A-Z]))?$/); // e.g., "CS1-A" -> ["CS1-A", "CS", "1", "A"]

          if (match) {
            const roundPrefix = match[1]; // e.g., "WC", "CS", "KC"
            const gameNumber = match[2]; // e.g., "1", "2"
            const seriesLetter = match[3]; // e.g., "A", "B", or undefined

            week = PLAYOFF_CODE_TO_ROUND[roundPrefix];
            roundName = PLAYOFF_ROUNDS[week]; // Convert number back to full name
            seriesId = seriesLetter ? `${roundName} - Series ${seriesLetter}` : roundName;

            console.log(`[SHEETS] Playoff code "${gameCode}" -> prefix "${roundPrefix}", game ${gameNumber}, series "${seriesLetter || 'none'}" -> week ${week} (${seriesId})`);
          } else {
            // Fallback to parseInt if no prefix match
            week = parseInt(gameCode);
            console.log(`[SHEETS] Playoff code "${gameCode}" -> parseInt -> week ${week}`);
          }
        } else {
          week = parseInt(weekRaw);
        }

        const awayTeam = row[SCHEDULE_COLUMNS.AWAY_TEAM]?.trim();
        const homeTeam = row[SCHEDULE_COLUMNS.HOME_TEAM]?.trim();
        const awayScore = row[SCHEDULE_COLUMNS.AWAY_SCORE];
        const homeScore = row[SCHEDULE_COLUMNS.HOME_SCORE];
        const winner = row[SCHEDULE_COLUMNS.WINNER]?.trim();
        const boxScoreUrl = row[SCHEDULE_COLUMNS.BOX_SCORE_URL]?.trim();

        // Game is played if it has scores
        const played = !!(awayScore && homeScore);

        // Format result string like "Team1: Score1 || Team2: Score2"
        const result = played ? `${awayTeam}: ${awayScore} || ${homeTeam}: ${homeScore}` : null;

        return {
          week,
          roundName,
          seriesId, // e.g., "Castle Series - Series A" or just "Wildcard Round"
          homeTeam,
          awayTeam,
          played,
          result,
          boxScoreUrl: boxScoreUrl || null
        };
      });

    // Determine current week (max completed week + 1)
    const maxCompletedWeek = Math.max(0, ...games.filter(g => g.played).map(g => g.week));
    const currentWeek = maxCompletedWeek + 1;

    // Debug logging for recent/current/upcoming
    if (filter.type === 'recent' || filter.type === 'current' || filter.type === 'upcoming') {
      console.log(`[SHEETS] ${filter.type} filter for ${isPlayoffs ? 'playoffs' : 'regular season'}:`);
      console.log(`[SHEETS] Total games: ${games.length}`);
      console.log(`[SHEETS] Played games: ${games.filter(g => g.played).length}`);
      console.log(`[SHEETS] Max completed week: ${maxCompletedWeek}`);
      console.log(`[SHEETS] Current week: ${currentWeek}`);
      console.log(`[SHEETS] All game weeks: ${games.map(g => `W${g.week}${g.played ? '✓' : '○'}`).join(', ')}`);
    }

    // Filter based on request type
    switch (filter.type) {
      case 'recent':
        // Last completed week
        const recentGames = games.filter(g => g.played && g.week === maxCompletedWeek);
        console.log(`[SHEETS] Recent: Looking for played games in week ${maxCompletedWeek}, found ${recentGames.length}`);
        return recentGames;

      case 'current':
        // Current week (may have some completed games)
        const currentGames = games.filter(g => g.week === currentWeek);
        console.log(`[SHEETS] Current: Looking for games in week ${currentWeek}, found ${currentGames.length}`);
        return currentGames;

      case 'upcoming':
        // Next week
        const upcomingGames = games.filter(g => g.week === currentWeek + 1);
        console.log(`[SHEETS] Upcoming: Looking for games in week ${currentWeek + 1}, found ${upcomingGames.length}`);
        return upcomingGames;

      case 'team':
        // All games for a specific team
        const teamName = filter.teamName.toLowerCase().trim();
        return games.filter(g =>
          g.homeTeam.toLowerCase().includes(teamName) ||
          g.awayTeam.toLowerCase().includes(teamName)
        );

      case 'week':
        // All games for a specific week
        return games.filter(g => g.week === filter.weekNumber);

      case 'round':
        // All games for a specific playoff round (round number maps to week number)
        console.log(`[SHEETS] Filtering for round ${filter.roundNumber}`);
        console.log(`[SHEETS] Total games available:`, games.length);
        console.log(`[SHEETS] Game week numbers:`, games.map(g => `${g.week}(${g.roundName})`).join(', '));
        const filtered = games.filter(g => g.week === filter.roundNumber);
        console.log(`[SHEETS] Games matching week ${filter.roundNumber}:`, filtered.length);
        return filtered;

      case 'all':
        // All games (used for determining completed weeks)
        return games;

      default:
        return [];
    }
  }

  async getHeadToHeadData(team1Name, team2Name, isPlayoffs = false) {
    // v2.0: Get all completed games from Schedule sheet
    // v2.1: Supports playoff games via isPlayoffs parameter
    const { scheduleSheet } = this.getSheetNames(isPlayoffs);
    const scheduleData = await this.getSheetData(scheduleSheet, 'A2:L');

    const team1Lower = team1Name.toLowerCase().trim();
    const team2Lower = team2Name.toLowerCase().trim();

    // Find games between these two teams
    const matchupGames = [];

    scheduleData.forEach(row => {
      const weekRaw = row[SCHEDULE_COLUMNS.WEEK];

      // For playoffs, extract round prefix from game codes; for regular season, parse as integer
      let week;
      if (isPlayoffs) {
        const gameCode = weekRaw?.trim();
        const match = gameCode?.match(/^([A-Z]+)/);
        if (match) {
          const roundPrefix = match[1];
          week = PLAYOFF_CODE_TO_ROUND[roundPrefix];
        } else {
          week = parseInt(weekRaw);
        }
      } else {
        week = parseInt(weekRaw);
      }

      const awayTeam = row[SCHEDULE_COLUMNS.AWAY_TEAM]?.trim();
      const homeTeam = row[SCHEDULE_COLUMNS.HOME_TEAM]?.trim();
      const awayScore = row[SCHEDULE_COLUMNS.AWAY_SCORE];
      const homeScore = row[SCHEDULE_COLUMNS.HOME_SCORE];
      const boxScoreUrl = row[SCHEDULE_COLUMNS.BOX_SCORE_URL]?.trim();

      if (!awayTeam || !homeTeam || !awayScore || !homeScore) return;

      const awayLower = awayTeam.toLowerCase();
      const homeLower = homeTeam.toLowerCase();

      // Check if this game involves both teams
      if ((awayLower.includes(team1Lower) && homeLower.includes(team2Lower)) ||
          (awayLower.includes(team2Lower) && homeLower.includes(team1Lower))) {

        const score1 = parseInt(awayScore);
        const score2 = parseInt(homeScore);

        matchupGames.push({
          week: week,
          team1: awayTeam,
          score1: score1,
          team2: homeTeam,
          score2: score2,
          boxScoreUrl: boxScoreUrl || null,
          winner: score1 > score2 ? awayTeam : homeTeam
        });
      }
    });

    if (matchupGames.length === 0) {
      return null;
    }

    // Calculate head-to-head record
    let team1Wins = 0;
    let team2Wins = 0;
    let totalRunsTeam1 = 0;
    let totalRunsTeam2 = 0;

    matchupGames.forEach(game => {
      // Normalize team names for comparison
      const team1InGame = game.team1.toLowerCase().includes(team1Lower) ? game.team1 : game.team2;
      const team2InGame = game.team1.toLowerCase().includes(team2Lower) ? game.team1 : game.team2;
      const score1InGame = game.team1.toLowerCase().includes(team1Lower) ? game.score1 : game.score2;
      const score2InGame = game.team1.toLowerCase().includes(team2Lower) ? game.score1 : game.score2;

      totalRunsTeam1 += score1InGame;
      totalRunsTeam2 += score2InGame;

      if (score1InGame > score2InGame) {
        team1Wins++;
      } else {
        team2Wins++;
      }
    });

    const avgScoreTeam1 = (totalRunsTeam1 / matchupGames.length).toFixed(1);
    const avgScoreTeam2 = (totalRunsTeam2 / matchupGames.length).toFixed(1);

    return {
      team1: team1Name,
      team2: team2Name,
      team1Wins,
      team2Wins,
      games: matchupGames,
      avgScoreTeam1,
      avgScoreTeam2,
      totalGames: matchupGames.length
    };
  }

  // ===== REGISTRY FUNCTIONS (v2.1) =====

  /**
   * Fetches the Player Registry - single source of truth for player identity
   * @param {boolean} includeInactive - Include inactive players (default: false)
   * @returns {Promise<Array>} Array of player registry entries
   */
  async getPlayerRegistry(includeInactive = false) {
    const data = await this.getSheetData(SHEET_NAMES.PLAYER_REGISTRY, 'A2:F');

    const players = data
      .filter(row => row[PLAYER_REGISTRY_COLUMNS.PLAYER_NAME])
      .map(row => ({
        databaseId: row[PLAYER_REGISTRY_COLUMNS.DATABASE_ID]?.trim() || '',
        name: row[PLAYER_REGISTRY_COLUMNS.PLAYER_NAME]?.trim() || '',
        team: row[PLAYER_REGISTRY_COLUMNS.TEAM]?.trim() || '',
        status: row[PLAYER_REGISTRY_COLUMNS.STATUS]?.trim() || '',
        imageUrl: row[PLAYER_REGISTRY_COLUMNS.IMAGE_URL]?.trim() || '',
        hasAttributes: row[PLAYER_REGISTRY_COLUMNS.HAS_ATTRIBUTES]?.toLowerCase() === 'true'
      }));

    if (includeInactive) {
      return players;
    }

    // Filter to only visible statuses (Active, Free Agent)
    return players.filter(p => VISIBLE_PLAYER_STATUSES.includes(p.status));
  }

  /**
   * Fetches the Team Registry - single source of truth for team metadata
   * @param {boolean} includeInactive - Include inactive teams (default: false)
   * @returns {Promise<Array>} Array of team registry entries
   */
  async getTeamRegistry(includeInactive = false) {
    const data = await this.getSheetData(SHEET_NAMES.TEAM_REGISTRY, 'A2:J');

    const teams = data
      .filter(row => row[TEAM_REGISTRY_COLUMNS.TEAM_NAME])
      .map(row => ({
        name: row[TEAM_REGISTRY_COLUMNS.TEAM_NAME]?.trim() || '',
        captain: row[TEAM_REGISTRY_COLUMNS.CAPTAIN]?.trim() || '',
        abbr: row[TEAM_REGISTRY_COLUMNS.ABBR]?.trim() || '',
        status: row[TEAM_REGISTRY_COLUMNS.STATUS]?.trim() || '',
        color: row[TEAM_REGISTRY_COLUMNS.COLOR]?.trim() || '',
        secondaryColor: row[TEAM_REGISTRY_COLUMNS.SECONDARY_COLOR]?.trim() || '',
        logoUrl: row[TEAM_REGISTRY_COLUMNS.LOGO_URL]?.trim() || '',
        emblemUrl: row[TEAM_REGISTRY_COLUMNS.EMBLEM_URL]?.trim() || '',
        discordRoleId: row[TEAM_REGISTRY_COLUMNS.DISCORD_ROLE_ID]?.trim() || '',
        teamOwner: row[TEAM_REGISTRY_COLUMNS.TEAM_OWNER]?.trim() || ''
      }));

    if (includeInactive) {
      return teams;
    }

    // Filter to only visible statuses (Active)
    return teams.filter(t => VISIBLE_TEAM_STATUSES.includes(t.status));
  }

  /**
   * Fetches league branding from Team Registry (row with STATUS="League")
   * @returns {Promise<Object|null>} League branding object or null
   */
  async getLeagueBranding() {
    const allTeams = await this.getTeamRegistry(true); // Include all statuses
    const leagueEntry = allTeams.find(t => t.status === REGISTRY_STATUS.LEAGUE);

    if (leagueEntry) {
      return {
        name: leagueEntry.name,
        shortName: leagueEntry.abbr,
        primaryColor: leagueEntry.color,
        secondaryColor: leagueEntry.secondaryColor,
        logoUrl: leagueEntry.logoUrl,
        emblemUrl: leagueEntry.emblemUrl
      };
    }

    // Fallback defaults
    return {
      name: 'Comets League Baseball',
      shortName: 'CLB',
      primaryColor: '#FF6B35',
      secondaryColor: '#00D4FF',
      logoUrl: '',
      emblemUrl: ''
    };
  }

  /**
   * Finds a player in the registry by name
   * @param {string} name - Player name to search for
   * @returns {Promise<Object|null>} Player registry entry or null
   */
  async findPlayerInRegistry(name) {
    const players = await this.getPlayerRegistry(true);
    const normalizedName = name.trim().toLowerCase();

    return players.find(p => p.name.toLowerCase() === normalizedName) || null;
  }

  /**
   * Finds a team in the registry by name
   * @param {string} name - Team name to search for
   * @returns {Promise<Object|null>} Team registry entry or null
   */
  async findTeamInRegistry(name) {
    const teams = await this.getTeamRegistry(true);
    const normalizedName = name.trim().toLowerCase();

    return teams.find(t =>
      t.name.toLowerCase() === normalizedName ||
      t.abbr.toLowerCase() === normalizedName
    ) || null;
  }

  /**
   * Gets image URL for a player, team, or league
   * Uses Registry sheets as primary source, with fallback to Image URLs sheet
   * @param {string} name - Name to look up
   * @param {string} type - 'player', 'team', or 'league'
   * @returns {Promise<string|null>} Image URL or null
   */
  async getImageUrl(name, type) {
    logger.debug('SheetsService', `Looking for image: name="${name}", type="${type}"`);

    // Try Registry lookup first
    if (type === 'player') {
      const player = await this.findPlayerInRegistry(name);
      if (player?.imageUrl) {
        logger.debug('SheetsService', `Found player image in Registry: ${player.imageUrl}`);
        return player.imageUrl;
      }
    } else if (type === 'team') {
      const team = await this.findTeamInRegistry(name);
      if (team?.emblemUrl) {
        logger.debug('SheetsService', `Found team emblem in Registry: ${team.emblemUrl}`);
        return team.emblemUrl;
      }
    } else if (type === 'league') {
      const branding = await this.getLeagueBranding();
      if (branding?.emblemUrl) {
        logger.debug('SheetsService', `Found league emblem in Registry: ${branding.emblemUrl}`);
        return branding.emblemUrl;
      }
    }

    // Fallback to Image URLs sheet (deprecated, for backwards compatibility)
    logger.debug('SheetsService', `Registry lookup failed, trying Image URLs sheet...`);
    const data = await this.getSheetData(SHEET_NAMES.IMAGE_URLS, 'A2:C');

    const normalizedName = name.trim().toLowerCase();

    // Find exact match
    const match = data.find(row => {
      const rowName = row[0]?.toLowerCase().trim();
      const rowType = row[1]?.toLowerCase().trim();
      return rowName === normalizedName && rowType === type;
    });

    if (match && match[2]) {
      const url = match[2].trim();
      logger.debug('SheetsService', `Found in Image URLs sheet: ${url}`);
      return url;
    }

    // Fall back to default for this type
    const defaultMatch = data.find(row =>
      row[0]?.toLowerCase().trim() === `default ${type}` &&
      row[1]?.toLowerCase().trim() === type
    );

    if (defaultMatch && defaultMatch[2]) {
      const url = defaultMatch[2].trim();
      logger.debug('SheetsService', `Using default image for ${type}: ${url}`);
      return url;
    }

    logger.debug('SheetsService', `No image found for ${name} (${type})`);
    return null;
  }
}

export default new SheetsService();

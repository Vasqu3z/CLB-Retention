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
  HITTING_COLUMNS,
  PITCHING_COLUMNS,
  FIELDING_COLUMNS,
  TEAM_STATS_COLUMNS,
  DATA_START_ROW,
  QUALIFICATION,
  CACHE_CONFIG
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

    const fullRange = range ? `${sheetName}!${range}` : sheetName;
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

    const fullRange = `${sheetName}!${range}`;
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

  async getAllPlayerNames() {
    const data = await this.getSheetData(SHEET_NAMES.PLAYER_DATA, `A${DATA_START_ROW}:B`);
    return data
      .filter(row => row[0] && row[0].trim())
      .map(row => ({
        name: row[0].trim(),
        team: row[1]?.trim() || 'Unknown'
      }));
  }

  async getAllTeamNames() {
    const data = await this.getSheetData(SHEET_NAMES.TEAM_DATA, `A${DATA_START_ROW}:B`);
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
   * @returns {Promise<Object|null>} Player stats object with hitting, pitching, and fielding data, or null if not found
   * @description
   * - Performs parallel reads from three stat sheets (P1: Performance)
   * - Returns unified player object with all stats
   * - Missing stats default to '0'
   */
  async getPlayerStats(playerName) {
    if (!playerName) {
      return null;
    }

    const normalizedName = playerName.trim().toLowerCase();

    const [hittingData, pitchingData, fieldingData] = await Promise.all([
      this.getSheetData(SHEET_NAMES.HITTING),
      this.getSheetData(SHEET_NAMES.PITCHING),
      this.getSheetData(SHEET_NAMES.FIELDING)
    ]);

    const hittingRow = hittingData
      .slice(1)
      .find(row => row[HITTING_COLUMNS.PLAYER_NAME]?.toLowerCase() === normalizedName);

    const pitchingRow = pitchingData
      .slice(1)
      .find(row => row[PITCHING_COLUMNS.PLAYER_NAME]?.toLowerCase() === normalizedName);

    const fieldingRow = fieldingData
      .slice(1)
      .find(row => row[FIELDING_COLUMNS.PLAYER_NAME]?.toLowerCase() === normalizedName);

    if (!hittingRow && !pitchingRow && !fieldingRow) {
      return null;
    }

    const getValue = (row, index) => row?.[index] || '0';

    return {
      name: hittingRow?.[HITTING_COLUMNS.PLAYER_NAME] ||
            pitchingRow?.[PITCHING_COLUMNS.PLAYER_NAME] ||
            fieldingRow?.[FIELDING_COLUMNS.PLAYER_NAME],
      team: hittingRow?.[HITTING_COLUMNS.TEAM] ||
            pitchingRow?.[PITCHING_COLUMNS.TEAM] ||
            fieldingRow?.[FIELDING_COLUMNS.TEAM],
      hitting: {
        gp: getValue(hittingRow, HITTING_COLUMNS.GP),
        ab: getValue(hittingRow, HITTING_COLUMNS.AB),
        h: getValue(hittingRow, HITTING_COLUMNS.H),
        hr: getValue(hittingRow, HITTING_COLUMNS.HR),
        rbi: getValue(hittingRow, HITTING_COLUMNS.RBI),
        bb: getValue(hittingRow, HITTING_COLUMNS.BB),
        k: getValue(hittingRow, HITTING_COLUMNS.K),
        rob: getValue(hittingRow, HITTING_COLUMNS.ROB),
        dp: getValue(hittingRow, HITTING_COLUMNS.DP),
        tb: getValue(hittingRow, HITTING_COLUMNS.TB),
        avg: getValue(hittingRow, HITTING_COLUMNS.AVG),
        obp: getValue(hittingRow, HITTING_COLUMNS.OBP),
        slg: getValue(hittingRow, HITTING_COLUMNS.SLG),
        ops: getValue(hittingRow, HITTING_COLUMNS.OPS)
      },
      pitching: {
        gp: getValue(pitchingRow, PITCHING_COLUMNS.GP),
        w: getValue(pitchingRow, PITCHING_COLUMNS.W),
        l: getValue(pitchingRow, PITCHING_COLUMNS.L),
        sv: getValue(pitchingRow, PITCHING_COLUMNS.SV),
        era: getValue(pitchingRow, PITCHING_COLUMNS.ERA),
        ip: getValue(pitchingRow, PITCHING_COLUMNS.IP),
        bf: getValue(pitchingRow, PITCHING_COLUMNS.BF),
        h: getValue(pitchingRow, PITCHING_COLUMNS.H),
        hr: getValue(pitchingRow, PITCHING_COLUMNS.HR),
        r: getValue(pitchingRow, PITCHING_COLUMNS.R),
        bb: getValue(pitchingRow, PITCHING_COLUMNS.BB),
        k: getValue(pitchingRow, PITCHING_COLUMNS.K),
        baa: getValue(pitchingRow, PITCHING_COLUMNS.BAA),
        whip: getValue(pitchingRow, PITCHING_COLUMNS.WHIP)
      },
      fielding: {
        gp: getValue(fieldingRow, FIELDING_COLUMNS.GP),
        np: getValue(fieldingRow, FIELDING_COLUMNS.NP),
        e: getValue(fieldingRow, FIELDING_COLUMNS.E),
        sb: getValue(fieldingRow, FIELDING_COLUMNS.SB)
      }
    };
  }

  async getTeamStats(teamName) {
    if (!teamName) {
      return null;
    }

    const normalizedName = teamName.trim().toLowerCase();

    // Fetch both Team Data and Rankings to get Runs Scored
    const [teamData, rankingsData] = await Promise.all([
      this.getSheetData(SHEET_NAMES.TEAM_DATA),
      this.getSheetData(SHEET_NAMES.RANKINGS, 'A2:H')
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

    // Get Runs Scored from Rankings sheet (column F, index 5)
    const rankingsRow = rankingsData.find(row => row[1]?.toLowerCase().trim() === normalizedName);
    const runsScored = rankingsRow ? (parseFloat(rankingsRow[5]) || 0) : 0;

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

  async getStandings() {
    // Rankings sheet structure: Row 1 = Title, Row 2 = Empty, Row 3 = Headers, Row 4+ = Data
    // Columns: Rank, Team, W, L, Win%, RS, RA, Diff
    const data = await this.getSheetData(SHEET_NAMES.RANKINGS, 'A4:H');
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

  async getLeagueLeaders(category, stat) {
    const [hittingData, pitchingData, fieldingData, playerData, teamData] = await Promise.all([
      this.getSheetData(SHEET_NAMES.HITTING),
      this.getSheetData(SHEET_NAMES.PITCHING),
      this.getSheetData(SHEET_NAMES.FIELDING),
      this.getSheetData(SHEET_NAMES.PLAYER_DATA, `A${DATA_START_ROW}:B`),
      this.getSheetData(SHEET_NAMES.TEAM_DATA, `A${DATA_START_ROW}:C`)
    ]);

    const leaders = [];

    // Create team GP map
    const teamGPMap = {};
    teamData.forEach(row => {
      const teamName = row[0]?.trim();
      const gp = parseFloat(row[2]) || 0;
      if (teamName) teamGPMap[teamName] = gp;
    });

    if (category === 'batting') {
      hittingData.slice(1).forEach(row => {
        const playerName = row[HITTING_COLUMNS.PLAYER_NAME];
        const team = row[HITTING_COLUMNS.TEAM];
        if (!playerName || !team) return;

        const teamGP = teamGPMap[team] || 0;
        const ab = parseFloat(row[HITTING_COLUMNS.AB]) || 0;
        const h = parseFloat(row[HITTING_COLUMNS.H]) || 0;
        const hr = parseFloat(row[HITTING_COLUMNS.HR]) || 0;
        const rbi = parseFloat(row[HITTING_COLUMNS.RBI]) || 0;
        const bb = parseFloat(row[HITTING_COLUMNS.BB]) || 0;
        const tb = parseFloat(row[HITTING_COLUMNS.TB]) || 0;

        const qualifyingAB = teamGP * QUALIFICATION.MIN_AB_MULTIPLIER;

        let value = 0;
        let qualified = true;

        switch (stat) {
          case 'obp':
            value = (ab + bb) > 0 ? (h + bb) / (ab + bb) : 0;
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
            value = ab > 0 ? tb / ab : 0;
            qualified = ab >= qualifyingAB;
            break;
          case 'ops':
            const obp = (ab + bb) > 0 ? (h + bb) / (ab + bb) : 0;
            const slg = ab > 0 ? tb / ab : 0;
            value = obp + slg;
            qualified = ab >= qualifyingAB;
            break;
        }

        if (qualified && value > 0) {
          leaders.push({ name: playerName, team, value });
        }
      });
    } else if (category === 'pitching') {
      pitchingData.slice(1).forEach(row => {
        const playerName = row[PITCHING_COLUMNS.PLAYER_NAME];
        const team = row[PITCHING_COLUMNS.TEAM];
        if (!playerName || !team) return;

        const teamGP = teamGPMap[team] || 0;
        const ip = parseFloat(row[PITCHING_COLUMNS.IP]) || 0;
        const bf = parseFloat(row[PITCHING_COLUMNS.BF]) || 0;
        const h = parseFloat(row[PITCHING_COLUMNS.H]) || 0;
        const r = parseFloat(row[PITCHING_COLUMNS.R]) || 0;
        const bb = parseFloat(row[PITCHING_COLUMNS.BB]) || 0;
        const w = parseFloat(row[PITCHING_COLUMNS.W]) || 0;
        const l = parseFloat(row[PITCHING_COLUMNS.L]) || 0;
        const sv = parseFloat(row[PITCHING_COLUMNS.SV]) || 0;

        const qualifyingIP = teamGP * QUALIFICATION.MIN_IP_MULTIPLIER;

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
            value = ip > 0 ? (r * 9) / ip : 0;
            qualified = ip >= qualifyingIP;
            break;
          case 'whip':
            value = ip > 0 ? (h + bb) / ip : 0;
            qualified = ip >= qualifyingIP;
            break;
          case 'baa':
            value = bf > 0 ? h / bf : 0;
            qualified = ip >= qualifyingIP;
            break;
        }

        if (qualified && value > 0) {
          leaders.push({ name: playerName, team, value });
        }
      });
    } else if (category === 'fielding') {
      fieldingData.slice(1).forEach(row => {
        const playerName = row[FIELDING_COLUMNS.PLAYER_NAME];
        const team = row[FIELDING_COLUMNS.TEAM];
        if (!playerName || !team) return;

        const np = parseFloat(row[FIELDING_COLUMNS.NP]) || 0;
        const e = parseFloat(row[FIELDING_COLUMNS.E]) || 0;
        const sb = parseFloat(row[FIELDING_COLUMNS.SB]) || 0;

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
      });
    }

    // Sort (ERA, WHIP, BAA are lower is better)
    const lowerIsBetter = ['era', 'whip', 'baa'].includes(stat);
    leaders.sort((a, b) => lowerIsBetter ? a.value - b.value : b.value - a.value);

    // Return top 5
    return leaders.slice(0, 5);
  }

  async getTeamRoster(teamName) {
    if (!teamName) {
      return null;
    }

    const normalizedName = teamName.trim().toLowerCase();
    const [playerData, teamData] = await Promise.all([
      this.getSheetData(SHEET_NAMES.PLAYER_DATA, `A${DATA_START_ROW}:B`),
      this.getSheetData(SHEET_NAMES.TEAM_DATA, `A${DATA_START_ROW}:B`)
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

  async getScheduleData(filter) {
    // Read Season Schedule sheet (master schedule) and Discord Schedule column J (completed games with hyperlinks)
    // NOTE: Column J has headers ("Week 1", "Completed Games") interspersed with game results
    // We need to filter out headers and only match actual game result rows
    const [scheduleData, leagueScheduleRawData] = await Promise.all([
      this.getSheetData(SHEET_NAMES.SEASON_SCHEDULE, 'A2:C'), // Week, Home Team, Away Team
      this.getSheetDataWithHyperlinks(SHEET_NAMES.LEAGUE_SCHEDULE, 'J:J') // ONLY column J (completed games with hyperlinks)
    ]);

    // Parse Discord Schedule to extract completed games with their week numbers
    // Track week headers as we go through the data
    const completedGames = [];
    let parsedWeekNumber = null;

    leagueScheduleRawData.forEach(row => {
      const cellData = row[0];
      if (!cellData || !cellData.text) return;

      const text = cellData.text.trim();

      // Check if this is a week header (e.g., "Week 1", "Week 2")
      const weekMatch = text.match(/^Week\s+(\d+)$/i);
      if (weekMatch) {
        parsedWeekNumber = parseInt(weekMatch[1]);
        return;
      }

      // Check if this is a game result (contains "||")
      if (text.includes('||')) {
        completedGames.push({
          week: parsedWeekNumber,
          result: text,
          hyperlink: cellData.hyperlink || null
        });
      }
    });

    logger.debug('SheetsService', `Read ${scheduleData.length} games from Season Schedule, found ${completedGames.length} completed games in Discord Schedule`);

    // Build schedule with game status - match by week + team names
    const games = scheduleData
      .filter(row => row[0] && row[1] && row[2]) // Has week, home, away
      .map((row, index) => {
        const week = parseInt(row[0]);
        const homeTeam = row[1].trim();
        const awayTeam = row[2].trim();

        let played = false;
        let result = null;
        let boxScoreUrl = null;

        // Find a completed game that matches this week AND teams
        const matchingGame = completedGames.find(game =>
          game.week === week &&
          game.result.includes(homeTeam) &&
          game.result.includes(awayTeam)
        );

        if (matchingGame) {
          played = true;
          result = matchingGame.result;
          boxScoreUrl = matchingGame.hyperlink;

          // Debug first few matches
          if (index < 3) {
            logger.debug('SheetsService', `Match ${index}: Week ${week} - ${homeTeam} vs ${awayTeam} = ${result.substring(0, 40)}`);
          }
        } else {
          if (index < 3) {
            logger.debug('SheetsService', `No match ${index}: Week ${week} - ${homeTeam} vs ${awayTeam}`);
          }
        }

        return {
          week,
          homeTeam,
          awayTeam,
          played,
          result,
          boxScoreUrl
        };
      });

    // Determine current week (max completed week + 1)
    const maxCompletedWeek = Math.max(0, ...games.filter(g => g.played).map(g => g.week));
    const currentWeek = maxCompletedWeek + 1;

    // Filter based on request type
    switch (filter.type) {
      case 'recent':
        // Last completed week
        return games.filter(g => g.played && g.week === maxCompletedWeek);

      case 'current':
        // Current week (may have some completed games)
        return games.filter(g => g.week === currentWeek);

      case 'upcoming':
        // Next week
        return games.filter(g => g.week === currentWeek + 1);

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

      case 'all':
        // All games (used for determining completed weeks)
        return games;

      default:
        return [];
    }
  }

  async getHeadToHeadData(team1Name, team2Name) {
    // Get all completed games from Discord Schedule
    const leagueScheduleRawData = await this.getSheetDataWithHyperlinks(SHEET_NAMES.LEAGUE_SCHEDULE, 'J:J');

    const team1Lower = team1Name.toLowerCase().trim();
    const team2Lower = team2Name.toLowerCase().trim();

    // Parse Discord Schedule to find games between these two teams
    const matchupGames = [];
    let currentWeek = null;

    leagueScheduleRawData.forEach(row => {
      const cellData = row[0];
      if (!cellData || !cellData.text) return;
      const text = cellData.text.trim();

      // Track week headers
      const weekMatch = text.match(/^Week\s+(\d+)$/i);
      if (weekMatch) {
        currentWeek = parseInt(weekMatch[1]);
        return;
      }

      // Check if this game involves both teams
      if (text.includes('||')) {
        const textLower = text.toLowerCase();
        if (textLower.includes(team1Lower) && textLower.includes(team2Lower)) {
          // Parse the result: "Team1: Score1 || Team2: Score2"
          const parts = text.split('||').map(p => p.trim());
          if (parts.length === 2) {
            const team1Result = parts[0].split(':').map(p => p.trim());
            const team2Result = parts[1].split(':').map(p => p.trim());

            if (team1Result.length === 2 && team2Result.length === 2) {
              const firstTeam = team1Result[0];
              const firstScore = parseInt(team1Result[1]);
              const secondTeam = team2Result[0];
              const secondScore = parseInt(team2Result[1]);

              matchupGames.push({
                week: currentWeek,
                team1: firstTeam,
                score1: firstScore,
                team2: secondTeam,
                score2: secondScore,
                boxScoreUrl: cellData.hyperlink || null,
                winner: firstScore > secondScore ? firstTeam : secondTeam
              });
            }
          }
        }
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

  async getImageUrl(name, type) {
    // Read Image URLs sheet
    const data = await this.getSheetData('Image URLs', 'A2:C'); // Name, Type, URL

    logger.debug('SheetsService', `Looking for image: name="${name}", type="${type}"`);
    logger.debug('SheetsService', `Total rows in Image URLs: ${data.length}`);
    if (data.length > 0) {
      logger.debug('SheetsService', `First row sample: ${JSON.stringify(data[0])}`);
    }

    const normalizedName = name.trim().toLowerCase();

    // Find exact match
    const match = data.find(row => {
      const rowName = row[0]?.toLowerCase().trim();
      const rowType = row[1]?.toLowerCase().trim();
      const isMatch = rowName === normalizedName && rowType === type;
      if (isMatch) {
        logger.debug('SheetsService', `MATCH FOUND: [${row[0]}] [${row[1]}] [${row[2]}]`);
      }
      return isMatch;
    });

    if (match && match[2]) {
      const url = match[2].trim();
      logger.debug('SheetsService', `Returning image URL: ${url}\n`);
      return url;
    }

    // Fall back to default for this type
    const defaultMatch = data.find(row =>
      row[0]?.toLowerCase().trim() === `default ${type}` &&
      row[1]?.toLowerCase().trim() === type
    );

    if (defaultMatch && defaultMatch[2]) {
      const url = defaultMatch[2].trim();
      logger.debug('SheetsService', `Using default image for ${type}: ${url}\n`);
      return url;
    }

    logger.debug('SheetsService', `No image found for ${name} (${type})\n`);
    return null;
  }
}

export default new SheetsService();

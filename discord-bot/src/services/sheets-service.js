import { google } from 'googleapis';
import {
  SHEET_NAMES,
  HITTING_COLUMNS,
  PITCHING_COLUMNS,
  FIELDING_COLUMNS,
  TEAM_STATS_COLUMNS,
  DATA_START_ROW
} from '../config/league-config.js';

class SheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.cache = new Map();
    this.cacheTTL = parseInt(process.env.CACHE_TTL || '300') * 1000;
    this.lastCacheUpdate = 0;
  }

  async initialize() {
    if (this.sheets) return;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
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
      console.error(`Error fetching data from ${fullRange}:`, error.message);
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

  async getPlayerStats(playerName) {
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
    const normalizedName = teamName.trim().toLowerCase();
    const data = await this.getSheetData(SHEET_NAMES.TEAM_DATA);

    const teamRow = data
      .slice(1)
      .find(row => row[TEAM_STATS_COLUMNS.TEAM_NAME]?.toLowerCase() === normalizedName);

    if (!teamRow) {
      return null;
    }

    const getValue = (index) => teamRow[index] || '0';

    const hitting = {};
    for (let i = 0; i < TEAM_STATS_COLUMNS.HITTING_NUM_COLS; i++) {
      hitting[`stat${i}`] = getValue(TEAM_STATS_COLUMNS.HITTING_START + i);
    }

    const pitching = {};
    for (let i = 0; i < TEAM_STATS_COLUMNS.PITCHING_NUM_COLS; i++) {
      pitching[`stat${i}`] = getValue(TEAM_STATS_COLUMNS.PITCHING_START + i);
    }

    const fielding = {};
    for (let i = 0; i < TEAM_STATS_COLUMNS.FIELDING_NUM_COLS; i++) {
      fielding[`stat${i}`] = getValue(TEAM_STATS_COLUMNS.FIELDING_START + i);
    }

    return {
      name: teamRow[TEAM_STATS_COLUMNS.TEAM_NAME],
      captain: getValue(TEAM_STATS_COLUMNS.CAPTAIN),
      gp: getValue(TEAM_STATS_COLUMNS.GP),
      wins: getValue(TEAM_STATS_COLUMNS.WINS),
      losses: getValue(TEAM_STATS_COLUMNS.LOSSES),
      hitting,
      pitching,
      fielding
    };
  }

  async getStandings() {
    const data = await this.getSheetData(SHEET_NAMES.RANKINGS, 'A2:G');
    return data
      .filter(row => row[0] && row[0].trim())
      .map((row, index) => ({
        rank: index + 1,
        team: row[0]?.trim() || '',
        wins: row[1] || '0',
        losses: row[2] || '0',
        winPct: row[3] || '.000',
        gamesBack: row[4] || '-',
        runDiff: row[5] || '0'
      }));
  }
}

export default new SheetsService();

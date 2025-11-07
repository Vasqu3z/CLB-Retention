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

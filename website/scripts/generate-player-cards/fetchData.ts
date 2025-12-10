/**
 * Data Fetching Module for Player Card Generation
 * Pulls player attributes and registry data from Google Sheets
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from website/.env.local
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const sheets = google.sheets('v4');

// Sheet configuration (matching config/sheets.ts)
const PLAYER_REGISTRY_SHEET = {
  NAME: "'📋 Player Registry'",
  DATA_START_ROW: 2,
  MAX_ROWS: 100,
  START_COL: 'A',
  END_COL: 'F',
  COLUMNS: {
    DATABASE_ID: 0,
    PLAYER_NAME: 1,
    TEAM: 2,
    STATUS: 3,
    IMAGE_URL: 4,
    HAS_ATTRIBUTES: 5,
  },
};

const DATABASE_ATTRIBUTES_SHEET = {
  NAME: "'🎮 Attributes'",
  DATA_START_ROW: 2,
  MAX_ROWS: 500,
  START_COL: 'A',
  END_COL: 'AD',
  COLUMNS: {
    NAME: 0,
    CHARACTER_CLASS: 1,
    CAPTAIN: 2,
    MII: 3,
    MII_COLOR: 4,
    ARM_SIDE: 5,
    BATTING_SIDE: 6,
    WEIGHT: 7,
    ABILITY: 8,
    PITCHING_OVERALL: 9,
    BATTING_OVERALL: 10,
    FIELDING_OVERALL: 11,
    SPEED_OVERALL: 12,
    STAR_SWING: 13,
    HIT_CURVE: 14,
    HITTING_TRAJECTORY: 15,
    SLAP_HIT_CONTACT: 16,
    CHARGE_HIT_CONTACT: 17,
    SLAP_HIT_POWER: 18,
    CHARGE_HIT_POWER: 19,
    SPEED: 20,
    BUNTING: 21,
    FIELDING: 22,
    THROWING_SPEED: 23,
    PRE_CHARGE: 24,
    STAR_PITCH: 25,
    FASTBALL_SPEED: 26,
    CURVEBALL_SPEED: 27,
    CURVE: 28,
    STAMINA: 29,
  },
};

// Visible player statuses
const VISIBLE_STATUSES = ['Active', 'Free Agent'];

// ===== INTERFACES =====

export interface PlayerRegistryEntry {
  playerName: string;
  team: string;
  status: string;
  databaseId: string;
  imageUrl: string;
  hasAttributes: string;
}

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
  pitchingOverall: number;
  battingOverall: number;
  fieldingOverall: number;
  speedOverall: number;
  starSwing: string;
  hitCurve: number;
  hittingTrajectory: string;
  slapHitContact: number;
  chargeHitContact: number;
  slapHitPower: number;
  chargeHitPower: number;
  speed: number;
  bunting: number;
  fielding: number;
  throwingSpeed: number;
  preCharge: string;
  starPitch: string;
  fastballSpeed: number;
  curveballSpeed: number;
  curve: number;
  stamina: number;
}

export interface PlayerCardInput {
  name: string;
  imageUrl: string;
  attributes: PlayerAttributes;
}

// ===== AUTH =====

let authClient: any = null;

async function getAuthClient() {
  if (authClient) {
    return authClient;
  }

  const credentials = process.env.GOOGLE_CREDENTIALS;
  if (!credentials) {
    throw new Error('GOOGLE_CREDENTIALS environment variable not set');
  }

  const parsedCredentials = JSON.parse(credentials);
  const auth = new google.auth.GoogleAuth({
    credentials: parsedCredentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  authClient = await auth.getClient();
  return authClient;
}

// ===== DATA FETCHING =====

function buildRange(sheetName: string, startRow: number, maxRows: number, startCol: string, endCol: string): string {
  return `${sheetName}!${startCol}${startRow}:${endCol}${maxRows}`;
}

async function getSheetData(range: string, spreadsheetId?: string): Promise<any[][]> {
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
}

/**
 * Fetch all players from the registry
 */
export async function fetchPlayerRegistry(): Promise<PlayerRegistryEntry[]> {
  console.log('Fetching player registry...');

  const range = buildRange(
    PLAYER_REGISTRY_SHEET.NAME,
    PLAYER_REGISTRY_SHEET.DATA_START_ROW,
    PLAYER_REGISTRY_SHEET.MAX_ROWS,
    PLAYER_REGISTRY_SHEET.START_COL,
    PLAYER_REGISTRY_SHEET.END_COL
  );

  const data = await getSheetData(range);
  const COLS = PLAYER_REGISTRY_SHEET.COLUMNS;

  const players = data
    .filter((row) => row[COLS.PLAYER_NAME])
    .map((row) => ({
      playerName: String(row[COLS.PLAYER_NAME] || '').trim(),
      team: String(row[COLS.TEAM] || '').trim(),
      status: String(row[COLS.STATUS] || '').trim(),
      databaseId: String(row[COLS.DATABASE_ID] || '').trim(),
      imageUrl: String(row[COLS.IMAGE_URL] || '').trim(),
      hasAttributes: String(row[COLS.HAS_ATTRIBUTES] || '').trim(),
    }));

  console.log(`Found ${players.length} players in registry`);
  return players;
}

/**
 * Fetch all player attributes
 */
export async function fetchAllPlayerAttributes(): Promise<Map<string, PlayerAttributes>> {
  console.log('Fetching player attributes...');

  const range = buildRange(
    DATABASE_ATTRIBUTES_SHEET.NAME,
    DATABASE_ATTRIBUTES_SHEET.DATA_START_ROW,
    DATABASE_ATTRIBUTES_SHEET.MAX_ROWS,
    DATABASE_ATTRIBUTES_SHEET.START_COL,
    DATABASE_ATTRIBUTES_SHEET.END_COL
  );

  const dbId = process.env.DATABASE_SPREADSHEET_ID || process.env.SHEETS_SPREADSHEET_ID;
  const data = await getSheetData(range, dbId);
  const COLS = DATABASE_ATTRIBUTES_SHEET.COLUMNS;

  const attributeMap = new Map<string, PlayerAttributes>();

  for (const row of data) {
    const name = String(row[COLS.NAME] || '').trim();
    if (!name) continue;

    attributeMap.set(name, {
      name,
      characterClass: String(row[COLS.CHARACTER_CLASS] || ''),
      captain: String(row[COLS.CAPTAIN] || ''),
      mii: String(row[COLS.MII] || ''),
      miiColor: String(row[COLS.MII_COLOR] || ''),
      armSide: String(row[COLS.ARM_SIDE] || ''),
      battingSide: String(row[COLS.BATTING_SIDE] || ''),
      weight: Number(row[COLS.WEIGHT]) || 0,
      ability: String(row[COLS.ABILITY] || ''),
      pitchingOverall: Number(row[COLS.PITCHING_OVERALL]) || 0,
      battingOverall: Number(row[COLS.BATTING_OVERALL]) || 0,
      fieldingOverall: Number(row[COLS.FIELDING_OVERALL]) || 0,
      speedOverall: Number(row[COLS.SPEED_OVERALL]) || 0,
      starSwing: String(row[COLS.STAR_SWING] || ''),
      hitCurve: Number(row[COLS.HIT_CURVE]) || 0,
      hittingTrajectory: String(row[COLS.HITTING_TRAJECTORY] || ''),
      slapHitContact: Number(row[COLS.SLAP_HIT_CONTACT]) || 0,
      chargeHitContact: Number(row[COLS.CHARGE_HIT_CONTACT]) || 0,
      slapHitPower: Number(row[COLS.SLAP_HIT_POWER]) || 0,
      chargeHitPower: Number(row[COLS.CHARGE_HIT_POWER]) || 0,
      speed: Number(row[COLS.SPEED]) || 0,
      bunting: Number(row[COLS.BUNTING]) || 0,
      fielding: Number(row[COLS.FIELDING]) || 0,
      throwingSpeed: Number(row[COLS.THROWING_SPEED]) || 0,
      preCharge: String(row[COLS.PRE_CHARGE] || ''),
      starPitch: String(row[COLS.STAR_PITCH] || ''),
      fastballSpeed: Number(row[COLS.FASTBALL_SPEED]) || 0,
      curveballSpeed: Number(row[COLS.CURVEBALL_SPEED]) || 0,
      curve: Number(row[COLS.CURVE]) || 0,
      stamina: Number(row[COLS.STAMINA]) || 0,
    });
  }

  console.log(`Found attributes for ${attributeMap.size} players`);
  return attributeMap;
}

/**
 * Get all players with their attributes for card generation
 * Filters to only visible players with attributes
 */
export async function getPlayersForCardGeneration(): Promise<PlayerCardInput[]> {
  const [registry, attributeMap] = await Promise.all([
    fetchPlayerRegistry(),
    fetchAllPlayerAttributes(),
  ]);

  const players: PlayerCardInput[] = [];

  for (const entry of registry) {
    // Only include visible players with attributes
    if (!VISIBLE_STATUSES.includes(entry.status)) {
      continue;
    }

    // Try to find attributes by player name or database ID
    let attributes = attributeMap.get(entry.playerName);
    if (!attributes && entry.databaseId) {
      attributes = attributeMap.get(entry.databaseId);
    }

    if (!attributes) {
      console.warn(`No attributes found for player: ${entry.playerName}`);
      continue;
    }

    players.push({
      name: entry.playerName,
      imageUrl: entry.imageUrl,
      attributes,
    });
  }

  console.log(`${players.length} players ready for card generation`);
  return players;
}

/**
 * Load and encode the league logo as base64
 */
export function loadLeagueLogo(): string | undefined {
  const logoPath = path.join(__dirname, '../../public/CLB II.png');

  if (!fs.existsSync(logoPath)) {
    console.warn('League logo not found at:', logoPath);
    return undefined;
  }

  const logoBuffer = fs.readFileSync(logoPath);
  return `data:image/png;base64,${logoBuffer.toString('base64')}`;
}

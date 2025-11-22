// Google Sheets Configuration for Comets League Baseball
// Centralizes all sheet names, ranges, column indices, and thresholds

/**
 * Sheet configuration for standings data
 */
export const STANDINGS_SHEET = {
  NAME: "'🥇 Standings'",
  DATA_START_ROW: 4, // Row 1 = title, 2 = blank, 3 = headers
  DATA_END_ROW: 11,  // 8 teams
  START_COL: 'A',
  END_COL: 'H',
  NOTES_COL: 'B',    // Column for H2H tooltips

  // Column indices (0-based)
  COLUMNS: {
    RANK: 0,          // A
    TEAM: 1,          // B
    WINS: 2,          // C
    LOSSES: 3,        // D
    WIN_PCT: 4,       // E
    RUNS_SCORED: 5,   // F
    RUNS_ALLOWED: 6,  // G
    RUN_DIFF: 7,      // H
  },
} as const;

/**
 * Sheet configuration for player statistics
 */
export const PLAYER_STATS_SHEET = {
  REGULAR_SEASON: "'🧮 Players'",
  PLAYOFFS: "'🏆 Players'",
  DATA_START_ROW: 2,
  MAX_ROWS: 100,
  START_COL: 'A',
  END_COL: 'Z',

  // Column indices (0-based)
  COLUMNS: {
    NAME: 0,          // A
    TEAM: 1,          // B
    GP: 2,            // C
    // Hitting stats (D-L, indices 3-11)
    AB: 3,            // D
    H: 4,             // E
    HR: 5,            // F
    RBI: 6,           // G
    BB: 7,            // H
    K: 8,             // I
    ROB: 9,           // J (Runners on Base performance)
    DP: 10,           // K (Double Plays)
    TB: 11,           // L (Total Bases)
    // W/L/S (M-O, indices 12-14)
    W: 12,            // M
    L: 13,            // N
    SV: 14,           // O
    // Pitching stats (P-V, indices 15-21)
    IP: 15,           // P
    BF: 16,           // Q (Batters Faced)
    H_ALLOWED: 17,    // R
    HR_ALLOWED: 18,   // S
    R: 19,            // T (Runs)
    BB_ALLOWED: 20,   // U
    K_PITCHED: 21,    // V
    // Fielding stats (W-Z, indices 22-25)
    NP: 22,           // W (Nice Plays)
    E: 23,            // X (Errors)
    SB: 24,           // Y (Stolen Bases)
    CS: 25,           // Z (Caught Stealing)
  },
} as const;

/**
 * Sheet configuration for team statistics
 */
export const TEAM_STATS_SHEET = {
  REGULAR_SEASON: "'🧮 Teams'",
  PLAYOFFS: "'🏆 Teams'",
  DATA_START_ROW: 2,
  MAX_ROWS: 20,
  START_COL: 'A',
  END_COL: 'Z',

  // Column indices (0-based)
  COLUMNS: {
    NAME: 0,          // A
    CAPTAIN: 1,       // B
    GP: 2,            // C
    WINS: 3,          // D
    LOSSES: 4,        // E
    // Hitting stats (F-N, indices 5-13)
    AB: 5,            // F
    H: 6,             // G
    HR: 7,            // H
    RBI: 8,           // I
    BB: 9,            // J
    K: 10,            // K
    ROB: 11,          // L
    DP: 12,           // M
    TB: 13,           // N
    // Pitching stats (O-V, indices 14-21)
    IP: 14,           // O
    BF: 15,           // P
    H_ALLOWED: 16,    // Q
    HR_ALLOWED: 17,   // R
    R: 18,            // S
    BB_ALLOWED: 19,   // T
    K_PITCHED: 20,    // U
    SV: 21,           // V
    // Fielding stats (W-Z, indices 22-25)
    NP: 22,           // W
    E: 23,            // X
    SB: 24,           // Y
    CS: 25,           // Z
  },
} as const;

/**
 * Sheet configuration for schedule data
 */
export const SCHEDULE_SHEET = {
  REGULAR_SEASON: "'📅 Schedule'",
  PLAYOFFS: "'🏆 Schedule'",
  DATA_START_ROW: 2,
  MAX_ROWS: 100,
  START_COL: 'A',
  END_COL: 'L',

  // Column indices (0-based)
  COLUMNS: {
    WEEK: 0,              // A (or playoff code)
    AWAY_TEAM: 1,         // B
    HOME_TEAM: 2,         // C
    AWAY_SCORE: 3,        // D
    HOME_SCORE: 4,        // E
    WINNER: 5,            // F
    LOSER: 6,             // G
    MVP: 7,               // H
    WINNING_PITCHER: 8,   // I
    LOSING_PITCHER: 9,    // J
    SAVE_PITCHER: 10,     // K
    BOX_SCORE_URL: 11,    // L
  },
} as const;

/**
 * League qualification thresholds for rate stats
 */
export const QUALIFICATION_THRESHOLDS = {
  // Batting qualification (at-bats required for AVG/OBP/SLG)
  BATTING: {
    AB_MULTIPLIER: 2.1,        // Multiply by average team GP
    PLAYOFF_MINIMUM_AB: 5,     // Override for playoffs
  },

  // Pitching qualification (innings pitched required for ERA/WHIP/BAA)
  PITCHING: {
    IP_MULTIPLIER: 1.0,        // Multiply by average team GP
    PLAYOFF_MINIMUM_IP: 2,     // Override for playoffs
  },
} as const;

/**
 * Playoff series configuration
 */
export const PLAYOFF_SERIES = {
  // Wins required to clinch each series format
  BEST_OF_3_WINS_REQUIRED: 2,   // First to 2 wins
  BEST_OF_5_WINS_REQUIRED: 3,   // First to 3 wins
  BEST_OF_7_WINS_REQUIRED: 4,   // First to 4 wins
} as const;

/**
 * Display configuration for leaders/rankings
 */
export const DISPLAY_CONFIG = {
  LEADERS_COUNT: 5,  // Number of leaders to show per category
} as const;

/**
 * Player Registry sheet configuration (Phase 1 foundation)
 */
export const PLAYER_REGISTRY_SHEET = {
  NAME: "'📋 Player Registry'",
  DATA_START_ROW: 2,
  MAX_ROWS: 100,
  START_COL: 'A',
  END_COL: 'F',

  // Column indices (0-based)
  COLUMNS: {
    DATABASE_ID: 0,      // A
    PLAYER_NAME: 1,      // B
    TEAM: 2,             // C
    STATUS: 3,           // D
    IMAGE_URL: 4,        // E
    HAS_ATTRIBUTES: 5,   // F (formula)
  },
} as const;

/**
 * Team Registry sheet configuration (Phase 1 foundation)
 */
export const TEAM_REGISTRY_SHEET = {
  NAME: "'📋 Team Registry'",
  DATA_START_ROW: 2,
  MAX_ROWS: 20,
  START_COL: 'A',
  END_COL: 'H',

  // Column indices (0-based)
  COLUMNS: {
    TEAM_NAME: 0,        // A
    CAPTAIN: 1,          // B
    ABBR: 2,             // C
    STATUS: 3,           // D
    COLOR: 4,            // E
    LOGO_URL: 5,         // F
    EMBLEM_URL: 6,       // G
    DISCORD_ROLE_ID: 7,  // H
  },
} as const;

/**
 * Player Attributes sheet configuration (consolidated into League Hub)
 * Previously in separate Database spreadsheet, now in main League Hub
 */
export const DATABASE_ATTRIBUTES_SHEET = {
  NAME: "'🎮 Attributes'",
  DATA_START_ROW: 2,
  MAX_ROWS: 500,
  START_COL: 'A',
  END_COL: 'AD',

  // Column indices (0-based) - matches DatabaseConfig.js
  COLUMNS: {
    NAME: 0,                // A
    CHARACTER_CLASS: 1,     // B
    CAPTAIN: 2,             // C
    MII: 3,                 // D
    MII_COLOR: 4,           // E
    ARM_SIDE: 5,            // F
    BATTING_SIDE: 6,        // G
    WEIGHT: 7,              // H
    ABILITY: 8,             // I
    PITCHING_OVERALL: 9,    // J
    BATTING_OVERALL: 10,    // K
    FIELDING_OVERALL: 11,   // L
    SPEED_OVERALL: 12,      // M
    STAR_SWING: 13,         // N
    HIT_CURVE: 14,          // O
    HITTING_TRAJECTORY: 15, // P
    SLAP_HIT_CONTACT: 16,   // Q
    CHARGE_HIT_CONTACT: 17, // R
    SLAP_HIT_POWER: 18,     // S
    CHARGE_HIT_POWER: 19,   // T
    SPEED: 20,              // U
    BUNTING: 21,            // V
    FIELDING: 22,           // W
    THROWING_SPEED: 23,     // X
    PRE_CHARGE: 24,         // Y
    STAR_PITCH: 25,         // Z
    FASTBALL_SPEED: 26,     // AA
    CURVEBALL_SPEED: 27,    // AB
    CURVE: 28,              // AC
    STAMINA: 29,            // AD
  },
} as const;

/**
 * Chemistry Lookup sheet configuration (consolidated into League Hub)
 * Previously in separate Database spreadsheet, now in main League Hub
 */
export const CHEMISTRY_LOOKUP_SHEET = {
  NAME: "'🎮 Chemistry'",
  DATA_START_ROW: 2,
  MAX_ROWS: 5000,  // Large range for all chemistry pairs
  START_COL: 'A',
  END_COL: 'C',

  // Column indices (0-based)
  COLUMNS: {
    PLAYER_1: 0,          // A
    PLAYER_2: 1,          // B
    CHEMISTRY_VALUE: 2,   // C
  },

  // Chemistry thresholds
  THRESHOLDS: {
    POSITIVE_MIN: 100,    // Values >= 100 are positive chemistry
    NEGATIVE_MAX: -100,   // Values <= -100 are negative chemistry
  },
} as const;

/**
 * Helper function to build sheet range string
 */
export function buildSheetRange(
  sheetName: string,
  startRow: number,
  endRow: number,
  startCol: string,
  endCol: string
): string {
  return `${sheetName}!${startCol}${startRow}:${endCol}${endRow}`;
}

/**
 * Helper function to build full data range for a sheet
 */
export function buildFullRange(
  sheetName: string,
  startRow: number,
  maxRows: number,
  startCol: string,
  endCol: string
): string {
  return `${sheetName}!${startCol}${startRow}:${endCol}${maxRows}`;
}

/**
 * @file league-config.js
 * @description League configuration and constants for CLB League Hub Discord Bot
 *
 * ⚠️  CRITICAL: Sheet structure is shared with CLB-League-Hub repository
 *
 * Before modifying sheet names or column mappings:
 * 1. Review SHEET_SCHEMA.md for coordination protocol
 * 2. Update SHEET_SCHEMA.md version number
 * 3. Coordinate changes with Apps Script repository
 * 4. Test against updated sheets before deploying
 *
 * Last Schema Sync: 2025-01-10
 * Schema Version: 2.0.0
 *
 * Purpose:
 * - Centralized configuration for sheet names, column mappings, and formatting constants
 * - Provides type-safe access to Google Sheets structure
 * - Eliminates magic numbers throughout the codebase (P2: No Magic Numbers)
 *
 * Key Responsibilities:
 * - Define sheet names and column indices (0-based for consistency with arrays)
 * - Store embed formatting constants (widths, separators, markers)
 * - Define player qualification thresholds for rankings
 * - Configure cache behavior and Discord API limits
 *
 * Data Dependencies:
 * - Google Sheets structure (sheet names and column order must match)
 *
 * Note: Uses 0-based indexing for consistency with JavaScript arrays.
 * Add +1 when converting to Google Sheets column letters (A=1, B=2, etc.)
 */

export const SHEET_NAMES = {
  // v2.0 - Consolidated structure
  PLAYER_DATA: '🧮 Players',        // Single source of truth for all player stats
  TEAM_DATA: '🧮 Teams',            // Team standings and captain info
  SCHEDULE: '📅 Schedule',          // Season schedule with game results (formerly Season Schedule)
  STANDINGS: '🥇 Standings',        // League standings table (formerly 🏆 Rankings)
  IMAGE_URLS: 'Image URLs',         // Player/team/league image URLs

  // Playoff sheets (v2.1)
  PLAYOFF_PLAYER_DATA: '🏆 Players', // Playoff player stats
  PLAYOFF_TEAM_DATA: '🏆 Teams',    // Playoff team stats
  PLAYOFF_SCHEDULE: '🏆 Schedule',  // Playoff schedule and bracket

  // Deprecated (v2.0) - kept for backwards compatibility during migration
  // These will be removed in v2.1
  HITTING: '🧮 Hitting',            // DEPRECATED - use PLAYER_DATA
  PITCHING: '🧮 Pitching',          // DEPRECATED - use PLAYER_DATA
  FIELDING: '🧮 Fielding & Running', // DEPRECATED - use PLAYER_DATA
  RANKINGS: '🏆 Rankings',          // DEPRECATED - renamed to STANDINGS
  SEASON_SCHEDULE: 'Season Schedule', // DEPRECATED - renamed to SCHEDULE
  LEAGUE_SCHEDULE: 'Discord Schedule' // DEPRECATED - use SCHEDULE
};

/**
 * Player Data Sheet Column Mappings (v2.0)
 *
 * Single source of truth containing all player statistics.
 * Columns A-Y (indices 0-24) contain identity and raw stats.
 * Derived stats (AVG, OBP, SLG, OPS, ERA, WHIP, BAA) must be calculated on-the-fly.
 *
 * Structure: Identity (2) | GP (1) | Hitting (9) | WLS (3) | Pitching (7) | Fielding (3)
 * Total: 25 columns (A-Y)
 */
export const PLAYER_DATA_COLUMNS = {
  // Identity
  PLAYER_NAME: 0,   // Column A
  TEAM: 1,          // Column B

  // General
  GP: 2,            // Column C - Games played

  // Hitting (raw stats only - indices 3-11)
  AB: 3,            // Column D - At bats
  H: 4,             // Column E - Hits
  HR: 5,            // Column F - Home runs
  RBI: 6,           // Column G - Runs batted in
  BB: 7,            // Column H - Walks
  K: 8,             // Column I - Strikeouts
  ROB: 9,           // Column J - Hits robbed
  DP: 10,           // Column K - Double plays
  TB: 11,           // Column L - Total bases

  // WLS (Win-Loss-Save record - indices 12-14)
  W: 12,            // Column M - Wins
  L: 13,            // Column N - Losses
  SV: 14,           // Column O - Saves

  // Pitching (raw stats only - indices 15-21)
  IP: 15,           // Column P - Innings pitched
  BF: 16,           // Column Q - Batters faced
  H_ALLOWED: 17,    // Column R - Hits allowed
  HR_ALLOWED: 18,   // Column S - Home runs allowed
  R: 19,            // Column T - Runs allowed
  BB_ALLOWED: 20,   // Column U - Walks allowed
  K_PITCHED: 21,    // Column V - Strikeouts (pitching)

  // Fielding (indices 22-24)
  NP: 22,           // Column W - Nice plays
  E: 23,            // Column X - Errors
  SB: 24            // Column Y - Stolen bases
};

/**
 * Schedule Sheet Column Mappings (v2.0)
 *
 * Formerly "Season Schedule" - now consolidated single schedule sheet.
 * Contains both upcoming games and completed games with scores.
 * Box score URLs are stored as plain strings (NOT HYPERLINK formulas).
 */
export const SCHEDULE_COLUMNS = {
  WEEK: 0,              // Column A - Week number
  AWAY_TEAM: 1,         // Column B - Away team name
  HOME_TEAM: 2,         // Column C - Home team name
  AWAY_SCORE: 3,        // Column D - Away team score (blank if not played)
  HOME_SCORE: 4,        // Column E - Home team score (blank if not played)
  WINNER: 5,            // Column F - Winning team (blank if not played)
  GAME_NUM: 6,          // Column G - Game sheet ID (e.g., "#125")
  GAME_DATE: 7,         // Column H - Date game was played
  GAME_MVP: 8,          // Column I - MVP player name
  HOME_RS: 9,           // Column J - Home runs scored
  AWAY_RS: 10,          // Column K - Away runs scored
  BOX_SCORE_URL: 11     // Column L - Plain URL to box score (NOT HYPERLINK)
};

/**
 * Standings Sheet Column Mappings (v2.0)
 *
 * Formerly "🏆 Rankings" - now simplified to standings table only.
 * League leaders are calculated by website/bot from Player Data.
 */
export const STANDINGS_COLUMNS = {
  RANK: 0,              // Column A - Team rank (e.g., "1", "T-2")
  TEAM: 1,              // Column B - Team name
  W: 2,                 // Column C - Wins
  L: 3,                 // Column D - Losses
  WIN_PCT: 4,           // Column E - Win percentage (".XXX" format)
  RS: 5,                // Column F - Runs scored
  RA: 6,                // Column G - Runs allowed
  DIFF: 7               // Column H - Run differential
};

/**
 * DEPRECATED Column Mappings (v1.0)
 *
 * These are kept for backwards compatibility during migration.
 * Will be removed in v2.1 once all code is migrated to Player Data.
 */
export const HITTING_COLUMNS = {
  PLAYER_NAME: 0,
  TEAM: 1,
  GP: 2,
  AB: 3,
  H: 4,
  HR: 5,
  RBI: 6,
  BB: 7,
  K: 8,
  ROB: 9,
  DP: 10,
  TB: 11,
  AVG: 12,
  OBP: 13,
  SLG: 14,
  OPS: 15
};

export const PITCHING_COLUMNS = {
  PLAYER_NAME: 0,
  TEAM: 1,
  GP: 2,
  W: 3,
  L: 4,
  SV: 5,
  ERA: 6,
  IP: 7,
  BF: 8,
  H: 9,
  HR: 10,
  R: 11,
  BB: 12,
  K: 13,
  BAA: 14,
  WHIP: 15
};

export const FIELDING_COLUMNS = {
  PLAYER_NAME: 0,
  TEAM: 1,
  GP: 2,
  NP: 3,
  E: 4,
  SB: 5
};

export const TEAM_STATS_COLUMNS = {
  TEAM_NAME: 0,
  CAPTAIN: 1,
  GP: 2,
  WINS: 3,
  LOSSES: 4,
  HITTING_START: 5,
  HITTING_NUM_COLS: 9,
  PITCHING_START: 14,
  PITCHING_NUM_COLS: 7,
  FIELDING_START: 21,
  FIELDING_NUM_COLS: 3
};

/**
 * Stat calculation helpers
 *
 * These functions calculate derived stats from raw Player Data values.
 * All functions handle division by zero gracefully.
 */
export const STAT_CALCULATORS = {
  // Hitting derived stats
  AVG: (h, ab) => ab > 0 ? h / ab : 0,
  OBP: (h, bb, ab) => (ab + bb) > 0 ? (h + bb) / (ab + bb) : 0,
  SLG: (tb, ab) => ab > 0 ? tb / ab : 0,
  OPS: (h, bb, tb, ab) => {
    const obp = (ab + bb) > 0 ? (h + bb) / (ab + bb) : 0;
    const slg = ab > 0 ? tb / ab : 0;
    return obp + slg;
  },

  // Pitching derived stats
  ERA: (r, ip) => ip > 0 ? (r * 7) / ip : 0,
  BAA: (h, bf) => bf > 0 ? h / bf : 0,
  WHIP: (h, bb, ip) => ip > 0 ? (h + bb) / ip : 0
};

export const STAT_LABELS = {
  HITTING: {
    GP: 'Games Played',
    AB: 'At Bats',
    H: 'Hits',
    HR: 'Home Runs',
    RBI: 'RBI',
    BB: 'Walks',
    K: 'Strikeouts',
    ROB: 'Hits Robbed',
    DP: 'Double Plays',
    TB: 'Total Bases',
    AVG: 'Batting Average',
    OBP: 'On-Base %',
    SLG: 'Slugging %',
    OPS: 'OPS'
  },
  PITCHING: {
    GP: 'Games Played',
    W: 'Wins',
    L: 'Losses',
    SV: 'Saves',
    ERA: 'ERA',
    IP: 'Innings Pitched',
    BF: 'Batters Faced',
    H: 'Hits Allowed',
    HR: 'Home Runs Allowed',
    R: 'Runs Allowed',
    BB: 'Walks Allowed',
    K: 'Strikeouts',
    BAA: 'Batting Avg Against',
    WHIP: 'WHIP'
  },
  FIELDING: {
    GP: 'Games Played',
    NP: 'Nice Plays',
    E: 'Errors',
    SB: 'Stolen Bases'
  }
};

export const DATA_START_ROW = 2;

// Embed formatting constants
export const EMBED_FORMATTING = {
  MAX_PLAYER_NAME_LENGTH: 12,
  MAX_TEAM_NAME_LENGTH: 13,
  STANDINGS_RANK_WIDTH: 4,
  STANDINGS_TEAM_WIDTH: 20,
  STANDINGS_RECORD_WIDTH: 8,
  STANDINGS_PCT_WIDTH: 5,
  STANDINGS_GB_WIDTH: 6,
  STANDINGS_DIFF_WIDTH: 6,
  STANDINGS_TOTAL_WIDTH: 54,
  RANKINGS_RANK_WIDTH: 4,
  RANKINGS_NAME_WIDTH: 13,
  RANKINGS_TEAM_WIDTH: 13,
  RANKINGS_STAT_WIDTH: 6,
  RANKINGS_TOTAL_WIDTH: 42,
  COMPARE_NAME_WIDTH: 13,
  COMPARE_STAT_LABEL_WIDTH: 5,
  COMPARE_VALUE_WIDTH: 13,
  COMPARE_TOTAL_WIDTH: 32,
  SEPARATOR_CHAR: '─',
  BETTER_STAT_MARKER: '*'
};

// Player qualification thresholds
export const QUALIFICATION = {
  MIN_AB_MULTIPLIER: 2.1,  // Minimum AB = team games * multiplier
  MIN_IP_MULTIPLIER: 1.0   // Minimum IP = team games * multiplier
};

// Cache configuration
export const CACHE_CONFIG = {
  DURATION_MS: 5 * 60 * 1000,  // 5 minutes
  REFRESH_BATCH_SIZE: 1000     // Max items per batch refresh
};

// Discord embed limits
export const DISCORD_LIMITS = {
  EMBED_DESCRIPTION_MAX: 4096,
  EMBED_FIELD_VALUE_MAX: 1024,
  AUTOCOMPLETE_MAX_CHOICES: 25
};

// Playoff round mappings
export const PLAYOFF_ROUNDS = {
  1: 'Wildcard Round',
  2: 'Castle Series',
  3: 'Kingdom Cup'
};

// Reverse mapping for looking up round number from round name
export const PLAYOFF_ROUND_NAMES = {
  'Wildcard Round': 1,
  'Castle Series (CS)': 2,
  'Castle Series': 2,
  'Kingdom Cup (KC)': 3,
  'Kingdom Cup': 3
};

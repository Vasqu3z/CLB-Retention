/**
 * @file league-config.js
 * @description League configuration and constants for CLB League Hub Discord Bot
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
  HITTING: '🧮 Hitting',
  PITCHING: '🧮 Pitching',
  FIELDING: '🧮 Fielding & Running',
  TEAM_DATA: 'Team Data',
  RANKINGS: '🏆 Rankings',
  PLAYER_DATA: 'Player Data',
  SEASON_SCHEDULE: 'Season Schedule',
  LEAGUE_SCHEDULE: 'Discord Schedule'  // Hidden sheet without emoji for API compatibility
};

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

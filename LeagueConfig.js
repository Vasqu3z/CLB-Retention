// ===== BASEBALL STATS MANAGER - CONFIGURATION =====
// All configuration settings and global variables

var CONFIG = {
  // Sheet names in THIS spreadsheet (the stats workbook)
  ERROR_LOG_SHEET: "Error Log",
  PLAYER_STATS_SHEET: "Player Data",
  HITTING_STATS_SHEET: "🧮 Hitting",
  PITCHING_STATS_SHEET: "🧮 Pitching",
  FIELDING_STATS_SHEET: "🧮 Fielding & Running",
  TEAM_STATS_SHEET: "Team Data",
  TEAM_SHEET_TEMPLATE: "Team Sheet",
  LEAGUE_HUB_SHEET: "Rankings",
  LEAGUE_SCHEDULE_SHEET: "Schedule",
  SEASON_SCHEDULE_SHEET: "Season Schedule",
  TRANSACTION_LOG_SHEET: "Transaction Log",

  // External spreadsheet containing box scores (game sheets)
  BOX_SCORE_SPREADSHEET_ID: "17x5VoZxGV88RYAiHEcq0M-rxSyZ0fp66OktmJk2AaEU",

  // Prefix for game sheets in the box score spreadsheet
  GAME_SHEET_PREFIX: "#",

  // Column widths
  PLAYER_COLUMN_WIDTH: 175,
  LEAGUE_HUB_RANK_WIDTH: 50,
  LEAGUE_HUB_TEAM_WIDTH: 175,

  // Progress update frequency
  PROGRESS_UPDATE_FREQUENCY: 8,

  // Recent schedule weeks to show on League Hub
  RECENT_SCHEDULE_WEEKS: 2,

  // Data validation thresholds
  MAX_GAMES_PER_SEASON: 14,
  MAX_AB_PER_GAME: 6,
  MAX_IP_PER_GAME: 7.0,
  MAX_HITS_PER_GAME: 6,
  MAX_HR_PER_GAME: 6,

  // Title qualification multipliers
  MIN_AB_MULTIPLIER: 2.1,
  MIN_IP_MULTIPLIER: 1.0,

  // Team roster settings
  MAX_PLAYERS_PER_ROSTER: 11,
  WARN_ON_ROSTER_OVERFLOW: true,

  // Box score cell locations
  BOX_SCORE_TEAM_INFO: "B3:F4",
  BOX_SCORE_WLS_DATA: "M48:R50",
  BOX_SCORE_WINNER_DATA: "N48:N50",
  BOX_SCORE_HITTING_START_ROW: 29,
  BOX_SCORE_HITTING_START_COL: 2,
  BOX_SCORE_HITTING_NUM_ROWS: 22,
  BOX_SCORE_HITTING_NUM_COLS: 10,
  BOX_SCORE_PITCHING_FIELDING_START_ROW: 6,
  BOX_SCORE_PITCHING_FIELDING_START_COL: 2,
  BOX_SCORE_PITCHING_FIELDING_NUM_ROWS: 22,
  BOX_SCORE_PITCHING_FIELDING_NUM_COLS: 17,
  BOX_SCORE_TEAM1_TOTALS: "C39:R39",
  BOX_SCORE_TEAM2_TOTALS: "C50:R50",
  BOX_SCORE_TEAM1_PITCHING: "I16:R16",
  BOX_SCORE_TEAM2_PITCHING: "I27:R27",

  // Game sheet validation settings
  VALIDATE_TEAM_NAMES: true,
  VALIDATE_RUNS: true,
  VALIDATE_WLS_DATA: true,
  VALIDATE_PLAYER_DATA: true,
  MIN_PLAYERS_PER_TEAM: 1,

  // Season archiving settings
  ARCHIVE_SHEETS: [
    "Player Data",
    "Team Data", 
    "Hitting Stats",
    "Pitching Stats",
    "Fielding & Baserunning Stats",
    "League Hub",
    "League Schedule"
  ],

  // Transaction tracking
  PLAYER_TEAM_SNAPSHOT_PROPERTY: "playerTeamSnapshot"
};

// Global cache for spreadsheet objects and processed game data
var _spreadsheetCache = {
  boxScoreSpreadsheet: null,
  gameSheets: null,
  gameData: null  // NEW: Stores result from processAllGameSheetsOnce()
};
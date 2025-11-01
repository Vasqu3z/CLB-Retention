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
  RETENTION_GRADES_SHEET: "Retention Grades",

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
  PLAYER_TEAM_SNAPSHOT_PROPERTY: "playerTeamSnapshot",

  // ===== STATS SHEET COLUMN MAPPINGS =====
  // Define exact column structure for each stats sheet
  // CRITICAL: Update these if sheet structure changes
  STATS_COLUMN_MAPS: {
    HITTING_COLUMNS: {
      // Columns in 🧮 Hitting sheet
      PLAYER_NAME: 1,    // Column A
      TEAM: 2,           // Column B
      GP: 3,             // Column C - Games Played
      AB: 4,             // Column D - At Bats
      H: 5,              // Column E - Hits
      HR: 6,             // Column F - Home Runs
      RBI: 7,            // Column G - Runs Batted In
      BB: 8,             // Column H - Walks
      K: 9,              // Column I - Strikeouts
      ROB: 10,           // Column J - Reached on Base
      DP: 11,            // Column K - Double Plays
      TB: 12,            // Column L - Total Bases
      AVG: 13,           // Column M - Batting Average
      OBP: 14,           // Column N - On-Base Percentage
      SLG: 15,           // Column O - Slugging Percentage
      OPS: 16            // Column P - On-Base Plus Slugging
    },

    PITCHING_COLUMNS: {
      // Columns in 🧮 Pitching sheet
      PLAYER_NAME: 1,    // Column A
      TEAM: 2,           // Column B
      GP: 3,             // Column C - Games Played
      W: 4,              // Column D - Wins
      L: 5,              // Column E - Losses
      SV: 6,             // Column F - Saves
      ERA: 7,            // Column G - Earned Run Average
      IP: 8,             // Column H - Innings Pitched
      BF: 9,             // Column I - Batters Faced
      H: 10,             // Column J - Hits Allowed
      HR: 11,            // Column K - Home Runs Allowed
      R: 12,             // Column L - Runs Allowed
      BB: 13,            // Column M - Walks Allowed
      K: 14,             // Column N - Strikeouts
      BAA: 15,           // Column O - Batting Average Against
      WHIP: 16           // Column P - Walks + Hits per IP
    },

    FIELDING_COLUMNS: {
      // Columns in 🧮 Fielding & Running sheet
      PLAYER_NAME: 1,    // Column A
      TEAM: 2,           // Column B
      GP: 3,             // Column C - Games Played
      NP: 4,             // Column D - Nice Plays
      E: 5,              // Column E - Errors
      SB: 6              // Column F - Stolen Bases
    }
  },

  // ===== SHEET STRUCTURE LAYOUTS =====
  // Define exact layout of all output sheets to eliminate magic numbers
  // All column numbers and row positions centralized here
  SHEET_STRUCTURE: {
    // Team Data/Stats sheet layout
    TEAM_STATS_SHEET: {
      DATA_START_ROW: 2,
      TEAM_NAME_COL: 1,           // Column A
      GPWL_START_COL: 3,          // Column C - GP, W, L
      GPWL_NUM_COLS: 3,
      HITTING_START_COL: 6,       // Column F - Hitting stats
      HITTING_NUM_COLS: 9,
      PITCHING_START_COL: 15,     // Column O - Pitching stats
      PITCHING_NUM_COLS: 7,
      FIELDING_START_COL: 22,     // Column V - Fielding stats
      FIELDING_NUM_COLS: 3
    },

    // League Hub (Rankings) sheet layout
    LEAGUE_HUB: {
      HEADER_ROW: 1,
      STANDINGS_HEADER_ROW: 3,
      STANDINGS_START_ROW: 4,
      STANDINGS: {
        START_COL: 1,             // Column A
        NUM_COLS: 8,              // Rank, Team, W, L, Win%, RS, RA, Diff
        RANK_WIDTH: 50,
        TEAM_WIDTH: 175
      },
      LEADERS_BATTING: {
        START_COL: 10,            // Column J
        WIDTH: 300
      },
      LEADERS_PITCHING: {
        START_COL: 12,            // Column L
        WIDTH: 300
      },
      LEADERS_FIELDING: {
        START_COL: 14,            // Column N
        WIDTH: 300
      }
    },

    // League Schedule sheet layout
    LEAGUE_SCHEDULE: {
      HEADER_ROW: 1,
      STANDINGS_HEADER_ROW: 3,
      STANDINGS_START_ROW: 4,
      STANDINGS: {
        START_COL: 1,             // Column A
        NUM_COLS: 8               // Rank, Team, W, L, Win%, RS, RA, Diff
      },
      COMPLETED_GAMES: {
        START_COL: 10,            // Column J
        WIDTH: 300
      },
      SCHEDULED_GAMES: {
        START_COL: 12,            // Column L
        WIDTH: 300
      }
    },

    // Player Data sheet layout
    PLAYER_STATS_SHEET: {
      HEADER_ROW: 1,
      DATA_START_ROW: 2
    },

    // Team Sheets layout
    TEAM_SHEETS: {
      HEADER_ROW: 1,
      DATA_START_ROW: 2,
      PLAYER_COL_WIDTH: 175
    }
  }
};

// Global cache for spreadsheet objects and processed game data
var _spreadsheetCache = {
  boxScoreSpreadsheet: null,
  gameSheets: null,
  gameData: null  // NEW: Stores result from processAllGameSheetsOnce()
};
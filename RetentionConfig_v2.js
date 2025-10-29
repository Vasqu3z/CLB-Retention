// ===== RETENTION GRADE CONFIGURATION V2 =====
// Configuration for CLB Player Retention Probability System v2
// Each factor has a weighted contribution to final grade (0-100 d100 scale)
//
// MAJOR CHANGES FROM V1:
// - Removed: Star Points column (Column I eliminated)
// - Added: Draft/Trade Value column (Column C, manual input 1-8)
// - Renamed: "Awards" → "Performance" throughout
// - Weighted grading: TS(18%) + PT(32%) + Perf(17%) + Chem(12%) + Dir(21%)
// - Team Success: 10/10 split (was 8/12 regular/postseason)
// - Auto-flagging: Elite players on bad teams get performance penalty
// - Draft expectations: Performance vs draft round expectations
// - Team Direction: Table at bottom, one score per team (VLOOKUP)
//
// V2.1 CHANGES:
// - Split Team Success into 2 columns: Regular Season (D) + Postseason (E, VLOOKUP)
// - Auto-populate team lists in Team Direction and Postseason tables
// - Total columns: 19 (was 18)
//
// REFERENCES: Main CONFIG object from Stats Processing spreadsheet
// - Sheet names from CONFIG (Player Data, Hitting, Pitching, etc.)
// - Box score settings from CONFIG (spreadsheet ID, cell ranges)
//
// RULE: Never hardcode thresholds - always reference this config or CONFIG

var RETENTION_CONFIG = {

  // ===== VERSION INFO =====
  VERSION: "2.1",
  VERSION_DATE: "2025-10-28",

  // ===== NO SHEET NAMES HERE - USE CONFIG OBJECT =====
  // Sheet names are defined in main CONFIG.js and referenced via:
  // CONFIG.PLAYER_STATS_SHEET
  // CONFIG.HITTING_STATS_SHEET
  // CONFIG.PITCHING_STATS_SHEET
  // CONFIG.FIELDING_STATS_SHEET
  // CONFIG.TEAM_STATS_SHEET
  // CONFIG.RETENTION_GRADES_SHEET
  // CONFIG.LEAGUE_HUB_SHEET (for standings data)

  // ===== STATS SHEET COLUMN MAPPINGS =====
  // Define exact column structure for each stats sheet
  // CRITICAL: Update these if sheet structure changes

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
  },

  TEAM_DATA_COLUMNS: {
    // Columns in Team Data sheet
    TEAM_NAME: 1,      // Column A
    CAPTAIN: 2,        // Column B - Captain Name (not used)
    GP: 3,             // Column C - Games Played
    WINS: 4,           // Column D - Wins
    LOSSES: 5          // Column E - Losses
  },

  // ===== BOX SCORE INTEGRATION =====
  // For reading lineup positions from box score sheets
  // REFERENCES CONFIG.BOX_SCORE_* values - DO NOT HARDCODE
  BOX_SCORE: {
    // Hitting data structure:
    // - CONFIG.BOX_SCORE_HITTING_START_ROW = 29 (header row)
    // - Rows 30-38: Away team lineup (9 batters)
    // - Row 39: Away team totals (skip)
    // - Row 40: Header for home team (skip)
    // - Rows 41-49: Home team lineup (9 batters)
    // - Row 50: Home team totals (skip)

    // Away team lineup
    AWAY_LINEUP_START_OFFSET: 1,        // Start 1 row after header (row 30)
    AWAY_LINEUP_PLAYER_COUNT: 9,        // 9 batters in lineup

    // Home team lineup
    HOME_LINEUP_START_OFFSET: 12,       // Start 12 rows after header (row 41 = 29 + 12)
    HOME_LINEUP_PLAYER_COUNT: 9,        // 9 batters in lineup

    // Player names are in column B (from CONFIG.BOX_SCORE_HITTING_START_COL)
    // Uses CONFIG.BOX_SCORE_HITTING_START_COL directly in code
  },

  // ===== POSTSEASON DATA (MANUAL INPUT) =====
  // Located in Retention Grades sheet (dynamically found at bottom)
  // Format: Team Name (Col A) | Postseason Finish (Col B)
  // Accepts: numbers (1-8) or text ("Champion", "1st", "Semifinal", etc.)
  // V2.1: Auto-populated with team list, read via VLOOKUP
  POSTSEASON_SEARCH_TEXT: "Postseason Results",  // Header text to search for
  POSTSEASON_TABLE_NAME: "PostseasonResults",    // Named range for VLOOKUP

  // ===== WEIGHTED GRADING SYSTEM V2 =====
  // Factor weights (must sum to 1.0)
  // Final Grade = (weighted sum) × 5 for d100 scale (0-100)
  FACTOR_WEIGHTS: {
    TEAM_SUCCESS: 0.18,      // 18% weight
    PLAY_TIME: 0.32,         // 32% weight (highest)
    PERFORMANCE: 0.17,       // 17% weight (renamed from Awards)
    CHEMISTRY: 0.12,         // 12% weight
    DIRECTION: 0.21          // 21% weight (second highest)
  },

  // ===== FACTOR 1: TEAM SUCCESS (20 BASE POINTS, 18% WEIGHT) =====
  TEAM_SUCCESS: {
    MAX_POINTS: 20,

    // Regular season performance (0-10 points) - CHANGED FROM 8
    // Based on FINAL STANDINGS (not win%)
    // Philosophy: Rewards #1 seed heavily, nuclear penalty for last place
    REGULAR_SEASON: {
      MAX_POINTS: 10,

      // Standings-based points (read from League Hub)
      // Rebalanced from v1 8-point scale to 10-point scale
      FIRST: 10,        // 1st place - dominated regular season (was 8)
      SECOND: 6.25,     // 2nd place - strong playoff seed (was 5)
      THIRD: 6.25,      // 3rd place - strong playoff seed (was 5)
      FOURTH: 5,        // 4th place - scraped into playoffs (was 4)
      FIFTH: 3.75,      // 5th place - just missed playoffs (was 3)
      SIXTH: 2.5,       // 6th place - below average (was 2)
      SEVENTH: 2.5,     // 7th place - below average (was 2)
      EIGHTH: 0         // 8th place - LAST PLACE PENALTY (no floor)
    },

    // Postseason performance (0-10 points) - CHANGED FROM 12
    // Manual input from playoff bracket results
    // Philosophy: Balanced with regular season (10pts each)
    POSTSEASON: {
      MAX_POINTS: 10,

      CHAMPION: 10,          // 1st place - won it all (was 12)
      RUNNER_UP: 7.5,        // 2nd place - lost in finals (was 9)
      SEMIFINAL: 5,          // 3rd/4th place - lost in semifinals (was 6)
      QUARTERFINAL: 2.5,     // 5th-8th place - lost in first round (was 3)
      MISSED_PLAYOFFS: 0     // Did not make playoffs
    }
  },

  // ===== FACTOR 2: PLAY TIME (20 BASE POINTS, 32% WEIGHT) =====
  PLAY_TIME: {
    MAX_POINTS: 20,

    // Games played component (0-10 points) - CHANGED: More weight
    // Based on % of CURRENT team's games (mid-season trades penalized)
    // Philosophy: Rewards regular playing time
    GAMES_PLAYED: {
      MAX_POINTS: 10,

      FULL_TIME: { threshold: 0.85, points: 10 },    // 85%+ of games (12+ games)
      REGULAR: { threshold: 0.70, points: 7.5 },     // 70%+ of games (10-11 games)
      ROTATION: { threshold: 0.50, points: 5 },      // 50%+ of games (7-9 games)
      BENCH: { threshold: 0.25, points: 2.5 },       // 25%+ of games (4-6 games)
      MINIMAL: { threshold: 0, points: 0 }           // <25% of games (1-3 games)
    },

    // Usage quality component (0-10 points) - CHANGED: More weight
    // Different evaluation for hitters vs pitchers
    USAGE_QUALITY: {
      MAX_POINTS: 10,

      // FOR HITTERS: Average lineup position from box scores
      // Philosophy: Spots 1-3 equal (guaranteed 3 AB in 7-inning game)
      // Steeper penalties for batting stars low (system designed for TOP 3 players)
      LINEUP_POSITION: {
        TOP_THREE: { threshold: 3.0, points: 10 },    // Spots 1-3 (where stars belong)
        FOUR_FIVE: { threshold: 5.0, points: 6 },     // Spots 4-5 (mild misuse)
        SIX_SEVEN: { threshold: 7.0, points: 4 },     // Spots 6-7 (bad misuse)
        EIGHT_NINE: { threshold: 9.0, points: 1 },    // Spots 8-9 (terrible misuse)
        BENCH: { threshold: 999, points: 0 }          // No lineup appearances
      },

      // FOR PITCHERS: IP per team game (workload indicator)
      // Adjusted for 7-inning games (not 9-inning MLB)
      PITCHING_USAGE: {
        ACE: { threshold: 2.5, points: 10 },         // 2.5+ IP/team game (workhorse starter)
        STARTER: { threshold: 1.8, points: 7.5 },    // 1.8+ IP/team game (regular starter)
        SWINGMAN: { threshold: 1.2, points: 5 },     // 1.2+ IP/team game (spot starter/long relief)
        RELIEVER: { threshold: 0.6, points: 2.5 },   // 0.6+ IP/team game (setup/closer)
        MOP_UP: { threshold: 0, points: 0 }          // <0.6 IP/team game (rarely used)
      }
    }
  },

  // ===== FACTOR 3: PERFORMANCE (20 BASE POINTS, 17% WEIGHT) =====
  // RENAMED FROM "AWARDS" IN V1
  // Philosophy: Everyone hits (no DH), so offense is primary (0-14 pts)
  // Defense (0-3 pts) and pitching (0-3 pts) are optional bonuses
  // Well-rounded players can reach 20, specialists cap around 14-17
  PERFORMANCE: {
    MAX_POINTS: 20,

    // OFFENSIVE CONTRIBUTION (0-14 points) - Primary evaluation
    // Percentile ranking vs all qualified hitters
    OFFENSIVE: {
      MAX_POINTS: 14,

      // Qualification: Use league standard from CONFIG.js
      MIN_AB_MULTIPLIER: 2.1,  // Fallback if CONFIG not available

      // Stats evaluated: AVG, OBP, SLG, OPS, HR, RBI (average of percentiles)
      // Distribution designed for 85-100 players
      ELITE: { threshold: 90, points: 14 },         // Top 10% (8-10 players)
      EXCELLENT: { threshold: 75, points: 12 },     // 75-90th %ile (13-15 players)
      ABOVE_AVG: { threshold: 60, points: 10 },     // 60-75th %ile (13-15 players)
      GOOD: { threshold: 50, points: 8 },           // 50-60th %ile (8-10 players) - median
      AVERAGE: { threshold: 40, points: 6 },        // 40-50th %ile (8-10 players)
      BELOW_AVG: { threshold: 25, points: 4 },      // 25-40th %ile (13-15 players)
      POOR: { threshold: 10, points: 2 },           // 10-25th %ile (13-15 players)
      TERRIBLE: { threshold: 0, points: 0 }         // Bottom 10% (8-10 players)
    },

    // DEFENSIVE CONTRIBUTION (0-3 points) - Bonus for good fielding
    // Percentile ranking vs all qualified fielders
    DEFENSIVE: {
      MAX_POINTS: 3,

      // Qualification: 50% of team games played (7+ games)
      MIN_GP_PERCENTAGE: 0.5,

      // Metric: (Nice Plays - Errors) / Games Played
      // Percentile ranking of net defensive value
      GOLD_GLOVE: { threshold: 90, points: 3 },     // Top 10% defenders
      EXCELLENT: { threshold: 75, points: 2.5 },    // 75-90th percentile
      STRONG: { threshold: 60, points: 2 },         // 60-75th percentile
      SOLID: { threshold: 40, points: 1.5 },        // 40-60th percentile (average)
      NEUTRAL: { threshold: 25, points: 1 },        // 25-40th percentile
      BELOW_AVG: { threshold: 10, points: 0.5 },    // 10-25th percentile
      POOR: { threshold: 0, points: 0 }             // Bottom 10%
    },

    // PITCHING CONTRIBUTION (0-3 points) - Bonus for significant pitching
    // Percentile ranking vs all qualified pitchers
    PITCHING: {
      MAX_POINTS: 3,

      // Qualification: Use league standard from CONFIG.js
      MIN_IP_MULTIPLIER: 1.0,  // Fallback if CONFIG not available

      // Stats evaluated: ERA, WHIP, BAA (inverted - lower is better)
      CY_YOUNG: { threshold: 90, points: 3 },       // Top 10% pitchers (elite)
      EXCELLENT: { threshold: 75, points: 2.5 },    // 75-90th percentile
      STRONG: { threshold: 60, points: 2 },         // 60-75th percentile
      GOOD: { threshold: 50, points: 1.5 },         // 50-60th percentile (above avg)
      AVERAGE: { threshold: 40, points: 1 },        // 40-50th percentile
      BELOW_AVG: { threshold: 25, points: 0.5 },    // 25-40th percentile
      POOR: { threshold: 0, points: 0 }             // Bottom 25%
    }
  },

  // ===== AUTO-FLAGGING SYSTEM V2 =====
  // Detects flight risk for elite players on struggling teams
  // Applies automatic performance penalty
  AUTO_FLAGGING: {
    ENABLED: true,

    // Tier 1: Top performers on worst teams (high flight risk)
    TIER_1: {
      PERCENTILE_THRESHOLD: 75,    // Top 25% of players
      STANDING_MIN: 7,             // 7th or 8th place teams
      STANDING_MAX: 8,
      PENALTY_POINTS: -4           // -4 performance points
    },

    // Tier 2: Good performers on below-average teams (moderate flight risk)
    TIER_2: {
      PERCENTILE_THRESHOLD: 60,    // Top 40% of players
      STANDING_MIN: 5,             // 5th through 8th place teams
      STANDING_MAX: 8,
      PENALTY_POINTS: -2           // -2 performance points
    }
  },

  // ===== DRAFT EXPECTATIONS SYSTEM V2 =====
  // Compares performance to acquisition cost (draft round)
  // 3-tier system: High rounds get bonus for good situation, Mid/Late get penalties for underperforming
  DRAFT_EXPECTATIONS: {
    ENABLED: true,

    // High draft picks (Rounds 1-2) - Expected to be elite
    // No underperformance penalty (already at top), bonus for being in good situation
    HIGH_ROUNDS: {
      ROUNDS: [1, 2],
      GOOD_SITUATION_PERCENTILE: 75,     // Top 25% performance
      GOOD_SITUATION_BONUS: 2.5          // Bonus for elite player in good spot
    },

    // Mid draft picks (Rounds 3-5) - Expected to be solid contributors
    MID_ROUNDS: {
      ROUNDS: [3, 4, 5],
      EXPECTED_PERCENTILE: 50,           // Expected to be average or better
      UNDERPERFORM_PENALTY: -3.5,        // Moderate penalty for underperforming
      OVERPERFORM_BONUS: 2.0             // Small bonus for exceeding expectations
    },

    // Late draft picks (Rounds 6-8+) - Expected to contribute
    LATE_ROUNDS: {
      ROUNDS: [6, 7, 8],
      EXPECTED_PERCENTILE: 40,           // Expected to be somewhat useful
      UNDERPERFORM_PENALTY: -5.0,        // Severe penalty (complete bust)
      OVERPERFORM_BONUS: 3.0             // Larger bonus for finding value late
    }
  },

  // ===== MANUAL MODIFIERS =====
  // Adjustments for subjective factors not captured by stats
  // Applied AFTER base calculation, capped at 0-20 per category
  // V2 CHANGE: No data validation on modifier columns
  MODIFIERS: {
    TEAM_SUCCESS: {
      MIN: -5,
      MAX: 5,
      DESCRIPTION: "Adjusts Team Success for context (injuries, strength of schedule, etc.)"
    },
    PLAY_TIME: {
      MIN: -5,
      MAX: 5,
      DESCRIPTION: "Adjusts Play Time for context (traded mid-season, role changes, etc.)"
    },
    PERFORMANCE: {
      MIN: -5,
      MAX: 5,
      DESCRIPTION: "Adjusts Performance for context (stats inflated/deflated, expectations, etc.)"
    }
  },

  // ===== CHEMISTRY & DIRECTION =====
  MANUAL_FACTORS: {
    // Chemistry: 12% weight (0-20 points manual input per player)
    CHEMISTRY: {
      MIN: 0,
      MAX: 20,
      WEIGHT: 0.12,
      DESCRIPTION: "Player-team chemistry and fit"
    },

    // Direction: 21% weight (0-20 points via VLOOKUP from Team Direction table)
    DIRECTION: {
      MIN: 0,
      MAX: 20,
      WEIGHT: 0.21,
      DESCRIPTION: "Team's perceived future direction and competitive outlook"
    }
  },

  // ===== DRAFT/TRADE VALUE =====
  DRAFT_VALUE: {
    MIN: 1,
    MAX: 8,
    DESCRIPTION: "Draft round or equivalent trade value (1=first round, 8=eighth round)"
  },

  // ===== TEAM DIRECTION TABLE =====
  // New section at bottom of sheet
  // One score per team (0-20), all players on team inherit same score via VLOOKUP
  // V2.1: Auto-populated with team list from Team Data sheet
  TEAM_DIRECTION_TABLE: {
    SEARCH_TEXT: "Team Direction",
    HEADER_TEXT: "Team Direction Scores (0-20)",
    DESCRIPTION: "Enter direction score for each team. All players on that team inherit this score via VLOOKUP.",
    TABLE_NAME: "TeamDirection"  // Named range for VLOOKUP
  },

  // ===== LEAGUE CONTEXT =====
  LEAGUE: {
    TOTAL_TEAMS: 8,
    GAMES_PER_SEASON: 14,       // Regular season games per team
    INNINGS_PER_GAME: 7,        // 7-inning games (not 9-inning MLB)
    TYPICAL_ROSTER_SIZE: 11,    // Players per team
    EXPECTED_TOTAL_PLAYERS: 88, // 8 teams * 11 players (may vary 85-100)
    PLAYOFF_TEAMS: 4            // Half the league makes playoffs
  },

  // ===== OUTPUT FORMATTING V2 =====
  OUTPUT: {
    // Column widths
    PLAYER_COL_WIDTH: 150,
    TEAM_COL_WIDTH: 120,
    DRAFT_VALUE_COL_WIDTH: 80,
    STAT_COL_WIDTH: 70,
    MODIFIER_COL_WIDTH: 60,
    GRADE_COL_WIDTH: 60,
    DETAILS_COL_WIDTH: 350,
    CHEMISTRY_COL_WIDTH: 80,
    DIRECTION_COL_WIDTH: 80,

    // ===== COLUMN POSITIONS V2.1 =====
    // Team Success split into Regular Season + Postseason (2 columns)
    // Total: 19 columns

    // Auto-calculated columns (cleared on update)
    COL_PLAYER: 1,              // A - Player name
    COL_TEAM: 2,                // B - Team name
    COL_DRAFT_VALUE: 3,         // C - Draft/Trade Value (1-8, manual input)
    COL_REG_SEASON: 4,          // D - Regular Season Success (0-10, from standings) **SPLIT**
    COL_POSTSEASON: 5,          // E - Postseason Success (0-10, VLOOKUP from table) **SPLIT**
    COL_TS_MOD: 6,              // F - Team Success modifier (manual)
    COL_TS_TOTAL: 7,            // G - Team Success total (D+E+F formula)
    COL_PT_BASE: 8,             // H - Play Time base
    COL_PT_MOD: 9,              // I - Play Time modifier (manual)
    COL_PT_TOTAL: 10,           // J - Play Time total (formula)
    COL_PERF_BASE: 11,          // K - Performance base
    COL_PERF_MOD: 12,           // L - Performance modifier (manual)
    COL_PERF_TOTAL: 13,         // M - Performance total (formula)
    COL_AUTO_TOTAL: 14,         // N - Auto total (sum of bases)
    COL_CHEMISTRY: 15,          // O - Chemistry (0-20, manual input)
    COL_DIRECTION: 16,          // P - Direction (0-20, VLOOKUP from table)
    COL_MANUAL_TOTAL: 17,       // Q - Manual total (weighted: 12% chem + 21% dir)
    COL_FINAL_GRADE: 18,        // R - Final grade (weighted formula × 5 for d100)
    COL_DETAILS: 19,            // S - Details

    // Total columns
    TOTAL_COLUMNS: 19,

    // Color coding for final grades (retention probability)
    COLORS: {
      EXCELLENT: "#d4edda",  // Green - 75+ points (likely to retain)
      GOOD: "#d1ecf1",       // Light blue - 60-74 points (good chance)
      AVERAGE: "#fff3cd",    // Yellow - 40-59 points (uncertain)
      POOR: "#f8d7da",       // Red - <40 points (unlikely to retain)
      HEADER: "#e8e8e8",     // Gray - Header rows
      EDITABLE: "#ffffcc",   // Light yellow - Manual input cells
      MODIFIER: "#e6f3ff"    // Light blue - Modifier cells
    },

    // Sheet layout
    HEADER_ROW: 5,              // Row where data table headers start
    DATA_START_ROW: 6,          // Row where player data starts
    INSTRUCTIONS_ROW_OFFSET: 3  // Instructions appear N rows after last data row
  },

  // ===== DATA VALIDATION RULES V2 =====
  VALIDATION: {
    // Manual input columns
    CHEMISTRY_MIN: 0,
    CHEMISTRY_MAX: 20,
    DIRECTION_MIN: 0,
    DIRECTION_MAX: 20,
    DRAFT_VALUE_MIN: 1,
    DRAFT_VALUE_MAX: 8,

    // V2 CHANGE: No validation on modifier columns (allow any value)
    MODIFIERS_VALIDATION_ENABLED: false,

    // Data quality checks
    MIN_PLAYERS_FOR_PERCENTILE: 5,
    MAX_REASONABLE_GAMES: 20,
    MAX_REASONABLE_AB: 100,
    MAX_REASONABLE_IP: 60
  },

  // ===== FUTURE INTEGRATION HOOKS =====
  INTEGRATIONS: {
    // Transactions.js - Will auto-populate draft value
    TRANSACTIONS_ENABLED: false,

    // Playoffs.js - Will auto-populate postseason results
    PLAYOFFS_ENABLED: false,

    // Database Chemistry Tool - Will auto-populate chemistry scores
    CHEMISTRY_ENABLED: false
  },

  // ===== DEBUG AND LOGGING =====
  DEBUG: {
    ENABLE_LOGGING: true,
    LOG_PERCENTILE_DETAILS: false,
    LOG_LINEUP_PARSING: false,
    LOG_AUTO_FLAGGING: true,
    LOG_DRAFT_EXPECTATIONS: true,
    SHOW_PROGRESS_TOASTS: true
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Calculate minimum AB required for offensive qualification
 */
RETENTION_CONFIG.getMinABForQualification = function(teamGamesPlayed) {
  var multiplier = typeof CONFIG !== 'undefined' && CONFIG.MIN_AB_MULTIPLIER ?
                   CONFIG.MIN_AB_MULTIPLIER :
                   this.PERFORMANCE.OFFENSIVE.MIN_AB_MULTIPLIER;
  return Math.ceil(teamGamesPlayed * multiplier);
};

/**
 * Calculate minimum IP required for pitching qualification
 */
RETENTION_CONFIG.getMinIPForQualification = function(teamGamesPlayed) {
  var multiplier = typeof CONFIG !== 'undefined' && CONFIG.MIN_IP_MULTIPLIER ?
                   CONFIG.MIN_IP_MULTIPLIER :
                   this.PERFORMANCE.PITCHING.MIN_IP_MULTIPLIER;
  return teamGamesPlayed * multiplier;
};

/**
 * Calculate minimum GP required for defensive qualification
 */
RETENTION_CONFIG.getMinGPForQualification = function(teamGamesPlayed) {
  return Math.ceil(teamGamesPlayed * this.PERFORMANCE.DEFENSIVE.MIN_GP_PERCENTAGE);
};

/**
 * Get color for final grade (d95 scale: 5-95 range)
 * Thresholds adjusted for 90-point range starting at 5
 */
RETENTION_CONFIG.getGradeColor = function(finalGrade) {
  if (finalGrade >= 70) return this.OUTPUT.COLORS.EXCELLENT;  // Top ~28% of range (70-95)
  if (finalGrade >= 55) return this.OUTPUT.COLORS.GOOD;       // Upper-mid ~17% of range (55-70)
  if (finalGrade >= 40) return this.OUTPUT.COLORS.AVERAGE;    // Mid ~17% of range (40-55)
  return this.OUTPUT.COLORS.POOR;                              // Bottom ~38% of range (5-40)
};

/**
 * Calculate weighted final grade (d95 scale 5-95)
 * V2 FORMULA: (TS*0.18 + PT*0.32 + Perf*0.17 + Chem*0.12 + Dir*0.21) * 4.5 + 5
 */
RETENTION_CONFIG.calculateWeightedGrade = function(tsTotal, ptTotal, perfTotal, chemScore, dirScore) {
  var weights = this.FACTOR_WEIGHTS;

  // Calculate weighted sum
  var weightedSum =
    (tsTotal * weights.TEAM_SUCCESS) +
    (ptTotal * weights.PLAY_TIME) +
    (perfTotal * weights.PERFORMANCE) +
    (chemScore * weights.CHEMISTRY) +
    (dirScore * weights.DIRECTION);

  // Scale to d95 (5-95 range)
  var finalGrade = (weightedSum * 4.5) + 5;

  // Round to whole number
  return Math.round(finalGrade);
};

/**
 * Validate that config is properly loaded
 */
RETENTION_CONFIG.validate = function() {
  var errors = [];

  // Check that CONFIG is available
  if (typeof CONFIG === 'undefined') {
    errors.push("CONFIG object not found - ensure Config.js is loaded first");
  }

  // Check that factor weights sum to 1.0
  var weights = this.FACTOR_WEIGHTS;
  var weightSum = weights.TEAM_SUCCESS + weights.PLAY_TIME + weights.PERFORMANCE +
                  weights.CHEMISTRY + weights.DIRECTION;

  if (Math.abs(weightSum - 1.0) > 0.001) {
    errors.push("Factor weights must sum to 1.0 (currently: " + weightSum.toFixed(3) + ")");
  }

  // Check that point totals are correct
  var maxTeamSuccess = this.TEAM_SUCCESS.MAX_POINTS;
  var maxPlayTime = this.PLAY_TIME.MAX_POINTS;
  var maxPerformance = this.PERFORMANCE.MAX_POINTS;

  if (maxTeamSuccess !== 20) errors.push("Team Success max points should be 20");
  if (maxPlayTime !== 20) errors.push("Play Time max points should be 20");
  if (maxPerformance !== 20) errors.push("Performance max points should be 20");

  // Check that regular/postseason split is 10/10
  if (this.TEAM_SUCCESS.REGULAR_SEASON.MAX_POINTS !== 10) {
    errors.push("Team Success regular season max should be 10 points");
  }
  if (this.TEAM_SUCCESS.POSTSEASON.MAX_POINTS !== 10) {
    errors.push("Team Success postseason max should be 10 points");
  }

  if (errors.length > 0) {
    throw new Error("Retention Config V2 Validation Failed:\n" + errors.join("\n"));
  }

  return true;
};

// ===== RETENTION GRADE CONFIGURATION =====
// Configuration for CLB Player Retention Probability System
// Each factor worth 0-20 points, total 100 points = d100 roll
// 
// REFERENCES: Main CONFIG object from Stats Processing spreadsheet
// - Sheet names from CONFIG (Player Data, Hitting, Pitching, etc.)
// - Box score settings from CONFIG (spreadsheet ID, cell ranges)
// 
// RULE: Never hardcode thresholds - always reference this config or CONFIG

var RETENTION_CONFIG = {
  
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
  POSTSEASON_SEARCH_TEXT: "Postseason Results",  // Header text to search for
  
  // ===== FACTOR 1: TEAM SUCCESS (20 POINTS) =====
  TEAM_SUCCESS: {
    MAX_POINTS: 20,
    
    // Regular season performance (0-8 points)
    // Based on FINAL STANDINGS (not win%)
    // Philosophy: Rewards #1 seed heavily, nuclear penalty for last place
    REGULAR_SEASON: {
      MAX_POINTS: 8,
      
      // Standings-based points (read from League Hub)
      // Designed to incentivize winning 1st seed and punish last place
      FIRST: 8,         // 1st place - dominated regular season
      SECOND: 5,        // 2nd place - strong playoff seed
      THIRD: 5,         // 3rd place - strong playoff seed
      FOURTH: 4,        // 4th place - scraped into playoffs
      FIFTH: 3,         // 5th place - just missed playoffs
      SIXTH: 2,         // 6th place - below average
      SEVENTH: 2,       // 7th place - below average
      EIGHTH: 0         // 8th place - LAST PLACE PENALTY (no floor)
    },
    
    // Postseason performance (0-12 points)
    // Manual input from playoff bracket results
    // Philosophy: Postseason matters MORE (12pts vs 8pts regular)
    // Allows hot teams to overcome mediocre regular seasons
    POSTSEASON: {
      MAX_POINTS: 12,
      
      CHAMPION: 12,          // 1st place - won it all
      RUNNER_UP: 9,          // 2nd place - lost in finals
      SEMIFINAL: 6,          // 3rd/4th place - lost in semifinals
      QUARTERFINAL: 3,       // 5th-8th place - lost in first round
      MISSED_PLAYOFFS: 0     // Did not make playoffs
    }
  },
  
  // ===== FACTOR 2: PLAY TIME (20 POINTS) =====
  PLAY_TIME: {
    MAX_POINTS: 20,
    
    // Games played component (0-8 points)
    // Based on % of CURRENT team's games (mid-season trades penalized)
    // Philosophy: Rewards regular playing time
    GAMES_PLAYED: {
      MAX_POINTS: 8,
      
      FULL_TIME: { threshold: 0.85, points: 8 },     // 85%+ of games (12+ games)
      REGULAR: { threshold: 0.70, points: 6 },       // 70%+ of games (10-11 games)
      ROTATION: { threshold: 0.50, points: 4 },      // 50%+ of games (7-9 games)
      BENCH: { threshold: 0.25, points: 2 },         // 25%+ of games (4-6 games)
      MINIMAL: { threshold: 0, points: 0 }           // <25% of games (1-3 games)
    },
    
    // Usage quality component (0-8 points)
    // Different evaluation for hitters vs pitchers
    USAGE_QUALITY: {
      MAX_POINTS: 8,
      
      // FOR HITTERS: Average lineup position from box scores
      // Philosophy: Spots 1-3 equal (guaranteed 3 AB in 7-inning game)
      // Steeper penalties for batting stars low (system designed for TOP 3 players)
      LINEUP_POSITION: {
        TOP_THREE: { threshold: 3.0, points: 8 },    // Spots 1-3 (where stars belong)
        FOUR_FIVE: { threshold: 5.0, points: 5 },    // Spots 4-5 (mild misuse - 3pt penalty)
        SIX_SEVEN: { threshold: 7.0, points: 3 },    // Spots 6-7 (bad misuse - 5pt penalty)
        EIGHT_NINE: { threshold: 9.0, points: 1 },   // Spots 8-9 (terrible misuse - 7pt penalty)
        BENCH: { threshold: 999, points: 0 }         // No lineup appearances (8pt penalty)
      },
      
      // FOR PITCHERS: IP per team game (workload indicator)
      // Adjusted for 7-inning games (not 9-inning MLB)
      PITCHING_USAGE: {
        ACE: { threshold: 2.5, points: 8 },          // 2.5+ IP/team game (workhorse starter)
        STARTER: { threshold: 1.8, points: 6 },      // 1.8+ IP/team game (regular starter)
        SWINGMAN: { threshold: 1.2, points: 4 },     // 1.2+ IP/team game (spot starter/long relief)
        RELIEVER: { threshold: 0.6, points: 2 },     // 0.6+ IP/team game (setup/closer)
        MOP_UP: { threshold: 0, points: 0 }          // <0.6 IP/team game (rarely used)
      }
    },
    
    // Star points component (0-4 points)
    // Manual input in editable column
    // NOTE: Offseason star point effectiveness under review for Season 2
    STAR_POINTS: {
      MAX_POINTS: 4,
      MAX_STAR_POINTS_PER_SEASON: 15,  // League standard: 15 SP per team per season
      
      // Formula: sqrt(starPointsUsed / 15) * 4
      // Current design under evaluation - may change in Season 2
      calculatePoints: function(starPointsUsed) {
        if (starPointsUsed <= 0) return 0;
        var ratio = Math.min(starPointsUsed / this.MAX_STAR_POINTS_PER_SEASON, 1.0);
        return Math.sqrt(ratio) * this.MAX_POINTS;
      }
    }
  },
  
  // ===== FACTOR 3: AWARDS/ACCOLADES (20 POINTS) =====
  // Philosophy: Everyone hits (no DH), so offense is primary (0-14 pts)
  // Defense (0-3 pts) and pitching (0-3 pts) are optional bonuses
  // Well-rounded players can reach 20, specialists cap around 14-17
  AWARDS: {
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
  
  // ===== MANUAL MODIFIERS =====
  // Adjustments for subjective factors not captured by stats
  // Applied AFTER base calculation, capped at 0-20 per category
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
    AWARDS: {
      MIN: -5,
      MAX: 5,
      DESCRIPTION: "Adjusts Awards for context (stats inflated/deflated, expectations, etc.)"
    }
  },
  
  // ===== LEAGUE CONTEXT =====
  LEAGUE: {
    TOTAL_TEAMS: 8,
    GAMES_PER_SEASON: 14,       // Regular season games per team
    INNINGS_PER_GAME: 7,        // 7-inning games (not 9-inning MLB)
    TYPICAL_ROSTER_SIZE: 11,    // Players per team
    EXPECTED_TOTAL_PLAYERS: 88, // 8 teams * 11 players (may vary 85-100)
    PLAYOFF_TEAMS: 4            // Half the league makes playoffs (5 next season)
  },
  
  // ===== OUTPUT FORMATTING =====
  OUTPUT: {
    // Column widths
    PLAYER_COL_WIDTH: 150,
    TEAM_COL_WIDTH: 120,
    STAT_COL_WIDTH: 70,
    MODIFIER_COL_WIDTH: 60,
    GRADE_COL_WIDTH: 60,
    DETAILS_COL_WIDTH: 350,
    NOTES_COL_WIDTH: 200,
    STAR_POINTS_COL_WIDTH: 70,
    
    // ===== COLUMN POSITIONS =====
    // Auto-calculated columns (cleared on update)
    COL_PLAYER: 1,              // A - Player name
    COL_TEAM: 2,                // B - Team name
    COL_TS_BASE: 3,             // C - Team Success base
    COL_TS_TOTAL: 5,            // E - Team Success total (formula)
    COL_PT_BASE: 6,             // F - Play Time base
    COL_PT_TOTAL: 8,            // H - Play Time total (formula)
    COL_AWARDS_BASE: 10,        // J - Awards base
    COL_AWARDS_TOTAL: 12,       // L - Awards total (formula)
    COL_AUTO_TOTAL: 13,         // M - Auto total
    COL_MANUAL_TOTAL: 16,       // P - Manual total (formula)
    COL_FINAL_GRADE: 17,        // Q - Final grade (formula)
    COL_DETAILS: 18,            // R - Details
    
    // Manual input columns (PRESERVED on update)
    COL_TS_MOD: 4,              // D - Team Success modifier
    COL_PT_MOD: 7,              // G - Play Time modifier
    COL_STAR_POINTS: 9,         // I - Star Points
    COL_AWARDS_MOD: 11,         // K - Awards modifier
    COL_CHEMISTRY: 14,          // N - Chemistry
    COL_DIRECTION: 15,          // O - Direction
    
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
  
  // ===== DATA VALIDATION RULES =====
  VALIDATION: {
    // Manual input columns
    CHEMISTRY_MIN: 0,
    CHEMISTRY_MAX: 20,
    DIRECTION_MIN: 0,
    DIRECTION_MAX: 20,
    STAR_POINTS_MIN: 0,
    STAR_POINTS_MAX: 15,
    
    // Modifier ranges (applied after base calculation)
    TS_MODIFIER_MIN: -5,
    TS_MODIFIER_MAX: 5,
    PT_MODIFIER_MIN: -5,
    PT_MODIFIER_MAX: 5,
    AWARDS_MODIFIER_MIN: -5,
    AWARDS_MODIFIER_MAX: 5,
    
    // Data quality checks
    MIN_PLAYERS_FOR_PERCENTILE: 5,
    MAX_REASONABLE_GAMES: 20,
    MAX_REASONABLE_AB: 100,
    MAX_REASONABLE_IP: 60
  },
  
  // ===== FUTURE INTEGRATION HOOKS =====
  INTEGRATIONS: {
    // Transactions.js - Will auto-populate star points
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
                   this.AWARDS.OFFENSIVE.MIN_AB_MULTIPLIER;
  return Math.ceil(teamGamesPlayed * multiplier);
};

/**
 * Calculate minimum IP required for pitching qualification
 */
RETENTION_CONFIG.getMinIPForQualification = function(teamGamesPlayed) {
  var multiplier = typeof CONFIG !== 'undefined' && CONFIG.MIN_IP_MULTIPLIER ? 
                   CONFIG.MIN_IP_MULTIPLIER : 
                   this.AWARDS.PITCHING.MIN_IP_MULTIPLIER;
  return teamGamesPlayed * multiplier;
};

/**
 * Calculate minimum GP required for defensive qualification
 */
RETENTION_CONFIG.getMinGPForQualification = function(teamGamesPlayed) {
  return Math.ceil(teamGamesPlayed * this.AWARDS.DEFENSIVE.MIN_GP_PERCENTAGE);
};

/**
 * Calculate star points score using square root curve
 */
RETENTION_CONFIG.calculateStarPointsScore = function(starPointsUsed) {
  return this.PLAY_TIME.STAR_POINTS.calculatePoints(starPointsUsed);
};

/**
 * Get color for final grade
 */
RETENTION_CONFIG.getGradeColor = function(finalGrade) {
  if (finalGrade >= 75) return this.OUTPUT.COLORS.EXCELLENT;
  if (finalGrade >= 60) return this.OUTPUT.COLORS.GOOD;
  if (finalGrade >= 40) return this.OUTPUT.COLORS.AVERAGE;
  return this.OUTPUT.COLORS.POOR;
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
  
  // Check that point totals add up correctly
  var maxTeamSuccess = this.TEAM_SUCCESS.MAX_POINTS;
  var maxPlayTime = this.PLAY_TIME.MAX_POINTS;
  var maxAwards = this.AWARDS.MAX_POINTS;
  
  if (maxTeamSuccess !== 20) errors.push("Team Success max points should be 20");
  if (maxPlayTime !== 20) errors.push("Play Time max points should be 20");
  if (maxAwards !== 20) errors.push("Awards max points should be 20");
  
  if (errors.length > 0) {
    throw new Error("Retention Config Validation Failed:\n" + errors.join("\n"));
  }
  
  return true;
};
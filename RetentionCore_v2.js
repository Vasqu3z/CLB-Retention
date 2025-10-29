// ===== RETENTION GRADES V2 - CORE CALCULATION ENGINE =====
// Main calculation logic, data loading, and Smart Update system
//
// Dependencies: RetentionConfig_v2.js (must be loaded first)
// Related files: RetentionFactors_v2.js, RetentionSheet_v2.js, RetentionHelpers_v2.js
//
// V2 CHANGES:
// - Removed star points calculation
// - Added draft/trade value reading
// - Renamed "Awards" to "Performance"
// - Uses weighted grading formula
// - Preserves existing Smart Update system

// ===== PERFORMANCE OPTIMIZATION: CACHING =====
var LINEUP_DATA_CACHE = null;

/**
 * Clear lineup data cache
 */
function clearLineupCache() {
  LINEUP_DATA_CACHE = null;
}

/**
 * MAIN FUNCTION: Calculate retention grades for all players
 * Called from menu: ⭐ Retention → Calculate Retention Grades v2
 * SMART UPDATE: Only rebuilds formatting if sheet is new/corrupted
 */
function calculateRetentionGrades() {
  try {
    // Validate config before starting
    RETENTION_CONFIG.validate();

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (RETENTION_CONFIG.DEBUG.SHOW_PROGRESS_TOASTS) {
      ss.toast("Starting retention grade calculation v2...", "Processing", 3);
    }

    // Get all necessary data
    Logger.log("=== RETENTION GRADES V2 CALCULATION START ===");

    Logger.log("Step 1/7: Loading player data...");
    var playerData = getPlayerData();
    Logger.log("Loaded " + playerData.length + " players");

    Logger.log("Step 2/7: Loading team data...");
    var teamData = getTeamData();
    Logger.log("Loaded " + Object.keys(teamData).length + " teams");

    Logger.log("Step 3/7: Loading standings data...");
    var standingsData = getStandingsData();
    Logger.log("Loaded standings for " + Object.keys(standingsData).length + " teams");

    Logger.log("Step 4/7: Loading postseason data...");
    var postseasonData = getPostseasonData();
    Logger.log("Loaded postseason results for " + Object.keys(postseasonData).length + " teams");

    Logger.log("Step 5/7: Loading lineup position data from box scores...");
    var lineupData = getLineupPositionData();
    Logger.log("Loaded lineup data for " + Object.keys(lineupData).length + " player-team combinations");

    Logger.log("Step 6/7: Calculating league percentiles...");
    var leagueStats = calculateLeaguePercentiles();
    Logger.log("Percentiles calculated - Hitters: " + (leagueStats.hitting.avg ? leagueStats.hitting.avg.length : 0) +
               ", Pitchers: " + (leagueStats.pitching.era ? leagueStats.pitching.era.length : 0));

    Logger.log("Step 7/7: Calculating retention grades...");

    // Calculate grades for each player
    var retentionGrades = [];

    for (var i = 0; i < playerData.length; i++) {
      var player = playerData[i];

      // Calculate each factor (functions in RetentionFactors_v2.js)
      var teamSuccess = calculateTeamSuccess(player, teamData, standingsData, postseasonData);
      var playTime = calculatePlayTime(player, teamData, lineupData);
      var performance = calculatePerformance(player, leagueStats, standingsData);

      retentionGrades.push({
        playerName: player.name,
        team: player.team,
        teamSuccess: teamSuccess,
        playTime: playTime,
        performance: performance,
        autoTotal: teamSuccess.total + playTime.total + performance.total,
        // Manual factors placeholders (to be filled by user or VLOOKUP)
        tsModifier: 0,
        ptModifier: 0,
        perfModifier: 0,
        chemistry: 0,
        direction: 0,
        draftValue: "",  // Will be preserved if exists
        finalGrade: 0
      });

      if ((i + 1) % 20 === 0) {
        Logger.log("Processed " + (i + 1) + "/" + playerData.length + " players");
      }
    }

    Logger.log("Calculation complete. Writing to sheet...");

    // SMART UPDATE: Check if sheet needs full rebuild or just data update
    var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);

    if (!sheet || !isRetentionSheetFormatted(sheet)) {
      Logger.log("Sheet not formatted - building from scratch");
      buildRetentionSheetFromScratch(retentionGrades);
    } else {
      Logger.log("Sheet already formatted - updating data only");
      updateRetentionData(sheet, retentionGrades);
    }

    Logger.log("=== RETENTION GRADES V2 CALCULATION COMPLETE ===");

    // Clear cache
    clearLineupCache();

    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Retention grades v2 calculated for " + retentionGrades.length + " players. " +
      "Edit yellow/blue cells: Draft Value (Col C), Modifiers (Cols E, H, K), Chemistry (Col N). " +
      "Direction (Col O) auto-fills via VLOOKUP from Team Direction table.",
      "✅ Calculation Complete",
      10
    );

  } catch (e) {
    Logger.log("ERROR in calculateRetentionGrades: " + e.toString());
    Logger.log(e.stack);

    // Clear cache on error
    clearLineupCache();

    SpreadsheetApp.getUi().alert("Error calculating retention grades:\n\n" + e.toString());
  }
}

// ===== DATA COLLECTION FUNCTIONS =====

/**
 * Get all player data from database
 * Combines hitting, pitching, and fielding stats
 * USES CONFIG-DEFINED COLUMN MAPPINGS
 */
function getPlayerData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hittingSheet = ss.getSheetByName(CONFIG.HITTING_STATS_SHEET);
  var pitchingSheet = ss.getSheetByName(CONFIG.PITCHING_STATS_SHEET);
  var fieldingSheet = ss.getSheetByName(CONFIG.FIELDING_STATS_SHEET);

  var players = [];

  // Get hitting data (primary source - everyone hits)
  if (hittingSheet) {
    var hittingLastRow = hittingSheet.getLastRow();
    if (hittingLastRow > 1) {
      var cols = RETENTION_CONFIG.HITTING_COLUMNS;
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var hittingData = hittingSheet.getRange(2, 1, hittingLastRow - 1, numCols).getValues();

      for (var i = 0; i < hittingData.length; i++) {
        var playerName = String(hittingData[i][cols.PLAYER_NAME - 1]).trim();
        var team = String(hittingData[i][cols.TEAM - 1]).trim();

        if (!playerName || !team) continue;

        players.push({
          name: playerName,
          team: team,
          hitting: {
            gp: hittingData[i][cols.GP - 1],
            ab: hittingData[i][cols.AB - 1],
            h: hittingData[i][cols.H - 1],
            hr: hittingData[i][cols.HR - 1],
            rbi: hittingData[i][cols.RBI - 1],
            bb: hittingData[i][cols.BB - 1],
            k: hittingData[i][cols.K - 1],
            rob: hittingData[i][cols.ROB - 1],
            dp: hittingData[i][cols.DP - 1],
            tb: hittingData[i][cols.TB - 1],
            avg: hittingData[i][cols.AVG - 1],
            obp: hittingData[i][cols.OBP - 1],
            slg: hittingData[i][cols.SLG - 1],
            ops: hittingData[i][cols.OPS - 1]
          },
          pitching: {},
          fielding: {}
        });
      }
    }
  }

  // Enhance with pitching data
  if (pitchingSheet) {
    var pitchingLastRow = pitchingSheet.getLastRow();
    if (pitchingLastRow > 1) {
      var cols = RETENTION_CONFIG.PITCHING_COLUMNS;
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var pitchingData = pitchingSheet.getRange(2, 1, pitchingLastRow - 1, numCols).getValues();

      for (var i = 0; i < pitchingData.length; i++) {
        var playerName = String(pitchingData[i][cols.PLAYER_NAME - 1]).trim();
        var team = String(pitchingData[i][cols.TEAM - 1]).trim();

        if (!playerName || !team) continue;

        var playerIndex = findPlayerIndex(players, playerName, team);

        if (playerIndex >= 0) {
          players[playerIndex].pitching = {
            gp: pitchingData[i][cols.GP - 1],
            ip: pitchingData[i][cols.IP - 1],
            bf: pitchingData[i][cols.BF - 1],
            h: pitchingData[i][cols.H - 1],
            hr: pitchingData[i][cols.HR - 1],
            r: pitchingData[i][cols.R - 1],
            bb: pitchingData[i][cols.BB - 1],
            k: pitchingData[i][cols.K - 1],
            w: pitchingData[i][cols.W - 1],
            l: pitchingData[i][cols.L - 1],
            sv: pitchingData[i][cols.SV - 1],
            era: pitchingData[i][cols.ERA - 1],
            whip: pitchingData[i][cols.WHIP - 1],
            baa: pitchingData[i][cols.BAA - 1]
          };
        }
      }
    }
  }

  // Enhance with fielding data
  if (fieldingSheet) {
    var fieldingLastRow = fieldingSheet.getLastRow();
    if (fieldingLastRow > 1) {
      var cols = RETENTION_CONFIG.FIELDING_COLUMNS;
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var fieldingData = fieldingSheet.getRange(2, 1, fieldingLastRow - 1, numCols).getValues();

      for (var i = 0; i < fieldingData.length; i++) {
        var playerName = String(fieldingData[i][cols.PLAYER_NAME - 1]).trim();
        var team = String(fieldingData[i][cols.TEAM - 1]).trim();

        if (!playerName || !team) continue;

        var playerIndex = findPlayerIndex(players, playerName, team);

        if (playerIndex >= 0) {
          players[playerIndex].fielding = {
            gp: fieldingData[i][cols.GP - 1],
            np: fieldingData[i][cols.NP - 1],
            e: fieldingData[i][cols.E - 1],
            sb: fieldingData[i][cols.SB - 1]
          };
        }
      }
    }
  }

  return players;
}

/**
 * Get team data (wins, losses, games played)
 * USES CONFIG-DEFINED COLUMN MAPPINGS
 */
function getTeamData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var teamSheet = ss.getSheetByName(CONFIG.TEAM_STATS_SHEET);

  var teams = {};

  if (teamSheet) {
    var lastRow = teamSheet.getLastRow();
    if (lastRow > 1) {
      var cols = RETENTION_CONFIG.TEAM_DATA_COLUMNS;
      var data = teamSheet.getRange(2, 1, lastRow - 1, 5).getValues();

      for (var i = 0; i < data.length; i++) {
        var teamName = String(data[i][cols.TEAM_NAME - 1]).trim();
        if (!teamName) continue;

        var gp = data[i][cols.GP - 1];
        var w = data[i][cols.WINS - 1];
        var l = data[i][cols.LOSSES - 1];

        if (typeof gp !== 'number') gp = 0;
        if (typeof w !== 'number') w = 0;
        if (typeof l !== 'number') l = 0;

        teams[teamName] = {
          gamesPlayed: gp,
          wins: w,
          losses: l,
          winPct: gp > 0 ? w / gp : 0
        };
      }
    }
  }

  return teams;
}

/**
 * Get standings data from League Hub
 * Returns object mapping team name to standing (1-8)
 * CRITICAL: Uses actual standings with H2H tiebreakers, not just win%
 */
function getStandingsData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hubSheet = ss.getSheetByName(CONFIG.LEAGUE_HUB_SHEET);

  var standings = {};

  if (!hubSheet) {
    Logger.log("WARNING: League Hub sheet not found - cannot read standings");
    return standings;
  }

  try {
    // Standings are in columns A-B, starting at row 4 (after headers)
    // Format: Rank (Col A) | Team Name (Col B)
    var standingsRange = hubSheet.getRange(4, 1, 8, 2).getValues();

    for (var i = 0; i < standingsRange.length; i++) {
      var rank = standingsRange[i][0];
      var teamName = String(standingsRange[i][1]).trim();

      if (!teamName) continue;

      // Rank might be a number or text like "1st", "2nd", etc.
      var standing = typeof rank === 'number' ? rank : parseInt(String(rank).replace(/\D/g, ''));

      if (standing >= 1 && standing <= 8) {
        standings[teamName] = standing;

        if (RETENTION_CONFIG.DEBUG.ENABLE_LOGGING) {
          Logger.log("Standings: " + teamName + " = " + standing + getOrdinalSuffix(standing) + " place");
        }
      }
    }
  } catch (e) {
    Logger.log("Error reading standings from League Hub: " + e.toString());
  }

  return standings;
}

/**
 * Get postseason data from manual input area
 * Located at bottom of Retention Grades sheet
 * PRESERVED across re-runs (not cleared)
 */
function getPostseasonData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var retentionSheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);

  var postseason = {};

  if (!retentionSheet) return postseason;

  try {
    var postseasonHeaderRow = findPostseasonSection(retentionSheet);

    if (postseasonHeaderRow === -1) {
      if (RETENTION_CONFIG.DEBUG.ENABLE_LOGGING) {
        Logger.log("Postseason Results section not found - sheet may need initial build");
      }
      return postseason;
    }

    // Read data starting 2 rows after header
    var dataStartRow = postseasonHeaderRow + 2;
    var data = retentionSheet.getRange(dataStartRow, 1, 10, 2).getValues();

    for (var i = 0; i < data.length; i++) {
      var teamName = String(data[i][0]).trim();
      var finish = data[i][1];

      if (teamName && finish) {
        var points = parsePostseasonFinish(finish);
        postseason[teamName] = points;

        if (RETENTION_CONFIG.DEBUG.ENABLE_LOGGING) {
          Logger.log("Postseason: " + teamName + " finished " + finish + " = " + points + " points");
        }
      }
    }
  } catch (e) {
    Logger.log("Could not read postseason data: " + e.toString());
  }

  return postseason;
}

/**
 * Parse postseason finish into points (V2: 10-point scale)
 * Accepts: numbers (1-8), text ("1st", "champion"), or descriptive text
 */
function parsePostseasonFinish(finish) {
  var config = RETENTION_CONFIG.TEAM_SUCCESS.POSTSEASON;

  if (typeof finish === 'number') {
    finish = Math.floor(finish);

    if (finish === 1) return config.CHAMPION;
    if (finish === 2) return config.RUNNER_UP;
    if (finish === 3 || finish === 4) return config.SEMIFINAL;
    if (finish >= 5 && finish <= 8) return config.QUARTERFINAL;

    return config.MISSED_PLAYOFFS;
  }

  var finishStr = String(finish).toLowerCase().trim();

  var numMatch = finishStr.match(/^(\d+)/);
  if (numMatch) {
    var num = parseInt(numMatch[1]);

    if (num === 1) return config.CHAMPION;
    if (num === 2) return config.RUNNER_UP;
    if (num === 3 || num === 4) return config.SEMIFINAL;
    if (num >= 5 && num <= 8) return config.QUARTERFINAL;

    return config.MISSED_PLAYOFFS;
  }

  if (finishStr.indexOf("champion") >= 0 || finishStr.indexOf("1st") >= 0 || finishStr.indexOf("first") >= 0) {
    return config.CHAMPION;
  }
  if (finishStr.indexOf("runner") >= 0 || finishStr.indexOf("2nd") >= 0 || finishStr.indexOf("second") >= 0) {
    return config.RUNNER_UP;
  }
  if (finishStr.indexOf("semi") >= 0 || finishStr.indexOf("3rd") >= 0 || finishStr.indexOf("4th") >= 0) {
    return config.SEMIFINAL;
  }
  if (finishStr.indexOf("quarter") >= 0 || finishStr.indexOf("5th") >= 0 || finishStr.indexOf("6th") >= 0 ||
      finishStr.indexOf("7th") >= 0 || finishStr.indexOf("8th") >= 0) {
    return config.QUARTERFINAL;
  }

  return config.MISSED_PLAYOFFS;
}

/**
 * Get lineup position data from box score spreadsheet
 * Returns object mapping "PlayerName|TeamName" to lineup position data
 * CRITICAL: Only counts games where player was on CURRENT team
 * OPTIMIZED: Batch reads, caching, single-pass processing
 * USES CONFIG FOR ALL BOX SCORE REFERENCES
 */
function getLineupPositionData() {
  // Return cached data if available
  if (LINEUP_DATA_CACHE !== null) {
    Logger.log("Using cached lineup data");
    return LINEUP_DATA_CACHE;
  }

  var startTime = new Date().getTime();

  var boxScoreSpreadsheetId = CONFIG.BOX_SCORE_SPREADSHEET_ID;
  var boxScoreSpreadsheet = SpreadsheetApp.openById(boxScoreSpreadsheetId);
  var allSheets = boxScoreSpreadsheet.getSheets();

  var lineupData = {};
  var gameSheetPrefix = CONFIG.GAME_SHEET_PREFIX;

  // Filter game sheets first (faster)
  var gameSheets = [];
  for (var s = 0; s < allSheets.length; s++) {
    var sheetName = allSheets[s].getName();
    if (sheetName.indexOf(gameSheetPrefix) === 0) {
      gameSheets.push(allSheets[s]);
    }
  }

  Logger.log("Found " + gameSheets.length + " game sheets to process");

  // Process each game sheet
  for (var s = 0; s < gameSheets.length; s++) {
    var sheet = gameSheets[s];
    var sheetName = sheet.getName();

    try {
      // OPTIMIZATION: Calculate row positions from CONFIG
      var hittingStartRow = CONFIG.BOX_SCORE_HITTING_START_ROW;
      var playerNameCol = CONFIG.BOX_SCORE_HITTING_START_COL;

      var awayLineupStartRow = hittingStartRow + RETENTION_CONFIG.BOX_SCORE.AWAY_LINEUP_START_OFFSET;
      var homeLineupStartRow = hittingStartRow + RETENTION_CONFIG.BOX_SCORE.HOME_LINEUP_START_OFFSET;

      // Batch read: team names + both lineups
      var teamInfoRange = sheet.getRange(CONFIG.BOX_SCORE_TEAM_INFO);
      var teamInfo = teamInfoRange.getValues();
      var awayTeam = String(teamInfo[0][0]).trim();
      var homeTeam = String(teamInfo[1][0]).trim();

      if (!awayTeam || !homeTeam) continue;

      // Read both lineups in batch
      var awayLineup = sheet.getRange(
        awayLineupStartRow,
        playerNameCol,
        RETENTION_CONFIG.BOX_SCORE.AWAY_LINEUP_PLAYER_COUNT,
        1
      ).getValues();

      var homeLineup = sheet.getRange(
        homeLineupStartRow,
        playerNameCol,
        RETENTION_CONFIG.BOX_SCORE.HOME_LINEUP_PLAYER_COUNT,
        1
      ).getValues();

      // Process away lineup
      for (var i = 0; i < awayLineup.length; i++) {
        var playerName = String(awayLineup[i][0]).trim();
        if (!playerName || playerName === "") continue;

        var lineupPosition = i + 1;
        var key = playerName + "|" + awayTeam;

        if (!lineupData[key]) {
          lineupData[key] = {
            playerName: playerName,
            team: awayTeam,
            totalPosition: 0,
            gamesCount: 0
          };
        }

        lineupData[key].totalPosition += lineupPosition;
        lineupData[key].gamesCount++;
      }

      // Process home lineup
      for (var i = 0; i < homeLineup.length; i++) {
        var playerName = String(homeLineup[i][0]).trim();
        if (!playerName || playerName === "") continue;

        var lineupPosition = i + 1;
        var key = playerName + "|" + homeTeam;

        if (!lineupData[key]) {
          lineupData[key] = {
            playerName: playerName,
            team: homeTeam,
            totalPosition: 0,
            gamesCount: 0
          };
        }

        lineupData[key].totalPosition += lineupPosition;
        lineupData[key].gamesCount++;
      }

      // Progress logging every 5 games
      if ((s + 1) % 5 === 0) {
        Logger.log("Processed " + (s + 1) + "/" + gameSheets.length + " game sheets");
      }

    } catch (e) {
      Logger.log("Error reading game sheet " + sheetName + ": " + e.toString());
    }
  }

  // Calculate average lineup positions
  for (var key in lineupData) {
    lineupData[key].averagePosition = lineupData[key].totalPosition / lineupData[key].gamesCount;
  }

  var endTime = new Date().getTime();
  var duration = (endTime - startTime) / 1000;
  Logger.log("Lineup data loaded in " + duration.toFixed(1) + " seconds");

  // Cache for this execution
  LINEUP_DATA_CACHE = lineupData;

  return lineupData;
}

/**
 * Calculate league-wide percentiles for all stats
 * USES CONFIG-DEFINED COLUMN MAPPINGS
 */
function calculateLeaguePercentiles() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hittingSheet = ss.getSheetByName(CONFIG.HITTING_STATS_SHEET);
  var pitchingSheet = ss.getSheetByName(CONFIG.PITCHING_STATS_SHEET);
  var fieldingSheet = ss.getSheetByName(CONFIG.FIELDING_STATS_SHEET);

  var leagueStats = {
    hitting: {},
    pitching: {},
    fielding: {}
  };

  var teamData = getTeamData();
  var avgTeamGames = RETENTION_CONFIG.LEAGUE.GAMES_PER_SEASON;

  // Calculate actual average team games
  var teamCount = 0;
  var totalGames = 0;
  for (var team in teamData) {
    if (teamData[team].gamesPlayed && typeof teamData[team].gamesPlayed === 'number') {
      totalGames += teamData[team].gamesPlayed;
      teamCount++;
    }
  }
  if (teamCount > 0) {
    avgTeamGames = totalGames / teamCount;
  }

  var minAB = RETENTION_CONFIG.getMinABForQualification(avgTeamGames);
  var minIP = RETENTION_CONFIG.getMinIPForQualification(avgTeamGames);
  var minGP = RETENTION_CONFIG.getMinGPForQualification(avgTeamGames);

  Logger.log("Qualification thresholds: AB=" + minAB + ", IP=" + minIP + ", GP=" + minGP);

  // Collect hitting stats for qualified players
  if (hittingSheet) {
    var cols = RETENTION_CONFIG.HITTING_COLUMNS;
    var hittingLastRow = hittingSheet.getLastRow();

    if (hittingLastRow > 1) {
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var data = hittingSheet.getRange(2, 1, hittingLastRow - 1, numCols).getValues();

      var avgList = [];
      var obpList = [];
      var slgList = [];
      var opsList = [];
      var hrList = [];
      var rbiList = [];

      for (var i = 0; i < data.length; i++) {
        var ab = data[i][cols.AB - 1];
        if (ab >= minAB) {
          avgList.push(data[i][cols.AVG - 1]);
          obpList.push(data[i][cols.OBP - 1]);
          slgList.push(data[i][cols.SLG - 1]);
          opsList.push(data[i][cols.OPS - 1]);
          hrList.push(data[i][cols.HR - 1]);
          rbiList.push(data[i][cols.RBI - 1]);
        }
      }

      leagueStats.hitting.avg = avgList.sort(function(a, b) { return a - b; });
      leagueStats.hitting.obp = obpList.sort(function(a, b) { return a - b; });
      leagueStats.hitting.slg = slgList.sort(function(a, b) { return a - b; });
      leagueStats.hitting.ops = opsList.sort(function(a, b) { return a - b; });
      leagueStats.hitting.hr = hrList.sort(function(a, b) { return a - b; });
      leagueStats.hitting.rbi = rbiList.sort(function(a, b) { return a - b; });
    }
  }

  // Collect pitching stats for qualified players
  if (pitchingSheet) {
    var cols = RETENTION_CONFIG.PITCHING_COLUMNS;
    var pitchingLastRow = pitchingSheet.getLastRow();

    if (pitchingLastRow > 1) {
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var data = pitchingSheet.getRange(2, 1, pitchingLastRow - 1, numCols).getValues();

      var eraList = [];
      var whipList = [];
      var baaList = [];

      for (var i = 0; i < data.length; i++) {
        var ip = data[i][cols.IP - 1];
        if (ip >= minIP) {
          eraList.push(data[i][cols.ERA - 1]);
          whipList.push(data[i][cols.WHIP - 1]);
          baaList.push(data[i][cols.BAA - 1]);
        }
      }

      leagueStats.pitching.era = eraList.sort(function(a, b) { return a - b; });
      leagueStats.pitching.whip = whipList.sort(function(a, b) { return a - b; });
      leagueStats.pitching.baa = baaList.sort(function(a, b) { return a - b; });
    }
  }

  // Collect fielding stats for qualified players
  if (fieldingSheet) {
    var cols = RETENTION_CONFIG.FIELDING_COLUMNS;
    var fieldingLastRow = fieldingSheet.getLastRow();

    if (fieldingLastRow > 1) {
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var data = fieldingSheet.getRange(2, 1, fieldingLastRow - 1, numCols).getValues();

      var netDefenseList = [];

      for (var i = 0; i < data.length; i++) {
        var gp = data[i][cols.GP - 1];
        if (gp >= minGP) {
          var np = data[i][cols.NP - 1] || 0;
          var e = data[i][cols.E - 1] || 0;
          var netDefense = (np - e) / gp;
          netDefenseList.push(netDefense);
        }
      }

      leagueStats.fielding.netDefense = netDefenseList.sort(function(a, b) { return a - b; });
    }
  }

  return leagueStats;
}

// ===== SMART UPDATE FUNCTIONS =====

/**
 * Check if Retention Grades sheet is properly formatted (v2 detection)
 * IMPROVED: More robust detection for v2 layout
 */
function isRetentionSheetFormatted(sheet) {
  if (!sheet) {
    Logger.log("Sheet does not exist - needs formatting");
    return false;
  }

  try {
    var headerRow = RETENTION_CONFIG.OUTPUT.HEADER_ROW;

    // Check if we have enough rows
    if (sheet.getLastRow() < headerRow) {
      Logger.log("Sheet has fewer than " + headerRow + " rows - needs formatting");
      return false;
    }

    // Read header row (check for v2.1 indicators)
    var headers = sheet.getRange(headerRow, 1, 1, 6).getValues()[0];

    var hasPlayer = headers[0] === "Player";
    var hasTeam = headers[1] === "Team";
    var hasDraftValue = String(headers[2]).indexOf("Draft") >= 0 || String(headers[2]).indexOf("Value") >= 0;
    var hasRegSeason = String(headers[3]).indexOf("Regular") >= 0 || String(headers[3]).indexOf("Season") >= 0;
    var hasPostseason = String(headers[4]).indexOf("Postseason") >= 0;

    var isFormatted = hasPlayer && hasTeam && hasDraftValue && hasRegSeason && hasPostseason;

    if (isFormatted) {
      Logger.log("Sheet is properly formatted (v2.1) - will update data only");
    } else {
      Logger.log("Sheet header check failed - needs formatting");
      Logger.log("  Player: " + hasPlayer + " (" + headers[0] + ")");
      Logger.log("  Team: " + hasTeam + " (" + headers[1] + ")");
      Logger.log("  Draft Value: " + hasDraftValue + " (" + headers[2] + ")");
      Logger.log("  Regular Season: " + hasRegSeason + " (" + headers[3] + ")");
      Logger.log("  Postseason: " + hasPostseason + " (" + headers[4] + ")");
    }

    return isFormatted;

  } catch (e) {
    Logger.log("Error checking sheet format: " + e.toString());
    return false;
  }
}

/**
 * UPDATE DATA ONLY: Preserves formatting AND postseason data AND manual inputs
 * V2: Also preserves Draft/Trade Value and Team Direction table
 */
function updateRetentionData(sheet, retentionGrades) {
  Logger.log("Updating retention data v2 (preserving formatting, postseason, and manual inputs)");

  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  var cols = RETENTION_CONFIG.OUTPUT;

  // Find where Team Direction section starts (comes before Postseason)
  var directionRow = findTeamDirectionSection(sheet);
  var lastDataRow;

  if (directionRow > 0) {
    lastDataRow = directionRow - 2;
    Logger.log("Clearing data rows " + dataStartRow + " to " + lastDataRow + " (preserving Team Direction at row " + directionRow + ")");
  } else {
    // Fallback: try finding postseason section
    var postseasonRow = findPostseasonSection(sheet);
    if (postseasonRow > 0) {
      lastDataRow = postseasonRow - 2;
      Logger.log("Clearing data rows " + dataStartRow + " to " + lastDataRow + " (preserving postseason at row " + postseasonRow + ")");
    } else {
      lastDataRow = dataStartRow + 200;
    }
  }

  // CRITICAL: Only clear auto-calculated columns, preserve manual inputs
  // V2.1: Manual columns (PRESERVED): C (draft value), F, I, L (modifiers), O (chemistry), P (direction via VLOOKUP)

  var numRows = lastDataRow - dataStartRow + 1;

  // Clear player name and team
  sheet.getRange(dataStartRow, cols.COL_PLAYER, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_TEAM, numRows, 1).clearContent();

  // PRESERVE Draft Value (Col C) - do not clear

  // Clear TS components and total (preserve modifier at Col F)
  sheet.getRange(dataStartRow, cols.COL_REG_SEASON, numRows, 1).clearContent();  // D - Regular Season
  sheet.getRange(dataStartRow, cols.COL_POSTSEASON, numRows, 1).clearContent();  // E - Postseason (VLOOKUP)
  sheet.getRange(dataStartRow, cols.COL_TS_TOTAL, numRows, 1).clearContent();    // G - TS Total

  // Clear PT base and total (preserve modifier at Col I)
  sheet.getRange(dataStartRow, cols.COL_PT_BASE, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_PT_TOTAL, numRows, 1).clearContent();

  // Clear Performance base and total (preserve modifier at Col L)
  sheet.getRange(dataStartRow, cols.COL_PERF_BASE, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_PERF_TOTAL, numRows, 1).clearContent();

  // Clear totals (preserve chemistry at O and direction at P)
  sheet.getRange(dataStartRow, cols.COL_AUTO_TOTAL, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_MANUAL_TOTAL, numRows, 1).clearContent();

  // Clear final grade and details
  sheet.getRange(dataStartRow, cols.COL_FINAL_GRADE, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_DETAILS, numRows, 1).clearContent();

  // Write new data (will preserve existing manual values)
  writePlayerData(sheet, retentionGrades);

  Logger.log("Data update complete - postseason, manual inputs, and Team Direction table preserved");
}

/**
 * Write player data rows to sheet
 * CRITICAL: Only writes to AUTO-CALCULATED columns, preserves MANUAL columns
 * V2: Preserves Draft Value, uses Performance instead of Awards
 */
function writePlayerData(sheet, retentionGrades) {
  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  var cols = RETENTION_CONFIG.OUTPUT;

  // Sort by team, then by player name
  retentionGrades.sort(function(a, b) {
    if (a.team !== b.team) {
      return a.team.localeCompare(b.team);
    }
    return a.playerName.localeCompare(b.playerName);
  });

  // Prepare data arrays for batch writing (only auto-calculated columns)
  // V2.1: Split TS into Regular Season + Postseason
  var playerNames = [];
  var teams = [];
  var regSeasonValues = [];
  var ptBaseValues = [];
  var perfBaseValues = [];
  var autoTotalValues = [];
  var detailsValues = [];

  for (var i = 0; i < retentionGrades.length; i++) {
    var grade = retentionGrades[i];

    // Combine all details
    var allDetails = "Success: " + grade.teamSuccess.details + " | " +
                     "Time: " + grade.playTime.details + " | " +
                     "Performance: " + grade.performance.details;

    playerNames.push([grade.playerName]);
    teams.push([grade.team]);
    regSeasonValues.push([grade.teamSuccess.regularSeason.toFixed(1)]);  // V2.1: Split TS
    // Postseason will be VLOOKUP formula, not written here
    ptBaseValues.push([grade.playTime.total.toFixed(1)]);
    perfBaseValues.push([grade.performance.total.toFixed(1)]);
    autoTotalValues.push([grade.autoTotal.toFixed(1)]);
    detailsValues.push([allDetails]);
  }

  var numRows = retentionGrades.length;

  if (numRows === 0) return;

  // Write auto-calculated columns only (batch operations)
  // V2.1: Write Regular Season, Postseason will be VLOOKUP formula
  sheet.getRange(dataStartRow, cols.COL_PLAYER, numRows, 1).setValues(playerNames);
  sheet.getRange(dataStartRow, cols.COL_TEAM, numRows, 1).setValues(teams);
  sheet.getRange(dataStartRow, cols.COL_REG_SEASON, numRows, 1).setValues(regSeasonValues);  // D
  // Col E (Postseason) will be set with VLOOKUP formula below
  sheet.getRange(dataStartRow, cols.COL_PT_BASE, numRows, 1).setValues(ptBaseValues);
  sheet.getRange(dataStartRow, cols.COL_PERF_BASE, numRows, 1).setValues(perfBaseValues);
  sheet.getRange(dataStartRow, cols.COL_AUTO_TOTAL, numRows, 1).setValues(autoTotalValues);
  sheet.getRange(dataStartRow, cols.COL_DETAILS, numRows, 1).setValues(detailsValues);

  // Write formulas (V2.1 weighted formulas with split TS)
  for (var i = 0; i < numRows; i++) {
    var row = dataStartRow + i;

    // Col E - Postseason Success (VLOOKUP from PostseasonResults table)
    // Format: =IF(B="",0,IFERROR(VLOOKUP(B,PostseasonResults,2,FALSE),0))
    sheet.getRange(row, cols.COL_POSTSEASON).setFormula(
      "=IF(B" + row + "=\"\",0,IFERROR(VLOOKUP(B" + row + ",PostseasonResults,3,FALSE),0))"
    );

    // Col G - TS Total = Regular Season + Postseason + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_TS_TOTAL).setFormula(
      "=MIN(20,MAX(0,D" + row + "+E" + row + "+F" + row + "))"
    );

    // Col J - PT Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_PT_TOTAL).setFormula(
      "=MIN(20,MAX(0,H" + row + "+I" + row + "))"
    );

    // Col M - Performance Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_PERF_TOTAL).setFormula(
      "=MIN(20,MAX(0,K" + row + "+L" + row + "))"
    );

    // Col Q - Manual Total = (12% Chemistry + 21% Direction) × 5 for d100 scale
    sheet.getRange(row, cols.COL_MANUAL_TOTAL).setFormula(
      "=ROUND((O" + row + "*0.12+P" + row + "*0.21)*5,1)"
    );

    // Col R - Final Grade = Weighted formula × 5 for d100 scale
    // (TS*0.18 + PT*0.32 + Perf*0.17) * 5 + Manual Total
    sheet.getRange(row, cols.COL_FINAL_GRADE).setFormula(
      "=ROUND((G" + row + "*0.18+J" + row + "*0.32+M" + row + "*0.17)*5+Q" + row + ",0)"
    );
  }

  // Apply formatting (only to auto-calculated columns and new rows)
  applyDataFormatting(sheet, dataStartRow, numRows);

  // Apply final grade color coding
  Utilities.sleep(500);
  applyFinalGradeFormatting(sheet, dataStartRow, numRows);

  Logger.log("Wrote " + numRows + " player rows (preserved manual input columns)");
}

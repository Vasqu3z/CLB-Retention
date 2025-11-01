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
 * V3 UPDATE: Accepts loadedGameData parameter to use cached data instead of redundant I/O
 */
function calculateRetentionGrades(loadedGameData) {
  try {
    // Validate config before starting
    RETENTION_CONFIG.validate();

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (RETENTION_CONFIG.DEBUG.SHOW_PROGRESS_TOASTS) {
      ss.toast("Starting retention grade calculation v3...", "Processing", 3);
    }

    // V3 UPDATE: Load data from cache instead of re-reading sheets
    Logger.log("=== RETENTION GRADES V3 CALCULATION START ===");

    Logger.log("Step 1/3: Loading data from cache...");
    var playerStats = loadedGameData.playerStats; // This is an OBJECT, not an array
    var teamStats = loadedGameData.teamStatsWithH2H; // Contains W, L, Standings
    Logger.log("Loaded " + Object.keys(playerStats).length + " players from cache");
    Logger.log("Loaded " + Object.keys(teamStats).length + " teams from cache");

    // V3 UPDATE: We still need lineup data and percentiles
    Logger.log("Step 2/3: Loading supporting data...");
    var lineupData = getLineupPositionData(); // This reads box scores (not cached)
    Logger.log("Loaded lineup data for " + Object.keys(lineupData).length + " player-team combinations");

    var leagueStats = calculateLeaguePercentilesFromCache(playerStats, teamStats); // V3: New function
    Logger.log("Percentiles calculated from cache - Hitters: " + (leagueStats.hitting.avg ? leagueStats.hitting.avg.length : 0) +
               ", Pitchers: " + (leagueStats.pitching.era ? leagueStats.pitching.era.length : 0));

    // Read existing draft values from sheet if it exists (for draft expectations)
    Logger.log("Step 6.5/7: Reading existing draft values from sheet...");
    var existingDraftValues = {};
    var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);
    if (sheet && isRetentionSheetFormatted(sheet)) {
      try {
        var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
        var lastRow = sheet.getLastRow();
        var numRows = Math.max(0, lastRow - dataStartRow + 1);

        if (numRows > 0) {
          var playerNames = sheet.getRange(dataStartRow, RETENTION_CONFIG.OUTPUT.COL_PLAYER, numRows, 1).getValues();
          var draftValues = sheet.getRange(dataStartRow, RETENTION_CONFIG.OUTPUT.COL_DRAFT_VALUE, numRows, 1).getValues();

          for (var i = 0; i < numRows; i++) {
            var playerName = String(playerNames[i][0]).trim();
            var draftValue = draftValues[i][0];
            if (playerName && draftValue !== "" && draftValue !== null) {
              existingDraftValues[playerName] = draftValue;
            }
          }
          Logger.log("Loaded " + Object.keys(existingDraftValues).length + " existing draft values");
        }
      } catch (e) {
        Logger.log("Could not read existing draft values: " + e.toString());
      }
    }

    Logger.log("Step 3/3: Calculating retention grades...");

    // V3 UPDATE: Calculate grades for each player (loop over playerStats object)
    var retentionGrades = [];
    var playerCount = 0;
    var totalPlayers = Object.keys(playerStats).length;

    for (var playerName in playerStats) {
      if (!playerStats.hasOwnProperty(playerName)) continue;

      var stats = playerStats[playerName];

      // V3 UPDATE: Reconstruct player object from playerStats
      var player = {
        name: playerName,
        team: stats.team,
        hitting: {
          gp: stats.hitting.GP || 0,
          ab: stats.hitting.AB || 0,
          h: stats.hitting.H || 0,
          hr: stats.hitting.HR || 0,
          rbi: stats.hitting.RBI || 0,
          bb: stats.hitting.BB || 0,
          k: stats.hitting.K || 0,
          rob: stats.hitting.ROB || 0,
          dp: stats.hitting.DP || 0,
          tb: stats.hitting.TB || 0,
          avg: stats.hitting.AVG || 0,
          obp: stats.hitting.OBP || 0,
          slg: stats.hitting.SLG || 0,
          ops: stats.hitting.OPS || 0
        },
        pitching: {
          gp: stats.pitching.GP || 0,
          ip: stats.pitching.IP || 0,
          bf: stats.pitching.BF || 0,
          h: stats.pitching.H || 0,
          hr: stats.pitching.HR || 0,
          r: stats.pitching.R || 0,
          bb: stats.pitching.BB || 0,
          k: stats.pitching.K || 0,
          w: stats.pitching.W || 0,
          l: stats.pitching.L || 0,
          sv: stats.pitching.SV || 0,
          era: stats.pitching.ERA || 0,
          whip: stats.pitching.WHIP || 0,
          baa: stats.pitching.BAA || 0
        },
        fielding: {
          gp: stats.fielding.GP || 0,
          np: stats.fielding.NP || 0,
          e: stats.fielding.E || 0,
          sb: stats.fielding.SB || 0
        }
      };

      // V3 UPDATE: Calculate each factor (functions in RetentionFactors_v2.js)
      // Pass teamStats instead of separate teamData, standingsData, postseasonData
      var teamSuccess = calculateTeamSuccessV3(player, teamStats);
      var playTime = calculatePlayTimeV3(player, teamStats, lineupData);

      // Get draft value for this player (if exists from previous run)
      var draftValue = existingDraftValues[player.name] || "";
      var performance = calculatePerformanceV3(player, leagueStats, teamStats, draftValue);

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

      playerCount++;
      if (playerCount % 20 === 0) {
        Logger.log("Processed " + playerCount + "/" + totalPlayers + " players");
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

    Logger.log("=== RETENTION GRADES V3 CALCULATION COMPLETE ===");

    // Clear cache
    clearLineupCache();

    SpreadsheetApp.getActiveSpreadsheet().toast(
      "✅ Retention grades v3 calculated for " + retentionGrades.length + " players using cached data! " +
      "Edit yellow/blue cells: Draft Value (Col C), Modifiers (Cols F, I, L), Chemistry (Col O). " +
      "Direction (Col P) auto-fills via VLOOKUP from Team Direction table.",
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

/**
 * V3 HELPER: Calculate league percentiles from in-memory playerStats object
 * instead of re-reading the sheets.
 * This is the cached version used by calculateRetentionGradesV3.
 */
function calculateLeaguePercentilesFromCache(playerStats, teamStats) {
  Logger.log("Calculating league percentiles from cached playerStats...");

  var leagueStats = {
    hitting: {},
    pitching: {},
    fielding: {}
  };

  // Calculate average team games for qualification thresholds
  var avgTeamGames = RETENTION_CONFIG.LEAGUE.GAMES_PER_SEASON;
  var teamCount = 0;
  var totalGames = 0;

  for (var teamName in teamStats) {
    if (teamStats[teamName].gamesPlayed && typeof teamStats[teamName].gamesPlayed === 'number') {
      totalGames += teamStats[teamName].gamesPlayed;
      teamCount++;
    }
  }
  if (teamCount > 0) {
    avgTeamGames = totalGames / teamCount;
  }

  var minAB = RETENTION_CONFIG.getMinABForQualification(avgTeamGames);
  var minIP = RETENTION_CONFIG.getMinIPForQualification(avgTeamGames);
  var minGP = RETENTION_CONFIG.getMinGPForQualification(avgTeamGames);

  Logger.log("Qualification thresholds from cache: AB=" + minAB + ", IP=" + minIP + ", GP=" + minGP);

  // Collect hitting stats for qualified players
  var avgList = [], obpList = [], slgList = [], opsList = [], hrList = [], rbiList = [];

  // Collect pitching stats for qualified players
  var eraList = [], whipList = [], baaList = [];

  // Collect fielding stats for qualified players
  var netDefenseList = [];

  // Loop over playerStats object
  for (var playerName in playerStats) {
    if (!playerStats.hasOwnProperty(playerName)) continue;

    var stats = playerStats[playerName];

    // Hitting stats (if qualified)
    if (stats.hitting && stats.hitting.AB >= minAB) {
      avgList.push(stats.hitting.AVG || 0);
      obpList.push(stats.hitting.OBP || 0);
      slgList.push(stats.hitting.SLG || 0);
      opsList.push(stats.hitting.OPS || 0);
      hrList.push(stats.hitting.HR || 0);
      rbiList.push(stats.hitting.RBI || 0);
    }

    // Pitching stats (if qualified)
    if (stats.pitching && stats.pitching.IP >= minIP) {
      eraList.push(stats.pitching.ERA || 0);
      whipList.push(stats.pitching.WHIP || 0);
      baaList.push(stats.pitching.BAA || 0);
    }

    // Fielding stats (if qualified)
    if (stats.fielding && stats.fielding.GP >= minGP) {
      var np = stats.fielding.NP || 0;
      var e = stats.fielding.E || 0;
      var gp = stats.fielding.GP || 1;
      var netDefense = (np - e) / gp;
      netDefenseList.push(netDefense);
    }
  }

  // Sort all lists
  leagueStats.hitting.avg = avgList.sort(function(a, b) { return a - b; });
  leagueStats.hitting.obp = obpList.sort(function(a, b) { return a - b; });
  leagueStats.hitting.slg = slgList.sort(function(a, b) { return a - b; });
  leagueStats.hitting.ops = opsList.sort(function(a, b) { return a - b; });
  leagueStats.hitting.hr = hrList.sort(function(a, b) { return a - b; });
  leagueStats.hitting.rbi = rbiList.sort(function(a, b) { return a - b; });

  leagueStats.pitching.era = eraList.sort(function(a, b) { return a - b; });
  leagueStats.pitching.whip = whipList.sort(function(a, b) { return a - b; });
  leagueStats.pitching.baa = baaList.sort(function(a, b) { return a - b; });

  leagueStats.fielding.netDefense = netDefenseList.sort(function(a, b) { return a - b; });

  Logger.log("Percentile calculation from cache complete - Hitters: " + avgList.length + ", Pitchers: " + eraList.length + ", Fielders: " + netDefenseList.length);

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
    // Column 3: Accept "Record", "Regular", or "Season"
    var hasRegSeason = String(headers[3]).indexOf("Record") >= 0 ||
                       String(headers[3]).indexOf("Regular") >= 0 ||
                       String(headers[3]).indexOf("Season") >= 0;
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

  // V3 UPDATE: Batch all formulas for performance (eliminates N+1 loops)
  // Build formula arrays
  var postseasonFormulas = [];
  var tsTotalFormulas = [];
  var ptTotalFormulas = [];
  var perfTotalFormulas = [];
  var manualTotalFormulas = [];
  var finalGradeFormulas = [];

  for (var i = 0; i < numRows; i++) {
    var row = dataStartRow + i;

    // Col E - Postseason Success (VLOOKUP from PostseasonResults table)
    postseasonFormulas.push([
      "=IF(B" + row + "=\"\",0,IFERROR(VLOOKUP(B" + row + ",PostseasonResults,3,FALSE),0))"
    ]);

    // Col G - TS Total = Regular Season + Postseason + Modifier (capped 0-20)
    tsTotalFormulas.push([
      "=MIN(20,MAX(0,D" + row + "+E" + row + "+F" + row + "))"
    ]);

    // Col J - PT Total = Base + Modifier (capped 0-20)
    ptTotalFormulas.push([
      "=MIN(20,MAX(0,H" + row + "+I" + row + "))"
    ]);

    // Col M - Performance Total = Base + Modifier (capped 0-20)
    perfTotalFormulas.push([
      "=MIN(20,MAX(0,K" + row + "+L" + row + "))"
    ]);

    // Col Q - Manual Total = (12% Chemistry + 21% Direction) × 4.5 for d95 scale (5-95 range)
    manualTotalFormulas.push([
      "=ROUND((O" + row + "*0.12+P" + row + "*0.21)*4.5,1)"
    ]);

    // Col R - Final Grade = Weighted formula × 4.5 + 5 for d95 scale (5-95 range)
    // All factors: (TS*0.18 + PT*0.32 + Perf*0.17 + Chem*0.12 + Dir*0.21) × 4.5 + 5
    finalGradeFormulas.push([
      "=ROUND((G" + row + "*0.18+J" + row + "*0.32+M" + row + "*0.17+O" + row + "*0.12+P" + row + "*0.21)*4.5+5,0)"
    ]);
  }

  // V3 UPDATE: Apply all formulas in batched operations
  sheet.getRange(dataStartRow, cols.COL_POSTSEASON, numRows, 1).setFormulas(postseasonFormulas);
  sheet.getRange(dataStartRow, cols.COL_TS_TOTAL, numRows, 1).setFormulas(tsTotalFormulas);
  sheet.getRange(dataStartRow, cols.COL_PT_TOTAL, numRows, 1).setFormulas(ptTotalFormulas);
  sheet.getRange(dataStartRow, cols.COL_PERF_TOTAL, numRows, 1).setFormulas(perfTotalFormulas);
  sheet.getRange(dataStartRow, cols.COL_MANUAL_TOTAL, numRows, 1).setFormulas(manualTotalFormulas);
  sheet.getRange(dataStartRow, cols.COL_FINAL_GRADE, numRows, 1).setFormulas(finalGradeFormulas);

  // Apply formatting (only to auto-calculated columns and new rows)
  applyDataFormatting(sheet, dataStartRow, numRows);

  // Apply final grade color coding
  Utilities.sleep(500);
  applyFinalGradeFormatting(sheet, dataStartRow, numRows);

  Logger.log("Wrote " + numRows + " player rows (preserved manual input columns)");
}

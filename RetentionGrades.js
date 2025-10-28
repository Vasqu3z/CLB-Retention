// ===== RETENTION GRADES - CALCULATION ENGINE =====
// Calculates three of five retention factors (each worth 20 points)
// Manual factors (Teammate Chemistry, Team Direction) entered by user
// 
// Design Philosophy:
// - Proportional evaluation (percentiles) for all performance metrics
// - Mid-season trades reduce Play Time but not Awards
// - Reading actual lineup positions from box scores
// - Using standings from League Hub for Team Success
// - SMART UPDATING: Preserves user formatting, only updates data
// - OPTIMIZED: Batch operations, caching, single-pass processing
// - References CONFIG object for sheet names and box score settings

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
 * Called from menu: ⭐ Retention → Calculate Retention Grades
 * SMART UPDATE: Only rebuilds formatting if sheet is new/corrupted
 */
function calculateRetentionGrades() {
  try {
    // Validate config before starting
    RETENTION_CONFIG.validate();
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (RETENTION_CONFIG.DEBUG.SHOW_PROGRESS_TOASTS) {
      ss.toast("Starting retention grade calculation...", "Processing", 3);
    }
    
    // Get all necessary data
    Logger.log("=== RETENTION GRADES CALCULATION START ===");
    
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
      
      // Calculate each factor
      var teamSuccess = calculateTeamSuccess(player, teamData, standingsData, postseasonData);
      var playTime = calculatePlayTime(player, teamData, lineupData);
      var awards = calculateAwards(player, leagueStats);
      
      retentionGrades.push({
        playerName: player.name,
        team: player.team,
        teamSuccess: teamSuccess,
        playTime: playTime,
        awards: awards,
        autoTotal: teamSuccess.total + playTime.total + awards.total,
        // Manual factors placeholders (to be filled by user)
        tsModifier: 0,
        ptModifier: 0,
        awardsModifier: 0,
        chemistry: 0,
        direction: 0,
        starPoints: 0,
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
    
    Logger.log("=== RETENTION GRADES CALCULATION COMPLETE ===");
    
    // Clear cache
    clearLineupCache();
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Retention grades calculated for " + retentionGrades.length + " players. " +
      "Edit yellow/blue cells: Modifiers (Cols D, G, K), Chemistry (Col N), Direction (Col O), Star Points (Col I).",
      "✅ Calculation Complete",
      8
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
 * Parse postseason finish into points
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
  
  var teamCount = 0;
  var totalGames = 0;
  for (var team in teamData) {
    totalGames += teamData[team].gamesPlayed;
    teamCount++;
  }
  if (teamCount > 0) {
    avgTeamGames = totalGames / teamCount;
  }
  
  var minAB = RETENTION_CONFIG.getMinABForQualification(avgTeamGames);
  var minIP = RETENTION_CONFIG.getMinIPForQualification(avgTeamGames);
  
  // Collect hitting stats
  if (hittingSheet) {
    var hittingLastRow = hittingSheet.getLastRow();
    if (hittingLastRow > 1) {
      var cols = RETENTION_CONFIG.HITTING_COLUMNS;
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var data = hittingSheet.getRange(2, 1, hittingLastRow - 1, numCols).getValues();
      
      var stats = {
        avg: [],
        obp: [],
        slg: [],
        ops: [],
        hr: [],
        rbi: []
      };
      
      for (var i = 0; i < data.length; i++) {
        var ab = data[i][cols.AB - 1];
        
        if (ab >= minAB) {
          stats.avg.push(data[i][cols.AVG - 1]);
          stats.obp.push(data[i][cols.OBP - 1]);
          stats.slg.push(data[i][cols.SLG - 1]);
          stats.ops.push(data[i][cols.OPS - 1]);
          stats.hr.push(data[i][cols.HR - 1]);
          stats.rbi.push(data[i][cols.RBI - 1]);
        }
      }
      
      for (var stat in stats) {
        stats[stat].sort(function(a, b) { return a - b; });
      }
      
      leagueStats.hitting = stats;
      
      if (RETENTION_CONFIG.DEBUG.ENABLE_LOGGING) {
        Logger.log("Hitting percentiles: " + stats.avg.length + " qualified players (min " + minAB + " AB)");
      }
    }
  }
  
  // Collect pitching stats
  if (pitchingSheet) {
    var pitchingLastRow = pitchingSheet.getLastRow();
    if (pitchingLastRow > 1) {
      var cols = RETENTION_CONFIG.PITCHING_COLUMNS;
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var data = pitchingSheet.getRange(2, 1, pitchingLastRow - 1, numCols).getValues();
      
      var stats = {
        era: [],
        whip: [],
        baa: []
      };
      
      for (var i = 0; i < data.length; i++) {
        var ip = data[i][cols.IP - 1];
        
        if (ip >= minIP) {
          stats.era.push(data[i][cols.ERA - 1]);
          stats.whip.push(data[i][cols.WHIP - 1]);
          stats.baa.push(data[i][cols.BAA - 1]);
        }
      }
      
      for (var stat in stats) {
        stats[stat].sort(function(a, b) { return a - b; });
      }
      
      leagueStats.pitching = stats;
      
      if (RETENTION_CONFIG.DEBUG.ENABLE_LOGGING) {
        Logger.log("Pitching percentiles: " + stats.era.length + " qualified pitchers (min " + minIP + " IP)");
      }
    }
  }
  
  // Collect fielding stats
  if (fieldingSheet) {
    var fieldingLastRow = fieldingSheet.getLastRow();
    if (fieldingLastRow > 1) {
      var cols = RETENTION_CONFIG.FIELDING_COLUMNS;
      var numCols = Math.max.apply(null, Object.keys(cols).map(function(k) { return cols[k]; }));
      var data = fieldingSheet.getRange(2, 1, fieldingLastRow - 1, numCols).getValues();
      
      var netDefenseValues = [];
      var minGP = RETENTION_CONFIG.getMinGPForQualification(avgTeamGames);
      
      for (var i = 0; i < data.length; i++) {
        var gp = data[i][cols.GP - 1];
        var np = data[i][cols.NP - 1] || 0;
        var e = data[i][cols.E - 1] || 0;
        
        if (gp >= minGP) {
          var netDefense = (np - e) / gp;
          netDefenseValues.push(netDefense);
        }
      }
      
      netDefenseValues.sort(function(a, b) { return a - b; });
      leagueStats.fielding.netDefense = netDefenseValues;
      
      if (RETENTION_CONFIG.DEBUG.ENABLE_LOGGING) {
        Logger.log("Fielding percentiles: " + netDefenseValues.length + " qualified fielders (min " + minGP + " GP)");
      }
    }
  }
  
  return leagueStats;
}

// ===== FACTOR CALCULATION FUNCTIONS =====

/**
 * FACTOR 1: Team Success (0-20 points)
 * Regular season standing (8pts) + postseason finish (12pts)
 * USES STANDINGS FROM LEAGUE HUB (not win%)
 */
function calculateTeamSuccess(player, teamData, standingsData, postseasonData) {
  var config = RETENTION_CONFIG.TEAM_SUCCESS;
  var team = teamData[player.team];
  
  var breakdown = {
    regularSeason: 0,
    postseason: 0,
    total: 0,
    details: ""
  };
  
  if (!team) {
    breakdown.details = "Team not found";
    return breakdown;
  }
  
  // Regular season points (based on final standing)
  var standing = standingsData[player.team];
  
  if (standing) {
    var regConfig = config.REGULAR_SEASON;
    
    switch(standing) {
      case 1:
        breakdown.regularSeason = regConfig.FIRST;
        break;
      case 2:
        breakdown.regularSeason = regConfig.SECOND;
        break;
      case 3:
        breakdown.regularSeason = regConfig.THIRD;
        break;
      case 4:
        breakdown.regularSeason = regConfig.FOURTH;
        break;
      case 5:
        breakdown.regularSeason = regConfig.FIFTH;
        break;
      case 6:
        breakdown.regularSeason = regConfig.SIXTH;
        break;
      case 7:
        breakdown.regularSeason = regConfig.SEVENTH;
        break;
      case 8:
        breakdown.regularSeason = regConfig.EIGHTH;
        break;
      default:
        breakdown.regularSeason = 0;
    }
    
    breakdown.details = "Reg: " + breakdown.regularSeason + " pts (" + 
                        standing + getOrdinalSuffix(standing) + " place)";
  } else {
    // Fallback if standings not available
    breakdown.details = "Reg: No standing data";
  }
  
  // Postseason points
  if (postseasonData[player.team] !== undefined) {
    breakdown.postseason = postseasonData[player.team];
    breakdown.details += ", Post: " + breakdown.postseason + " pts";
  } else {
    breakdown.details += ", Post: 0 pts";
  }
  
  breakdown.total = breakdown.regularSeason + breakdown.postseason;
  
  return breakdown;
}

/**
 * FACTOR 2: Play Time (0-20 points)
 * Games played + usage quality + star points
 * CRITICAL: Only counts games with CURRENT team (uses lineup data)
 */
function calculatePlayTime(player, teamData, lineupData) {
  var config = RETENTION_CONFIG.PLAY_TIME;
  var team = teamData[player.team];
  
  var breakdown = {
    gamesPlayed: 0,
    usageQuality: 0,
    starPoints: 0,
    total: 0,
    details: ""
  };
  
  if (!team) {
    breakdown.details = "Team not found: " + player.team;
    return breakdown;
  }
  
  var teamGamesPlayed = team.gamesPlayed || 0;
  if (teamGamesPlayed === 0) {
    breakdown.details = "Team has 0 games played";
    return breakdown;
  }
  
  // CRITICAL FIX: Use lineup data for GP (team-specific)
  var lineupKey = player.name + "|" + player.team;
  var hasLineupData = lineupData && lineupData[lineupKey];
  
  var playerGamesWithTeam = 0;
  
  if (hasLineupData) {
    // Use lineup data (most accurate - only counts current team)
    playerGamesWithTeam = lineupData[lineupKey].gamesCount;
  } else {
    // Fallback to hitting GP (may be inflated for traded players)
    playerGamesWithTeam = player.hitting.gp || 0;
  }
  
  if (playerGamesWithTeam === 0) {
    breakdown.details = "No games played with " + player.team;
    return breakdown;
  }
  
  // Games played component (0-8 points)
  var gpPct = playerGamesWithTeam / teamGamesPlayed;
  var gpConfig = config.GAMES_PLAYED;
  
  if (gpPct >= gpConfig.FULL_TIME.threshold) {
    breakdown.gamesPlayed = gpConfig.FULL_TIME.points;
  } else if (gpPct >= gpConfig.REGULAR.threshold) {
    breakdown.gamesPlayed = gpConfig.REGULAR.points;
  } else if (gpPct >= gpConfig.ROTATION.threshold) {
    breakdown.gamesPlayed = gpConfig.ROTATION.points;
  } else if (gpPct >= gpConfig.BENCH.threshold) {
    breakdown.gamesPlayed = gpConfig.BENCH.points;
  } else {
    breakdown.gamesPlayed = gpConfig.MINIMAL.points;
  }
  
  // Usage quality - lineup position (hitters) or IP/game (pitchers)
  if (hasLineupData) {
    // METHOD 1: Use actual lineup position from box scores
    var avgLineupPos = lineupData[lineupKey].averagePosition;
    var lineupConfig = config.USAGE_QUALITY.LINEUP_POSITION;
    
    if (avgLineupPos <= lineupConfig.TOP_THREE.threshold) {
      breakdown.usageQuality = lineupConfig.TOP_THREE.points;
    } else if (avgLineupPos <= lineupConfig.FOUR_FIVE.threshold) {
      breakdown.usageQuality = lineupConfig.FOUR_FIVE.points;
    } else if (avgLineupPos <= lineupConfig.SIX_SEVEN.threshold) {
      breakdown.usageQuality = lineupConfig.SIX_SEVEN.points;
    } else if (avgLineupPos <= lineupConfig.EIGHT_NINE.threshold) {
      breakdown.usageQuality = lineupConfig.EIGHT_NINE.points;
    } else {
      breakdown.usageQuality = lineupConfig.BENCH.points;
    }
    
    breakdown.details = "GP: " + breakdown.gamesPlayed + " pts (" + 
                       playerGamesWithTeam + "/" + teamGamesPlayed + " games, " +
                       (gpPct * 100).toFixed(0) + "%), Lineup: " + 
                       avgLineupPos.toFixed(1) + " spot (" + breakdown.usageQuality + " pts)";
  } else {
    // METHOD 2: Derive from stats (fallback)
    var isPitcher = (player.pitching.ip && player.pitching.ip >= 5.0);
    
    if (isPitcher) {
      var ipPerGame = player.pitching.ip / teamGamesPlayed;
      var pitchConfig = config.USAGE_QUALITY.PITCHING_USAGE;
      
      if (ipPerGame >= pitchConfig.ACE.threshold) {
        breakdown.usageQuality = pitchConfig.ACE.points;
      } else if (ipPerGame >= pitchConfig.STARTER.threshold) {
        breakdown.usageQuality = pitchConfig.STARTER.points;
      } else if (ipPerGame >= pitchConfig.SWINGMAN.threshold) {
        breakdown.usageQuality = pitchConfig.SWINGMAN.points;
      } else if (ipPerGame >= pitchConfig.RELIEVER.threshold) {
        breakdown.usageQuality = pitchConfig.RELIEVER.points;
      } else {
        breakdown.usageQuality = pitchConfig.MOP_UP.points;
      }
      
      breakdown.details = "GP: " + breakdown.gamesPlayed + " pts (" + 
                         playerGamesWithTeam + "/" + teamGamesPlayed + " games, " +
                         (gpPct * 100).toFixed(0) + "%), IP/G: " + 
                         ipPerGame.toFixed(2) + " (" + breakdown.usageQuality + " pts)";
    } else {
      var abPerGame = playerGamesWithTeam > 0 ? player.hitting.ab / playerGamesWithTeam : 0;
      var hitConfig = config.USAGE_QUALITY.LINEUP_POSITION;
      
      if (abPerGame >= 3.5) {
        breakdown.usageQuality = hitConfig.TOP_THREE.points;
      } else if (abPerGame >= 3.0) {
        breakdown.usageQuality = hitConfig.FOUR_FIVE.points;
      } else if (abPerGame >= 2.5) {
        breakdown.usageQuality = hitConfig.SIX_SEVEN.points;
      } else if (abPerGame >= 1.5) {
        breakdown.usageQuality = hitConfig.EIGHT_NINE.points;
      } else {
        breakdown.usageQuality = hitConfig.BENCH.points;
      }
      
      breakdown.details = "GP: " + breakdown.gamesPlayed + " pts (" + 
                         playerGamesWithTeam + "/" + teamGamesPlayed + " games, " +
                         (gpPct * 100).toFixed(0) + "%), AB/G: " + 
                         abPerGame.toFixed(1) + " (" + breakdown.usageQuality + " pts, no lineup data)";
    }
  }
  
  breakdown.starPoints = 0;
  breakdown.total = breakdown.gamesPlayed + breakdown.usageQuality + breakdown.starPoints;
  
  return breakdown;
}

/**
 * FACTOR 3: Awards/Accolades (0-20 points)
 * Offensive (0-14) + Defensive (0-3) + Pitching (0-3)
 * CRITICAL: Uses stats from ALL teams (performance-based)
 */
function calculateAwards(player, leagueStats) {
  var config = RETENTION_CONFIG.AWARDS;
  
  var breakdown = {
    offensive: 0,
    defensive: 0,
    pitching: 0,
    total: 0,
    details: ""
  };
  
  var detailParts = [];
  
  var avgTeamGames = RETENTION_CONFIG.LEAGUE.GAMES_PER_SEASON;
  
  try {
    var teamData = getTeamData();
    var teamCount = 0;
    var totalGames = 0;
    
    for (var team in teamData) {
      if (teamData[team].gamesPlayed && typeof teamData[team].gamesPlayed === 'number') {
        totalGames += teamData[team].gamesPlayed;
        teamCount++;
      }
    }
    
    if (teamCount > 0 && totalGames > 0) {
      avgTeamGames = totalGames / teamCount;
    }
  } catch (e) {
    Logger.log("Error calculating avg team games: " + e.toString());
  }
  
  var minAB = RETENTION_CONFIG.getMinABForQualification(avgTeamGames);
  var minIP = RETENTION_CONFIG.getMinIPForQualification(avgTeamGames);
  var minGP = RETENTION_CONFIG.getMinGPForQualification(avgTeamGames);
  
  // ===== OFFENSIVE CONTRIBUTION (0-14 points) =====
  if (player.hitting.ab >= minAB) {
    var percentiles = [];
    
    if (leagueStats.hitting.avg && leagueStats.hitting.avg.length > 0) {
      percentiles.push(calculatePercentile(player.hitting.avg, leagueStats.hitting.avg));
    }
    if (leagueStats.hitting.obp && leagueStats.hitting.obp.length > 0) {
      percentiles.push(calculatePercentile(player.hitting.obp, leagueStats.hitting.obp));
    }
    if (leagueStats.hitting.slg && leagueStats.hitting.slg.length > 0) {
      percentiles.push(calculatePercentile(player.hitting.slg, leagueStats.hitting.slg));
    }
    if (leagueStats.hitting.ops && leagueStats.hitting.ops.length > 0) {
      percentiles.push(calculatePercentile(player.hitting.ops, leagueStats.hitting.ops));
    }
    if (leagueStats.hitting.hr && leagueStats.hitting.hr.length > 0) {
      percentiles.push(calculatePercentile(player.hitting.hr, leagueStats.hitting.hr));
    }
    if (leagueStats.hitting.rbi && leagueStats.hitting.rbi.length > 0) {
      percentiles.push(calculatePercentile(player.hitting.rbi, leagueStats.hitting.rbi));
    }
    
    var avgPercentile = 0;
    if (percentiles.length > 0) {
      var sum = 0;
      for (var i = 0; i < percentiles.length; i++) {
        sum += percentiles[i];
      }
      avgPercentile = sum / percentiles.length;
    }
    
    var offConfig = config.OFFENSIVE;
    if (avgPercentile >= offConfig.ELITE.threshold) {
      breakdown.offensive = offConfig.ELITE.points;
    } else if (avgPercentile >= offConfig.EXCELLENT.threshold) {
      breakdown.offensive = offConfig.EXCELLENT.points;
    } else if (avgPercentile >= offConfig.ABOVE_AVG.threshold) {
      breakdown.offensive = offConfig.ABOVE_AVG.points;
    } else if (avgPercentile >= offConfig.GOOD.threshold) {
      breakdown.offensive = offConfig.GOOD.points;
    } else if (avgPercentile >= offConfig.AVERAGE.threshold) {
      breakdown.offensive = offConfig.AVERAGE.points;
    } else if (avgPercentile >= offConfig.BELOW_AVG.threshold) {
      breakdown.offensive = offConfig.BELOW_AVG.points;
    } else if (avgPercentile >= offConfig.POOR.threshold) {
      breakdown.offensive = offConfig.POOR.points;
    } else {
      breakdown.offensive = offConfig.TERRIBLE.points;
    }
    
    detailParts.push("Hit: " + avgPercentile.toFixed(0) + "% (" + breakdown.offensive.toFixed(1) + " pts)");
  } else {
    detailParts.push("Hit: Not qualified (" + player.hitting.ab + "/" + minAB + " AB)");
  }
  
  // ===== DEFENSIVE CONTRIBUTION (0-3 points) =====
  if (player.fielding.gp && player.fielding.gp >= minGP) {
    var np = player.fielding.np || 0;
    var e = player.fielding.e || 0;
    var netDefense = (np - e) / player.fielding.gp;
    
    var defPercentile = 0;
    if (leagueStats.fielding.netDefense && leagueStats.fielding.netDefense.length > 0) {
      defPercentile = calculatePercentile(netDefense, leagueStats.fielding.netDefense);
    }
    
    var defConfig = config.DEFENSIVE;
    if (defPercentile >= defConfig.GOLD_GLOVE.threshold) {
      breakdown.defensive = defConfig.GOLD_GLOVE.points;
    } else if (defPercentile >= defConfig.EXCELLENT.threshold) {
      breakdown.defensive = defConfig.EXCELLENT.points;
    } else if (defPercentile >= defConfig.STRONG.threshold) {
      breakdown.defensive = defConfig.STRONG.points;
    } else if (defPercentile >= defConfig.SOLID.threshold) {
      breakdown.defensive = defConfig.SOLID.points;
    } else if (defPercentile >= defConfig.NEUTRAL.threshold) {
      breakdown.defensive = defConfig.NEUTRAL.points;
    } else if (defPercentile >= defConfig.BELOW_AVG.threshold) {
      breakdown.defensive = defConfig.BELOW_AVG.points;
    } else {
      breakdown.defensive = defConfig.POOR.points;
    }
    
    detailParts.push("Def: " + defPercentile.toFixed(0) + "% (" + breakdown.defensive.toFixed(1) + " pts)");
  } else {
    detailParts.push("Def: Not qualified (" + (player.fielding.gp || 0) + "/" + minGP + " GP)");
  }
  
  // ===== PITCHING CONTRIBUTION (0-3 points) =====
  if (player.pitching.ip && player.pitching.ip >= minIP) {
    var pitchPercentiles = [];
    
    if (leagueStats.pitching.era && leagueStats.pitching.era.length > 0) {
      var eraPercentile = calculatePercentile(player.pitching.era, leagueStats.pitching.era);
      pitchPercentiles.push(100 - eraPercentile);
    }
    if (leagueStats.pitching.whip && leagueStats.pitching.whip.length > 0) {
      var whipPercentile = calculatePercentile(player.pitching.whip, leagueStats.pitching.whip);
      pitchPercentiles.push(100 - whipPercentile);
    }
    if (leagueStats.pitching.baa && leagueStats.pitching.baa.length > 0) {
      var baaPercentile = calculatePercentile(player.pitching.baa, leagueStats.pitching.baa);
      pitchPercentiles.push(100 - baaPercentile);
    }
    
    var avgPitchPercentile = 0;
    if (pitchPercentiles.length > 0) {
      var sum = 0;
      for (var i = 0; i < pitchPercentiles.length; i++) {
        sum += pitchPercentiles[i];
      }
      avgPitchPercentile = sum / pitchPercentiles.length;
    }
    
    var pitchConfig = config.PITCHING;
    if (avgPitchPercentile >= pitchConfig.CY_YOUNG.threshold) {
      breakdown.pitching = pitchConfig.CY_YOUNG.points;
    } else if (avgPitchPercentile >= pitchConfig.EXCELLENT.threshold) {
      breakdown.pitching = pitchConfig.EXCELLENT.points;
    } else if (avgPitchPercentile >= pitchConfig.STRONG.threshold) {
      breakdown.pitching = pitchConfig.STRONG.points;
    } else if (avgPitchPercentile >= pitchConfig.GOOD.threshold) {
      breakdown.pitching = pitchConfig.GOOD.points;
    } else if (avgPitchPercentile >= pitchConfig.AVERAGE.threshold) {
      breakdown.pitching = pitchConfig.AVERAGE.points;
    } else if (avgPitchPercentile >= pitchConfig.BELOW_AVG.threshold) {
      breakdown.pitching = pitchConfig.BELOW_AVG.points;
    } else {
      breakdown.pitching = pitchConfig.POOR.points;
    }
    
    detailParts.push("Pitch: " + avgPitchPercentile.toFixed(0) + "% (" + breakdown.pitching.toFixed(1) + " pts)");
  } else {
    detailParts.push("Pitch: Not qualified (" + (player.pitching.ip || 0).toFixed(1) + "/" + minIP + " IP)");
  }
  
  breakdown.total = breakdown.offensive + breakdown.defensive + breakdown.pitching;
  if (breakdown.total > config.MAX_POINTS) {
    breakdown.total = config.MAX_POINTS;
  }
  
  breakdown.details = detailParts.join(" | ");
  
  return breakdown;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Calculate percentile rank for a value in a sorted array
 */
function calculatePercentile(value, sortedArray) {
  if (!sortedArray || sortedArray.length === 0) return 50;
  
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  
  var n = sortedArray.length;
  var countBelow = 0;
  var countEqual = 0;
  
  for (var i = 0; i < n; i++) {
    if (sortedArray[i] < value) {
      countBelow++;
    } else if (sortedArray[i] === value) {
      countEqual++;
    }
  }
  
  var percentile = ((countBelow + 0.5 * countEqual) / n) * 100;
  
  if (RETENTION_CONFIG.DEBUG.LOG_PERCENTILE_DETAILS) {
    Logger.log("Percentile calc: value=" + value + ", below=" + countBelow + 
               ", equal=" + countEqual + ", n=" + n + ", result=" + percentile.toFixed(1));
  }
  
  return percentile;
}

/**
 * Find player index in array by name and team
 */
function findPlayerIndex(players, name, team) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].name === name && players[i].team === team) {
      return i;
    }
  }
  return -1;
}

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num) {
  var j = num % 10;
  var k = num % 100;
  
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

/**
 * Find postseason section in sheet
 */
function findPostseasonSection(sheet) {
  try {
    var lastRow = sheet.getLastRow();
    var searchRange = sheet.getRange(1, 1, lastRow, 1).getValues();
    
    for (var i = 0; i < searchRange.length; i++) {
      var cellValue = String(searchRange[i][0]);
      if (cellValue.indexOf(RETENTION_CONFIG.POSTSEASON_SEARCH_TEXT) >= 0) {
        return i + 1;
      }
    }
  } catch (e) {
    Logger.log("Error finding postseason section: " + e.toString());
  }
  
  return -1;
}

// ===== SMART UPDATE FUNCTIONS =====

/**
 * Check if Retention Grades sheet is properly formatted
 * IMPROVED: More robust detection
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
    
    // Read header row
    var headers = sheet.getRange(headerRow, 1, 1, 6).getValues()[0];
    
    var hasPlayer = headers[0] === "Player";
    var hasTeam = headers[1] === "Team";
    var hasTeamSuccess = String(headers[2]).indexOf("Team Success") >= 0;
    var hasPlayTime = String(headers[5]).indexOf("Play Time") >= 0;
    
    var isFormatted = hasPlayer && hasTeam && hasTeamSuccess && hasPlayTime;
    
    if (isFormatted) {
      Logger.log("Sheet is properly formatted - will update data only");
    } else {
      Logger.log("Sheet header check failed - needs formatting");
      Logger.log("  Player: " + hasPlayer + " (" + headers[0] + ")");
      Logger.log("  Team: " + hasTeam + " (" + headers[1] + ")");
      Logger.log("  Team Success: " + hasTeamSuccess + " (" + headers[2] + ")");
      Logger.log("  Play Time: " + hasPlayTime + " (" + headers[5] + ")");
    }
    
    return isFormatted;
    
  } catch (e) {
    Logger.log("Error checking sheet format: " + e.toString());
    return false;
  }
}

/**
 * BUILD FROM SCRATCH: Full sheet creation with all formatting
 * PRESERVES: Postseason data if it exists
 */
function buildRetentionSheetFromScratch(retentionGrades) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);
  
  // PRESERVE POSTSEASON DATA before clearing
  var existingPostseasonData = [];
  if (sheet) {
    var postseasonRow = findPostseasonSection(sheet);
    if (postseasonRow > 0) {
      try {
        var dataStartRow = postseasonRow + 2;
        existingPostseasonData = sheet.getRange(dataStartRow, 1, 8, 2).getValues();
        Logger.log("Preserved postseason data from existing sheet");
      } catch (e) {
        Logger.log("Could not preserve postseason data: " + e.toString());
      }
    }
  }
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.RETENTION_GRADES_SHEET);
  } else {
    sheet.clear();
  }
  
  Logger.log("Building Retention Grades sheet from scratch");
  
  // ===== HEADER SECTION =====
  sheet.getRange(1, 1)
    .setValue("CLB Retention Grade Calculator")
    .setFontWeight("bold")
    .setFontSize(14)
    .setHorizontalAlignment("left")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);
  
  sheet.getRange(1, 1, 1, 18).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);
  
  sheet.getRange(2, 1)
    .setValue("Designed for TOP 3 players per team. System optimized for retention decisions on star players.")
    .setFontSize(9)
    .setFontStyle("italic")
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  
  sheet.getRange(2, 1, 1, 18).merge();
  
  // ===== DATA TABLE HEADER =====
  var headerRow = RETENTION_CONFIG.OUTPUT.HEADER_ROW;
  var headers = [
    "Player",
    "Team", 
    "Team Success\n(Base 0-20)",
    "TS Mod\n(-5 to +5)",
    "TS Total\n(0-20)",
    "Play Time\n(Base 0-20)",
    "PT Mod\n(-5 to +5)",
    "PT Total\n(0-20)",
    "Star Points\n(0-15)",      // MOVED HERE - Column I
    "Awards\n(Base 0-20)",
    "Awards Mod\n(-5 to +5)",
    "Awards Total\n(0-20)",
    "Auto Total\n(0-60)",
    "Chemistry\n(0-20)",
    "Direction\n(0-20)",
    "Manual Total\n(0-40)",
    "FINAL GRADE\n(d100)",
    "Details"
  ];
  
  sheet.getRange(headerRow, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  
  // Set column widths
  sheet.setColumnWidth(1, RETENTION_CONFIG.OUTPUT.PLAYER_COL_WIDTH);
  sheet.setColumnWidth(2, RETENTION_CONFIG.OUTPUT.TEAM_COL_WIDTH);
  for (var i = 3; i <= 12; i++) {
    sheet.setColumnWidth(i, RETENTION_CONFIG.OUTPUT.STAT_COL_WIDTH);
  }
  for (var i = 13; i <= 17; i++) {
    sheet.setColumnWidth(i, RETENTION_CONFIG.OUTPUT.GRADE_COL_WIDTH);
  }
  sheet.setColumnWidth(18, RETENTION_CONFIG.OUTPUT.DETAILS_COL_WIDTH);
  
  // Freeze header rows
  sheet.setFrozenRows(headerRow);
  
  // Write data
  writePlayerData(sheet, retentionGrades);
  
  // Add postseason section and instructions at bottom
  addBottomSections(sheet, retentionGrades.length, existingPostseasonData);
  
  Logger.log("Sheet build complete");
}

/**
 * UPDATE DATA ONLY: Preserves formatting AND postseason data AND manual inputs
 */
function updateRetentionData(sheet, retentionGrades) {
  Logger.log("Updating retention data (preserving formatting, postseason, and manual inputs)");
  
  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  var cols = RETENTION_CONFIG.OUTPUT;
  
  // Find where postseason section starts
  var postseasonRow = findPostseasonSection(sheet);
  var lastDataRow;
  
  if (postseasonRow > 0) {
    lastDataRow = postseasonRow - 2;
    Logger.log("Clearing data rows " + dataStartRow + " to " + lastDataRow + " (preserving postseason at row " + postseasonRow + ")");
  } else {
    lastDataRow = dataStartRow + 200;
  }
  
  // CRITICAL: Only clear auto-calculated columns, preserve manual inputs
  // Manual columns (PRESERVED): D, G, I, K, N, O (modifiers, star points, chemistry, direction)
  
  var numRows = lastDataRow - dataStartRow + 1;
  
  // Clear player name and team
  sheet.getRange(dataStartRow, cols.COL_PLAYER, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_TEAM, numRows, 1).clearContent();
  
  // Clear TS base and total (preserve modifier)
  sheet.getRange(dataStartRow, cols.COL_TS_BASE, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_TS_TOTAL, numRows, 1).clearContent();
  
  // Clear PT base and total (preserve modifier and star points)
  sheet.getRange(dataStartRow, cols.COL_PT_BASE, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_PT_TOTAL, numRows, 1).clearContent();
  
  // Clear Awards base and total (preserve modifier)
  sheet.getRange(dataStartRow, cols.COL_AWARDS_BASE, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_AWARDS_TOTAL, numRows, 1).clearContent();
  
  // Clear totals (preserve chemistry and direction)
  sheet.getRange(dataStartRow, cols.COL_AUTO_TOTAL, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_MANUAL_TOTAL, numRows, 1).clearContent();
  
  // Clear final grade and details
  sheet.getRange(dataStartRow, cols.COL_FINAL_GRADE, numRows, 1).clearContent();
  sheet.getRange(dataStartRow, cols.COL_DETAILS, numRows, 1).clearContent();
  
  // Write new data (will preserve existing manual values in columns D, G, I, K, N, O)
  writePlayerData(sheet, retentionGrades);
  
  Logger.log("Data update complete - postseason and manual inputs preserved");
}

/**
 * Write player data rows to sheet
 * CRITICAL: Only writes to AUTO-CALCULATED columns, preserves MANUAL columns
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
  var playerNames = [];
  var teams = [];
  var tsBaseValues = [];
  var ptBaseValues = [];
  var awardsBaseValues = [];
  var autoTotalValues = [];
  var detailsValues = [];
  
  for (var i = 0; i < retentionGrades.length; i++) {
    var grade = retentionGrades[i];
    var row = dataStartRow + i;
    
    // Combine all details
    var allDetails = "Success: " + grade.teamSuccess.details + " | " +
                     "Time: " + grade.playTime.details + " | " +
                     "Awards: " + grade.awards.details;
    
    playerNames.push([grade.playerName]);
    teams.push([grade.team]);
    tsBaseValues.push([grade.teamSuccess.total.toFixed(1)]);
    ptBaseValues.push([grade.playTime.total.toFixed(1)]);
    awardsBaseValues.push([grade.awards.total.toFixed(1)]);
    autoTotalValues.push([grade.autoTotal.toFixed(1)]);
    detailsValues.push([allDetails]);
  }
  
  var numRows = retentionGrades.length;
  
  if (numRows === 0) return;
  
  // Write auto-calculated columns only (batch operations)
  sheet.getRange(dataStartRow, cols.COL_PLAYER, numRows, 1).setValues(playerNames);
  sheet.getRange(dataStartRow, cols.COL_TEAM, numRows, 1).setValues(teams);
  sheet.getRange(dataStartRow, cols.COL_TS_BASE, numRows, 1).setValues(tsBaseValues);
  sheet.getRange(dataStartRow, cols.COL_PT_BASE, numRows, 1).setValues(ptBaseValues);
  sheet.getRange(dataStartRow, cols.COL_AWARDS_BASE, numRows, 1).setValues(awardsBaseValues);
  sheet.getRange(dataStartRow, cols.COL_AUTO_TOTAL, numRows, 1).setValues(autoTotalValues);
  sheet.getRange(dataStartRow, cols.COL_DETAILS, numRows, 1).setValues(detailsValues);
  
  // Write formulas (only for calculated columns)
  for (var i = 0; i < numRows; i++) {
    var row = dataStartRow + i;
    
    // TS Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_TS_TOTAL).setFormula("=MIN(20,MAX(0,C" + row + "+D" + row + "))");
    
    // PT Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_PT_TOTAL).setFormula("=MIN(20,MAX(0,F" + row + "+G" + row + "))");
    
    // Awards Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_AWARDS_TOTAL).setFormula("=MIN(20,MAX(0,J" + row + "+K" + row + "))");
    
    // Manual Total = Chemistry + Direction
    sheet.getRange(row, cols.COL_MANUAL_TOTAL).setFormula("=N" + row + "+O" + row);
    
    // Final Grade = TS Total + PT Total + Awards Total + Manual Total + Star Points converted
    sheet.getRange(row, cols.COL_FINAL_GRADE).setFormula("=ROUND(E" + row + "+H" + row + "+L" + row + "+P" + row + "+SQRT(I" + row + "/15)*4,0)");
  }
  
  // Apply formatting (only to auto-calculated columns and new rows)
  applyDataFormatting(sheet, dataStartRow, numRows);
  
  // Apply final grade color coding
  Utilities.sleep(500);
  applyFinalGradeFormatting(sheet, dataStartRow, numRows);
  
  Logger.log("Wrote " + numRows + " player rows (preserved manual input columns)");
}

/**
 * Apply formatting to data rows
 * Uses batch operations for performance
 */
function applyDataFormatting(sheet, startRow, numRows) {
  var cols = RETENTION_CONFIG.OUTPUT;
  
  // Build background color array
  var bgColors = [];
  for (var i = 0; i < numRows; i++) {
    var bgColor = i % 2 === 0 ? "#ffffff" : "#f9f9f9";
    bgColors.push([
      bgColor, bgColor, bgColor, bgColor, bgColor, 
      bgColor, bgColor, bgColor, bgColor, bgColor,
      bgColor, bgColor
    ]);
  }
  
  // Apply alternating row colors to auto-calculated columns (batch operation)
  // Columns: A, B, C, E, F, H, J, L, M, P, Q, R
  sheet.getRange(startRow, cols.COL_PLAYER, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[0]]; }));
  sheet.getRange(startRow, cols.COL_TEAM, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[1]]; }));
  sheet.getRange(startRow, cols.COL_TS_BASE, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[2]]; }));
  sheet.getRange(startRow, cols.COL_TS_TOTAL, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[3]]; }));
  sheet.getRange(startRow, cols.COL_PT_BASE, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[4]]; }));
  sheet.getRange(startRow, cols.COL_PT_TOTAL, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[5]]; }));
  sheet.getRange(startRow, cols.COL_AWARDS_BASE, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[6]]; }));
  sheet.getRange(startRow, cols.COL_AWARDS_TOTAL, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[7]]; }));
  sheet.getRange(startRow, cols.COL_AUTO_TOTAL, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[8]]; }));
  sheet.getRange(startRow, cols.COL_MANUAL_TOTAL, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[9]]; }));
  sheet.getRange(startRow, cols.COL_FINAL_GRADE, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[10]]; }));
  sheet.getRange(startRow, cols.COL_DETAILS, numRows, 1).setBackgrounds(bgColors.map(function(row) { return [row[11]]; }));
  
  // Center-align numeric columns (batch operations)
  sheet.getRange(startRow, cols.COL_TS_BASE, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_TS_TOTAL, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_PT_BASE, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_PT_TOTAL, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_AWARDS_BASE, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_AWARDS_TOTAL, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_AUTO_TOTAL, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_MANUAL_TOTAL, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_FINAL_GRADE, numRows, 1).setHorizontalAlignment("center");
  
  // Read all manual input columns at once (batch read)
  var tsModValues = sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).getValues();
  var ptModValues = sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).getValues();
  var spValues = sheet.getRange(startRow, cols.COL_STAR_POINTS, numRows, 1).getValues();
  var awardsModValues = sheet.getRange(startRow, cols.COL_AWARDS_MOD, numRows, 1).getValues();
  var chemValues = sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).getValues();
  var dirValues = sheet.getRange(startRow, cols.COL_DIRECTION, numRows, 1).getValues();
  
  // Prepare arrays for batch writing
  var tsModToWrite = [];
  var ptModToWrite = [];
  var spToWrite = [];
  var awardsModToWrite = [];
  var chemToWrite = [];
  var dirToWrite = [];
  
  for (var i = 0; i < numRows; i++) {
    // Only set to 0 if empty/null
    tsModToWrite.push([tsModValues[i][0] === "" || tsModValues[i][0] === null ? 0 : tsModValues[i][0]]);
    ptModToWrite.push([ptModValues[i][0] === "" || ptModValues[i][0] === null ? 0 : ptModValues[i][0]]);
    spToWrite.push([spValues[i][0] === "" || spValues[i][0] === null ? 0 : spValues[i][0]]);
    awardsModToWrite.push([awardsModValues[i][0] === "" || awardsModValues[i][0] === null ? 0 : awardsModValues[i][0]]);
    chemToWrite.push([chemValues[i][0] === "" || chemValues[i][0] === null ? 0 : chemValues[i][0]]);
    dirToWrite.push([dirValues[i][0] === "" || dirValues[i][0] === null ? 0 : dirValues[i][0]]);
  }
  
  // Write manual columns (batch operations)
  sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).setValues(tsModToWrite);
  sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).setValues(ptModToWrite);
  sheet.getRange(startRow, cols.COL_STAR_POINTS, numRows, 1).setValues(spToWrite);
  sheet.getRange(startRow, cols.COL_AWARDS_MOD, numRows, 1).setValues(awardsModToWrite);
  sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).setValues(chemToWrite);
  sheet.getRange(startRow, cols.COL_DIRECTION, numRows, 1).setValues(dirToWrite);
  
  // Apply colors to manual input columns (batch operations)
  sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.MODIFIER);
  sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.MODIFIER);
  sheet.getRange(startRow, cols.COL_STAR_POINTS, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  sheet.getRange(startRow, cols.COL_AWARDS_MOD, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.MODIFIER);
  sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  sheet.getRange(startRow, cols.COL_DIRECTION, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  
  // Center-align manual input columns
  sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_STAR_POINTS, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_AWARDS_MOD, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_DIRECTION, numRows, 1).setHorizontalAlignment("center");
  
  // Add data validation (batch operations)
  var modifierRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(-5, 5)
    .setAllowInvalid(false)
    .setHelpText("Enter a modifier between -5 and +5")
    .build();
  
  var rule0to20 = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(0, 20)
    .setAllowInvalid(false)
    .setHelpText("Enter a value between 0 and 20")
    .build();
  
  var rule0to15 = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(0, 15)
    .setAllowInvalid(false)
    .setHelpText("Enter star points used (0-15)")
    .build();
  
  sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).setDataValidation(modifierRule);
  sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).setDataValidation(modifierRule);
  sheet.getRange(startRow, cols.COL_STAR_POINTS, numRows, 1).setDataValidation(rule0to15);
  sheet.getRange(startRow, cols.COL_AWARDS_MOD, numRows, 1).setDataValidation(modifierRule);
  sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).setDataValidation(rule0to20);
  sheet.getRange(startRow, cols.COL_DIRECTION, numRows, 1).setDataValidation(rule0to20);
}

/**
 * Add postseason section and instructions at bottom of sheet
 * RESTORED: Previously entered postseason data
 */
function addBottomSections(sheet, playerCount, existingPostseasonData) {
  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  var postseasonStartRow = dataStartRow + playerCount + RETENTION_CONFIG.OUTPUT.INSTRUCTIONS_ROW_OFFSET;
  
  // ===== POSTSEASON INPUT SECTION =====
  sheet.getRange(postseasonStartRow, 1)
    .setValue(RETENTION_CONFIG.POSTSEASON_SEARCH_TEXT + " (Manual Input)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);
  
  sheet.getRange(postseasonStartRow, 1, 1, 2).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);
  
  // Column headers
  sheet.getRange(postseasonStartRow + 1, 1, 1, 2)
    .setValues([["Team", "Finish"]])
    .setFontWeight("bold")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER)
    .setHorizontalAlignment("center");
  
  // Restore existing postseason data or create blank template
  var postseasonDataStart = postseasonStartRow + 2;
  
  if (existingPostseasonData && existingPostseasonData.length > 0) {
    // Restore preserved data
    sheet.getRange(postseasonDataStart, 1, existingPostseasonData.length, 2).setValues(existingPostseasonData);
    Logger.log("Restored " + existingPostseasonData.length + " rows of postseason data");
  } else {
    // Create blank template
    for (var i = 0; i < 8; i++) {
      sheet.getRange(postseasonDataStart + i, 1).setValue("");
      sheet.getRange(postseasonDataStart + i, 2).setValue("");
    }
  }
  
  // Apply formatting
  sheet.getRange(postseasonDataStart, 1, 8, 2).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  
  // ===== INSTRUCTIONS SECTION =====
  var instructionsRow = postseasonDataStart + 10;
  
  // Main instruction
  sheet.getRange(instructionsRow, 1)
    .setValue("INSTRUCTIONS: (1) Enter postseason results above (Team | Finish: 1-8 or text like 'Champion'). " +
              "(2) Run 'Calculate Retention Grades' from ⭐ Retention menu to update scores. " +
              "(3) Edit yellow/blue cells: Modifiers (Cols D, G, K), Star Points (Col I), Chemistry (Col N), Direction (Col O). " +
              "(4) Final grades auto-calculate in Column Q (rounded to whole numbers for d100 rolls). " +
              "NOTE: Star Points moved to Play Time section (Col I) - formula under review for Season 2.")
    .setFontStyle("italic")
    .setFontSize(9)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setBackground("#f0f0f0");
  
  sheet.getRange(instructionsRow, 1, 1, 10).merge();
  
  // Design notes
  sheet.getRange(instructionsRow + 2, 1)
    .setValue("DESIGN NOTE: This system is optimized for evaluating the TOP 3 players per team. " +
              "Batting order heavily weighted (spots 1-3 = 8pts, spots 8-9 = 1pt) because stars should bat high. " +
              "Standings-based Team Success (1st=8pts, 2nd-3rd=5pts, 4th=4pts, 5th=3pts, 6th-7th=2pts, 8th=0pts) with heavy postseason weight (Champion=12pts, Runner-up=9pts). " +
              "Modifiers allow contextual adjustments (-5 to +5 per category, capped at 0-20 total per category).")
    .setFontStyle("italic")
    .setFontSize(8)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setBackground("#e8f4f8");
  
  sheet.getRange(instructionsRow + 2, 1, 1, 10).merge();
}

/**
 * Apply color coding to final grade column based on values
 */
function applyFinalGradeFormatting(sheet, startRow, numRows) {
  var finalGradeCol = 17;  // Column Q
  var finalGrades = sheet.getRange(startRow, finalGradeCol, numRows, 1).getValues();
  
  for (var i = 0; i < finalGrades.length; i++) {
    var finalGrade = finalGrades[i][0];
    
    if (typeof finalGrade === 'number' && !isNaN(finalGrade)) {
      var color = RETENTION_CONFIG.getGradeColor(finalGrade);
      sheet.getRange(startRow + i, finalGradeCol).setBackground(color);
    }
  }
}

/**
 * REBUILD SHEET: Force full rebuild of formatting
 */
function rebuildRetentionSheet() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Rebuild Sheet Formatting',
    'This will rebuild the Retention Grades sheet from scratch, removing any custom formatting.\n\n' +
    'Player data and manual entries (Chemistry, Direction, Star Points, Modifiers) will be preserved.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);
  
  if (sheet) {
    sheet.getRange(RETENTION_CONFIG.OUTPUT.HEADER_ROW, 1).clearContent();
  }
  
  calculateRetentionGrades();
  
  ui.alert('Sheet rebuilt successfully!');
}

/**
 * Refresh formulas in the retention sheet
 */
function refreshRetentionFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Retention Grades sheet not found. Please run 'Calculate Retention Grades' first.");
    return;
  }
  
  var lastRow = sheet.getLastRow();
  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  
  if (lastRow < dataStartRow) {
    SpreadsheetApp.getUi().alert("No data found. Please run 'Calculate Retention Grades' first.");
    return;
  }
  
  var rowsUpdated = 0;
  for (var row = dataStartRow; row <= lastRow; row++) {
    var playerName = sheet.getRange(row, 1).getValue();
    if (!playerName || playerName === "") continue;
    
    // TS Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, 5).setFormula("=MIN(20,MAX(0,C" + row + "+D" + row + "))");
    
    // PT Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, 8).setFormula("=MIN(20,MAX(0,F" + row + "+G" + row + "))");
    
    // Awards Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, 12).setFormula("=MIN(20,MAX(0,J" + row + "+K" + row + "))");
    
    // Manual Total = Chemistry + Direction
    sheet.getRange(row, 16).setFormula("=N" + row + "+O" + row);
    
    // Final Grade = TS Total + PT Total + Awards Total + Manual Total + Star Points converted
    sheet.getRange(row, 17).setFormula("=ROUND(E" + row + "+H" + row + "+L" + row + "+P" + row + "+SQRT(I" + row + "/15)*4,0)");
    
    rowsUpdated++;
  }
  
  if (rowsUpdated > 0) {
    applyFinalGradeFormatting(sheet, dataStartRow, rowsUpdated);
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Formulas refreshed for " + rowsUpdated + " players",
    "✅ Success",
    3
  );
}

// ===== HELP/DOCUMENTATION FUNCTIONS =====

function showTeamSuccessHelp() {
  var html = '<h3>Team Success (0-20 points)</h3>' +
    '<p><b>Regular Season (0-8 pts):</b> Based on final standings (with H2H tiebreakers)</p>' +
    '<ul>' +
    '<li>1st place: 8 pts (Dominant - earned #1 seed)</li>' +
    '<li>2nd-3rd place: 5 pts (Strong playoff seeds)</li>' +
    '<li>4th place: 4 pts (Scraped into playoffs)</li>' +
    '<li>5th place: 3 pts (Just missed playoffs)</li>' +
    '<li>6th-7th place: 2 pts (Below average)</li>' +
    '<li>8th place: 0 pts (LAST PLACE - no floor penalty)</li>' +
    '</ul>' +
    '<p><b>Postseason (0-12 pts):</b> Based on playoff finish (HEAVY WEIGHT)</p>' +
    '<ul>' +
    '<li>Champion: 12 pts (Won it all)</li>' +
    '<li>Runner-up: 9 pts (Lost in finals)</li>' +
    '<li>Semifinal (3rd/4th): 6 pts (Lost in semis)</li>' +
    '<li>Quarterfinal (5-8th): 3 pts (Lost in first round)</li>' +
    '<li>Missed playoffs: 0 pts</li>' +
    '</ul>' +
    '<p><b>Example:</b> A 6th seed that wins championship = 2 + 12 = 14/20 (Cinderella story)</p>' +
    '<p><b>Example:</b> A #1 seed that wins championship = 8 + 12 = 20/20 (perfection)</p>';
  
  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Team Success Factor');
}

function showPlayTimeHelp() {
  var html = '<h3>Play Time (0-20 points)</h3>' +
    '<p style="color: red;"><b>CRITICAL:</b> Only games with CURRENT team count (mid-season trades penalized)</p>' +
    '<p><b>Games Played (0-8 pts):</b> % of current team\'s games</p>' +
    '<ul>' +
    '<li>≥85%: 8 pts (Full-time starter)</li>' +
    '<li>≥70%: 6 pts (Regular starter)</li>' +
    '<li>≥50%: 4 pts (Rotation player)</li>' +
    '<li>≥25%: 2 pts (Bench role)</li>' +
    '<li><25%: 0 pts (Minimal usage)</li>' +
    '</ul>' +
    '<p><b>Usage Quality (0-8 pts):</b> HEAVILY WEIGHTED for stars</p>' +
    '<ul>' +
    '<li><b>Hitters:</b> Average lineup position (from box scores)</li>' +
    '<li>Spots 1-3: 8 pts (Where stars belong - guaranteed 3 AB in 7-inning game)</li>' +
    '<li>Spots 4-5: 5 pts (Mild misuse - 3pt penalty)</li>' +
    '<li>Spots 6-7: 3 pts (Bad misuse - 5pt penalty)</li>' +
    '<li>Spots 8-9: 1 pt (Terrible misuse - 7pt penalty)</li>' +
    '<li>Bench only: 0 pts (Not starting your star)</li>' +
    '<li><b>Pitchers:</b> IP per team game</li>' +
    '<li>≥2.5 IP/game: 8 pts (Ace)</li>' +
    '<li>≥1.8 IP/game: 6 pts (Starter)</li>' +
    '<li>≥1.2 IP/game: 4 pts (Swingman)</li>' +
    '<li>≥0.6 IP/game: 2 pts (Reliever)</li>' +
    '</ul>' +
    '<p><b>Star Points (0-4 pts):</b> Manual input (Column I)</p>' +
    '<ul>' +
    '<li>Formula: sqrt(SP used / 15) × 4</li>' +
    '<li>0 SP: 0 pts | 6 SP: 2 pts | 15 SP: 4 pts</li>' +
    '<li><i>Note: Under review for Season 2</i></li>' +
    '</ul>';
  
  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Play Time Factor');
}

function showAwardsHelp() {
  var html = '<h3>Awards/Accolades (0-20 points)</h3>' +
    '<p style="color: blue;"><b>Note:</b> Performance evaluated across ALL teams (not just current team)</p>' +
    '<p><b>Offensive Performance (0-14 pts):</b> Percentile vs qualified hitters</p>' +
    '<ul>' +
    '<li>Stats: AVG, OBP, SLG, OPS, HR, RBI (averaged)</li>' +
    '<li>Qualification: 2.1 AB per team game (~29 AB)</li>' +
    '<li>≥90th percentile: 14 pts (Elite)</li>' +
    '<li>≥75th percentile: 12 pts (Excellent)</li>' +
    '<li>≥60th percentile: 10 pts (Above Average)</li>' +
    '<li>≥50th percentile: 8 pts (Good/Median)</li>' +
    '<li>≥40th percentile: 6 pts (Average)</li>' +
    '<li>≥25th percentile: 4 pts (Below Average)</li>' +
    '<li>≥10th percentile: 2 pts (Poor)</li>' +
    '<li><10th percentile: 0 pts (Terrible)</li>' +
    '</ul>' +
    '<p><b>Defensive Contribution (0-3 pts):</b> Percentile vs qualified fielders</p>' +
    '<ul>' +
    '<li>Metric: (Nice Plays - Errors) / Games Played</li>' +
    '<li>Qualification: 50% of team games (~7 GP)</li>' +
    '<li>≥90th percentile: 3 pts (Gold Glove)</li>' +
    '<li>≥75th percentile: 2.5 pts</li>' +
    '<li>≥60th percentile: 2 pts</li>' +
    '<li>≥40th percentile: 1.5 pts (Average)</li>' +
    '</ul>' +
    '<p><b>Pitching Contribution (0-3 pts):</b> Percentile vs qualified pitchers</p>' +
    '<ul>' +
    '<li>Stats: ERA, WHIP, BAA (lower is better)</li>' +
    '<li>Qualification: 1.0 IP per team game (~14 IP)</li>' +
    '<li>≥90th percentile: 3 pts (Cy Young)</li>' +
    '<li>≥75th percentile: 2.5 pts</li>' +
    '<li>≥60th percentile: 2 pts</li>' +
    '<li>≥50th percentile: 1.5 pts</li>' +
    '</ul>' +
    '<p><b>Design:</b> Everyone hits (primary evaluation). Defense/pitching are bonuses for well-rounded players.</p>';
  
  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(650);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Awards Factor');
}

function showRetentionSystemHelp() {
  var html = '<h2>CLB Retention Grade System</h2>' +
    '<p><b>Purpose:</b> Calculate d100 retention probability for each player (0-100 points)</p>' +
    '<p style="color: red;"><b>Optimized for:</b> TOP 3 players per team (retention decisions on star players)</p>' +
    '<hr>' +
    '<h3>The Five Factors (0-20 points each):</h3>' +
    '<ol>' +
    '<li><b>Team Success:</b> Standings (8pts) + playoff finish (12pts) - postseason-heavy</li>' +
    '<li><b>Play Time:</b> Games played + batting order (HEAVILY weighted) + star points</li>' +
    '<li><b>Awards:</b> Offensive performance (14pts) + defensive/pitching bonuses (6pts)</li>' +
    '<li><b>Chemistry:</b> Manual input - Future: auto from Chemistry Tool</li>' +
    '<li><b>Team Direction:</b> Manual input - GM evaluation of trajectory</li>' +
    '</ol>' +
    '<hr>' +
    '<h3>Manual Adjustments:</h3>' +
    '<ul>' +
    '<li><b>Modifiers (-5 to +5):</b> Adjust Team Success, Play Time, Awards for context</li>' +
    '<li>Examples: injuries, trades, exceeded/failed expectations, weak division</li>' +
    '<li>Each category capped at 0-20 after modifiers applied</li>' +
    '</ul>' +
    '<hr>' +
    '<h3>How to Use:</h3>' +
    '<ol>' +
    '<li>Enter postseason results at bottom of sheet</li>' +
    '<li>Run "Calculate Retention Grades" from ⭐ Retention menu</li>' +
    '<li>Edit modifiers (blue cells) for contextual adjustments</li>' +
    '<li>Edit Star Points (Col I), Chemistry (Col N), Direction (Col O) in yellow cells</li>' +
    '<li>Final grades (Column Q) auto-calculate as WHOLE NUMBERS (d100 rolls)</li>' +
    '</ol>' +
    '<hr>' +
    '<h3>Smart Updating & Performance:</h3>' +
    '<ul>' +
    '<li>✅ First run: Creates full formatting (~20-30s)</li>' +
    '<li>✅ Subsequent runs: Only updates data, preserves formatting (~15-25s)</li>' +
    '<li>✅ Postseason section preserved across re-runs</li>' +
    '<li>✅ Optimized with caching and batch operations</li>' +
    '<li>✅ Use "Rebuild Sheet" to reset if needed</li>' +
    '</ul>' +
    '<hr>' +
    '<h3>Color Coding:</h3>' +
    '<ul>' +
    '<li><span style="background-color: #d4edda; padding: 2px 8px;">Green (75-100)</span> - Excellent retention</li>' +
    '<li><span style="background-color: #d1ecf1; padding: 2px 8px;">Blue (60-74)</span> - Good retention</li>' +
    '<li><span style="background-color: #fff3cd; padding: 2px 8px;">Yellow (40-59)</span> - Uncertain</li>' +
    '<li><span style="background-color: #f8d7da; padding: 2px 8px;">Red (<40)</span> - Poor retention</li>' +
    '</ul>';
  
  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(650)
    .setHeight(800);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'About Retention System');
}

// ===== DEBUG FUNCTIONS =====

function debugPostseasonData() {
  var postseason = getPostseasonData();
  
  Logger.log("=== POSTSEASON DATA DEBUG ===");
  for (var team in postseason) {
    Logger.log(team + ": " + postseason[team] + " points");
  }
  
  if (Object.keys(postseason).length === 0) {
    Logger.log("NO POSTSEASON DATA FOUND!");
  }
  
  SpreadsheetApp.getUi().alert("Debug complete. Check Execution Log.");
}

function debugLineupPositions() {
  Logger.log("=== LINEUP POSITION DEBUG ===");
  
  var lineupData = getLineupPositionData();
  
  Logger.log("Total player-team combinations found: " + Object.keys(lineupData).length);
  
  var count = 0;
  for (var key in lineupData) {
    var data = lineupData[key];
    Logger.log(key + ": " + data.gamesCount + " games, avg position " + 
               data.averagePosition.toFixed(2));
    count++;
    if (count >= 10) break;
  }
  
  SpreadsheetApp.getUi().alert("Debug complete. Check Execution Log. Found " + 
                               Object.keys(lineupData).length + " player-team combinations.");
}

function debugSamplePlayer() {
  var playerName = Browser.inputBox("Enter player name to debug:", Browser.Buttons.OK_CANCEL);
  
  if (playerName === "cancel" || !playerName) {
    return;
  }
  
  Logger.log("=== DEBUG: " + playerName + " ===");
  
  var playerData = getPlayerData();
  var teamData = getTeamData();
  var standingsData = getStandingsData();
  var postseasonData = getPostseasonData();
  var lineupData = getLineupPositionData();
  var leagueStats = calculateLeaguePercentiles();
  
  var player = null;
  for (var i = 0; i < playerData.length; i++) {
    if (playerData[i].name.toLowerCase().indexOf(playerName.toLowerCase()) >= 0) {
      player = playerData[i];
      break;
    }
  }
  
  if (!player) {
    SpreadsheetApp.getUi().alert("Player not found: " + playerName);
    return;
  }
  
  Logger.log("Found: " + player.name + " (" + player.team + ")");
  Logger.log("\nHitting: " + player.hitting.ab + " AB, " + (player.hitting.avg || 0).toFixed(3) + " AVG");
  Logger.log("Pitching: " + (player.pitching.ip || 0) + " IP, " + (player.pitching.era || 0).toFixed(2) + " ERA");
  Logger.log("Fielding: " + (player.fielding.np || 0) + " NP, " + (player.fielding.e || 0) + " E");
  
  var teamSuccess = calculateTeamSuccess(player, teamData, standingsData, postseasonData);
  var playTime = calculatePlayTime(player, teamData, lineupData);
  var awards = calculateAwards(player, leagueStats);
  
  Logger.log("\n=== RETENTION BREAKDOWN ===");
  Logger.log("Team Success: " + teamSuccess.total.toFixed(1) + "/20 - " + teamSuccess.details);
  Logger.log("Play Time: " + playTime.total.toFixed(1) + "/20 - " + playTime.details);
  Logger.log("Awards: " + awards.total.toFixed(1) + "/20 - " + awards.details);
  Logger.log("\nAuto Total: " + (teamSuccess.total + playTime.total + awards.total).toFixed(1) + "/60");
  
  SpreadsheetApp.getUi().alert("Debug complete for " + player.name + ". Check Execution Log for details.");
}
// ===== TEAM STATISTICS MODULE =====
// Step 2: Update all team stats from cached game data

// ===== Update from cached data (called by updateAll) =====
function updateAllTeamStatsFromCache(teamStats) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var teamStatsSheet = ss.getSheetByName(CONFIG.TEAM_STATS_SHEET);
  
  if (!teamStatsSheet) {
    logError("Step 2", "Sheet not found", CONFIG.TEAM_STATS_SHEET);
    SpreadsheetApp.getUi().alert(CONFIG.TEAM_STATS_SHEET + " sheet not found!");
    return;
  }
  
  logInfo("Step 2", "Writing team stats from cached data");
  
  var lastRow = teamStatsSheet.getLastRow();
  if (lastRow < 2) {
    logError("Step 2", "No teams found in sheet", CONFIG.TEAM_STATS_SHEET);
    SpreadsheetApp.getUi().alert("No teams found!");
    return;
  }
  
  // Get team order from sheet
  var teamNamesData = teamStatsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var teamOrder = [];
  
  for (var t = 0; t < teamNamesData.length; t++) {
    var teamName = String(teamNamesData[t][0]).trim();
    if (teamName && teamName !== "") {
      teamOrder.push(teamName);
    }
  }
  
  logInfo("Step 2", "Writing stats for " + teamOrder.length + " teams");
  
  // Write all team data in batch operations
  var allGPWL = [];
  var allHitting = [];
  var allPitching = [];
  var allFielding = [];
  
  for (var i = 0; i < teamOrder.length; i++) {
    var stats = teamStats[teamOrder[i]];
    
    if (!stats) {
      // Team not in any games - write zeros
      allGPWL.push([0, 0, 0]);
      allHitting.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      allPitching.push([0, 0, 0, 0, 0, 0, 0]);
      allFielding.push([0, 0, 0]);
      continue;
    }
    
    allGPWL.push([stats.gamesPlayed, stats.wins, stats.losses]);
    allHitting.push(stats.hitting);
    allPitching.push(stats.pitching);
    allFielding.push(stats.fielding);
  }
  
  var numTeams = teamOrder.length;
  var layout = CONFIG.SHEET_STRUCTURE.TEAM_STATS_SHEET;
  teamStatsSheet.getRange(layout.DATA_START_ROW, layout.GPWL_START_COL, numTeams, layout.GPWL_NUM_COLS).setValues(allGPWL);
  teamStatsSheet.getRange(layout.DATA_START_ROW, layout.HITTING_START_COL, numTeams, layout.HITTING_NUM_COLS).setValues(allHitting);
  teamStatsSheet.getRange(layout.DATA_START_ROW, layout.PITCHING_START_COL, numTeams, layout.PITCHING_NUM_COLS).setValues(allPitching);
  teamStatsSheet.getRange(layout.DATA_START_ROW, layout.FIELDING_START_COL, numTeams, layout.FIELDING_NUM_COLS).setValues(allFielding);
  
  logInfo("Step 2", "Updated " + numTeams + " teams");
  SpreadsheetApp.getActiveSpreadsheet().toast("Updated " + numTeams + " teams!", "Step 2 Complete", 3);
}

// ===== OLD: Legacy function for manual execution (calls game processor) =====
function updateAllTeamStats() {
  // This function is now just a wrapper that calls the game processor
  // It's kept for backwards compatibility and manual menu execution
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateAllTeamStatsFromCache(gameData.teamStats);
  }
}
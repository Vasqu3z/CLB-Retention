// ===== SCHEDULE & HEAD-TO-HEAD FEATURES =====
// Step 5: Schedule generation and league schedule sheet creation

// ===== Update from cached data (called by updateAll) =====
function updateLeagueScheduleFromCache(scheduleData, teamStatsWithH2H, gamesByWeek, boxScoreUrl) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName(CONFIG.SCHEDULE_SHEET);
  
  if (!scheduleSheet || scheduleSheet.getLastRow() < 2) {
    logWarning("Step 5", "Schedule sheet is empty or missing", "N/A");
    SpreadsheetApp.getUi().alert("Schedule sheet is empty or missing!\n\nPlease fill in the Schedule sheet first.");
    return;
  }
  
  logInfo("Step 5", "Schedule data validated");
  logInfo("Step 5", "Schedule processing complete");
  SpreadsheetApp.getActiveSpreadsheet().toast("Schedule validated!", "Step 5 Complete", 3);
}

/**
 * Manual execution entry point for League Schedule updates
 */
function updateLeagueSchedule() {
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateLeagueScheduleFromCache(gameData.scheduleData, gameData.teamStatsWithH2H, gameData.gamesByWeek, gameData.boxScoreUrl);
  }
}

// ===== INITIALIZE SCHEDULE SHEET =====
function initializeSeasonSchedule() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName(CONFIG.SCHEDULE_SHEET);

  if (!scheduleSheet) {
    scheduleSheet = ss.insertSheet(CONFIG.SCHEDULE_SHEET);
    scheduleSheet.getRange(1, 1, 1, 3).setValues([["Week", "Away Team", "Home Team"]]);
    scheduleSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#e8e8e8");
    scheduleSheet.setFrozenRows(1);
    scheduleSheet.setColumnWidth(1, 60);
    scheduleSheet.setColumnWidth(2, 175);
    scheduleSheet.setColumnWidth(3, 175);

    SpreadsheetApp.getUi().alert(
      "Schedule sheet created!\n\n" +
      "Please fill it in with your schedule:\n" +
      "• Week: Week number (1, 2, 3, etc.)\n" +
      "• Away Team: Visiting team\n" +
      "• Home Team: Team playing at home\n\n" +
      "Once filled, run 'Update League Schedule' to generate the full schedule."
    );
  }
  
  return scheduleSheet;
}

/**
 * Legacy function for backwards compatibility
 */
function generateLeagueSchedulePage() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var boxScoreSS = getBoxScoreSpreadsheet();
  if (!boxScoreSS) return null;

  var gameData = processAllGameSheetsOnce();
  if (!gameData) return null;
  
  var teamNames = [];
  for (var teamName in gameData.teamStatsWithH2H) {
    if (gameData.teamStatsWithH2H[teamName].gamesPlayed > 0) {
      teamNames.push(teamName);
    }
  }
  
  return {
    schedule: gameData.scheduleData,
    h2hMatrix: {},
    teamNames: teamNames,
    boxScoreUrl: gameData.boxScoreUrl
  };
}
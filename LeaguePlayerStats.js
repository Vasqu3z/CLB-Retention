// ===== PLAYER STATISTICS MODULE =====
// Step 1: Update all player stats from cached game data

// ===== Update from cached data (called by updateAll) =====
function updateAllPlayerStatsFromCache(playerStats) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var playerStatsSheet = ss.getSheetByName(CONFIG.PLAYER_STATS_SHEET);
  
  if (!playerStatsSheet) {
    logError("Step 1", "Sheet not found", CONFIG.PLAYER_STATS_SHEET);
    SpreadsheetApp.getUi().alert(CONFIG.PLAYER_STATS_SHEET + " sheet not found!");
    return;
  }
  
  logInfo("Step 1", "Writing player stats from cached data");
  
  var lastRow = playerStatsSheet.getLastRow();
  if (lastRow < 2) {
    logError("Step 1", "No players found in sheet", CONFIG.PLAYER_STATS_SHEET);
    SpreadsheetApp.getUi().alert("No players found!");
    return;
  }
  
  // Get player order from sheet
  var playerNamesData = playerStatsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var playerOrder = [];
  
  for (var p = 0; p < playerNamesData.length; p++) {
    var playerName = String(playerNamesData[p][0]).trim();
    if (playerName && playerName !== "") {
      playerOrder.push(playerName);
    }
  }
  
  // Validate player stats
  for (var i = 0; i < playerOrder.length; i++) {
    if (playerStats[playerOrder[i]]) {
      validatePlayerStats(playerOrder[i], playerStats[playerOrder[i]], null);
    }
  }
  
  // Write all player data in one batch operation
  var allPlayerData = [];
  for (var i = 0; i < playerOrder.length; i++) {
    var stats = playerStats[playerOrder[i]];
    if (!stats) {
      // Player not in any games - write zeros
      var emptyRow = [0, 0,0,0,0,0,0,0,0,0, 0,0,0, 0,0,0,0,0,0,0, 0,0,0];
      allPlayerData.push(emptyRow);
      continue;
    }
    
    var row = [stats.gamesPlayed];
    row = row.concat(stats.hitting);
    row = row.concat([stats.wins, stats.losses, stats.saves]);
    row = row.concat(stats.pitching);
    row = row.concat(stats.fielding);
    allPlayerData.push(row);
  }
  
  var numPlayers = playerOrder.length;
  if (numPlayers > 0) {
    playerStatsSheet.getRange(2, 3, numPlayers, 23).setValues(allPlayerData);
  }
  
  logInfo("Step 1", "Updated " + numPlayers + " players");
  SpreadsheetApp.getActiveSpreadsheet().toast("Updated " + numPlayers + " players!", "Step 1 Complete", 3);
}

// ===== OLD: Legacy function for manual execution (calls game processor) =====
function updateAllPlayerStats() {
  // This function is now just a wrapper that calls the game processor
  // It's kept for backwards compatibility and manual menu execution
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateAllPlayerStatsFromCache(gameData.playerStats);
  }
}
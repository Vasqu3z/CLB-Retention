// ===== LEAGUE HUB - CORE SCRIPT =====
// Core functionality: Menu and Update All orchestrator

// ===== MENU =====
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Player Stats')
      // Simplified menu - removed step-by-step updates
      .addItem('🚀 Update All', 'updateAll')
      .addItem('📊 Compare Players', 'showPlayerComparison')
      .addItem('🔧 Recalculate All Formulas', 'recalculateFormulas')
      .addSeparator()
      // Transactions (collapsed)
      .addSubMenu(ui.createMenu('💰 Transactions')
          .addItem('📝 Record Transaction', 'recordTransaction')
          .addItem('📋 View/Edit Transaction Log', 'viewTransactionLog')
          .addItem('⚠️ Detect Missing Transactions', 'detectMissingTransactions'))
      // Retention (collapsed)
      .addSubMenu(ui.createMenu('⭐ Retention')
          .addItem('🏆 Calculate Retention Grades', 'calculateFinalRetentionGrades')
          .addSeparator()
          .addItem('Refresh Formulas', 'refreshRetentionFormulas')
          .addItem('Rebuild Sheet Formatting', 'rebuildRetentionSheet'))
      // Archive & Maintenance (collapsed)
      .addSubMenu(ui.createMenu('📦 Archive & Maintenance')
          .addItem('Archive Current Season', 'archiveCurrentSeason'))
      
      .addToUi();
}

// ===== UPDATE ALL =====
function updateAll() {
  var startTime = new Date();
  logInfo("Update All", "Starting full update process");
  
  try {
    // Check for missing transactions before starting
    detectMissingTransactions();
    
    // ===== Process all game sheets ONCE =====
    SpreadsheetApp.getActiveSpreadsheet().toast("Processing all game sheets...", "Update All", -1);
    var processingStart = new Date();
    
    var gameData = processAllGameSheetsOnce();
    if (!gameData) {
      SpreadsheetApp.getUi().alert("Failed to process game sheets. Check Error Log for details.");
      return;
    }
    
    // Cache the processed data
    _spreadsheetCache.gameData = gameData;
    
    var processingTime = ((new Date() - processingStart) / 1000).toFixed(1);
    logInfo("Update All", "Game processing completed in " + processingTime + "s");
    SpreadsheetApp.flush();
    
    // ===== STEP 1: Update player stats (using cached data) =====
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 1 of 5: Updating player stats...", "Update All", -1);
    var step1Start = new Date();
    updateAllPlayerStatsFromCache(gameData.playerStats);
    var step1Time = ((new Date() - step1Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    // ===== STEP 2: Update team stats (using cached data) =====
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 2 of 5: Updating team stats...", "Update All", -1);
    var step2Start = new Date();
    updateAllTeamStatsFromCache(gameData.teamStats);
    var step2Time = ((new Date() - step2Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    // ===== STEP 3: Update team sheets (using cached data) =====
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 3 of 5: Updating team sheets...", "Update All", -1);
    var step3Start = new Date();
    updateTeamSheetsFromCache(gameData.teamStatsWithH2H, gameData.scheduleData, gameData.boxScoreUrl);
    var step3Time = ((new Date() - step3Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    // ===== STEP 4: Update league hub (using cached data) =====
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 4 of 5: Updating league hub...", "Update All", -1);
    var step4Start = new Date();
    // Pass full gameData object for in-memory performance
    updateLeagueHubFromCache(gameData);
    var step4Time = ((new Date() - step4Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    // ===== STEP 5: Update league schedule (using cached data) =====
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 5 of 5: Updating league schedule...", "Update All", -1);
    var step5Start = new Date();
    updateLeagueScheduleFromCache(gameData.scheduleData, gameData.teamStatsWithH2H, gameData.gamesByWeek, gameData.boxScoreUrl);
    var step5Time = ((new Date() - step5Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    var totalTime = ((new Date() - startTime) / 1000).toFixed(1);
    
    // Concise message that fits in toast
    var stepsTime = (parseFloat(step1Time) + parseFloat(step2Time) + 
                     parseFloat(step3Time) + parseFloat(step4Time) + 
                     parseFloat(step5Time)).toFixed(1);
    
    var message = "✅ Update Complete!\n\n" +
                  "Game Processing: " + processingTime + "s\n" +
                  "Steps 1-5: " + stepsTime + "s\n" +
                  "─────────────\n" +
                  "Total: " + totalTime + "s";
    
    SpreadsheetApp.getActiveSpreadsheet().toast(message, "Update Complete", 10);
    logInfo("Update All", "Completed successfully in " + totalTime + "s");
    
    SpreadsheetApp.getActiveSpreadsheet().toast(message, "✅ Update Complete", 10);
    logInfo("Update All", "Completed successfully in " + totalTime + "s");

    // Cache final data for Retention suite
    cacheCurrentSeasonStats(gameData);

  } catch (e) {
    logError("Update All", e.toString(), "N/A");
    SpreadsheetApp.getUi().alert("Error during update: " + e.toString());
  }

  // Clear cache after completion
  clearCache();
}

// ===== QUICK UPDATE (INCREMENTAL) =====
function quickUpdate() {
  var startTime = new Date();
  
  // Check if cache exists (first-time setup)
  var hasCache = false;
  try {
    var stored = PropertiesService.getScriptProperties().getProperty('gameHashes');
    hasCache = (stored && stored !== "");
  } catch (e) {}
  
  if (!hasCache) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      'First Time Setup',
      'No cache found. This is normal for the first run or after copying the spreadsheet.\n\n' +
      'Quick Update will now process all games to build the cache (~45 seconds).\n\n' +
      'After this, future updates will be much faster!\n\n' +
      'Continue?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) {
      return;
    }
  }
  
  logInfo("Quick Update", "Starting incremental update");
  
  try {
    detectMissingTransactions();
    
    SpreadsheetApp.getActiveSpreadsheet().toast("Checking for new/modified games...", "Quick Update", -1);
    var processingStart = new Date();
    
    var gameData = processNewAndModifiedGamesOnly();
    if (!gameData) {
      return;
    }
    
    _spreadsheetCache.gameData = gameData;
    
    var processingTime = ((new Date() - processingStart) / 1000).toFixed(1);
    logInfo("Quick Update", "Game processing completed in " + processingTime + "s");
    SpreadsheetApp.flush();
    
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 1 of 5: Updating player stats...", "Quick Update", -1);
    var step1Start = new Date();
    updateAllPlayerStatsFromCache(gameData.playerStats);
    var step1Time = ((new Date() - step1Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 2 of 5: Updating team stats...", "Quick Update", -1);
    var step2Start = new Date();
    updateAllTeamStatsFromCache(gameData.teamStats);
    var step2Time = ((new Date() - step2Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 3 of 5: Updating team sheets...", "Quick Update", -1);
    var step3Start = new Date();
    updateTeamSheetsFromCache(gameData.teamStatsWithH2H, gameData.scheduleData, gameData.boxScoreUrl);
    var step3Time = ((new Date() - step3Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 4 of 5: Updating league hub...", "Quick Update", -1);
    var step4Start = new Date();
    // Pass full gameData object for in-memory performance
    updateLeagueHubFromCache(gameData);
    var step4Time = ((new Date() - step4Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 5 of 5: Updating league schedule...", "Quick Update", -1);
    var step5Start = new Date();
    updateLeagueScheduleFromCache(gameData.scheduleData, gameData.teamStatsWithH2H, gameData.gamesByWeek, gameData.boxScoreUrl);
    var step5Time = ((new Date() - step5Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();
    
    var totalTime = ((new Date() - startTime) / 1000).toFixed(1);
    
    // Concise message that fits in toast
    var stepsTime = (parseFloat(step1Time) + parseFloat(step2Time) + 
                     parseFloat(step3Time) + parseFloat(step4Time) + 
                     parseFloat(step5Time)).toFixed(1);
    
    var message = "⚡ Quick Update Complete!\n\n" +
                  "Game Processing: " + processingTime + "s\n" +
                  "Steps 1-5: " + stepsTime + "s\n" +
                  "─────────────\n" +
                  "Total: " + totalTime + "s";
    
    SpreadsheetApp.getActiveSpreadsheet().toast(message, "Quick Update Complete", 10);
    logInfo("Quick Update", "Completed successfully in " + totalTime + "s");
    
  } catch (e) {
    logError("Quick Update", e.toString(), "N/A");
    SpreadsheetApp.getUi().alert("Error during quick update: " + e.toString());
  }
  
  clearCache();
}

// ===== ADVANCED: FORCE FULL REFRESH =====
function forceFullRefresh() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Force Full Refresh',
    'This will clear the game cache and process ALL games on the next update.\n\n' +
    'Use this if:\n' +
    '• Stats seem incorrect\n' +
    '• You made major changes to old games\n' +
    '• You copied this spreadsheet\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    try {
      PropertiesService.getScriptProperties().deleteProperty('gameHashes');
      ui.alert('✅ Cache Cleared!\n\nNext "Quick Update" or "Update All" will process all games.');
      logInfo("Force Refresh", "Game hash cache cleared");
    } catch (e) {
      ui.alert('Error clearing cache: ' + e.toString());
      logError("Force Refresh", "Error clearing cache: " + e.toString(), "N/A");
    }
  }
}

// ===== ADVANCED: VIEW CACHE STATUS =====
function viewCacheStatus() {
  try {
    var stored = PropertiesService.getScriptProperties().getProperty('gameHashes');
    
    if (!stored) {
      SpreadsheetApp.getUi().alert(
        'Cache Status',
        'No cache found.\n\n' +
        'The next "Quick Update" will process all games and create the cache.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    var hashes = JSON.parse(stored);
    var gameCount = Object.keys(hashes).length;
    
    var gameList = Object.keys(hashes).sort().join('\n');
    
    SpreadsheetApp.getUi().alert(
      'Cache Status',
      'Cached games: ' + gameCount + '\n\n' +
      'Games in cache:\n' + gameList.substring(0, 500) + 
      (gameList.length > 500 ? '\n...(and more)' : ''),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error reading cache: ' + e.toString());
    logError("View Cache", "Error reading cache: " + e.toString(), "N/A");
  }
}

// ===== INDIVIDUAL STEP WRAPPERS (for manual execution) =====
// These allow running individual steps from the menu

function updateAllPlayerStats() {
  // Manual execution - process games fresh
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateAllPlayerStatsFromCache(gameData.playerStats);
  }
}

function updateAllTeamStats() {
  // Manual execution - process games fresh
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateAllTeamStatsFromCache(gameData.teamStats);
  }
}

function updateTeamSheets() {
  // Manual execution - process games fresh
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateTeamSheetsFromCache(gameData.teamStatsWithH2H, gameData.scheduleData, gameData.boxScoreUrl);
  }
}

function updateLeagueHub() {
  // Manual execution - process games fresh
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    // Pass full gameData object for in-memory performance
    updateLeagueHubFromCache(gameData);
  }
}

function updateLeagueSchedule() {
  // Manual execution - process games fresh
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateLeagueScheduleFromCache(gameData.scheduleData, gameData.teamStatsWithH2H, gameData.gamesByWeek, gameData.boxScoreUrl);
  }
}

// ===== RETENTION GRADE CONTROLLER =====
/**
 * Calculate Final Retention Grades
 * Reads from cached season data for optimal performance
 */
function calculateFinalRetentionGrades() {
  var ui = SpreadsheetApp.getUi();

  // Confirm this high-stakes operation
  var response = ui.alert(
    '🚀 Calculate Final Retention Grades',
    'This will calculate retention grades using the cached final season data.\n\n' +
    '⚠️ IMPORTANT: Make sure you have run "Update All" first to ensure the data is current.\n\n' +
    'This is a once-per-season operation. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    // Load cached final season data
    var jsonData = PropertiesService.getScriptProperties().getProperty('CURRENT_SEASON_STATS');

    if (!jsonData) {
      ui.alert(
        '❌ No Cached Data Found',
        'Current season stats not found in cache.\n\n' +
        'Please run "🚀 Update All" first to cache the season data, then try again.',
        ui.ButtonSet.OK
      );
      logError("Retention", "No cached season data found", "N/A");
      return;
    }

    // Parse the cached data
    var loadedGameData = JSON.parse(jsonData);
    logInfo("Retention", "Loaded cached season data successfully");

    // Call the retention calculation with cached data
    SpreadsheetApp.getActiveSpreadsheet().toast("Calculating retention grades from cached data...", "Retention", -1);
    calculateRetentionGrades(loadedGameData);

    ui.alert(
      '✅ Retention Grades Complete',
      'Retention grades have been calculated successfully using cached season data!',
      ui.ButtonSet.OK
    );

  } catch (e) {
    logError("Retention", "Error calculating retention grades: " + e.toString(), "N/A");
    ui.alert(
      '❌ Error',
      'Failed to calculate retention grades:\n\n' + e.toString(),
      ui.ButtonSet.OK
    );
  }

}

// ===== PLAYOFF DEBUG UTILITIES =====
// Run these functions from Script Editor to diagnose playoff issues

/**
 * Debug: Check if playoff game sheets are detected
 */
function debugPlayoffGameSheets() {
  var boxScoreSS = getBoxScoreSpreadsheet();
  if (!boxScoreSS) {
    Logger.log("ERROR: Box score spreadsheet not found");
    return;
  }

  var sheets = boxScoreSS.getSheets();
  Logger.log("=== CHECKING FOR PLAYOFF GAME SHEETS ===");
  Logger.log("Looking for sheets starting with: " + CONFIG.PLAYOFF_GAME_PREFIX);
  Logger.log("");

  var found = [];
  var notFound = [];

  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    if (sheetName.startsWith(CONFIG.PLAYOFF_GAME_PREFIX)) {
      // Extract code (same logic as production code)
      var match = sheetName.match(/\*([A-Z]+\d+(?:-[A-Z])?)/);
      var code = match ? match[1].trim() : "";

      // Read teams
      var awayTeam = String(sheets[i].getRange("B3").getValue()).trim();
      var homeTeam = String(sheets[i].getRange("B4").getValue()).trim();

      Logger.log("✓ FOUND: " + sheetName);
      Logger.log("  Extracted Code: '" + code + "'");
      Logger.log("  Teams: " + awayTeam + " @ " + homeTeam);
      Logger.log("");
      found.push(sheetName);
    }
  }

  Logger.log("=== SUMMARY ===");
  Logger.log("Found " + found.length + " playoff game sheets");

  if (found.length === 0) {
    Logger.log("");
    Logger.log("TROUBLESHOOTING:");
    Logger.log("1. Make sure your playoff game sheets start with: " + CONFIG.PLAYOFF_GAME_PREFIX);
    Logger.log("2. Example sheet names: *CS1-A, *CS1-B, *KC1");
    Logger.log("3. Check that CONFIG.PLAYOFF_GAME_PREFIX = \"*\" in LeagueConfig.js");
  }
}

/**
 * Debug: Check playoff schedule data
 */
function debugPlayoffSchedule() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName(CONFIG.PLAYOFF_SCHEDULE_SHEET);

  if (!scheduleSheet) {
    Logger.log("ERROR: Playoff schedule sheet not found: " + CONFIG.PLAYOFF_SCHEDULE_SHEET);
    return;
  }

  Logger.log("=== CHECKING PLAYOFF SCHEDULE ===");
  Logger.log("Reading from: " + CONFIG.PLAYOFF_SCHEDULE_SHEET);
  Logger.log("");

  var lastRow = scheduleSheet.getLastRow();
  if (lastRow < 2) {
    Logger.log("ERROR: No data in playoff schedule (only header row)");
    return;
  }

  var data = scheduleSheet.getRange(2, 1, lastRow - 1, 3).getValues();

  Logger.log("Found " + data.length + " rows in playoff schedule:");
  Logger.log("");

  for (var i = 0; i < data.length; i++) {
    var code = String(data[i][0] || "").trim();
    var awayTeam = String(data[i][1] || "").trim();
    var homeTeam = String(data[i][2] || "").trim();

    if (code && homeTeam && awayTeam) {
      Logger.log("Row " + (i + 2) + ": Code=" + code + ", " + awayTeam + " @ " + homeTeam);
    } else if (code || homeTeam || awayTeam) {
      Logger.log("Row " + (i + 2) + ": INCOMPLETE - Code=" + code + ", Away=" + awayTeam + ", Home=" + homeTeam);
    }
  }

  Logger.log("");
  Logger.log("EXPECTED FORMAT:");
  Logger.log("Column A (Week): CS1-A, CS1-B, KC1, etc.");
  Logger.log("Column B (Away Team): Team Name");
  Logger.log("Column C (Home Team): Team Name");
}

/**
 * Debug: Test playoff matching
 */
function debugPlayoffMatching() {
  Logger.log("=== TESTING PLAYOFF GAME MATCHING ===");
  Logger.log("");

  // Get playoff game sheets
  var boxScoreSS = getBoxScoreSpreadsheet();
  if (!boxScoreSS) {
    Logger.log("ERROR: Box score spreadsheet not found");
    return;
  }

  var playoffGames = [];
  var sheets = boxScoreSS.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    if (sheetName.startsWith(CONFIG.PLAYOFF_GAME_PREFIX)) {
      // Extract code (same logic as production code)
      var match = sheetName.match(/\*([A-Z]+\d+(?:-[A-Z])?)/);
      var code = match ? match[1].trim() : "";
      var awayTeam = String(sheets[i].getRange("B3").getValue()).trim();
      var homeTeam = String(sheets[i].getRange("B4").getValue()).trim();

      playoffGames.push({
        sheetName: sheetName,
        code: code,
        awayTeam: awayTeam,
        homeTeam: homeTeam
      });
    }
  }

  // Get schedule data
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName(CONFIG.PLAYOFF_SCHEDULE_SHEET);

  if (!scheduleSheet) {
    Logger.log("ERROR: Playoff schedule sheet not found");
    return;
  }

  var lastRow = scheduleSheet.getLastRow();
  var scheduleData = scheduleSheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var schedule = [];

  for (var i = 0; i < scheduleData.length; i++) {
    var code = String(scheduleData[i][0] || "").trim();
    var awayTeam = String(scheduleData[i][1] || "").trim();
    var homeTeam = String(scheduleData[i][2] || "").trim();

    if (code && homeTeam && awayTeam) {
      schedule.push({
        row: i + 2,
        code: code,
        awayTeam: awayTeam,
        homeTeam: homeTeam
      });
    }
  }

  Logger.log("Playoff game sheets: " + playoffGames.length);
  Logger.log("Schedule entries: " + schedule.length);
  Logger.log("");

  // Try to match each game to schedule
  for (var g = 0; g < playoffGames.length; g++) {
    var game = playoffGames[g];
    Logger.log("Game Sheet: " + game.sheetName);
    Logger.log("  Code: " + game.code);
    Logger.log("  Teams: " + game.awayTeam + " @ " + game.homeTeam);

    var matched = false;
    for (var s = 0; s < schedule.length; s++) {
      var sched = schedule[s];

      if (sched.code === game.code && sched.homeTeam === game.homeTeam && sched.awayTeam === game.awayTeam) {
        Logger.log("  ✓ MATCHED to Row " + sched.row);
        matched = true;
        break;
      }
    }

    if (!matched) {
      Logger.log("  ✗ NO MATCH FOUND");
      Logger.log("    Looking for: code='" + game.code + "', away='" + game.awayTeam + "', home='" + game.homeTeam + "'");
      Logger.log("");
      Logger.log("    Possible matches by code:");
      for (var s = 0; s < schedule.length; s++) {
        var sched = schedule[s];
        if (sched.code === game.code) {
          Logger.log("      Row " + sched.row + ": " + sched.awayTeam + " @ " + sched.homeTeam);
          Logger.log("        Code match: YES");
          Logger.log("        Home team match: " + (sched.homeTeam === game.homeTeam ? "YES" : "NO ('" + sched.homeTeam + "' vs '" + game.homeTeam + "')"));
          Logger.log("        Away team match: " + (sched.awayTeam === game.awayTeam ? "YES" : "NO ('" + sched.awayTeam + "' vs '" + game.awayTeam + "')"));
        }
      }
    }

    Logger.log("");
  }
}

/**
 * Run all debug checks
 */
function debugPlayoffsAll() {
  Logger.log("╔═══════════════════════════════════════════════════════════╗");
  Logger.log("║         PLAYOFF DEBUGGING - FULL DIAGNOSTIC              ║");
  Logger.log("╚═══════════════════════════════════════════════════════════╝");
  Logger.log("");

  debugPlayoffGameSheets();
  Logger.log("");
  Logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Logger.log("");

  debugPlayoffSchedule();
  Logger.log("");
  Logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Logger.log("");

  debugPlayoffMatching();
}

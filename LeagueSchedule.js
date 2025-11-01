// ===== SCHEDULE & HEAD-TO-HEAD FEATURES =====
// Step 5: Schedule generation and league schedule sheet creation

// ===== Update from cached data (called by updateAll) =====
function updateLeagueScheduleFromCache(scheduleData, teamStatsWithH2H, gamesByWeek, boxScoreUrl) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName(CONFIG.SEASON_SCHEDULE_SHEET);
  
  if (!scheduleSheet || scheduleSheet.getLastRow() < 2) {
    logWarning("Step 5", "Season Schedule sheet is empty or missing", "N/A");
    SpreadsheetApp.getUi().alert("Season Schedule sheet is empty or missing!\n\nPlease fill in the Season Schedule sheet first.");
    return;
  }
  
  logInfo("Step 5", "Creating league schedule from cached data");
  
  // Create/update the schedule sheet using cached data
  createLeagueScheduleSheetFromCache(scheduleData, teamStatsWithH2H, gamesByWeek, boxScoreUrl);
  
  logInfo("Step 5", "League schedule updated");
  SpreadsheetApp.getActiveSpreadsheet().toast("League Schedule updated!", "Step 5 Complete", 3);
}

// ===== OLD: Legacy function for manual execution (calls game processor) =====
function updateLeagueSchedule() {
  // This function is now just a wrapper that calls the game processor
  // It's kept for backwards compatibility and manual menu execution
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateLeagueScheduleFromCache(gameData.scheduleData, gameData.teamStatsWithH2H, gameData.gamesByWeek, gameData.boxScoreUrl);
  }
}

// ===== CREATE/UPDATE LEAGUE SCHEDULE SHEET (using cached data) =====
function createLeagueScheduleSheetFromCache(scheduleData, teamStats, gamesByWeek, boxScoreSpreadsheetUrl) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName(CONFIG.LEAGUE_SCHEDULE_SHEET);

  if (!scheduleSheet) {
    scheduleSheet = ss.insertSheet(CONFIG.LEAGUE_SCHEDULE_SHEET);
  }

  // V3 UPDATE: Targeted Clear - preserve user formatting outside managed columns
  // Clear only the data-managed zones instead of entire sheet
  var layout = CONFIG.SHEET_STRUCTURE.LEAGUE_SCHEDULE;
  var maxRows = scheduleSheet.getMaxRows();

  // Clear Standings zone (Columns A-H from row 1 to end)
  if (maxRows > 0) {
    scheduleSheet.getRange(1, layout.STANDINGS.START_COL, maxRows, layout.STANDINGS.NUM_COLS)
      .clearContent().clearFormat().clearNote();

    // Clear Completed Games zone (Column J from row 1 to end)
    scheduleSheet.getRange(1, layout.COMPLETED_GAMES.START_COL, maxRows, 1)
      .clearContent().clearFormat().clearNote();

    // Clear Scheduled Games zone (Column L from row 1 to end)
    scheduleSheet.getRange(1, layout.SCHEDULED_GAMES.START_COL, maxRows, 1)
      .clearContent().clearFormat().clearNote();
  }

  var currentRow = 1;
  
  // STANDINGS HEADER (left) and SCHEDULED GAMES HEADER (right)
  scheduleSheet.getRange(currentRow, 1, 1, 8).merge()
    .setValue("Standings")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  
  scheduleSheet.getRange(currentRow, 12)
    .setValue("Scheduled Games")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  
  currentRow += 2;
  
  // STANDINGS TABLE HEADER
  scheduleSheet.getRange(currentRow, 1, 1, 8).setValues([["Rank", "Team", "W", "L", "Win%", "RS", "RA", "Diff"]])
    .setFontWeight("bold")
    .setBackground("#e8e8e8")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  scheduleSheet.getRange(currentRow, 1, 1, 8).setBorder(false, false, true, false, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  var upcomingGamesStartRow = currentRow;
  currentRow++;
  
  // Build standings data
  var teamOrder = [];
  for (var teamName in teamStats) {
    if (teamStats[teamName].gamesPlayed > 0) {
      teamOrder.push(teamName);
    }
  }
  
  teamOrder.sort(function(teamA, teamB) {
    return compareTeamsByStandings(teamA, teamB, teamStats);
  });
  
  var standingsData = [];
  var currentRank = 1;
  
  for (var i = 0; i < teamOrder.length; i++) {
    var teamName = teamOrder[i];
    var stats = teamStats[teamName];
    
    var winPct = stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0;
    var winPctFormatted = winPct.toFixed(3).substring(1);
    var diff = stats.runsScored - stats.runsAllowed;
    var rankDisplay = "";
    
    if (standingsData.length === 0) {
      rankDisplay = "1";
      currentRank = 1;
    } else {
      var prevData = standingsData[standingsData.length - 1];
      var prevWinPct = prevData[4];
      var prevWins = prevData[2];
      var prevLosses = prevData[3];
      var prevRunDiff = prevData[7];
      
      var isMathematicallyTied = (winPct === prevWinPct && stats.wins === prevWins && stats.losses === prevLosses);
      
      if (!isMathematicallyTied) {
        currentRank = standingsData.length + 1;
        rankDisplay = currentRank.toString();
      } else {
        var prevTeamName = prevData[1];
        var h2hA = stats.headToHead[prevTeamName];
        var h2hB = teamStats[prevTeamName] ? teamStats[prevTeamName].headToHead[teamName] : null;
        var hasMeaningfulH2H = false;
        
        if (h2hA && h2hB && (h2hA.wins + h2hA.losses) > 0) {
          var h2hWinPctA = h2hA.wins / (h2hA.wins + h2hA.losses);
          var h2hWinPctB = h2hB.wins / (h2hB.wins + h2hB.losses);
          if (h2hWinPctA !== h2hWinPctB) {
            hasMeaningfulH2H = true;
          }
        }
        
        var hasDifferentRunDiff = (diff !== prevRunDiff);
        
        if (hasMeaningfulH2H || hasDifferentRunDiff) {
          currentRank = standingsData.length + 1;
          rankDisplay = currentRank.toString();
        } else {
          rankDisplay = "T-" + currentRank;
        }
      }
    }
    
    standingsData.push([rankDisplay, teamName, stats.wins, stats.losses, winPctFormatted, stats.runsScored, stats.runsAllowed, diff]);
  }
  
  var standingsStartRow = currentRow;
  
  if (standingsData.length > 0) {
    scheduleSheet.getRange(standingsStartRow, 1, standingsData.length, 8).setValues(standingsData).setVerticalAlignment("middle");
    
    for (var i = 0; i < standingsData.length; i++) {
      var teamName = standingsData[i][1];
      var stats = teamStats[teamName];
      
      if (!stats) continue;
      
      var tooltip = "Head-to-Head Records:\n\n";
      var h2hRecords = [];
      
      for (var opp in stats.headToHead) {
        var record = stats.headToHead[opp];
        if (record.wins + record.losses > 0) {
          h2hRecords.push("vs " + opp + ": " + record.wins + "-" + record.losses);
        }
      }
      
      if (h2hRecords.length > 0) {
        tooltip += h2hRecords.join("\n");
      } else {
        tooltip = "No head-to-head games played yet";
      }
      
      scheduleSheet.getRange(standingsStartRow + i, 2).setNote(tooltip);
    }
    
    var backgrounds = [];
    var fontWeights = [];
    for (var i = 0; i < standingsData.length; i++) {
      var rowBg = [];
      var rowFw = [];
      for (var c = 0; c < 8; c++) {
        rowBg.push(i % 2 === 1 ? "#f3f3f3" : "#ffffff");
        rowFw.push(c === 1 ? "bold" : "normal");
      }
      backgrounds.push(rowBg);
      fontWeights.push(rowFw);
    }
    scheduleSheet.getRange(standingsStartRow, 1, standingsData.length, 8).setBackgrounds(backgrounds);
    scheduleSheet.getRange(standingsStartRow, 1, standingsData.length, 8).setFontWeights(fontWeights);
    scheduleSheet.getRange(standingsStartRow, 3, standingsData.length, 6).setHorizontalAlignment("right");
  }
  
  // SCHEDULED GAMES on the right - GROUPED BY WEEK
  var upcomingGamesCurrentRow = upcomingGamesStartRow;
  
  var upcomingByWeek = {};
  for (var i = 0; i < scheduleData.length; i++) {
    if (!scheduleData[i].played) {
      var weekKey = "Week " + scheduleData[i].week;
      if (!upcomingByWeek[weekKey]) upcomingByWeek[weekKey] = [];
      upcomingByWeek[weekKey].push(scheduleData[i]);
    }
  }
  
  var upcomingWeekKeys = Object.keys(upcomingByWeek).sort(function(a, b) {
    var numA = parseInt(a.replace("Week ", ""));
    var numB = parseInt(b.replace("Week ", ""));
    return numA - numB;
  });
  
  if (upcomingWeekKeys.length > 0) {
    for (var w = 0; w < upcomingWeekKeys.length; w++) {
      var weekKey = upcomingWeekKeys[w];
      var games = upcomingByWeek[weekKey];
      
      scheduleSheet.getRange(upcomingGamesCurrentRow, 12)
        .setValue(weekKey)
        .setFontWeight("bold")
        .setBackground("#e8e8e8")
        .setHorizontalAlignment("left")
        .setVerticalAlignment("middle")
        .setBorder(false, false, true, false, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      upcomingGamesCurrentRow++;
      
      for (var g = 0; g < games.length; g++) {
        var game = games[g];
        var matchupText = game.homeTeam + " vs " + game.awayTeam;
        
        var gameRange = scheduleSheet.getRange(upcomingGamesCurrentRow, 12);
        gameRange.setValue(matchupText)
          .setVerticalAlignment("middle")
          .setFontStyle("italic")
          .setFontColor("#666666");
        
        if (g % 2 === 1) {
          gameRange.setBackground("#f3f3f3");
        }
        
        upcomingGamesCurrentRow++;
      }
      
      upcomingGamesCurrentRow++;
    }
  } else {
    scheduleSheet.getRange(upcomingGamesCurrentRow, 12)
      .setValue("No upcoming games scheduled")
      .setVerticalAlignment("middle")
      .setFontStyle("italic")
      .setFontColor("#999999");
  }
  
  // V3 UPDATE: 3-Pass Batch System for Completed Games - eliminates N+1 loops
  currentRow = standingsStartRow + standingsData.length + 2;
  writeScheduleToSheet(scheduleSheet, scheduleData, gamesByWeek, boxScoreSpreadsheetUrl, currentRow);
  
  // Set column widths
  scheduleSheet.setColumnWidth(1, CONFIG.LEAGUE_HUB_RANK_WIDTH);
  scheduleSheet.setColumnWidth(2, CONFIG.LEAGUE_HUB_TEAM_WIDTH);
  scheduleSheet.setColumnWidth(3, 40);
  scheduleSheet.setColumnWidth(4, 40);
  scheduleSheet.setColumnWidth(5, 60);
  scheduleSheet.setColumnWidth(6, 50);
  scheduleSheet.setColumnWidth(7, 50);
  scheduleSheet.setColumnWidth(8, 50);
  scheduleSheet.setColumnWidth(10, 300);  // Column J - Completed Games
  scheduleSheet.setColumnWidth(12, 300);  // Column L - Scheduled Games
  
  logInfo("Step 5", "Created/updated League Schedule sheet");
}

// ===== V3: 3-Pass Batch System for Completed Games and This Week's Games =====
// Eliminates N+1 Rich Text loops by batching all operations
function writeScheduleToSheet(scheduleSheet, scheduleData, gamesByWeek, boxScoreSpreadsheetUrl, startRow) {
  // COMPLETED GAMES HEADER
  var completedGamesRow = 1;
  scheduleSheet.getRange(completedGamesRow, 10)
    .setValue("Completed Games")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  completedGamesRow += 2;

  var currentRow = startRow;

  // THIS WEEK'S GAMES
  var maxCompletedWeek = 0;
  for (var i = 0; i < scheduleData.length; i++) {
    if (scheduleData[i].played && scheduleData[i].week > maxCompletedWeek) {
      maxCompletedWeek = scheduleData[i].week;
    }
  }

  var nextWeek = maxCompletedWeek + 1;
  var thisWeeksGames = [];

  for (var i = 0; i < scheduleData.length; i++) {
    if (scheduleData[i].week == nextWeek && !scheduleData[i].played) {
      thisWeeksGames.push(scheduleData[i]);
    }
  }

  if (thisWeeksGames.length > 0) {
    scheduleSheet.getRange(currentRow, 1, 1, 8).merge()
      .setValue("This Week's Games (Week " + nextWeek + ")")
      .setFontWeight("bold")
      .setFontSize(12)
      .setVerticalAlignment("middle");
    currentRow++;

    for (var g = 0; g < thisWeeksGames.length; g++) {
      var game = thisWeeksGames[g];
      var matchupText = game.homeTeam + " vs " + game.awayTeam;

      var gameRange = scheduleSheet.getRange(currentRow, 1, 1, 8);
      gameRange.merge()
        .setValue(matchupText)
        .setVerticalAlignment("middle")
        .setFontStyle("italic")
        .setFontColor("#666666");

      if (g % 2 === 1) {
        gameRange.setBackground("#f3f3f3");
      }

      currentRow++;
    }

    currentRow++;
  }

  // PASS 1: Build all completed game data structures
  var weekKeys = Object.keys(gamesByWeek).sort(function(a, b) {
    var numA = parseInt(a.replace("Week ", ""));
    var numB = parseInt(b.replace("Week ", ""));
    return numA - numB;
  });

  var completedGamesData = [];

  for (var w = 0; w < weekKeys.length; w++) {
    var weekKey = weekKeys[w];
    var games = gamesByWeek[weekKey];

    // Week header
    completedGamesData.push({
      row: completedGamesRow,
      type: "header",
      text: weekKey
    });
    completedGamesRow++;

    // Games
    for (var g = 0; g < games.length; g++) {
      var game = games[g];

      var resultText = game.team1 + ": " + game.runs1 + " || " + game.team2 + ": " + game.runs2;
      var gameUrl = boxScoreSpreadsheetUrl + "#gid=" + game.sheetId;

      var homeTeamEnd = game.team1.length;
      var homeScoreEnd = homeTeamEnd + 2 + String(game.runs1).length;
      var awayTeamStart = resultText.indexOf(game.team2);

      var homeStyle = SpreadsheetApp.newTextStyle()
        .setForegroundColor(game.winner === game.team1 ? "#0B6623" : "#8B0000")
        .setBold(true)
        .build();

      var awayStyle = SpreadsheetApp.newTextStyle()
        .setForegroundColor(game.winner === game.team2 ? "#0B6623" : "#8B0000")
        .setBold(true)
        .build();

      var richTextBuilder = SpreadsheetApp.newRichTextValue()
        .setText(resultText)
        .setLinkUrl(gameUrl);

      richTextBuilder.setTextStyle(0, homeScoreEnd, homeStyle);
      richTextBuilder.setTextStyle(awayTeamStart, resultText.length, awayStyle);

      completedGamesData.push({
        row: completedGamesRow,
        type: "game",
        richText: richTextBuilder.build(),
        alternating: g % 2 === 1
      });

      completedGamesRow++;
    }
    completedGamesRow++;
  }

  // PASS 2: Batch write all completed games data and formatting
  for (var i = 0; i < completedGamesData.length; i++) {
    var item = completedGamesData[i];
    var gameRange = scheduleSheet.getRange(item.row, 10);
    gameRange.setVerticalAlignment("middle");

    if (item.type === "header") {
      // Headers: plain text with formatting
      gameRange.setValue(item.text)
        .setFontWeight("bold")
        .setBackground("#e8e8e8")
        .setHorizontalAlignment("left")
        .setBorder(false, false, true, false, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    } else {
      // Games: rich text
      gameRange.setRichTextValue(item.richText);
      if (item.alternating) {
        gameRange.setBackground("#f3f3f3");
      }
    }
  }
}

// ===== INITIALIZE SEASON SCHEDULE SHEET =====
function initializeSeasonSchedule() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName(CONFIG.SEASON_SCHEDULE_SHEET);
  
  if (!scheduleSheet) {
    scheduleSheet = ss.insertSheet(CONFIG.SEASON_SCHEDULE_SHEET);
    scheduleSheet.getRange(1, 1, 1, 3).setValues([["Week", "Home Team", "Away Team"]]);
    scheduleSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#e8e8e8");
    scheduleSheet.setFrozenRows(1);
    scheduleSheet.setColumnWidth(1, 60);
    scheduleSheet.setColumnWidth(2, 175);
    scheduleSheet.setColumnWidth(3, 175);
    
    SpreadsheetApp.getUi().alert(
      "Season Schedule sheet created!\n\n" +
      "Please fill it in with your schedule:\n" +
      "• Week: Week number (1, 2, 3, etc.)\n" +
      "• Home Team: Team playing at home\n" +
      "• Away Team: Visiting team\n\n" +
      "Once filled, run 'Update League Schedule' to generate the full schedule."
    );
  }
  
  return scheduleSheet;
}

// ===== DEPRECATED: Old combined function (kept for backwards compatibility) =====
function generateLeagueSchedulePage() {
  // This function is now deprecated but kept for backwards compatibility
  // The new approach processes everything in GameProcessor.js
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var boxScoreSS = getBoxScoreSpreadsheet();
  if (!boxScoreSS) return null;
  
  // If called from old code, process games and return minimal data
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
    h2hMatrix: {}, // Not used anymore
    teamNames: teamNames,
    boxScoreUrl: gameData.boxScoreUrl
  };
}

// ===== DEPRECATED: Old function signature (kept for backwards compatibility) =====
function createLeagueScheduleSheet(scheduleData, teamStats, gamesByWeek, boxScoreSpreadsheetUrl) {
  // Redirect to new function
  createLeagueScheduleSheetFromCache(scheduleData, teamStats, gamesByWeek, boxScoreSpreadsheetUrl);
}
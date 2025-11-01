// ===== TEAM SHEETS MODULE =====
// Step 3: Create/update individual team sheets with stats and standings

// ===== Update from cached data (called by updateAll) =====
function updateTeamSheetsFromCache(teamStatsWithH2H, scheduleData, boxScoreUrl) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // ===== Cache all sheets at once to avoid repeated lookups =====
    var allSheets = ss.getSheets();
    var sheetMap = {};
    for (var i = 0; i < allSheets.length; i++) {
      sheetMap[allSheets[i].getName()] = allSheets[i];
    }
    // =============================================================
    var teamStatsSheet = ss.getSheetByName(CONFIG.TEAM_STATS_SHEET);
    var hittingStatsSheet = ss.getSheetByName(CONFIG.HITTING_STATS_SHEET);
    var pitchingStatsSheet = ss.getSheetByName(CONFIG.PITCHING_STATS_SHEET);
    var fieldingStatsSheet = ss.getSheetByName(CONFIG.FIELDING_STATS_SHEET);
    
    if (!teamStatsSheet || !hittingStatsSheet || !pitchingStatsSheet || !fieldingStatsSheet) {
      logError("Step 3", "Cannot find required stats sheets", "Missing one or more sheets");
      SpreadsheetApp.getUi().alert("Cannot find required stats sheets!");
      return;
    }
    
    var lastRow = teamStatsSheet.getLastRow();
    if (lastRow < 2) {
      logError("Step 3", "No teams found", CONFIG.TEAM_STATS_SHEET);
      SpreadsheetApp.getUi().alert("No teams found!");
      return;
    }
    
    var teamData = teamStatsSheet.getRange(2, 1, lastRow - 1, 3).getValues();
    var teamNames = [];
    
    for (var i = 0; i < teamData.length; i++) {
      var teamName = String(teamData[i][0]).trim();
      var gamesPlayed = teamData[i][2];
      if (teamName && teamName !== "" && gamesPlayed > 0) {
        teamNames.push(teamName);
      }
    }
    
    if (teamNames.length === 0) {
      logError("Step 3", "No teams with games played found", CONFIG.TEAM_STATS_SHEET);
      SpreadsheetApp.getUi().alert("No teams with games played found!");
      return;
    }
    
    logInfo("Step 3", "Processing " + teamNames.length + " teams");
    
    // ===== Get all stat data ONCE =====
    var hittingData = getSheetDataWithHeaders(hittingStatsSheet);
    var pitchingData = getSheetDataWithHeaders(pitchingStatsSheet);
    var fieldingData = getSheetDataWithHeaders(fieldingStatsSheet);
    
    var hittingHeadersFiltered = removeColumnFromArray(hittingData.headers, 1);
    var pitchingHeadersFiltered = removeColumnFromArray(pitchingData.headers, 1);
    var fieldingHeadersFiltered = removeColumnFromArray(fieldingData.headers, 1);
    
    // Check if template sheet exists
    var templateSheet = ss.getSheetByName(CONFIG.TEAM_SHEET_TEMPLATE);
    
    // Convert scheduleData array to object format if needed
    var scheduleDataObject = null;
    if (scheduleData && Array.isArray(scheduleData)) {
      scheduleDataObject = {
        schedule: scheduleData,
        boxScoreUrl: boxScoreUrl
      };
    }
    
    // ===== Loop Through Teams using cached data =====
    for (var t = 0; t < teamNames.length; t++) {
      var teamName = teamNames[t];
      var teamSheet = sheetMap[teamName];
      
      // If sheet doesn't exist, create from template or create new
      if (!teamSheet) {
        if (templateSheet) {
          teamSheet = templateSheet.copyTo(ss);
          teamSheet.setName(teamName);
          logInfo("Step 3", "Created team sheet from template: " + teamName);
        } else {
          teamSheet = ss.insertSheet(teamName);
          logInfo("Step 3", "Created new team sheet: " + teamName);
        }
      }
      
      var existingFormat = {};
      try {
        if (teamSheet.getMaxRows() >= 1) {
          var headerCell = teamSheet.getRange(1, 1);
          existingFormat.background = headerCell.getBackground();
          existingFormat.fontColor = headerCell.getFontColor();
        }
      } catch (e) {}
      
      var teamHittingData = filterAndSortTeamData(hittingData.rows, teamName, true);
      var teamPitchingData = filterAndSortTeamData(pitchingData.rows, teamName, true);
      var teamFieldingData = filterAndSortTeamData(fieldingData.rows, teamName, true);
      
      // ===== ROSTER SIZE VALIDATION =====
      if (CONFIG.WARN_ON_ROSTER_OVERFLOW && teamHittingData.length > CONFIG.MAX_PLAYERS_PER_ROSTER) {
        logWarning("Step 3", 
          "Team has " + teamHittingData.length + " players (limit: " + CONFIG.MAX_PLAYERS_PER_ROSTER + ")", 
          teamName);
      }
      
      // ROW 1: Team Summary Header (merged A:O)
      var summaryHeader = teamSheet.getRange(1, 1, 1, 15);
      summaryHeader.merge()
        .setValue(teamName + " Team Summary")
        .setFontWeight("bold")
        .setFontSize(12)
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle");
      
      if (existingFormat.background && existingFormat.background !== "#ffffff" && existingFormat.background !== "#FFFFFF") {
        summaryHeader.setBackground(existingFormat.background);
      }
      if (existingFormat.fontColor && existingFormat.fontColor !== "#000000") {
        summaryHeader.setFontColor(existingFormat.fontColor);
      }
      
      // ROW 2: "Hitting" label (merged A:B) 
      var hittingHeader = teamSheet.getRange(2, 1, 1, 2);
      hittingHeader.merge()
        .setValue("Hitting")
        .setFontWeight("bold")
        .setFontSize(12)
        .setHorizontalAlignment("left")
        .setVerticalAlignment("middle");
      
      // ROW 3: Empty (for custom hitting headers)
      // ROW 4: Empty (for spacing)
      // ROW 5+: Hitting data 
      
      // ===== ROSTER SIZE: Write up to MAX_PLAYERS_PER_ROSTER or actual count =====
      var hittingRowsToWrite = Math.min(teamHittingData.length, CONFIG.MAX_PLAYERS_PER_ROSTER);
      
      if (hittingRowsToWrite > 0) {
        teamSheet.getRange(5, 1, hittingRowsToWrite, hittingHeadersFiltered.length)
          .setValues(teamHittingData.slice(0, hittingRowsToWrite));
      }
      
      // Add placeholder rows if roster is below max
      if (teamHittingData.length < CONFIG.MAX_PLAYERS_PER_ROSTER) {
        var emptyRowsNeeded = CONFIG.MAX_PLAYERS_PER_ROSTER - teamHittingData.length;
        var placeholderRow = [];
        placeholderRow.push("-"); // Player name column
        for (var c = 1; c < hittingHeadersFiltered.length; c++) {
          placeholderRow.push(0); // Stat columns get 0
        }
        var placeholderRows = [];
        for (var r = 0; r < emptyRowsNeeded; r++) {
          placeholderRows.push(placeholderRow.slice()); // Copy the array
        }
        teamSheet.getRange(5 + teamHittingData.length, 1, emptyRowsNeeded, hittingHeadersFiltered.length)
          .setValues(placeholderRows);
      }
      
      // Pitching section 
      // Pitching label has 1 blank row separation from hitting data
      var pitchingSectionRow = 5 + CONFIG.MAX_PLAYERS_PER_ROSTER + 1;
      var pitchingLabelRow = pitchingSectionRow;
      var pitchingStartRow = pitchingLabelRow + 3;
      
      teamSheet.getRange(pitchingLabelRow, 1, 1, 2).merge()
        .setValue("Pitching")
        .setFontWeight("bold")
        .setFontSize(12)
        .setHorizontalAlignment("left")
        .setVerticalAlignment("middle");
      
      // Pitching data starts 3 rows after label (label + blank row + blank row for spacing)
      var pitchingRowsToWrite = Math.min(teamPitchingData.length, CONFIG.MAX_PLAYERS_PER_ROSTER);
      
      if (pitchingRowsToWrite > 0) {
        teamSheet.getRange(pitchingStartRow, 1, pitchingRowsToWrite, pitchingHeadersFiltered.length)
          .setValues(teamPitchingData.slice(0, pitchingRowsToWrite));
      }
      
      // Add placeholder rows if roster is below max
      if (teamPitchingData.length < CONFIG.MAX_PLAYERS_PER_ROSTER) {
        var emptyRowsNeeded = CONFIG.MAX_PLAYERS_PER_ROSTER - teamPitchingData.length;
        var placeholderRow = [];
        placeholderRow.push("-"); // Player name column
        for (var c = 1; c < pitchingHeadersFiltered.length; c++) {
          placeholderRow.push(0); // Stat columns get 0
        }
        var placeholderRows = [];
        for (var r = 0; r < emptyRowsNeeded; r++) {
          placeholderRows.push(placeholderRow.slice());
        }
        teamSheet.getRange(pitchingStartRow + teamPitchingData.length, 1, emptyRowsNeeded, pitchingHeadersFiltered.length)
          .setValues(placeholderRows);
      }
      
      // Fielding section 
      // Fielding label has 1 blank row separation from pitching data
      var fieldingSectionRow = pitchingStartRow + CONFIG.MAX_PLAYERS_PER_ROSTER + 1;
      var fieldingLabelRow = fieldingSectionRow;
      var fieldingStartRow = fieldingLabelRow + 3;
      
      teamSheet.getRange(fieldingLabelRow, 1, 1, 2).merge()
        .setValue("Fielding & Baserunning")
        .setFontWeight("bold")
        .setFontSize(12)
        .setHorizontalAlignment("left")
        .setVerticalAlignment("middle");
      
      // Fielding data starts 3 rows after label (label + blank row + blank row for spacing)
      var fieldingRowsToWrite = Math.min(teamFieldingData.length, CONFIG.MAX_PLAYERS_PER_ROSTER);
      
      if (fieldingRowsToWrite > 0) {
        teamSheet.getRange(fieldingStartRow, 1, fieldingRowsToWrite, fieldingHeadersFiltered.length)
          .setValues(teamFieldingData.slice(0, fieldingRowsToWrite));
      }
      
      // Add placeholder rows if roster is below max
      if (teamFieldingData.length < CONFIG.MAX_PLAYERS_PER_ROSTER) {
        var emptyRowsNeeded = CONFIG.MAX_PLAYERS_PER_ROSTER - teamFieldingData.length;
        var placeholderRow = [];
        placeholderRow.push("-"); // Player name column
        for (var c = 1; c < fieldingHeadersFiltered.length; c++) {
          placeholderRow.push(0); // Stat columns get 0
        }
        var placeholderRows = [];
        for (var r = 0; r < emptyRowsNeeded; r++) {
          placeholderRows.push(placeholderRow.slice());
        }
        teamSheet.getRange(fieldingStartRow + teamFieldingData.length, 1, emptyRowsNeeded, fieldingHeadersFiltered.length)
          .setValues(placeholderRows);
      }
      
      setTeamSheetColumnWidths(teamSheet, Math.max(hittingHeadersFiltered.length, pitchingHeadersFiltered.length, fieldingHeadersFiltered.length));
      teamSheet.setFrozenRows(1);
      
      // ===== Pass cached data to standings/schedule =====
      if (scheduleDataObject) {
        addStandingsAndScheduleToTeamSheet(teamSheet, teamName, teamStatsWithH2H, scheduleDataObject, boxScoreUrl, pitchingLabelRow);
      }
      
      if ((t + 1) % Math.max(1, Math.floor(CONFIG.PROGRESS_UPDATE_FREQUENCY / 2)) === 0) {
        SpreadsheetApp.getActiveSpreadsheet().toast(
          "Updated " + (t + 1) + " of " + teamNames.length + " team sheets...",
          "Step 3 Progress",
          2
        );
      }
    }
    
    logInfo("Step 3", "Updated " + teamNames.length + " team sheets");
    SpreadsheetApp.getActiveSpreadsheet().toast("Updated " + teamNames.length + " team sheets!", "Step 3 Complete", 3);
    
  } catch (e) {
    logError("Step 3", "Error in updateTeamSheets: " + e.toString(), "N/A");
    SpreadsheetApp.getUi().alert("Error: " + e.toString());
  }
}

// ===== OLD: Legacy function for manual execution (calls game processor) =====
function updateTeamSheets() {
  // This function is now just a wrapper that calls the game processor
  // It's kept for backwards compatibility and manual menu execution
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateTeamSheetsFromCache(gameData.teamStatsWithH2H, gameData.scheduleData, gameData.boxScoreUrl);
  }
}

function addStandingsAndScheduleToTeamSheet(teamSheet, teamName, teamStats, scheduleData, boxScoreUrl, scheduleHeaderRow) {
  // ===== STANDINGS SECTION (COLUMNS Q-W ONLY) =====
  var standingsStartRow = 4;
  var standingsStartCol = 17; // Column Q
  
  // Build and sort standings first
  var teamOrder = [];
  for (var name in teamStats) {
    if (teamStats[name].gamesPlayed > 0) {
      teamOrder.push(name);
    }
  }
  
  teamOrder.sort(function(teamA, teamB) {
    return compareTeamsByStandings(teamA, teamB, teamStats);
  });
  
  // ===== Clear ONLY columns Q-W for standings (preserves A-P formatting) =====
  var totalStandingsRows = 2 + teamOrder.length;
  teamSheet.getRange(standingsStartRow, standingsStartCol, totalStandingsRows, 7)
    .clearContent()
    .clearFormat()
    .clearNote();
  
  // LEAGUE STANDINGS HEADER (merged Q:W)
  teamSheet.getRange(standingsStartRow, standingsStartCol, 1, 7).merge()
    .setValue("League Standings")
    .setFontWeight("bold")
    .setFontSize(11)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  standingsStartRow++;
  
  // STANDINGS TABLE HEADER - starts immediately after header (no gap)
  teamSheet.getRange(standingsStartRow, standingsStartCol, 1, 7)
    .setValues([["Rank", "Team", "W", "L", "Win%", "RS", "RA"]])
    .setFontWeight("bold")
    .setBackground("#e8e8e8")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setFontSize(9);
  standingsStartRow++;
  
  // ===== Batch all standings data =====
  var standingsValues = [];
  var standingsBackgrounds = [];
  var standingsFontWeights = [];
  var standingsAlignments = [];
  var standingsTooltips = [];
  
  var currentRank = 1;
  for (var i = 0; i < teamOrder.length; i++) {
    var name = teamOrder[i];
    var stats = teamStats[name];
    
    var winPct = stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0;
    var winPctFormatted = winPct.toFixed(3).substring(1);
    var diff = stats.runsScored - stats.runsAllowed;
    
    var rowData = [currentRank, name, stats.wins, stats.losses, winPctFormatted, stats.runsScored, stats.runsAllowed];
    standingsValues.push(rowData);
    
    // Build tooltip with H2H and run differential
    var tooltip = "W-L: " + stats.wins + "-" + stats.losses + "\n";
    tooltip += "Run Differential: " + (diff >= 0 ? "+" : "") + diff + "\n\n";
    tooltip += "Head-to-Head Records:\n";
    
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
      tooltip += "No head-to-head games played yet";
    }
    standingsTooltips.push(tooltip);
    
    // Build formatting arrays
    var rowBg = [];
    var rowFw = [];
    var rowAlign = [];
    
    var isHighlighted = (name === teamName);
    var bgColor = isHighlighted ? "#fff3cd" : (i % 2 === 1 ? "#f3f3f3" : "#ffffff");
    var fontWeight = isHighlighted ? "bold" : "normal";
    
    for (var c = 0; c < 7; c++) {
      rowBg.push(bgColor);
      rowFw.push(fontWeight);
      rowAlign.push("center");
    }
    
    standingsBackgrounds.push(rowBg);
    standingsFontWeights.push(rowFw);
    standingsAlignments.push(rowAlign);
    
    currentRank++;
  }
  
  // ===== WRITE ALL STANDINGS AT ONCE =====
  if (standingsValues.length > 0) {
    var standingsRange = teamSheet.getRange(standingsStartRow, standingsStartCol, standingsValues.length, 7);
    standingsRange.setValues(standingsValues);
    standingsRange.setBackgrounds(standingsBackgrounds);
    standingsRange.setFontWeights(standingsFontWeights);
    standingsRange.setHorizontalAlignments(standingsAlignments);
    standingsRange.setVerticalAlignment("middle");
    standingsRange.setFontSize(9);
    
    // Add tooltips
    for (var i = 0; i < standingsTooltips.length; i++) {
      teamSheet.getRange(standingsStartRow + i, standingsStartCol + 1).setNote(standingsTooltips[i]);
    }
  }
  
  // ===== SCHEDULE SECTION (ALSO COLUMNS Q-W ONLY) =====
  var scheduleStartRow = scheduleHeaderRow + 2;
  
  // ===== Clear ONLY columns Q-W for schedule (preserves A-P formatting) =====
  var maxScheduleRows = 25;
  teamSheet.getRange(scheduleStartRow, standingsStartCol, maxScheduleRows, 7)
    .clearContent()
    .clearFormat();
  
  teamSheet.getRange(scheduleStartRow, standingsStartCol, 1, 7).merge()
    .setValue(teamName + " Schedule")
    .setFontWeight("bold")
    .setFontSize(11)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  scheduleStartRow++;
  
  // Schedule table starts immediately after header (no gap)
  
  if (!scheduleData || !scheduleData.schedule) {
    teamSheet.getRange(scheduleStartRow, standingsStartCol, 1, 7).merge()
      .setValue("No schedule available")
      .setFontStyle("italic")
      .setFontColor("#999999")
      .setVerticalAlignment("middle")
      .setHorizontalAlignment("center")
      .setFontSize(9);
    return;
  }
  
  // Filter games for this team
  var teamGames = [];
  for (var i = 0; i < scheduleData.schedule.length; i++) {
    var game = scheduleData.schedule[i];
    if (game.homeTeam === teamName || game.awayTeam === teamName) {
      teamGames.push(game);
    }
  }
  
  teamGames.sort(function(a, b) {
    return a.week - b.week;
  });
  
  if (teamGames.length === 0) {
    teamSheet.getRange(scheduleStartRow, standingsStartCol, 1, 7).merge()
      .setValue("No games scheduled")
      .setFontStyle("italic")
      .setFontColor("#999999")
      .setVerticalAlignment("middle")
      .setHorizontalAlignment("center")
      .setFontSize(9);
    return;
  }
  
  // Write schedule games
  for (var g = 0; g < teamGames.length; g++) {
    var game = teamGames[g];
    var gameRange = teamSheet.getRange(scheduleStartRow, standingsStartCol, 1, 7);
    gameRange.merge()
      .setVerticalAlignment("middle")
      .setHorizontalAlignment("center")
      .setFontSize(9);
    
    if (game.played) {
      var resultText = "W" + game.week + " - " + game.homeTeam + ": " + game.homeScore + " || " + game.awayTeam + ": " + game.awayScore;
      var gameUrl = boxScoreUrl + "#gid=" + game.sheetId;
      
      var homeTeamEnd = ("W" + game.week + " - " + game.homeTeam).length;
      var homeScoreEnd = homeTeamEnd + 2 + String(game.homeScore).length;
      var awayTeamStart = resultText.indexOf(game.awayTeam);
      
      var homeStyle = SpreadsheetApp.newTextStyle()
        .setForegroundColor(game.winner === game.homeTeam ? "#0B6623" : "#8B0000")
        .setBold(true)
        .setFontSize(9)
        .build();
      
      var awayStyle = SpreadsheetApp.newTextStyle()
        .setForegroundColor(game.winner === game.awayTeam ? "#0B6623" : "#8B0000")
        .setBold(true)
        .setFontSize(9)
        .build();
      
      var richTextBuilder = SpreadsheetApp.newRichTextValue()
        .setText(resultText)
        .setLinkUrl(gameUrl);
      
      richTextBuilder.setTextStyle(homeTeamEnd - game.homeTeam.length, homeScoreEnd, homeStyle);
      richTextBuilder.setTextStyle(awayTeamStart, resultText.length, awayStyle);
      
      var richText = richTextBuilder.build();
      gameRange.setRichTextValue(richText);
      
      // Highlight background: light green for wins, light red for losses
      var didTeamWin = game.winner === teamName;
      if (didTeamWin) {
        gameRange.setBackground("#d9ead3");  // Light green
      } else {
        gameRange.setBackground("#f4cccc");  // Light red
      }
      
    } else {
      var upcomingText = "W" + game.week + " - " + game.homeTeam + " vs " + game.awayTeam;
      gameRange.setValue(upcomingText)
        .setFontStyle("italic")
        .setFontColor("#666666");
      
      // Alternating background for upcoming games
      if (g % 2 === 1) {
        gameRange.setBackground("#f3f3f3");
      }
    }
    
    scheduleStartRow++;
  }
  
  // Set column widths
  teamSheet.setColumnWidth(17, 60);  // Q - Rank
  teamSheet.setColumnWidth(18, 120); // R - Team
  teamSheet.setColumnWidth(19, 40);  // S - W
  teamSheet.setColumnWidth(20, 40);  // T - L
  teamSheet.setColumnWidth(21, 60);  // U - Win%
  teamSheet.setColumnWidth(22, 50);  // V - RS
  teamSheet.setColumnWidth(23, 50);  // W - RA
}
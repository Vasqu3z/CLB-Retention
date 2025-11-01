// ===== LEAGUE HUB MODULE =====
// Step 4: Update standings, league leaders, and recent results

// ===== Update from cached data (called by updateAll) =====
// V3 UPDATE: Now accepts full gameData object for in-memory performance
function updateLeagueHubFromCache(gameData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // V3 UPDATE: Extract variables from gameData object
  var teamStatsWithH2H = gameData.teamStatsWithH2H;
  var gamesByWeek = gameData.gamesByWeek;
  var scheduleData = gameData.scheduleData;
  var boxScoreUrl = gameData.boxScoreUrl;

  logInfo("Step 4", "Building League Hub from cached data");
  
  var standingsSheet = ss.getSheetByName(CONFIG.LEAGUE_HUB_SHEET);
  if (!standingsSheet) {
    standingsSheet = ss.insertSheet(CONFIG.LEAGUE_HUB_SHEET);
  }

  // V3 UPDATE: Targeted Clear - preserve user formatting outside managed columns
  // Clear only the data-managed zones instead of entire sheet
  var layout = CONFIG.SHEET_STRUCTURE.LEAGUE_HUB;
  var maxRows = standingsSheet.getMaxRows();

  // Clear Standings zone (Columns A-H from row 1 to end)
  if (maxRows > 0) {
    standingsSheet.getRange(1, layout.STANDINGS.START_COL, maxRows, layout.STANDINGS.NUM_COLS)
      .clearContent().clearFormat().clearNote();

    // Clear Batting Leaders zone (Column J from row 1 to end)
    standingsSheet.getRange(1, layout.LEADERS_BATTING.START_COL, maxRows, 1)
      .clearContent().clearFormat().clearNote();

    // Clear Pitching Leaders zone (Column L from row 1 to end)
    standingsSheet.getRange(1, layout.LEADERS_PITCHING.START_COL, maxRows, 1)
      .clearContent().clearFormat().clearNote();

    // Clear Fielding Leaders zone (Column N from row 1 to end)
    standingsSheet.getRange(1, layout.LEADERS_FIELDING.START_COL, maxRows, 1)
      .clearContent().clearFormat().clearNote();
  }

  var currentRow = 1;
  
  // Sort teams by standings
  var teamOrder = [];
  for (var teamName in teamStatsWithH2H) {
    if (teamStatsWithH2H[teamName].gamesPlayed > 0) {
      teamOrder.push(teamName);
    }
  }
  
  teamOrder.sort(function(teamA, teamB) {
    return compareTeamsByStandings(teamA, teamB, teamStatsWithH2H);
  });

  // V3 UPDATE: Pass in-memory playerStats instead of sheet references
  var leagueLeaders = getLeagueLeaders(gameData.playerStats, teamStatsWithH2H);
  
  // ===== HEADERS =====
  standingsSheet.getRange(currentRow, 1, 1, 8).merge()
    .setValue("Standings")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  standingsSheet.getRange(currentRow, 10)
    .setValue("League Leaders (Batting)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  standingsSheet.getRange(currentRow, 12)
    .setValue("League Leaders (Pitching)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  standingsSheet.getRange(currentRow, 14)
    .setValue("League Leaders (Fielding/Baserunning)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  currentRow += 2;
  
  // ===== STANDINGS TABLE HEADER =====
  standingsSheet.getRange(currentRow, 1, 1, 8)
    .setValues([["Rank", "Team", "W", "L", "Win%", "RS", "RA", "Diff"]])
    .setFontWeight("bold")
    .setBackground("#e8e8e8")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  standingsSheet.getRange(currentRow, 1, 1, 8)
    .setBorder(false, false, true, false, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  var leadersStartRow = currentRow;
  currentRow++;
  
  var standingsStartRow = currentRow;
  
  // ===== BATCH ALL STANDINGS DATA =====
  var standingsValues = [];
  var standingsBackgrounds = [];
  var standingsFontWeights = [];
  var standingsAlignments = [];
  var standingsTooltips = [];
  
  var currentRank = 1;
  
  for (var i = 0; i < teamOrder.length; i++) {
    var teamName = teamOrder[i];
    var stats = teamStatsWithH2H[teamName];
    if (stats.gamesPlayed === 0) continue;
    
    var winPct = stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0;
    var winPctFormatted = winPct.toFixed(3).substring(1);
    var diff = stats.runsScored - stats.runsAllowed;
    var rankDisplay = "";
    
    if (standingsValues.length === 0) {
      rankDisplay = "1";
      currentRank = 1;
    } else {
      var prevData = standingsValues[standingsValues.length - 1];
      var prevWinPct = parseFloat("0" + prevData[4]); // Convert back from formatted string
      var prevWins = prevData[2];
      var prevLosses = prevData[3];
      var prevRunDiff = prevData[7];
      
      var isMathematicallyTied = (winPct === prevWinPct && stats.wins === prevWins && stats.losses === prevLosses);
      
      if (!isMathematicallyTied) {
        currentRank = standingsValues.length + 1;
        rankDisplay = currentRank.toString();
      } else {
        var prevTeamName = prevData[1];
        var h2hA = stats.headToHead[prevTeamName];
        var h2hB = teamStatsWithH2H[prevTeamName] ? teamStatsWithH2H[prevTeamName].headToHead[teamName] : null;
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
          currentRank = standingsValues.length + 1;
          rankDisplay = currentRank.toString();
        } else {
          rankDisplay = "T-" + currentRank;
        }
      }
    }
    
    standingsValues.push([rankDisplay, teamName, stats.wins, stats.losses, winPctFormatted, stats.runsScored, stats.runsAllowed, diff]);
    
    // Build tooltip
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
    standingsTooltips.push(tooltip);
    
    // Build formatting arrays
    var rowBg = [];
    var rowFw = [];
    var rowAlign = [];
    
    for (var c = 0; c < 8; c++) {
      rowBg.push(i % 2 === 1 ? "#f3f3f3" : "#ffffff");
      rowFw.push(c === 1 ? "bold" : "normal");
      rowAlign.push(c < 2 ? "left" : "right");
    }
    
    standingsBackgrounds.push(rowBg);
    standingsFontWeights.push(rowFw);
    standingsAlignments.push(rowAlign);
  }
  
  // ===== WRITE ALL STANDINGS AT ONCE =====
  if (standingsValues.length > 0) {
    var standingsRange = standingsSheet.getRange(standingsStartRow, 1, standingsValues.length, 8);
    standingsRange.setValues(standingsValues);
    standingsRange.setBackgrounds(standingsBackgrounds);
    standingsRange.setFontWeights(standingsFontWeights);
    standingsRange.setHorizontalAlignments(standingsAlignments);
    standingsRange.setVerticalAlignment("middle");
    
    // Add tooltips
    for (var i = 0; i < standingsTooltips.length; i++) {
      standingsSheet.getRange(standingsStartRow + i, 2).setNote(standingsTooltips[i]);
    }
  }
  
  // ===== LEAGUE LEADERS =====
  writeLeagueLeaders(standingsSheet, leagueLeaders, leadersStartRow);
  
  currentRow = standingsStartRow + standingsValues.length + 2;
  
  // ===== THIS WEEK'S GAMES =====
  var scheduleSheet = ss.getSheetByName(CONFIG.SEASON_SCHEDULE_SHEET);
  if (scheduleSheet && scheduleData && Array.isArray(scheduleData)) {
    var maxCompletedWeek = 0;
    for (var i = 0; i < scheduleData.length; i++) {
      if (scheduleData[i].played && scheduleData[i].week > maxCompletedWeek) {
        maxCompletedWeek = scheduleData[i].week;
      }
    }
    
    var nextWeek = maxCompletedWeek + 1;
    var upcomingGames = [];
    
    for (var i = 0; i < scheduleData.length; i++) {
      if (scheduleData[i].week == nextWeek && !scheduleData[i].played) {
        upcomingGames.push(scheduleData[i]);
      }
    }
    
    if (upcomingGames.length > 0) {
      standingsSheet.getRange(currentRow, 1, 1, 8).merge()
        .setValue("This Week's Games (Week " + nextWeek + ")")
        .setFontWeight("bold")
        .setFontSize(12)
        .setVerticalAlignment("middle");
      currentRow++;
      
      var scheduleSheetObj = ss.getSheetByName(CONFIG.LEAGUE_SCHEDULE_SHEET);
      if (scheduleSheetObj) {
        var scheduleLink = SpreadsheetApp.newRichTextValue()
          .setText("📅 View Full Season Schedule →")
          .setLinkUrl("#gid=" + scheduleSheetObj.getSheetId())
          .setTextStyle(SpreadsheetApp.newTextStyle()
            .setForegroundColor("#1a73e8")
            .setUnderline(true)
            .build())
          .build();

        standingsSheet.getRange(currentRow, 1, 1, 8).merge()
          .setRichTextValue(scheduleLink)
          .setFontSize(11)
          .setVerticalAlignment("middle")
          .setHorizontalAlignment("right");
        currentRow++;
      } else {
        currentRow++;
      }
      
      for (var g = 0; g < upcomingGames.length; g++) {
        var game = upcomingGames[g];
        var matchupText = game.homeTeam + " vs " + game.awayTeam;
        
        var gameRange = standingsSheet.getRange(currentRow, 1, 1, 8);
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
  }
  
  // ===== RECENT RESULTS =====
  standingsSheet.getRange(currentRow, 1, 1, 8).merge()
    .setValue("Recent Results")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  currentRow += 2;

  var weekKeys = Object.keys(gamesByWeek).sort(function(a, b) {
    var numA = parseInt(a.replace("Week ", ""));
    var numB = parseInt(b.replace("Week ", ""));
    return numB - numA;
  });

  var weeksToShow = Math.min(weekKeys.length, CONFIG.RECENT_SCHEDULE_WEEKS);

  // ===== BUILD ALL RICH TEXT FIRST, THEN APPLY =====
  var recentResultsData = [];
  
  for (var w = 0; w < weeksToShow; w++) {
    var weekKey = weekKeys[w];
    var games = gamesByWeek[weekKey];
    
    // Week header
    recentResultsData.push({
      row: currentRow,
      type: "header",
      text: weekKey
    });
    currentRow++;
    
    // Games
    for (var g = 0; g < games.length; g++) {
      var game = games[g];
      
      var resultText = game.team1 + ": " + game.runs1 + " || " + game.team2 + ": " + game.runs2;
      var gameUrl = boxScoreUrl + "#gid=" + game.sheetId;
      
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
      
      var richText = richTextBuilder.build();
      
      recentResultsData.push({
        row: currentRow,
        type: "game",
        richText: richText,
        alternating: g % 2 === 1
      });
      
      currentRow++;
    }
    currentRow++;
  }
  
  // ===== WRITE ALL RECENT RESULTS =====
  for (var i = 0; i < recentResultsData.length; i++) {
    var item = recentResultsData[i];
    var gameRange = standingsSheet.getRange(item.row, 1, 1, 8);
    gameRange.merge().setVerticalAlignment("middle");
    
    if (item.type === "header") {
      gameRange.setValue(item.text)
        .setFontWeight("bold")
        .setBackground("#e8e8e8")
        .setHorizontalAlignment("left")
        .setBorder(false, false, true, false, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    } else {
      gameRange.setRichTextValue(item.richText);
      if (item.alternating) {
        gameRange.setBackground("#f3f3f3");
      }
    }
  }
  
  // ===== SET COLUMN WIDTHS =====
  standingsSheet.setColumnWidth(1, CONFIG.LEAGUE_HUB_RANK_WIDTH);
  standingsSheet.setColumnWidth(2, CONFIG.LEAGUE_HUB_TEAM_WIDTH);
  standingsSheet.setColumnWidth(3, 40);
  standingsSheet.setColumnWidth(4, 40);
  standingsSheet.setColumnWidth(5, 60);
  standingsSheet.setColumnWidth(6, 50);
  standingsSheet.setColumnWidth(7, 50);
  standingsSheet.setColumnWidth(8, 50);
  standingsSheet.setColumnWidth(10, 300);
  standingsSheet.setColumnWidth(12, 300);
  standingsSheet.setColumnWidth(14, 300);
  
  logInfo("Step 4", "Updated " + CONFIG.LEAGUE_HUB_SHEET);
  SpreadsheetApp.getActiveSpreadsheet().toast(CONFIG.LEAGUE_HUB_SHEET + " updated!", "Step 4 Complete", 3);
}

// ===== OLD: Legacy function for manual execution (calls game processor) =====
function updateLeagueHub() {
  // This function is now just a wrapper that calls the game processor
  // It's kept for backwards compatibility and manual menu execution
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    // V3 UPDATE: Pass full gameData object
    updateLeagueHubFromCache(gameData);
  }
}

// ===== DEPRECATED: Renamed for clarity =====
function updateStandingsAndScoreboard() {
  // Backwards compatibility wrapper
  updateLeagueHub();
}
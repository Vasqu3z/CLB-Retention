// ===== LEAGUE HUB MODULE =====
// Step 3: Update standings

// ===== Update from cached data (called by updateAll) =====
// Now accepts full gameData object for in-memory performance
function updateLeagueHubFromCache(gameData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Extract variables from gameData object
  var teamStatsWithH2H = gameData.teamStatsWithH2H;

  logInfo("Step 3", "Building simplified Rankings (standings only)");
  
  var standingsSheet = ss.getSheetByName(CONFIG.STANDINGS_SHEET);
  if (!standingsSheet) {
    standingsSheet = ss.insertSheet(CONFIG.STANDINGS_SHEET);
  }

  // Targeted Clear - preserve user formatting outside managed columns
  // Clear only the data-managed zones instead of entire sheet
  var layout = CONFIG.SHEET_STRUCTURE.LEAGUE_HUB;
  var maxRows = standingsSheet.getMaxRows();

  // Clear Standings zone (Columns A-H from row 1 to end)
  // Note: League leaders are now handled by the website reading directly from Player Data
  if (maxRows > 0) {
    standingsSheet.getRange(1, layout.STANDINGS.START_COL + 1, maxRows, layout.STANDINGS.NUM_COLS)
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

  // ===== HEADERS =====
  standingsSheet.getRange(currentRow, layout.STANDINGS.START_COL + 1, 1, 8).merge()
    .setValue("Standings")
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("middle");
  currentRow += 2;
  
  // ===== STANDINGS TABLE HEADER =====
  standingsSheet.getRange(currentRow, layout.STANDINGS.START_COL + 1, 1, layout.STANDINGS.NUM_COLS)
    .setValues([["Rank", "Team", "W", "L", "Win%", "RS", "RA", "Diff"]])
    .setFontWeight("bold")
    .setBackground("#e8e8e8")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  standingsSheet.getRange(currentRow, layout.STANDINGS.START_COL + 1, 1, layout.STANDINGS.NUM_COLS)
    .setBorder(false, false, true, false, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

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
    var standingsRange = standingsSheet.getRange(standingsStartRow, layout.STANDINGS.START_COL + 1, standingsValues.length, layout.STANDINGS.NUM_COLS);
    standingsRange.setValues(standingsValues);
    standingsRange.setBackgrounds(standingsBackgrounds);
    standingsRange.setFontWeights(standingsFontWeights);
    standingsRange.setHorizontalAlignments(standingsAlignments);
    standingsRange.setVerticalAlignment("middle");

    // Add tooltips
    for (var i = 0; i < standingsTooltips.length; i++) {
      standingsSheet.getRange(standingsStartRow + i, layout.STANDINGS.START_COL + 2).setNote(standingsTooltips[i]);
    }
  }

  // Rankings sheet is now simplified - only shows standings
  // Schedule information is available on the website's schedule page
  // ===== SET COLUMN WIDTHS =====
  standingsSheet.setColumnWidth(layout.STANDINGS.START_COL + 1, layout.STANDINGS.RANK_WIDTH);
  standingsSheet.setColumnWidth(layout.STANDINGS.START_COL + 2, layout.STANDINGS.TEAM_WIDTH);
  standingsSheet.setColumnWidth(layout.STANDINGS.START_COL + 3, 40);
  standingsSheet.setColumnWidth(layout.STANDINGS.START_COL + 4, 40);
  standingsSheet.setColumnWidth(layout.STANDINGS.START_COL + 5, 60);
  standingsSheet.setColumnWidth(layout.STANDINGS.START_COL + 6, 50);
  standingsSheet.setColumnWidth(layout.STANDINGS.START_COL + 7, 50);
  standingsSheet.setColumnWidth(layout.STANDINGS.START_COL + 8, 50);
  
  logInfo("Step 3", "Updated " + CONFIG.STANDINGS_SHEET);
  SpreadsheetApp.getActiveSpreadsheet().toast(CONFIG.STANDINGS_SHEET + " updated!", "Step 3 Complete", 3);
}

/**
 * Manual execution entry point for League Hub updates
 */
function updateLeagueHub() {
  var gameData = processAllGameSheetsOnce();
  if (gameData) {
    updateLeagueHubFromCache(gameData);
  }
}

/**
 * Legacy function name for backwards compatibility
 */
function updateStandingsAndScoreboard() {
  updateLeagueHub();
}

// ===== PLAYOFF BRACKET =====

/**
 * Update playoff bracket with seeding and series results
 * Called from updateAllPlayoffs() in LeagueCore.js
 * @param {object} playoffGameData - The full playoff game data object with scheduleData
 */
function updatePlayoffBracketFromCache(playoffGameData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bracketSheet = ss.getSheetByName(CONFIG.PLAYOFF_BRACKET_SHEET);

  if (!bracketSheet) {
    bracketSheet = ss.insertSheet(CONFIG.PLAYOFF_BRACKET_SHEET);
  }

  logInfo("Playoff Bracket", "Updating playoff bracket");

  // Check if playoffs have started
  var playoffsStarted = checkIfPlayoffsStarted(playoffGameData);

  // Read current standings to get playoff seeding
  var standingsSheet = ss.getSheetByName(CONFIG.STANDINGS_SHEET);
  if (!standingsSheet) {
    logError("Playoff Bracket", "Standings sheet not found", "Cannot determine playoff seeding");
    return;
  }

  // Get top 8 teams from standings
  var layout = CONFIG.SHEET_STRUCTURE.LEAGUE_HUB;
  var standingsData = standingsSheet.getRange(layout.STANDINGS_START_ROW, layout.STANDINGS.START_COL + 1, 8, layout.STANDINGS.NUM_COLS).getValues();

  // Build team lookup by seed (1-8)
  var teamsBySeeds = {};
  for (var i = 0; i < standingsData.length && i < 8; i++) {
    var team = standingsData[i][1];
    if (!team || team === "") break;
    teamsBySeeds[i + 1] = team;  // Seed 1-8 maps to team name
  }

  // Clear the sheet
  bracketSheet.clear();

  var currentRow = 1;

  // ===== BRACKET MATCHUPS =====
  bracketSheet.getRange(currentRow, 1, 1, 9).merge()
    .setValue("Bracket Matchups")
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground("#4a86e8")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  currentRow += 2;

  // Bracket header
  bracketSheet.getRange(currentRow, 1, 1, 9)
    .setValues([["Round", "Series", "High Seed", "Low Seed", "Team A", "Team B", "Wins A", "Wins B", "Winner"]])
    .setFontWeight("bold")
    .setBackground("#e8e8e8")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  currentRow++;

  var matchupsStartRow = currentRow;

  // Define bracket structure (8-team bracket)
  var bracketStructure = [
    // Quarterfinals
    { round: "Quarterfinals", series: "QF1", highSeed: 1, lowSeed: 8 },
    { round: "Quarterfinals", series: "QF2", highSeed: 4, lowSeed: 5 },
    { round: "Quarterfinals", series: "QF3", highSeed: 2, lowSeed: 7 },
    { round: "Quarterfinals", series: "QF4", highSeed: 3, lowSeed: 6 },
    // Semifinals
    { round: "Semifinals", series: "SF1", highSeed: "QF1", lowSeed: "QF2" },
    { round: "Semifinals", series: "SF2", highSeed: "QF3", lowSeed: "QF4" },
    // Finals
    { round: "Finals", series: "F1", highSeed: "SF1", lowSeed: "SF2" }
  ];

  var matchupsData = [];
  var seriesResults = {};

  // If playoffs started, calculate series records from schedule
  if (playoffsStarted && playoffGameData.scheduleData) {
    seriesResults = calculateSeriesRecords(playoffGameData.scheduleData);
  }

  for (var i = 0; i < bracketStructure.length; i++) {
    var matchup = bracketStructure[i];
    var teamA = "";
    var teamB = "";
    var winsA = 0;
    var winsB = 0;
    var winner = "";

    // Resolve team names based on seeds or previous series winners
    if (typeof matchup.highSeed === "number" && teamsBySeeds[matchup.highSeed]) {
      teamA = teamsBySeeds[matchup.highSeed];
    } else if (typeof matchup.highSeed === "string" && seriesResults[matchup.highSeed]) {
      teamA = seriesResults[matchup.highSeed].winner || "TBD";
    }

    if (typeof matchup.lowSeed === "number" && teamsBySeeds[matchup.lowSeed]) {
      teamB = teamsBySeeds[matchup.lowSeed];
    } else if (typeof matchup.lowSeed === "string" && seriesResults[matchup.lowSeed]) {
      teamB = seriesResults[matchup.lowSeed].winner || "TBD";
    }

    // Get series results if available
    if (teamA && teamB && seriesResults[matchup.series]) {
      var result = seriesResults[matchup.series];
      winsA = result.teamAWins || 0;
      winsB = result.teamBWins || 0;
      winner = result.winner || "";
    }

    matchupsData.push([
      matchup.round,
      matchup.series,
      matchup.highSeed,
      matchup.lowSeed,
      teamA || "TBD",
      teamB || "TBD",
      winsA,
      winsB,
      winner
    ]);
  }

  // Write matchups data
  if (matchupsData.length > 0) {
    bracketSheet.getRange(matchupsStartRow, 1, matchupsData.length, 9).setValues(matchupsData);

    // Format matchups rows
    for (var i = 0; i < matchupsData.length; i++) {
      var rowRange = bracketSheet.getRange(matchupsStartRow + i, 1, 1, 9);
      rowRange.setBackground(i % 2 === 1 ? "#f3f3f3" : "#ffffff");
      rowRange.setHorizontalAlignment("center");
      rowRange.setVerticalAlignment("middle");
    }
  }

  // Set column widths
  bracketSheet.setColumnWidth(1, 120);  // Round
  bracketSheet.setColumnWidth(2, 80);   // Series
  bracketSheet.setColumnWidth(3, 90);   // High Seed
  bracketSheet.setColumnWidth(4, 90);   // Low Seed
  bracketSheet.setColumnWidth(5, 150);  // Team A
  bracketSheet.setColumnWidth(6, 150);  // Team B
  bracketSheet.setColumnWidth(7, 70);   // Wins A
  bracketSheet.setColumnWidth(8, 70);   // Wins B
  bracketSheet.setColumnWidth(9, 150);  // Winner

  logInfo("Playoff Bracket", "Bracket updated successfully (Status: " + (playoffsStarted ? "Playoffs Started" : "Regular Season") + ")");
}

/**
 * Check if playoffs have started
 * Returns true if MAX_GAMES_PER_SEASON reached OR first playoff game detected
 */
function checkIfPlayoffsStarted(playoffGameData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Method 1: Check if any playoff games have been played
  if (playoffGameData && playoffGameData.scheduleData) {
    for (var i = 0; i < playoffGameData.scheduleData.length; i++) {
      if (playoffGameData.scheduleData[i].played) {
        return true;
      }
    }
  }

  // Method 2: Check if all teams have reached MAX_GAMES_PER_SEASON
  var standingsSheet = ss.getSheetByName(CONFIG.STANDINGS_SHEET);
  if (standingsSheet) {
    var layout = CONFIG.SHEET_STRUCTURE.LEAGUE_HUB;
    var standingsData = standingsSheet.getRange(layout.STANDINGS_START_ROW, layout.STANDINGS.START_COL + 1, 8, layout.STANDINGS.NUM_COLS).getValues();

    var allTeamsComplete = true;
    for (var i = 0; i < standingsData.length; i++) {
      var team = standingsData[i][1];
      if (!team || team === "") break;

      var wins = standingsData[i][2];
      var losses = standingsData[i][3];
      var gamesPlayed = wins + losses;

      if (gamesPlayed < CONFIG.MAX_GAMES_PER_SEASON) {
        allTeamsComplete = false;
        break;
      }
    }

    if (allTeamsComplete) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate series records from playoff schedule data
 * Returns an object mapping series IDs to results
 */
function calculateSeriesRecords(scheduleData) {
  var seriesMap = {};

  for (var i = 0; i < scheduleData.length; i++) {
    var game = scheduleData[i];
    if (!game.played) continue;

    var seriesId = game.series || "";
    if (!seriesId) continue;

    if (!seriesMap[seriesId]) {
      seriesMap[seriesId] = {
        teamA: game.homeTeam,
        teamB: game.awayTeam,
        teamAWins: 0,
        teamBWins: 0,
        winner: ""
      };
    }

    // Count wins
    if (game.winner === seriesMap[seriesId].teamA) {
      seriesMap[seriesId].teamAWins++;
    } else if (game.winner === seriesMap[seriesId].teamB) {
      seriesMap[seriesId].teamBWins++;
    }
  }

  // Determine series winners (best of 3: 2 wins, best of 5: 3 wins, best of 7: 4 wins)
  for (var seriesId in seriesMap) {
    var series = seriesMap[seriesId];
    if (series.teamAWins >= 4 || series.teamAWins >= 3 || series.teamAWins >= 2) {
      // Check if they've clinched based on common formats
      if (series.teamAWins > series.teamBWins &&
          (series.teamAWins >= 4 || series.teamAWins >= 3 || series.teamAWins >= 2)) {
        series.winner = series.teamA;
      }
    }
    if (series.teamBWins >= 4 || series.teamBWins >= 3 || series.teamBWins >= 2) {
      if (series.teamBWins > series.teamAWins &&
          (series.teamBWins >= 4 || series.teamBWins >= 3 || series.teamBWins >= 2)) {
        series.winner = series.teamB;
      }
    }
  }

  return seriesMap;
}

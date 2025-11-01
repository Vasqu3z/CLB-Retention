// ===== UTILITY FUNCTIONS =====
// Helper functions, cache management, validation, logging

// ===== ERROR LOGGING =====

function initializeErrorLog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var errorSheet = ss.getSheetByName(CONFIG.ERROR_LOG_SHEET);
  
  if (!errorSheet) {
    errorSheet = ss.insertSheet(CONFIG.ERROR_LOG_SHEET);
    errorSheet.setName(CONFIG.ERROR_LOG_SHEET);
    errorSheet.getRange(1, 1, 1, 4).setValues([["Timestamp", "Step", "Error Message", "Affected Entity"]]);
    errorSheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e8e8e8");
    errorSheet.hideSheet();
  }
  
  return errorSheet;
}

function logError(stepName, errorMessage, affectedEntity) {
  try {
    var errorSheet = initializeErrorLog();
    var timestamp = new Date();
    var lastRow = errorSheet.getLastRow();
    errorSheet.getRange(lastRow + 1, 1, 1, 4).setValues([[timestamp, stepName, errorMessage, affectedEntity]]);
    Logger.log("ERROR [" + stepName + "]: " + errorMessage + " (Entity: " + affectedEntity + ")");
  } catch (e) {
    Logger.log("Failed to log error: " + e.toString());
  }
}

function logInfo(stepName, message) {
  Logger.log("INFO [" + stepName + "]: " + message);
}

function logWarning(stepName, message, affectedEntity) {
  Logger.log("WARNING [" + stepName + "]: " + message + " (Entity: " + affectedEntity + ")");
}

// ===== CACHE MANAGEMENT =====

function getBoxScoreSpreadsheet() {
  if (_spreadsheetCache.boxScoreSpreadsheet) {
    return _spreadsheetCache.boxScoreSpreadsheet;
  }

  try {
    _spreadsheetCache.boxScoreSpreadsheet = SpreadsheetApp.openById(CONFIG.BOX_SCORE_SPREADSHEET_ID);
    logInfo("Cache", "Loaded box score spreadsheet into cache");
    return _spreadsheetCache.boxScoreSpreadsheet;
  } catch (e) {
    logError("Cache", "Cannot open box score spreadsheet: " + e.toString(), "Spreadsheet ID: " + CONFIG.BOX_SCORE_SPREADSHEET_ID);
    SpreadsheetApp.getUi().alert(
      "Cannot open box score spreadsheet!\n\n" +
      "Please check the BOX_SCORE_SPREADSHEET_ID in the CONFIG section.\n\n" +
      "Error: " + e.toString()
    );
    return null;
  }
}

function getGameSheets(boxScoreSS) {
  if (_spreadsheetCache.gameSheets) {
    return _spreadsheetCache.gameSheets;
  }
  
  var sheets = boxScoreSS.getSheets();
  var gameSheets = [];
  var skippedSheets = [];
  
  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    if (sheetName.startsWith(CONFIG.GAME_SHEET_PREFIX)) {
      if (validateGameSheet(sheets[i])) {
        gameSheets.push(sheets[i]);
      } else {
        skippedSheets.push(sheetName);
        logWarning("Game Sheets", "Skipped invalid sheet", sheetName);
      }
    }
  }
  
  if (skippedSheets.length > 0) {
    logWarning("Game Sheets", "Skipped " + skippedSheets.length + " invalid sheet(s)", skippedSheets.join(", "));
  }
  
  _spreadsheetCache.gameSheets = gameSheets;
  logInfo("Cache", "Loaded " + gameSheets.length + " valid game sheets into cache");
  return gameSheets;
}

function clearCache() {
  _spreadsheetCache.boxScoreSpreadsheet = null;
  _spreadsheetCache.gameSheets = null;
  logInfo("Cache", "Cleared spreadsheet cache");
}

// ===== GAME SHEET VALIDATION =====

function validateGameSheet(sheet) {
  var warnings = [];
  var sheetName = sheet.getName();
  
  try {
    if (CONFIG.VALIDATE_TEAM_NAMES) {
      var teamInfo = sheet.getRange(CONFIG.BOX_SCORE_TEAM_INFO).getValues();
      var team1 = String(teamInfo[0][0]).trim();
      var team2 = String(teamInfo[1][0]).trim();
      
      if (!team1 || team1 === "") {
        warnings.push("Missing team name in B3");
      }
      if (!team2 || team2 === "") {
        warnings.push("Missing team name in B4");
      }
    }
    
    if (CONFIG.VALIDATE_RUNS) {
      var teamInfo = sheet.getRange(CONFIG.BOX_SCORE_TEAM_INFO).getValues();
      var runs1 = teamInfo[0][4];
      var runs2 = teamInfo[1][4];
      
      if (typeof runs1 !== 'number' || isNaN(runs1)) {
        warnings.push("Invalid/missing runs for team 1 in F3");
      }
      if (typeof runs2 !== 'number' || isNaN(runs2)) {
        warnings.push("Invalid/missing runs for team 2 in F4");
      }
    }
    
    if (CONFIG.VALIDATE_WLS_DATA) {
      var wlsData = sheet.getRange(CONFIG.BOX_SCORE_WLS_DATA).getValues();
      var winningPitcher = String(wlsData[1][1]).trim();
      var losingPitcher = String(wlsData[2][4]).trim();
      
      if (!winningPitcher || winningPitcher === "") {
        warnings.push("Missing winning pitcher in N49");
      }
      if (!losingPitcher || losingPitcher === "") {
        warnings.push("Missing losing pitcher in R50");
      }
    }
    
    if (CONFIG.VALIDATE_PLAYER_DATA) {
      var hittingData = sheet.getRange(
        CONFIG.BOX_SCORE_HITTING_START_ROW,
        CONFIG.BOX_SCORE_HITTING_START_COL,
        CONFIG.BOX_SCORE_HITTING_NUM_ROWS,
        1
      ).getValues();
      
      var playerCount = 0;
      for (var i = 0; i < hittingData.length; i++) {
        if (String(hittingData[i][0]).trim()) {
          playerCount++;
        }
      }
      
      if (playerCount < CONFIG.MIN_PLAYERS_PER_TEAM) {
        warnings.push("Too few players found (minimum: " + CONFIG.MIN_PLAYERS_PER_TEAM + ")");
      }
    }
    
  } catch (e) {
    warnings.push("Validation error: " + e.toString());
  }
  
  if (warnings.length > 0) {
    for (var i = 0; i < warnings.length; i++) {
      logWarning("Game Sheet Validation", warnings[i], sheetName);
    }
    return false;
  }
  
  return true;
}

// ===== DATA VALIDATION =====

function validatePlayerStats(playerName, stats, gameSheet) {
  var warnings = [];
  
  if (stats.gamesPlayed > CONFIG.MAX_GAMES_PER_SEASON) {
    warnings.push("Games played (" + stats.gamesPlayed + ") exceeds season max (" + CONFIG.MAX_GAMES_PER_SEASON + ")");
  }
  
  if (stats.gamesPlayed > 0) {
    var avgAB = stats.hitting[0] / stats.gamesPlayed;
    if (avgAB > CONFIG.MAX_AB_PER_GAME) {
      warnings.push("Average AB per game (" + avgAB.toFixed(1) + ") exceeds max (" + CONFIG.MAX_AB_PER_GAME + ")");
    }
  }
  
  if (stats.gamesPlayed > 0) {
    var avgH = stats.hitting[1] / stats.gamesPlayed;
    if (avgH > CONFIG.MAX_HITS_PER_GAME) {
      warnings.push("Average hits per game (" + avgH.toFixed(1) + ") exceeds max (" + CONFIG.MAX_HITS_PER_GAME + ")");
    }
  }
  
  if (stats.gamesPlayed > 0) {
    var avgHR = stats.hitting[2] / stats.gamesPlayed;
    if (avgHR > CONFIG.MAX_HR_PER_GAME) {
      warnings.push("Average HR per game (" + avgHR.toFixed(1) + ") exceeds max (" + CONFIG.MAX_HR_PER_GAME + ")");
    }
  }
  
  if (stats.gamesPlayed > 0) {
    var avgIP = stats.pitching[0] / stats.gamesPlayed;
    if (avgIP > CONFIG.MAX_IP_PER_GAME) {
      warnings.push("Average IP per game (" + avgIP.toFixed(1) + ") exceeds max (" + CONFIG.MAX_IP_PER_GAME + ")");
    }
  }
  
  for (var i = 0; i < warnings.length; i++) {
    logWarning("Data Validation", warnings[i], playerName + " (Sheet: " + (gameSheet ? gameSheet.getName() : "N/A") + ")");
  }
}

// ===== HELPER FUNCTIONS =====

function getSheetDataWithHeaders(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow < 2 || lastCol < 1) {
    return { headers: [], rows: [], numCols: 0 };
  }
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  return { headers: headers, rows: rows, numCols: lastCol };
}

function removeColumnFromArray(arr, columnIndex) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (i !== columnIndex) result.push(arr[i]);
  }
  return result;
}

function filterAndSortTeamData(allData, teamName, removeTeamColumn) {
  var filtered = [];
  
  for (var i = 0; i < allData.length; i++) {
    if (String(allData[i][1]).trim() === teamName) {
      if (removeTeamColumn) {
        var rowWithoutTeam = [];
        for (var j = 0; j < allData[i].length; j++) {
          if (j !== 1) rowWithoutTeam.push(allData[i][j]);
        }
        filtered.push(rowWithoutTeam);
      } else {
        filtered.push(allData[i]);
      }
    }
  }
  
  filtered.sort(function(a, b) {
    return String(a[0]).localeCompare(String(b[0]));
  });
  
  return filtered;
}

function setTeamSheetColumnWidths(sheet, maxColumns) {
  sheet.setColumnWidth(1, CONFIG.PLAYER_COLUMN_WIDTH);
}

// ===== STANDINGS HELPER =====

function compareTeamsByStandings(teamA, teamB, teamStats) {
  var statsA = teamStats[teamA];
  var statsB = teamStats[teamB];
  
  // 1. Win percentage
  var winPctA = statsA.gamesPlayed > 0 ? statsA.wins / statsA.gamesPlayed : 0;
  var winPctB = statsB.gamesPlayed > 0 ? statsB.wins / statsB.gamesPlayed : 0;
  if (winPctA !== winPctB) return winPctB - winPctA;
  
  // 2. Head-to-head
  var h2hA = statsA.headToHead[teamB];
  var h2hB = statsB.headToHead[teamA];
  if (h2hA && h2hB) {
    var h2hWinPctA = (h2hA.wins + h2hA.losses) > 0 ? h2hA.wins / (h2hA.wins + h2hA.losses) : 0;
    var h2hWinPctB = (h2hB.wins + h2hB.losses) > 0 ? h2hB.wins / (h2hB.wins + h2hB.losses) : 0;
    if (h2hWinPctA !== h2hWinPctB) return h2hWinPctB - h2hWinPctA;
  }
  
  // 3. Run differential
  var runDiffA = statsA.runsScored - statsA.runsAllowed;
  var runDiffB = statsB.runsScored - statsB.runsAllowed;
  if (runDiffA !== runDiffB) return runDiffB - runDiffA;
  
  // 4. Alphabetical
  return teamA.localeCompare(teamB);
}

// ===== LEAGUE LEADERS & FORMATTING =====

// V3 UPDATE: Refactored to use in-memory playerStats instead of reading sheets
function getLeagueLeaders(playerStats, teamStats) {
  var leaders = {
    batting: { obp: [], hits: [], hr: [], rbi: [], slg: [], ops: [] },
    pitching: { ip: [], wins: [], losses: [], saves: [], era: [], whip: [], baa: [] },
    fielding: { nicePlays: [], errors: [], stolenBases: [] }
  };

  // Get player-to-team mapping from Player Data sheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var playerDataSheet = ss.getSheetByName(CONFIG.PLAYER_STATS_SHEET);
  if (!playerDataSheet) return leaders;

  var lastRow = playerDataSheet.getLastRow();
  if (lastRow < 2) return leaders;

  var playerTeamData = playerDataSheet.getRange(2, 1, lastRow - 1, 2).getValues();
  var playerTeamMap = {};
  for (var i = 0; i < playerTeamData.length; i++) {
    var playerName = String(playerTeamData[i][0]).trim();
    var team = String(playerTeamData[i][1]).trim();
    if (playerName && team) {
      playerTeamMap[playerName] = team;
    }
  }

  // V3: Process stats from in-memory playerStats object
  for (var playerName in playerStats) {
    var stats = playerStats[playerName];
    var team = playerTeamMap[playerName];
    if (!team || !teamStats[team]) continue;

    var gp = stats.gamesPlayed;
    if (gp === 0) continue;

    var teamGP = teamStats[team].gamesPlayed;

    // Process hitting stats
    var ab = stats.hitting[0];  // AB
    var hits = stats.hitting[1];  // H
    var hr = stats.hitting[2];  // HR
    var rbi = stats.hitting[3];  // RBI
    var bb = stats.hitting[4];  // BB
    var rob = stats.hitting[6];  // ROB
    var tb = stats.hitting[8];  // TB

    var qualifyingAB = teamGP * CONFIG.MIN_AB_MULTIPLIER;

    // Calculate derived stats
    var avg = ab > 0 ? hits / ab : 0;
    var obp = ab > 0 ? rob / ab : 0;
    var slg = ab > 0 ? tb / ab : 0;
    var ops = obp + slg;

    if (typeof obp === 'number' && !isNaN(obp) && ab >= qualifyingAB) {
      leaders.batting.obp.push({ name: playerName, team: team, value: obp });
    }
    if (typeof hits === 'number' && !isNaN(hits) && hits > 0) {
      leaders.batting.hits.push({ name: playerName, team: team, value: hits });
    }
    if (typeof hr === 'number' && !isNaN(hr) && hr > 0) {
      leaders.batting.hr.push({ name: playerName, team: team, value: hr });
    }
    if (typeof rbi === 'number' && !isNaN(rbi) && rbi > 0) {
      leaders.batting.rbi.push({ name: playerName, team: team, value: rbi });
    }
    if (typeof slg === 'number' && !isNaN(slg) && ab >= qualifyingAB) {
      leaders.batting.slg.push({ name: playerName, team: team, value: slg });
    }
    if (typeof ops === 'number' && !isNaN(ops) && ab >= qualifyingAB) {
      leaders.batting.ops.push({ name: playerName, team: team, value: ops });
    }

    // Process pitching stats
    var ip = stats.pitching[0];  // IP
    var bf = stats.pitching[1];  // BF
    var h_allowed = stats.pitching[2];  // H
    var hr_allowed = stats.pitching[3];  // HR
    var r_allowed = stats.pitching[4];  // R
    var bb_allowed = stats.pitching[5];  // BB
    var k = stats.pitching[6];  // K
    var wins = stats.wins;
    var losses = stats.losses;
    var saves = stats.saves;

    var qualifyingIP = teamGP * CONFIG.MIN_IP_MULTIPLIER;

    // Calculate derived pitching stats
    var era = ip > 0 ? (r_allowed * 7) / ip : 0;  // 7-inning games
    var whip = ip > 0 ? (bb_allowed + h_allowed) / ip : 0;
    var baa = bf > 0 ? h_allowed / bf : 0;

    if (typeof ip === 'number' && !isNaN(ip) && ip > 0) {
      leaders.pitching.ip.push({ name: playerName, team: team, value: ip });
    }
    if (typeof wins === 'number' && !isNaN(wins) && wins > 0) {
      leaders.pitching.wins.push({ name: playerName, team: team, value: wins });
    }
    if (typeof losses === 'number' && !isNaN(losses) && losses > 0) {
      leaders.pitching.losses.push({ name: playerName, team: team, value: losses });
    }
    if (typeof saves === 'number' && !isNaN(saves) && saves > 0) {
      leaders.pitching.saves.push({ name: playerName, team: team, value: saves });
    }
    if (typeof era === 'number' && !isNaN(era) && ip >= qualifyingIP) {
      leaders.pitching.era.push({ name: playerName, team: team, value: era });
    }
    if (typeof whip === 'number' && !isNaN(whip) && ip >= qualifyingIP) {
      leaders.pitching.whip.push({ name: playerName, team: team, value: whip });
    }
    if (typeof baa === 'number' && !isNaN(baa) && ip >= qualifyingIP) {
      leaders.pitching.baa.push({ name: playerName, team: team, value: baa });
    }

    // Process fielding stats
    var nicePlays = stats.fielding[0];  // NP
    var errors = stats.fielding[1];  // E
    var stolenBases = stats.fielding[2];  // SB

    if (typeof nicePlays === 'number' && !isNaN(nicePlays) && nicePlays > 0) {
      leaders.fielding.nicePlays.push({ name: playerName, team: team, value: nicePlays });
    }
    if (typeof errors === 'number' && !isNaN(errors) && errors > 0) {
      leaders.fielding.errors.push({ name: playerName, team: team, value: errors });
    }
    if (typeof stolenBases === 'number' && !isNaN(stolenBases) && stolenBases > 0) {
      leaders.fielding.stolenBases.push({ name: playerName, team: team, value: stolenBases });
    }
  }
  
  // Sort all categories
  leaders.batting.obp.sort(function(a, b) { return b.value - a.value; });
  leaders.batting.hits.sort(function(a, b) { return b.value - a.value; });
  leaders.batting.hr.sort(function(a, b) { return b.value - a.value; });
  leaders.batting.rbi.sort(function(a, b) { return b.value - a.value; });
  leaders.batting.slg.sort(function(a, b) { return b.value - a.value; });
  leaders.batting.ops.sort(function(a, b) { return b.value - a.value; });
  leaders.pitching.ip.sort(function(a, b) { return b.value - a.value; });
  leaders.pitching.wins.sort(function(a, b) { return b.value - a.value; });
  leaders.pitching.losses.sort(function(a, b) { return b.value - a.value; });
  leaders.pitching.saves.sort(function(a, b) { return b.value - a.value; });
  leaders.pitching.era.sort(function(a, b) { return a.value - b.value; });
  leaders.pitching.whip.sort(function(a, b) { return a.value - b.value; });
  leaders.pitching.baa.sort(function(a, b) { return a.value - b.value; });
  leaders.fielding.nicePlays.sort(function(a, b) { return b.value - a.value; });
  leaders.fielding.errors.sort(function(a, b) { return b.value - a.value; });
  leaders.fielding.stolenBases.sort(function(a, b) { return b.value - a.value; });
  
  // Get top 5 with ties collapsed
  leaders.batting.obp = getTop5WithTiesCollapsed(leaders.batting.obp);
  leaders.batting.hits = getTop5WithTiesCollapsed(leaders.batting.hits);
  leaders.batting.hr = getTop5WithTiesCollapsed(leaders.batting.hr);
  leaders.batting.rbi = getTop5WithTiesCollapsed(leaders.batting.rbi);
  leaders.batting.slg = getTop5WithTiesCollapsed(leaders.batting.slg);
  leaders.batting.ops = getTop5WithTiesCollapsed(leaders.batting.ops);
  leaders.pitching.ip = getTop5WithTiesCollapsed(leaders.pitching.ip);
  leaders.pitching.wins = getTop5WithTiesCollapsed(leaders.pitching.wins);
  leaders.pitching.losses = getTop5WithTiesCollapsed(leaders.pitching.losses);
  leaders.pitching.saves = getTop5WithTiesCollapsed(leaders.pitching.saves);
  leaders.pitching.era = getTop5WithTiesCollapsed(leaders.pitching.era);
  leaders.pitching.whip = getTop5WithTiesCollapsed(leaders.pitching.whip);
  leaders.pitching.baa = getTop5WithTiesCollapsed(leaders.pitching.baa);
  leaders.fielding.nicePlays = getTop5WithTiesCollapsed(leaders.fielding.nicePlays);
  leaders.fielding.errors = getTop5WithTiesCollapsed(leaders.fielding.errors);
  leaders.fielding.stolenBases = getTop5WithTiesCollapsed(leaders.fielding.stolenBases);
  
  return leaders;
}

function getTop5WithTiesCollapsed(array) {
  if (array.length <= 5) return array;
  
  var result = [];
  var currentRank = 1;
  var i = 0;
  
  while (i < array.length && result.length < 5) {
    var currentValue = array[i].value;
    var tiedPlayers = [];
    
    while (i < array.length && array[i].value === currentValue) {
      tiedPlayers.push(array[i]);
      i++;
    }
    
    if (result.length + tiedPlayers.length > 5) {
      result.push({
        isTieSummary: true,
        name: "T-" + currentRank + ". " + tiedPlayers.length + " Players Tied w/",
        value: currentValue,
        rank: currentRank
      });
      break;
    }
    
    for (var j = 0; j < tiedPlayers.length; j++) {
      result.push(tiedPlayers[j]);
    }
    currentRank += tiedPlayers.length;
  }
  
  return result;
}

function writeLeagueLeaders(sheet, leaders, startRow) {
  var row = startRow;
  
  var battingCol = 10;
  var battingRow = row;
  writeLeaderCategory(sheet, battingRow, battingCol, "On-Base Percentage (OBP)", leaders.batting.obp, formatAvg);
  battingRow += getDisplayedLeadersCount(leaders.batting.obp) + 2;
  writeLeaderCategory(sheet, battingRow, battingCol, "Hits (H)", leaders.batting.hits, formatWhole);
  battingRow += getDisplayedLeadersCount(leaders.batting.hits) + 2;
  writeLeaderCategory(sheet, battingRow, battingCol, "Home Runs (HR)", leaders.batting.hr, formatWhole);
  battingRow += getDisplayedLeadersCount(leaders.batting.hr) + 2;
  writeLeaderCategory(sheet, battingRow, battingCol, "Runs Batted In (RBI)", leaders.batting.rbi, formatWhole);
  battingRow += getDisplayedLeadersCount(leaders.batting.rbi) + 2;
  writeLeaderCategory(sheet, battingRow, battingCol, "Slugging Percentage (SLG)", leaders.batting.slg, formatAvg);
  battingRow += getDisplayedLeadersCount(leaders.batting.slg) + 2;
  writeLeaderCategory(sheet, battingRow, battingCol, "On-Base Plus Slugging (OPS)", leaders.batting.ops, formatAvg);
  
  var pitchingCol = 12;
  var pitchingRow = row;
  writeLeaderCategory(sheet, pitchingRow, pitchingCol, "Innings Pitched (IP)", leaders.pitching.ip, formatIP);
  pitchingRow += getDisplayedLeadersCount(leaders.pitching.ip) + 2;
  writeLeaderCategory(sheet, pitchingRow, pitchingCol, "Wins (W)", leaders.pitching.wins, formatWhole);
  pitchingRow += getDisplayedLeadersCount(leaders.pitching.wins) + 2;
  writeLeaderCategory(sheet, pitchingRow, pitchingCol, "Losses (L)", leaders.pitching.losses, formatWhole);
  pitchingRow += getDisplayedLeadersCount(leaders.pitching.losses) + 2;
  writeLeaderCategory(sheet, pitchingRow, pitchingCol, "Saves (SV)", leaders.pitching.saves, formatWhole);
  pitchingRow += getDisplayedLeadersCount(leaders.pitching.saves) + 2;
  writeLeaderCategory(sheet, pitchingRow, pitchingCol, "Earned Run Average (ERA)", leaders.pitching.era, formatDecimal);
  pitchingRow += getDisplayedLeadersCount(leaders.pitching.era) + 2;
  writeLeaderCategory(sheet, pitchingRow, pitchingCol, "Walks & Hits per Inning Pitched (WHIP)", leaders.pitching.whip, formatDecimal);
  pitchingRow += getDisplayedLeadersCount(leaders.pitching.whip) + 2;
  writeLeaderCategory(sheet, pitchingRow, pitchingCol, "Batting Average Against (BAA)", leaders.pitching.baa, formatAvg);
  
  var fieldingCol = 14;
  var fieldingRow = row;
  writeLeaderCategory(sheet, fieldingRow, fieldingCol, "Nice Plays (NP)", leaders.fielding.nicePlays, formatWhole);
  fieldingRow += getDisplayedLeadersCount(leaders.fielding.nicePlays) + 2;
  writeLeaderCategory(sheet, fieldingRow, fieldingCol, "Errors (E)", leaders.fielding.errors, formatWhole);
  fieldingRow += getDisplayedLeadersCount(leaders.fielding.errors) + 2;
  writeLeaderCategory(sheet, fieldingRow, fieldingCol, "Stolen Bases (SB)", leaders.fielding.stolenBases, formatWhole);
}

function getDisplayedLeadersCount(leaders) {
  return leaders.length;
}

function writeLeaderCategory(sheet, startRow, col, title, leaders, formatFunc) {
  sheet.getRange(startRow, col)
    .setValue(title)
    .setFontWeight("bold")
    .setBackground("#e8e8e8")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle")
    .setBorder(false, false, true, false, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  var dataRows = [];
  var backgrounds = [];
  var currentRank = 1;
  var prevValue = null;
  var rankAtPrevValue = 1;
  
  for (var i = 0; i < leaders.length; i++) {
    var l = leaders[i];
    
    if (l.isTieSummary) {
      var displayValue = formatFunc(l.value);
      dataRows.push([l.name + " " + displayValue]);
      backgrounds.push([i % 2 === 1 ? "#f3f3f3" : "#ffffff"]);
      continue;
    }
    
    var displayValue = formatFunc(l.value);
    var rankDisplay = "";
    
    if (i === 0) {
      rankDisplay = "1. ";
      prevValue = l.value;
      rankAtPrevValue = 1;
    } else {
      if (l.value === prevValue) {
        rankDisplay = "T-" + rankAtPrevValue + ". ";
      } else {
        currentRank = i + 1;
        rankDisplay = currentRank + ". ";
        prevValue = l.value;
        rankAtPrevValue = currentRank;
      }
    }
    
    dataRows.push([rankDisplay + l.name + " (" + l.team + "): " + displayValue]);
    backgrounds.push([i % 2 === 1 ? "#f3f3f3" : "#ffffff"]);
  }
  
  if (dataRows.length > 0) {
    var dataRange = sheet.getRange(startRow + 1, col, dataRows.length, 1);
    dataRange.setValues(dataRows).setBackgrounds(backgrounds).setVerticalAlignment("middle");
  }
}

// ===== FORMATTING HELPERS =====

function formatAvg(value) {
  return value < 1 ? value.toFixed(3).substring(1) : value.toFixed(3);
}

function formatWhole(value) {
  return value.toString();
}

function formatIP(value) {
  return value.toFixed(2);
}

function formatDecimal(value) {
  return value.toFixed(2);
}

// ===== ADDITIONAL UTILITY FUNCTIONS (V3 - consolidated from RetentionHelpers) =====

/**
 * Calculate percentile rank for a value in a sorted array
 * @param {number} value - The value to rank
 * @param {Array<number>} sortedArray - Sorted array of values
 * @return {number} Percentile rank (0-100)
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
  return percentile;
}

/**
 * Find player index in array by name and team
 * @param {Array} players - Array of player objects
 * @param {string} name - Player name
 * @param {string} team - Team name
 * @return {number} Index of player, or -1 if not found
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
 * @param {number} num - The number to get suffix for
 * @return {string} Ordinal suffix (st, nd, rd, th)
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
 * Find a section in a sheet by searching for header text in column A
 * @param {Sheet} sheet - The sheet to search
 * @param {string} searchText - The text to search for
 * @return {number} Row number where section starts, or -1 if not found
 */
function findSheetSection(sheet, searchText) {
  try {
    var lastRow = sheet.getLastRow();
    var searchRange = sheet.getRange(1, 1, lastRow, 1).getValues();

    for (var i = 0; i < searchRange.length; i++) {
      var cellValue = String(searchRange[i][0]);
      if (cellValue.indexOf(searchText) >= 0) {
        return i + 1;
      }
    }
  } catch (e) {
    logError("Find Section", "Error finding section: " + e.toString(), searchText);
  }

  return -1;
}

/**
 * V3 INTEGRATION:
 * Caches the final processed gameData to PropertiesService
 * so the Retention suite can access it.
 */
function cacheCurrentSeasonStats(gameData) {
  try {
    var dataToCache = {
      playerStats: gameData.playerStats,
      teamStatsWithH2H: gameData.teamStatsWithH2H
      // We don't need scheduleData for retention
    };

    var jsonData = JSON.stringify(dataToCache);

    // Save to ScriptProperties, which is available to all scripts in the project
    PropertiesService.getScriptProperties().setProperty('CURRENT_SEASON_STATS', jsonData);

    logInfo('V3 Integration', 'Successfully cached current season stats for Retention suite');

  } catch (e) {
    logError('V3 Integration', 'Could not cache season stats: ' + e.toString(), 'N/A');
  }
}
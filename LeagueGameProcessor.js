// ===== GAME PROCESSOR MODULE =====
// Master game sheet processor - reads all games once and returns all needed data

// ===== Read entire game sheet once =====
function readCompleteGameData(sheet) {
  // Read the entire data range in ONE operation (B3:R50)
  // This covers all game data we need
  var fullData = sheet.getRange(3, 2, 48, 17).getValues(); // B3:R50
  
  return {
    // Team info (B3:F4) - rows 0-1
    awayTeam: String(fullData[0][0]).trim(),  // B3
    homeTeam: String(fullData[1][0]).trim(),  // B4
    awayRuns: fullData[0][4],                  // F3
    homeRuns: fullData[1][4],                  // F4
    
    // Pitching/Fielding data (B6:R27) - rows 3-24
    pitchFieldData: fullData.slice(3, 25).map(function(row) {
      return [
        String(row[0]).trim(),  // Player name (B)
        row[7],  row[8],  row[9],  row[10], row[11], row[12], row[13], // Pitching (I-O)
        row[14], row[15], row[16]  // Fielding (P-R)
      ];
    }),
    
    // Hitting data (B29:K50) - rows 26-47
    hittingData: fullData.slice(26, 48).map(function(row) {
      return [
        String(row[0]).trim(),  // Player name (B)
        row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9] // Stats (C-K)
      ];
    }),
    
    // Team totals (C39:K39 and C50:K50) - rows 36 and 47
    awayTeamTotals: fullData[36].slice(1, 10),  // C39:K39
    homeTeamTotals: fullData[47].slice(1, 10),  // C50:K50
    
    // Team pitching/fielding (I16:R16 and I27:R27) - rows 13 and 24
    awayTeamPitchField: fullData[13].slice(7, 17),  // I16:R16
    homeTeamPitchField: fullData[24].slice(7, 17),  // I27:R27
    
    // W/L/S data (M48:R50) - rows 45-47
    winningPitcher: String(fullData[46][12]).trim(),  // N49
    losingPitcher: String(fullData[47][15]).trim(),   // Q50
    savePitcher: String(fullData[46][15]).trim()      // Q49
  };
}

// ===== MASTER FUNCTION: Process all game sheets once =====
function processAllGameSheetsOnce() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var boxScoreSS = getBoxScoreSpreadsheet();
  if (!boxScoreSS) return null;
  
  var gameSheets = getGameSheets(boxScoreSS);
  if (gameSheets.length === 0) {
    logError("Game Processor", "No game sheets found", "Game sheet prefix: " + CONFIG.GAME_SHEET_PREFIX);
    return null;
  }
  
  logInfo("Game Processor", "Processing " + gameSheets.length + " game sheets (single pass)");
  
  var result = {
    playerStats: initializePlayerStats(ss),
    teamStats: initializeTeamStats(ss),
    teamStatsWithH2H: initializeTeamStatsWithH2H(ss),
    gamesByWeek: {},
    scheduleData: initializeScheduleData(ss, boxScoreSS),
    boxScoreUrl: boxScoreSS.getUrl()
  };
  
  // ===== Single read per game =====
  for (var g = 0; g < gameSheets.length; g++) {
    var sheet = gameSheets[g];
    var sheetName = sheet.getName();
    
    try {
      // Read all game data in ONE operation
      var gameData = readCompleteGameData(sheet);
      
      // Extract week number
      var weekMatch = sheetName.match(/W(\d+)/);
      var weekNum = weekMatch ? parseInt(weekMatch[1]) : 999;
      var weekKey = "Week " + weekNum;
      
      if (!result.gamesByWeek[weekKey]) result.gamesByWeek[weekKey] = [];
      
      // Determine winner/loser
      var team1 = gameData.homeTeam;
      var team2 = gameData.awayTeam;
      var runs1 = gameData.homeRuns;
      var runs2 = gameData.awayRuns;
      
      var winner = "", loser = "";
      if (typeof runs1 === 'number' && typeof runs2 === 'number' && !isNaN(runs1) && !isNaN(runs2)) {
        if (runs1 > runs2) { winner = team1; loser = team2; }
        else if (runs2 > runs1) { winner = team2; loser = team1; }
      }
      
      // Process all stats using pre-read data
      processPlayerStatsFromData(gameData, result.playerStats);
      processTeamStatsFromData(gameData, result.teamStats, team1, team2, winner, loser);
      processTeamStatsWithH2HFromGame(result.teamStatsWithH2H, team1, team2, winner, loser, runs1, runs2);
      
      result.gamesByWeek[weekKey].push({
        sheetName: sheetName,
        sheetId: sheet.getSheetId(),
        team1: team1,
        team2: team2,
        runs1: runs1,
        runs2: runs2,
        winner: winner,
        loser: loser,
        weekNum: weekNum
      });
      
      updateScheduleDataFromGame(result.scheduleData, sheet, team1, team2, runs1, runs2, winner);
      
      // Progress update
      if ((g + 1) % CONFIG.PROGRESS_UPDATE_FREQUENCY === 0) {
        SpreadsheetApp.getActiveSpreadsheet().toast(
          "Processed " + (g + 1) + " of " + gameSheets.length + " games...",
          "Game Processor",
          2
        );
      }
      
    } catch (e) {
      logError("Game Processor", "Error processing game sheet: " + e.toString(), sheet.getName());
    }
  }
  
  logInfo("Game Processor", "Completed processing all game sheets");
  return result;
}

// ===== INITIALIZATION FUNCTIONS =====

function initializePlayerStats(ss) {
  var playerStatsSheet = ss.getSheetByName(CONFIG.PLAYER_STATS_SHEET);
  if (!playerStatsSheet) return {};
  
  var lastRow = playerStatsSheet.getLastRow();
  if (lastRow < 2) return {};
  
  var playerNamesData = playerStatsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var playerStats = {};
  
  for (var p = 0; p < playerNamesData.length; p++) {
    var playerName = String(playerNamesData[p][0]).trim();
    if (playerName && playerName !== "") {
      playerStats[playerName] = {
        gamesPlayed: 0, wins: 0, losses: 0, saves: 0,
        hitting: [0,0,0,0,0,0,0,0,0], // AB, H, HR, RBI, BB, K, ROB, DP, TB
        pitching: [0,0,0,0,0,0,0], // IP, BF, H, HR, R, BB, K
        fielding: [0,0,0] // Nice Plays, Errors, SB
      };
    }
  }
  
  return playerStats;
}

function initializeTeamStats(ss) {
  var teamStatsSheet = ss.getSheetByName(CONFIG.TEAM_STATS_SHEET);
  if (!teamStatsSheet) return {};
  
  var lastRow = teamStatsSheet.getLastRow();
  if (lastRow < 2) return {};
  
  var teamNamesData = teamStatsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var teamStats = {};
  
  for (var t = 0; t < teamNamesData.length; t++) {
    var teamName = String(teamNamesData[t][0]).trim();
    if (teamName && teamName !== "") {
      teamStats[teamName] = {
        gamesPlayed: 0, wins: 0, losses: 0,
        hitting: [0,0,0,0,0,0,0,0,0], // AB, H, HR, RBI, BB, K, ROB, DP, TB
        pitching: [0,0,0,0,0,0,0], // IP, BF, H, HR, R, BB, K
        fielding: [0,0,0] // Nice Plays, Errors, SB
      };
    }
  }
  
  return teamStats;
}

function initializeTeamStatsWithH2H(ss) {
  var teamStatsSheet = ss.getSheetByName(CONFIG.TEAM_STATS_SHEET);
  if (!teamStatsSheet) return {};
  
  var lastRow = teamStatsSheet.getLastRow();
  if (lastRow < 2) return {};
  
  var allTeamNames = teamStatsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var teamStats = {};
  
  // Initialize all teams
  for (var i = 0; i < allTeamNames.length; i++) {
    var tn = String(allTeamNames[i][0]).trim();
    if (tn && tn !== "") {
      teamStats[tn] = {
        gamesPlayed: 0, wins: 0, losses: 0, 
        runsScored: 0, runsAllowed: 0, 
        headToHead: {}
      };
    }
  }
  
  // Initialize head-to-head records
  for (var team1 in teamStats) {
    for (var team2 in teamStats) {
      if (team1 !== team2) {
        teamStats[team1].headToHead[team2] = { wins: 0, losses: 0 };
      }
    }
  }
  
  return teamStats;
}

function initializeScheduleData(ss, boxScoreSS) {
  var scheduleSheet = ss.getSheetByName(CONFIG.SEASON_SCHEDULE_SHEET);
  if (!scheduleSheet || scheduleSheet.getLastRow() < 2) {
    return [];
  }
  
  var scheduleData = scheduleSheet.getRange(2, 1, scheduleSheet.getLastRow() - 1, 3).getValues();
  var schedule = [];
  
  for (var i = 0; i < scheduleData.length; i++) {
    var week = scheduleData[i][0];
    var homeTeam = String(scheduleData[i][1]).trim();
    var awayTeam = String(scheduleData[i][2]).trim();
    
    if (week && homeTeam && awayTeam) {
      schedule.push({
        week: week,
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        played: false,
        homeScore: null,
        awayScore: null,
        winner: null,
        sheetId: null
      });
    }
  }
  
  return schedule;
}

// ===== GAME PROCESSING FUNCTIONS =====

function processPlayerStatsFromData(gameData, playerStats) {
  var playersInThisGame = {};
  
  // Process hitting stats
  for (var i = 0; i < gameData.hittingData.length; i++) {
    var playerName = gameData.hittingData[i][0];
    if (playerName && playerStats[playerName]) {
      playersInThisGame[playerName] = true;
      for (var s = 0; s < 9; s++) {
        var val = gameData.hittingData[i][s + 1];
        if (typeof val === 'number' && !isNaN(val)) {
          playerStats[playerName].hitting[s] += val;
        }
      }
    }
  }
  
  // Process pitching and fielding stats
  for (var i = 0; i < gameData.pitchFieldData.length; i++) {
    var playerName = gameData.pitchFieldData[i][0];
    if (playerName && playerStats[playerName]) {
      playersInThisGame[playerName] = true;
      
      // Pitching stats (indices 1-7)
      for (var s = 0; s < 7; s++) {
        var val = gameData.pitchFieldData[i][s + 1];
        if (typeof val === 'number' && !isNaN(val)) {
          playerStats[playerName].pitching[s] += val;
        }
      }
      
      // Fielding stats (indices 8-10)
      for (var s = 0; s < 3; s++) {
        var val = gameData.pitchFieldData[i][s + 8];
        if (typeof val === 'number' && !isNaN(val)) {
          playerStats[playerName].fielding[s] += val;
        }
      }
      
      // Win/Loss/Save tracking
      if (playerName === gameData.winningPitcher) playerStats[playerName].wins++;
      if (playerName === gameData.losingPitcher) playerStats[playerName].losses++;
      if (playerName === gameData.savePitcher) playerStats[playerName].saves++;
    }
  }
  
  // Count games played
  for (var playerName in playersInThisGame) {
    playerStats[playerName].gamesPlayed++;
  }
}

function processTeamStatsFromData(gameData, teamStats, team1, team2, winner, loser) {
  // Process home team (team1)
  if (team1 && teamStats[team1]) {
    teamStats[team1].gamesPlayed++;
    if (team1 === winner) teamStats[team1].wins++;
    if (team1 === loser) teamStats[team1].losses++;
    
    // Hitting stats
    for (var s = 0; s < 9; s++) {
      var val = gameData.homeTeamTotals[s];
      if (typeof val === 'number' && !isNaN(val)) {
        teamStats[team1].hitting[s] += val;
      }
    }
    
    // Pitching stats (indices 0-6)
    for (var s = 0; s < 7; s++) {
      var val = gameData.homeTeamPitchField[s];
      if (typeof val === 'number' && !isNaN(val)) {
        teamStats[team1].pitching[s] += val;
      }
    }
    
    // Fielding stats (indices 7-9)
    for (var s = 0; s < 3; s++) {
      var val = gameData.homeTeamPitchField[s + 7];
      if (typeof val === 'number' && !isNaN(val)) {
        teamStats[team1].fielding[s] += val;
      }
    }
  }
  
  // Process away team (team2)
  if (team2 && teamStats[team2]) {
    teamStats[team2].gamesPlayed++;
    if (team2 === winner) teamStats[team2].wins++;
    if (team2 === loser) teamStats[team2].losses++;
    
    // Hitting stats
    for (var s = 0; s < 9; s++) {
      var val = gameData.awayTeamTotals[s];
      if (typeof val === 'number' && !isNaN(val)) {
        teamStats[team2].hitting[s] += val;
      }
    }
    
    // Pitching stats (indices 0-6)
    for (var s = 0; s < 7; s++) {
      var val = gameData.awayTeamPitchField[s];
      if (typeof val === 'number' && !isNaN(val)) {
        teamStats[team2].pitching[s] += val;
      }
    }
    
    // Fielding stats (indices 7-9)
    for (var s = 0; s < 3; s++) {
      var val = gameData.awayTeamPitchField[s + 7];
      if (typeof val === 'number' && !isNaN(val)) {
        teamStats[team2].fielding[s] += val;
      }
    }
  }
}

function processTeamStatsWithH2HFromGame(teamStats, team1, team2, winner, loser, runs1, runs2) {
  if (team1 && teamStats[team1]) {
    teamStats[team1].gamesPlayed++;
    if (typeof runs1 === 'number') teamStats[team1].runsScored += runs1;
    if (typeof runs2 === 'number') teamStats[team1].runsAllowed += runs2;
    if (team1 === winner) {
      teamStats[team1].wins++;
      if (team2 && teamStats[team1].headToHead[team2]) {
        teamStats[team1].headToHead[team2].wins++;
      }
    } else if (team1 === loser) {
      teamStats[team1].losses++;
      if (team2 && teamStats[team1].headToHead[team2]) {
        teamStats[team1].headToHead[team2].losses++;
      }
    }
  }
  
  if (team2 && teamStats[team2]) {
    teamStats[team2].gamesPlayed++;
    if (typeof runs2 === 'number') teamStats[team2].runsScored += runs2;
    if (typeof runs1 === 'number') teamStats[team2].runsAllowed += runs1;
    if (team2 === winner) {
      teamStats[team2].wins++;
      if (team1 && teamStats[team2].headToHead[team1]) {
        teamStats[team2].headToHead[team1].wins++;
      }
    } else if (team2 === loser) {
      teamStats[team2].losses++;
      if (team1 && teamStats[team2].headToHead[team1]) {
        teamStats[team2].headToHead[team1].losses++;
      }
    }
  }
}

function updateScheduleDataFromGame(scheduleData, sheet, team1, team2, runs1, runs2, winner) {
  for (var s = 0; s < scheduleData.length; s++) {
    if (scheduleData[s].homeTeam === team1 && scheduleData[s].awayTeam === team2) {
      scheduleData[s].played = true;
      scheduleData[s].homeScore = runs1;
      scheduleData[s].awayScore = runs2;
      scheduleData[s].winner = winner;
      scheduleData[s].sheetId = sheet.getSheetId();
      break;
    }
  }
}
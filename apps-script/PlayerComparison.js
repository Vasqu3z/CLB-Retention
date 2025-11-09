// ===== PLAYER COMPARISON TOOL =====
// Purpose: Provides player comparison dialog with optimized data retrieval
// Dependencies: LeagueConfig.js, PlayerComparisonApp.html
// Entry Point(s): showPlayerComparison, getPlayerStats

/**
 * Display the player comparison modal dialog
 */
function showPlayerComparison() {
  var html = HtmlService.createHtmlOutputFromFile('PlayerComparisonApp')
    .setWidth(800)
    .setHeight(600)
    .setTitle('Player Comparison Tool');
  SpreadsheetApp.getUi().showModalDialog(html, 'Player Comparison');
}

/**
 * Web app entry point
 * @returns {HtmlOutput} The player comparison web app
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('PlayerComparisonApp')
    .setTitle('Player Comparison Tool')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Get list of all players sorted alphabetically
 * @returns {Array<object>} Array of player objects with name and team
 */
function getPlayerList() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var playerSheet = activeSpreadsheet.getSheetByName(CONFIG.PLAYER_STATS_SHEET);

  if (!playerSheet) return [];

  var lastRow = playerSheet.getLastRow();
  if (lastRow < 2) return [];

  var playerData = playerSheet.getRange(2, 1, lastRow - 1, 2).getValues();
  var players = [];

  for (var i = 0; i < playerData.length; i++) {
    var name = String(playerData[i][0]).trim();
    var team = String(playerData[i][1]).trim();
    if (name) {
      players.push({name: name, team: team});
    }
  }

  players.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  return players;
}

/**
 * Get player stats using Read-Once pattern
 * Reads each stat sheet once and builds an in-memory map
 * @param {Array<string>} playerNames - Array of player names to retrieve stats for
 * @returns {Array<object>} Array of player stat objects
 */
function getPlayerStats(playerNames) {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var hittingSheet = activeSpreadsheet.getSheetByName(CONFIG.HITTING_STATS_SHEET);
  var pitchingSheet = activeSpreadsheet.getSheetByName(CONFIG.PITCHING_STATS_SHEET);
  var fieldingSheet = activeSpreadsheet.getSheetByName(CONFIG.FIELDING_STATS_SHEET);

  var playerStatsMap = {};

  var hMap = CONFIG.SHEET_STRUCTURE.PLAYER_COMPARISON.HITTING_MAP;
  var pMap = CONFIG.SHEET_STRUCTURE.PLAYER_COMPARISON.PITCHING_MAP;
  var fMap = CONFIG.SHEET_STRUCTURE.PLAYER_COMPARISON.FIELDING_MAP;

  if (hittingSheet && hittingSheet.getLastRow() > 1) {
    var hittingLastRow = hittingSheet.getLastRow();
    var hittingData = hittingSheet.getRange(2, 1, hittingLastRow - 1, 16).getValues();

    for (var i = 0; i < hittingData.length; i++) {
      var playerName = String(hittingData[i][0]).trim();
      if (!playerName) continue;

      playerStatsMap[playerName] = {
        name: playerName,
        hitting: {
          team: String(hittingData[i][hMap.team]),
          gp: hittingData[i][hMap.gp],
          ab: hittingData[i][hMap.ab],
          h: hittingData[i][hMap.h],
          hr: hittingData[i][hMap.hr],
          rbi: hittingData[i][hMap.rbi],
          bb: hittingData[i][hMap.bb],
          k: hittingData[i][hMap.k],
          rob: hittingData[i][hMap.rob],
          dp: hittingData[i][hMap.dp],
          tb: hittingData[i][hMap.tb],
          avg: hittingData[i][hMap.avg],
          obp: hittingData[i][hMap.obp],
          slg: hittingData[i][hMap.slg],
          ops: hittingData[i][hMap.ops]
        },
        pitching: {},
        fielding: {}
      };
    }
  }

  if (pitchingSheet && pitchingSheet.getLastRow() > 1) {
    var pitchingLastRow = pitchingSheet.getLastRow();
    var pitchingData = pitchingSheet.getRange(2, 1, pitchingLastRow - 1, 16).getValues();

    for (var i = 0; i < pitchingData.length; i++) {
      var playerName = String(pitchingData[i][0]).trim();
      if (!playerName) continue;

      if (!playerStatsMap[playerName]) {
        playerStatsMap[playerName] = {
          name: playerName,
          hitting: {},
          pitching: {},
          fielding: {}
        };
      }

      playerStatsMap[playerName].pitching = {
        gp: pitchingData[i][pMap.gp],
        w: pitchingData[i][pMap.w],
        l: pitchingData[i][pMap.l],
        sv: pitchingData[i][pMap.sv],
        era: pitchingData[i][pMap.era],
        ip: pitchingData[i][pMap.ip],
        bf: pitchingData[i][pMap.bf],
        h: pitchingData[i][pMap.h],
        hr: pitchingData[i][pMap.hr],
        r: pitchingData[i][pMap.r],
        bb: pitchingData[i][pMap.bb],
        k: pitchingData[i][pMap.k],
        baa: pitchingData[i][pMap.baa],
        whip: pitchingData[i][pMap.whip]
      };
    }
  }

  if (fieldingSheet && fieldingSheet.getLastRow() > 1) {
    var fieldingLastRow = fieldingSheet.getLastRow();
    var fieldingData = fieldingSheet.getRange(2, 1, fieldingLastRow - 1, 6).getValues();

    for (var i = 0; i < fieldingData.length; i++) {
      var playerName = String(fieldingData[i][0]).trim();
      if (!playerName) continue;

      if (!playerStatsMap[playerName]) {
        playerStatsMap[playerName] = {
          name: playerName,
          hitting: {},
          pitching: {},
          fielding: {}
        };
      }

      playerStatsMap[playerName].fielding = {
        gp: fieldingData[i][fMap.gp],
        np: fieldingData[i][fMap.np],
        e: fieldingData[i][fMap.e],
        sb: fieldingData[i][fMap.sb]
      };
    }
  }

  var results = [];
  for (var playerIndex = 0; playerIndex < playerNames.length; playerIndex++) {
    var playerName = playerNames[playerIndex];
    if (playerStatsMap[playerName]) {
      results.push(playerStatsMap[playerName]);
    } else {
      results.push({
        name: playerName,
        hitting: {},
        pitching: {},
        fielding: {}
      });
    }
  }

  return results;
}

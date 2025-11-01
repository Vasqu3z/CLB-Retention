// ===== PLAYER COMPARISON TOOL =====
// Player comparison dialog and data retrieval

function doGet() {
  return HtmlService.createHtmlOutputFromFile('PlayerComparison')
    .setTitle('Player Comparison Tool')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function showPlayerComparison() {
  var html = HtmlService.createHtmlOutputFromFile('PlayerComparison')
    .setWidth(800)
    .setHeight(600)
    .setTitle('Player Comparison Tool');
  SpreadsheetApp.getUi().showModalDialog(html, 'Player Comparison');
}

function getPlayerList() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var playerSheet = ss.getSheetByName(CONFIG.PLAYER_STATS_SHEET);
  
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

function getPlayerStats(playerNames) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hittingSheet = ss.getSheetByName(CONFIG.HITTING_STATS_SHEET);
  var pitchingSheet = ss.getSheetByName(CONFIG.PITCHING_STATS_SHEET);
  var fieldingSheet = ss.getSheetByName(CONFIG.FIELDING_STATS_SHEET);
  
  var results = [];
  
  for (var p = 0; p < playerNames.length; p++) {
    var playerName = playerNames[p];
    var playerData = {
      name: playerName,
      hitting: {},
      pitching: {},
      fielding: {}
    };
    
    if (hittingSheet) {
      var hittingLastRow = hittingSheet.getLastRow();
      if (hittingLastRow > 1) {
        var hittingData = hittingSheet.getRange(2, 1, hittingLastRow - 1, 16).getValues();
        for (var i = 0; i < hittingData.length; i++) {
          if (String(hittingData[i][0]).trim() === playerName) {
            playerData.hitting = {
              team: String(hittingData[i][1]),
              gp: hittingData[i][2],
              ab: hittingData[i][3],
              h: hittingData[i][4],
              hr: hittingData[i][5],
              rbi: hittingData[i][6],
              bb: hittingData[i][7],
              k: hittingData[i][8],
              rob: hittingData[i][9],
              dp: hittingData[i][10],
              tb: hittingData[i][11],
              avg: hittingData[i][12],
              obp: hittingData[i][13],
              slg: hittingData[i][14],
              ops: hittingData[i][15]
            };
            break;
          }
        }
      }
    }
    
    if (pitchingSheet) {
      var pitchingLastRow = pitchingSheet.getLastRow();
      if (pitchingLastRow > 1) {
        var pitchingData = pitchingSheet.getRange(2, 1, pitchingLastRow - 1, 16).getValues();
        for (var i = 0; i < pitchingData.length; i++) {
          if (String(pitchingData[i][0]).trim() === playerName) {
            playerData.pitching = {
              gp: pitchingData[i][2],
              w: pitchingData[i][3],
              l: pitchingData[i][4],
              sv: pitchingData[i][5],
              era: pitchingData[i][6],
              ip: pitchingData[i][7],
              bf: pitchingData[i][8],
              h: pitchingData[i][9],
              hr: pitchingData[i][10],
              r: pitchingData[i][11],
              bb: pitchingData[i][12],
              k: pitchingData[i][13],
              baa: pitchingData[i][14],
              whip: pitchingData[i][15]
            };
            break;
          }
        }
      }
    }
    
    if (fieldingSheet) {
      var fieldingLastRow = fieldingSheet.getLastRow();
      if (fieldingLastRow > 1) {
        var fieldingData = fieldingSheet.getRange(2, 1, fieldingLastRow - 1, 6).getValues();
        for (var i = 0; i < fieldingData.length; i++) {
          if (String(fieldingData[i][0]).trim() === playerName) {
            playerData.fielding = {
              gp: fieldingData[i][2],
              np: fieldingData[i][3],
              e: fieldingData[i][4],
              sb: fieldingData[i][5]
            };
            break;
          }
        }
      }
    }
    
    results.push(playerData);
  }
  
  return results;
}
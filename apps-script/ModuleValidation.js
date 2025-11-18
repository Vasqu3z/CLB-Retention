// ===== CROSS-MODULE VALIDATION =====
// Purpose: Validates players and teams across database, box scores, and league hub
// Dependencies: getSharedConfig() from SharedConfig.js
// Entry Point(s): validateGamePlayers(), validateRosterIntegrity(), getPlayerRegistry()

/**
 * Gets the Player Registry as a lookup object for fast validation.
 * Uses caching to avoid repeated reads.
 *
 * @returns {object} Player registry data {players: Array, playerMap: Object, teamMap: Object}
 */
function getPlayerRegistry() {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'player_registry';
  var cacheDuration = 300; // 5 minutes

  // ===== P3: Check cache first =====
  var cached = cache.get(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      Logger.log('WARNING: Failed to parse cached registry');
    }
  }

  // ===== P1: Read registry ONCE =====
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var registrySheet = ss.getSheetByName('📋 Player Registry');

  if (!registrySheet) {
    throw new Error('📋 Player Registry sheet not found');
  }

  var lastRow = registrySheet.getLastRow();
  if (lastRow < 2) {
    return { players: [], playerMap: {}, teamMap: {} };
  }

  // ===== P2: 0-based column indices =====
  var COLS = {
    PLAYER_NAME: 0,    // Column A
    TEAM: 1,           // Column B
    STATUS: 2,         // Column C
    DATABASE_ID: 3,    // Column D
    IMAGE_URL: 4,      // Column E
    HAS_ATTRIBUTES: 5  // Column F
  };

  var data = registrySheet.getRange(2, 1, lastRow - 1, 6).getValues();

  // ===== P3: Build lookup structures in memory =====
  var players = [];
  var playerMap = {};
  var teamMap = {};

  for (var i = 0; i < data.length; i++) {
    var playerName = String(data[i][COLS.PLAYER_NAME]).trim();
    var team = String(data[i][COLS.TEAM]).trim();
    var status = String(data[i][COLS.STATUS]).trim();
    var databaseId = String(data[i][COLS.DATABASE_ID]).trim();
    var imageUrl = String(data[i][COLS.IMAGE_URL]).trim();

    if (!playerName) continue;

    var playerObj = {
      name: playerName,
      team: team,
      status: status,
      databaseId: databaseId,
      imageUrl: imageUrl
    };

    players.push(playerName);
    playerMap[playerName] = playerObj;

    // Build team roster map
    if (!teamMap[team]) {
      teamMap[team] = [];
    }
    if (status === 'Active') {
      teamMap[team].push(playerName);
    }
  }

  var result = {
    players: players,
    playerMap: playerMap,
    teamMap: teamMap
  };

  // Cache the result
  try {
    cache.put(cacheKey, JSON.stringify(result), cacheDuration);
  } catch (e) {
    Logger.log('WARNING: Failed to cache player registry: ' + e.toString());
  }

  return result;
}

/**
 * Validates players in a game sheet against the Player Registry.
 * Call this from LeagueGames.js during game processing.
 *
 * @param {object} gameData - Game data object with hittingData and pitchFieldData
 * @param {string} gameSheetName - Name of the game sheet being validated
 * @returns {object} Validation result {valid: boolean, invalidPlayers: Array, warnings: Array}
 */
function validateGamePlayers(gameData, gameSheetName) {
  var registry = getPlayerRegistry();
  var validPlayers = registry.players;

  var invalidPlayers = [];
  var warnings = [];

  // ===== P2: 0-based column index =====
  var NAME_COL = 0; // Column A in hitting/pitching data

  // Check hitting data
  if (gameData.hittingData) {
    for (var h = 0; h < gameData.hittingData.length; h++) {
      var playerName = String(gameData.hittingData[h][NAME_COL]).trim();

      if (playerName && validPlayers.indexOf(playerName) === -1) {
        invalidPlayers.push({
          player: playerName,
          type: 'hitting',
          sheet: gameSheetName
        });
      }
    }
  }

  // Check pitching/fielding data
  if (gameData.pitchFieldData) {
    for (var p = 0; p < gameData.pitchFieldData.length; p++) {
      var playerName = String(gameData.pitchFieldData[p][NAME_COL]).trim();

      if (playerName && validPlayers.indexOf(playerName) === -1) {
        // Avoid duplicates (player may appear in both hitting and pitching)
        var alreadyLogged = false;
        for (var i = 0; i < invalidPlayers.length; i++) {
          if (invalidPlayers[i].player === playerName && invalidPlayers[i].sheet === gameSheetName) {
            alreadyLogged = true;
            break;
          }
        }

        if (!alreadyLogged) {
          invalidPlayers.push({
            player: playerName,
            type: 'pitching',
            sheet: gameSheetName
          });
        }
      }
    }
  }

  // Log warnings if invalid players found
  if (invalidPlayers.length > 0) {
    var playerNames = invalidPlayers.map(function(p) { return p.player; }).join(', ');
    warnings.push(gameSheetName + ': ' + invalidPlayers.length + ' unknown player(s) - ' + playerNames);

    // Log to Error Log sheet
    logValidationWarning(gameSheetName, invalidPlayers);
  }

  return {
    valid: invalidPlayers.length === 0,
    invalidPlayers: invalidPlayers,
    warnings: warnings
  };
}

/**
 * Validates team rosters to ensure all active players belong to a team.
 * Call this from a menu or scheduled trigger.
 *
 * @returns {object} Validation report
 */
function validateRosterIntegrity() {
  var registry = getPlayerRegistry();
  var teamRegistry = getTeamRegistry();

  var report = {
    totalPlayers: registry.players.length,
    activeTeams: Object.keys(teamRegistry.teamMap).length,
    issues: []
  };

  // Check for players with inactive/nonexistent teams
  for (var playerName in registry.playerMap) {
    if (!registry.playerMap.hasOwnProperty(playerName)) continue;

    var player = registry.playerMap[playerName];
    var team = player.team;

    if (player.status === 'Active' && team !== 'Free Agent') {
      // Check if team exists in Team Registry
      if (!teamRegistry.teamMap.hasOwnProperty(team)) {
        report.issues.push({
          type: 'INVALID_TEAM',
          player: playerName,
          team: team,
          message: 'Player assigned to nonexistent team'
        });
      }
      // Check if team is active
      else if (teamRegistry.teamMap[team].status !== 'Active') {
        report.issues.push({
          type: 'INACTIVE_TEAM',
          player: playerName,
          team: team,
          message: 'Player assigned to inactive team'
        });
      }
    }
  }

  // Log report
  Logger.log('=== ROSTER INTEGRITY VALIDATION ===');
  Logger.log('Total Players: ' + report.totalPlayers);
  Logger.log('Active Teams: ' + report.activeTeams);
  Logger.log('Issues Found: ' + report.issues.length);

  if (report.issues.length > 0) {
    for (var i = 0; i < report.issues.length; i++) {
      Logger.log('[' + report.issues[i].type + '] ' + report.issues[i].message + ': ' + report.issues[i].player);
    }
  }

  return report;
}

/**
 * Gets the Team Registry as a lookup object.
 *
 * @returns {object} Team registry data {teams: Array, teamMap: Object}
 */
function getTeamRegistry() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var registrySheet = ss.getSheetByName('📋 Team Registry');

  if (!registrySheet) {
    throw new Error('📋 Team Registry sheet not found');
  }

  var lastRow = registrySheet.getLastRow();
  if (lastRow < 2) {
    return { teams: [], teamMap: {} };
  }

  // ===== P2: 0-based column indices =====
  var COLS = {
    TEAM_NAME: 0,      // Column A
    ABBR: 1,           // Column B
    CAPTAIN: 2,        // Column C
    STATUS: 3,         // Column D
    COLOR: 4,          // Column E
    LOGO_URL: 5,       // Column F
    EMBLEM_URL: 6,     // Column G
    DISCORD_ROLE_ID: 7 // Column H
  };

  var data = registrySheet.getRange(2, 1, lastRow - 1, 8).getValues();

  var teams = [];
  var teamMap = {};

  for (var i = 0; i < data.length; i++) {
    var teamName = String(data[i][COLS.TEAM_NAME]).trim();

    if (!teamName) continue;

    var teamObj = {
      name: teamName,
      abbr: String(data[i][COLS.ABBR]).trim(),
      captain: String(data[i][COLS.CAPTAIN]).trim(),
      status: String(data[i][COLS.STATUS]).trim(),
      color: String(data[i][COLS.COLOR]).trim(),
      logoUrl: String(data[i][COLS.LOGO_URL]).trim(),
      emblemUrl: String(data[i][COLS.EMBLEM_URL]).trim(),
      discordRoleId: String(data[i][COLS.DISCORD_ROLE_ID]).trim()
    };

    teams.push(teamName);
    teamMap[teamName] = teamObj;
  }

  return {
    teams: teams,
    teamMap: teamMap
  };
}

/**
 * Logs validation warnings to the Error Log sheet.
 * @param {string} gameSheetName - Name of game sheet
 * @param {Array} invalidPlayers - Array of invalid player objects
 */
function logValidationWarning(gameSheetName, invalidPlayers) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var errorLog = ss.getSheetByName('Error Log');

    if (!errorLog) return; // No error log sheet, skip logging

    var timestamp = new Date();
    var playerNames = invalidPlayers.map(function(p) { return p.player; }).join(', ');
    var message = invalidPlayers.length + ' unknown player(s) found in ' + gameSheetName;

    var newRow = [timestamp, 'VALIDATION WARNING', gameSheetName, message, playerNames];

    errorLog.appendRow(newRow);
  } catch (e) {
    Logger.log('Failed to log validation warning: ' + e.toString());
  }
}

/**
 * Clears the player registry cache.
 * Call this after updating the Player Registry sheet.
 */
function refreshPlayerRegistryCache() {
  CacheService.getScriptCache().remove('player_registry');
  Logger.log('Player Registry cache cleared');
}

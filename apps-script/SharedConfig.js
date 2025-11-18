// ===== SHARED CONFIGURATION HELPER =====
// Purpose: Provides centralized config reading with caching for all modules
// Dependencies: None (reads from ⚙️ Config sheet)
// Entry Point(s): getSharedConfig(), refreshConfigCache(), getConfigValue(key)

/**
 * Retrieves the shared configuration from the ⚙️ Config sheet with 1-hour caching.
 * Use this function in all modules instead of hardcoding spreadsheet IDs or values.
 *
 * @returns {object} Configuration object with all key-value pairs
 */
function getSharedConfig() {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'shared_config';
  var cacheDuration = 3600; // 1 hour in seconds

  // ===== P3: Check cache first =====
  var cached = cache.get(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      Logger.log('WARNING: Failed to parse cached config, reading from sheet');
    }
  }

  // ===== P1: Read config sheet ONCE =====
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('⚙️ Config');

  if (!configSheet) {
    throw new Error('⚙️ Config sheet not found. Please create it first.');
  }

  var lastRow = configSheet.getLastRow();
  if (lastRow < 2) {
    throw new Error('⚙️ Config sheet is empty. Please add configuration data.');
  }

  // Read all config data (columns: Key | Value)
  var data = configSheet.getRange(2, 1, lastRow - 1, 2).getValues();

  // ===== P3: Build config object in memory =====
  var config = {};

  for (var i = 0; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var value = String(data[i][1]).trim();

    if (!key) continue;

    // Convert boolean strings to actual booleans
    if (value.toLowerCase() === 'true') {
      value = true;
    } else if (value.toLowerCase() === 'false') {
      value = false;
    }
    // Convert numeric strings to numbers
    else if (!isNaN(value) && value !== '') {
      value = Number(value);
    }

    config[key] = value;
  }

  // ===== Cache the result =====
  try {
    cache.put(cacheKey, JSON.stringify(config), cacheDuration);
  } catch (e) {
    Logger.log('WARNING: Failed to cache config: ' + e.toString());
  }

  return config;
}

/**
 * Gets a single config value by key.
 * Convenience wrapper around getSharedConfig().
 *
 * @param {string} key - The config key to retrieve
 * @param {*} defaultValue - Optional default value if key not found
 * @returns {*} The config value, or defaultValue if not found
 */
function getConfigValue(key, defaultValue) {
  var config = getSharedConfig();
  return config.hasOwnProperty(key) ? config[key] : defaultValue;
}

/**
 * Manually refreshes the config cache.
 * Call this after updating the Config sheet.
 */
function refreshConfigCache() {
  var cache = CacheService.getScriptCache();
  cache.remove('shared_config');

  // Immediately rebuild cache
  var config = getSharedConfig();

  Logger.log('Config cache refreshed. Keys loaded: ' + Object.keys(config).length);

  return config;
}

/**
 * Displays all current config values in a dialog (for debugging).
 * Accessible via menu: Tools → Show Config
 */
function showConfigValues() {
  var config = getSharedConfig();
  var keys = Object.keys(config).sort();

  var message = '=== CURRENT CONFIGURATION ===\n\n';

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = config[key];
    message += key + ': ' + value + '\n';
  }

  message += '\n(' + keys.length + ' config keys loaded)';

  SpreadsheetApp.getUi().alert('Shared Configuration', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ===== EXAMPLE USAGE IN OTHER MODULES =====

/*
// In LeagueGames.js:

function processAllGameSheetsOnce() {
  var config = getSharedConfig();
  var boxScoreSS = SpreadsheetApp.openById(config.BOX_SCORE_SPREADSHEET_ID);
  var gameSheetPrefix = config.GAME_SHEET_PREFIX || '#W';

  // ... rest of function
}

// In DatabaseAttributes.js (after merge):

function getPlayerAttributes(playerNames) {
  var config = getSharedConfig();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var attributeSheet = ss.getSheetByName('🎮 Player Attributes'); // After merge, use direct name

  // ... rest of function
}

// In Box Scores module:

function validateRosterOnGameStart(awayTeam, homeTeam) {
  var config = getSharedConfig();
  var leagueHubSS = SpreadsheetApp.openById(config.SEASON_6_LEAGUE_HUB_ID);
  var registry = leagueHubSS.getSheetByName('📋 Player Registry');

  // ... validation logic
}
*/

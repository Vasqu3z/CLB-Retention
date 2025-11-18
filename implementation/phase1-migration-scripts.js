// ===== MIGRATION SCRIPTS =====
// Purpose: One-time scripts to populate Player Registry and Team Registry from existing data
// Dependencies: None (reads from existing sheets)
// Entry Point(s): migrateToPlayerRegistry(), populateTeamRegistry()

/**
 * Migrates data from Image URLs, Character Name Mapping, and Rosters sheets
 * to create the unified Player Registry sheet.
 *
 * This is a ONE-TIME migration script. Run it once, then delete or archive.
 *
 * @returns {object} Migration summary with counts
 */
function migrateToPlayerRegistry() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var registrySheet = ss.getSheetByName('📋 Player Registry');

  if (!registrySheet) {
    throw new Error('Player Registry sheet not found. Please create it first.');
  }

  // ===== P1: Read all source data ONCE =====

  // Source 1: Image URLs sheet (Player Name | Image URL)
  var imageSheet = ss.getSheetByName('Image URLs');
  if (!imageSheet) {
    throw new Error('Image URLs sheet not found');
  }
  var imageData = imageSheet.getRange(2, 1, imageSheet.getLastRow() - 1, 2).getValues();

  // Source 2: Rosters sheet (to get team assignments)
  var rosterSheet = ss.getSheetByName('Rosters');
  if (!rosterSheet) {
    throw new Error('Rosters sheet not found');
  }
  var rosterData = rosterSheet.getRange(2, 1, rosterSheet.getLastRow() - 1, 2).getValues();

  // Source 3: Database spreadsheet - Character Name Mapping (if available)
  var databaseId = getConfigValue('DATABASE_SPREADSHEET_ID');
  var nameMapping = {};

  if (databaseId) {
    try {
      var databaseSS = SpreadsheetApp.openById(databaseId);
      var mappingSheet = databaseSS.getSheetByName('Character Name Mapping');

      if (mappingSheet) {
        var mappingData = mappingSheet.getRange(2, 1, mappingSheet.getLastRow() - 1, 2).getValues();

        // Build mapping object: Custom Name → Python Name
        for (var i = 0; i < mappingData.length; i++) {
          var pythonName = String(mappingData[i][0]).trim();
          var customName = String(mappingData[i][1]).trim();
          if (pythonName && customName) {
            nameMapping[customName] = pythonName;
          }
        }
      }
    } catch (e) {
      Logger.log('Could not read Database spreadsheet: ' + e.toString());
    }
  }

  // ===== P3: Build player-to-team mapping in memory =====

  var playerTeamMap = {};
  for (var r = 0; r < rosterData.length; r++) {
    var teamName = String(rosterData[r][0]).trim();
    var playerName = String(rosterData[r][1]).trim();

    if (teamName && playerName) {
      playerTeamMap[playerName] = teamName;
    }
  }

  // ===== P3: Build registry data in memory =====

  var registry = [];
  var playersSeen = {};

  for (var i = 0; i < imageData.length; i++) {
    var playerName = String(imageData[i][0]).trim();
    var imageUrl = String(imageData[i][1]).trim();

    if (!playerName || playersSeen[playerName]) {
      continue;
    }

    playersSeen[playerName] = true;

    var team = playerTeamMap[playerName] || 'Free Agent';
    var status = team === 'Free Agent' ? 'Free Agent' : 'Active';
    var databaseId = nameMapping[playerName] || playerName; // Default to same name if no mapping

    registry.push([
      databaseId,  // Column A: Database ID
      playerName,  // Column B: Player Name
      team,        // Column C: Team
      status,      // Column D: Status
      imageUrl,    // Column E: Image URL
      ''           // Column F: Has Attributes (formula will populate)
    ]);
  }

  // Sort alphabetically by player name (now in column B, index 1)
  registry.sort(function(a, b) {
    return a[1].localeCompare(b[1]);
  });

  // ===== P1: Write all data ONCE =====

  if (registry.length > 0) {
    var targetRange = registrySheet.getRange(2, 1, registry.length, 6);
    targetRange.setValues(registry);

    Logger.log('SUCCESS: Migrated ' + registry.length + ' players to Player Registry');
  } else {
    Logger.log('WARNING: No players found to migrate');
  }

  // Return summary
  return {
    playersAdded: registry.length,
    teamsFound: Object.keys(playerTeamMap).length,
    mappingsFound: Object.keys(nameMapping).length
  };
}

/**
 * Helper function to get a config value from the Config sheet
 * @param {string} key - The config key to retrieve
 * @returns {string} The config value, or empty string if not found
 */
function getConfigValue(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('⚙️ Config');

  if (!configSheet) {
    return '';
  }

  var data = configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 2).getValues();

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      return String(data[i][1]).trim();
    }
  }

  return '';
}

/**
 * Populates the Team Registry with example data
 * Modify the teamData array below with your actual team information
 *
 * @returns {number} Number of teams added
 */
function populateTeamRegistry() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var registrySheet = ss.getSheetByName('📋 Team Registry');

  if (!registrySheet) {
    throw new Error('Team Registry sheet not found. Please create it first.');
  }

  // ===== MODIFY THIS DATA FOR YOUR LEAGUE =====

  var teamData = [
    // Team Name | Captain | Abbr | Status | Color | Logo URL | Emblem URL | Discord Role ID
    ['Fire Flowers', 'Mario', 'FF', 'Active', '#FF0000', '', '', ''],
    ['Banana Bunch', 'Donkey Kong', 'BB', 'Active', '#FFFF00', '', '', ''],
    ['Shell Shockers', 'Bowser', 'SS', 'Active', '#00FF00', '', '', ''],
    ['Star Squad', 'Peach', 'STR', 'Active', '#FFC0CB', '', '', ''],
    ['Koopa Troop', 'Bowser Jr.', 'KT', 'Active', '#FF8C00', '', '', ''],
    ['Yoshi Island', 'Green Yoshi', 'YI', 'Active', '#90EE90', '', '', ''],
    ['Wario Warriors', 'Wario', 'WW', 'Active', '#800080', '', '', ''],
    ['Luigi Legends', 'Luigi', 'LL', 'Active', '#00FF00', '', '', '']
  ];

  // ===== P1: Write all data ONCE =====

  if (teamData.length > 0) {
    var targetRange = registrySheet.getRange(2, 1, teamData.length, 8);
    targetRange.setValues(teamData);

    Logger.log('SUCCESS: Added ' + teamData.length + ' teams to Team Registry');
  }

  return teamData.length;
}

/**
 * Verifies that Player Registry is properly populated and formulas work
 * Run this after migration to check for issues
 *
 * @returns {object} Verification report
 */
function verifyPlayerRegistry() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var registrySheet = ss.getSheetByName('📋 Player Registry');

  if (!registrySheet) {
    return { error: 'Player Registry sheet not found' };
  }

  var data = registrySheet.getRange(2, 1, registrySheet.getLastRow() - 1, 6).getValues();

  var report = {
    totalPlayers: 0,
    playersWithAttributes: 0,
    playersWithoutAttributes: 0,
    freeAgents: 0,
    activePlayers: 0,
    inactivePlayers: 0,
    missingImageUrls: 0,
    duplicateNames: []
  };

  var namesSeen = {};

  for (var i = 0; i < data.length; i++) {
    var playerName = String(data[i][0]).trim();
    var team = String(data[i][1]).trim();
    var status = String(data[i][2]).trim();
    var imageUrl = String(data[i][4]).trim();
    var hasAttributes = String(data[i][5]).trim();

    if (!playerName) continue;

    report.totalPlayers++;

    // Check for duplicates
    if (namesSeen[playerName]) {
      report.duplicateNames.push(playerName);
    }
    namesSeen[playerName] = true;

    // Count statuses
    if (status === 'Active') report.activePlayers++;
    if (status === 'Inactive') report.inactivePlayers++;
    if (team === 'Free Agent') report.freeAgents++;

    // Count attributes
    if (hasAttributes.includes('✅')) {
      report.playersWithAttributes++;
    } else if (hasAttributes.includes('❌')) {
      report.playersWithoutAttributes++;
    }

    // Count missing image URLs
    if (!imageUrl) {
      report.missingImageUrls++;
    }
  }

  Logger.log('=== PLAYER REGISTRY VERIFICATION ===');
  Logger.log('Total Players: ' + report.totalPlayers);
  Logger.log('Active: ' + report.activePlayers);
  Logger.log('Inactive: ' + report.inactivePlayers);
  Logger.log('Free Agents: ' + report.freeAgents);
  Logger.log('With Attributes: ' + report.playersWithAttributes);
  Logger.log('Without Attributes: ' + report.playersWithoutAttributes);
  Logger.log('Missing Image URLs: ' + report.missingImageUrls);

  if (report.duplicateNames.length > 0) {
    Logger.log('DUPLICATES FOUND: ' + report.duplicateNames.join(', '));
  }

  return report;
}

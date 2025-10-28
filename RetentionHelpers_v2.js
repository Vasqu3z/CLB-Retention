// ===== RETENTION GRADES V2 - HELPER FUNCTIONS & UTILITIES =====
// Utility functions, help dialogs, and debug tools
//
// Dependencies: RetentionConfig_v2.js
//
// V2 CHANGES:
// - Updated help dialogs for v2 features
// - Added help for Draft Value and Team Direction
// - Removed Star Points references

// ===== UTILITY FUNCTIONS =====

/**
 * Calculate percentile rank for a value in a sorted array
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

  if (RETENTION_CONFIG.DEBUG.LOG_PERCENTILE_DETAILS) {
    Logger.log("Percentile calc: value=" + value + ", below=" + countBelow +
               ", equal=" + countEqual + ", n=" + n + ", result=" + percentile.toFixed(1));
  }

  return percentile;
}

/**
 * Find player index in array by name and team
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
 * Find postseason section in sheet
 */
function findPostseasonSection(sheet) {
  try {
    var lastRow = sheet.getLastRow();
    var searchRange = sheet.getRange(1, 1, lastRow, 1).getValues();

    for (var i = 0; i < searchRange.length; i++) {
      var cellValue = String(searchRange[i][0]);
      if (cellValue.indexOf(RETENTION_CONFIG.POSTSEASON_SEARCH_TEXT) >= 0) {
        return i + 1;
      }
    }
  } catch (e) {
    Logger.log("Error finding postseason section: " + e.toString());
  }

  return -1;
}

// ===== HELP DIALOGS =====

/**
 * Show help dialog for Draft/Trade Value
 */
function showDraftValueHelp() {
  var ui = SpreadsheetApp.getUi();

  var helpText = 'DRAFT/TRADE VALUE (Column C)\n\n' +
    'Purpose:\n' +
    'Track the acquisition cost of each player to identify value mismatches and retention risk.\n\n' +
    'How to Use:\n' +
    '• Enter the draft round (1-8) where the player was drafted\n' +
    '• For traded players, enter equivalent value:\n' +
    '  - High-value trade = 1-3\n' +
    '  - Medium-value trade = 4-6\n' +
    '  - Low-value trade = 7-8\n' +
    '• Leave blank if unknown\n\n' +
    'Future Integration:\n' +
    'Draft Expectations will auto-penalize underperforming high picks:\n' +
    '• Rounds 1-3: Expected 75th percentile, -2.5 pts if below\n' +
    '• Rounds 4-8: Expected 45th percentile, -4.5 pts if below\n\n' +
    'Note: Draft Expectations feature is disabled in current build but configuration is ready for Season 2.';

  ui.alert('Draft/Trade Value Help', helpText, ui.ButtonSet.OK);
}

/**
 * Show help dialog for Team Direction
 */
function showTeamDirectionHelp() {
  var ui = SpreadsheetApp.getUi();

  var helpText = 'TEAM DIRECTION (Column O)\n\n' +
    'Purpose:\n' +
    'Evaluate each team\'s competitive outlook and future trajectory. ' +
    'All players on the same team inherit the same direction score.\n\n' +
    'How It Works:\n' +
    '• Edit the Team Direction table at the bottom of the sheet\n' +
    '• Enter one direction score (0-20) per team\n' +
    '• Column O auto-fills via VLOOKUP from the table\n' +
    '• Do NOT edit Column O directly - edit the table instead\n\n' +
    'Scoring Guidelines (0-20):\n' +
    '• 15-20: Strong upward trajectory, building dynasty\n' +
    '• 10-14: Stable, competitive outlook\n' +
    '• 5-9: Uncertain, rebuilding phase\n' +
    '• 0-4: Downward spiral, fire sale expected\n\n' +
    'Weight: 21% (second-highest factor)\n\n' +
    'Consider:\n' +
    '• Recent trades and roster moves\n' +
    '• Captain engagement and activity\n' +
    '• Young talent vs aging core\n' +
    '• Playoff trajectory (improving vs declining)';

  ui.alert('Team Direction Help', helpText, ui.ButtonSet.OK);
}

/**
 * Show help dialog for Auto-Flagging
 */
function showAutoFlaggingHelp() {
  var ui = SpreadsheetApp.getUi();

  var helpText = 'AUTO-FLAGGING SYSTEM\n\n' +
    'Purpose:\n' +
    'Automatically detect flight risk for elite players on struggling teams.\n\n' +
    'How It Works:\n' +
    'System applies automatic performance penalties based on team standing:\n\n' +
    'Tier 1 (High Risk):\n' +
    '• Top 25% players (75th percentile+)\n' +
    '• On 7th or 8th place teams\n' +
    '• Penalty: -4 performance points\n\n' +
    'Tier 2 (Moderate Risk):\n' +
    '• Top 40% players (60th percentile+)\n' +
    '• On 5th through 8th place teams\n' +
    '• Penalty: -2 performance points\n\n' +
    'Philosophy:\n' +
    'Stars want to win. Elite players on last-place teams are more likely to leave, ' +
    'even if they personally performed well. The penalty reflects increased retention risk.\n\n' +
    'Viewing Flags:\n' +
    'Check the Details column (R) for "Auto-flag: -X pts (flight risk)" messages.\n\n' +
    'Configuration:\n' +
    'Thresholds can be adjusted in RetentionConfig_v2.js AUTO_FLAGGING section.';

  ui.alert('Auto-Flagging Help', helpText, ui.ButtonSet.OK);
}

/**
 * Show help dialog for Weighted Grading
 */
function showWeightedGradingHelp() {
  var ui = SpreadsheetApp.getUi();

  var helpText = 'WEIGHTED GRADING SYSTEM V2\n\n' +
    'Overview:\n' +
    'V2 replaces the additive system (sum of 5 factors) with a weighted system ' +
    'where each factor contributes differently to the final grade.\n\n' +
    'Factor Weights:\n' +
    '• Team Success: 18%\n' +
    '• Play Time: 32% (highest weight)\n' +
    '• Performance: 17%\n' +
    '• Chemistry: 12%\n' +
    '• Direction: 21% (second-highest)\n\n' +
    'Formula:\n' +
    'Auto factors: (TS Total × 0.18 + PT Total × 0.32 + Perf Total × 0.17) × 5\n' +
    'Manual factors: (Chemistry × 0.12 + Direction × 0.21) × 5\n' +
    'Final Grade: Auto + Manual (0-100 scale for d100 rolls)\n\n' +
    'Key Changes from V1:\n' +
    '• Play Time is now most important (32% vs 20% in v1)\n' +
    '• Direction increased to 21% (vs 20% in v1)\n' +
    '• Star Points removed entirely\n' +
    '• Team Success split rebalanced to 10/10 (was 8/12)\n\n' +
    'Philosophy:\n' +
    'Playing time and team trajectory are better predictors of retention than ' +
    'single-season performance or team success.';

  ui.alert('Weighted Grading System', helpText, ui.ButtonSet.OK);
}

/**
 * Show help dialog for Modifiers
 */
function showModifiersHelp() {
  var ui = SpreadsheetApp.getUi();

  var helpText = 'MODIFIER COLUMNS V2 (Cols E, H, K)\n\n' +
    'Purpose:\n' +
    'Adjust auto-calculated scores based on context not captured by stats.\n\n' +
    'V2 Changes:\n' +
    '• No data validation - enter any value\n' +
    '• Still recommended to stay within -5 to +5 range\n' +
    '• Each category still capped at 0-20 after modification\n\n' +
    'Team Success Modifier (Col E):\n' +
    '• Adjust for injuries, strength of schedule, bad luck\n' +
    '• Example: +2 for team that narrowly missed playoffs\n\n' +
    'Play Time Modifier (Col H):\n' +
    '• Adjust for mid-season trades, role changes\n' +
    '• Example: +3 for player acquired late who will start next season\n\n' +
    'Performance Modifier (Col K):\n' +
    '• Adjust for stat inflation/deflation, small sample sizes\n' +
    '• Example: -2 for player whose stats were inflated by weak competition\n\n' +
    'Best Practices:\n' +
    '• Use sparingly - let the data speak first\n' +
    '• Document reasoning in a separate notes sheet\n' +
    '• Review modifiers across all players for consistency';

  ui.alert('Modifiers Help', helpText, ui.ButtonSet.OK);
}

/**
 * Show main help dialog
 */
function showMainHelp() {
  var ui = SpreadsheetApp.getUi();

  var helpText = 'CLB RETENTION GRADE CALCULATOR V2.0\n\n' +
    'Overview:\n' +
    'Calculates retention probability for CLB players on 0-100 d100 scale.\n\n' +
    'Workflow:\n' +
    '1. Run "Calculate Retention Grades v2" from menu\n' +
    '2. Edit Team Direction table at bottom (one score per team)\n' +
    '3. Edit Postseason Results table at bottom\n' +
    '4. Edit manual input columns:\n' +
    '   • Draft Value (Col C)\n' +
    '   • Modifiers (Cols E, H, K)\n' +
    '   • Chemistry (Col N)\n' +
    '5. Direction (Col O) auto-fills via VLOOKUP\n' +
    '6. Final Grade (Col Q) auto-calculates\n\n' +
    'V2 Major Changes:\n' +
    '• Weighted grading system (not additive)\n' +
    '• Auto-flagging for elite players on bad teams\n' +
    '• Team Direction table (replaces per-player input)\n' +
    '• Draft/Trade Value tracking\n' +
    '• Removed Star Points entirely\n' +
    '• Team Success 10/10 split (was 8/12)\n\n' +
    'Smart Update:\n' +
    'System preserves manual inputs and formatting on re-runs.\n\n' +
    'More Help:\n' +
    'Use menu items for specific help topics:\n' +
    '• Draft Value Help\n' +
    '• Team Direction Help\n' +
    '• Auto-Flagging Help\n' +
    '• Weighted Grading Help\n' +
    '• Modifiers Help';

  ui.alert('Retention Calculator v2 Help', helpText, ui.ButtonSet.OK);
}

// ===== DEBUG FUNCTIONS =====

/**
 * Show config validation status
 */
function validateConfig() {
  try {
    RETENTION_CONFIG.validate();
    SpreadsheetApp.getUi().alert(
      'Config Validation',
      'Configuration is valid!\n\n' +
      'Version: ' + RETENTION_CONFIG.VERSION + '\n' +
      'Date: ' + RETENTION_CONFIG.VERSION_DATE + '\n\n' +
      'Factor Weights:\n' +
      '• Team Success: ' + (RETENTION_CONFIG.FACTOR_WEIGHTS.TEAM_SUCCESS * 100) + '%\n' +
      '• Play Time: ' + (RETENTION_CONFIG.FACTOR_WEIGHTS.PLAY_TIME * 100) + '%\n' +
      '• Performance: ' + (RETENTION_CONFIG.FACTOR_WEIGHTS.PERFORMANCE * 100) + '%\n' +
      '• Chemistry: ' + (RETENTION_CONFIG.FACTOR_WEIGHTS.CHEMISTRY * 100) + '%\n' +
      '• Direction: ' + (RETENTION_CONFIG.FACTOR_WEIGHTS.DIRECTION * 100) + '%\n' +
      'Total: ' + ((RETENTION_CONFIG.FACTOR_WEIGHTS.TEAM_SUCCESS +
                    RETENTION_CONFIG.FACTOR_WEIGHTS.PLAY_TIME +
                    RETENTION_CONFIG.FACTOR_WEIGHTS.PERFORMANCE +
                    RETENTION_CONFIG.FACTOR_WEIGHTS.CHEMISTRY +
                    RETENTION_CONFIG.FACTOR_WEIGHTS.DIRECTION) * 100) + '%',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      'Config Validation Failed',
      'Configuration errors:\n\n' + e.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Test weighted grade calculation
 */
function testWeightedGradeCalculation() {
  var ui = SpreadsheetApp.getUi();

  // Test case: All factors at max
  var tsTotal = 20;
  var ptTotal = 20;
  var perfTotal = 20;
  var chemScore = 20;
  var dirScore = 20;

  var finalGrade = RETENTION_CONFIG.calculateWeightedGrade(tsTotal, ptTotal, perfTotal, chemScore, dirScore);

  var testResults = 'WEIGHTED GRADE CALCULATION TEST\n\n' +
    'Test Case: All factors at maximum (20 points each)\n\n' +
    'Inputs:\n' +
    '• Team Success: ' + tsTotal + '\n' +
    '• Play Time: ' + ptTotal + '\n' +
    '• Performance: ' + perfTotal + '\n' +
    '• Chemistry: ' + chemScore + '\n' +
    '• Direction: ' + dirScore + '\n\n' +
    'Calculation:\n' +
    '(20×0.18 + 20×0.32 + 20×0.17) × 5 + (20×0.12 + 20×0.21) × 5\n' +
    '= (3.6 + 6.4 + 3.4) × 5 + (2.4 + 4.2) × 5\n' +
    '= 13.4 × 5 + 6.6 × 5\n' +
    '= 67 + 33\n' +
    '= 100\n\n' +
    'Result: ' + finalGrade + '/100\n\n' +
    'Expected: 100\n' +
    'Status: ' + (finalGrade === 100 ? 'PASS ✓' : 'FAIL ✗');

  ui.alert('Test Results', testResults, ui.ButtonSet.OK);
}

/**
 * Show debug info about current sheet
 */
function showDebugInfo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);

  var debugInfo = 'DEBUG INFORMATION\n\n';

  if (!sheet) {
    debugInfo += 'Retention Grades sheet: NOT FOUND\n';
  } else {
    debugInfo += 'Retention Grades sheet: Found\n';
    debugInfo += 'Last row: ' + sheet.getLastRow() + '\n';
    debugInfo += 'Last column: ' + sheet.getLastColumn() + '\n';
    debugInfo += 'Is formatted: ' + isRetentionSheetFormatted(sheet) + '\n\n';

    // Check for sections
    var postseasonRow = findPostseasonSection(sheet);
    var directionRow = findTeamDirectionSection(sheet);

    debugInfo += 'Postseason section: ' + (postseasonRow > 0 ? 'Row ' + postseasonRow : 'NOT FOUND') + '\n';
    debugInfo += 'Team Direction section: ' + (directionRow > 0 ? 'Row ' + directionRow : 'NOT FOUND') + '\n\n';

    // Check named range
    try {
      var namedRange = ss.getRangeByName('TeamDirection');
      if (namedRange) {
        debugInfo += 'TeamDirection named range: Found\n';
        debugInfo += 'Range: ' + namedRange.getA1Notation() + '\n';
      } else {
        debugInfo += 'TeamDirection named range: NOT FOUND\n';
      }
    } catch (e) {
      debugInfo += 'TeamDirection named range: ERROR - ' + e.message + '\n';
    }
  }

  debugInfo += '\nCache status:\n';
  debugInfo += 'Lineup cache: ' + (LINEUP_DATA_CACHE ? 'Loaded (' + Object.keys(LINEUP_DATA_CACHE).length + ' entries)' : 'Empty') + '\n';

  SpreadsheetApp.getUi().alert('Debug Info', debugInfo, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Clear all caches
 */
function clearAllCaches() {
  clearLineupCache();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "All caches cleared",
    "Cache Management",
    3
  );
}

/**
 * Show version info
 */
function showVersionInfo() {
  var ui = SpreadsheetApp.getUi();

  var versionInfo = 'CLB RETENTION GRADES\n\n' +
    'Version: ' + RETENTION_CONFIG.VERSION + '\n' +
    'Date: ' + RETENTION_CONFIG.VERSION_DATE + '\n\n' +
    'Major Changes in v2:\n' +
    '• Weighted grading system\n' +
    '• Auto-flagging for flight risk\n' +
    '• Team Direction table with VLOOKUP\n' +
    '• Draft/Trade Value tracking\n' +
    '• Removed Star Points\n' +
    '• Team Success 10/10 split\n' +
    '• No validation on modifiers\n\n' +
    'Changes in v2.1:\n' +
    '• Split Team Success into Regular Season + Postseason columns\n' +
    '• Postseason via VLOOKUP from table (3-column table with points formula)\n' +
    '• Auto-populate team lists in both tables\n' +
    '• Smart Update preserves Team Direction data\n' +
    '• 19 columns total (was 18)\n\n' +
    'File Structure:\n' +
    '• RetentionConfig_v2.js (configuration)\n' +
    '• RetentionCore_v2.js (data & calculation engine)\n' +
    '• RetentionFactors_v2.js (factor calculations)\n' +
    '• RetentionSheet_v2.js (sheet building)\n' +
    '• RetentionHelpers_v2.js (utilities)\n\n' +
    'Load Order:\n' +
    'Config → Core → Factors → Sheet → Helpers';

  ui.alert('Version Information', versionInfo, ui.ButtonSet.OK);
}

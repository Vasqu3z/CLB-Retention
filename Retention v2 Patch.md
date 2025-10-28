# Retention Grades v2 Implementation Prompt

## Context
You have a working v1 RetentionGrades.js system that calculates player retention probabilities. Build v2 by adding new features while preserving all v1's critical infrastructure (Smart Update, caching, batch operations, postseason preservation).

## Critical v1 Features to Preserve

### Smart Update System (DO NOT BREAK)
- `isRetentionSheetFormatted()` checks if sheet needs full rebuild
- `buildRetentionSheetFromScratch()` - Full formatting on first run
- `updateRetentionData()` - Data-only updates on subsequent runs, preserves:
  - Manual input columns (modifiers, chemistry, direction, draft value)
  - User's custom formatting and column widths
  - Postseason data
- Only writes to auto-calculated columns, never clears manual columns

### Performance Optimizations (DO NOT BREAK)
- `LINEUP_DATA_CACHE` for box score data
- Batch operations: `.getRange().getValues()` and `.setValues()`
- Single-pass processing through all sheets
- All existing caching and performance features

### Postseason Preservation
- `findPostseasonSection()` locates postseason table
- On rebuild, saves and restores existing postseason data
- Never wipes user's postseason entries

---

## New Features to Implement

### 1. Column Layout Changes

**New Column Structure (18 columns):**
```
A: Player
B: Team  
C: Draft/Trade Value (NEW - manual input, 1-8 or blank)
D: TS Base, E: TS Mod, F: TS Total
G: PT Base, H: PT Mod, I: PT Total
J: Performance Base (renamed from Awards), K: Performance Mod, L: Performance Total
M: Auto Total (weighted)
N: Chemistry (manual)
O: Direction (auto-lookup from team table)
P: Manual Total (weighted)
Q: Final Grade (0-100, weighted)
R: Details
Changes from v1:

Removed: Column I (Star Points) - eliminated entirely
Added: Column C (Draft/Trade Value) - biographical info
Renamed: "Awards" → "Performance" everywhere
Everything shifted right by 1 column starting from Column D

Update RETENTION_CONFIG.OUTPUT column constants:
javascriptCOL_PLAYER: 1,              // A
COL_TEAM: 2,                // B
COL_DRAFT_VALUE: 3,         // C - NEW
COL_TS_BASE: 4,             // D (was C)
COL_TS_MOD: 5,              // E (was D)
COL_TS_TOTAL: 6,            // F (was E)
COL_PT_BASE: 7,             // G (was F)
COL_PT_MOD: 8,              // H (was G)
COL_PT_TOTAL: 9,            // I (was H)
// COL_STAR_POINTS removed
COL_PERFORMANCE_BASE: 10,   // J (was J, renamed from AWARDS)
COL_PERFORMANCE_MOD: 11,    // K (was K, renamed)
COL_PERFORMANCE_TOTAL: 12,  // L (was L, renamed)
COL_AUTO_TOTAL: 13,         // M (was M)
COL_CHEMISTRY: 14,          // N (was N)
COL_DIRECTION: 15,          // O (was O)
COL_MANUAL_TOTAL: 16,       // P (was P)
COL_FINAL_GRADE: 17,        // Q (was Q)
COL_DETAILS: 18             // R (was R)

2. Weighted Grading System
Factor Weights (Season 1):
javascriptFACTOR_WEIGHTS: {
  TEAM_SUCCESS: 0.18,    // 18%
  PLAY_TIME: 0.32,       // 32% (highest)
  PERFORMANCE: 0.17,     // 17%
  CHEMISTRY: 0.12,       // 12%
  DIRECTION: 0.21        // 21%
}
// Must sum to 1.0 - add validation in RETENTION_CONFIG.validate()
New Formulas:
Auto Total (Column M):
javascript=D{row}+G{row}+J{row}
// Simple sum of base scores (no star points)
Manual Total (Column P):
javascript=(0.12*N{row})+(0.21*O{row})
// Weighted: Chemistry(12%) + Direction(21%)
Final Grade (Column Q):
javascript=ROUND((0.18*F{row}+0.32*I{row}+0.17*L{row}+P{row})*5,0)
// Weighted: TS(18%) + PT(32%) + Perf(17%) + Manual Total
// Multiply by 5 to scale to d100 (0-100)
Remove all Star Points references:

Delete PLAY_TIME.STAR_POINTS config section
Delete calculateStarPointsScore() function
Remove from all formulas, help menus, instructions


3. Team Success Rebalance (10/10 Split)
Update RETENTION_CONFIG.TEAM_SUCCESS:
javascriptTEAM_SUCCESS: {
  MAX_POINTS: 20,
  
  REGULAR_SEASON: {
    MAX_POINTS: 10,  // Changed from 8
    
    // Scale proportionally (multiply old values by 10/8 = 1.25)
    FIRST: 10,       // Was 8
    SECOND: 6.25,    // Was 5
    THIRD: 6.25,     // Was 5
    FOURTH: 5,       // Was 4
    FIFTH: 3.75,     // Was 3
    SIXTH: 2.5,      // Was 2
    SEVENTH: 2.5,    // Was 2
    EIGHTH: 0        // Was 0
  },
  
  POSTSEASON: {
    MAX_POINTS: 10,      // Changed from 12
    
    // Scale proportionally (multiply old values by 10/12 = 0.833)
    CHAMPION: 10,        // Was 12
    RUNNER_UP: 7.5,      // Was 9
    SEMIFINAL: 5,        // Was 6
    QUARTERFINAL: 2.5,   // Was 3
    MISSED_PLAYOFFS: 0   // Was 0
  }
}
Update calculateTeamSuccess() to use new point values.

4. Rename "Awards" → "Performance"
Global Find & Replace:

Config: AWARDS → PERFORMANCE
Function: calculateAwards() → calculatePerformance()
Variables: awards → performance
Column headers: "Awards" → "Performance"
Help menus: All "Awards/Accolades" → "Performance"
Comments: Update all references

Keep the same 0-14/0-3/0-3 structure (Offensive/Defensive/Pitching)

5. Auto-Flagging System (Elite on Struggling Team)
Add to RETENTION_CONFIG.PERFORMANCE:
javascriptPERFORMANCE: {
  // ... existing OFFENSIVE, DEFENSIVE, PITCHING sections ...
  
  AUTO_FLAGGING: {
    // Detect top performers on poor teams (flight risk)
    ELITE_THRESHOLD: 60,           // Player must be ≥60th percentile
    STRUGGLING_TEAM_THRESHOLD: 10, // Team must have <10 TS points
    
    TIER_1: {
      PLAYER_PERCENTILE: 75,       // Top 25% player
      TEAM_MAX_STANDING: 8,        // On 7th-8th place team
      PENALTY: -4                  // Apply -4 to performance base
    },
    
    TIER_2: {
      PLAYER_PERCENTILE: 60,       // Top 40% player
      TEAM_MAX_STANDING: 8,        // On 5th-8th place team
      PENALTY: -2                  // Apply -2 to performance base
    }
  }
}
Implementation in calculatePerformance():
javascript// After calculating base performance score (offensive + defensive + pitching)
// Check if player qualifies for auto-flagging

var autoFlagPenalty = 0;

// Get player's overall percentile (use offensive percentile as proxy)
if (avgPercentile >= config.AUTO_FLAGGING.ELITE_THRESHOLD) {
  
  // Get team success for this player
  var teamSuccessData = calculateTeamSuccess(player, teamData, standingsData, postseasonData);
  var teamSuccessPoints = teamSuccessData.total;
  
  var teamStanding = standingsData[player.team] || 9;
  
  // Check Tier 1: Top 25% on 7th-8th place team
  if (avgPercentile >= config.AUTO_FLAGGING.TIER_1.PLAYER_PERCENTILE &&
      teamStanding >= 7 &&
      teamSuccessPoints < config.AUTO_FLAGGING.STRUGGLING_TEAM_THRESHOLD) {
    autoFlagPenalty = config.AUTO_FLAGGING.TIER_1.PENALTY;
  }
  // Check Tier 2: Top 40% on 5th-8th place team
  else if (avgPercentile >= config.AUTO_FLAGGING.TIER_2.PLAYER_PERCENTILE &&
           teamStanding >= 5 &&
           teamSuccessPoints < config.AUTO_FLAGGING.STRUGGLING_TEAM_THRESHOLD) {
    autoFlagPenalty = config.AUTO_FLAGGING.TIER_2.PENALTY;
  }
}

// Apply penalty to base score
breakdown.total += autoFlagPenalty;

// Ensure doesn't go below 0
if (breakdown.total < 0) breakdown.total = 0;

// Add to details if penalty applied
if (autoFlagPenalty < 0) {
  breakdown.details += " | Auto-flag: " + autoFlagPenalty + " (elite on struggling team)";
}

6. Draft Expectations System
Add to RETENTION_CONFIG.PERFORMANCE:
javascriptPERFORMANCE: {
  // ... existing sections ...
  
  DRAFT_EXPECTATIONS: {
    // Compare performance to acquisition cost
    
    HIGH_ROUNDS: {
      rounds: [1, 2, 3],           // Conservative players
      expected: 75,                // Expected 75th percentile
      tolerance: 10,               // Within ±10 percentile
      EXCEEDED: -2.5,              // Outperformed → might explore
      MET: 0,                      // Met expectations → comfortable
      BELOW: 2.5                   // Underperformed → grateful
    },
    
    LOW_ROUNDS: {
      rounds: [4, 5, 6, 7, 8],     // Hungry players
      expected: 45,                // Expected 45th percentile
      tolerance: 15,               // Within ±15 percentile
      EXCEEDED: -4.5,              // Outperformed → deserve better (SEVERE)
      MET: 1.5,                    // Met expectations → team believes
      BELOW: 3.5                   // Underperformed → development plan
    }
  }
}
Implementation in calculatePerformance():
javascript// After calculating base performance and auto-flagging
// Check if player has draft value entered

var draftExpectationMod = 0;

// Note: draftValue comes from player object (needs to be passed in or looked up)
// You'll need to modify calculatePerformance signature to accept draftValue
// OR look it up from the sheet during calculation

if (player.draftValue && player.draftValue >= 1 && player.draftValue <= 8) {
  var config = RETENTION_CONFIG.PERFORMANCE.DRAFT_EXPECTATIONS;
  var expectConfig = null;
  
  // Determine if high or low round
  if (config.HIGH_ROUNDS.rounds.indexOf(player.draftValue) >= 0) {
    expectConfig = config.HIGH_ROUNDS;
  } else if (config.LOW_ROUNDS.rounds.indexOf(player.draftValue) >= 0) {
    expectConfig = config.LOW_ROUNDS;
  }
  
  if (expectConfig && avgPercentile !== undefined) {
    var variance = avgPercentile - expectConfig.expected;
    
    if (variance > expectConfig.tolerance) {
      // Exceeded expectations
      draftExpectationMod = expectConfig.EXCEEDED;
    } else if (Math.abs(variance) <= expectConfig.tolerance) {
      // Met expectations
      draftExpectationMod = expectConfig.MET || 0;
    } else {
      // Below expectations
      draftExpectationMod = expectConfig.BELOW;
    }
    
    // Add to details
    if (draftExpectationMod !== 0) {
      breakdown.details += " | Draft Exp: " + draftExpectationMod + 
                          " (Round " + player.draftValue + 
                          ", " + avgPercentile.toFixed(0) + "% vs " + 
                          expectConfig.expected + "% expected)";
    }
  }
}

// Apply draft expectation modifier
breakdown.total += draftExpectationMod;

// Ensure doesn't go below 0
if (breakdown.total < 0) breakdown.total = 0;
```

**Note:** You'll need to pass `draftValue` into `calculatePerformance()`. Options:
1. Read draft values before calculating (add to player objects)
2. Pass as separate parameter
3. Look up from sheet during calculation (slower)

**Recommendation:** Read draft values early and add to player objects in main calculation loop.

---

### 7. Team Direction Table

**Add section at bottom of sheet (next to Postseason Results):**
```
Layout:
[3 blank rows after last player]

TEAM DIRECTION SCORES          [blank col]    POSTSEASON RESULTS
Team | Direction (0-20) | Notes [blank col]    Team | Finish
Team A | 10 | [editable]       [blank col]    Team A | [dropdown]
Team B | 10 | [editable]       [blank col]    Team B | [dropdown]
...
Implementation in addBottomSections():
javascriptfunction addBottomSections(sheet, playerCount, existingPostseasonData) {
  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  var sectionStartRow = dataStartRow + playerCount + 3;
  
  // Get list of teams
  var teams = getUniqueTeams(); // Helper function to extract from team data
  
  // ===== TEAM DIRECTION SECTION (LEFT SIDE) =====
  sheet.getRange(sectionStartRow, 1)
    .setValue("TEAM DIRECTION SCORES")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);
  
  sheet.getRange(sectionStartRow, 1, 1, 3)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);
  
  // Headers
  sheet.getRange(sectionStartRow + 1, 1, 1, 3)
    .setValues([["Team", "Direction (0-20)", "Notes/Justification"]])
    .setFontWeight("bold")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER)
    .setHorizontalAlignment("center");
  
  // Pre-populate team names with default score of 10
  var directionDataStart = sectionStartRow + 2;
  for (var i = 0; i < teams.length; i++) {
    sheet.getRange(directionDataStart + i, 1).setValue(teams[i]);
    sheet.getRange(directionDataStart + i, 2).setValue(10); // Default
    sheet.getRange(directionDataStart + i, 3).setValue(""); // Notes
  }
  
  // Formatting
  sheet.getRange(directionDataStart, 1, teams.length, 3)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  
  // Data validation for Direction column (0-20)
  var rule0to20 = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(0, 20)
    .setAllowInvalid(false)
    .setHelpText("Enter team direction score (0-20)")
    .build();
  
  sheet.getRange(directionDataStart, 2, teams.length, 1)
    .setDataValidation(rule0to20);
  
  // Set column widths
  sheet.setColumnWidth(1, 120); // Team name
  sheet.setColumnWidth(2, 100); // Direction score
  sheet.setColumnWidth(3, 200); // Notes
  
  // ===== POSTSEASON SECTION (RIGHT SIDE, starting at column 5) =====
  var postseasonCol = 5;
  
  sheet.getRange(sectionStartRow, postseasonCol)
    .setValue("POSTSEASON RESULTS")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);
  
  sheet.getRange(sectionStartRow, postseasonCol, 1, 2)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);
  
  // Headers
  sheet.getRange(sectionStartRow + 1, postseasonCol, 1, 2)
    .setValues([["Team", "Finish"]])
    .setFontWeight("bold")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER)
    .setHorizontalAlignment("center");
  
  // Restore or create postseason data
  var postseasonDataStart = sectionStartRow + 2;
  
  if (existingPostseasonData && existingPostseasonData.length > 0) {
    sheet.getRange(postseasonDataStart, postseasonCol, existingPostseasonData.length, 2)
      .setValues(existingPostseasonData);
  } else {
    // Pre-populate team names
    for (var i = 0; i < teams.length; i++) {
      sheet.getRange(postseasonDataStart + i, postseasonCol).setValue(teams[i]);
      sheet.getRange(postseasonDataStart + i, postseasonCol + 1).setValue("");
    }
  }
  
  // Formatting
  sheet.getRange(postseasonDataStart, postseasonCol, teams.length, 2)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  
  // ... continue with instructions section below ...
}

// Helper function to get unique teams
function getUniqueTeams() {
  var teamData = getTeamData();
  var teams = [];
  for (var team in teamData) {
    teams.push(team);
  }
  teams.sort();
  return teams;
}
Modify Direction Column (Column O) to use VLOOKUP:
In writePlayerData(), change Direction column from manual input to formula:
javascript// For each player row:
sheet.getRange(row, cols.COL_DIRECTION).setFormula(
  "=IFERROR(VLOOKUP(B" + row + ",'" + 
  CONFIG.RETENTION_GRADES_SHEET + "'!" +
  "A" + directionTableStartRow + ":B" + (directionTableStartRow + 7) + 
  ",2,FALSE),10)"
);
// Falls back to 10 if team not found
Update getTeamDirectionScores() helper:
javascriptfunction getTeamDirectionScores() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);
  
  var directions = {};
  
  if (!sheet) return directions;
  
  try {
    // Find Team Direction section
    var lastRow = sheet.getLastRow();
    var searchRange = sheet.getRange(1, 1, lastRow, 1).getValues();
    
    var directionHeaderRow = -1;
    for (var i = 0; i < searchRange.length; i++) {
      if (String(searchRange[i][0]).indexOf("TEAM DIRECTION SCORES") >= 0) {
        directionHeaderRow = i + 1;
        break;
      }
    }
    
    if (directionHeaderRow === -1) return directions;
    
    // Read data (starting 2 rows after header)
    var dataStartRow = directionHeaderRow + 2;
    var data = sheet.getRange(dataStartRow, 1, 10, 2).getValues();
    
    for (var i = 0; i < data.length; i++) {
      var teamName = String(data[i][0]).trim();
      var directionScore = data[i][1];
      
      if (teamName && typeof directionScore === 'number') {
        directions[teamName] = directionScore;
      }
    }
  } catch (e) {
    Logger.log("Error reading team direction scores: " + e.toString());
  }
  
  return directions;
}

8. Data Validation Changes
Remove validation from modifier columns:
javascript// In applyDataFormatting(), REMOVE these lines:
// sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).setDataValidation(modifierRule);
// sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).setDataValidation(modifierRule);
// sheet.getRange(startRow, cols.COL_PERFORMANCE_MOD, numRows, 1).setDataValidation(modifierRule);

// KEEP validation for:
// - Draft/Trade Value: 1-8 or blank
// - Chemistry: 0-20
// - Team Direction: 0-20 (in direction table)
Add Draft/Trade Value validation:
javascript// In applyDataFormatting():
var draftValueRule = SpreadsheetApp.newDataValidation()
  .requireNumberBetween(1, 8)
  .setAllowInvalid(true)  // Allow blank
  .setHelpText("Enter draft round (1-8) or leave blank")
  .build();

sheet.getRange(startRow, cols.COL_DRAFT_VALUE, numRows, 1)
  .setDataValidation(draftValueRule)
  .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE)
  .setHorizontalAlignment("center");

9. Update Help Menus
Add new help function:
javascriptfunction showDraftValueHelp() {
  var html = '<h3>Draft/Trade Value (Column C)</h3>' +
    '<p><b>Purpose:</b> Compare player performance to acquisition cost</p>' +
    '<p><b>Input:</b> Enter 1-8 for draft round, or leave blank</p>' +
    '<ul>' +
    '<li>1-3: High rounds (conservative players, expected 75th percentile)</li>' +
    '<li>4-8: Low rounds (hungry players, expected 45th percentile)</li>' +
    '<li>Blank: No expectation check (retained players, free agents)</li>' +
    '</ul>' +
    '<p><b>Effect on Performance:</b></p>' +
    '<ul>' +
    '<li><b>High Rounds (1-3):</b></li>' +
    '<li>  Exceeded (>85th %ile): -2.5 pts (might explore options)</li>' +
    '<li>  Met (65-85th %ile): 0 pts (comfortable)</li>' +
    '<li>  Below (<65th %ile): +2.5 pts (grateful for opportunity)</li>' +
    '<li><b>Low Rounds (4-8):</b></li>' +
    '<li>  Exceeded (>60th %ile): -4.5 pts (deserve better team) ⚠️</li>' +
    '<li>  Met (30-60th %ile): +1.5 pts (team believes in them)</li>' +
    '<li>  Below (<30th %ile): +3.5 pts (development plan)</li>' +
    '</ul>' +
    '<p style="color: red;"><b>Note:</b> Adjustments applied automatically to Performance base score. ' +
    'Use Performance Modifier (Column K) for additional context.</p>';
  
  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Draft/Trade Value');
}
Update showPerformanceHelp() (formerly showAwardsHelp):

Rename function
Update title to "Performance Factor"
Add section on auto-flagging:

javascript'<hr>' +
'<h3>Automatic Adjustments:</h3>' +
'<p><b>Elite on Struggling Team (Auto-Flagging):</b></p>' +
'<ul>' +
'<li>Top 25% player on 7th-8th place team: -4 pts (major flight risk)</li>' +
'<li>Top 40% player on 5th-8th place team: -2 pts (minor flight risk)</li>' +
'</ul>' +
'<p><b>Draft Expectations:</b></p>' +
'<ul>' +
'<li>See Draft/Trade Value help for details</li>' +
'<li>Compares performance to expected level based on draft round</li>' +
'</ul>' +
'<p style="color: blue;"><b>Note:</b> Both adjustments applied automatically. ' +
'Use Performance Modifier (Column K) for additional context.</p>'
Update showDirectionHelp() (new help):
javascriptfunction showDirectionHelp() {
  var html = '<h3>Team Direction (Column O)</h3>' +
    '<p><b>Purpose:</b> Forward-looking factor evaluating team trajectory</p>' +
    '<p style="color: blue;"><b>NEW:</b> Team-based input (all players on team get same score)</p>' +
    '<hr>' +
    '<h3>How It Works:</h3>' +
    '<ul>' +
    '<li>Scroll to bottom of sheet to "TEAM DIRECTION SCORES" table</li>' +
    '<li>Enter score (0-20) for each team once</li>' +
    '<li>Score automatically applies to ALL players on that team</li>' +
    '<li>Default: 10 (neutral)</li>' +
    '</ul>' +
    '<hr>' +
    '<h3>What to Consider:</h3>' +
    '<ul>' +
    '<li><b>Draft Capital:</b> Teams with good picks = higher scores</li>' +
    '<li><b>Transaction Competence:</b> Smart trades = player confidence</li>' +
    '<li><b>Roster Stability:</b> Low turnover = security</li>' +
    '<li><b>GM Reputation:</b> Track record of success</li>' +
    '</ul>' +
    '<p><b>Examples:</b></p>' +
    '<ul>' +
    '<li>18-20: Contender with great picks and smart GM</li>' +
    '<li>12-15: Solid team, decent outlook</li>' +
    '<li>8-10: Neutral/rebuilding</li>' +
    '<li>0-5: Mortgaged future, poor management</li>' +
    '</ul>' +
    '<p style="color: red;"><b>Weight:</b> 21% of final grade (2nd highest after Play Time)</p>';
  
  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(550);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Team Direction Factor');
}
Update main system help:

Change "Awards" to "Performance"
Update factor descriptions
Add note about weighted system
Update color coding to reflect 0-100 scale


10. Config Validation
Add to RETENTION_CONFIG.validate():
javascript// Check that factor weights sum to 1.0
var weights = RETENTION_CONFIG.FACTOR_WEIGHTS;
var weightSum = weights.TEAM_SUCCESS + weights.PLAY_TIME + 
                weights.PERFORMANCE + weights.CHEMISTRY + weights.DIRECTION;

if (Math.abs(weightSum - 1.0) > 0.001) {
  errors.push("Factor weights must sum to 1.0 (currently: " + weightSum.toFixed(3) + ")");
}

// Check that each weight is between 0 and 1
for (var factor in weights) {
  if (weights[factor] < 0 || weights[factor] > 1) {
    errors.push(factor + " weight must be between 0 and 1 (currently: " + weights[factor] + ")");
  }
}

Implementation Checklist
Phase 1: Config & Column Changes

 Update RETENTION_CONFIG with new column mappings
 Add FACTOR_WEIGHTS section
 Update TEAM_SUCCESS to 10/10 split
 Rename all AWARDS → PERFORMANCE in config
 Add AUTO_FLAGGING config
 Add DRAFT_EXPECTATIONS config
 Remove STAR_POINTS config section
 Add weight validation to validate()

Phase 2: Core Calculation Updates

 Rename calculateAwards() → calculatePerformance()
 Implement auto-flagging in calculatePerformance()
 Implement draft expectations in calculatePerformance()
 Modify calculation to read draft values from sheet
 Update calculateTeamSuccess() for new point values
 Update calculatePlayTime() to remove star points

Phase 3: Sheet Building Updates

 Update column headers (add Draft Value, rename Awards)
 Update column widths
 Modify writePlayerData() for new columns
 Add Draft/Trade Value column with validation
 Change Direction column to VLOOKUP formula
 Update all formulas (Auto Total, Manual Total, Final Grade)
 Remove Star Points column entirely

Phase 4: Bottom Sections

 Add Team Direction table in addBottomSections()
 Update postseason section layout (side-by-side)
 Implement getTeamDirectionScores() helper
 Implement getUniqueTeams() helper
 Update instructions text

Phase 5: Smart Update Preservation

 Update isRetentionSheetFormatted() for new headers
 Update updateRetentionData() to preserve new manual columns
 Update applyDataFormatting() for new column structure
 Test that postseason preservation still works
 Test that manual inputs preserved on re-run

Phase 6: Help Menus

 Add showDraftValueHelp()
 Update showPerformanceHelp() (rename
RetryAContinuePhase 6: Help Menus (continued)

 Update showPerformanceHelp() (rename from showAwardsHelp)
 Add showDirectionHelp()
 Update showTeamSuccessHelp() for 10/10 split
 Update showPlayTimeHelp() (remove star points)
 Update showRetentionSystemHelp() (weighted system, new factors)
 Add help menu items to Retention menu

Phase 7: Testing & Validation

 Test config validation (weights sum to 1.0)
 Test column layout with new Draft Value column
 Test weighted formulas calculate correctly
 Test auto-flagging detects elite on bad teams
 Test draft expectations with various rounds
 Test Team Direction table and VLOOKUP
 Test Smart Update preserves all manual inputs
 Test postseason data preservation
 Test color coding for 0-100 scale
 Test with actual Season 1 data


File Splitting Structure
Split the monolithic RetentionGrades.js into 4 files:
RetentionGrades_Core.js (~600 lines)
javascript// MAIN CALCULATION ENGINE
// - calculateRetentionGrades() - main entry point
// - Data loading functions (getPlayerData, getTeamData, etc.)
// - calculateLeaguePercentiles()
// - Smart Update logic (isRetentionSheetFormatted, buildFromScratch, updateData)
// - Cache management (LINEUP_DATA_CACHE)
// - Main calculation loop
RetentionGrades_Factors.js (~400 lines)
javascript// FACTOR CALCULATION FUNCTIONS
// - calculateTeamSuccess()
// - calculatePlayTime()
// - calculatePerformance() (formerly calculateAwards)
//   - Includes auto-flagging logic
//   - Includes draft expectations logic
// - Helper functions (calculatePercentile, etc.)
RetentionGrades_Sheet.js (~400 lines)
javascript// SHEET BUILDING & FORMATTING
// - writePlayerData()
// - applyDataFormatting()
// - applyFinalGradeFormatting()
// - addBottomSections() (including Team Direction table)
// - getTeamDirectionScores()
// - getUniqueTeams()
// - rebuildRetentionSheet()
// - refreshRetentionFormulas()
RetentionGrades_Helpers.js (~200 lines)
javascript// HELP MENUS & DEBUG FUNCTIONS
// - showTeamSuccessHelp()
// - showPlayTimeHelp()
// - showPerformanceHelp() (formerly showAwardsHelp)
// - showDraftValueHelp() (NEW)
// - showDirectionHelp() (NEW)
// - showRetentionSystemHelp()
// - debugPostseasonData()
// - debugLineupPositions()
// - debugSamplePlayer()
// - Utility functions (findPlayerIndex, getOrdinalSuffix, findPostseasonSection)
Loading Order: Ensure files load in correct order in Apps Script editor:

RetentionConfig.js (already separate)
RetentionGrades_Core.js
RetentionGrades_Factors.js
RetentionGrades_Sheet.js
RetentionGrades_Helpers.js


Critical Reminders
DO NOT BREAK These v1 Features:

Smart Update - isRetentionSheetFormatted() must detect if sheet needs rebuild
Manual Column Preservation - Only clear/write auto-calculated columns
Postseason Preservation - Save and restore on rebuild
Batch Operations - All reads/writes use .getRange().getValues() and .setValues()
Caching - LINEUP_DATA_CACHE for box score data
Single-Pass Processing - Each sheet read only once per execution
User Formatting - Never wipe column widths or custom user formatting

New Features Must:

Integrate cleanly - Follow v1 patterns and style
Preserve performance - Use batch operations, no loops for formatting
Be well-documented - Comments explaining logic
Match existing code style - Same naming conventions, structure
Handle edge cases - Missing data, trades, blank values
Log appropriately - Use Logger.log for debugging, toasts for user feedback

Testing Priorities:

Smart Update works (run twice, manual inputs preserved)
Weighted formulas calculate correctly
Auto-flagging identifies correct players
Draft expectations apply correct modifiers
Team Direction table functions properly
All help menus display correctly
Performance acceptable (<30 seconds total)


Additional Notes
Reading Draft Values
The draft expectations system needs access to draft values. Implement this in the main calculation loop:
javascript// In calculateRetentionGrades(), after loading playerData:

// Read draft values from sheet if it exists
var draftValues = {};
var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);
if (sheet && isRetentionSheetFormatted(sheet)) {
  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  var lastRow = sheet.getLastRow();
  
  if (lastRow >= dataStartRow) {
    var draftData = sheet.getRange(
      dataStartRow, 
      RETENTION_CONFIG.OUTPUT.COL_PLAYER, 
      lastRow - dataStartRow + 1, 
      3  // Player, Team, Draft Value
    ).getValues();
    
    for (var i = 0; i < draftData.length; i++) {
      var playerName = draftData[i][0];
      var team = draftData[i][1];
      var draftValue = draftData[i][2];
      
      if (playerName && team) {
        var key = playerName + "|" + team;
        draftValues[key] = draftValue;
      }
    }
  }
}

// Then in the calculation loop, add draftValue to each player object:
for (var i = 0; i < playerData.length; i++) {
  var player = playerData[i];
  var key = player.name + "|" + player.team;
  player.draftValue = draftValues[key] || null;
  
  // ... rest of calculation ...
}
Handling Team Direction in First Run
On first run, Team Direction table won't exist yet. The VLOOKUP formula should gracefully fall back to default (10):
javascript// In writePlayerData(), for Direction column:
=IFERROR(VLOOKUP(B{row},$A${directionStart}:$B${directionEnd},2,FALSE),10)
Color Coding Update
The color coding thresholds remain the same (75+, 60-74, 40-59, <40) but now work on 0-100 scale instead of 0-20. No changes needed to getGradeColor() function.
Column Header Formatting
Update headers to reflect new structure:
javascriptvar headers = [
  "Player",
  "Team",
  "Draft/Trade\nValue (1-8)",        // NEW
  "Team Success\n(Base 0-20)",
  "TS Mod",                           // Remove validation note
  "TS Total\n(0-20)",
  "Play Time\n(Base 0-20)",
  "PT Mod",                           // Remove validation note
  "PT Total\n(0-20)",
  "Performance\n(Base 0-20)",         // Renamed
  "Perf Mod",                         // Remove validation note
  "Performance Total\n(0-20)",        // Renamed
  "Auto Total\n(0-60)",               // No longer includes star points
  "Chemistry\n(0-20)",
  "Direction\n(0-20)",
  "Manual Total\n(0-40)",             // Now weighted
  "FINAL GRADE\n(d100)",
  "Details"
];
Instructions Update
Update the instructions row at bottom of sheet:
javascript"INSTRUCTIONS: (1) Enter Team Direction scores in table at bottom (one score per team). " +
"(2) Enter Draft/Trade Value in Column C for players (1-8 or blank). " +
"(3) Enter postseason results in table. " +
"(4) Run 'Calculate Retention Grades' from ⭐ Retention menu to update scores. " +
"(5) Review Details column for auto-flagging and draft expectation adjustments. " +
"(6) Apply manual modifiers if needed (Cols E, H, K) - no limits. " +
"(7) Enter Chemistry scores (Col N). " +
"(8) Final grades auto-calculate in Column Q using weighted formula. " +
"NOTE: Grades are weighted (TS:18%, PT:32%, Perf:17%, Chem:12%, Dir:21%) and scaled to d100."
Design Philosophy Notes
Add to instructions section:
javascript"DESIGN NOTE: This system uses weighted factors to calculate retention probability. " +
"Play Time weighted highest (32%) because it reflects team commitment. " +
"Direction weighted second (21%) as forward-looking indicator. " +
"Team Success and Performance equally weighted (18%, 17%) for past results. " +
"Chemistry lowest (12%) due to subjectivity. " +
"Auto-flagging detects flight risk (elite players on struggling teams). " +
"Draft expectations compare performance to acquisition cost. " +
"Both automatically adjust Performance base score - use Performance Modifier for additional context."

Summary
This prompt creates Retention Grades v2 by:

✅ Preserving all v1 infrastructure - Smart Update, caching, batch operations
✅ Adding weighted grading - 18/32/17/12/21 factor weights, scaled to d100
✅ Rebalancing Team Success - 10/10 regular/postseason split
✅ Renaming Awards → Performance - Throughout codebase
✅ Removing Star Points - Eliminated entirely from Column I
✅ Adding Draft/Trade Value - New Column C for biographical info
✅ Implementing auto-flagging - Elite on struggling team detection
✅ Implementing draft expectations - Performance vs acquisition cost
✅ Adding Team Direction table - Team-based input at bottom
✅ Updating help menus - New dialogs, updated content
✅ Removing modifier validation - Allow any value
✅ Splitting into 4 files - Better organization, maintainability

The system maintains v1's excellent Smart Update and performance optimizations while adding sophisticated new features for more accurate retention probability calculations.
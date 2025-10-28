// ===== RETENTION GRADES V2 - SHEET BUILDING & FORMATTING =====
// Sheet creation, formatting, Team Direction table, and bottom sections
//
// Dependencies: RetentionConfig_v2.js, RetentionCore_v2.js
//
// V2 CHANGES:
// - New column layout with Draft/Trade Value at Column C
// - Removed Star Points column
// - Added Team Direction table at bottom
// - Updated headers to say "Performance" instead of "Awards"
// - V2 weighted formulas
// - No data validation on modifier columns

/**
 * BUILD FROM SCRATCH: Full sheet creation with all formatting
 * PRESERVES: Postseason data and Team Direction data if it exists
 */
function buildRetentionSheetFromScratch(retentionGrades) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);

  // PRESERVE POSTSEASON DATA before clearing
  var existingPostseasonData = [];
  if (sheet) {
    var postseasonRow = findPostseasonSection(sheet);
    if (postseasonRow > 0) {
      try {
        var dataStartRow = postseasonRow + 2;
        existingPostseasonData = sheet.getRange(dataStartRow, 1, 8, 2).getValues();
        Logger.log("Preserved postseason data from existing sheet");
      } catch (e) {
        Logger.log("Could not preserve postseason data: " + e.toString());
      }
    }
  }

  // PRESERVE TEAM DIRECTION DATA before clearing
  var existingDirectionData = [];
  if (sheet) {
    var directionRow = findTeamDirectionSection(sheet);
    if (directionRow > 0) {
      try {
        var dataStartRow = directionRow + 2;
        existingDirectionData = sheet.getRange(dataStartRow, 1, 8, 2).getValues();
        Logger.log("Preserved Team Direction data from existing sheet");
      } catch (e) {
        Logger.log("Could not preserve Team Direction data: " + e.toString());
      }
    }
  }

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.RETENTION_GRADES_SHEET);
  } else {
    sheet.clear();
  }

  Logger.log("Building Retention Grades v2 sheet from scratch");

  // ===== HEADER SECTION =====
  sheet.getRange(1, 1)
    .setValue("CLB Retention Grade Calculator v2.0")
    .setFontWeight("bold")
    .setFontSize(14)
    .setHorizontalAlignment("left")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);

  sheet.getRange(1, 1, 1, RETENTION_CONFIG.OUTPUT.TOTAL_COLUMNS)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);

  sheet.getRange(2, 1)
    .setValue("Designed for TOP 3 players per team. Weighted grading: TS(18%) + PT(32%) + Perf(17%) + Chem(12%) + Dir(21%). " +
              "Auto-flagging detects flight risk for elite players on struggling teams.")
    .setFontSize(9)
    .setFontStyle("italic")
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  sheet.getRange(2, 1, 1, RETENTION_CONFIG.OUTPUT.TOTAL_COLUMNS).merge();

  // ===== DATA TABLE HEADER =====
  var headerRow = RETENTION_CONFIG.OUTPUT.HEADER_ROW;
  var headers = [
    "Player",
    "Team",
    "Draft/Trade\nValue (1-8)",  // NEW in v2
    "Team Success\n(Base 0-20)",
    "TS Mod\n(manual)",          // V2: No validation
    "TS Total\n(0-20)",
    "Play Time\n(Base 0-20)",
    "PT Mod\n(manual)",          // V2: No validation
    "PT Total\n(0-20)",
    "Performance\n(Base 0-20)",  // V2: Renamed from Awards
    "Perf Mod\n(manual)",        // V2: No validation
    "Perf Total\n(0-20)",
    "Auto Total\n(0-60)",
    "Chemistry\n(0-20)",
    "Direction\n(0-20)",         // V2: VLOOKUP from table
    "Manual Total\n(weighted)",  // V2: Weighted formula
    "FINAL GRADE\n(d100)",       // V2: Weighted × 5
    "Details"
  ];

  sheet.getRange(headerRow, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  // Set column widths
  var cols = RETENTION_CONFIG.OUTPUT;
  sheet.setColumnWidth(cols.COL_PLAYER, RETENTION_CONFIG.OUTPUT.PLAYER_COL_WIDTH);
  sheet.setColumnWidth(cols.COL_TEAM, RETENTION_CONFIG.OUTPUT.TEAM_COL_WIDTH);
  sheet.setColumnWidth(cols.COL_DRAFT_VALUE, RETENTION_CONFIG.OUTPUT.DRAFT_VALUE_COL_WIDTH);

  // Stats columns (D-M)
  for (var i = cols.COL_TS_BASE; i <= cols.COL_AUTO_TOTAL; i++) {
    sheet.setColumnWidth(i, RETENTION_CONFIG.OUTPUT.STAT_COL_WIDTH);
  }

  // Manual input columns (N-O)
  sheet.setColumnWidth(cols.COL_CHEMISTRY, RETENTION_CONFIG.OUTPUT.CHEMISTRY_COL_WIDTH);
  sheet.setColumnWidth(cols.COL_DIRECTION, RETENTION_CONFIG.OUTPUT.DIRECTION_COL_WIDTH);

  // Grade columns (P-Q)
  sheet.setColumnWidth(cols.COL_MANUAL_TOTAL, RETENTION_CONFIG.OUTPUT.GRADE_COL_WIDTH);
  sheet.setColumnWidth(cols.COL_FINAL_GRADE, RETENTION_CONFIG.OUTPUT.GRADE_COL_WIDTH);

  // Details column (R)
  sheet.setColumnWidth(cols.COL_DETAILS, RETENTION_CONFIG.OUTPUT.DETAILS_COL_WIDTH);

  // Freeze header rows
  sheet.setFrozenRows(headerRow);

  // Write data
  writePlayerData(sheet, retentionGrades);

  // Add bottom sections (postseason, direction table, instructions)
  addBottomSections(sheet, retentionGrades.length, existingPostseasonData, existingDirectionData);

  Logger.log("Sheet build complete");
}

/**
 * Apply formatting to data rows
 * Uses batch operations for performance
 * V2: Updated for new column layout
 */
function applyDataFormatting(sheet, startRow, numRows) {
  var cols = RETENTION_CONFIG.OUTPUT;

  // Build background color array
  var bgColors = [];
  for (var i = 0; i < numRows; i++) {
    var bgColor = i % 2 === 0 ? "#ffffff" : "#f9f9f9";
    bgColors.push([bgColor]);
  }

  // Apply alternating row colors to auto-calculated columns (batch operation)
  var autoCalcColumns = [
    cols.COL_PLAYER, cols.COL_TEAM,
    cols.COL_TS_BASE, cols.COL_TS_TOTAL,
    cols.COL_PT_BASE, cols.COL_PT_TOTAL,
    cols.COL_PERF_BASE, cols.COL_PERF_TOTAL,
    cols.COL_AUTO_TOTAL, cols.COL_MANUAL_TOTAL,
    cols.COL_FINAL_GRADE, cols.COL_DETAILS
  ];

  for (var c = 0; c < autoCalcColumns.length; c++) {
    sheet.getRange(startRow, autoCalcColumns[c], numRows, 1).setBackgrounds(bgColors);
  }

  // Center-align numeric columns (batch operations)
  var numericColumns = [
    cols.COL_TS_BASE, cols.COL_TS_TOTAL,
    cols.COL_PT_BASE, cols.COL_PT_TOTAL,
    cols.COL_PERF_BASE, cols.COL_PERF_TOTAL,
    cols.COL_AUTO_TOTAL, cols.COL_MANUAL_TOTAL, cols.COL_FINAL_GRADE
  ];

  for (var c = 0; c < numericColumns.length; c++) {
    sheet.getRange(startRow, numericColumns[c], numRows, 1).setHorizontalAlignment("center");
  }

  // Read all manual input columns at once (batch read)
  var draftValues = sheet.getRange(startRow, cols.COL_DRAFT_VALUE, numRows, 1).getValues();
  var tsModValues = sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).getValues();
  var ptModValues = sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).getValues();
  var perfModValues = sheet.getRange(startRow, cols.COL_PERF_MOD, numRows, 1).getValues();
  var chemValues = sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).getValues();
  var dirValues = sheet.getRange(startRow, cols.COL_DIRECTION, numRows, 1).getValues();

  // Prepare arrays for batch writing
  var draftToWrite = [];
  var tsModToWrite = [];
  var ptModToWrite = [];
  var perfModToWrite = [];
  var chemToWrite = [];
  var dirToWrite = [];

  for (var i = 0; i < numRows; i++) {
    // Only set to 0 if empty/null (preserve existing values)
    draftToWrite.push([draftValues[i][0] === "" || draftValues[i][0] === null ? "" : draftValues[i][0]]);
    tsModToWrite.push([tsModValues[i][0] === "" || tsModValues[i][0] === null ? 0 : tsModValues[i][0]]);
    ptModToWrite.push([ptModValues[i][0] === "" || ptModValues[i][0] === null ? 0 : ptModValues[i][0]]);
    perfModToWrite.push([perfModValues[i][0] === "" || perfModValues[i][0] === null ? 0 : perfModValues[i][0]]);
    chemToWrite.push([chemValues[i][0] === "" || chemValues[i][0] === null ? 0 : chemValues[i][0]]);

    // Direction uses VLOOKUP formula (will be set separately)
    dirToWrite.push([dirValues[i][0] === "" || dirValues[i][0] === null ? 0 : dirValues[i][0]]);
  }

  // Write manual columns (batch operations)
  sheet.getRange(startRow, cols.COL_DRAFT_VALUE, numRows, 1).setValues(draftToWrite);
  sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).setValues(tsModToWrite);
  sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).setValues(ptModToWrite);
  sheet.getRange(startRow, cols.COL_PERF_MOD, numRows, 1).setValues(perfModToWrite);
  sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).setValues(chemToWrite);

  // Add VLOOKUP formulas for Direction column
  for (var i = 0; i < numRows; i++) {
    var row = startRow + i;
    // VLOOKUP to Team Direction table (will be created at bottom)
    // Format: =IFERROR(VLOOKUP(B{row},TeamDirectionRange,2,FALSE),0)
    // We'll set this after creating the Team Direction table
    sheet.getRange(row, cols.COL_DIRECTION).setFormula("=IF(B" + row + "=\"\",0,IFERROR(VLOOKUP(B" + row + ",TeamDirection,2,FALSE),0))");
  }

  // Apply colors to manual input columns (batch operations)
  sheet.getRange(startRow, cols.COL_DRAFT_VALUE, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.MODIFIER);
  sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.MODIFIER);
  sheet.getRange(startRow, cols.COL_PERF_MOD, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.MODIFIER);
  sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  sheet.getRange(startRow, cols.COL_DIRECTION, numRows, 1).setBackground("#e8f4f8"); // Light blue for VLOOKUP

  // Center-align manual input columns
  sheet.getRange(startRow, cols.COL_DRAFT_VALUE, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_TS_MOD, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_PT_MOD, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_PERF_MOD, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).setHorizontalAlignment("center");
  sheet.getRange(startRow, cols.COL_DIRECTION, numRows, 1).setHorizontalAlignment("center");

  // Add data validation
  // V2 CHANGE: No validation on modifier columns

  // Draft Value validation (1-8 or blank)
  var draftRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(1, 8)
    .setAllowInvalid(true)  // Allow blank
    .setHelpText("Enter draft round (1-8) or leave blank")
    .build();

  var chemistryRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(0, 20)
    .setAllowInvalid(false)
    .setHelpText("Enter a value between 0 and 20")
    .build();

  sheet.getRange(startRow, cols.COL_DRAFT_VALUE, numRows, 1).setDataValidation(draftRule);
  sheet.getRange(startRow, cols.COL_CHEMISTRY, numRows, 1).setDataValidation(chemistryRule);

  // Direction is VLOOKUP - no validation needed
}

/**
 * Add postseason section, Team Direction table, and instructions at bottom of sheet
 * V2: Adds Team Direction table
 * RESTORED: Previously entered postseason and direction data
 */
function addBottomSections(sheet, playerCount, existingPostseasonData, existingDirectionData) {
  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  var sectionStartRow = dataStartRow + playerCount + RETENTION_CONFIG.OUTPUT.INSTRUCTIONS_ROW_OFFSET;

  // ===== TEAM DIRECTION TABLE (NEW IN V2) =====
  var directionStartRow = sectionStartRow;

  sheet.getRange(directionStartRow, 1)
    .setValue(RETENTION_CONFIG.TEAM_DIRECTION_TABLE.HEADER_TEXT)
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);

  sheet.getRange(directionStartRow, 1, 1, 2).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);

  // Description row
  sheet.getRange(directionStartRow + 1, 1)
    .setValue(RETENTION_CONFIG.TEAM_DIRECTION_TABLE.DESCRIPTION)
    .setFontSize(9)
    .setFontStyle("italic")
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  sheet.getRange(directionStartRow + 1, 1, 1, 4).merge();

  // Column headers
  sheet.getRange(directionStartRow + 2, 1, 1, 2)
    .setValues([["Team", "Direction Score (0-20)"]])
    .setFontWeight("bold")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER)
    .setHorizontalAlignment("center");

  // Restore existing direction data or create blank template
  var directionDataStart = directionStartRow + 3;

  if (existingDirectionData && existingDirectionData.length > 0) {
    // Restore preserved data
    sheet.getRange(directionDataStart, 1, existingDirectionData.length, 2).setValues(existingDirectionData);
    Logger.log("Restored " + existingDirectionData.length + " rows of Team Direction data");
  } else {
    // Create blank template for 8 teams
    for (var i = 0; i < 8; i++) {
      sheet.getRange(directionDataStart + i, 1).setValue("");
      sheet.getRange(directionDataStart + i, 2).setValue(10);  // Default to 10
    }
  }

  // Apply formatting
  sheet.getRange(directionDataStart, 1, 8, 2).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);
  sheet.getRange(directionDataStart, 2, 8, 1).setHorizontalAlignment("center");

  // Add data validation for direction scores
  var directionRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(0, 20)
    .setAllowInvalid(false)
    .setHelpText("Enter a direction score between 0 and 20")
    .build();

  sheet.getRange(directionDataStart, 2, 8, 1).setDataValidation(directionRule);

  // Create named range for VLOOKUP
  var directionRange = sheet.getRange(directionDataStart, 1, 8, 2);
  sheet.getParent().setNamedRange("TeamDirection", directionRange);

  Logger.log("Created Team Direction table with named range at rows " + directionDataStart + "-" + (directionDataStart + 7));

  // ===== POSTSEASON INPUT SECTION =====
  var postseasonStartRow = directionDataStart + 10;

  sheet.getRange(postseasonStartRow, 1)
    .setValue(RETENTION_CONFIG.POSTSEASON_SEARCH_TEXT + " (Manual Input)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);

  sheet.getRange(postseasonStartRow, 1, 1, 2).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER);

  // Column headers
  sheet.getRange(postseasonStartRow + 1, 1, 1, 2)
    .setValues([["Team", "Finish"]])
    .setFontWeight("bold")
    .setBackground(RETENTION_CONFIG.OUTPUT.COLORS.HEADER)
    .setHorizontalAlignment("center");

  // Restore existing postseason data or create blank template
  var postseasonDataStart = postseasonStartRow + 2;

  if (existingPostseasonData && existingPostseasonData.length > 0) {
    // Restore preserved data
    sheet.getRange(postseasonDataStart, 1, existingPostseasonData.length, 2).setValues(existingPostseasonData);
    Logger.log("Restored " + existingPostseasonData.length + " rows of postseason data");
  } else {
    // Create blank template
    for (var i = 0; i < 8; i++) {
      sheet.getRange(postseasonDataStart + i, 1).setValue("");
      sheet.getRange(postseasonDataStart + i, 2).setValue("");
    }
  }

  // Apply formatting
  sheet.getRange(postseasonDataStart, 1, 8, 2).setBackground(RETENTION_CONFIG.OUTPUT.COLORS.EDITABLE);

  // ===== INSTRUCTIONS SECTION =====
  var instructionsRow = postseasonDataStart + 10;

  // Main instruction
  sheet.getRange(instructionsRow, 1)
    .setValue("INSTRUCTIONS V2: (1) Enter Team Direction scores in table above - all players on same team inherit this score via VLOOKUP. " +
              "(2) Enter postseason results (Team | Finish: 1-8 or text like 'Champion'). " +
              "(3) Run 'Calculate Retention Grades v2' from menu to update scores. " +
              "(4) Edit yellow cells: Draft Value (Col C), Chemistry (Col N). " +
              "(5) Edit blue cells: Modifiers (Cols E, H, K) - no validation, enter any value. " +
              "(6) Final grades auto-calculate in Column Q using weighted formula: (TS*0.18 + PT*0.32 + Perf*0.17)*5 + (Chem*0.12 + Dir*0.21)*5.")
    .setFontStyle("italic")
    .setFontSize(9)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setBackground("#f0f0f0");

  sheet.getRange(instructionsRow, 1, 1, 10).merge();

  // Design notes
  sheet.getRange(instructionsRow + 2, 1)
    .setValue("DESIGN NOTE V2: Weighted grading replaces additive system. " +
              "Auto-flagging detects flight risk: Elite players (top 25%) on 7th-8th place teams get -4 performance penalty, " +
              "good players (top 40%) on 5th-8th place teams get -2 penalty. " +
              "Draft expectations (future): High picks (1-3) expected 75th %ile, low picks (4-8) expected 45th %ile. " +
              "Team Direction replaces per-player Direction input - one score per team via VLOOKUP.")
    .setFontStyle("italic")
    .setFontSize(8)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setBackground("#e8f4f8");

  sheet.getRange(instructionsRow + 2, 1, 1, 10).merge();
}

/**
 * Apply color coding to final grade column based on values
 */
function applyFinalGradeFormatting(sheet, startRow, numRows) {
  var finalGradeCol = RETENTION_CONFIG.OUTPUT.COL_FINAL_GRADE;
  var finalGrades = sheet.getRange(startRow, finalGradeCol, numRows, 1).getValues();

  for (var i = 0; i < finalGrades.length; i++) {
    var finalGrade = finalGrades[i][0];

    if (typeof finalGrade === 'number' && !isNaN(finalGrade)) {
      var color = RETENTION_CONFIG.getGradeColor(finalGrade);
      sheet.getRange(startRow + i, finalGradeCol).setBackground(color);
    }
  }
}

/**
 * REBUILD SHEET: Force full rebuild of formatting
 * V2: Preserves Team Direction data
 */
function rebuildRetentionSheet() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Rebuild Sheet Formatting v2',
    'This will rebuild the Retention Grades sheet from scratch, removing any custom formatting.\n\n' +
    'Player data and manual entries (Draft Value, Chemistry, Modifiers, Team Direction) will be preserved.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);

  if (sheet) {
    sheet.getRange(RETENTION_CONFIG.OUTPUT.HEADER_ROW, 1).clearContent();
  }

  calculateRetentionGrades();

  ui.alert('Sheet rebuilt successfully with v2 layout!');
}

/**
 * Refresh formulas in the retention sheet
 * V2: Uses weighted formulas
 */
function refreshRetentionFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RETENTION_GRADES_SHEET);

  if (!sheet) {
    SpreadsheetApp.getUi().alert("Retention Grades sheet not found. Please run 'Calculate Retention Grades' first.");
    return;
  }

  var lastRow = sheet.getLastRow();
  var dataStartRow = RETENTION_CONFIG.OUTPUT.DATA_START_ROW;
  var cols = RETENTION_CONFIG.OUTPUT;

  if (lastRow < dataStartRow) {
    SpreadsheetApp.getUi().alert("No data found. Please run 'Calculate Retention Grades' first.");
    return;
  }

  var rowsUpdated = 0;
  for (var row = dataStartRow; row <= lastRow; row++) {
    var playerName = sheet.getRange(row, 1).getValue();
    if (!playerName || playerName === "") continue;

    // TS Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_TS_TOTAL).setFormula("=MIN(20,MAX(0,D" + row + "+E" + row + "))");

    // PT Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_PT_TOTAL).setFormula("=MIN(20,MAX(0,G" + row + "+H" + row + "))");

    // Performance Total = Base + Modifier (capped 0-20)
    sheet.getRange(row, cols.COL_PERF_TOTAL).setFormula("=MIN(20,MAX(0,J" + row + "+K" + row + "))");

    // Manual Total = 12% Chemistry + 21% Direction (weighted)
    sheet.getRange(row, cols.COL_MANUAL_TOTAL).setFormula("=ROUND(N" + row + "*0.12+O" + row + "*0.21,1)");

    // Direction = VLOOKUP from Team Direction table
    sheet.getRange(row, cols.COL_DIRECTION).setFormula("=IF(B" + row + "=\"\",0,IFERROR(VLOOKUP(B" + row + ",TeamDirection,2,FALSE),0))");

    // Final Grade = Weighted formula × 5 for d100 scale
    sheet.getRange(row, cols.COL_FINAL_GRADE).setFormula(
      "=ROUND((F" + row + "*0.18+I" + row + "*0.32+L" + row + "*0.17)*5+P" + row + ",0)"
    );

    rowsUpdated++;
  }

  if (rowsUpdated > 0) {
    applyFinalGradeFormatting(sheet, dataStartRow, rowsUpdated);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Formulas refreshed for " + rowsUpdated + " players using v2 weighted system",
    "✅ Refresh Complete",
    5
  );
}

/**
 * Find Team Direction section in sheet
 * Returns row number of header, or -1 if not found
 */
function findTeamDirectionSection(sheet) {
  try {
    var lastRow = sheet.getLastRow();
    var searchRange = sheet.getRange(1, 1, lastRow, 1).getValues();

    for (var i = 0; i < searchRange.length; i++) {
      var cellValue = String(searchRange[i][0]);
      if (cellValue.indexOf(RETENTION_CONFIG.TEAM_DIRECTION_TABLE.SEARCH_TEXT) >= 0) {
        return i + 1;
      }
    }
  } catch (e) {
    Logger.log("Error finding Team Direction section: " + e.toString());
  }

  return -1;
}

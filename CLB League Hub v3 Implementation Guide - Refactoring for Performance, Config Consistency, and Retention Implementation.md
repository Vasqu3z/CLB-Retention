Here is the comprehensive Implementation Guide for refactoring the CLB League Hub and Retention script suites into a single, high-performance v3 system.

-----

### **Project: CLB v3 Full-Suite Refactor**

**Goal:** To refactor the `League` and `Retention` script suites into a single, cohesive system. The v3 architecture will prioritize:

1.  **Maintainability:** 100% of structural layouts, sheet names, and column maps will be centralized in configuration files (`LeagueConfig.js`, `RetentionConfig_v2.js`). All "magic numbers" will be eliminated.
2.  **Performance:** All redundant I/O (Input/Output) will be removed. All N+1 loops (e.g., `setFormula` in a loop) will be converted to batch operations (e.g., `setFormulas`). Expensive processes will be cached.
3.  **"Smart Update" Logic:** All `sheet.clear()` calls that destroy user formatting will be replaced with "Targeted Clear" operations, preserving the sheet's integrity while handling dynamic data.
4.  **Decoupled Workflow:** The League `UpdateAll` will be the system's "engine," running frequently and caching its final data. The Retention "analysis" will be a separate, manually-triggered process that *reads from this cache*, ensuring it uses final data and does not perform redundant I/O.

### Phase 1: Foundational Configuration & Code Consolidation

**Goal:** Establish a "Single Source of Truth" for all configurations and consolidate all utility functions.

  * **Task 1.1: Merge Stats Column Maps**

      * **Action:** Move the `HITTING_COLUMNS`, `PITCHING_COLUMNS`, and `FIELDING_COLUMNS` objects from `RetentionConfig_v2.js` into `LeagueConfig.js`.
      * **Action:** Place them inside a new parent object: `CONFIG.STATS_COLUMN_MAPS`.
      * **Action:** Refactor all code in `LeagueUtility.js` (e.g., `getLeagueLeaders`) that uses hardcoded indices (like `[15]` for OPS) to read from this new `CONFIG.STATS_COLUMN_MAPS` object.

  * **Task 1.2: Create `CONFIG.SHEET_STRUCTURE` (League)**

      * **Action:** In `LeagueConfig.js`, create a new top-level object: `CONFIG.SHEET_STRUCTURE`.
      * **Action:** Populate this object with sub-objects defining the *exact* layout of all League-side output sheets, replacing all "magic numbers."
      * **Example (for `LeagueTeamStats.js`):**
        ```javascript
        CONFIG.SHEET_STRUCTURE = {
          // ...
          TEAM_STATS_SHEET: {
            DATA_START_ROW: 2,
            TEAM_NAME_COL: 1,
            GPWL_START_COL: 3,        // Replaces hardcoded '3'
            HITTING_START_COL: 6,     // Replaces hardcoded '6'
            PITCHING_START_COL: 15,   // Replaces hardcoded '15'
            FIELDING_START_COL: 22    // Replaces hardcoded '22'
          },
          LEAGUE_HUB: {
            STANDINGS: { START_COL: 1, NUM_COLS: 8 },
            LEADERS_BATTING: { START_COL: 10 },
            LEADERS_PITCHING: { START_COL: 12 },
            LEADERS_FIELDING: { START_COL: 14 }
          }
          // ... Add layouts for PLAYER_STATS_SHEET, TEAM_SHEETS, and LEAGUE_SCHEDULE
        };
        ```

  * **Task 1.3: Create `RETENTION_CONFIG.SHEET_STRUCTURE` (Retention)**

      * **Action:** In `RetentionConfig_v2.js`, create a new top-level object: `RETENTION_CONFIG.SHEET_STRUCTURE`.
      * **Action:** Populate this object to abstract all Retention-specific layouts.
      * **Example Layouts:**
        ```javascript
        RETENTION_CONFIG.SHEET_STRUCTURE = {
          INPUT_SOURCES: {
            // Replaces hardcoded getRange(4, 1, 8, 2) in RetentionCore_v2.js
            LEAGUE_HUB_STANDINGS: { START_ROW: 4, START_COL: 1, NUM_ROWS: 8, NUM_COLS: 2 }
          },
          OUTPUT_LAYOUT: {
            // Replaces hardcoded header array in RetentionSheet_v2.js
            HEADERS: ["Player", "Team", "Draft/Trade\nValue (1-8)", /* ...etc */]
          },
          SEARCH_LOGIC: {
            // Replaces hardcoded '1' in findPostseasonSection
            SECTION_HEADER_SEARCH_COL: 1
          }
        };
        ```

  * **Task 1.4: Consolidate Utility Files**

      * **Action:** Move all generic helper functions (`getOrdinalSuffix`, `findPlayerIndex`, `calculatePercentile`, `logError`, `logInfo`, etc.) from `RetentionHelpers_v2.js` into `LeagueUtility.js`.
      * **Action:** Delete the `RetentionHelpers_v2.js` file. All scripts should now reference `LeagueUtility.js` for these functions.

### Phase 2: Refactor the Data Engine (Game Processor)

**Goal:** Fix the core data ingestion to be 100% config-driven, reliable, and efficient.

  * **Task 2.1: Fix the "Rogue" Game Processor**
      * **Action:** **DELETE** the entire `readCompleteGameData` function from `LeagueGameProcessor.js`. It ignores the config and is the source of all offset errors.
  * **Task 2.2: Implement Config-Driven I/O**
      * **Action:** In `processAllGameSheetsOnce()`, replace the deleted call with new, explicit, config-driven `getRange()` calls. **This is critical:** use a `+ 1` offset from header rows to read *only* data.
      * **Example (in `processAllGameSheetsOnce`):**
        ```javascript
        // OLD: var gameData = readCompleteGameData(sheet);

        // NEW:
        var hittingStartRow = CONFIG.BOX_SCORE_HITTING_START_ROW + 1; // +1 to skip header
        var hittingData = sheet.getRange(
          hittingStartRow,
          CONFIG.BOX_SCORE_HITTING_START_COL,
          CONFIG.BOX_SCORE_HITTING_NUM_ROWS - 1, // We are reading 1 fewer row
          CONFIG.BOX_SCORE_HITTING_NUM_COLS
        ).getValues();

        // ... repeat for Pitching, W/L/S data, etc., all using CONFIG variables
        ```
  * **Task 2.3: Update Data Consumers**
      * **Action:** Refactor `processPlayerStatsFromData` to use the new `CONFIG.STATS_COLUMN_MAPS` (from Task 1.1) instead of brittle array indices (e.g., `[s + 1]`).

### Phase 3: Implement "Smart Update" & Batching

**Goal:** Eliminate all `sheet.clear()` calls and N+1 formatting loops to maximize performance and preserve user formatting.

  * **Task 3.1: Implement "Targeted Clear" (The `clear()` fix)**

      * **Action:** **REMOVE** the `standingsSheet.clear()` call from `updateLeagueHubFromCache`.
      * **Action:** **REMOVE** the `scheduleSheet.clear()` call from `createLeagueScheduleSheetFromCache`.
      * **Action:** **REPLACE** these with "Targeted Clear" logic at the *start* of the functions. This clears all content, format, and notes *only* in the data-managed columns, from the data row to the bottom, preserving user formatting elsewhere.
      * **Example (for `LeagueHub.js`):**
        ```javascript
        var layout = CONFIG.SHEET_STRUCTURE.LEAGUE_HUB;
        var dataStartRow = 3; // Or from config

        // Clear Standings zone (Cols A-H)
        standingsSheet.getRange(dataStartRow, layout.STANDINGS.START_COL, 
                                standingsSheet.getMaxRows() - dataStartRow + 1, 
                                layout.STANDINGS.NUM_COLS)
             .clearContent().clearFormat().clearNote();

        // Clear Batting Leaders zone (Col J)
        standingsSheet.getRange(dataStartRow, layout.LEADERS_BATTING.START_COL, 
                                standingsSheet.getMaxRows() - dataStartRow + 1, 1)
             .clearContent().clearFormat().clearNote();

        // ... repeat for Pitching and Fielding leader zones ...
        ```

  * **Task 3.2: Batch Formulas & Validation (N+1 Fix)**

      * **Action:** Refactor `writePlayerData` (`RetentionCore_v2.js`) and `applyDataFormatting` (`RetentionSheet_v2.js`).
      * **Action:** Modify all loops that call `setFormula()` or `setDataValidation()`.
        1.  Create empty arrays (e.g., `var formulaArray = [];`, `var validationArray = [];`).
        2.  Inside the loop, `.push()` the formula string or rule object into the array.
        3.  *After* the loop, call `range.setFormulas(formulaArray)` and `range.setDataValidations(validationArray)` *once*.

  * **Task 3.3: Batch Formatting & RichText (N+1 Fix)**

      * **Action:** Refactor all N+1 formatting loops in `LeagueTeamSheets.js`, `LeagueHub.js`, and `LeagueSchedule.js` (e.g., the "Recent Results" loops).
      * **Action:** Implement a **3-Pass Batch System:**
        1.  **Pass 1 (Build):** Inside the loop, build arrays for `values`, `backgrounds`, and `fontWeights`.
        2.  **Pass 2 (Batch Write):** *After* the loop, call `range.setValues()`, `range.setBackgrounds()`, and `range.setFontWeights()` once.
        3.  **Pass 3 (RichText):** Run a final, minimal loop *only* to apply `setRichTextValue()` or `setLinkUrl()` to the specific cells that need them.

### Phase 4: Final Integration & Workflow Decoupling

**Goal:** Implement the "once-per-season" Retention workflow, making it read from a persistent cache created by the League "engine."

  * **Task 4.1: Persist Final Season Data**

      * **Action:** In `LeagueCore.js`, at the very end of the `updateAll()` function (after the final toast/log), add logic to persist the `gameData` object.
      * **Action:** Use `PropertiesService` for this. Store only the necessary, processed data.
        ```javascript
        // End of updateAll()
        var finalSeasonData = {
          playerStats: gameData.playerStats,
          teamStatsWithH2H: gameData.teamStatsWithH2H
        };
        PropertiesService.getScriptProperties().setProperty('FINAL_SEASON_DATA', JSON.stringify(finalSeasonData));
        logInfo("Update All", "Final season data has been cached for Retention analysis.");
        ```

  * **Task 4.2: Create Manual Retention Trigger**

      * **Action:** In `LeagueCore.js` (`onOpen`), add a new menu for the manual, end-of-season process.
        ```javascript
        // In onOpen()
        ui.createMenu('Retention Grades')
          .addItem('🚀 Calculate Final Grades v3', 'calculateFinalRetentionGrades')
          .addToUi();
        ```

  * **Task 4.3: Create Retention Controller Function**

      * **Action:** In a new file (or `LeagueCore.js`), create the new controller function `calculateFinalRetentionGrades()`.
      * **Action:** This function must:
        1.  Display a `ui.alert` to confirm the user wants to run this high-stakes, once-per-season process.
        2.  `varjsonData = PropertiesService.getScriptProperties().getProperty('FINAL_SEASON_DATA');`
        3.  Check if `jsonData` is null. If so, alert the user to run `Update All` first.
        4.  `var loadedGameData = JSON.parse(jsonData);`
        5.  Call the main Retention function, passing this in-memory data: `calculateRetentionGrades(loadedGameData);`

  * **Task 4.4: Refactor `calculateRetentionGrades` (The I/O Bypass)**

      * **Action:** Modify `calculateRetentionGrades` in `RetentionCore_v2.js` to accept the new parameter: `function calculateRetentionGrades(loadedGameData)`.
      * **Action:** **DELETE** the function calls to `getPlayerData()` and `calculateLeaguePercentiles()` from inside this function.
      * **Action:** **REPLACE** their data sources with the passed-in object.
      * **Example:**
        ```javascript
        // OLD:
        // var playerData = getPlayerData();
        // var leagueStats = calculateLeaguePercentiles();

        // NEW:
        var playerData = loadedGameData.playerStats; // Use the cached data
        var leagueStats = calculateLeaguePercentilesFromMemory(playerData); // A new, refactored function
        ```
      * **Action:** Refactor `calculateLeaguePercentiles` to `calculateLeaguePercentilesFromMemory`, which accepts the `playerData` object as an argument and performs no I/O (as planned in **Task 2.3** / **Task 5.1** from previous plans).

### Phase 5: Cleanup & Deprecation

**Goal:** Remove all unused legacy code and menu items to finalize the v3 suite.

  * **Task 5.1: Delete Legacy Wrapper Functions**

      * **Action:** **DELETE** all deprecated wrapper functions that were only for the old menu structure:
          * `updateAllPlayerStats`
          * `updateAllTeamStats`
          * `updateTeamSheets`
          * `updateLeagueHub` and `updateStandingsAndScoreboard`
          * `updateLeagueSchedule`, `generateLeagueSchedulePage`, `createLeagueScheduleSheet`

  * **Task 5.2: Prune the Main Menu**

      * **Action:** In `LeagueCore.js` (`onOpen`), **REMOVE** all menu items that pointed to the now-deleted functions (e.g., "Step 1: Update All Player Stats", "Step 2: ...", etc.).
      * **Action:** The final menu should be clean, containing only "🚀 Update All" and the other high-level functions like "Recalculate All Formulas" and the new "Retention Grades" menu.
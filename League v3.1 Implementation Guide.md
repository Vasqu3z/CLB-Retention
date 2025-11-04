### The "Gold Standard" Principles

All refactoring must adhere to these four principles:

1.  **P1 (Performance): Read Once, Write Once.** All I/O (Input/Output) with `SpreadsheetApp` must be batched. There will be **no** `.getValue()`, `.setValue()`, or `.setFormula()` calls inside loops. Data must be read into memory, processed, and written back in as few operations as possible.
2.  **P2 (Configurability): No Magic Numbers.** All sheet names, row/column indices, ranges, and logical thresholds *must* be defined in and read from the `LeagueConfig.js` or `RetentionConfig.js` files. All column indices in config files *must* be **0-based** to eliminate all `[col - 1]` offsets in the code.
3.  **P3 (Data Flow): In-Memory Orchestration.** The central `updateAll` function is the single source of truth for data flow. It calls `processAllGameSheetsOnce()` to create an in-memory `gameData` object. This *one object* must be passed to all subsequent update functions (`...FromCache`), which must *only* use this in-memory data, not re-read from the spreadsheet.
4.  **P4 (Commenting): Professional & Structural.** Comments must be clean, standardized, and structural. They must provide JSDoc context and high-level section guidance, not explain obvious code.

-----

### Part 1: Global Commenting Standard (P4)

Apply this standard to *every* `.js` and `.html` file.

1.  **File Headers:** Every `.js` file must begin with this 4-line header, replacing placeholder text.

    ```javascript
    // ===== {MODULE_NAME_IN_CAPS} =====
    // Purpose: {Brief, one-line description of the file's responsibility.}
    // Dependencies: {Key config files or modules, e.g., LeagueConfig.js, RetentionConfig.js}
    // Entry Point(s): {Primary function(s) called from other modules, e.g., updateAllPlayerStatsFromCache}
    ```

2.  **Section Headers:** Use `// ===== {SECTION_NAME_IN_CAPS} =====` to break up files logically (e.g., `// ===== DATA INITIALIZATION =====`, `// ===== HELPER FUNCTIONS =====`).

3.  **Function Headers (JSDoc):** All functions, except for trivial private helpers, must have a JSDoc header.

    ```javascript
    /**
     * {Brief description of what the function does.}
     * @param {object} playerStats - The playerStats object from the master gameData.
     * @param {object} teamStats - The teamStats object from the master gameData.
     * @returns {object} An object containing league-wide percentile arrays.
     */
    function calculateLeaguePercentilesFromCache(playerStats, teamStats) { ... }
    ```

4.  **Comment Cleanup:**

      * **REMOVE** all "Captain Obvious" comments (e.g., `// Loop through players`, `// Increment i`, `// Get player order from sheet`).
      * **REMOVE** all deprecated/legacy comments (e.g., `// ===== OLD: Legacy function...`, `// DEPRECATED...`). The refactor makes these obsolete.
      * **REMOVE** all conversational notes (e.g., `// This function is now just a wrapper...`, `// Not used anymore`, `// 3-Pass Batch System for Rich Text`).
      * **KEEP** and **CLEAN** comments that explain *why* a complex piece of logic exists (e.g., `// +1 for header skip, -3 for batch offset` should be kept *until* that function is refactored, at which point it becomes obsolete).

-----

### Part 2: Global Coding & Naming Standards

Apply these changes to all files listed.

1.  **Variable Naming Conventions:** The use of short, single-letter variables (`g`, `p`, `t`, `ss`) is inconsistent with the "Retention" suite standard.

      * **Rule:** Use descriptive names for loop iterators and common objects.
      * **Action:** Refactor all "Core" and "Comparison" modules (`LeagueGames.js`, `LeaguePlayerStats.js`, `LeagueTeamStats.js`, `LeagueUtility.js`, `PlayerComparison.js`).
      * **Example:**
          * `for (var g = 0; ...)` becomes `for (var gameIndex = 0; ...)`.
          * `var ss = SpreadsheetApp.getActiveSpreadsheet();` becomes `var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();`.
          * `for (var p = 0; ...)` becomes `for (var playerIndex = 0; ...)`.

2.  **Logging Standardization:** The suite has two logging systems (`Logger.log()` vs. `logError()`). Standardize on the "Retention" model.

      * **Rule:** Use the native `Logger.log()` conditionally, controlled by a `DEBUG` flag in the config.
      * **Action (in `LeagueConfig.js`):** Add a new `DEBUG` object.
        ```javascript
        var CONFIG = {
          // ... all other config ...
          DEBUG: {
            ENABLE_LOGGING: true
          }
        };
        ```
      * **Action (in all other files):** Replace all calls to `logError(step, msg, entity)`, `logInfo(step, msg)`, and `logWarning(step, msg, entity)` with the new standard.
      * **Example (Before):**
        ```javascript
        logError("Step 1", "Sheet not found", CONFIG.PLAYER_STATS_SHEET);
        ```
      * **Example (After):**
        ```javascript
        if (CONFIG.DEBUG.ENABLE_LOGGING) {
          Logger.log("ERROR [Step 1]: Sheet not found (Entity: " + CONFIG.PLAYER_STATS_SHEET + ")");
        }
        ```
      * This change makes the logging functions in `LeagueUtility.js` obsolete.

-----

### Part 3: Configuration File Refactor (P2)

This is the most critical step and *must* be completed before refactoring other modules.

**File:** `LeagueConfig.js`

1.  **Task: Convert ALL column definitions to 0-based indexing.**

      * **Why:** To eliminate all `[col - 1]` magic offsets from the entire codebase.
      * **Action:** Go through every column definition in `STATS_COLUMN_MAPS` and `SHEET_STRUCTURE`. Change all values to be 0-based and update the comment to show the 1-based number for user reference.
      * **Example (Before):**
        ```javascript
        STATS_COLUMN_MAPS: {
          HITTING_COLUMNS: {
            PLAYER_NAME: 1,    // Column A
            TEAM: 2,           // Column B
        ```
      * **Example (After):**
        ```javascript
        STATS_COLUMN_MAPS: {
          HITTING_COLUMNS: {
            PLAYER_NAME: 0,    // Column A (1)
            TEAM: 1,           // Column B (2)
        // ... apply to all column definitions in the file ...
        ```

2.  **Task: Add Missing Definitions.** Add the following definitions to `LeagueConfig.js` to support the refactor.

      * **Add `BOX_SCORE_MASTER_RANGE`:**

        ```javascript
        BOX_SCORE_MASTER_RANGE: "B3:R50",
        ```

      * **Add/Update `PLAYER_STATS_SHEET` Layout (use 0-based indices):**

        ```javascript
        PLAYER_STATS_SHEET: {
          HEADER_ROW: 1,
          DATA_START_ROW: 2,
          PLAYER_NAME_COL: 0, // Column A (1)
          TEAM_NAME_COL: 1,   // Column B (2)
          DATA_START_COL: 2,  // Column C (3) - First stat (GP)
          TOTAL_STAT_COLUMNS: 23 // GP (1) + Hitting (9) + WLS (3) + Pitching (7) + Fielding (3)
        },
        ```

      * **Add/Update `TEAM_SHEETS` Layout (use 0-based indices):**

        ```javascript
        TEAM_SHEETS: {
          HEADER_ROW: 1,
          DATA_START_ROW: 2,
          PLAYER_COL_WIDTH: 175,
          STANDINGS_START_ROW: 4,
          STANDINGS_START_COL: 16, // Column Q (17)
          STANDINGS_NUM_COLS: 7,
          SCHEDULE_START_COL: 16, // Column Q (17)
          SCHEDULE_NUM_COLS: 7
        },
        ```

      * **Add `PLAYER_COMPARISON` Layout (use 0-based indices):**

        ```javascript
        // Add this to the end of the SHEET_STRUCTURE object
        PLAYER_COMPARISON: {
          // Maps stat keys to their 0-based index in the Hitting sheet
          HITTING_MAP: {
            team: 1, gp: 2, ab: 3, h: 4, hr: 5, rbi: 6, bb: 7, k: 8,
            rob: 9, dp: 10, tb: 11, avg: 12, obp: 13, slg: 14, ops: 15
          },
          // Maps stat keys to their 0-based index in the Pitching sheet
          PITCHING_MAP: {
            gp: 2, w: 3, l: 4, sv: 5, era: 6, ip: 7, bf: 8, h: 9,
            hr: 10, r: 11, bb: 12, k: 13, baa: 14, whip: 15
          },
          // Maps stat keys to their 0-based index in the Fielding sheet
          FIELDING_MAP: {
            gp: 2, np: 3, e: 4, sb: 5
          }
        }
        ```

-----

### Part 4: Module-Specific Refactoring

Refactor each file to comply with all "Gold Standard" principles, using the now-updated 0-based config.

#### `LeagueGames.js`

  * **Principle Violation:** P2 (Magic positional offsets).
  * **Task:** Eliminate the fragile single-batch read and all magic offsets (`[36]`, `[0][0]`, `- 3`).
  * **Action:**
    1.  Remove the `var batchData = sheet.getRange("B3:R50").getValues();` line.
    2.  Replace it with discrete `.getRange()` calls for *each* data block, using the explicit `CONFIG.BOX_SCORE_...` variables. This eliminates all magic array indices.
  * **Example (After):**
    ```javascript
    // Read each section using its specific config object
    var teamInfo = sheet.getRange(CONFIG.BOX_SCORE_TEAM_INFO).getValues();
    var awayTeam = String(teamInfo[0][0]).trim(); // B3
    var homeTeam = String(teamInfo[1][0]).trim(); // B4
    // ...
    var hittingData = sheet.getRange(
      CONFIG.BOX_SCORE_HITTING_START_ROW,
      CONFIG.BOX_SCORE_HITTING_START_COL,
      CONFIG.BOX_SCORE_HITTING_NUM_ROWS,
      CONFIG.BOX_SCORE_HITTING_NUM_COLS
    ).getValues();
    // ...
    var team1Totals = sheet.getRange(CONFIG.BOX_SCORE_TEAM1_TOTALS).getValues()[0];
    var team2Totals = sheet.getRange(CONFIG.BOX_SCORE_TEAM2_TOTALS).getValues()[0];
    // ... apply this pattern to all data reads in this function ...
    ```

#### `LeaguePlayerStats.js`

  * **Principle Violation:** P2 (Magic numbers).
  * **Task:** Use the new 0-based `PLAYER_STATS_SHEET` layout object.
  * **Example (Before):**
    ```javascript
    var playerNamesData = playerStatsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    // ...
    playerStatsSheet.getRange(2, 3, numPlayers, 23).setValues(allPlayerData);
    ```
  * **Example (After):**
    ```javascript
    var layout = CONFIG.SHEET_STRUCTURE.PLAYER_STATS_SHEET;
    var playerNamesData = playerStatsSheet.getRange(
      layout.DATA_START_ROW, 
      layout.PLAYER_NAME_COL, 
      lastRow - layout.HEADER_ROW, 
      1
    ).getValues();
    // ...
    playerStatsSheet.getRange(
      layout.DATA_START_ROW, 
      layout.DATA_START_COL, 
      numPlayers, 
      layout.TOTAL_STAT_COLUMNS
    ).setValues(allPlayerData);
    ```

#### `LeagueRankings.js` & `LeagueSchedule.js`

  * **Principle Violation:** P2 (Magic numbers).
  * **Task:** Replace all hardcoded column numbers (`10`, `12`, `14`) with their `CONFIG` counterparts.
  * **Example (Before):**
    ```javascript
    standingsSheet.getRange(currentRow, 10).setValue("League Leaders (Batting)");
    standingsSheet.setColumnWidth(10, 300);
    ```
  * **Example (After):**
    ```javascript
    var layout = CONFIG.SHEET_STRUCTURE.LEAGUE_HUB;
    standingsSheet.getRange(currentRow, layout.LEADERS_BATTING.START_COL).setValue("League Leaders (Batting)");
    standingsSheet.setColumnWidth(layout.LEADERS_BATTING.START_COL, layout.LEADERS_BATTING.WIDTH);
    // ... apply this to all hardcoded layout numbers in both files ...
    ```

#### `LeagueTeamSheets.js`

  * **Principle Violation:** P3 (Data Flow) and P2 (Magic numbers).
  * **Task 1 (P3):** Refactor `updateTeamSheetsFromCache`. This function *must not* re-read stat sheets. It must use the `gameData.playerStats` object passed into `updateAll`.
      * **Action:** Remove all `.getSheetByName()` and `.getSheetDataWithHeaders()` calls for stat sheets. The function will now require `gameData.playerStats` and a `playerTeamMap` (generated once in `LeagueCore.js`). It must build its `teamHittingData`, `teamPitchingData`, etc., by iterating through the in-memory `playerStats` object.
  * **Task 2 (P2):** Refactor `addStandingsAndScheduleToTeamSheet`.
      * **Action:** Replace all hardcoded numbers (e.g., `standingsStartRow = 4;`, `standingsStartCol = 17;`) with variables from the 0-based `CONFIG.SHEET_STRUCTURE.TEAM_SHEETS` layout object.

#### `LeagueUtility.js`

  * **Principle Violation:** P2 (Magic offset).
  * **Task:** Refactor `filterAndSortTeamData` to remove the hardcoded "Team" column index.
  * **Action:** The function must accept `teamColumnIndex` as a parameter.
  * **Example (Before):**
    ```javascript
    function filterAndSortTeamData(allData, teamName, removeTeamColumn) {
      // ...
      if (String(allData[i][1]).trim() === teamName) {
        if (j !== 1) rowWithoutTeam.push(allData[i][j]);
    ```
  * **Example (After):**
    ```javascript
    function filterAndSortTeamData(allData, teamName, teamColumnIndex, removeTeamColumn) {
      // ...
      if (String(allData[i][teamColumnIndex]).trim() === teamName) {
        // ...
        if (j !== teamColumnIndex) rowWithoutTeam.push(allData[i][j]);
    ```

#### `RetentionSheet.js`

  * **Principle Violation:** P1 (Performance N+1 loop).
  * **Task:** Refactor `refreshRetentionFormulas` to use batch operations.
  * **Action:** Remove the `for` loop that calls `.setFormula()` repeatedly. Instead, create arrays (`postseasonFormulas`, `tsTotalFormulas`, etc.) *inside* a loop, then call `.setFormulas()` *once per array* after the loop.
  * **Example (After):**
    ```javascript
    var postseasonFormulas = [];
    var tsTotalFormulas = [];
    // ...
    for (var i = 0; i < numRows; i++) {
      var row = dataStartRow + i;
      postseasonFormulas.push(["=IF(B" + row + "..." ]);
      tsTotalFormulas.push(["=MIN(20,MAX(0,D" + row + "..." ]);
      // ...
    }
    sheet.getRange(dataStartRow, cols.COL_POSTSEASON, numRows, 1).setFormulas(postseasonFormulas);
    sheet.getRange(dataStartRow, cols.COL_TS_TOTAL, numRows, 1).setFormulas(tsTotalFormulas);
    // ...
    ```

#### `RetentionCore.js` & `RetentionFactors.js`

  * **Principle Violation:** P2 (Magic numbers and offsets).
  * **Task 1:** Refactor all data-access functions (`getStandingsData`, `getPostseasonData`, etc.) to use their respective `RETENTION_CONFIG` layout objects instead of hardcoded ranges (e.g., `hubSheet.getRange(4, 1, 8, 2)`).
  * **Task 2:** Remove all `[col - 1]` offsets. The 0-based config refactor (Part 3) makes them obsolete.
  * **Example (Before):**
    ```javascript
    var playerName = String(hittingData[i][cols.PLAYER_NAME - 1]).trim();
    ```
  * **Example (After):**
    ```javascript
    var playerName = String(hittingData[i][cols.PLAYER_NAME]).trim();
    ```

#### `PlayerComparison.js`

  * **Principle Violation:** P1 (Critical N+1 bottleneck) and P2 (Critical hardcoding).
  * **Task:** Complete rewrite of `getPlayerStats`.
  * **Action:**
    1.  Remove the entire function content.
    2.  Implement the "Read-Once, Map, Find" pattern:
        a.  Read the *entire* Hitting, Pitching, and Fielding stat sheets *once* each into three arrays.
        b.  Create a single `playerStatsMap = {}`.
        c.  Loop through the Hitting data. For each player, create an entry in the map (`playerStatsMap[playerName] = { ... }`). Use the **0-based** `CONFIG.SHEET_STRUCTURE.PLAYER_COMPARISON.HITTING_MAP` to map data (e.g., `gp: row[hMap.gp]`).
        d.  Loop through the Pitching and Fielding data, adding their stats to the *existing* entries in `playerStatsMap`.
        e.  Create a final `results = []` array. Loop through the *requested* `playerNames`, pull the corresponding object from `playerStatsMap`, and add it to `results`.
        f.  Return `results`.
  * This rewrite fixes the P1 and P2 violations simultaneously.
Here is a mini-implementation guide for the remaining steps.

You have successfully rebuilt the "engine" (`LeagueConfig.js` and `LeagueGameProcessor.js`). This next set of tasks involves installing that new engine into the "body" of the car—updating the scripts that users see (`LeagueHub.js`, `LeagueSchedule.js`) and adding the new integrations.

### Mini-Guide: Completing the League Hub v3 Refactor

#### 1\. Implement "Targeted Clear" (The `sheet.clear()` Fix)

This is the **highest priority task** to preserve your manual formatting.

  * **Goal:** Stop `LeagueHub.js` and `LeagueSchedule.js` from destroying your sheet on every run.

  * **Action (LeagueHub.js):**

    1.  Open `LeagueHub.js`.

    2.  Go to the `updateLeagueHubFromCache` function.

    3.  **Delete** this line: `standingsSheet.clear();`.

    4.  **Replace** it with this "Targeted Clear" logic, which uses your new config file:

        ```javascript
        // --- V3 TARGETED CLEAR ---
        // Get the layout structure from the config
        var hubLayout = CONFIG.SHEET_STRUCTURE.LEAGUE_HUB;
        var dataStartRow = 3; // Or from config if you add it

        // Clear only the Standings columns (e.g., A-H)
        standingsSheet.getRange(dataStartRow, hubLayout.STANDINGS.START_COL, 
                                standingsSheet.getMaxRows() - dataStartRow + 1, 
                                hubLayout.STANDINGS.NUM_COLS)
             .clearContent().clearFormat().clearNote();

        // Clear only the Batting Leaders columns (e.g., J-K)
        standingsSheet.getRange(dataStartRow, hubLayout.LEADERS_BATTING.START_COL, 
                                standingsSheet.getMaxRows() - dataStartRow + 1, 
                                hubLayout.LEADERS_BATTING.NUM_COLS)
             .clearContent().clearFormat().clearNote();

        // (Repeat for Pitching and Fielding leader columns)
        // --- END V3 CLEAR ---
        ```

  * **Action (LeagueSchedule.js):**

    1.  Open `LeagueSchedule.js`.

    2.  Go to `createLeagueScheduleSheetFromCache`.

    3.  **Delete** this line: `scheduleSheet.clear();`.

    4.  **Replace** it with a similar Targeted Clear for the schedule columns:

        ```javascript
        // --- V3 TARGETED CLEAR ---
        var scheduleLayout = CONFIG.SHEET_STRUCTURE.LEAGUE_SCHEDULE;
        var dataStartRow = 1; // Schedule starts at the top

        scheduleSheet.getRange(dataStartRow, scheduleLayout.START_COL, 
                               scheduleSheet.getMaxRows(), 
                               scheduleLayout.NUM_COLS)
             .clearContent().clearFormat().clearNote();
        // --- END V3 CLEAR ---
        ```

-----

#### 2\. Refactor for In-Memory Performance (Fix `getLeagueLeaders`)

  * **Goal:** Stop `LeagueUtility.js` from re-reading the stat sheets. We must use the `gameData.playerStats` object that the new engine *already* created.

  * **Action (LeagueCore.js):**

    1.  First, we must pass the `gameData` object to the Hub.
    2.  In `LeagueCore.js`, find the `updateAll` function.
    3.  **Change** this line:
          * **From:** `updateLeagueHubFromCache(teamStatsWithH2H, scheduleData);`
          * **To:** `updateLeagueHubFromCache(gameData);`

  * **Action (LeagueHub.js):**

    1.  In `LeagueHub.js`, find the `updateLeagueHubFromCache` function.
    2.  **Change** the function signature:
          * **From:** `function updateLeagueHubFromCache(teamStatsWithH2H, scheduleData)`
          * **To:** `function updateLeagueHubFromCache(gameData)`
    3.  **Add** these lines at the top of the function to get the variables you need:
        ```javascript
        var teamStatsWithH2H = gameData.teamStatsWithH2H;
        var scheduleData = gameData.scheduleData;
        var boxScoreUrl = gameData.boxScoreUrl;
        ```
    4.  **Change** the call to `getLeagueLeaders`:
          * **From:** `var leaders = getLeagueLeaders(hittingStatsSheet, pitchingStatsSheet, fieldingStatsSheet, teamStats);`
          * **To:** `var leaders = getLeagueLeaders(gameData.playerStats, teamStats);`

  * **Action (LeagueUtility.js):**

    1.  In `LeagueUtility.js`, find the `getLeagueLeaders` function.

    2.  **Change** the function signature:

          * **From:** `function getLeagueLeaders(hittingSheet, pitchingSheet, fieldingSheet, teamStats)`
          * **To:** `function getLeagueLeaders(playerStats, teamStats)`

    3.  **Delete** all the `getRange` and `getValues` calls at the top of the function.

    4.  **Replace** the loops that iterate over sheet data with a loop that iterates over the `playerStats` object:

        ```javascript
        // --- V3 IN-MEMORY LOGIC ---
        // (Delete all the getRange/getValues lines above this)
        var hittingData = [];
        var pitchingData = [];
        var fieldingData = [];

        // Loop through the playerStats OBJECT keys
        for (var playerName in playerStats) {
          var stats = playerStats[playerName];
          var teamName = stats.team; // Assuming 'team' is a property in your playerStats object
          var gamesPlayed = stats.gamesPlayed;

          // Rebuild the arrays the rest of the function expects
          // Make sure the order of stats matches your old sheet data/new config
          hittingData.push([
            playerName, teamName, gamesPlayed,
            stats.hitting.AB, stats.hitting.H, stats.hitting.HR, stats.hitting.RBI, 
            stats.hitting.BB, stats.hitting.K, stats.hitting.TB,
            stats.hitting.AVG, stats.hitting.OBP, stats.hitting.SLG, stats.hitting.OPS
            //... add any other stats in order
          ]);
          
          pitchingData.push([
            playerName, teamName, gamesPlayed,
            stats.pitching.W, stats.pitching.L, stats.pitching.SV, stats.pitching.IP,
            stats.pitching.H, stats.pitching.R, stats.pitching.HR, stats.pitching.BB,
            stats.pitching.K, stats.pitching.ERA, stats.pitching.WHIP, stats.pitching.BAA
            //... add any other stats in order
          ]);

          fieldingData.push([
             playerName, teamName, gamesPlayed,
             stats.fielding.E, stats.fielding.NP, stats.fielding.SB, stats.fielding.CS
             //... add any other stats in order
          ]);
        }
        // --- END V3 LOGIC ---

        // (The rest of the getLeagueLeaders function should now work as-is)
        ```

-----

#### 3\. Implement the Retention Data Bridge

  * **Goal:** Have the `League Hub` create a cached JSON of stats that the `Retention` suite can read, per our v3 integration plan.
  * **Action (`LeagueCore.js`):**
    1.  At the very *end* of the `updateAll` function (after the `updateLeagueScheduleFromCache` call), add this new function call:
        ```javascript
        // V3 INTEGRATION: Cache final data for Retention suite
        cacheCurrentSeasonStats(gameData);
        ```
  * **Action (New Function - add to `LeagueCore.js` or `LeagueUtility.js`):**
    1.  Add this new function to your project. It saves the stats to `PropertiesService`.
        ```javascript
        /**
         * V3 INTEGRATION:
         * Caches the final processed gameData to PropertiesService
         * so the Retention suite can access it.
         */
        function cacheCurrentSeasonStats(gameData) {
          try {
            var dataToCache = {
              playerStats: gameData.playerStats,
              teamStatsWithH2H: gameData.teamStatsWithH2H
              // We don't need scheduleData for retention
            };
            
            var jsonData = JSON.stringify(dataToCache);
            
            // Save to ScriptProperties, which is available to all scripts in the project
            PropertiesService.getScriptProperties().setProperty('CURRENT_SEASON_STATS', jsonData);
            
            Logger.log('V3 Integration: Successfully cached current season stats for Retention suite.');
            
          } catch (e) {
            Logger.log('V3 Integration ERROR: Could not cache season stats. ' + e);
          }
        }
        ```

-----

#### 4\. Final Project Cleanup (Housekeeping)

  * **Goal:** Remove old menus and merge helper files.
  * **Action (`LeagueCore.js`):**
    1.  Go to the `onOpen` function.
    2.  **Delete** all the `removeItem` and `addSubMenu` calls for the individual "Step 1," "Step 2," "Step 3," etc. This will prevent users from running the old, slow functions.
  * **Action (Utility Merge):**
    1.  **Copy** the generic helper functions (`getOrdinalSuffix`, `findPlayerIndex`, `calculatePercentile`, `getGradeColor`, etc.) from `RetentionHelpers_v2.js`.
    2.  **Paste** them into the bottom of `LeagueUtility.js`.
    3.  **Delete** the `RetentionHelpers_v2.js` file from your project.

Once these steps are complete, your League Hub suite will be fully aligned with the v3 architecture.
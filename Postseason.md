# CLB Postseason Stats Implementation Guide

**Target Audience:** Claude Code (AI coding agent)  
**Project:** CLB League Hub - Postseason Statistics Integration  
**Adherence Required:** Gold Standard Implementation Guide (attached)

---

## Executive Summary

Add postseason statistics tracking to the existing CLB League Hub system. The system currently processes regular season games (prefixed `#W`) from an external Box Score spreadsheet. This implementation adds parallel processing for postseason games (prefixed `#P`), displays stats in a filterable 3-row structure per player/team (Regular/Postseason/Combined), and creates new visualizations for playoff brackets and schedules.

**Core Principle:** Maintain Gold Standard compliance (P1: Batch I/O, P2: Config-driven, P3: In-memory processing, P4: Professional comments).

---

## Section 1: Configuration Updates (`LeagueConfig.js`)

### 1.1 Add Postseason Structure Configuration

Add to `CONFIG` object:

```javascript
// ===== POSTSEASON CONFIGURATION =====
MAX_REGULAR_SEASON_WEEKS: 14,

POSTSEASON_ROUNDS: [
  { 
    name: "Wild Card Round", 
    shortName: "WC", 
    series: "BO3", 
    homeAway: "1-1-1",  // Format: Home-Away-Home
    teams: [4, 5]       // Seed numbers
  },
  { 
    name: "Castle Series", 
    shortName: "Semis", 
    series: "BO5", 
    homeAway: "2-2-1", 
    teams: [1, 2, 3, "WC"]  // WC = Wild Card winner
  },
  { 
    name: "Kingdom Cup", 
    shortName: "Finals", 
    series: "BO7", 
    homeAway: "2-3-2", 
    teams: ["Semi1", "Semi2"]  // Semi winners
  }
],

// Game sheet prefixes
REGULAR_SEASON_PREFIX: "#W",
POSTSEASON_PREFIX: "#P",

// New calculated stat
NET_DEFENSE_STAT_NAME: "OAA",  // Outs Above Average

// Sheet names
POSTSEASON_SCHEDULE_SHEET: "Postseason Schedule",  // Hidden sheet
PLAYOFFS_SHEET_PREFIX: "🏆 Season ",  // e.g., "🏆 Season 1 Playoffs"
```

### 1.2 Update Column Mappings for Season Type Column

**CRITICAL:** Season Type is inserted as **column B** (index 1) in all stat sheets. This shifts all existing columns right by 1.

Update `STATS_COLUMN_MAPS`:

```javascript
HITTING_COLUMNS: {
  PLAYER_NAME: 0,    // Column A (unchanged)
  SEASON_TYPE: 1,    // Column B (NEW)
  TEAM: 2,           // Column C (was B, shifted +1)
  GP: 3,             // Column D (was C, shifted +1)
  AB: 4,             // Column E (was D, shifted +1)
  // ... continue shifting all columns +1
},

PITCHING_COLUMNS: {
  PLAYER_NAME: 0,
  SEASON_TYPE: 1,    // NEW
  TEAM: 2,           // Shifted +1
  GP: 3,             // Shifted +1
  // ... continue shifting
},

FIELDING_COLUMNS: {
  PLAYER_NAME: 0,
  SEASON_TYPE: 1,    // NEW
  TEAM: 2,           // Shifted +1
  GP: 3,             // Shifted +1
  NP: 4,             // Shifted +1 (will be renamed to DHS later)
  E: 5,              // Shifted +1
  SB: 6,             // Shifted +1
  OAA: 7             // NEW - Outs Above Average (calculated)
}
```

Update `SHEET_STRUCTURE.PLAYER_STATS_SHEET`:

```javascript
PLAYER_STATS_SHEET: {
  HEADER_ROW: 1,
  DATA_START_ROW: 2,
  PLAYER_NAME_COL: 0,         // Column A (unchanged)
  SEASON_TYPE_COL: 1,         // Column B (NEW)
  TEAM_NAME_COL: 2,           // Column C (was B, shifted +1)
  DATA_START_COL: 3,          // Column D (was C, shifted +1)
  TOTAL_STAT_COLUMNS: 24      // Was 23, now 24 (added Season Type)
}
```

Update `SHEET_STRUCTURE.TEAM_STATS_SHEET`:

```javascript
TEAM_STATS_SHEET: {
  DATA_START_ROW: 2,
  TEAM_NAME_COL: 0,           // Column A (unchanged)
  SEASON_TYPE_COL: 1,         // Column B (NEW)
  CAPTAIN_COL: 2,             // Column C (was B, shifted +1)
  GP_COL: 3,                  // Column D (was C, shifted +1)
  WINS_COL: 4,                // Column E (was D, shifted +1)
  LOSSES_COL: 5,              // Column F (was E, shifted +1)
  GPWL_START_COL: 3,          // Column D (was C, shifted +1)
  GPWL_NUM_COLS: 3,
  HITTING_START_COL: 6,       // Column G (was F, shifted +1)
  HITTING_NUM_COLS: 9,
  PITCHING_START_COL: 15,     // Column P (was O, shifted +1)
  PITCHING_NUM_COLS: 7,
  FIELDING_START_COL: 22,     // Column W (was V, shifted +1)
  FIELDING_NUM_COLS: 4        // Was 3, now 4 (added OAA)
}
```

### 1.3 Add Team Rankings Configuration

Add to `SHEET_STRUCTURE`:

```javascript
LEAGUE_HUB: {
  // ... existing config ...
  TEAM_RANKINGS: {
    START_ROW_OFFSET: 2,      // Rows below standings end
    START_COL: 0,             // Column A
    NUM_COLS: 3,              // Rank, Team, Value
    CATEGORIES: [
      { name: "Hitting", stat: "runsPerGame", header: "R/G" },
      { name: "Pitching", stat: "era", header: "ERA" },
      { name: "Defense", stat: "oaa", header: "OAA" }
    ]
  }
}
```

---

## Section 2: Game Processing Logic

### 2.1 Postseason Game Detection

**File:** `LeagueGames.js` (or wherever `processAllGameSheetsOnce()` lives)

**Current behavior:** Processes all sheets starting with `CONFIG.GAME_SHEET_PREFIX` (which is "#")

**Required changes:**

1. Update game sheet detection to handle both `#W` and `#P` prefixes
2. Add function to check if postseason exists
3. Create separate postseason processing function

**Implementation pattern:**

```javascript
/**
 * Check if any postseason games exist in the box score spreadsheet
 * @returns {boolean} True if postseason games found
 */
function postseasonExists() {
  var boxScoreSpreadsheet = getBoxScoreSpreadsheet();
  var allSheets = boxScoreSpreadsheet.getSheets();
  
  for (var i = 0; i < allSheets.length; i++) {
    var sheetName = allSheets[i].getName();
    if (sheetName.indexOf(CONFIG.POSTSEASON_PREFIX) === 0) {
      return true;
    }
  }
  return false;
}

/**
 * Process all postseason game sheets once
 * Mirrors regular season processing logic but handles #P sheets
 * @returns {object} postseasonGameData with same structure as regular gameData
 */
function processAllPostseasonGamesOnce() {
  // Implementation should mirror processAllGameSheetsOnce()
  // but filter for sheets starting with CONFIG.POSTSEASON_PREFIX
  // Parse game numbers: #P{round}-{game} (e.g., #P1-1, #P2-3)
  // Store round and game number in game metadata
  
  // Return object structure:
  // {
  //   playerStats: {},
  //   teamStats: {},
  //   teamStatsWithH2H: {},  // Separate H2H tracking for postseason
  //   scheduleData: [],
  //   gamesByWeek: {},       // Use rounds instead of weeks
  //   boxScoreUrl: ""
  // }
}
```

**Regex pattern for parsing postseason game sheets:**

```javascript
// Example: "#P2-3" = Round 2, Game 3
var psPattern = /^#P(\d+)-(\d+)$/;
var match = sheetName.match(psPattern);
if (match) {
  var round = parseInt(match[1]);
  var gameNumber = parseInt(match[2]);
  // Use round to map to CONFIG.POSTSEASON_ROUNDS[round - 1]
}
```

### 2.2 Combined Stats Calculation

**Rule:** "Combined" (Season #) stats = Regular Season + Postseason, calculated **in-memory** during write operations (not as formulas).

**Pattern for all update functions:**

```javascript
// After building regularStats and postseasonStats objects
var combinedStats = {};

for (var playerName in regularStats) {
  combinedStats[playerName] = {
    gamesPlayed: regularStats[playerName].gamesPlayed + (postseasonStats[playerName]?.gamesPlayed || 0),
    hitting: [
      regularStats[playerName].hitting[0] + (postseasonStats[playerName]?.hitting[0] || 0),  // AB
      regularStats[playerName].hitting[1] + (postseasonStats[playerName]?.hitting[1] || 0),  // H
      // ... sum all array elements
    ],
    // ... repeat for pitching, fielding, wins, losses, saves
  };
}
```

### 2.3 Update `updateAll()` Orchestrator

**File:** `LeagueCore.js`

**Required changes:**

```javascript
function updateAll() {
  // ... existing regular season processing ...
  
  var gameData = processAllGameSheetsOnce();
  
  // NEW: Check for postseason
  var postseasonGameData = null;
  if (postseasonExists()) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Processing postseason games...", "Update All", -1);
    postseasonGameData = processAllPostseasonGamesOnce();
  }
  
  // NEW: Build combined stats in memory
  var combinedGameData = buildCombinedGameData(gameData, postseasonGameData);
  
  // Pass combinedGameData to all update functions
  // Each function will write 3 rows per entity: RS, PS, Combined
  
  updateAllPlayerStatsFromCache(combinedGameData);
  updateAllTeamStatsFromCache(combinedGameData);
  // ... etc
}
```

---

## Section 3: Stats Sheet Updates

### 3.1 Player Stats Sheet (`LeaguePlayerStats.js`)

**Current behavior:** Writes 1 row per player with stats

**Required behavior:** Write 3 rows per player:
1. Row 1: Season Type = "Regular", stats from `gameData.playerStats`
2. Row 2: Season Type = "Postseason", stats from `postseasonGameData.playerStats` (or zeros if no PS data)
3. Row 3: Season Type = "Season 1", stats = calculated sum of rows 1+2

**Implementation pattern:**

```javascript
function updateAllPlayerStatsFromCache(combinedGameData) {
  var playerStatsSheet = /* ... get sheet ... */;
  var playerOrder = /* ... get player names from sheet ... */;
  
  var allPlayerData = [];  // Will be 3x as long as before
  
  for (var i = 0; i < playerOrder.length; i++) {
    var playerName = playerOrder[i];
    
    // Row 1: Regular season
    var rsStats = combinedGameData.regularSeason.playerStats[playerName] || createEmptyStats();
    var rsRow = ["Regular"].concat(buildStatsArray(rsStats));  // Prepend Season Type
    allPlayerData.push(rsRow);
    
    // Row 2: Postseason
    var psStats = combinedGameData.postseason.playerStats[playerName] || createEmptyStats();
    var psRow = ["Postseason"].concat(buildStatsArray(psStats));
    allPlayerData.push(psRow);
    
    // Row 3: Combined (calculated in-memory)
    var combinedStats = calculateCombinedStats(rsStats, psStats);
    var combinedRow = ["Season 1"].concat(buildStatsArray(combinedStats));
    allPlayerData.push(combinedRow);
  }
  
  // Write all at once (Gold Standard P1)
  var numRows = allPlayerData.length;
  playerStatsSheet.getRange(
    layout.DATA_START_ROW,
    layout.SEASON_TYPE_COL + 1,  // Start from Season Type column
    numRows,
    layout.TOTAL_STAT_COLUMNS
  ).setValues(allPlayerData);
}
```

**Helper function pattern:**

```javascript
function buildStatsArray(stats) {
  // Return flat array: [GP, AB, H, HR, ..., W, L, SV, IP, ...]
  var arr = [stats.gamesPlayed];
  arr = arr.concat(stats.hitting);
  arr = arr.concat([stats.wins, stats.losses, stats.saves]);
  arr = arr.concat(stats.pitching);
  arr = arr.concat(stats.fielding);
  return arr;
}

function calculateCombinedStats(rs, ps) {
  // Sum all numeric stats in-memory
  return {
    gamesPlayed: rs.gamesPlayed + ps.gamesPlayed,
    hitting: rs.hitting.map((val, idx) => val + ps.hitting[idx]),
    wins: rs.wins + ps.wins,
    // ... etc
  };
}
```

### 3.2 Team Stats Sheet (`LeagueTeamStats.js`)

**Pattern:** Identical to Player Stats - write 3 rows per team (Regular/Postseason/Season 1)

**Additional calculation:** OAA (Outs Above Average) for fielding

```javascript
// When building fielding stats array
var oaa = ((stats.fielding[0] - stats.fielding[1]) / stats.gamesPlayed) || 0;  // (NP - E) / GP
stats.fielding.push(oaa);  // Add as 4th element
```

### 3.3 Calculated Stats Sheets (🧮 Hitting, Pitching, Fielding)

**CRITICAL CHANGE:** Convert from **formulas** to **calculated values**

**Current behavior:** These sheets use formulas like `=D2/E2` for AVG, `=(H2+BB2)/(AB2+BB2)` for OBP, etc.

**Required behavior:** Script calculates and writes these values directly

**Implementation pattern:**

```javascript
function updateCalculatedStatsSheet(sheetName, playerStats, statType) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var playerOrder = /* ... get from sheet ... */;
  
  var allData = [];
  
  for (var i = 0; i < playerOrder.length; i++) {
    var playerName = playerOrder[i];
    
    // Regular season row
    var rsStats = playerStats.regularSeason[playerName];
    var rsRow = buildCalculatedStatsRow(rsStats, statType, "Regular");
    allData.push(rsRow);
    
    // Postseason row
    var psStats = playerStats.postseason[playerName];
    var psRow = buildCalculatedStatsRow(psStats, statType, "Postseason");
    allData.push(psRow);
    
    // Combined row
    var combinedStats = calculateCombinedStats(rsStats, psStats);
    var combinedRow = buildCalculatedStatsRow(combinedStats, statType, "Season 1");
    allData.push(combinedRow);
  }
  
  sheet.getRange(2, 1, allData.length, allData[0].length).setValues(allData);
}

function buildCalculatedStatsRow(stats, statType, seasonType) {
  var row = [stats.name, seasonType, stats.team, stats.gamesPlayed];
  
  if (statType === "hitting") {
    // Calculate AVG, OBP, SLG, OPS, etc.
    var avg = stats.AB > 0 ? stats.H / stats.AB : 0;
    var obp = (stats.AB + stats.BB) > 0 ? (stats.H + stats.BB) / (stats.AB + stats.BB) : 0;
    // ... etc
    row = row.concat([stats.AB, stats.H, stats.HR, avg, obp, /* ... */]);
  } else if (statType === "pitching") {
    // Calculate ERA, WHIP, BAA, etc.
    var era = stats.IP > 0 ? (stats.R / stats.IP) * 9 : 0;
    var whip = stats.IP > 0 ? (stats.H + stats.BB) / stats.IP : 0;
    // ... etc
    row = row.concat([stats.IP, stats.H, stats.R, era, whip, /* ... */]);
  } else if (statType === "fielding") {
    // Calculate OAA
    var oaa = stats.GP > 0 ? (stats.NP - stats.E) / stats.GP : 0;
    row = row.concat([stats.NP, stats.E, stats.SB, oaa]);
  }
  
  return row;
}
```

**Formula reference for conversions:**

- **AVG:** `H / AB`
- **OBP:** `(H + BB) / (AB + BB)`
- **SLG:** `TB / AB`
- **OPS:** `OBP + SLG`
- **ERA:** `(R / IP) * 9`
- **WHIP:** `(H + BB) / IP`
- **BAA:** `H / BF`
- **OAA:** `(NP - E) / GP`

---

## Section 4: Team Sheet Updates (`LeagueTeamSheets.js`)

### 4.1 Add Season Type Column to All Tables

**Current tables:**
- Hitting stats
- Pitching stats
- Fielding stats
- Standings (no Season Type needed - RS only)
- Schedule (no Season Type needed)

**Pattern for each table:**

```javascript
// Example: Hitting stats table
var hittingData = [];

for (var i = 0; i < playerOrder.length; i++) {
  var playerName = playerOrder[i];
  
  // Regular season row
  var rsStats = playerStats.regularSeason[playerName];
  hittingData.push(["Regular", rsStats.AB, rsStats.H, rsStats.HR, /* ... */]);
  
  // Postseason row
  var psStats = playerStats.postseason[playerName];
  hittingData.push(["Postseason", psStats.AB, psStats.H, psStats.HR, /* ... */]);
  
  // Combined row
  var combined = calculateCombinedStats(rsStats, psStats);
  hittingData.push(["Season 1", combined.AB, combined.H, combined.HR, /* ... */]);
}

// Write to sheet (batch operation)
teamSheet.getRange(startRow, startCol, hittingData.length, numCols).setValues(hittingData);
```

### 4.2 Restructure Layout

**Current layout issues:**
- Tables overlap with standings/schedule on same rows

**Required layout:**

```
Rows 1-2:   Team header/name
Row 4:      Slicer instructions (manual setup note)
Rows 6+:    Hitting table (with slicer space at top)
Rows X+:    Pitching table (below hitting, with slicer space)
Rows Y+:    Fielding table (below pitching, with slicer space)
Rows Z+:    Standings (below all stats tables)
Rows W+:    Schedule (below standings)
```

**Implementation note:** Add spacing rows between tables to accommodate slicers (which are created manually by user).

---

## Section 5: Rankings Sheet Updates (`LeagueRankings.js`)

### 5.1 Remove Recent Results Section

**Current behavior:** `buildRecentResults()` writes recent games to bottom of Rankings sheet

**Required change:** Delete this section entirely - Recent Results moves to Schedule sheet

### 5.2 Add Team Rankings Section

**Location:** Below standings (columns A-C), using space previously occupied by "This Week's Games"

**Implementation pattern:**

```javascript
function buildTeamRankings(standingsSheet, teamStats, startRow) {
  var layout = CONFIG.SHEET_STRUCTURE.LEAGUE_HUB.TEAM_RANKINGS;
  var currentRow = startRow;
  
  // Header
  standingsSheet.getRange(currentRow, layout.START_COL + 1, 1, layout.NUM_COLS).merge()
    .setValue("Team Rankings")
    .setFontWeight("bold")
    .setFontSize(12);
  currentRow += 2;
  
  // For each category (Hitting, Pitching, Defense)
  for (var c = 0; c < layout.CATEGORIES.length; c++) {
    var category = layout.CATEGORIES[c];
    
    // Category header
    standingsSheet.getRange(currentRow, layout.START_COL + 1, 1, layout.NUM_COLS).merge()
      .setValue(category.name)
      .setFontWeight("bold")
      .setBackground("#e8e8e8");
    currentRow++;
    
    // Column headers
    standingsSheet.getRange(currentRow, layout.START_COL + 1, 1, layout.NUM_COLS)
      .setValues([["Rank", "Team", category.header]])
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    currentRow++;
    
    // Calculate and rank teams
    var rankedTeams = rankTeamsByStat(teamStats, category.stat);
    
    // Write data
    var rankData = [];
    for (var t = 0; t < rankedTeams.length; t++) {
      rankData.push([t + 1, rankedTeams[t].name, rankedTeams[t].value]);
    }
    standingsSheet.getRange(currentRow, layout.START_COL + 1, rankData.length, layout.NUM_COLS)
      .setValues(rankData);
    
    currentRow += rankData.length + 2;  // Add spacing
  }
}

function rankTeamsByStat(teamStats, statKey) {
  var teams = [];
  
  for (var teamName in teamStats) {
    var value;
    if (statKey === "runsPerGame") {
      value = teamStats[teamName].runsScored / teamStats[teamName].gamesPlayed;
    } else if (statKey === "era") {
      // Calculate ERA from pitching stats
      var pitching = teamStats[teamName].pitching;
      value = pitching[4] > 0 ? (pitching[3] / pitching[4]) * 9 : 999;  // R / IP * 9
    } else if (statKey === "oaa") {
      // Calculate OAA from fielding stats
      var fielding = teamStats[teamName].fielding;
      value = (fielding[0] - fielding[1]) / teamStats[teamName].gamesPlayed;  // (NP - E) / GP
    }
    
    teams.push({ name: teamName, value: value });
  }
  
  // Sort (ascending for ERA, descending for others)
  teams.sort(function(a, b) {
    if (statKey === "era") {
      return a.value - b.value;  // Lower is better
    } else {
      return b.value - a.value;  // Higher is better
    }
  });
  
  return teams;
}
```

### 5.3 Keep Only Regular Season League Leaders

**No changes needed** - current League Leaders display already shows only RS stats. Postseason leaders will go on new Playoffs sheet.

---

## Section 6: Schedule Sheet Updates (`LeagueSchedule.js`)

### 6.1 Restructure Layout

**New layout:**

```
LEFT SIDE (Columns A-H):
  Rows 1-15:   Standings (regular season only)
  Rows 17-20:  This Week's Games
  Rows 22-30:  Recent Results (last week)
  Rows 32+:    Completed Games (newest to oldest)

RIGHT SIDE (Columns J-P):
  Rows 1-30:   Playoff Bracket (hypothetical during RS, actual during PS)
  Rows 32+:    Scheduled Games (closest to furthest)
```

**Implementation notes:**

1. **Standings:** No changes - already regular season only
2. **This Week's Games:** Move from Rankings sheet
3. **Recent Results:** Move from Rankings sheet, modify to show last week only (not last N weeks)
4. **Completed Games:** Already exists, just reposition
5. **Bracket:** New section (see Section 6.2)
6. **Scheduled Games:** Already exists, just reposition to right side

### 6.2 Add Playoff Bracket Display

**Challenge:** Dynamic bracket that updates based on current standings during RS, then locks when PS begins

**Implementation pattern:**

```javascript
function buildPlayoffBracket(scheduleSheet, teamStatsWithH2H, postseasonSchedule, startRow) {
  var layout = { START_COL: 9, NUM_COLS: 7 };  // Columns J-P
  var currentRow = startRow;
  
  // Header
  scheduleSheet.getRange(currentRow, layout.START_COL + 1, 1, layout.NUM_COLS).merge()
    .setValue("Playoff Bracket")
    .setFontWeight("bold")
    .setFontSize(14);
  currentRow += 2;
  
  // Check if postseason has started
  var postseasonStarted = checkIfPostseasonStarted();
  
  if (!postseasonStarted) {
    // Hypothetical bracket based on current standings
    buildHypotheticalBracket(scheduleSheet, teamStatsWithH2H, currentRow, layout);
  } else {
    // Actual bracket with results
    buildActualBracket(scheduleSheet, postseasonSchedule, currentRow, layout);
  }
}

function checkIfPostseasonStarted() {
  // Check if any postseason games have been played
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var psScheduleSheet = ss.getSheetByName(CONFIG.POSTSEASON_SCHEDULE_SHEET);
  
  if (!psScheduleSheet) return false;
  
  var data = psScheduleSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {  // Skip header
    if (data[i][5] === true) {  // "Played" column
      return true;
    }
  }
  return false;
}

function buildHypotheticalBracket(scheduleSheet, teamStatsWithH2H, startRow, layout) {
  // Get current standings (top 5 teams)
  var standings = getStandingsOrder(teamStatsWithH2H);
  var seeds = standings.slice(0, 5);
  
  var bracketData = [];
  
  // Wild Card Round
  bracketData.push(["Wild Card Round (BO3)", "", "", "", "", "", ""]);
  bracketData.push(["4. " + seeds[3], "vs", "5. " + seeds[4], "", "", "", ""]);
  bracketData.push(["", "", "", "", "", "", ""]);
  
  // Castle Series (Semifinals)
  bracketData.push(["Castle Series (BO5)", "", "", "", "", "", ""]);
  bracketData.push(["1. " + seeds[0], "vs", "WC Winner", "", "", "", ""]);
  bracketData.push(["2. " + seeds[1], "vs", "3. " + seeds[2], "", "", "", ""]);
  bracketData.push(["", "", "", "", "", "", ""]);
  
  // Kingdom Cup (Finals)
  bracketData.push(["Kingdom Cup (BO7)", "", "", "", "", "", ""]);
  bracketData.push(["Winner 1", "vs", "Winner 2", "", "", "", ""]);
  
  // Write to sheet
  scheduleSheet.getRange(startRow, layout.START_COL + 1, bracketData.length, layout.NUM_COLS)
    .setValues(bracketData)
    .setVerticalAlignment("middle");
  
  // Add note about hypothetical nature
  scheduleSheet.getRange(startRow + bracketData.length + 1, layout.START_COL + 1, 1, layout.NUM_COLS).merge()
    .setValue("*Hypothetical bracket based on current standings")
    .setFontStyle("italic")
    .setFontSize(9)
    .setFontColor("#666666");
}

function buildActualBracket(scheduleSheet, postseasonSchedule, startRow, layout) {
  // Read postseason schedule data
  var psSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.POSTSEASON_SCHEDULE_SHEET);
  var psData = psSheet.getDataRange().getValues();
  
  // Group games by round
  var gamesByRound = {};
  for (var i = 1; i < psData.length; i++) {
    var round = psData[i][0];
    if (!gamesByRound[round]) gamesByRound[round] = [];
    gamesByRound[round].push({
      seriesName: psData[i][1],
      homeTeam: psData[i][2],
      awayTeam: psData[i][3],
      gameNum: psData[i][4],
      played: psData[i][5],
      winner: psData[i][6],
      sheetId: psData[i][7]
    });
  }
  
  var bracketData = [];
  
  // For each round, display series with current status
  for (var round = 1; round <= CONFIG.POSTSEASON_ROUNDS.length; round++) {
    var roundConfig = CONFIG.POSTSEASON_ROUNDS[round - 1];
    var games = gamesByRound[round] || [];
    
    // Round header
    bracketData.push([roundConfig.name + " (" + roundConfig.series + ")", "", "", "", "", "", ""]);
    
    // Group games by series (unique home/away pairs)
    var series = groupGamesBySeries(games);
    
    for (var s = 0; s < series.length; s++) {
      var matchup = series[s];
      var seriesRecord = getSeriesRecord(matchup.games);
      
      // Display matchup with current series score
      var matchupText = matchup.homeTeam + " (" + seriesRecord.home + ") vs " + 
                        matchup.awayTeam + " (" + seriesRecord.away + ")";
      bracketData.push([matchupText, "", "", "", "", "", ""]);
      
      // If series complete, show winner
      if (seriesRecord.winner) {
        bracketData.push(["Winner: " + seriesRecord.winner, "", "", "", "", "", ""]);
      }
    }
    
    bracketData.push(["", "", "", "", "", "", ""]);  // Spacing
  }
  
  // Write to sheet
  scheduleSheet.getRange(startRow, layout.START_COL + 1, bracketData.length, layout.NUM_COLS)
    .setValues(bracketData)
    .setVerticalAlignment("middle");
}

function groupGamesBySeries(games) {
  // Group games by unique home/away team pairs
  var seriesMap = {};
  
  for (var i = 0; i < games.length; i++) {
    var key = games[i].homeTeam + "|" + games[i].awayTeam;
    if (!seriesMap[key]) {
      seriesMap[key] = {
        homeTeam: games[i].homeTeam,
        awayTeam: games[i].awayTeam,
        games: []
      };
    }
    seriesMap[key].games.push(games[i]);
  }
  
  return Object.values(seriesMap);
}

function getSeriesRecord(games) {
  var homeWins = 0;
  var awayWins = 0;
  
  for (var i = 0; i < games.length; i++) {
    if (games[i].played) {
      if (games[i].winner === games[i].homeTeam) {
        homeWins++;
      } else {
        awayWins++;
      }
    }
  }
  
  // Determine series winner if applicable
  var winner = null;
  var seriesLength = games[0].seriesName;  // Extract from config based on round
  var gamesNeeded = Math.ceil(parseInt(seriesLength.substring(2)) / 2);  // BO3 = 2, BO5 = 3, BO7 = 4
  
  if (homeWins >= gamesNeeded) winner = games[0].homeTeam;
  if (awayWins >= gamesNeeded) winner = games[0].awayTeam;
  
  return { home: homeWins, away: awayWins, winner: winner };
}
```

### 6.3 Modify Recent Results to Handle Postseason Headers

**Current behavior:** Headers show "Week X"

**Required behavior:** 
- Regular season: "Week X"
- Postseason: "{Series Name}" (e.g., "Wild Card Round", "Castle Series - Game 1")

**Implementation pattern:**

```javascript
function buildRecentResults(scheduleSheet, gamesByWeek, weekKeys, weeksToShow, startRow, boxScoreUrl) {
  // ... existing code ...
  
  for (var w = 0; w < weeksToShow; w++) {
    var weekKey = weekKeys[w];
    var games = gamesByWeek[weekKey];
    
    // Determine header text based on game type
    var headerText;
    if (games[0].isPostseason) {
      // Parse round number from game sheet name (#P1-1 → Round 1)
      var round = games[0].round;
      var roundConfig = CONFIG.POSTSEASON_ROUNDS[round - 1];
      headerText = roundConfig.name;
    } else {
      headerText = weekKey;  // "Week X"
    }
    
    rowData.push({
      row: currentRow,
      type: "header",
      text: headerText
    });
    
    // ... rest of existing logic ...
  }
}
```

---

## Section 7: New Playoffs Sheet

### 7.1 Sheet Creation Logic

**Trigger:** When all regular season games (`MAX_REGULAR_SEASON_WEEKS`) have been played

**Implementation pattern:**

```javascript
function checkAndCreatePlayoffsSheet(teamStatsWithH2H) {
  // Check if regular season is complete
  var maxCompletedWeek = 0;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName(CONFIG.SEASON_SCHEDULE_SHEET);
  var scheduleData = scheduleSheet.getDataRange().getValues();
  
  for (var i = 1; i < scheduleData.length; i++) {
    if (scheduleData[i][4] === true) {  // "Played" column
      var week = scheduleData[i][0];
      if (week > maxCompletedWeek) maxCompletedWeek = week;
    }
  }
  
  if (maxCompletedWeek < CONFIG.MAX_REGULAR_SEASON_WEEKS) {
    return;  // Regular season not complete
  }
  
  // Check if playoffs sheet already exists
  var playoffsSheetName = CONFIG.PLAYOFFS_SHEET_PREFIX + "1 Playoffs";  // TODO: Get actual season number
  if (ss.getSheetByName(playoffsSheetName)) {
    return;  // Already created
  }
  
  // Create sheet
  var playoffsSheet = ss.insertSheet(playoffsSheetName);
  
  // Initialize postseason schedule
  generatePostseasonSchedule(teamStatsWithH2H);
  
  // Build initial playoffs sheet layout
  buildPlayoffsSheet(playoffsSheet, teamStatsWithH2H);
}
```

### 7.2 Postseason Schedule Generation

**Location:** Hidden sheet named "Postseason Schedule"

**Schema:**

| Round | Series Name | Home Team | Away Team | Game# | Played | Winner | Sheet ID |
|-------|-------------|-----------|-----------|-------|--------|--------|----------|
| 1     | Wild Card   | Team4     | Team5     | 1     | FALSE  |        | #P1-1    |
| 1     | Wild Card   | Team5     | Team4     | 2     | FALSE  |        | #P1-2    |
| ...   | ...         | ...       | ...       | ...   | ...    | ...    | ...      |

**Implementation pattern:**

```javascript
function generatePostseasonSchedule(teamStatsWithH2H) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var psScheduleSheet = ss.getSheetByName(CONFIG.POSTSEASON_SCHEDULE_SHEET);
  
  if (!psScheduleSheet) {
    psScheduleSheet = ss.insertSheet(CONFIG.POSTSEASON_SCHEDULE_SHEET);
    psScheduleSheet.hideSheet();
  } else {
    // Clear existing data
    psScheduleSheet.clear();
  }
  
  // Write header
  psScheduleSheet.getRange(1, 1, 1, 8).setValues([[
    "Round", "Series Name", "Home Team", "Away Team", "Game#", "Played", "Winner", "Sheet ID"
  ]]).setFontWeight("bold");
  
  // Get final standings (seeding)
  var standings = getStandingsOrder(teamStatsWithH2H);
  var seeds = {
    1: standings[0],
    2: standings[1],
    3: standings[2],
    4: standings[3],
    5: standings[4]
  };
  
  var scheduleData = [];
  
  // Round 1: Wild Card
  var wcRound = CONFIG.POSTSEASON_ROUNDS[0];
  var wcHomeAway = parseHomeAwayPattern(wcRound.homeAway);  // [1,1,1]
  for (var g = 0; g < wcHomeAway.length; g++) {
    var homeTeam = wcHomeAway[g] === 1 ? seeds[4] : seeds[5];  // Higher seed gets home
    var awayTeam = wcHomeAway[g] === 1 ? seeds[5] : seeds[4];
    scheduleData.push([
      1, wcRound.name, homeTeam, awayTeam, g + 1, false, "", "#P1-" + (g + 1)
    ]);
  }
  
  // Round 2: Castle Series (Semifinals)
  var semiRound = CONFIG.POSTSEASON_ROUNDS[1];
  var semiHomeAway = parseHomeAwayPattern(semiRound.homeAway);  // [2,2,1]
  
  // Series 1: 1 seed vs WC winner (TBD)
  for (var g = 0; g < semiHomeAway.length; g++) {
    var homeTeam = semiHomeAway[g] <= 2 ? seeds[1] : "WC Winner";
    var awayTeam = semiHomeAway[g] <= 2 ? "WC Winner" : seeds[1];
    scheduleData.push([
      2, semiRound.name + " (1 vs WC)", homeTeam, awayTeam, g + 1, false, "", "#P2-" + (g + 1)
    ]);
  }
  
  // Series 2: 2 seed vs 3 seed
  for (var g = 0; g < semiHomeAway.length; g++) {
    var homeTeam = semiHomeAway[g] <= 2 ? seeds[2] : seeds[3];
    var awayTeam = semiHomeAway[g] <= 2 ? seeds[3] : seeds[2];
    scheduleData.push([
      2, semiRound.name + " (2 vs 3)", homeTeam, awayTeam, g + 1, false, "", "#P2-" + (g + 1 + semiHomeAway.length)
    ]);
  }
  
  // Round 3: Kingdom Cup (Finals)
  var finalRound = CONFIG.POSTSEASON_ROUNDS[2];
  var finalHomeAway = parseHomeAwayPattern(finalRound.homeAway);  // [2,3,2]
  for (var g = 0; g < finalHomeAway.length; g++) {
    scheduleData.push([
      3, finalRound.name, "TBD", "TBD", g + 1, false, "", "#P3-" + (g + 1)
    ]);
  }
  
  // Write all at once
  psScheduleSheet.getRange(2, 1, scheduleData.length, 8).setValues(scheduleData);
}

function parseHomeAwayPattern(pattern) {
  // "2-2-1" → [1,1,2,2,1] (home team designations)
  var parts = pattern.split("-");
  var sequence = [];
  var currentTeam = 1;
  
  for (var i = 0; i < parts.length; i++) {
    var count = parseInt(parts[i]);
    for (var j = 0; j < count; j++) {
      sequence.push(currentTeam);
    }
    currentTeam = currentTeam === 1 ? 2 : 1;  // Alternate
  }
  
  return sequence;
}
```

### 7.3 Update Postseason Schedule as Games Complete

**Trigger:** When processing postseason games, update "Played" and "Winner" columns

**Implementation pattern:**

```javascript
function updatePostseasonSchedule(gameResults) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var psScheduleSheet = ss.getSheetByName(CONFIG.POSTSEASON_SCHEDULE_SHEET);
  
  if (!psScheduleSheet) return;
  
  var data = psScheduleSheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var sheetId = data[i][7];
    
    if (gameResults[sheetId]) {
      data[i][5] = true;  // Played
      data[i][6] = gameResults[sheetId].winner;
      
      // Check if series is complete and advance winners
      var round = data[i][0];
      var seriesName = data[i][1];
      checkAndAdvanceWinner(data, i, round, seriesName);
    }
  }
  
  // Write back
  psScheduleSheet.getRange(1, 1, data.length, 8).setValues(data);
}

function checkAndAdvanceWinner(scheduleData, currentIndex, round, seriesName) {
  // Find all games in this series
  var seriesGames = [];
  for (var i = 1; i < scheduleData.length; i++) {
    if (scheduleData[i][0] === round && scheduleData[i][1] === seriesName) {
      seriesGames.push(scheduleData[i]);
    }
  }
  
  // Count wins
  var homeTeam = seriesGames[0][2];
  var awayTeam = seriesGames[0][3];
  var homeWins = 0;
  var awayWins = 0;
  
  for (var i = 0; i < seriesGames.length; i++) {
    if (seriesGames[i][5] === true) {  // Played
      if (seriesGames[i][6] === homeTeam) homeWins++;
      if (seriesGames[i][6] === awayTeam) awayWins++;
    }
  }
  
  // Check if series is won
  var roundConfig = CONFIG.POSTSEASON_ROUNDS[round - 1];
  var gamesNeeded = Math.ceil(parseInt(roundConfig.series.substring(2)) / 2);
  
  var winner = null;
  if (homeWins >= gamesNeeded) winner = homeTeam;
  if (awayWins >= gamesNeeded) winner = awayTeam;
  
  if (winner) {
    // Advance winner to next round
    advanceWinnerToNextRound(scheduleData, round, seriesName, winner);
  }
}

function advanceWinnerToNextRound(scheduleData, completedRound, seriesName, winner) {
  if (completedRound >= CONFIG.POSTSEASON_ROUNDS.length) {
    // Finals complete - winner is champion
    return;
  }
  
  // Find TBD slots in next round
  var nextRound = completedRound + 1;
  for (var i = 1; i < scheduleData.length; i++) {
    if (scheduleData[i][0] === nextRound) {
      if (scheduleData[i][2] === "TBD" || scheduleData[i][2].indexOf("WC") > -1 || 
          scheduleData[i][2].indexOf("Semi") > -1) {
        scheduleData[i][2] = winner;  // Home team slot
      }
      if (scheduleData[i][3] === "TBD" || scheduleData[i][3].indexOf("WC") > -1 || 
          scheduleData[i][3].indexOf("Semi") > -1) {
        scheduleData[i][3] = winner;  // Away team slot
      }
    }
  }
}
```

### 7.4 Playoffs Sheet Layout

**Structure:**

```
LEFT SIDE (Columns A-H):
  Rows 1-30:  Playoff Bracket (actual, with live results)
  Rows 32+:   Postseason Schedule (all games, with status)

RIGHT SIDE (Columns J, L, N):
  Row 1:      "Postseason League Leaders" header
  Rows 3+:    Batting Leaders (Column J)
              Pitching Leaders (Column L)
              Defense Leaders (Column N)
```

**Implementation pattern:**

```javascript
function buildPlayoffsSheet(playoffsSheet, teamStatsWithH2H) {
  // Left side: Bracket
  var bracketRow = 1;
  playoffsSheet.getRange(bracketRow, 1, 1, 8).merge()
    .setValue("Playoff Bracket")
    .setFontWeight("bold")
    .setFontSize(14);
  bracketRow += 2;
  
  // Build bracket (similar to Schedule sheet bracket, but always shows actual results)
  buildActualBracketForPlayoffsSheet(playoffsSheet, bracketRow);
  
  // Left side: Schedule
  var scheduleRow = 32;
  playoffsSheet.getRange(scheduleRow, 1, 1, 8).merge()
    .setValue("Postseason Schedule")
    .setFontWeight("bold")
    .setFontSize(14);
  scheduleRow += 2;
  
  buildPostseasonScheduleDisplay(playoffsSheet, scheduleRow);
  
  // Right side: League Leaders
  var leadersRow = 1;
  playoffsSheet.getRange(leadersRow, 10).setValue("Postseason League Leaders")
    .setFontWeight("bold")
    .setFontSize(14);
  leadersRow += 2;
  
  // This will be populated by existing getLeagueLeaders() function
  // but filtered to postseason stats only
  // Implementation in Section 8
}
```

---

## Section 8: League Leaders for Postseason

### 8.1 Modify `getLeagueLeaders()` Function

**File:** `LeagueUtility.js` (or wherever league leaders logic exists)

**Current behavior:** Returns leaders from all stats (regular season only)

**Required change:** Add parameter to filter by season type

**Implementation pattern:**

```javascript
function getLeagueLeaders(playerStats, teamStatsWithH2H, seasonType) {
  // seasonType: "Regular", "Postseason", or null for all
  
  var qualifiedPlayers = [];
  
  for (var playerName in playerStats) {
    var stats = playerStats[playerName];
    
    // Filter by season type if specified
    if (seasonType && stats.seasonType !== seasonType) {
      continue;
    }
    
    // Check qualification thresholds
    var minAB = CONFIG.MIN_AB_MULTIPLIER * stats.gamesPlayed;
    var minIP = CONFIG.MIN_IP_MULTIPLIER * stats.gamesPlayed;
    
    if (stats.hitting[0] >= minAB || stats.pitching[4] >= minIP) {
      qualifiedPlayers.push({
        name: playerName,
        team: stats.team,
        seasonType: stats.seasonType,
        stats: stats
      });
    }
  }
  
  // Calculate leaders for each category
  var leaders = {
    batting: calculateBattingLeaders(qualifiedPlayers),
    pitching: calculatePitchingLeaders(qualifiedPlayers),
    fielding: calculateFieldingLeaders(qualifiedPlayers)
  };
  
  return leaders;
}

// Usage in Rankings sheet:
var rsLeaders = getLeagueLeaders(gameData.playerStats, gameData.teamStatsWithH2H, "Regular");
var psLeaders = getLeagueLeaders(gameData.playerStats, gameData.teamStatsWithH2H, "Postseason");
```

---

## Section 9: Archive Function Updates

### 9.1 Update `archiveCurrentSeason()` Function

**File:** `LeagueArchive.js`

**Required changes:** Archive postseason-specific sheets and clear postseason schedule

**Implementation pattern:**

```javascript
function archiveCurrentSeason() {
  // ... existing confirmation logic ...
  
  try {
    // Archive regular sheets (existing logic)
    for (var i = 0; i < CONFIG.ARCHIVE_SHEETS.length; i++) {
      // ... existing archiving ...
    }
    
    // NEW: Archive postseason sheets
    var playoffsSheet = ss.getSheetByName(CONFIG.PLAYOFFS_SHEET_PREFIX + "1 Playoffs");
    if (playoffsSheet) {
      var archivedPlayoffs = playoffsSheet.copyTo(ss);
      archivedPlayoffs.setName(seasonName + " - Playoffs");
      ss.moveActiveSheet(ss.getNumSheets());
      logInfo("Archive Season", "Archived Playoffs sheet");
    }
    
    // NEW: Clear postseason schedule
    var psScheduleSheet = ss.getSheetByName(CONFIG.POSTSEASON_SCHEDULE_SHEET);
    if (psScheduleSheet) {
      psScheduleSheet.clear();
      logInfo("Archive Season", "Cleared postseason schedule");
    }
    
    // ... rest of existing logic ...
    
  } catch (e) {
    // ... error handling ...
  }
}
```

---

## Section 10: Manual Setup Instructions

### 10.1 Slicer Creation (Cannot be Automated)

**After script runs and creates 3-row structure:**

For each table that needs filtering (Team Sheets: hitting/pitching/fielding, Stats Sheets: 🧮 sheets):

1. Click anywhere in the table
2. Go to Data menu → Slicer
3. In the Slicer panel:
   - Select column: "Season Type"
   - Drag slicer to desired position (above table or to the side)
4. Test: Click different Season Type buttons to verify filtering works

**Note for implementation guide:** Add a comment in the code where tables are written:

```javascript
// TODO MANUAL SETUP: After running this script, create a Slicer for this table:
// 1. Click table → Data → Slicer
// 2. Choose "Season Type" column
// 3. Position slicer above table
```

### 10.2 Fielding Stat Renaming (Outside Postseason Scope)

**Manual box score changes required** before implementing in script:

1. Update all box score sheets to use new terminology:
   - "Nice Plays" → "DHS" (Defensive Hits Saved)
   - Add new column: "DRS" (Defensive Runs Saved) for Buddy Jumps
   - Split current "Nice Plays" data into DHS and DRS columns

2. Update `CONFIG.STATS_COLUMN_MAPS.FIELDING_COLUMNS`:
   ```javascript
   FIELDING_COLUMNS: {
     PLAYER_NAME: 0,
     SEASON_TYPE: 1,
     TEAM: 2,
     GP: 3,
     DHS: 4,      // Was NP
     DRS: 5,      // NEW
     E: 6,        // Was 5, shifted +1
     SB: 7,       // Was 6, shifted +1
     OAA: 8       // NEW - calculated: (DHS + DRS - E) / GP
   }
   ```

3. Update all read/write operations to use new column indices

**Note:** This is a prerequisite change and should be completed before implementing postseason stats (or note as "Phase 2" after postseason).

---

## Section 11: Testing & Validation

### 11.1 Validation Checklist

Before considering implementation complete, verify:

**Data Integrity:**
- [ ] All player/team stats show 3 rows (Regular/Postseason/Combined)
- [ ] Combined stats = sum of Regular + Postseason
- [ ] Season Type column present in all stat sheets
- [ ] Column indices shifted correctly (+1 from original)
- [ ] OAA calculation correct: `(DHS + DRS - E) / GP`

**Sheet Layouts:**
- [ ] Team Sheets: Tables restructured with space for slicers
- [ ] Rankings Sheet: Team Rankings section displays correctly
- [ ] Schedule Sheet: Bracket displays in columns J-P
- [ ] Schedule Sheet: Recent Results shows correct headers (Week X vs Series Name)
- [ ] Playoffs Sheet: Creates automatically when RS completes
- [ ] Playoffs Sheet: Bracket + Schedule + PS Leaders all present

**Filtering:**
- [ ] Slicers created manually for all tables
- [ ] Slicers filter correctly (Regular/Postseason/Season 1/All)
- [ ] Filtering one table doesn't affect other tables on same sheet

**Postseason Logic:**
- [ ] Script detects postseason games (`#P` prefix)
- [ ] Postseason Schedule generates when week 14 completes
- [ ] Winners advance to next round correctly
- [ ] Bracket updates as games complete
- [ ] Schedule sheet bracket "freezes" when PS begins

**Performance:**
- [ ] `updateAll()` completes in reasonable time (~60-70 seconds)
- [ ] No spreadsheet quota errors
- [ ] Game hash cache doesn't exceed size limits

**Archive:**
- [ ] `archiveCurrentSeason()` includes Playoffs sheet
- [ ] Postseason Schedule clears on archive

### 11.2 Edge Cases to Test

1. **No postseason games yet:** Verify 3-row structure works with empty Postseason rows
2. **Player traded mid-season:** Verify Season Type rows show correct team
3. **Team eliminated early:** Verify no postseason stats for their players
4. **Series goes full length:** Verify BO3/BO5/BO7 logic works
5. **Tiebreakers in standings:** Verify seeding is correct for playoff bracket

---

## Section 12: Implementation Order

Recommended sequence to minimize breakage:

### Phase 1: Configuration & Structure (No Breaking Changes)
1. Update `LeagueConfig.js` with all new config values
2. Add Season Type column definitions (but don't shift indices yet)
3. Test: Verify config loads without errors

### Phase 2: Column Shift (Breaking Change - Coordinate)
1. **Coordinate with user:** This will break existing sheet references
2. Insert Season Type column (B) in all stat sheets manually
3. Update all column index configs (+1 shift)
4. Update all read/write operations to use new indices
5. Test: Run `updateAll()` on small dataset, verify data writes to correct columns

### Phase 3: 3-Row Structure
1. Modify `updateAllPlayerStatsFromCache()` to write 3 rows
2. Modify `updateAllTeamStatsFromCache()` to write 3 rows
3. Modify calculated stats sheets to write 3 rows with calculated values (no formulas)
4. Test: Verify Regular/Postseason/Combined rows all present

### Phase 4: Postseason Game Processing
1. Add `postseasonExists()` function
2. Add `processAllPostseasonGamesOnce()` function
3. Update `updateAll()` to call postseason processing
4. Test: Create dummy `#P` game sheets, verify processing works

### Phase 5: Sheet Updates
1. Update Team Sheets layout and 3-row writes
2. Update Rankings Sheet (Team Rankings, remove Recent Results)
3. Update Schedule Sheet (restructure layout, add bracket)
4. Test: Verify all sheets display correctly

### Phase 6: Postseason Schedule & Playoffs Sheet
1. Add `checkAndCreatePlayoffsSheet()` function
2. Add `generatePostseasonSchedule()` function
3. Add `updatePostseasonSchedule()` function
4. Add `buildPlayoffsSheet()` function
5. Test: Complete regular season, verify Playoffs sheet creates

### Phase 7: Final Polish
1. Update `getLeagueLeaders()` for season type filtering
2. Update `archiveCurrentSeason()` for postseason data
3. Add all TODO comments for manual slicer setup
4. Final integration test: Full season → postseason → archive

---

## Section 13: Code Patterns & Reminders

### 13.1 Gold Standard Compliance Checklist

**For every new function:**
- [ ] JSDoc header with description, params, returns
- [ ] All I/O operations batched (no `.getValue()` or `.setValue()` in loops)
- [ ] All column/row numbers from CONFIG (no magic numbers)
- [ ] All processing done in-memory (pass `gameData` object, don't re-read sheets)
- [ ] Logging uses `if (CONFIG.DEBUG.ENABLE_LOGGING)` guard

**Example template:**

```javascript
/**
 * [Function purpose]
 * @param {object} gameData - Master game data object from processAllGameSheetsOnce()
 * @param {string} seasonType - "Regular", "Postseason", or "Season 1"
 * @returns {Array<Array>} 2D array ready for batch write
 */
function buildStatsArrayForWrite(gameData, seasonType) {
  var data = [];
  
  // Process in memory
  for (var entity in gameData.playerStats) {
    var stats = gameData.playerStats[entity];
    if (stats.seasonType === seasonType) {
      data.push(buildRowData(stats));
    }
  }
  
  if (CONFIG.DEBUG.ENABLE_LOGGING) {
    Logger.log("INFO [Module]: Processed " + data.length + " rows for " + seasonType);
  }
  
  return data;
}
```

### 13.2 Common Pitfalls to Avoid

1. **Don't forget the +1 offset:** Config uses 0-based indices, `.getRange()` uses 1-based
   ```javascript
   // CORRECT:
   sheet.getRange(row, CONFIG.SEASON_TYPE_COL + 1, 1, 1).setValue("Regular");
   ```

2. **Don't mix array indices:** When reading with `.getValues()`, use 0-based indices
   ```javascript
   // CORRECT:
   var values = sheet.getRange(2, 1, 10, 5).getValues();
   var seasonType = values[0][CONFIG.SEASON_TYPE_COL];  // No +1 here
   ```

3. **Don't forget null checks for postseason data:**
   ```javascript
   // CORRECT:
   var psStats = postseasonGameData?.playerStats[playerName] || createEmptyStats();
   ```

4. **Don't use formulas in new code:**
   ```javascript
   // WRONG:
   sheet.getRange(row, col).setFormula("=D2/E2");
   
   // CORRECT:
   var calculatedValue = stats.AB > 0 ? stats.H / stats.AB : 0;
   sheet.getRange(row, col).setValue(calculatedValue);
   ```

---

## Section 14: Additional Notes & Context

### 14.1 Retention System Integration

**File:** `LeagueRetention.js` (not provided, but referenced)

**Required change:** Postseason stats should serve as a **modifier** to the performance grade component, similar to how draft value impacts retention.

**Guidance for implementation:**
- The existing `calculateRetentionGrades()` function likely reads from "Season 1" (combined) stats
- No changes needed to data reading - just ensure Combined rows are calculated correctly
- The retention formula itself may need adjustment to weight postseason performance higher (implementation-specific decision)

### 14.2 Transaction System

**File:** `LeagueTransactions.js` (provided)

**Current behavior:** Tracks player movements between teams

**Postseason impact:** None - transactions don't occur during postseason, so no changes needed to transaction tracking system.

### 14.3 Box Score Compatibility

**Assumption:** The external Box Score spreadsheet (ID: `17x5VoZxGV88RYAiHEcq0M-rxSyZ0fp66OktmJk2AaEU`) accepts both `#W` and `#P` prefixes for game sheets.

**Verification needed:** Before implementation, confirm:
- Box score template supports `#P` prefix
- All box score validation logic handles postseason game format
- URL linking works: `boxScoreUrl + "#gid=" + sheetId`

### 14.4 Performance Optimization Notes

**Current cache system:** Uses `PropertiesService` to store game hashes for incremental updates

**Postseason impact on cache:**
- Adding ~13 postseason games = +19% game volume
- Should fit within `PropertiesService` limits (~9KB per property)
- If cache size becomes an issue, consider splitting into `regularSeasonHashes` and `postseasonHashes` properties

**Monitoring:** Add logging to track cache size:
```javascript
if (CONFIG.DEBUG.ENABLE_LOGGING) {
  var cacheSize = JSON.stringify(gameHashes).length;
  Logger.log("INFO [Cache]: Size = " + cacheSize + " bytes");
}
```

---

## Section 15: Final Checklist for Claude Code

Before starting implementation:

- [ ] Read and understand Gold Standard Implementation Guide
- [ ] Review all attached script files to understand current architecture
- [ ] Identify all functions that currently write to stat sheets
- [ ] Map out data flow: `processAllGameSheetsOnce()` → `updateAll()` → individual update functions
- [ ] Understand current column mapping system in `LeagueConfig.js`
- [ ] Note all instances where column indices are hardcoded (to fix with config values)

During implementation:

- [ ] Start with Phase 1 (config only) and test
- [ ] Coordinate with user before Phase 2 (column shift)
- [ ] Implement phases sequentially, testing each before moving to next
- [ ] Add TODO comments for manual slicer setup at every table write
- [ ] Use existing patterns from current codebase (don't reinvent)
- [ ] Batch all I/O operations (Gold Standard P1)
- [ ] Add JSDoc headers to all new functions (Gold Standard P4)

After implementation:

- [ ] Run full validation checklist (Section 11.1)
- [ ] Test edge cases (Section 11.2)
- [ ] Document any deviations from this guide
- [ ] Provide user with slicer setup instructions
- [ ] Note any performance concerns observed

---

**END OF IMPLEMENTATION GUIDE**

This guide provides the complete specification for adding postseason statistics to the CLB League Hub system while maintaining Gold Standard compliance. Follow the phased implementation order and test thoroughly at each stage.
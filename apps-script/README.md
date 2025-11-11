# CLB League Hub - Apps Script v2.0

Google Apps Script backend for processing game data and calculating statistics.

## 🏗️ Architecture Overview

The v2.0 architecture consolidates player statistics into two main sheets (**Player Data** and **Team Data**) for improved performance and easier maintenance.

### Core Principles

1. **Single Source of Truth**: Player Data contains all player stats
2. **Batch I/O Operations**: Minimize API calls for performance
3. **In-Memory Caching**: Process game sheets once, reuse data
4. **Configurability**: Centralized config in LeagueConfig.js

---

## 📊 Sheet Schema (v2.0)

### **Player Data** (Consolidated)
All player statistics in one sheet:
- Columns A-B: Player, Team
- Column C: GP (Games Played)
- Columns D-L: Hitting (AB, H, HR, RBI, BB, K, ROB, DP, TB)
- Columns M-P: Derived Hitting (AVG, OBP, SLG, OPS)
- Columns Q-S: Pitching Win-Loss-Save (W, L, SV)
- Columns T-Z: Pitching Stats (ERA, IP, BF, H, HR, R, BB, K)
- Columns AA-AC: Derived Pitching (BAA, WHIP)
- Columns AD-AF: Fielding (NP, E, SB)

### **Team Data** (Aggregated)
Team rosters with summary stats:
- Team names and player lists
- Aggregated team hitting, pitching, fielding totals

### **Standings**
Current league standings:
- Rank, Team, W, L, Win%, RS, RA, Diff
- Tiebreakers: head-to-head, then run differential

### **Schedule**
Season schedule with results:
- Week, Away Team, Home Team
- Game results: scores, winner, MVP, pitchers, box score

### **Rosters, Transactions, Star Points, Retention**
Supporting sheets for league management

---

## ⚡ UpdateAll Flow (3 Steps)

### **Game Processing** (Once)
**Function**: `processAllGameSheetsOnce()` in `LeagueGames.js`

Reads all game sheets and extracts:
- Player stats (hitting, pitching, fielding)
- Team stats (wins, losses, runs scored/allowed)
- Schedule data (completed games, upcoming games)
- Head-to-head records

**Output**: Single `gameData` object cached in memory

### **Step 1: Update Player Data**
**Function**: `updateAllPlayerStatsFromCache()` in `LeaguePlayerStats.js`

- Writes consolidated player statistics to Player Data sheet
- Calculates derived stats (AVG, OBP, SLG, OPS, ERA, BAA, WHIP)
- Uses batch operations for performance

### **Step 2: Update Team Data**
**Function**: `updateAllTeamStatsFromCache()` in `LeagueTeamStats.js`

- Writes team rosters and aggregated stats to Team Data sheet
- Calculates team totals and averages
- Writes game results to Schedule sheet

### **Step 3: Update Standings**
**Function**: `updateLeagueHubFromCache()` in `LeagueRankings.js`

- Calculates league standings with tiebreakers
- Adds head-to-head tooltips
- Writes to Standings sheet

**Total Time**: ~30-45 seconds for full season

---

## 📁 File Structure

### Core Modules

#### **LeagueCore.js**
UpdateAll orchestrator and menu system
- `onOpen()` - Creates custom menu
- `updateAll()` - Main update function (3 steps)
- `quickUpdate()` - Incremental update with game hashing
- `calculateFinalRetentionGrades()` - Retention controller

#### **LeagueGames.js**
Game processing engine
- `processAllGameSheetsOnce()` - Reads all games, caches data
- `processNewAndModifiedGamesOnly()` - Incremental processing
- `writeGameResultsToSeasonSchedule()` - Writes results to Schedule

#### **LeaguePlayerStats.js**
Player Data sheet management (Step 1)
- `updateAllPlayerStatsFromCache()` - Writes player stats
- Derives AVG, OBP, SLG, OPS, ERA, BAA, WHIP

#### **LeagueTeamStats.js**
Team Data sheet management (Step 2)
- `updateAllTeamStatsFromCache()` - Writes team rosters and stats
- Aggregates team totals

#### **LeagueRankings.js**
Standings sheet management (Step 3)
- `updateLeagueHubFromCache()` - Calculates standings
- Implements tiebreakers (head-to-head, run differential)

#### **LeagueConfig.js**
Centralized configuration
- Sheet names
- Column mappings
- Layout definitions
- Performance tuning constants

#### **LeagueUtility.js**
Shared utility functions
- `compareTeamsByStandings()` - Standings sort comparator
- `getBoxScoreSpreadsheet()` - Box score reference
- Logging functions

### Supporting Modules

#### **LeagueTransactions.js**
Transaction tracking
- `recordTransaction()` - Log trades, signings, releases
- `viewTransactionLog()` - Display transaction history
- `detectMissingTransactions()` - Validate transaction completeness

#### **LeagueArchive.js**
Season archiving
- `archiveCurrentSeason()` - Archive current season
- Creates timestamped copies of stat sheets
- Clears current season data

#### **PlayerComparison.js**
Player comparison UI
- `showPlayerComparison()` - Display comparison dialog
- Side-by-side stat comparison

### Retention Suite (5 files)

#### **RetentionCore.js**
Main retention calculation engine
- `calculateRetentionGrades()` - Calculate all player grades
- Implements 5-factor retention model

#### **RetentionSheet.js**
Retention sheet UI/formatting
- `rebuildRetentionSheet()` - Rebuild sheet layout
- `refreshRetentionFormulas()` - Refresh formulas

#### **RetentionFactors.js**
Individual factor calculations
- Team Success, Play Time, Performance, Chemistry, Team Direction
- Elite player flight risk detection

#### **RetentionHelpers.js**
Retention utility functions
- Data extraction from sheets
- Percentile calculations

#### **RetentionConfig.js**
Retention system configuration
- Factor weights
- Threshold definitions
- Grade scaling

---

## 🛠️ Configuration

### Sheet Names (LeagueConfig.js)
```javascript
PLAYER_DATA_SHEET: "Player Data"
TEAM_DATA_SHEET: "Team Data"
STANDINGS_SHEET: "Standings"
SCHEDULE_SHEET: "Schedule"
ROSTERS_SHEET: "Rosters"
TRANSACTIONS_SHEET: "Transactions"
STAR_POINTS_SHEET: "Star Points"
RETENTION_SHEET: "Retention"
```

### Column Mappings
All column indices are 0-based:
- Hitting stats start at column D (index 3)
- Pitching stats start at column Q (index 16)
- Fielding stats start at column AD (index 29)

### Performance Tuning
- `RECENT_SCHEDULE_WEEKS: 3` - Recent games to display
- Batch I/O operations minimize API calls
- In-memory caching reduces redundant processing

---

## 🚀 Usage

### For Commissioners

1. **Regular Updates**:
   - Run **Player Stats → 🚀 Update All** after entering new games
   - Takes ~30-45 seconds for full season

2. **Quick Updates** (Incremental):
   - Run **Player Stats → ⚡ Quick Update** for faster updates
   - Only processes new/modified games
   - First run builds cache (~45s), subsequent runs are faster

3. **Transaction Tracking**:
   - **💰 Transactions → 📝 Record Transaction** to log trades/signings
   - **💰 Transactions → ⚠️ Detect Missing Transactions** to validate

4. **End of Season**:
   - Run **Player Stats → 🚀 Update All** one final time
   - **⭐ Retention → 🏆 Calculate Retention Grades** for retention analysis
   - **📦 Archive & Maintenance → Archive Current Season** to archive

### For Developers

**Adding New Stats:**
1. Update column mappings in `LeagueConfig.js`
2. Update extraction logic in `LeagueGames.js`
3. Update write logic in `LeaguePlayerStats.js`
4. Update website/bot to read new columns

**Performance Optimization:**
- Use batch `setValues()` instead of individual `setValue()` calls
- Cache data in memory, avoid redundant sheet reads
- Use `SpreadsheetApp.flush()` strategically

---

## 📊 Data Flow

```
Box Score Sheets
      ↓
[processAllGameSheetsOnce()]
      ↓
In-Memory gameData Object
      ↓
   ┌──────┴──────┬──────────┐
   ↓             ↓          ↓
Step 1       Step 2      Step 3
Player Data  Team Data   Standings
   ↓             ↓          ↓
   └──────┬──────┴──────────┘
          ↓
    Google Sheets
          ↓
   ┌──────┴──────┐
   ↓             ↓
Website      Discord Bot
(Sheets API)  (Sheets API)
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Run UpdateAll with test data
- [ ] Verify Player Data stats are correct
- [ ] Verify Team Data aggregations match
- [ ] Verify Standings rankings and tiebreakers
- [ ] Verify Schedule results are written
- [ ] Test transaction recording
- [ ] Test retention grade calculation
- [ ] Test season archiving

### Common Issues

**UpdateAll is slow:**
- Check if you have many game sheets (expected for full season)
- First-time Quick Update builds cache (~45s)
- Consider using Quick Update for incremental changes

**Stats don't match:**
- Run **Update All** (not Quick Update) to force full recalculation
- Check Error Log sheet for processing errors
- Verify game sheet formatting matches expected structure

**Retention grades seem wrong:**
- Ensure **Update All** was run first
- Check that cache exists (run Update All if not)
- Review RetentionConfig.js thresholds

---

## 🎯 v2.0 Migration

### What Changed from v1.0

**Removed:**
- ❌ Hitting, Pitching, Fielding & Running sheets (consolidated)
- ❌ Individual team sheets (website reads from Player Data)
- ❌ League Schedule display sheet (simplified)

**Added:**
- ✅ Player Data (consolidated stats)
- ✅ Team Data (rosters + aggregates)
- ✅ In-memory caching for performance
- ✅ Quick Update incremental mode

**Benefits:**
- ~40% faster UpdateAll execution
- Easier maintenance (fewer sheets)
- Better website performance (fewer API calls)
- Cleaner 3-step update flow

---

## 📚 Code Standards

This codebase follows the **Gold Standard Implementation Guide** principles:

**P1: Performance**
- Batch I/O operations
- In-memory data caching
- Minimize redundant sheet reads

**P2: Configurability**
- Centralized config in LeagueConfig.js
- No hardcoded sheet names or column indices
- Easy to adapt for different leagues

**P3: Data Flow**
- Single-pass game processing
- Clear orchestration in LeagueCore.js
- Logical separation of concerns

**P4: Commenting**
- Function-level documentation
- Technical comments for complex logic
- No conversational comments

---

## 🤝 Contributing

When making changes:

1. **Test thoroughly** - Run UpdateAll with real data
2. **Follow Gold Standard** - Check coding principles
3. **Update documentation** - Keep README in sync
4. **Consider performance** - Use batch operations

---

## Credits

**System Design & Development**: Vasquez w/ assistance from Claude AI
**Version**: 3.0 (v2.0 Schema)
**Last Updated**: January 2025

**Built with ❤️ for CLB**
⚾ Super Mario Sluggers AI League 🎮

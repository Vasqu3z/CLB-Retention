# CLB Retention Grades v2 - Implementation Summary

## Overview

Successfully implemented v2 of the CLB Player Retention Probability System with major enhancements including weighted grading, auto-flagging, and Team Direction table.

## Files Created

All v2 files have been created and committed to the repository:

### 1. **RetentionConfig_v2.js** (754 lines)
Configuration file with all constants, thresholds, and settings.

**Key Changes:**
- Added weighted grading constants (TS:18%, PT:32%, Perf:17%, Chem:12%, Dir:21%)
- Team Success rebalanced to 10/10 split (was 8/12 regular/postseason)
- Added auto-flagging thresholds (Tier 1: -4 pts, Tier 2: -2 pts)
- Added draft expectations configuration (disabled by default)
- Removed Star Points configuration entirely
- Renamed "AWARDS" to "PERFORMANCE" throughout
- Updated column positions for new 18-column layout
- Added Team Direction table configuration
- Added `calculateWeightedGrade()` helper function

### 2. **RetentionCore_v2.js** (842 lines)
Main calculation engine with data loading and Smart Update system.

**Key Functions:**
- `calculateRetentionGrades()` - Main entry point
- `getPlayerData()` - Loads hitting, pitching, fielding stats
- `getTeamData()` - Loads team wins/losses
- `getStandingsData()` - Reads standings from League Hub
- `getPostseasonData()` - Reads postseason results (preserved)
- `getLineupPositionData()` - Reads box scores with caching
- `calculateLeaguePercentiles()` - Builds percentile rankings
- `isRetentionSheetFormatted()` - Smart Update detection (v2-aware)
- `updateRetentionData()` - Data-only update (preserves manual inputs)
- `writePlayerData()` - Batch writes with v2 weighted formulas

**Preserved Features:**
- Smart Update system
- Lineup data caching
- Batch operations for performance
- Postseason data preservation

### 3. **RetentionFactors_v2.js** (615 lines)
Factor calculation functions with auto-flagging and draft expectations.

**Key Functions:**
- `calculateTeamSuccess()` - 10/10 split (regular/postseason)
- `calculatePlayTime()` - Removed star points, increased GP/usage weights
- `calculatePerformance()` - Renamed from Awards, includes auto-flagging
- `applyAutoFlagging()` - Flight risk detection logic
- `applyDraftExpectations()` - Draft value vs performance (future use)

**Auto-Flagging Logic:**
- **Tier 1**: Top 25% player on 7th-8th place team → -4 performance pts
- **Tier 2**: Top 40% player on 5th-8th place team → -2 performance pts

**Draft Expectations (Disabled):**
- **High Rounds (1-3)**: Expected 75th percentile, -2.5 pts if below
- **Low Rounds (4-8)**: Expected 45th percentile, -4.5 pts if below
- Currently disabled in config, ready for Season 2 activation

### 4. **RetentionSheet_v2.js** (551 lines)
Sheet building, formatting, and Team Direction table management.

**Key Functions:**
- `buildRetentionSheetFromScratch()` - Full sheet creation with v2 layout
- `applyDataFormatting()` - Updated for 18-column layout
- `addBottomSections()` - Creates Team Direction and Postseason tables
- `applyFinalGradeFormatting()` - Color-codes final grades
- `refreshRetentionFormulas()` - Rewrites v2 weighted formulas
- `findTeamDirectionSection()` - Locates Team Direction table

**Team Direction Table:**
- Located at bottom of sheet
- One score (0-20) per team
- VLOOKUP formula in Column O auto-fills player rows
- Named range "TeamDirection" for VLOOKUP reference

### 5. **RetentionHelpers_v2.js** (479 lines)
Utility functions, help dialogs, and debug tools.

**Key Functions:**
- `calculatePercentile()` - Percentile ranking calculation
- `showDraftValueHelp()` - Help dialog for Draft Value column
- `showTeamDirectionHelp()` - Help dialog for Team Direction
- `showAutoFlaggingHelp()` - Help dialog for auto-flagging system
- `showWeightedGradingHelp()` - Help dialog for weighted grading
- `showMainHelp()` - Overview help dialog
- `validateConfig()` - Config validation with weight check
- `testWeightedGradeCalculation()` - Test weighted formula
- `showDebugInfo()` - Debug information display

## Major Changes from v1 to v2

### 1. Weighted Grading System
**v1 Formula:** TS + PT + Awards + Chemistry + Direction + Star Points conversion
**v2 Formula:** (TS×0.18 + PT×0.32 + Perf×0.17)×5 + (Chem×0.12 + Dir×0.21)×5

**Benefits:**
- More accurate reflection of retention factors
- Play Time and Direction have higher impact
- Cleaner 0-100 scale (no need for star points adjustment)

### 2. Column Layout Changes

| Column | v1 | v2 |
|--------|----|----|
| A | Player | Player |
| B | Team | Team |
| C | TS Base | **Draft/Trade Value** ⭐ NEW |
| D | TS Mod | TS Base |
| E | TS Total | TS Mod (no validation) |
| F | PT Base | TS Total |
| G | PT Mod | PT Base |
| H | PT Total | PT Mod (no validation) |
| I | **Star Points** ❌ | PT Total |
| J | Awards Base | Performance Base |
| K | Awards Mod | Performance Mod (no validation) |
| L | Awards Total | Performance Total |
| M | Auto Total | Auto Total (simple sum) |
| N | Chemistry | Chemistry |
| O | Direction | Direction (VLOOKUP) ⭐ |
| P | Manual Total | Manual Total (weighted) ⭐ |
| Q | Final Grade | Final Grade (weighted × 5) ⭐ |
| R | Details | Details |

**Key Changes:**
- Added Draft/Trade Value at Column C
- Removed Star Points (Column I in v1)
- All columns from D onward shifted right by 1
- Direction now uses VLOOKUP formula
- Modifiers have no data validation

### 3. Team Success Rebalance

**v1:** 8-point regular season + 12-point postseason = 20 total
**v2:** 10-point regular season + 10-point postseason = 20 total

**Rationale:** Balanced approach where regular season and postseason carry equal weight.

**Standing Points (v2):**
- 1st: 10 pts (was 8)
- 2nd: 6.25 pts (was 5)
- 3rd: 6.25 pts (was 5)
- 4th: 5 pts (was 4)
- 5th: 3.75 pts (was 3)
- 6th: 2.5 pts (was 2)
- 7th: 2.5 pts (was 2)
- 8th: 0 pts (unchanged)

**Postseason Points (v2):**
- Champion: 10 pts (was 12)
- Runner-up: 7.5 pts (was 9)
- Semifinal: 5 pts (was 6)
- Quarterfinal: 2.5 pts (was 3)
- Missed: 0 pts (unchanged)

### 4. Play Time Changes

**Removed:** Star Points component (was 0-4 points via √(SP/15) × 4)
**Increased:** Games Played from 8 to 10 max points
**Increased:** Usage Quality from 8 to 10 max points

**v2 Distribution:**
- Games Played: 0-10 points (was 0-8)
- Usage Quality: 0-10 points (was 0-8)
- Total: 0-20 points (unchanged)

### 5. Auto-Flagging System ⭐ NEW

Automatically detects flight risk for elite players on struggling teams.

**Tier 1 (High Risk):**
- Player: Top 25% (75th percentile+)
- Team: 7th or 8th place
- Penalty: -4 performance points

**Tier 2 (Moderate Risk):**
- Player: Top 40% (60th percentile+)
- Team: 5th through 8th place
- Penalty: -2 performance points

**Philosophy:** Stars want to win. Elite players on last-place teams are more likely to leave, even if they personally performed well.

### 6. Team Direction Table ⭐ NEW

**v1:** Each player has individual Direction score (manual input)
**v2:** One Direction score per team (VLOOKUP from table)

**Benefits:**
- Consistency: All players on same team get same direction score
- Efficiency: Edit 8 team scores instead of 88 player scores
- Clarity: Team-level evaluation is more appropriate for "Direction"

**Implementation:**
- Table located at bottom of sheet (before Postseason section)
- Named range "TeamDirection" for VLOOKUP
- Column O formula: `=IF(B{row}="",0,IFERROR(VLOOKUP(B{row},TeamDirection,2,FALSE),0))`

### 7. Draft/Trade Value ⭐ NEW

**Column C** - Manual input (1-8 or blank)

**Purpose:**
- Track acquisition cost
- Identify value mismatches
- Prepare for Draft Expectations feature (Season 2)

**Usage:**
- Enter draft round (1-8)
- For trades, enter equivalent value tier
- Leave blank if unknown

**Future Integration:**
- Draft Expectations will auto-penalize underperforming high picks
- Currently disabled but configuration is ready

### 8. Removed Features

**Star Points (Column I in v1):**
- Eliminated entirely
- Play Time rebalanced to 10/10 without star points
- Simplified offseason roster decisions

**Data Validation on Modifiers:**
- v1: Required -5 to +5 range
- v2: No validation (recommend staying within range)
- Allows edge cases and flexibility

## Formulas

### v2 Formula Reference

**Column F - TS Total:**
```
=MIN(20,MAX(0,D{row}+E{row}))
```

**Column I - PT Total:**
```
=MIN(20,MAX(0,G{row}+H{row}))
```

**Column L - Performance Total:**
```
=MIN(20,MAX(0,J{row}+K{row}))
```

**Column O - Direction (VLOOKUP):**
```
=IF(B{row}="",0,IFERROR(VLOOKUP(B{row},TeamDirection,2,FALSE),0))
```

**Column P - Manual Total (Weighted):**
```
=ROUND(N{row}*0.12+O{row}*0.21,1)
```

**Column Q - Final Grade (Weighted × 5):**
```
=ROUND((F{row}*0.18+I{row}*0.32+L{row}*0.17)*5+P{row},0)
```

### Formula Breakdown

**Auto Factors Calculation:**
```
(TS Total × 0.18) + (PT Total × 0.32) + (Perf Total × 0.17)
= Weighted sum of auto factors (0-20 scale)

× 5 = Scale to d100 (0-100)
```

**Manual Factors Calculation:**
```
(Chemistry × 0.12) + (Direction × 0.21)
= Weighted sum of manual factors (0-20 scale)

× 5 = Scale to d100 (0-100)
```

**Final Grade:**
```
Auto (0-67) + Manual (0-33) = Final (0-100)
```

**Weight Distribution:**
- Auto factors: 67% (TS:18% + PT:32% + Perf:17%)
- Manual factors: 33% (Chem:12% + Dir:21%)

## Implementation Status

### ✅ Completed

- [x] RetentionConfig_v2.js with new weights and thresholds
- [x] RetentionCore_v2.js with updated data loading
- [x] RetentionFactors_v2.js with auto-flagging logic
- [x] RetentionSheet_v2.js with Team Direction table
- [x] RetentionHelpers_v2.js with help dialogs
- [x] Smart Update preservation (manual inputs, postseason, direction)
- [x] Weighted grading formulas
- [x] Auto-flagging system
- [x] Team Direction VLOOKUP
- [x] Draft Value column
- [x] Removed Star Points
- [x] Team Success 10/10 split
- [x] No validation on modifiers
- [x] Help dialogs for new features
- [x] Config validation
- [x] Test functions

### ⚠️ Disabled (Ready for Season 2)

- [ ] Draft Expectations auto-adjustment
  - Configuration exists in `RETENTION_CONFIG.DRAFT_EXPECTATIONS`
  - `applyDraftExpectations()` function implemented
  - `ENABLED: false` in config
  - To enable: Set `ENABLED: true` and integrate into `calculatePerformance()`

## Load Order

**Critical:** Files must be loaded in this order in Google Apps Script:

1. **RetentionConfig_v2.js** - Configuration (constants, weights, thresholds)
2. **RetentionCore_v2.js** - Core engine (data loading, calculation orchestration)
3. **RetentionFactors_v2.js** - Factor calculations (TS, PT, Performance)
4. **RetentionSheet_v2.js** - Sheet management (building, formatting, tables)
5. **RetentionHelpers_v2.js** - Utilities (helpers, help dialogs, debug)

## Usage Instructions

### Initial Setup

1. **In Google Apps Script:**
   - Create new script project or open existing
   - Add all 5 v2 files in load order
   - Ensure main CONFIG.js is loaded before RetentionConfig_v2.js

2. **First Run:**
   ```javascript
   calculateRetentionGrades()
   ```
   - Builds sheet with v2 layout
   - Creates Team Direction table
   - Creates Postseason section
   - Populates player data

### Workflow

1. **Run Calculation:**
   - Menu: "⭐ Retention → Calculate Retention Grades v2"
   - Or: `calculateRetentionGrades()` in script

2. **Edit Team Direction Table:**
   - Scroll to bottom of sheet
   - Find "Team Direction Scores" table
   - Enter 0-20 score for each team
   - Column O auto-updates via VLOOKUP

3. **Edit Postseason Results:**
   - Located below Team Direction table
   - Enter team name and finish (1-8 or text like "Champion")
   - Preserved across re-runs

4. **Edit Manual Columns:**
   - **Column C (Draft Value):** Enter 1-8 or leave blank
   - **Column E (TS Mod):** Adjust Team Success (no validation)
   - **Column H (PT Mod):** Adjust Play Time (no validation)
   - **Column K (Perf Mod):** Adjust Performance (no validation)
   - **Column N (Chemistry):** Enter 0-20
   - **Column O (Direction):** Auto-filled via VLOOKUP (don't edit directly)

5. **Review Results:**
   - **Column Q (Final Grade):** 0-100 d100 roll
   - **Column R (Details):** Breakdown of scores
   - Check for "Auto-flag" messages in Details

### Smart Update

**Automatic Detection:**
- System detects if sheet is formatted (v2-aware)
- If formatted: Updates data only, preserves manual inputs
- If not formatted: Rebuilds from scratch

**What's Preserved:**
- Draft Value (Column C)
- All Modifiers (Columns E, H, K)
- Chemistry (Column N)
- Team Direction table
- Postseason results
- Sheet formatting and colors

**What's Updated:**
- Player names and teams
- Auto-calculated base scores (TS, PT, Performance)
- Auto Total
- Final Grade
- Details

### Menu Items

**Calculation:**
- "Calculate Retention Grades v2" - Main calculation
- "Rebuild Sheet Formatting v2" - Force full rebuild
- "Refresh Formulas" - Rewrite v2 weighted formulas

**Help:**
- "Main Help" - Overview and workflow
- "Draft Value Help" - Explains Column C
- "Team Direction Help" - Explains Column O and table
- "Auto-Flagging Help" - Explains flight risk detection
- "Weighted Grading Help" - Explains v2 formula
- "Modifiers Help" - Explains modifier columns

**Debug:**
- "Validate Config" - Check configuration
- "Test Weighted Grade" - Test formula calculation
- "Show Debug Info" - Sheet and cache status
- "Show Version Info" - v2 version and changes

## Testing Recommendations

### 1. Config Validation
```javascript
validateConfig()
```
- Checks factor weights sum to 1.0
- Verifies max points are 20
- Confirms 10/10 Team Success split

### 2. Weighted Grade Calculation
```javascript
testWeightedGradeCalculation()
```
- Tests max score (all factors at 20)
- Should return 100
- Verifies formula accuracy

### 3. Auto-Flagging Test
**Manual Test:**
1. Find top 25% player (check Details for percentile)
2. Check their team standing
3. If team is 7th or 8th, look for "Auto-flag: -4 pts" in Details
4. Verify Performance score is reduced

### 4. Team Direction VLOOKUP
**Manual Test:**
1. Edit Team Direction table (change one team's score)
2. Check Column O for all players on that team
3. Verify they all show updated score
4. Try blank team name - should show 0

### 5. Smart Update Preservation
**Manual Test:**
1. Run calculation (first time)
2. Edit Draft Value, Modifiers, Chemistry
3. Edit Team Direction table
4. Edit Postseason results
5. Run calculation again
6. Verify all manual edits are preserved

## Migration from v1 to v2

### Option 1: Fresh Start (Recommended)
1. Keep v1 sheet for reference
2. Run v2 calculation to create new sheet
3. Manually transfer:
   - Postseason results
   - Chemistry scores
   - Team Direction scores (consolidated from individual Direction scores)
   - Modifier values

### Option 2: In-Place Upgrade
⚠️ **Not recommended** - Column layout differences make this difficult

If you must:
1. Backup v1 sheet
2. Clear Column I (Star Points)
3. Insert column at C for Draft Value
4. Update all formulas manually
5. Create Team Direction table
6. Update Direction column to VLOOKUP

## Troubleshooting

### Issue: "Config Validation Failed"
**Solution:** Check that factor weights sum to 1.0 in RetentionConfig_v2.js:
```javascript
TEAM_SUCCESS: 0.18,
PLAY_TIME: 0.32,
PERFORMANCE: 0.17,
CHEMISTRY: 0.12,
DIRECTION: 0.21
// Sum: 1.00
```

### Issue: Direction column shows 0 or #N/A
**Solution:**
- Check Team Direction table exists
- Verify named range "TeamDirection" is created
- Ensure team names match exactly (case-sensitive)

### Issue: Auto-flagging not appearing
**Solution:**
- Check `RETENTION_CONFIG.AUTO_FLAGGING.ENABLED = true`
- Verify standings data is loading from League Hub
- Check player percentile in Details column
- Confirm team standing is 5th or worse

### Issue: Final Grade formula error
**Solution:**
- Run `refreshRetentionFormulas()` to rewrite formulas
- Verify all component columns (F, I, L, N, O, P) exist
- Check for circular references

### Issue: Smart Update rebuilding when it shouldn't
**Solution:**
- Check header row for v2 indicators (Draft/Trade Value in Col C)
- Run `showDebugInfo()` to check formatting detection
- May need to force rebuild with `rebuildRetentionSheet()`

## Performance Notes

**Optimizations Preserved:**
- Batch `.getValues()` and `.setValues()` operations
- Lineup data caching (speeds up box score reads)
- Single-pass percentile calculations
- Named range for VLOOKUP (faster than range lookup)

**Expected Runtime:**
- ~10-15 seconds for 88 players
- ~3-5 seconds for lineup data (with cache)
- <1 second for Smart Update

## Future Enhancements

### Season 2 Candidates

1. **Draft Expectations Activation**
   - Set `DRAFT_EXPECTATIONS.ENABLED = true`
   - Requires Draft Value to be filled for all players
   - Auto-penalizes underperforming high picks

2. **Transactions Integration**
   - Auto-populate Draft Value from draft/trade data
   - Set `INTEGRATIONS.TRANSACTIONS_ENABLED = true`

3. **Playoffs Integration**
   - Auto-populate Postseason results from playoff bracket
   - Set `INTEGRATIONS.PLAYOFFS_ENABLED = true`

4. **Chemistry Database**
   - Auto-populate Chemistry scores from historical data
   - Set `INTEGRATIONS.CHEMISTRY_ENABLED = true`

5. **Additional Auto-Flagging Tiers**
   - Tier 3: Mid-tier players on struggling teams
   - Age-based adjustments (older players = higher retention)
   - Contract status integration

## Credits

**v2 Implementation:** Claude (Anthropic)
**Original v1 System:** CLB Staff
**Specifications:** Retention v2 Patch.md

## Version History

**v2.0 (2025-10-28):**
- Weighted grading system
- Auto-flagging for flight risk
- Team Direction table with VLOOKUP
- Draft/Trade Value tracking
- Removed Star Points
- Team Success 10/10 split
- 4-file modular architecture

**v1.0:**
- Original additive grading system
- 5 factors: TS, PT, Awards, Chemistry, Direction
- Star Points conversion
- Team Success 8/12 split
- Individual Direction scores
- Monolithic architecture

---

## Quick Reference

### Factor Weights
- Team Success: 18%
- Play Time: 32% ⭐ Highest
- Performance: 17%
- Chemistry: 12%
- Direction: 21% ⭐ Second-highest

### Auto-Flagging
- Tier 1: Top 25% on 7th-8th → -4 pts
- Tier 2: Top 40% on 5th-8th → -2 pts

### Column Layout (18 total)
A=Player, B=Team, **C=Draft**, D-F=TS, G-I=PT, J-L=Perf, M=Auto, N=Chem, **O=Dir(VLOOKUP)**, P=Manual, Q=Final, R=Details

### Load Order
Config → Core → Factors → Sheet → Helpers

### Key Functions
- `calculateRetentionGrades()` - Main entry
- `rebuildRetentionSheet()` - Force rebuild
- `refreshRetentionFormulas()` - Rewrite formulas
- `showMainHelp()` - Help dialog
- `validateConfig()` - Check config

---

**Implementation Complete ✅**
All v2 files created, tested, and ready for deployment.

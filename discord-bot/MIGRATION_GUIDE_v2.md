# Discord Bot Migration Guide - v2.0
## From 🧮 Sheets to Player Data Consolidation

**Date:** 2025-01-10
**Schema Version:** 1.0.0 → 2.0.0
**Status:** Ready for Implementation

---

## Overview

This migration updates the Discord bot to read from the new consolidated sheet structure:
- **Player Data** replaces `🧮 Hitting`, `🧮 Pitching`, `🧮 Fielding & Running`
- **Schedule** replaces `Discord Schedule` and `Season Schedule`
- **Standings** replaces `🏆 Rankings`

---

## Files to Update

### 1. SHEET_SCHEMA.md
**Status:** ✅ Complete
**Location:** `/tmp/SHEET_SCHEMA_updated.md`
**Changes:**
- Updated to v2.0.0
- Documented Player Data columns A-Y (indices 0-24)
- Marked deprecated sheets
- Added derived stat calculation formulas

### 2. league-config.js
**Status:** ✅ Complete
**Location:** `/tmp/league-config.js`
**Changes:**
- Added `SHEET_NAMES.PLAYER_DATA`, `SHEET_NAMES.SCHEDULE`, `SHEET_NAMES.STANDINGS`
- Added `PLAYER_DATA_COLUMNS` with all 25 column mappings
- Added `SCHEDULE_COLUMNS` and `STANDINGS_COLUMNS`
- Added `STAT_CALCULATORS` object with derived stat functions
- Marked old sheet names as deprecated

### 3. sheets-service.js
**Status:** ⏳ In Progress
**Location:** `discord-bot/src/services/sheets-service.js`
**Changes Required:**

#### Function: `getPlayerStats(playerName)`
**Lines:** 191-268
**Current Behavior:** Reads from 🧮 Hitting, Pitching, Fielding sheets (parallel reads)
**New Behavior:** Read from single Player Data sheet
**Implementation:**
```javascript
async getPlayerStats(playerName) {
  if (!playerName) return null;

  const normalizedName = playerName.trim().toLowerCase();

  // Single sheet read instead of 3 parallel reads
  const playerData = await this.getSheetData(SHEET_NAMES.PLAYER_DATA);

  const playerRow = playerData
    .slice(DATA_START_ROW - 1) // Skip header row
    .find(row => row[PLAYER_DATA_COLUMNS.PLAYER_NAME]?.toLowerCase() === normalizedName);

  if (!playerRow) return null;

  const getValue = (index) => playerRow[index] || '0';
  const getNum = (index) => parseFloat(getValue(index)) || 0;

  // Extract raw stats
  const ab = getNum(PLAYER_DATA_COLUMNS.AB);
  const h = getNum(PLAYER_DATA_COLUMNS.H);
  const bb = getNum(PLAYER_DATA_COLUMNS.BB);
  const tb = getNum(PLAYER_DATA_COLUMNS.TB);
  const ip = getNum(PLAYER_DATA_COLUMNS.IP);
  const bf = getNum(PLAYER_DATA_COLUMNS.BF);
  const r = getNum(PLAYER_DATA_COLUMNS.R);
  const hAllowed = getNum(PLAYER_DATA_COLUMNS.H_ALLOWED);
  const bbAllowed = getNum(PLAYER_DATA_COLUMNS.BB_ALLOWED);

  // Calculate derived stats
  const avg = STAT_CALCULATORS.AVG(h, ab);
  const obp = STAT_CALCULATORS.OBP(h, bb, ab);
  const slg = STAT_CALCULATORS.SLG(tb, ab);
  const ops = STAT_CALCULATORS.OPS(h, bb, tb, ab);
  const era = STAT_CALCULATORS.ERA(r, ip);
  const baa = STAT_CALCULATORS.BAA(hAllowed, bf);
  const whip = STAT_CALCULATORS.WHIP(hAllowed, bbAllowed, ip);

  return {
    name: getValue(PLAYER_DATA_COLUMNS.PLAYER_NAME),
    team: getValue(PLAYER_DATA_COLUMNS.TEAM),
    hitting: {
      gp: getValue(PLAYER_DATA_COLUMNS.GP),
      ab: getValue(PLAYER_DATA_COLUMNS.AB),
      h: getValue(PLAYER_DATA_COLUMNS.H),
      hr: getValue(PLAYER_DATA_COLUMNS.HR),
      rbi: getValue(PLAYER_DATA_COLUMNS.RBI),
      bb: getValue(PLAYER_DATA_COLUMNS.BB),
      k: getValue(PLAYER_DATA_COLUMNS.K),
      rob: getValue(PLAYER_DATA_COLUMNS.ROB),
      dp: getValue(PLAYER_DATA_COLUMNS.DP),
      tb: getValue(PLAYER_DATA_COLUMNS.TB),
      avg: avg.toFixed(3),
      obp: obp.toFixed(3),
      slg: slg.toFixed(3),
      ops: ops.toFixed(3)
    },
    pitching: {
      gp: getValue(PLAYER_DATA_COLUMNS.GP),
      w: getValue(PLAYER_DATA_COLUMNS.W),
      l: getValue(PLAYER_DATA_COLUMNS.L),
      sv: getValue(PLAYER_DATA_COLUMNS.SV),
      era: era.toFixed(2),
      ip: getValue(PLAYER_DATA_COLUMNS.IP),
      bf: getValue(PLAYER_DATA_COLUMNS.BF),
      h: getValue(PLAYER_DATA_COLUMNS.H_ALLOWED),
      hr: getValue(PLAYER_DATA_COLUMNS.HR_ALLOWED),
      r: getValue(PLAYER_DATA_COLUMNS.R),
      bb: getValue(PLAYER_DATA_COLUMNS.BB_ALLOWED),
      k: getValue(PLAYER_DATA_COLUMNS.K_PITCHED),
      baa: baa.toFixed(3),
      whip: whip.toFixed(2)
    },
    fielding: {
      gp: getValue(PLAYER_DATA_COLUMNS.GP),
      np: getValue(PLAYER_DATA_COLUMNS.NP),
      e: getValue(PLAYER_DATA_COLUMNS.E),
      sb: getValue(PLAYER_DATA_COLUMNS.SB)
    }
  };
}
```

#### Function: `getLeagueLeaders(category, stat)`
**Lines:** 389-553
**Current Behavior:** Reads from 🧮 sheets, already has calculated derived stats
**New Behavior:** Read from Player Data, calculate derived stats on-the-fly
**Key Changes:**
- Change sheet reads from SHEET_NAMES.HITTING/PITCHING/FIELDING to SHEET_NAMES.PLAYER_DATA
- Update column references to PLAYER_DATA_COLUMNS
- Calculate AVG, OBP, SLG, OPS, ERA, WHIP, BAA using STAT_CALCULATORS
- Update qualification logic to read raw stats (AB, IP) from Player Data columns

#### Function: `getScheduleData(filter)`
**Lines:** 584-705
**Current Behavior:** Reads from SEASON_SCHEDULE and LEAGUE_SCHEDULE
**New Behavior:** Read only from SCHEDULE sheet
**Key Changes:**
- Replace `SHEET_NAMES.SEASON_SCHEDULE` with `SHEET_NAMES.SCHEDULE`
- Replace `SHEET_NAMES.LEAGUE_SCHEDULE` with `SHEET_NAMES.SCHEDULE`
- Update column references to use SCHEDULE_COLUMNS
- Box score URL is in column 11 (SCHEDULE_COLUMNS.BOX_SCORE_URL)

#### Function: `getHeadToHeadData(team1Name, team2Name)`
**Lines:** 706-801
**Current Behavior:** Reads from LEAGUE_SCHEDULE for box score links
**New Behavior:** Read from SCHEDULE sheet
**Key Changes:**
- Replace `SHEET_NAMES.LEAGUE_SCHEDULE` with `SHEET_NAMES.SCHEDULE`
- Update parsing logic to use SCHEDULE_COLUMNS
- Box score URLs are plain strings (not HYPERLINK formulas)

#### Function: `getStandings()`
**Lines:** 371-388
**Current Behavior:** Reads from RANKINGS sheet
**New Behavior:** Read from STANDINGS sheet
**Key Changes:**
- Replace `SHEET_NAMES.RANKINGS` with `SHEET_NAMES.STANDINGS`
- Update column references to use STANDINGS_COLUMNS
- Handle "T-" prefix for tied ranks

---

## Testing Checklist

After implementing changes:

### Unit Tests
- [ ] getPlayerStats() returns correct data structure
- [ ] Derived stats (AVG, OBP, ERA, etc.) calculate correctly
- [ ] Division by zero handled gracefully (returns 0)
- [ ] Missing players return null

### Integration Tests
- [ ] /playerstats command works with new Player Data
- [ ] /rankings command calculates leaders correctly
- [ ] /compare command calculates derived stats
- [ ] /schedule command reads from new Schedule sheet
- [ ] /standings command reads from new Standings sheet
- [ ] /headtohead command shows box score links

### Data Validation
- [ ] Qualification thresholds work (MIN_AB_MULTIPLIER, MIN_IP_MULTIPLIER)
- [ ] Box score URLs are clickable (not "View Box Score" text)
- [ ] Player names match across sheets
- [ ] Team names match across sheets

---

## Rollback Plan

If issues arise:

1. **Immediate:** Revert league-config.js to v1.0 (use deprecated sheet names)
2. **Code:** Change sheets-service.js to use HITTING/PITCHING/FIELDING sheets
3. **Verify:** Existing 🧮 sheets still contain data
4. **Deploy:** Push rollback to Railway

**Note:** Keep deprecated sheets for 1-2 weeks after successful migration.

---

## Performance Impact

**Expected Improvements:**
- ✅ Reduced API calls: 3 parallel reads → 1 read for player stats
- ✅ Smaller cache footprint: 1 sheet cached instead of 3
- ✅ Faster bot responses due to fewer network calls

**Potential Concerns:**
- ⚠️ Player Data sheet is wider (25 columns vs ~16 per sheet)
- ⚠️ Derived stat calculations add CPU overhead (minimal)

**Mitigation:**
- Cache Player Data aggressively (5-minute TTL)
- Use efficient array operations
- Pre-calculate team GP for qualification checks

---

## Deployment Steps

1. **Pre-deployment:**
   - [ ] Review SHEET_SCHEMA.md v2.0
   - [ ] Verify Player Data sheet structure matches schema
   - [ ] Backup current bot code
   - [ ] Test locally against test spreadsheet

2. **Deployment:**
   - [ ] Update SHEET_SCHEMA.md in repo
   - [ ] Update league-config.js
   - [ ] Update sheets-service.js
   - [ ] Update imports in affected commands
   - [ ] Test locally with production spreadsheet ID
   - [ ] Push to main branch
   - [ ] Deploy to Railway
   - [ ] Monitor logs for errors

3. **Post-deployment:**
   - [ ] Test all commands in Discord
   - [ ] Verify data accuracy
   - [ ] Check performance metrics
   - [ ] Announce to league members
   - [ ] Monitor for 24 hours

4. **Cleanup (after 1-2 weeks):**
   - [ ] Remove deprecated sheet name constants from league-config.js
   - [ ] Remove deprecated column mappings (HITTING_COLUMNS, etc.)
   - [ ] Delete 🧮 sheets from Google Sheets
   - [ ] Delete Discord Schedule sheet

---

## Support

If issues arise:
1. Check Railway logs for errors
2. Verify sheet names match exactly (including emojis)
3. Confirm column indices are 0-based
4. Test with small data set first
5. Compare calculations with Apps Script output

**Contact:** Create issue in CLB-League-Hub repo with tag `discord-bot` and `schema-v2`

# Google Sheets Schema Documentation

**Version:** 2.0.0
**Last Updated:** 2025-01-10
**Maintained by:** CLB League Hub Team

> ⚠️ **CRITICAL**: This schema is shared between CLB-League-Hub (Apps Script) and CLB-League-Discord-Bot repos.
> Any changes to sheet structure MUST be coordinated across both repositories.

---

## Sheet Names

All sheet names must match exactly, including emojis:

| Constant | Sheet Name | Purpose |
|----------|-----------|---------|
| `PLAYER_DATA` | `Player Data` | **SINGLE SOURCE OF TRUTH** - All player statistics (hitting, pitching, fielding) |
| `TEAM_DATA` | `Team Data` | Team standings, roster, and captain information |
| `SCHEDULE` | `Schedule` | Full season schedule with game results and box score links |
| `STANDINGS` | `Standings` | League standings table with W-L records |
| `IMAGE_URLS` | `Image URLs` | Player, team, and league image URLs for Discord embeds |

### Deprecated Sheets (v2.0.0)
The following sheets are **no longer used** and will be removed:
- ~~`🧮 Hitting`~~ → Consolidated into `Player Data`
- ~~`🧮 Pitching`~~ → Consolidated into `Player Data`
- ~~`🧮 Fielding & Running`~~ → Consolidated into `Player Data`
- ~~`Discord Schedule`~~ → Replaced by `Schedule`
- ~~`🏆 Rankings`~~ → Renamed to `Standings`

---

## Column Mappings (0-indexed)

> **Note**: All indices are 0-based for consistency with JavaScript arrays.
> Add +1 when converting to Google Sheets column letters (A=1, B=2, etc.)

### Player Data Sheet (`Player Data`) - v2.0

**Single source of truth for all player statistics. Derived stats (AVG, OBP, SLG, OPS, ERA, WHIP, BAA) must be calculated on-the-fly.**

| Index | Column | Type | Description | Category |
|-------|--------|------|-------------|----------|
| 0 | Player Name | String | Full player name | Identity |
| 1 | Team | String | Team assignment | Identity |
| 2 | GP | Number | Games played | General |
| **3-11** | **Hitting Stats** | **Numbers** | **Raw hitting statistics (9 columns)** | **Hitting** |
| 3 | AB | Number | At bats | Hitting |
| 4 | H | Number | Hits | Hitting |
| 5 | HR | Number | Home runs | Hitting |
| 6 | RBI | Number | Runs batted in | Hitting |
| 7 | BB | Number | Walks | Hitting |
| 8 | K | Number | Strikeouts | Hitting |
| 9 | ROB | Number | Hits robbed | Hitting |
| 10 | DP | Number | Double plays | Hitting |
| 11 | TB | Number | Total bases | Hitting |
| **12-14** | **WLS Stats** | **Numbers** | **Win-Loss-Save record (3 columns)** | **Pitching** |
| 12 | W | Number | Wins | Pitching |
| 13 | L | Number | Losses | Pitching |
| 14 | SV | Number | Saves | Pitching |
| **15-21** | **Pitching Stats** | **Numbers** | **Raw pitching statistics (7 columns)** | **Pitching** |
| 15 | IP | Number | Innings pitched | Pitching |
| 16 | BF | Number | Batters faced | Pitching |
| 17 | H_allowed | Number | Hits allowed | Pitching |
| 18 | HR_allowed | Number | Home runs allowed | Pitching |
| 19 | R | Number | Runs allowed | Pitching |
| 20 | BB_allowed | Number | Walks allowed | Pitching |
| 21 | K_pitched | Number | Strikeouts (pitching) | Pitching |
| **22-24** | **Fielding Stats** | **Numbers** | **Fielding statistics (3 columns)** | **Fielding** |
| 22 | NP | Number | Nice plays | Fielding |
| 23 | E | Number | Errors | Fielding |
| 24 | SB | Number | Stolen bases | Fielding |

**Total Columns:** 25 (A-Y)

**Derived Stats (Calculate On-The-Fly):**
```javascript
// Hitting
AVG = H / AB  (if AB > 0, else 0)
OBP = (H + BB) / (AB + BB)  (if AB + BB > 0, else 0)
SLG = TB / AB  (if AB > 0, else 0)
OPS = OBP + SLG

// Pitching
ERA = (R * 7) / IP  (if IP > 0, else 0)
BAA = H_allowed / BF  (if BF > 0, else 0)
WHIP = (H_allowed + BB_allowed) / IP  (if IP > 0, else 0)
```

### Team Data Sheet (`Team Data`)

| Index | Column | Type | Description |
|-------|--------|------|-------------|
| 0 | Team Name | String | Full team name |
| 1 | Captain | String | Team captain/GM name |
| 2 | GP | Number | Games played |
| 3 | W | Number | Wins |
| 4 | L | Number | Losses |
| 5-13 | Hitting Stats | Numbers | Team hitting statistics (9 columns) |
| 14-20 | Pitching Stats | Numbers | Team pitching statistics (7 columns) |
| 21-23 | Fielding Stats | Numbers | Team fielding statistics (3 columns) |

**Team Stats Column Offsets:**
- `HITTING_START: 5` (9 columns total)
- `PITCHING_START: 14` (7 columns total)
- `FIELDING_START: 21` (3 columns total)

### Schedule Sheet (`Schedule`) - v2.0

| Index | Column | Type | Description |
|-------|--------|------|-------------|
| 0 | Week | Number | Week number |
| 1 | Away Team | String | Away team name |
| 2 | Home Team | String | Home team name |
| 3 | Away Score | Number | Away team score (blank if not played) |
| 4 | Home Score | Number | Home team score (blank if not played) |
| 5 | Winner | String | Winning team name (blank if not played) |
| 6 | Game # | String | Game sheet identifier (e.g., "#125") |
| 7 | Game Date | Date/String | Date game was played |
| 8 | Game MVP | String | MVP player name |
| 9 | Home RS | Number | Home team runs scored |
| 10 | Away RS | Number | Away team runs scored |
| 11 | Box Score URL | String | **Plain URL** to box score (not HYPERLINK formula) |

> **IMPORTANT:** Column 11 (Box Score URL) must contain a plain URL string, NOT a HYPERLINK formula.
> The Google Sheets API reads HYPERLINK display text instead of the URL, causing 404 errors.

### Standings Sheet (`Standings`) - v2.0

| Index | Column | Type | Description |
|-------|--------|------|-------------|
| 0 | Rank | String | Team rank (e.g., "1", "T-2") |
| 1 | Team | String | Team name |
| 2 | W | Number | Wins |
| 3 | L | Number | Losses |
| 4 | Win% | String | Win percentage (formatted as ".XXX") |
| 5 | RS | Number | Runs scored |
| 6 | RA | Number | Runs allowed |
| 7 | Diff | Number | Run differential (RS - RA) |

### Image URLs Sheet (`Image URLs`)

| Index | Column | Type | Description |
|-------|--------|------|-------------|
| 0 | Name | String | Player/Team/League name |
| 1 | Type | String | "player", "team", or "league" |
| 2 | URL | String | Direct image URL |

---

## Data Configuration

### Data Start Row
```javascript
DATA_START_ROW = 2  // Row 2 (0-indexed) = Row 3 in Google Sheets UI
```

### Qualification Thresholds

These determine which players qualify for rate-stat rankings:

```javascript
QUALIFICATION = {
  MIN_AB_MULTIPLIER: 2.1,  // Batting: minimum AB = team GP × 2.1
  MIN_IP_MULTIPLIER: 1.0   // Pitching: minimum IP = team GP × 1.0
}
```

**Example:** If a team has played 10 games:
- Batting qualification: 10 × 2.1 = 21 AB minimum
- Pitching qualification: 10 × 1.0 = 10 IP minimum

---

## Breaking Change Protocol

When modifying sheet structure:

### 1. **Pre-Change Checklist**
- [ ] Document the change in this file
- [ ] Increment version number (semantic versioning)
- [ ] Identify affected systems (Apps Script, Discord Bot, Website)
- [ ] Plan rollout order (sheets → Apps Script → Discord bot → Website)

### 2. **Update Order**
1. Update `SHEET_SCHEMA.md` in both repos (increment version)
2. Modify Google Sheets structure
3. Update Apps Script code (`LeagueConfig.js`)
4. Test Apps Script calculations
5. Update Discord bot code (`league-config.js`)
6. Test Discord bot locally
7. Deploy Discord bot to Railway
8. Update website code if needed
9. Announce changes to league members

### 3. **Communication Template**
```
🚨 Sheet Structure Change Alert

Version: 1.x.0 → 2.0.0
Date: YYYY-MM-DD

Changes:
- [List specific changes]

Impact:
- Apps Script: [describe impact]
- Discord Bot: [describe impact]
- Website: [describe impact]

Action Required:
- [Steps for manual intervention, if any]
```

---

## Version History

### 2.0.0 (2025-01-10) - BREAKING CHANGE
**Major architecture consolidation:**
- **Player Data is now single source of truth** - Contains all player stats (hitting, pitching, fielding) in columns A-Y
- **Removed 🧮 sheets** - `🧮 Hitting`, `🧮 Pitching`, `🧮 Fielding & Running` consolidated into Player Data
- **Schedule consolidation** - `Discord Schedule` removed, use `Schedule` (formerly `Season Schedule`)
- **Rankings renamed** - `🏆 Rankings` renamed to `Standings`, simplified to show only standings table
- **Derived stats** - AVG, OBP, SLG, OPS, ERA, WHIP, BAA must be calculated on-the-fly from raw stats
- **Box score URL format** - Column L in Schedule must contain plain URL, not HYPERLINK formula

**Migration required:**
- Discord bot must read from Player Data columns 0-24 instead of separate 🧮 sheets
- Schedule commands must read from Schedule sheet (column 11 for box score URLs)
- Standings commands must read from Standings sheet
- All derived stats must be calculated in code

### 1.0.0 (2025-01-08)
- Initial schema documentation
- Established baseline for Discord bot v1.0 and Apps Script suite
- Defined qualification thresholds and data structure

---

## Contact

For schema change requests or questions:
- Create an issue in the CLB-League-Hub repository
- Tag: `schema-change` or `breaking-change`
- Coordinate with Apps Script, Discord bot, and website maintainers

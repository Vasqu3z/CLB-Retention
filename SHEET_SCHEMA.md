# Google Sheets Schema Documentation

**Version:** 1.0.0
**Last Updated:** 2025-01-08
**Maintained by:** CLB League Hub Team

> ⚠️ **CRITICAL**: This schema is shared between CLB-League-Hub (Apps Script) and CLB-League-Discord-Bot repos.
> Any changes to sheet structure MUST be coordinated across both repositories.

---

## Sheet Names

All sheet names must match exactly, including emojis:

| Constant | Sheet Name | Purpose |
|----------|-----------|---------|
| `HITTING` | `🧮 Hitting` | Player hitting statistics |
| `PITCHING` | `🧮 Pitching` | Player pitching statistics |
| `FIELDING` | `🧮 Fielding & Running` | Player fielding and baserunning stats |
| `TEAM_DATA` | `Team Data` | Team roster and captain information |
| `RANKINGS` | `🏆 Rankings` | League-wide statistical rankings |
| `PLAYER_DATA` | `Player Data` | Master player list with team assignments |
| `SEASON_SCHEDULE` | `Season Schedule` | Full season game schedule |
| `LEAGUE_SCHEDULE` | `Discord Schedule` | Schedule with hyperlinks to box scores |

---

## Column Mappings (0-indexed)

> **Note**: All indices are 0-based for consistency with JavaScript arrays.
> Add +1 when converting to Google Sheets column letters (A=1, B=2, etc.)

### Hitting Sheet (`🧮 Hitting`)

| Index | Column | Type | Description |
|-------|--------|------|-------------|
| 0 | Player Name | String | Full player name |
| 1 | Team | String | Team name |
| 2 | GP | Number | Games played |
| 3 | AB | Number | At bats |
| 4 | H | Number | Hits |
| 5 | HR | Number | Home runs |
| 6 | RBI | Number | Runs batted in |
| 7 | BB | Number | Walks |
| 8 | K | Number | Strikeouts |
| 9 | ROB | Number | Hits robbed |
| 10 | DP | Number | Double plays |
| 11 | TB | Number | Total bases |
| 12 | AVG | Number | Batting average |
| 13 | OBP | Number | On-base percentage |
| 14 | SLG | Number | Slugging percentage |
| 15 | OPS | Number | On-base plus slugging |

### Pitching Sheet (`🧮 Pitching`)

| Index | Column | Type | Description |
|-------|--------|------|-------------|
| 0 | Player Name | String | Full player name |
| 1 | Team | String | Team name |
| 2 | GP | Number | Games played |
| 3 | W | Number | Wins |
| 4 | L | Number | Losses |
| 5 | SV | Number | Saves |
| 6 | ERA | Number | Earned run average |
| 7 | IP | Number | Innings pitched |
| 8 | BF | Number | Batters faced |
| 9 | H | Number | Hits allowed |
| 10 | HR | Number | Home runs allowed |
| 11 | R | Number | Runs allowed |
| 12 | BB | Number | Walks allowed |
| 13 | K | Number | Strikeouts |
| 14 | BAA | Number | Batting average against |
| 15 | WHIP | Number | Walks + hits per inning pitched |

### Fielding Sheet (`🧮 Fielding & Running`)

| Index | Column | Type | Description |
|-------|--------|------|-------------|
| 0 | Player Name | String | Full player name |
| 1 | Team | String | Team name |
| 2 | GP | Number | Games played |
| 3 | NP | Number | Nice plays |
| 4 | E | Number | Errors |
| 5 | SB | Number | Stolen bases |

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

### Player Data Sheet (`Player Data`)

| Index | Column | Type | Description |
|-------|--------|------|-------------|
| 0 | Player Name | String | Full player name |
| 1 | Team | String | Team assignment |

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
- [ ] Identify affected systems (Apps Script, Discord Bot, etc.)
- [ ] Plan rollout order (sheets → Apps Script → Discord bot)

### 2. **Update Order**
1. Update `SHEET_SCHEMA.md` in both repos (increment version)
2. Modify Google Sheets structure
3. Update Apps Script code (`LeagueConfig.js`)
4. Test Apps Script calculations
5. Update Discord bot code (`league-config.js`)
6. Test Discord bot locally
7. Deploy Discord bot to Railway
8. Announce changes to league members

### 3. **Communication Template**
```
🚨 Sheet Structure Change Alert

Version: 1.x.0 → 1.y.0
Date: YYYY-MM-DD

Changes:
- [List specific changes]

Impact:
- Apps Script: [describe impact]
- Discord Bot: [describe impact]

Action Required:
- [Steps for manual intervention, if any]
```

---

## Version History

### 1.0.0 (2025-01-08)
- Initial schema documentation
- Established baseline for Discord bot v1.0 and Apps Script suite
- Defined qualification thresholds and data structure

---

## Contact

For schema change requests or questions:
- Create an issue in the CLB-League-Hub repository
- Tag: `schema-change` or `breaking-change`
- Coordinate with both Apps Script and Discord bot maintainers

# CLB League Hub - Configuration Guide

**Admin/Developer Reference** for configuring the CLB League Hub system.

This guide documents all configuration settings in `LeagueConfig.js` and `RetentionConfig.js`. Use this reference when adapting the system for different league structures, rule changes, or customization needs.

---

## Table of Contents

1. [LeagueConfig.js Settings](#leagueconfigjs-settings)
   - [Sheet Names](#sheet-names)
   - [Box Score Configuration](#box-score-configuration)
   - [Validation & Qualification Thresholds](#validation--qualification-thresholds)
   - [Sheet Structure Layouts](#sheet-structure-layouts)
   - [Display Settings](#display-settings)
2. [RetentionConfig.js Settings](#retentionconfigjs-settings)
   - [Factor Weights](#factor-weights)
   - [Team Success Scoring](#team-success-scoring)
   - [Play Time Thresholds](#play-time-thresholds)
   - [Performance Thresholds](#performance-thresholds)
   - [Auto-Flagging System](#auto-flagging-system)
   - [Draft Expectations System](#draft-expectations-system)
   - [Manual Modifiers](#manual-modifiers)
   - [Output Formatting](#output-formatting)
   - [Debug Settings](#debug-settings)

---

## LeagueConfig.js Settings

Located in: `LeagueConfig.js`

### Sheet Names

Define the names of all sheets in the main statistics spreadsheet. **Important**: If you rename sheets, update these constants.

```javascript
ERROR_LOG_SHEET: "Error Log"
PLAYER_STATS_SHEET: "Player Data"
HITTING_STATS_SHEET: "🧮 Hitting"
PITCHING_STATS_SHEET: "🧮 Pitching"
FIELDING_STATS_SHEET: "🧮 Fielding & Running"
TEAM_STATS_SHEET: "Team Data"
TEAM_SHEET_TEMPLATE: "Team Sheet"
LEAGUE_HUB_SHEET: "Rankings"
LEAGUE_SCHEDULE_SHEET: "Schedule"
SEASON_SCHEDULE_SHEET: "Season Schedule"
TRANSACTION_LOG_SHEET: "Transaction Log"
RETENTION_GRADES_SHEET: "Retention Grades"
```

### External Spreadsheet

**Box Score Spreadsheet ID**: The Google Sheets ID of the external spreadsheet containing game sheets.

```javascript
BOX_SCORE_SPREADSHEET_ID: "17x5VoZxGV88RYAiHEcq0M-rxSyZ0fp66OktmJk2AaEU"
```

To find a spreadsheet ID: Open the spreadsheet, look at the URL:
`https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

**Game Sheet Prefix**: Character that identifies game sheets (e.g., "#1", "#2").

```javascript
GAME_SHEET_PREFIX: "#"
```

### Display Settings

**Column Widths**:
```javascript
PLAYER_COLUMN_WIDTH: 175           // Width of player name columns
LEAGUE_HUB_RANK_WIDTH: 50          // Width of rank column in standings
LEAGUE_HUB_TEAM_WIDTH: 175         // Width of team name column in standings
```

**Progress Updates**:
```javascript
PROGRESS_UPDATE_FREQUENCY: 8       // Show progress toast every N items
RECENT_SCHEDULE_WEEKS: 2           // Number of recent weeks to show on Rankings
```

### Validation & Qualification Thresholds

**Season Structure**:
```javascript
MAX_GAMES_PER_SEASON: 14           // Maximum games per team in regular season
```

**Per-Game Maximums** (for data validation):
```javascript
MAX_AB_PER_GAME: 6                 // Max at-bats per player per game
MAX_IP_PER_GAME: 7.0               // Max innings pitched per player per game
MAX_HITS_PER_GAME: 6               // Max hits per player per game
MAX_HR_PER_GAME: 6                 // Max home runs per player per game
```

**Statistical Qualification**:

These multipliers determine when a player qualifies for leaderboards and percentile rankings.

```javascript
MIN_AB_MULTIPLIER: 2.1             // Min AB = team games × 2.1 (e.g., 14 games × 2.1 = 29.4 AB)
MIN_IP_MULTIPLIER: 1.0             // Min IP = team games × 1.0 (e.g., 14 games × 1.0 = 14 IP)
```

**Roster Settings**:
```javascript
MAX_PLAYERS_PER_ROSTER: 11         // Maximum players per team
WARN_ON_ROSTER_OVERFLOW: true      // Show warning if roster exceeds maximum
```

### Box Score Configuration

**Box Score Cell Ranges** (in the external game sheets):

```javascript
BOX_SCORE_TEAM_INFO: "B3:F4"                // Team names and runs scored
BOX_SCORE_WLS_DATA: "M48:R50"               // Win/Loss/Save pitcher data
BOX_SCORE_WINNER_DATA: "N48:N50"            // Winning pitcher cell
```

**Box Score Data Sections**:

Hitting section:
```javascript
BOX_SCORE_HITTING_START_ROW: 29             // Row where hitting section begins
BOX_SCORE_HITTING_START_COL: 2              // Column B
BOX_SCORE_HITTING_NUM_ROWS: 22              // Total rows in hitting section (includes headers + both teams)
BOX_SCORE_HITTING_NUM_COLS: 10              // Columns B through K
```

Pitching/Fielding section:
```javascript
BOX_SCORE_PITCHING_FIELDING_START_ROW: 6    // Row where pitching section begins
BOX_SCORE_PITCHING_FIELDING_START_COL: 2    // Column B
BOX_SCORE_PITCHING_FIELDING_NUM_ROWS: 22    // Total rows in pitching section
BOX_SCORE_PITCHING_FIELDING_NUM_COLS: 17    // Columns B through R
```

**Team Totals Ranges**:
```javascript
BOX_SCORE_TEAM1_TOTALS: "C39:R39"           // Away team hitting totals (row 39)
BOX_SCORE_TEAM2_TOTALS: "C50:R50"           // Home team hitting totals (row 50)
BOX_SCORE_TEAM1_PITCHING: "I16:R16"         // Away team pitching totals (row 16)
BOX_SCORE_TEAM2_PITCHING: "I27:R27"         // Home team pitching totals (row 27)
```

**Lineup Position Offsets** (for Retention system lineup analysis):

```javascript
BOX_SCORE_AWAY_LINEUP_START_OFFSET: 1       // Away lineup starts 1 row after header (row 30)
BOX_SCORE_AWAY_LINEUP_PLAYER_COUNT: 9       // 9 batters in lineup
BOX_SCORE_HOME_LINEUP_START_OFFSET: 12      // Home lineup starts 12 rows after header (row 41)
BOX_SCORE_HOME_LINEUP_PLAYER_COUNT: 9       // 9 batters in lineup
```

### Game Sheet Validation

Control whether the system validates game sheet data integrity:

```javascript
VALIDATE_TEAM_NAMES: true                   // Check that teams exist
VALIDATE_RUNS: true                         // Check that runs match scores
VALIDATE_WLS_DATA: true                     // Check Win/Loss/Save data
VALIDATE_PLAYER_DATA: true                  // Check player stats for anomalies
MIN_PLAYERS_PER_TEAM: 1                     // Minimum players required per team
```

### Sheet Structure Layouts

**Column Mappings** for stat sheets:

Hitting Stats Sheet (`STATS_COLUMN_MAPS.HITTING_COLUMNS`):
```javascript
PLAYER_NAME: 1,    // Column A
TEAM: 2,           // Column B
GP: 3,             // Column C - Games Played
AB: 4,             // Column D - At Bats
H: 5,              // Column E - Hits
HR: 6,             // Column F - Home Runs
RBI: 7,            // Column G - Runs Batted In
BB: 8,             // Column H - Walks
K: 9,              // Column I - Strikeouts
ROB: 10,           // Column J - Hits Robbed
DP: 11,            // Column K - Double Plays
TB: 12,            // Column L - Total Bases
AVG: 13,           // Column M - Batting Average
OBP: 14,           // Column N - On-Base Percentage
SLG: 15,           // Column O - Slugging Percentage
OPS: 16            // Column P - On-Base Plus Slugging
```

Pitching Stats Sheet (`STATS_COLUMN_MAPS.PITCHING_COLUMNS`):
```javascript
PLAYER_NAME: 1,    // Column A
TEAM: 2,           // Column B
GP: 3,             // Column C - Games Played
W: 4,              // Column D - Wins
L: 5,              // Column E - Losses
SV: 6,             // Column F - Saves
ERA: 7,            // Column G - Earned Run Average
IP: 8,             // Column H - Innings Pitched
BF: 9,             // Column I - Batters Faced
H: 10,             // Column J - Hits Allowed
HR: 11,            // Column K - Home Runs Allowed
R: 12,             // Column L - Runs Allowed
BB: 13,            // Column M - Walks Allowed
K: 14,             // Column N - Strikeouts
BAA: 15,           // Column O - Batting Average Against
WHIP: 16           // Column P - Walks + Hits per IP
```

Fielding Stats Sheet (`STATS_COLUMN_MAPS.FIELDING_COLUMNS`):
```javascript
PLAYER_NAME: 1,    // Column A
TEAM: 2,           // Column B
GP: 3,             // Column C - Games Played
NP: 4,             // Column D - Nice Plays
E: 5,              // Column E - Errors
SB: 6              // Column F - Stolen Bases
```

**Team Stats Sheet** (`SHEET_STRUCTURE.TEAM_STATS_SHEET`):
```javascript
DATA_START_ROW: 2,
TEAM_NAME_COL: 1,           // Column A
CAPTAIN_COL: 2,             // Column B - Captain Name
GP_COL: 3,                  // Column C - Games Played
WINS_COL: 4,                // Column D - Wins
LOSSES_COL: 5,              // Column E - Losses
GPWL_START_COL: 3,          // Column C (for range operations GP+W+L)
GPWL_NUM_COLS: 3,
HITTING_START_COL: 6,       // Column F - Hitting stats start
HITTING_NUM_COLS: 9,
PITCHING_START_COL: 15,     // Column O - Pitching stats start
PITCHING_NUM_COLS: 7,
FIELDING_START_COL: 22,     // Column V - Fielding stats start
FIELDING_NUM_COLS: 3
```

### Transaction Tracking

**Snapshot Property**: The script stores player-team snapshots in PropertiesService to detect transactions.

```javascript
PLAYER_TEAM_SNAPSHOT_PROPERTY: "playerTeamSnapshot"
```

---

## RetentionConfig.js Settings

Located in: `RetentionConfig.js`

### Version Info

```javascript
VERSION: "3.0"
VERSION_DATE: "2025-11-02"
```

### Factor Weights

The weighted grading system assigns each factor a percentage contribution to the final grade. **Weights must sum to 1.0**.

```javascript
FACTOR_WEIGHTS: {
  TEAM_SUCCESS: 0.18,      // 18% weight
  PLAY_TIME: 0.32,         // 32% weight (highest - play time is most important)
  PERFORMANCE: 0.17,       // 17% weight
  CHEMISTRY: 0.12,         // 12% weight
  DIRECTION: 0.21          // 21% weight (second highest - team future matters)
}
```

**To modify weights**:
1. Adjust values (must sum to 1.0)
2. Verify using `RETENTION_CONFIG.validate()` function
3. Run "Refresh Formulas" to update all existing grades

### Team Success Scoring

#### Regular Season Points (0-10 scale)

Based on final standings position (not win percentage):

```javascript
TEAM_SUCCESS.REGULAR_SEASON: {
  MAX_POINTS: 10,
  FIRST: 10,        // 1st place - dominated regular season
  SECOND: 6.25,     // 2nd place - strong playoff seed
  THIRD: 6.25,      // 3rd place - strong playoff seed
  FOURTH: 5,        // 4th place - scraped into playoffs
  FIFTH: 3.75,      // 5th place - just missed playoffs
  SIXTH: 2.5,       // 6th place - below average
  SEVENTH: 2.5,     // 7th place - below average
  EIGHTH: 0         // 8th place - LAST PLACE PENALTY
}
```

**Philosophy**: Heavy reward for 1st place, nuclear penalty for last place, diminishing returns in the middle.

#### Postseason Points (0-10 scale)

Based on playoff results:

```javascript
TEAM_SUCCESS.POSTSEASON: {
  MAX_POINTS: 10,
  CHAMPION: 10,          // 1st place - won it all
  RUNNER_UP: 7.5,        // 2nd place - lost in finals
  SEMIFINAL: 5,          // 3rd/4th place - lost in semifinals
  QUARTERFINAL: 2.5,     // 5th-8th place - lost in first round
  MISSED_PLAYOFFS: 0     // Did not make playoffs
}
```

### Play Time Thresholds

#### Games Played Component (0-10 points)

Based on percentage of current team's games played:

```javascript
PLAY_TIME.GAMES_PLAYED: {
  MAX_POINTS: 10,
  FULL_TIME: { threshold: 0.85, points: 10 },    // 85%+ of games (12+ games out of 14)
  REGULAR: { threshold: 0.70, points: 7.5 },     // 70%+ of games (10-11 games)
  ROTATION: { threshold: 0.50, points: 5 },      // 50%+ of games (7-9 games)
  BENCH: { threshold: 0.25, points: 2.5 },       // 25%+ of games (4-6 games)
  MINIMAL: { threshold: 0, points: 0 }           // <25% of games (1-3 games)
}
```

**Notes**:
- Percentage is based on **current team's games** (mid-season trades are penalized)
- Thresholds trigger the listed points (e.g., 85% → 10 points, 84% → 7.5 points)

#### Usage Quality - Hitters (0-10 points)

Based on average lineup position from box scores:

```javascript
PLAY_TIME.USAGE_QUALITY.LINEUP_POSITION: {
  TOP_THREE: { threshold: 3.0, points: 10 },    // Spots 1-3 (where stars belong)
  FOUR_FIVE: { threshold: 5.0, points: 6 },     // Spots 4-5 (mild misuse)
  SIX_SEVEN: { threshold: 7.0, points: 4 },     // Spots 6-7 (bad misuse)
  EIGHT_NINE: { threshold: 9.0, points: 1 },    // Spots 8-9 (terrible misuse)
  BENCH: { threshold: 999, points: 0 }          // No lineup appearances
}
```

**Philosophy**: Top 3 lineup spots are equal (all get 3 at-bats in a 7-inning game). Steeper penalties for batting stars low in the order.

#### Usage Quality - Pitchers (0-10 points)

Based on innings pitched per team game (workload indicator):

```javascript
PLAY_TIME.USAGE_QUALITY.PITCHING_USAGE: {
  ACE: { threshold: 2.5, points: 10 },         // 2.5+ IP/game (workhorse starter)
  STARTER: { threshold: 1.8, points: 7.5 },    // 1.8+ IP/game (regular starter)
  SWINGMAN: { threshold: 1.2, points: 5 },     // 1.2+ IP/game (spot starter/long relief)
  RELIEVER: { threshold: 0.6, points: 2.5 },   // 0.6+ IP/game (setup/closer)
  MOP_UP: { threshold: 0, points: 0 }          // <0.6 IP/game (rarely used)
}
```

**Notes**: Adjusted for 7-inning games (not 9-inning MLB standard).

### Performance Thresholds

#### Offensive Contribution (0-14 points)

Based on percentile ranking vs all qualified hitters:

```javascript
PERFORMANCE.OFFENSIVE: {
  MAX_POINTS: 14,
  MIN_AB_MULTIPLIER: 2.1,  // Qualification: team GP × 2.1 (delegates to CONFIG)

  ELITE: { threshold: 90, points: 14 },         // Top 10% (8-10 players in 85-100 player league)
  EXCELLENT: { threshold: 75, points: 12 },     // 75-90th percentile
  ABOVE_AVG: { threshold: 60, points: 10 },     // 60-75th percentile
  GOOD: { threshold: 50, points: 8 },           // 50-60th percentile (median)
  AVERAGE: { threshold: 40, points: 6 },        // 40-50th percentile
  BELOW_AVG: { threshold: 25, points: 4 },      // 25-40th percentile
  POOR: { threshold: 10, points: 2 },           // 10-25th percentile
  TERRIBLE: { threshold: 0, points: 0 }         // Bottom 10%
}
```

**Stats Evaluated**: AVG, OBP, SLG, OPS, HR, RBI (average of percentiles)

#### Defensive Contribution (0-3 points)

Based on percentile ranking vs all qualified fielders:

```javascript
PERFORMANCE.DEFENSIVE: {
  MAX_POINTS: 3,
  MIN_GP_PERCENTAGE: 0.5,  // Qualification: 50% of team games (7+ games)

  GOLD_GLOVE: { threshold: 90, points: 3 },     // Top 10% defenders
  EXCELLENT: { threshold: 75, points: 2.5 },
  STRONG: { threshold: 60, points: 2 },
  SOLID: { threshold: 40, points: 1.5 },        // Average
  NEUTRAL: { threshold: 25, points: 1 },
  BELOW_AVG: { threshold: 10, points: 0.5 },
  POOR: { threshold: 0, points: 0 }             // Bottom 10%
}
```

**Metric**: (Nice Plays - Errors) / Games Played

#### Pitching Contribution (0-3 points)

Based on percentile ranking vs all qualified pitchers:

```javascript
PERFORMANCE.PITCHING: {
  MAX_POINTS: 3,
  MIN_IP_MULTIPLIER: 1.0,  // Qualification: team GP × 1.0 (delegates to CONFIG)

  CY_YOUNG: { threshold: 90, points: 3 },       // Top 10% pitchers (elite)
  EXCELLENT: { threshold: 75, points: 2.5 },
  STRONG: { threshold: 60, points: 2 },
  GOOD: { threshold: 50, points: 1.5 },         // Above average
  AVERAGE: { threshold: 40, points: 1 },
  BELOW_AVG: { threshold: 25, points: 0.5 },
  POOR: { threshold: 0, points: 0 }             // Bottom 25%
}
```

**Stats Evaluated**: ERA, WHIP, BAA (inverted - lower is better)

### Auto-Flagging System

Automatically detects flight risk for elite players on struggling teams:

```javascript
AUTO_FLAGGING: {
  ENABLED: true,

  TIER_1: {
    PERCENTILE_THRESHOLD: 75,    // Top 25% of players
    STANDING_MIN: 7,             // 7th or 8th place teams
    STANDING_MAX: 8,
    PENALTY_POINTS: -4           // -4 performance points (severe)
  },

  TIER_2: {
    PERCENTILE_THRESHOLD: 60,    // Top 40% of players
    STANDING_MIN: 5,             // 5th through 8th place teams
    STANDING_MAX: 8,
    PENALTY_POINTS: -2           // -2 performance points (moderate)
  }
}
```

**Philosophy**: Star players on bad teams are flight risks. The better the player and worse the team, the bigger the penalty.

### Draft Expectations System

Compares performance to acquisition cost (draft round):

```javascript
DRAFT_EXPECTATIONS: {
  ENABLED: true,

  // High draft picks (Rounds 1-2) - Situation indicators
  HIGH_ROUNDS: {
    ROUNDS: [1, 2],
    GOOD_SITUATION_PERCENTILE: 75,     // Top 25% performance
    GOOD_SITUATION_MOD: 2.5,           // Bonus for elite player in good spot
    UNDERPERFORM_PERCENTILE: 50,       // Below 50th percentile
    UNDERPERFORM_MOD: -4.0             // Severe penalty for elite pick in bad situation
  },

  // Mid draft picks (Rounds 3-5) - Self-worth indicators
  MID_ROUNDS: {
    ROUNDS: [3, 4, 5],
    OVERPERFORM_PERCENTILE: 75,        // Top 25% performance (exceeding expectations)
    OVERPERFORM_MOD: -3.5,             // Penalty - player feels undervalued by team
    UNDERPERFORM_PERCENTILE: 50,       // Below 50th percentile
    UNDERPERFORM_MOD: 2.0              // Bonus - team overvalued player, less flight risk
  },

  // Late draft picks (Rounds 6-8+) - Self-worth indicators (more extreme)
  LATE_ROUNDS: {
    ROUNDS: [6, 7, 8],
    OVERPERFORM_PERCENTILE: 75,        // Top 25% performance (major overperformance)
    OVERPERFORM_MOD: -5.0,             // Major penalty - player severely undervalued
    UNDERPERFORM_PERCENTILE: 40,       // Below 40th percentile
    UNDERPERFORM_MOD: 3.0              // Larger bonus - team overvalued, player knows it
  }
}
```

**Philosophy**:
- **High picks**: Bonus if performing well (team made good pick), penalty if underperforming (wasted pick creates bad situation)
- **Mid/Late picks**: Penalty if overperforming (player feels undervalued), bonus if underperforming (team overvalued them, less ego)

### Manual Modifiers

Commissioners can apply context-aware adjustments:

```javascript
MODIFIERS: {
  TEAM_SUCCESS: {
    MIN: -5,
    MAX: 5,
    DESCRIPTION: "Adjusts Team Success for context (injuries, strength of schedule, etc.)"
  },
  PLAY_TIME: {
    MIN: -5,
    MAX: 5,
    DESCRIPTION: "Adjusts Play Time for context (traded mid-season, role changes, etc.)"
  },
  PERFORMANCE: {
    MIN: -5,
    MAX: 5,
    DESCRIPTION: "Adjusts Performance for context (stats inflated/deflated, expectations, etc.)"
  }
}
```

**Chemistry** (manual factor):
```javascript
MANUAL_FACTORS.CHEMISTRY: {
  MIN: 0,
  MAX: 20,
  WEIGHT: 0.12,
  DESCRIPTION: "Player-team chemistry and fit"
}
```

**Team Direction** (manual factor):
```javascript
MANUAL_FACTORS.DIRECTION: {
  MIN: 0,
  MAX: 20,
  WEIGHT: 0.21,
  DESCRIPTION: "Team's perceived future direction and competitive outlook"
}
```

### Player Filtering

Control whether teamless players are included in calculations:

```javascript
PLAYER_FILTERING: {
  INCLUDE_PLAYERS_WITHOUT_TEAMS: false  // Default: exclude teamless players
}
```

**Why this matters**:
- Including teamless players affects percentile calculations for ALL players
- Teamless players typically can't be evaluated fairly (no team success, no lineup data)
- Default (false) matches original behavior

### Output Formatting

#### Final Grade Color Coding

```javascript
COLORS: {
  EXCELLENT: "#d4edda",  // Green - 70+ points (likely to retain)
  GOOD: "#d1ecf1",       // Light blue - 55-69 points (good chance)
  AVERAGE: "#fff3cd",    // Yellow - 40-54 points (uncertain)
  POOR: "#f8d7da",       // Red - <40 points (unlikely to retain)

  HEADER: "#e8e8e8",     // Gray - Header rows
  EDITABLE: "#ffffcc",   // Light yellow - Manual input cells
  MODIFIER: "#e6f3ff"    // Light blue - Modifier cells
}
```

#### Column Widths

```javascript
PLAYER_COL_WIDTH: 150
TEAM_COL_WIDTH: 120
DRAFT_VALUE_COL_WIDTH: 80
STAT_COL_WIDTH: 70
MODIFIER_COL_WIDTH: 60
GRADE_COL_WIDTH: 60
DETAILS_COL_WIDTH: 350
CHEMISTRY_COL_WIDTH: 80
DIRECTION_COL_WIDTH: 80
```

#### Sheet Layout

```javascript
HEADER_ROW: 5              // Row where data table headers start
DATA_START_ROW: 6          // Row where player data starts
INSTRUCTIONS_ROW_OFFSET: 3 // Instructions appear N rows after last data row
```

### Debug Settings

Control logging behavior:

```javascript
DEBUG: {
  ENABLE_LOGGING: true,                // General debug logging toggle
  LOG_PERCENTILE_DETAILS: false,       // Detailed percentile calculation logging
  LOG_LINEUP_PARSING: false,           // Lineup position parsing details
  LOG_AUTO_FLAGGING: true,             // Auto-flagging detection logging
  LOG_DRAFT_EXPECTATIONS: true,        // Draft expectations modifier logging
  SHOW_PROGRESS_TOASTS: true           // Show progress notifications
}
```

**Production Recommendation**: Set `ENABLE_LOGGING: false` and `LOG_PERCENTILE_DETAILS: false` to reduce console spam.

---

## Configuration Best Practices

### Making Changes

1. **Always test changes** on a copy of the spreadsheet first
2. **Document your changes** in comments
3. **Run validation** after modifying weights:
   ```javascript
   RETENTION_CONFIG.validate()
   ```
4. **Update affected sheets**:
   - LeagueConfig changes: Run "Update All"
   - RetentionConfig changes: Run "Calculate Final Retention Grades" → "Refresh Formulas"

### Common Customizations

#### Changing League Size
1. Update `LEAGUE.TOTAL_TEAMS` in RetentionConfig
2. Update `TEAM_SUCCESS.REGULAR_SEASON` point allocations to match new number of teams
3. Update postseason structure if needed

#### Changing Season Length
1. Update `MAX_GAMES_PER_SEASON` in LeagueConfig
2. Update `LEAGUE.GAMES_PER_SEASON` in RetentionConfig
3. Adjust qualification multipliers if needed

#### Changing Game Length
1. Update `MAX_IP_PER_GAME` in LeagueConfig (e.g., 9 for 9-inning games)
2. Update `LEAGUE.INNINGS_PER_GAME` in RetentionConfig
3. Adjust pitching usage thresholds proportionally

#### Adjusting Retention Philosophy
1. Modify `FACTOR_WEIGHTS` to emphasize different factors
2. Adjust tier thresholds to be more/less strict
3. Tune auto-flagging and draft expectations to match league culture

### Troubleshooting

**Stats not updating**:
- Verify sheet names match CONFIG constants
- Check box score spreadsheet ID is correct
- Run "Update All" to refresh

**Retention grades seem wrong**:
- Enable debug logging: `DEBUG.ENABLE_LOGGING: true`
- Check qualification thresholds (are players actually qualifying?)
- Verify factor weights sum to 1.0
- Run `RETENTION_CONFIG.validate()`

**Performance issues**:
- Check `PROGRESS_UPDATE_FREQUENCY` (higher = fewer toasts = faster)
- Verify debug logging is disabled in production
- Ensure batch operations are not broken

---

## Version History

- **3.0** (2025-11-02): Performance refactor, config consolidation, removal of v2 changelog markers
- **2.1** (2025-10-28): Split Team Success into Regular/Postseason columns
- **2.0** (original): Weighted grading system with auto-flagging and draft expectations

---

## Support

For questions about configuration or to report issues, contact the league administration or file an issue at the [CLB League Hub GitHub repository](https://github.com/Vasqu3z/CLB-League-Hub).

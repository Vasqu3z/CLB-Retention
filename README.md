# CLB League Hub - Baseball Stats Management System

A comprehensive Google Sheets-based statistics management and player retention probability system for the CLB Baseball League.

## Overview

The CLB League Hub automates the collection, calculation, and presentation of player and team statistics from game sheets. It provides dynamic standings, schedules, league leaders, team sheets, and an advanced player retention probability calculator.

---

## Features

### 🚀 Automated Stats Processing
- **Single-Click Updates**: The "Update All" menu item processes all game sheets and updates every statistics sheet in seconds
- **Real-Time Standings**: Automatically calculated win-loss records, run differentials, and playoff positioning
- **Dynamic Schedules**: Tracks completed games and upcoming matchups with color-coded results
- **League Leaders**: Auto-updated leaderboards for batting, pitching, and fielding categories

### 📊 Comprehensive Statistics
- **Individual Player Stats**: Hitting, pitching, and fielding statistics with calculated metrics (AVG, OBP, SLG, ERA, WHIP, etc.)
- **Team Statistics**: Aggregated team performance across all statistical categories
- **Head-to-Head Records**: Tracks team performance against specific opponents

### 🏆 Player Retention Probability System
An advanced analytical tool that calculates the probability of retaining each player for the following season based on multiple weighted factors.

---

## Sheet Descriptions

### Core Stat Sheets

#### **Player Data**
Master roster showing all players and their current team assignments. This sheet drives all other calculations and must be kept up-to-date for accurate statistics.

#### **🧮 Hitting**
Complete offensive statistics for all players:
- **Counting Stats**: Games Played, At-Bats, Hits, Home Runs, RBIs, Walks, Strikeouts, Double Plays, Total Bases
- **Calculated Metrics**: Batting Average (AVG), On-Base Percentage (OBP), Slugging Percentage (SLG), On-Base Plus Slugging (OPS)
- **Special Stat**: ROB (Hits Robbed) - tracks how often defensive "Nice Plays" were made against the batter

#### **🧮 Pitching**
Complete pitching statistics for all players:
- **Counting Stats**: Games Played, Wins, Losses, Saves, Innings Pitched, Batters Faced, Hits Allowed, Home Runs Allowed, Runs Allowed, Walks Allowed, Strikeouts
- **Calculated Metrics**: Earned Run Average (ERA), Batting Average Against (BAA), Walks + Hits per Inning Pitched (WHIP)

#### **🧮 Fielding & Running**
Defensive and baserunning statistics:
- **Fielding**: Games Played, Nice Plays (exceptional defensive plays), Errors
- **Baserunning**: Stolen Bases

#### **Team Data**
Aggregated team statistics across all categories:
- Win-loss records
- Team hitting totals and averages
- Team pitching totals and averages
- Team fielding statistics

---

### Dynamic Display Sheets

#### **Rankings**
The league homepage featuring:
- **Full Standings**: Ranked by win percentage, with tiebreakers for head-to-head record and run differential
- **League Leaders**: Top performers in key statistical categories (batting, pitching, fielding)
- **Recent Results**: Game scores from recent weeks with color-coded winners/losers
- **This Week's Games**: Upcoming matchups for the current week

#### **Schedule**
Comprehensive schedule view:
- **Standings**: Current league standings (same as Rankings sheet)
- **Completed Games**: All finished games organized by week with clickable links to game sheets
- **Scheduled Games**: All upcoming games organized by week

#### **Team Sheets** (One per Team)
Individual team pages showing:
- **Player Statistics**: Full hitting, pitching, and fielding stats for all team members
- **League Standings**: Current standings with the team's row highlighted
- **Team Schedule**: All games (completed and upcoming) with color-coded win/loss results

---

### Retention System

#### **Retention Grades**
An advanced analytical sheet that calculates each player's probability of returning to their current team next season. The system uses a weighted formula incorporating multiple factors to generate a final retention grade on a 5-95 scale (d95).

**The Five Retention Factors:**

1. **Team Success** (18% weight)
   - **What it measures**: How well the team performed during the season
   - **Components**:
     - Regular season standing (1st place through 8th place)
     - Postseason performance (Champion, Runner-up, Semifinal, Quarterfinal, or Missed Playoffs)
   - **Why it matters**: Players on successful teams are more likely to return. Last place finishes significantly hurt retention.

2. **Play Time** (32% weight - highest)
   - **What it measures**: How much the player actually played and how they were used
   - **Components**:
     - Games played percentage (how many team games the player appeared in)
     - Usage quality (average lineup position for hitters, innings per game for pitchers)
   - **Why it matters**: Players who play regularly and are used properly (e.g., star hitters in the top 3 of the lineup) are more likely to stay. Benchwarmers and misused stars are flight risks.

3. **Performance** (17% weight)
   - **What it measures**: Statistical performance relative to other players in the league
   - **Components**:
     - Offensive contribution (percentile ranking in AVG, OBP, SLG, OPS, HR, RBI)
     - Defensive contribution (percentile ranking in Nice Plays minus Errors per game)
     - Pitching contribution (percentile ranking in ERA, WHIP, BAA)
   - **Advanced Features**:
     - **Auto-flagging**: Elite players on struggling teams receive a retention penalty (flight risk)
     - **Draft expectations**: Performance is evaluated against draft position (high picks underperforming get penalized, late picks overperforming may feel undervalued)
   - **Why it matters**: Players who excel statistically are valuable assets, but mismatches between ability and situation create retention risk.

4. **Chemistry** (12% weight)
   - **What it measures**: Player-team fit and locker room dynamics
   - **Manual Input**: Commissioners enter scores from 0-20 based on subjective evaluation
   - **Why it matters**: Good chemistry keeps players with their teams even when other factors suggest they might leave.

5. **Team Direction** (21% weight - second highest)
   - **What it measures**: The team's perceived competitive outlook for the next season
   - **How it works**: One score per team (0-20), inherited by all players on that team
   - **Why it matters**: Players want to be on teams with a bright future. Rebuilding teams lose players, contenders retain them.

**Manual Adjustments:**
- **Modifiers**: Commissioners can apply -5 to +5 adjustments to Team Success, Play Time, and Performance factors to account for context (injuries, trades, schedule difficulty, etc.)
- **Draft/Trade Value**: Records the round in which each player was drafted (1-8), used for draft expectations calculations

**Output:**
- **Final Grade**: A number from 5 to 95 representing retention probability
  - 70-95: Excellent retention probability (green)
  - 55-69: Good retention probability (light blue)
  - 40-54: Uncertain retention (yellow)
  - 5-39: Poor retention probability (red)
- **Details Column**: Shows the breakdown of each factor's contribution

---

## Menu System

Access all features through the **"Player Stats"** menu in Google Sheets:

### Main Functions
- **🚀 Update All**: Process all game sheets and update every statistics sheet (recommended before reviewing stats)
- **📊 Compare Players**: Side-by-side comparison tool for evaluating players
- **🔧 Recalculate All Formulas**: Force recalculation of all sheet formulas

### 💰 Transactions
- **📝 Record Transaction**: Log trades, drops, and signings
- **📋 View/Edit Transaction Log**: Review transaction history
- **⚠️ Detect Missing Transactions**: Identify roster changes not logged in the system

### ⭐ Retention
- **🏆 Calculate Final Retention Grades**: Run full retention calculation (uses cached data from last "Update All")
- **Refresh Formulas**: Update retention formulas if manual inputs were changed
- **Rebuild Sheet Formatting**: Completely rebuild the Retention Grades sheet (preserves data)

### 📦 Archive & Maintenance
- **Archive Current Season**: Save a snapshot of the current season before starting a new one

---

## How to Use

### Regular Season Workflow
1. **Update Game Sheets**: Record game results in the box score sheets (one per game)
2. **Run Update All**: Click "Player Stats" → "🚀 Update All" to process all games
3. **Review Stats**: Check Rankings, Schedule, Team Sheets, and individual stat sheets
4. **Repeat**: Update after each game or set of games

### End of Season Workflow
1. **Final Update**: Run "Update All" one last time to ensure all stats are current
2. **Enter Postseason Results**: In the Retention Grades sheet, fill in the "Postseason Results" table at the bottom
3. **Enter Team Direction Scores**: In the Retention Grades sheet, fill in the "Team Direction Scores" table (0-20 for each team's outlook)
4. **Optionally Adjust Chemistry**: Enter Chemistry scores (0-20) for each player
5. **Calculate Retention**: Click "Player Stats" → "⭐ Retention" → "🏆 Calculate Final Retention Grades"
6. **Review Retention Grades**: Analyze retention probabilities, apply manual modifiers if needed
7. **Archive Season**: Click "Player Stats" → "📦 Archive & Maintenance" → "Archive Current Season"

---

## Technical Details

### System Requirements
- Google Sheets (cloud-based, no installation required)
- Access to the CLB League Hub spreadsheet
- Access to the box score spreadsheet (game sheets)

### Performance
- **Update All** runtime: ~45 seconds for a full 14-game season (all teams)
- **Retention Calculation** runtime: ~10-15 seconds

### Data Integrity
- Transaction detection warns of roster changes not properly logged
- Data validation prevents invalid inputs in manual entry fields
- Smart update system preserves formatting and manual inputs during recalculations

---

## Support & Feedback

For questions, bug reports, or feature requests, contact your league commissioner or file an issue at the [CLB League Hub GitHub repository](https://github.com/Vasqu3z/CLB-League-Hub).

---

## Credits

**System Design & Development**: League Administration
**Version**: 3.0
**Last Updated**: November 2, 2025

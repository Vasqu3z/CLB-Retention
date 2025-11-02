# CLB League Hub - Baseball Stats Management System

A comprehensive Google Sheets-based statistics management and player retention probability system for CLB, a Super Mario Sluggers AI vs. AI league.

## Overview

The CLB Hub automates the collection, calculation, and presentation of player and team statistics from game sheets. It provides dynamic standings, schedules, league leaders, team sheets, and an advanced player retention probability calculator.

---

## Sheet Descriptions

### Core Stat Sheets

#### **🧮 Team**
Aggregated team statistics across all categories:
- Win-loss records
- Team hitting totals and averages
- Team pitching totals and averages
- Team fielding statistics

#### **🧮 Hitting**
Complete offensive statistics for all players:
- **Counting Stats**: Games Played, At-Bats, Hits, Home Runs, RBIs, Walks, Strikeouts, Double Plays, Total Bases
- **Calculated Metrics**: Batting Average (AVG), On-Base Percentage (OBP), Slugging Percentage (SLG), On-Base Plus Slugging (OPS)
- **Sluggers-Specific Stat**: ROB (Hits Robbed) - tracks how often defensive "Nice Plays" were made against the batter

#### **🧮 Pitching**
Complete pitching statistics for all players:
- **Counting Stats**: Games Played, Wins, Losses, Saves, Innings Pitched, Batters Faced, Hits Allowed, Home Runs Allowed, Runs Allowed, Walks Allowed, Strikeouts
- **Calculated Metrics**: Earned Run Average (ERA), Batting Average Against (BAA), Walks + Hits per Inning Pitched (WHIP)

#### **🧮 Fielding & Running**
Defensive and baserunning statistics:
- **Fielding**: Games Played, Nice Plays (exceptional defensive plays), Errors
- **Baserunning**: Stolen Bases

---

### Dynamic Display Sheets

#### **🏆 Rankings**
The league homepage featuring:
- **Full Standings**: Ranked by win percentage, with tiebreakers for head-to-head record and run differential
- **League Leaders**: Top performers in key statistical categories (batting, pitching, fielding)
- **Recent Results**: Game scores from recent weeks with color-coded winners/losers
- **This Week's Games**: Upcoming matchups for the current week

#### **📅 Schedule**
Comprehensive schedule view:
- **Standings**: Current league standings (same as Rankings sheet)
- **Completed Games**: All finished games organized by week with clickable links to game sheets
- **Scheduled Games**: All upcoming games organized by week

#### **🧢 Team Sheets** (One per Team)
Individual team pages showing:
- **Player Statistics**: Full hitting, pitching, and fielding stats for all team members
- **League Standings**: Current standings with the team's row highlighted
- **Team Schedule**: All games (completed and upcoming) with color-coded win/loss results

---

### Retention System

#### **Retention Grades**
An advanced analytical sheet that calculates each player's probability of returning to their current team next season. The system uses a weighted formula incorporating multiple factors to generate a final retention grade on a 5-95 scale.

**The Five Retention Factors:**

1. **Team Success**
   - **What it measures**: How well the team performed during the season
   - **Components**:
     - Regular season standing (1st place through 8th place)
     - Postseason performance (Champion, Runner-up, Semifinal, Quarterfinal, or Missed Playoffs)
   - **Why it matters**: Players on successful teams are more likely to return. Last place finishes significantly hurt retention.

2. **Play Time**
   - **What it measures**: How much the player actually played and how they were used
   - **Components**:
     - Games played percentage (how many team games the player appeared in)
     - Usage quality (average lineup position for hitters, innings per game for pitchers)
   - **Why it matters**: Players who play regularly and are used properly (e.g., star hitters in the top 3 of the lineup) are more likely to stay. Benchwarmers and misused stars are flight risks.

3. **Performance**
   - **What it measures**: Statistical performance relative to other players in the league
   - **Components**:
     - Offensive contribution (percentile ranking in AVG, OBP, SLG, OPS, HR, RBI)
     - Defensive contribution (percentile ranking in Nice Plays minus Errors per game)
     - Pitching contribution (percentile ranking in ERA, WHIP, BAA)
   - **Advanced Features**:
     - **Auto-flagging**: Elite players on struggling teams receive a retention penalty (flight risk)
     - **Draft expectations**: Performance is evaluated against draft position (high picks underperforming get penalized, late picks overperforming may feel undervalued)
   - **Why it matters**: Players who excel statistically are valuable assets, but mismatches between ability and situation create retention risk.

4. **Chemistry**
   - **What it measures**: Player-team fit and locker room dynamics
   - **How it works**: Commissioners enter scores from 0-20 based on team evaluation
   - **Why it matters**: Good chemistry keeps players with their teams even when other factors suggest they might leave.

5. **Team Direction**
   - **What it measures**: The team's perceived competitive outlook for the next season
   - **How it works**: One score per team (0-20), inherited by all players on that team
   - **Why it matters**: Players want to be on teams with a bright future. Rebuilding teams lose players, contenders retain them.

**Manual Adjustments:**
- **Draft/Trade Value**: Records the round in which each player was drafted (1-8), used for draft expectations calculations
- **Modifiers**: Commissioner can apply adjustments to Team Success, Play Time, and Performance factors to account for context (trades, star point use, etc.)

**Output:**
- **Final Grade**: A number from 5 to 95 representing retention probability
  - 70-95: Excellent retention probability (green)
  - 55-69: Good retention probability (light blue)
  - 40-54: Uncertain retention (yellow)
  - 5-39: Poor retention probability (red)
- **Details Column**: Shows the breakdown of each factor's contribution

---

## Support & Feedback

For questions, bug reports, or feature requests, contact Vasquez or file an issue at the [CLB League Hub GitHub repository](https://github.com/Vasqu3z/CLB-League-Hub).

---

## Credits

**System Design & Development**: Vasquez w/ assistance from Claude AI
**Version**: 3.0
**Last Updated**: November 2, 2025


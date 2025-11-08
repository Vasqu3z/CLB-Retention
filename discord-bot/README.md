# CLB League Discord Bot ⚾

Your all-in-one Discord bot for CLB League statistics, standings, schedules, and player information. Get instant access to league data without leaving Discord!

---

## 🎯 Features

- **📊 Player Statistics** - Comprehensive hitting, pitching, and fielding stats for every player
- **🏆 League Leaders** - Top 5 rankings for any stat category
- **📈 Team Stats** - Complete team performance metrics and records
- **🏅 Standings** - Live league standings with win percentage and games back
- **📅 Schedules** - View upcoming games, past scores, and team schedules
- **⚔️ Head-to-Head** - Historical matchup records between teams
- **🔍 Player Comparison** - Side-by-side stat comparisons
- **👥 Team Rosters** - View complete team rosters with GMs

---

## 💬 Commands

### Player Information

#### `/playerstats`
View comprehensive stats for any player.

**Usage:** `/playerstats name: PlayerName`

**Shows:**
- Hitting stats (AVG, HR, RBI, OPS, etc.)
- Pitching stats (ERA, W-L, IP, WHIP, etc.)
- Fielding stats (Nice Plays, Errors, SB)
- Player headshot (if available)

---

#### `/compare`
Compare two players side-by-side.

**Usage:** `/compare player1: Player1 player2: Player2`

**Shows:**
- Side-by-side stat comparison
- Better stats marked with `*`
- All relevant stat categories for both players

---

### Team Information

#### `/teamstats`
View detailed team statistics.

**Usage:** `/teamstats teamname: TeamName`

**Shows:**
- Team record and winning percentage
- Team hitting stats (AVG, HR, RBI, etc.)
- Team pitching stats (ERA, WHIP, etc.)
- Team fielding stats
- Team icon (if available)

---

#### `/roster`
View a team's complete roster.

**Usage:** `/roster teamname: TeamName`

**Shows:**
- General Manager name
- Complete player list
- Team icon (if available)

---

### League Information

#### `/standings`
View current league standings.

**Usage:** `/standings`

**Shows:**
- Team rankings
- Win-Loss records
- Winning percentage
- Games behind leader
- Run differential (+/-)

---

#### `/rankings`
View top 5 league leaders for any stat.

**Usage:** `/rankings stat: StatName`

**Available Stats:**
- **Batting:** OBP, Hits, Home Runs, RBI, Slugging, OPS
- **Pitching:** Innings Pitched, Wins, Losses, Saves, ERA, WHIP, BAA
- **Fielding:** Nice Plays, Errors, Stolen Bases

**Shows:**
- Top 5 players for selected stat
- Player rankings with team affiliation
- Qualification requirements applied for rate stats

---

### Schedule Information

#### `/schedule`
View league schedule for upcoming weeks.

**Usage:**
- `/schedule filter: current` - Current week's games
- `/schedule filter: upcoming` - Next week's games
- `/schedule filter: week` → Select specific week

**Shows:**
- Game matchups with @ notation (Away @ Home)
- Completed games show final scores with winners bolded
- Links to box scores for completed games
- Game numbering (Game 1, Game 2, etc.)

---

#### `/scores`
View past game results for completed weeks.

**Usage:** `/scores week: WeekNumber`

**Shows:**
- All completed games for selected week
- Final scores with winners bolded
- Links to box scores
- Game numbering

---

#### `/teamschedule`
View a team's full season schedule.

**Usage:** `/teamschedule teamname: TeamName`

**Shows:**
- All games organized by week
- Completed games with scores
- Upcoming games
- Team icon (if available)

---

#### `/headtohead`
View matchup history between two teams.

**Usage:** `/headtohead team1: Team1 team2: Team2`

**Shows:**
- Overall head-to-head record
- Average runs per game for each team
- Complete game-by-game results
- Links to box scores

---

## 🔍 Autocomplete Features

All commands include **autocomplete** to make finding players and teams easy:

- **Player names** - Start typing and matching players appear
- **Team names** - Shows team name and GM
- **Stats** - Shows abbreviation and full name (e.g., "HR - Home Runs")
- **Weeks** - Only shows relevant weeks (completed for scores, upcoming for schedule)

---

## 🖼️ Visual Features

The bot displays images when available:
- **Player headshots** on player stat cards
- **Team icons** on team stats and rosters
- **League logo** on league-wide commands (standings, schedules)

---

## 📊 Data Updates

- Stats refresh every **5 minutes** from the Google Sheets database
- Instant access to recently updated stats
- No manual refresh needed!

---

## ❓ Tips & Tricks

### Finding Players
You can search by **first name, last name, or team**:
- Type "john" to find all Johns
- Type "yankees" to find all Yankees players

### Team Searches
Teams show up as **"Team Name - GM Name"** in autocomplete:
- Search by team name
- Search by GM name
- Filter automatically excludes teams without captains

### Stat Abbreviations
Not sure what a stat means? The autocomplete shows both:
- **Short version:** HR
- **Full name:** Home Runs

---

## 📝 Notes

### Qualification Standards
For rate stats (AVG, ERA, OBP, etc.), players must meet minimum playing time:
- **Batting stats:** 2.1 × team games played in AB
- **Pitching stats:** 1.0 × team games played in IP

### Schedule Format
- **@** indicates location (Away @ Home)
- **Bold** indicates winner
- **Week #:** precedes each game
- **Game #:** shows game number in multi-game weeks

---

## 🆘 Support

Having issues with the bot? Here's how to troubleshoot:

1. **Bot not responding?**
   - Check if the bot is online (green status)
   - Try again in a few seconds (might be updating)

2. **Autocomplete not working?**
   - Start typing slower
   - Try partial names instead of full names

3. **Player/Team not found?**
   - Check spelling
   - Try searching by team instead
   - Player may not have stats yet this season

4. **Stats seem outdated?**
   - Stats update every 5 minutes
   - Recent games may take a few minutes to appear

---

## 🎉 Enjoy!

Use these commands to stay on top of CLB League action all season long. Whether you're tracking your fantasy team, checking standings, or settling debates about who's the best hitter, the bot has you covered!

**Go get those stats!** ⚾📊

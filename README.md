# CLB League Hub - Baseball Stats Management System

A comprehensive statistics management and player retention probability system for CLB (Comets League Baseball), a Super Mario Sluggers AI vs. AI league.

## 🏗️ System Architecture (v2.0)

This repository contains **three complementary systems**:

1. **Google Apps Script Backend** (`apps-script/`) - Processes game data, calculates stats
2. **Next.js Website** (`website/`) - Modern web interface for viewing stats
3. **Discord Bot** (`discord-bot/`) - Real-time stats access via Discord commands

### Hybrid Approach

- **Commissioners** use Google Sheets + Apps Script for data entry and management
- **Players/Fans** use the website or Discord bot for viewing stats, standings, and schedules
- Data flows: Box Scores → Apps Script → Consolidated Sheets → Website/Discord Bot (via Sheets API)

## 📁 Repository Structure

```
CLB-League-Hub/
├── apps-script/              # Google Apps Script backend (~6,000 lines, v2.0)
│   ├── LeagueCore.js         # UpdateAll orchestrator & menu
│   ├── LeagueGames.js        # Game processing engine
│   ├── LeaguePlayerStats.js  # Player Data sheet updates
│   ├── LeagueTeamStats.js    # Team Data sheet updates
│   ├── LeagueRankings.js     # Standings sheet updates
│   ├── LeagueTransactions.js # Transaction tracking
│   ├── LeagueArchive.js      # Season archiving
│   ├── Retention*.js (5)     # Retention grade system
│   └── README.md             # Apps Script documentation
├── website/                  # Next.js public website
│   └── README.md             # Website documentation
├── discord-bot/              # Discord bot with slash commands
│   ├── DEPLOYMENT.md         # Railway deployment guide
│   └── README.md             # Bot documentation
├── vercel.json               # Vercel deployment config
└── README.md                 # This file
```

## 🚀 Quick Start

### For Commissioners (Apps Script)
1. Open your Google Sheets spreadsheet
2. Extensions → Apps Script
3. Copy contents of `apps-script/*.js` into your project
4. Run **Player Stats → 🚀 Update All** (completes in ~45s)

### For Developers (Website)
```bash
cd website
npm install
cp .env.example .env.local
# Add your Google Sheets API credentials
npm run dev
```

Visit http://localhost:3000

### For Discord Bot
See [`discord-bot/DEPLOYMENT.md`](discord-bot/DEPLOYMENT.md) for Railway deployment instructions.

---

## 📊 v2.0 Schema (Consolidated Stats)

### Core Data Sheets

#### **Player Data** (Consolidated v2.0)
All player statistics in one sheet:
- Player name, team, games played
- **Hitting Stats**: AB, H, HR, RBI, BB, K, ROB, DP, TB, AVG, OBP, SLG, OPS
- **Pitching Stats**: W, L, SV, ERA, IP, BF, H, HR, R, BB, K, BAA, WHIP
- **Fielding Stats**: NP (Nice Plays), E (Errors), SB (Stolen Bases)

#### **Team Data** (Consolidated v2.0)
Team rosters with aggregated stats:
- Team name, player roster
- Aggregate team hitting, pitching, and fielding totals
- Win-loss records

#### **Standings**
Current league standings:
- Rank, Team, W, L, Win%, RS, RA, Diff
- Tiebreakers: head-to-head record, then run differential

#### **Schedule**
Season schedule with results:
- Week, Away Team, Home Team
- Game results: scores, winner, loser, MVP, pitchers, box score links

#### **Rosters**
Team roster assignments (read-only reference)

#### **Transactions**
Transaction log:
- Week, Type (Trade/Sign/Release/Promote/Demote), Players, Teams

#### **Star Points**
Star point allocation tracking (custom CLB mechanic)

---

## ⚡ UpdateAll Flow (3 Steps)

The streamlined v2.0 update process:

**Game Processing** (reads all game sheets once)
- Extracts player stats, team stats, schedule data
- Caches in memory for performance

**Step 1: Update Player Data**
- Writes consolidated player statistics

**Step 2: Update Team Data**
- Writes team rosters and aggregated stats
- Writes game results to Schedule sheet

**Step 3: Update Standings**
- Calculates standings with tiebreakers
- Adds head-to-head tooltips

**Total Time**: ~30-45 seconds for full season

---

## 🏆 Retention System

### **Retention Grades Sheet**
An advanced analytical sheet that calculates each player's probability of returning to their current team next season. The system uses a weighted formula incorporating multiple factors to generate a final retention grade on a 5-95 scale.

**The Five Retention Factors:**

1. **Team Success** (Regular season standing + Postseason performance)
2. **Play Time** (Games played % + Usage quality)
3. **Performance** (Statistical percentile rankings with elite player flight risk detection)
4. **Chemistry** (Commissioner-assigned locker room dynamics score)
5. **Team Direction** (Competitive outlook for next season)

**Output:**
- **Final Grade**: 5-95 retention probability scale
  - 70-95: Excellent (green)
  - 55-69: Good (light blue)
  - 40-54: Uncertain (yellow)
  - 5-39: Poor (red)
- **Details**: Breakdown of each factor's contribution

---

## 🌐 Website Features

The Next.js website provides a modern, mobile-friendly interface:

- **🏆 Standings** - League standings with team records
- **📅 Schedule** - Full season schedule with results and box score links
- **🧢 Team Pages** - Team rosters with aggregated stats (Hitting, Pitching, Fielding)
- **🔍 Player Lookup** - Search and view individual player statistics

### Website Deployment

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Vercel auto-detects `website/` directory (via `vercel.json`)
4. Add environment variables: `SHEETS_SPREADSHEET_ID`, `GOOGLE_CREDENTIALS`
5. Deploy!

---

## 🤖 Discord Bot

Real-time stats access via Discord slash commands:

- `/standings` - View league standings
- `/schedule` - View season schedule with results
- `/player <name>` - Look up player stats
- `/team <name>` - View team roster and stats

**Deployment**: Railway (see `discord-bot/DEPLOYMENT.md`)

---

## 📚 Documentation

- **[apps-script/README.md](apps-script/README.md)** - Apps Script v2.0 architecture guide
- **[website/README.md](website/README.md)** - Website technical docs
- **[website/SETUP_GUIDE.md](website/SETUP_GUIDE.md)** - Deployment guide
- **[discord-bot/README.md](discord-bot/README.md)** - Discord bot documentation
- **[discord-bot/DEPLOYMENT.md](discord-bot/DEPLOYMENT.md)** - Railway deployment guide
- **[Gold Standard Implementation Guide.md](Gold%20Standard%20Implementation%20Guide.md)** - Coding standards

---

## 🔧 Technical Stack

**Apps Script Backend:**
- Google Apps Script (JavaScript)
- Google Sheets API
- Batch I/O operations for performance
- In-memory data caching

**Website:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Google Sheets API v4

**Discord Bot:**
- Discord.js v14
- Node.js
- Google Sheets API v4
- Railway hosting

---

## 📈 Version History

- **v3.0 (Apps Script)** - v2.0 schema consolidation, ~40% faster UpdateAll
- **v1.0 (Website)** - Next.js 15 modern web interface
- **v1.0 (Discord Bot)** - Real-time Discord slash commands

---

## Credits

**System Design & Development**: Vasquez w/ assistance from Claude AI
**Version**: 3.0 (Apps Script) + 1.0 (Website) + 1.0 (Discord Bot)
**Last Updated**: January 2025

**Built with ❤️ for CLB**
⚾ Super Mario Sluggers AI League 🎮

# CLB League Hub - Web Migration Implementation Plan
## Phase 1 + Transaction Timeline

**Start Date:** November 9, 2025
**Target Completion:** 8-10 weeks (6-8 hours/week pace)
**Tech Stack:** Next.js 14 + Vercel + Google Sheets API
**Budget:** $12-15 (domain only)

---

## 🎯 Goals

### Primary Objectives
1. ✅ Deprecate slow/poorly-laid-out Sheets pages (Rankings, Schedule, Team Sheets)
2. ✅ Enable historical archive browsing (KEY for multi-season growth)
3. ✅ Provide modern, mobile-friendly viewing experience
4. ✅ Keep commissioners' Sheets workflow unchanged

### Performance Targets
- **Eliminate 50%+ of UpdateAll time** by deprecating Team Sheets updates
- **Improve mobile UX** from "barely usable" to "excellent"
- **Enable historical data access** (currently buried in archived spreadsheets)

---

## 📋 Scope Breakdown

### ✅ MIGRATE TO WEB (Phase 1)
1. **LeagueRankings.js** → `/standings`, `/leaders`
2. **LeagueSchedule.js** → `/schedule`
3. **LeagueTeamSheets.js** → `/teams/[name]` ⚠️ **CRITICAL** (50% of UpdateAll time)
4. **LeagueArchive.js** → `/seasons`, `/seasons/[year]`, `/all-time` 🎯 **KEY**
5. **LeagueTransactions.js** → `/transactions`
6. **LeagueConfig.js** → Create web config (`config/league.js`)

### ✅ KEEP IN SHEETS (No Changes)
- **LeagueCore.js** - Menu system, orchestration
- **LeagueGames.js** - Game processing (keep current approach)
- **LeagueUtility.js** - Backend utilities
- **LeaguePlayerStats.js** - Stats updates
- **LeagueTeamStats.js** - Team stats updates
- **Retention Suite** - All calculation logic (hidden from public)

### 🔄 TEMPORARY HYBRID
- **PlayerComparison** - Deploy current HTML app via Apps Script, enhance later

---

## 🏗️ Architecture

### Data Flow
```
Box Score Spreadsheet
         ↓
   [Apps Script]
   LeagueGames.js processes games
         ↓
   Stats Sheets updated
   (Hitting, Pitching, Fielding, Team Data, etc.)
         ↓
   [Google Sheets API]
         ↓
   [Next.js Website]
   Reads processed data, displays in modern UI
         ↓
   Users view stats
```

### What Changes in Apps Script
```diff
// LeagueCore.js - updateAll()

- Step 3: Update team sheets (SLOW - 50% of time)
+ Step 3: SKIP (website reads directly from stats sheets)

Result: UpdateAll goes from ~60s → ~30s
```

### Website Stack
```
Frontend: Next.js 14 (App Router)
Styling: Tailwind CSS + shadcn/ui
Data: Google Sheets API v4 (read-only)
Hosting: Vercel (free tier)
Domain: [YOUR-DOMAIN].com
CDN: Cloudflare (optional, free)
Analytics: Vercel Analytics (free)
```

---

## 📅 Implementation Roadmap

### Week 1-2: Project Setup (8-10 hours)
**Goal:** Live website with basic infrastructure

**Tasks:**
- [ ] Create Next.js project
- [ ] Set up Google Sheets API credentials
- [ ] Configure environment variables
- [ ] Create basic layout (header, nav, footer)
- [ ] Set up Tailwind CSS + shadcn/ui components
- [ ] Create league config file
- [ ] Deploy to Vercel
- [ ] Connect custom domain (optional for now)
- [ ] Test Sheets API connection

**Deliverables:**
- ✅ Live site at `[your-app].vercel.app`
- ✅ Home page with navigation
- ✅ Sheets API successfully reading data

**Files to create:**
```
clb-league-hub/
├── app/
│   ├── layout.js          # Main layout
│   ├── page.js            # Home page
│   └── globals.css        # Tailwind imports
├── components/
│   ├── Header.js          # Site header
│   ├── Footer.js          # Site footer
│   └── Nav.js             # Navigation
├── lib/
│   ├── sheets.js          # Sheets API integration
│   └── utils.js           # Helper functions
├── config/
│   └── league.js          # League config (teams, colors, etc.)
├── .env.local             # Environment variables
└── next.config.js         # Next.js config
```

---

### Week 3-4: Standings & Leaders (15-18 hours)
**Goal:** Replace Rankings sheet with web pages

**Tasks:**
- [ ] `/standings` page
  - Fetch from "🏆 Rankings" sheet (rows 4-11, columns A-H)
  - Display standings table (responsive)
  - Team links to team pages
  - Win% formatting
  - Run differential color coding (green/red)
  - Mobile-responsive
- [ ] `/leaders` page
  - Fetch league leaders data (columns J, L, N)
  - Tabbed interface (Batting | Pitching | Fielding)
  - Dropdown filter by stat (OBP, Hits, HR, RBI, SLG, OPS, etc.)
  - Player search box
  - Click player → player profile (future)
  - Mobile-responsive

**Components to build:**
- `<StandingsTable />` - Reusable standings component
- `<LeaderBoard />` - League leaders component
- `<PlayerLink />` - Link to player profile
- `<StatFilter />` - Dropdown filter

**Data Sources:**
- Sheet: "🏆 Rankings"
- Standings: Range A4:H11
- Leaders: Columns J (batting), L (pitching), N (fielding)

**Deliverables:**
- ✅ `/standings` page live
- ✅ `/leaders` page live
- ✅ Users can browse standings and leaders
- ✅ Mobile-friendly

---

### Week 5-6: Schedule (10-12 hours)
**Goal:** Replace Schedule sheet with web page

**Tasks:**
- [ ] `/schedule` page
  - Fetch from "📅 Schedule" sheet or "Season Schedule" sheet
  - Display games grouped by week
  - Filter dropdown (All Teams, Team A, Team B, etc.)
  - Status filter (All Games, Completed, Upcoming)
  - Color-coded W/L for completed games
  - Click game → box score page (future, for now just highlight)
  - Mobile-responsive
- [ ] Game card component
  - Home vs Away
  - Score (if completed)
  - Week number
  - Status badge (Completed/Upcoming)

**Components to build:**
- `<SchedulePage />` - Main schedule page
- `<GameCard />` - Individual game display
- `<GameFilter />` - Filter controls
- `<WeekSection />` - Week grouping

**Data Sources:**
- Sheet: "📅 Schedule" or parse from "Season Schedule"
- Need to determine best source (discuss with you)

**Deliverables:**
- ✅ `/schedule` page live
- ✅ Filter by team working
- ✅ W/L color coding
- ✅ Mobile-friendly

---

### Week 7-9: Team Pages ⚠️ **CRITICAL** (18-22 hours)
**Goal:** Deprecate team sheet updates (eliminates 50% of UpdateAll time)

**Tasks:**
- [ ] `/teams/[team]` dynamic route
  - Fetch roster from stats sheets (Hitting, Pitching, Fielding)
  - Filter by team name
  - Display roster table with sortable columns
  - Tabs: Roster | Schedule | Stats
  - Team header (name, logo, record, standing)
  - Team stats summary (aggregated)
  - Recent games
  - Mobile-responsive
- [ ] `/teams` page - List all teams
- [ ] Modify Apps Script
  - Comment out `updateTeamSheetsFromCache()` in LeagueCore.js
  - Test that UpdateAll still works
  - Measure new UpdateAll time (~30s expected)

**Components to build:**
- `<TeamPage />` - Main team page
- `<RosterTable />` - Sortable player roster
- `<TeamHeader />` - Team info banner
- `<TeamStats />` - Team statistics
- `<TeamSchedule />` - Team's games

**Data Sources:**
- Fetch from "🧮 Hitting", "🧮 Pitching", "🧮 Fielding" sheets
- Filter rows where Team column matches team name
- Get team record from "Team Data" sheet

**Apps Script Changes:**
```javascript
// LeagueCore.js - updateAll()

// ===== STEP 3: Update team sheets (using cached data) =====
// DEPRECATED - Website now handles team pages
/*
SpreadsheetApp.getActiveSpreadsheet().toast("Step 3 of 5: Updating team sheets...", "Update All", -1);
var step3Start = new Date();
updateTeamSheetsFromCache(gameData.teamStatsWithH2H, gameData.scheduleData, gameData.boxScoreUrl);
var step3Time = ((new Date() - step3Start) / 1000).toFixed(1);
SpreadsheetApp.flush();
*/
var step3Time = 0; // Skip team sheets - handled by website
```

**Deliverables:**
- ✅ `/teams/[team]` pages live for all teams
- ✅ Roster tables sortable
- ✅ Team stats displayed
- ✅ UpdateAll time reduced by ~50% 🎉
- ✅ Mobile-friendly

**Performance Impact:**
- **Before:** UpdateAll ~60 seconds (Step 3 = ~30s)
- **After:** UpdateAll ~30 seconds (Step 3 skipped)

---

### Week 10-12: Historical Archives 🎯 **KEY** (20-25 hours)
**Goal:** Enable browsing of past seasons (main growth vector)

**Tasks:**
- [ ] Configure archived season spreadsheets
  - Create config mapping: `{ "2024": "SHEET_ID_2024", "2023": "SHEET_ID_2023" }`
  - Store in `config/seasons.js`
- [ ] `/seasons` page - List all seasons
  - Card grid showing each season
  - Click season → view that season's data
- [ ] `/seasons/[year]` page
  - Fetch from archived spreadsheet
  - Display final standings (reuse `<StandingsTable />`)
  - Display season leaders (reuse `<LeaderBoard />`)
  - Display playoff results (if available)
  - Season summary stats
- [ ] `/all-time` page - All-time leaders
  - Aggregate stats across all seasons
  - Career HR leaders, ERA leaders, etc.
  - Filter by category
- [ ] Season selector in header
  - Dropdown: "Current Season" | "2024" | "2023" | ...
  - Changes context of all pages

**Components to build:**
- `<SeasonCard />` - Season summary card
- `<SeasonSelector />` - Dropdown in header
- `<AllTimeLeaders />` - Career leaderboards

**Data Sources:**
- Current season: Current spreadsheet
- Past seasons: Archived spreadsheets (IDs in config)
- All-time: Aggregate across all spreadsheets

**Config Example:**
```javascript
// config/seasons.js
export const SEASONS = [
  {
    year: "2025",
    name: "Season 5",
    spreadsheetId: process.env.SHEETS_CURRENT_SEASON_ID,
    current: true,
  },
  {
    year: "2024",
    name: "Season 4",
    spreadsheetId: "1abc...xyz",
    champion: "Team A",
  },
  {
    year: "2023",
    name: "Season 3",
    spreadsheetId: "1def...uvw",
    champion: "Team B",
  },
  // ...
];
```

**Deliverables:**
- ✅ `/seasons` page live
- ✅ `/seasons/[year]` pages for all past seasons
- ✅ `/all-time` leaders page
- ✅ Season selector in header
- ✅ Historical data browsable 🎉
- ✅ Mobile-friendly

---

### Week 13-14: Transaction Timeline (4-6 hours)
**Goal:** Public transaction history

**Tasks:**
- [ ] `/transactions` page
  - Fetch from "🔀 Transactions" sheet
  - Timeline view (newest first)
  - Filter by type (All, Trade, Add, Drop, Waiver)
  - Filter by team
  - Search by player name
  - Transaction cards with icons
  - Mobile-responsive

**Components to build:**
- `<TransactionTimeline />` - Main timeline
- `<TransactionCard />` - Individual transaction
- `<TransactionFilters />` - Filter controls

**Data Source:**
- Sheet: "🔀 Transactions"
- Columns: Date, Type, Team, Player, Details

**Transaction Card Design:**
```
┌─────────────────────────────────────┐
│ 📅 Nov 9, 2024          [TRADE]     │
│ Team A trades Mike Trout to Team B  │
│ for Shohei Ohtani                   │
└─────────────────────────────────────┘
```

**Deliverables:**
- ✅ `/transactions` page live
- ✅ Filtering working
- ✅ Mobile-friendly

---

### Week 15-16: Polish & Testing (8-10 hours)
**Goal:** Production-ready site

**Tasks:**
- [ ] SEO optimization
  - Meta tags for all pages
  - Open Graph tags (social sharing)
  - Structured data (JSON-LD)
  - Sitemap generation
- [ ] Performance optimization
  - Image optimization
  - Code splitting
  - Caching strategy
  - Lighthouse audit (target 90+ score)
- [ ] Accessibility
  - ARIA labels
  - Keyboard navigation
  - Screen reader testing
  - Color contrast check
- [ ] Error handling
  - 404 page
  - Error boundaries
  - Graceful Sheets API failures
  - Loading states
- [ ] Testing
  - Manual testing on mobile devices
  - Cross-browser testing (Chrome, Safari, Firefox)
  - Edge cases (empty data, missing teams, etc.)
- [ ] Documentation
  - README for future developers
  - Deployment instructions
  - Environment setup guide

**Deliverables:**
- ✅ Site passes Lighthouse audit (90+)
- ✅ Works on all major browsers
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Error handling robust
- ✅ Documentation complete

---

## 🔧 Apps Script Changes Required

### 1. LeagueCore.js Modification
```javascript
// Comment out Step 3 in updateAll()

function updateAll() {
  var startTime = new Date();
  logInfo("Update All", "Starting full update process");

  try {
    detectMissingTransactions();

    // Process all game sheets ONCE
    SpreadsheetApp.getActiveSpreadsheet().toast("Processing all game sheets...", "Update All", -1);
    var processingStart = new Date();

    var gameData = processAllGameSheetsOnce();
    if (!gameData) {
      SpreadsheetApp.getUi().alert("Failed to process game sheets. Check Error Log for details.");
      return;
    }

    _spreadsheetCache.gameData = gameData;

    var processingTime = ((new Date() - processingStart) / 1000).toFixed(1);
    logInfo("Update All", "Game processing completed in " + processingTime + "s");
    SpreadsheetApp.flush();

    // STEP 1: Update player stats
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 1 of 4: Updating player stats...", "Update All", -1);
    var step1Start = new Date();
    updateAllPlayerStatsFromCache(gameData.playerStats);
    var step1Time = ((new Date() - step1Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();

    // STEP 2: Update team stats
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 2 of 4: Updating team stats...", "Update All", -1);
    var step2Start = new Date();
    updateAllTeamStatsFromCache(gameData.teamStats);
    var step2Time = ((new Date() - step2Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();

    // STEP 3: Update team sheets - DEPRECATED (website now handles)
    // SpreadsheetApp.getActiveSpreadsheet().toast("Step 3 of 5: Updating team sheets...", "Update All", -1);
    // var step3Start = new Date();
    // updateTeamSheetsFromCache(gameData.teamStatsWithH2H, gameData.scheduleData, gameData.boxScoreUrl);
    // var step3Time = ((new Date() - step3Start) / 1000).toFixed(1);
    // SpreadsheetApp.flush();
    var step3Time = 0; // Skipped - website handles team pages

    // STEP 4: Update league hub (now STEP 3)
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 3 of 4: Updating league hub...", "Update All", -1);
    var step4Start = new Date();
    updateLeagueHubFromCache(gameData);
    var step4Time = ((new Date() - step4Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();

    // STEP 5: Update league schedule (now STEP 4)
    SpreadsheetApp.getActiveSpreadsheet().toast("Step 4 of 4: Updating league schedule...", "Update All", -1);
    var step5Start = new Date();
    updateLeagueScheduleFromCache(gameData.scheduleData, gameData.teamStatsWithH2H, gameData.gamesByWeek, gameData.boxScoreUrl);
    var step5Time = ((new Date() - step5Start) / 1000).toFixed(1);
    SpreadsheetApp.flush();

    var totalTime = ((new Date() - startTime) / 1000).toFixed(1);

    var stepsTime = (parseFloat(step1Time) + parseFloat(step2Time) +
                     parseFloat(step4Time) + parseFloat(step5Time)).toFixed(1);

    var message = "✅ Update Complete!\n\n" +
                  "Game Processing: " + processingTime + "s\n" +
                  "Steps 1-4: " + stepsTime + "s\n" +
                  "─────────────\n" +
                  "Total: " + totalTime + "s\n" +
                  "(Team sheets skipped - view on website)";

    SpreadsheetApp.getActiveSpreadsheet().toast(message, "Update Complete", 10);
    logInfo("Update All", "Completed successfully in " + totalTime + "s");

    cacheCurrentSeasonStats(gameData);

  } catch (e) {
    logError("Update All", e.toString(), "N/A");
    SpreadsheetApp.getUi().alert("Error during update: " + e.toString());
  }

  clearCache();
}
```

**Expected Performance Improvement:**
- **Before:** 45-60 seconds total
- **After:** 20-35 seconds total (40-50% reduction)

---

## 📊 Feature Completion Checklist

### Core Pages
- [ ] Home page (`/`)
- [ ] Standings (`/standings`)
- [ ] League Leaders (`/leaders`)
- [ ] Schedule (`/schedule`)
- [ ] Team Pages (`/teams/[name]`)
- [ ] All Teams (`/teams`)
- [ ] Transactions (`/transactions`)
- [ ] Seasons List (`/seasons`)
- [ ] Season View (`/seasons/[year]`)
- [ ] All-Time Leaders (`/all-time`)

### Components
- [ ] Header with navigation
- [ ] Footer
- [ ] Standings table (reusable)
- [ ] Leader board (reusable)
- [ ] Game card
- [ ] Player link
- [ ] Team link
- [ ] Stat filter
- [ ] Season selector

### Infrastructure
- [ ] Google Sheets API integration
- [ ] Environment variables
- [ ] League config
- [ ] Seasons config
- [ ] Error handling
- [ ] Loading states
- [ ] 404 page

### Deployment
- [ ] Vercel deployment
- [ ] Custom domain (optional)
- [ ] Analytics setup
- [ ] SEO optimization

---

## 🎨 Design System

### Colors (Suggestion - Customize as Needed)
```css
/* CLB League Brand Colors */
--primary: #1a73e8;      /* Blue (standings, links) */
--secondary: #5f6368;    /* Gray (secondary text) */
--success: #34a853;      /* Green (wins, positive) */
--danger: #ea4335;       /* Red (losses, negative) */
--warning: #fbbc04;      /* Yellow (warnings) */
--background: #ffffff;   /* White */
--surface: #f8f9fa;      /* Light gray (cards, tables) */
--text: #202124;         /* Dark gray (primary text) */
--text-secondary: #5f6368; /* Gray (secondary text) */
```

### Typography
```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Helvetica Neue', Arial, sans-serif;

/* Headings */
h1: 2.5rem (40px), font-weight: 700
h2: 2rem (32px), font-weight: 600
h3: 1.5rem (24px), font-weight: 600
h4: 1.25rem (20px), font-weight: 600

/* Body */
body: 1rem (16px), font-weight: 400
small: 0.875rem (14px)
```

### Spacing
```css
/* Tailwind spacing scale */
xs: 0.5rem (8px)
sm: 0.75rem (12px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

---

## 🧪 Testing Plan

### Manual Testing Checklist
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test on tablet
- [ ] Test on desktop (Chrome, Firefox, Safari, Edge)
- [ ] Test with slow connection (throttle to 3G)
- [ ] Test with JavaScript disabled (graceful degradation)
- [ ] Test all filters and dropdowns
- [ ] Test pagination (if implemented)
- [ ] Test search functionality
- [ ] Test all links work
- [ ] Test 404 page

### Data Testing
- [ ] Test with empty data (no games)
- [ ] Test with missing teams
- [ ] Test with missing players
- [ ] Test with archived seasons
- [ ] Test with multiple seasons
- [ ] Test with special characters in names
- [ ] Test with long team/player names

### API Testing
- [ ] Test Sheets API rate limits
- [ ] Test API failures (network error)
- [ ] Test invalid spreadsheet ID
- [ ] Test invalid range
- [ ] Test permissions errors

---

## 📝 Documentation to Create

### 1. README.md
```markdown
# CLB League Hub

Modern web interface for CLB Baseball League statistics.

## Features
- League standings and leaders
- Team pages with rosters
- Schedule with filtering
- Historical season archives
- Transaction timeline

## Tech Stack
- Next.js 14
- Tailwind CSS
- Google Sheets API
- Vercel

## Development
[Setup instructions...]

## Deployment
[Deployment instructions...]
```

### 2. SETUP.md
- Step-by-step development environment setup
- Google Sheets API credential creation
- Environment variable configuration
- Local development instructions

### 3. DEPLOYMENT.md
- Vercel deployment steps
- Environment variables for production
- Domain setup
- Monitoring and analytics

### 4. DATA_STRUCTURE.md
- Document Sheets structure
- Column mappings
- Data format expectations
- Adding new seasons

---

## 💰 Final Cost Estimate

### One-Time Costs
| Item | Cost |
|------|------|
| Domain (.com) | $12-15 |
| Development | $0 (DIY) |
| **Total** | **$12-15** |

### Recurring Costs (Annual)
| Item | Cost |
|------|------|
| Domain renewal | $12-15 |
| Hosting (Vercel) | $0 |
| Database | $0 (Sheets) |
| CDN | $0 |
| SSL | $0 |
| **Total/Year** | **$12-15** |

### Time Investment
| Phase | Hours | Weeks @ 8hr/wk |
|-------|-------|----------------|
| Setup | 8-10 | 1-2 |
| Standings/Leaders | 15-18 | 2 |
| Schedule | 10-12 | 1-2 |
| Team Pages | 18-22 | 2-3 |
| Archives | 20-25 | 2-3 |
| Transactions | 4-6 | 1 |
| Polish | 8-10 | 1-2 |
| **Total** | **83-103** | **10-13 weeks** |

**At 6 hours/week:** 14-17 weeks (3.5-4 months)
**At 8 hours/week:** 10-13 weeks (2.5-3 months)
**At 10 hours/week:** 8-10 weeks (2-2.5 months)

---

## 🎯 Success Metrics

### Performance
- [ ] UpdateAll time reduced by 40-50% (60s → 30s)
- [ ] Website loads in < 2 seconds
- [ ] Mobile PageSpeed score 90+
- [ ] Desktop PageSpeed score 95+

### User Experience
- [ ] Mobile navigation functional
- [ ] Filters work smoothly
- [ ] Search is responsive
- [ ] Historical data accessible

### Adoption
- [ ] Commissioners continue using Sheets (no workflow disruption)
- [ ] Players prefer website over Sheets for viewing
- [ ] Positive user feedback

---

## 🚀 Next Steps

1. **Review this plan** - Any adjustments needed?
2. **Get Google Sheets API credentials** (15 min)
3. **Set up Next.js project** (30 min)
4. **Build first feature** (Standings page, 4-6 hours)
5. **Deploy to Vercel** (10 min)
6. **Iterate**

**Ready to start?** Let me know and I'll provide:
- Detailed setup instructions
- Starter code for Next.js project
- Google Sheets API integration code
- First component (Standings page)

---

## 📞 Questions?

**Before starting, clarify:**
- What should the domain be? (e.g., clbleague.com, clbhub.com)
- Any specific design preferences? (colors, logos)
- Which season should be "current" at launch?
- Which archived seasons exist? (need spreadsheet IDs)
- Any specific features you want added/removed?

**Let's build this! 🚀**

# Module-by-Module Migration Analysis
## Web UI vs. Google Sheets Backend

**Context:** League is stable in size (8 teams, ~80 players) but growing in seasons. Main pain point is **UI/UX for viewers** (poor filtering, navigation, mobile experience). Goal is cost-effective solution for hobbyist project.

**Recommended Workflow:**
- ✅ Keep Sheets for data entry and complex calculations (commissioners)
- ✅ Build web UI for viewing, filtering, and public access (players/fans)
- ✅ Use Google Sheets API to read data (no data migration needed)

---

## Priority Framework

**🔥 HIGH PRIORITY (Build First)** - Major UX improvement, high viewer value
**⚠️ MEDIUM PRIORITY (Build Later)** - Nice to have, moderate improvement
**✅ LOW PRIORITY (Keep in Sheets)** - Works fine, low viewer demand

---

## Module Analysis

### 1. **LeagueCore.js** (389 lines)
**Current Purpose:** Menu system, "Update All" orchestration

**Features:**
- Menu creation (`onOpen()`)
- Update All orchestration
- Quick Update (incremental)
- Force refresh, cache management

**User Pain Points:**
- ❌ None - commissioners only, works fine

**Web Migration Benefit:** ❌ **NONE**

**Recommendation:** ✅ **KEEP IN SHEETS**
- Commissioners need this menu system
- No viewer interaction
- Web site won't need orchestration (reads processed data)

**Action:** Keep as-is, no changes needed

---

### 2. **LeagueConfig.js** (274 lines)
**Current Purpose:** Centralized configuration

**Features:**
- Sheet names
- Box score spreadsheet ID
- Column mappings
- Validation thresholds

**Web Migration Benefit:** ⚠️ **MEDIUM** (partially)

**Recommendation:** 🔀 **HYBRID**
- Keep in Sheets for Apps Script
- Create JSON config for website (team names, colors, logos)
- Share basic config between both

**Action for Website:**
```javascript
// config/league.js
export const LEAGUE_CONFIG = {
  leagueId: "CLB",
  name: "CLB League",
  sport: "Baseball",
  sheetsId: "YOUR_SHEET_ID",
  teams: [
    { name: "Team A", color: "#FF0000", logo: "/logos/team-a.png" },
    // ...
  ]
}
```

**Priority:** Build with Phase 1 (basic config only)

---

### 3. **LeagueUtility.js** (857 lines)
**Current Purpose:** Helper functions, logging, validation, cache management

**Features:**
- Error logging
- Cache management
- Game sheet validation
- Helper functions (sorting, filtering)
- League leaders calculation
- Percentile calculations

**User Pain Points:**
- ❌ None - backend utilities

**Web Migration Benefit:** ❌ **NONE** (stay in Sheets)
- But need equivalent functions in website backend

**Recommendation:** ✅ **KEEP IN SHEETS** + build web equivalents
- Sheets utilities stay for Apps Script
- Website needs own utility functions (simpler, since reading processed data)

**Action:** No migration, but create lightweight web utils for sorting/filtering

---

### 4. **LeagueGames.js** (467 lines)
**Current Purpose:** Game processing engine - reads box scores, aggregates stats

**Features:**
- Process all game sheets (single-pass optimization)
- Extract hitting, pitching, fielding data
- Calculate team totals
- Handle W/L/S records

**User Pain Points:**
- ❌ None - backend processing only

**Web Migration Benefit:** 🤔 **INTERESTING OPTION**

**Recommendation:** 🔀 **TWO OPTIONS**

**Option A: Keep Current (Recommended for Phase 1)**
- ✅ Apps Script continues processing games → updates stats sheets
- ✅ Website reads from stats sheets via API
- ✅ No code rewrite needed
- ✅ Commissioners' workflow unchanged

**Option B: Deprecate & Move to Website (Future)**
- Website directly reads box score spreadsheet
- Parse box scores on website backend
- Store in database or cache
- **Benefit:** Eliminates 45-60s "Update All" process
- **Drawback:** Requires rebuilding game parsing logic (~40 hours)

**Priority:**
- Phase 1: Keep Option A
- Phase 2+: Consider Option B if "Update All" becomes painful

**Effort if migrating:** 30-40 hours (medium complexity)

---

### 5. **LeaguePlayerStats.js** (112 lines)
**Current Purpose:** Write player stats to "🧮 Hitting/Pitching/Fielding" sheets

**Features:**
- Update player stat sheets from cached game data
- Write hitting stats (AVG, OBP, SLG, OPS)
- Write pitching stats (ERA, WHIP, BAA)
- Write fielding stats

**User Pain Points:**
- ❌ None - backend only

**Web Migration Benefit:** ❌ **NONE**

**Recommendation:** ✅ **KEEP IN SHEETS**
- These sheets are source of truth for website
- Website reads from these via API
- No need to change

**Action:** No changes needed

---

### 6. **LeagueTeamStats.js** (120 lines)
**Current Purpose:** Write team stats to "Team Data" sheet

**Features:**
- Update team W/L records
- Aggregate team hitting/pitching/fielding

**User Pain Points:**
- ❌ None - backend only

**Web Migration Benefit:** ❌ **NONE**

**Recommendation:** ✅ **KEEP IN SHEETS**
- Website reads from this sheet

**Action:** No changes needed

---

### 7. **LeagueRankings.js** (467 lines)
**Current Purpose:** Update "🏆 Rankings" sheet (league homepage)

**Features:**
- **Standings** with tiebreakers (W%, H2H, run differential)
- **League leaders** (top 5 in batting, pitching, fielding)
- **Recent results** (color-coded)
- **This week's games**

**User Pain Points:**
- ❌❌❌ **MAJOR UX ISSUES**
  - Poor mobile experience
  - Can't filter by stat category
  - Can't search for specific player
  - Can't see historical standings
  - Can't compare across seasons
  - Must scroll through dense sheet

**Web Migration Benefit:** 🔥 **VERY HIGH**

**Recommendation:** 🔥 **MIGRATE TO WEB - HIGH PRIORITY**

**Website Features to Build:**

1. **Standings Page** (`/standings`)
   - Clean table with hover effects
   - Click team name → team page
   - Mobile-responsive
   - Historical standings dropdown (by season)
   - **Effort:** 4-6 hours

2. **League Leaders Page** (`/leaders`)
   - Tabbed interface (Batting | Pitching | Fielding)
   - Filter by stat (AVG, HR, RBI, ERA, etc.)
   - Search by player name
   - Click player → player profile
   - **Effort:** 6-8 hours

3. **Recent Games Widget** (homepage)
   - Latest 10 games
   - Click game → box score
   - **Effort:** 3-4 hours

**Sample UI (Pseudo-code):**
```jsx
// Standings component
<div className="standings-table">
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>W</th>
        <th>L</th>
        <th>Win %</th>
        <th>RS</th>
        <th>RA</th>
        <th>Diff</th>
      </tr>
    </thead>
    <tbody>
      {standings.map(team => (
        <tr key={team.name} className="hover:bg-gray-50">
          <td>{team.rank}</td>
          <td>
            <Link href={`/teams/${team.slug}`}>
              {team.name}
            </Link>
          </td>
          <td>{team.wins}</td>
          {/* ... */}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Data Source:** Read from "🏆 Rankings" sheet via Sheets API

**Priority:** 🔥 **Phase 1 - Build first** (biggest UX improvement)

**Effort:** 15-20 hours total

---

### 8. **LeagueSchedule.js** (482 lines)
**Current Purpose:** Update "📅 Schedule" sheet

**Features:**
- Standings (duplicate of Rankings)
- **Completed games** organized by week
- **Scheduled games** organized by week
- Links to game sheets

**User Pain Points:**
- ❌❌ **MAJOR UX ISSUES**
  - Can't filter by team
  - Can't see just "my team's" schedule
  - Can't see results in calendar view
  - Poor mobile navigation
  - No notifications for upcoming games

**Web Migration Benefit:** 🔥 **VERY HIGH**

**Recommendation:** 🔥 **MIGRATE TO WEB - HIGH PRIORITY**

**Website Features to Build:**

1. **Schedule Page** (`/schedule`)
   - List view with week groupings
   - Filter by team
   - Filter by status (completed/upcoming)
   - Click game → box score page
   - **Effort:** 6-8 hours

2. **Calendar View** (`/schedule/calendar`) (Optional Phase 2)
   - Month/week calendar grid
   - Click date → games that day
   - **Effort:** 8-10 hours

3. **Team Schedule** (`/teams/[team]/schedule`)
   - Just that team's games
   - W/L color coding
   - **Effort:** 2-3 hours (reuse schedule component)

**Sample UI:**
```jsx
<div className="schedule-page">
  {/* Filters */}
  <div className="filters">
    <select onChange={filterByTeam}>
      <option value="">All Teams</option>
      {teams.map(t => <option>{t.name}</option>)}
    </select>
    <select onChange={filterByStatus}>
      <option value="">All Games</option>
      <option value="completed">Completed</option>
      <option value="upcoming">Upcoming</option>
    </select>
  </div>

  {/* Games by week */}
  {gamesByWeek.map(week => (
    <div key={week.name} className="week-section">
      <h3>Week {week.number}</h3>
      {week.games.map(game => (
        <GameCard
          key={game.id}
          homeTeam={game.home}
          awayTeam={game.away}
          homeScore={game.homeScore}
          awayScore={game.awayScore}
          status={game.status}
          link={`/games/${game.id}`}
        />
      ))}
    </div>
  ))}
</div>
```

**Data Source:** Read from "📅 Schedule" sheet or parse from "Season Schedule" sheet

**Priority:** 🔥 **Phase 1 - Build first**

**Effort:** 10-12 hours

---

### 9. **LeagueTeamSheets.js** (593 lines)
**Current Purpose:** Update individual team sheets (one per team)

**Features:**
- **Player stats** for team roster (hitting, pitching, fielding)
- **League standings** (with team highlighted)
- **Team schedule** (color-coded W/L)

**User Pain Points:**
- ❌❌ **MAJOR UX ISSUES**
  - Must navigate to specific sheet
  - Can't compare players across teams
  - No player profiles
  - Poor mobile experience
  - Can't see historical stats

**Web Migration Benefit:** 🔥 **VERY HIGH**

**Recommendation:** 🔥 **MIGRATE TO WEB - HIGH PRIORITY**

**Website Features to Build:**

1. **Team Page** (`/teams/[teamName]`)
   - Team header (name, logo, record)
   - Roster table with sortable columns
   - Click player → player profile
   - Team stats summary
   - Recent games
   - **Effort:** 8-10 hours

2. **Team Comparison** (`/teams/compare`) (Optional Phase 2)
   - Side-by-side team stats
   - **Effort:** 4-6 hours

**Sample Structure:**
```
/teams/team-a
  - Header: Team A (12-4, 1st Place)
  - Tab 1: Roster
    - Sortable table: Player | AVG | HR | RBI | ERA | IP
  - Tab 2: Schedule
    - List of games with results
  - Tab 3: Stats
    - Team totals and averages
```

**Data Source:**
- Read from individual team sheets (e.g., "🧢 Team A")
- OR aggregate from player stats sheets filtered by team

**Priority:** 🔥 **Phase 1 - Build early** (core feature)

**Effort:** 12-15 hours

---

### 10. **PlayerComparison.js** (188 lines)
**Current Purpose:** Backend for player comparison HTML app

**Features:**
- Get player list
- Fetch stats for multiple players (hitting, pitching, fielding)
- Optimized with "Read-Once" pattern

**User Pain Points:**
- ⚠️ Modal dialog not great UX
- Can't bookmark/share comparisons
- Limited to 5 players
- No historical comparison (across seasons)

**Web Migration Benefit:** 🔥 **HIGH**

**Recommendation:** 🔥 **MIGRATE TO WEB - MEDIUM PRIORITY**

**Website Features to Build:**

1. **Player Comparison Page** (`/compare`)
   - Search/select players (autocomplete)
   - Side-by-side stat tables
   - Highlight best values (like current)
   - Shareable URLs (e.g., `/compare?players=PlayerA,PlayerB`)
   - Mobile-responsive
   - **Effort:** 10-12 hours

2. **Enhanced Features** (Phase 2)
   - Compare across seasons
   - Visual charts (bar/radar charts)
   - Export comparison as image
   - **Effort:** 8-10 hours additional

**Sample URL Structure:**
```
/compare?players=Mike+Trout,Shohei+Ohtani
/compare?season=2024&players=PlayerA,PlayerB,PlayerC
```

**Data Source:** Same as current - read from stats sheets

**Priority:** ⚠️ **Phase 1-2** (already have HTML version, enhance it)

**Effort:** 12-15 hours (full rebuild with better UX)

---

### 11. **PlayerComparisonApp.html** (516 lines)
**Current Purpose:** Player comparison UI (Google Apps Script web app)

**User Pain Points:**
- Modal dialog feels clunky
- Not responsive on mobile
- Can't share comparison URL
- Limited styling options

**Web Migration Benefit:** 🔥 **HIGH**

**Recommendation:** 🔥 **REPLACE WITH WEB PAGE**
- Build proper comparison page (see #10 above)
- Better UX, shareable, mobile-friendly

**Priority:** ⚠️ **Phase 1-2**

**Effort:** Included in #10 above

---

### 12-15. **Retention Suite** (RetentionCore.js, RetentionFactors.js, RetentionHelpers.js, RetentionSheet.js, RetentionConfig.js)
**Total:** ~4,000 lines

**Current Purpose:** Complex retention probability calculator

**Features:**
- Calculate 5 retention factors:
  1. Team Success (standing + postseason)
  2. Play Time (games played + usage quality/lineup position)
  3. Performance (percentile rankings + draft expectations)
  4. Chemistry (manual entry)
  5. Team Direction (manual entry)
- Auto-flagging (elite players on bad teams)
- Draft expectations analysis
- Final weighted grade (5-95 scale)

**User Pain Points:**
- ❌ Commissioners only - works fine for data entry
- ⚠️ But viewing results is clunky (dense sheet)
- ⚠️ Can't filter by retention grade
- ⚠️ Can't see trends over time
- ⚠️ No visualizations (scatter plots would be great)

**Web Migration Benefit:** ⚠️ **MEDIUM**

**Recommendation:** 🔀 **HYBRID APPROACH**

**Phase 1: Keep calculation in Sheets**
- ✅ Commissioners enter Chemistry/Direction scores in Sheets
- ✅ Apps Script calculates grades
- ✅ Website reads final grades and displays nicely

**Phase 2: Build viewer UI on website**
- `Retention Grades Page` (`/retention`)
- Table with sorting/filtering
- Color-coded by grade (green/yellow/red)
- Filter: by team, by grade range, by factor
- Click player → detailed breakdown
- **Effort:** 8-10 hours

**Phase 3 (Optional): Visualizations**
- Scatter plot: Performance vs. Play Time (colored by grade)
- Team retention heatmap
- Historical retention trends
- **Effort:** 10-15 hours

**Priority:** ⚠️ **Phase 2** (nice to have, not critical)

**Effort (Phase 2):** 8-10 hours for viewing UI

**Keep in Sheets:** All calculation logic (too complex to rebuild)

---

### 16. **LeagueTransactions.js** (561 lines)
**Current Purpose:** Transaction tracking system

**Features:**
- Record transactions (trades, adds, drops)
- View/edit transaction log
- Detect missing transactions (automated alerts)

**User Pain Points:**
- ❌ Commissioners only - works fine
- ⚠️ But public transaction history would be nice for viewers

**Web Migration Benefit:** ⚠️ **LOW-MEDIUM**

**Recommendation:** 🔀 **HYBRID**

**Phase 1: Keep in Sheets for entry**
- Commissioners use menu to record transactions

**Phase 2: Display on website**
- `/transactions` page
- Timeline view of all transactions
- Filter by type (trade/add/drop)
- Filter by team
- Search by player name
- **Effort:** 4-6 hours

**Sample UI:**
```jsx
<div className="transactions-timeline">
  <div className="transaction-item">
    <div className="date">Nov 9, 2024</div>
    <div className="type-badge">TRADE</div>
    <div className="details">
      Team A trades <PlayerLink>Mike Trout</PlayerLink> to Team B
      for <PlayerLink>Shohei Ohtani</PlayerLink>
    </div>
  </div>
</div>
```

**Priority:** ⚠️ **Phase 2-3** (nice to have)

**Effort:** 4-6 hours

---

### 17. **LeagueArchive.js** (222 lines)
**Current Purpose:** Archive season data

**Features:**
- Archive current season to separate file
- Preserve final standings, stats, etc.

**User Pain Points:**
- ❌❌ **MAJOR UX ISSUES**
  - Archived data buried in separate spreadsheets
  - **No way to browse historical seasons**
  - **Can't compare players across seasons**
  - **No "all-time leaders" view**

**Web Migration Benefit:** 🔥 **VERY HIGH** (for growing seasons)

**Recommendation:** 🔥 **MIGRATE TO WEB - HIGH PRIORITY** (for your use case!)

**This is KEY for you** since league is "growing in terms of seasons"

**Website Features to Build:**

1. **Historical Archives** (`/seasons`)
   - List all seasons
   - Click season → standings/stats for that year
   - **Effort:** 4-6 hours

2. **Season Comparison** (`/seasons/[year]`)
   - View any season's final data
   - Same UI as current season (standings, leaders, etc.)
   - **Effort:** Reuse existing components

3. **All-Time Leaders** (`/all-time`)
   - Career stats across all seasons
   - All-time HR leaders, ERA leaders, etc.
   - **Effort:** 8-10 hours (requires aggregating across sheets)

4. **Player Career Stats** (`/players/[name]`)
   - Season-by-season breakdown
   - Career totals
   - Charts showing progression
   - **Effort:** 12-15 hours

**Data Source:**
- Current season: Read from current sheets
- Past seasons: Read from archived spreadsheets
- Store spreadsheet IDs in config

**Priority:** 🔥 **Phase 1-2** (since this is your main growth vector)

**Effort:** 25-35 hours total (significant but very valuable)

---

## Summary: Migration Priority Matrix

### 🔥 Phase 1: Core Viewing (Build First)
**Goal:** Replace worst UX pain points, provide clean viewing experience

| Module | Feature | Benefit | Effort | Priority |
|--------|---------|---------|--------|----------|
| LeagueRankings | Standings + Leaders | VERY HIGH | 15-20h | 🔥 |
| LeagueSchedule | Schedule with filters | VERY HIGH | 10-12h | 🔥 |
| LeagueTeamSheets | Team pages | VERY HIGH | 12-15h | 🔥 |
| LeagueArchive | Historical seasons | VERY HIGH | 8-10h | 🔥 |

**Total Phase 1 Effort:** 45-57 hours
**Total Cost:** $0-15 (domain only, use free hosting)

**What stays in Sheets:**
- All data entry (games, stats, transactions)
- All calculations (stats processing, retention)
- Commissioner tools (Update All, menus)

**What moves to web:**
- All viewing/browsing
- Filtering, sorting, searching
- Mobile-friendly interface
- Historical data access

---

### ⚠️ Phase 2: Enhanced Features
**Goal:** Add nice-to-have features

| Module | Feature | Benefit | Effort | Priority |
|--------|---------|---------|--------|----------|
| PlayerComparison | Rebuilt comparison | HIGH | 12-15h | ⚠️ |
| RetentionSuite | Retention viewer UI | MEDIUM | 8-10h | ⚠️ |
| LeagueArchive | All-time leaders | HIGH | 12-15h | ⚠️ |
| LeagueArchive | Player career stats | HIGH | 12-15h | ⚠️ |
| LeagueTransactions | Transaction timeline | LOW-MED | 4-6h | ⚠️ |

**Total Phase 2 Effort:** 48-61 hours

---

### ✅ Keep in Sheets Forever
**These work fine, no migration needed:**

- LeagueCore.js (menu system)
- LeagueConfig.js (mostly)
- LeagueUtility.js (backend only)
- LeagueGames.js (game processing)
- LeaguePlayerStats.js (stats updates)
- LeagueTeamStats.js (team updates)
- All retention calculation logic

---

## Recommended Tech Stack (Cost-Effective)

### Option 1: Next.js + Vercel (Recommended)
**Pros:** Modern, fast, free hosting, great DX
**Cost:** $0/month + $12/year (domain)

```bash
# Setup (10 minutes)
npx create-next-app@latest clb-league-hub
cd clb-league-hub
npm install googleapis  # For Google Sheets API
```

**Stack:**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (free, beautiful)
- **Data Fetching:** Google Sheets API v4
- **Hosting:** Vercel (free tier: unlimited sites)
- **Domain:** Namecheap ($12/year for .com)

**Monthly Cost:** $0
**Annual Cost:** $12 (domain only)

---

### Option 2: Astro + Netlify (Alternative)
**Pros:** Even faster (static), simpler if you don't need interactivity
**Cost:** $0/month + $12/year (domain)

**Good for:** Mostly static content (standings, stats, archives)
**Not good for:** Real-time features, complex interactivity

---

## Implementation Roadmap

### Week 1-2: Setup & Basic Infrastructure
**Effort:** 8-10 hours

- [ ] Create Next.js app
- [ ] Set up Google Sheets API credentials
- [ ] Create basic layout (header, nav, footer)
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Deploy to Vercel
- [ ] Connect custom domain

**Deliverable:** Live site with "Coming Soon" page

---

### Week 3-4: Standings & Leaders (Phase 1a)
**Effort:** 15-20 hours

- [ ] `/standings` page
  - Fetch from "🏆 Rankings" sheet
  - Responsive table
  - Click team → team page
- [ ] `/leaders` page
  - Fetch league leaders
  - Tabbed interface (Batting/Pitching/Fielding)
  - Filter by stat
  - Search players

**Deliverable:** Users can view standings and leaders

---

### Week 5-6: Schedule & Teams (Phase 1b)
**Effort:** 22-27 hours

- [ ] `/schedule` page
  - Fetch from "📅 Schedule" sheet
  - Week groupings
  - Filter by team
  - Click game → box score (future)
- [ ] `/teams/[teamName]` page
  - Fetch from team sheets
  - Roster table (sortable)
  - Team stats
  - Team schedule

**Deliverable:** Users can browse schedule and team pages

---

### Week 7-8: Historical Archives (Phase 1c)
**Effort:** 20-25 hours

- [ ] Configure archived season spreadsheet IDs
- [ ] `/seasons` page (list all seasons)
- [ ] `/seasons/[year]` page
  - Fetch from archived spreadsheet
  - Show final standings
  - Show season leaders
  - Reuse existing components
- [ ] Season selector dropdown (header)

**Deliverable:** Users can browse past seasons

---

### Phase 2 (Later): Enhanced Features
**Effort:** 48-61 hours

- [ ] Player comparison tool
- [ ] Retention grades viewer
- [ ] All-time leaders
- [ ] Player career pages
- [ ] Transaction timeline
- [ ] Box score pages
- [ ] Advanced analytics

---

## Sample Code: Reading from Sheets

### Setup Google Sheets API (One-Time)
```javascript
// lib/sheets.js
import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function getSheetData(spreadsheetId, range) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  return response.data.values;
}

export async function getStandings() {
  const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;
  const data = await getSheetData(SHEET_ID, "'🏆 Rankings'!A4:H11");

  return data.map(row => ({
    rank: row[0],
    team: row[1],
    wins: row[2],
    losses: row[3],
    winPct: row[4],
    runsScored: row[5],
    runsAllowed: row[6],
    runDiff: row[7],
  }));
}

export async function getLeagueLeaders() {
  const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;
  // Read from J5:J10 (OBP leaders), K5:K10 (IP leaders), etc.
  const obpData = await getSheetData(SHEET_ID, "'🏆 Rankings'!J5:J10");
  // Parse and return...
}
```

### Display on Page
```jsx
// app/standings/page.js
import { getStandings } from '@/lib/sheets';

export default async function StandingsPage() {
  const standings = await getStandings();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Standings</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">Team</th>
              <th className="p-3 text-center">W</th>
              <th className="p-3 text-center">L</th>
              <th className="p-3 text-center">Win %</th>
              <th className="p-3 text-center">RS</th>
              <th className="p-3 text-center">RA</th>
              <th className="p-3 text-center">Diff</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, idx) => (
              <tr
                key={idx}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">{team.rank}</td>
                <td className="p-3 font-semibold">
                  <a
                    href={`/teams/${team.team.toLowerCase().replace(' ', '-')}`}
                    className="text-blue-600 hover:underline"
                  >
                    {team.team}
                  </a>
                </td>
                <td className="p-3 text-center">{team.wins}</td>
                <td className="p-3 text-center">{team.losses}</td>
                <td className="p-3 text-center">{team.winPct}</td>
                <td className="p-3 text-center">{team.runsScored}</td>
                <td className="p-3 text-center">{team.runsAllowed}</td>
                <td className={`p-3 text-center ${
                  team.runDiff > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {team.runDiff > 0 ? '+' : ''}{team.runDiff}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Cost Breakdown (Hobbyist-Friendly)

### One-Time Costs
| Item | Cost |
|------|------|
| Domain (.com) | $12-15 |
| Development (DIY) | $0 (your time) |
| Design (use templates) | $0 |
| **Total** | **$12-15** |

### Recurring Costs (Annual)
| Item | Cost |
|------|------|
| Domain renewal | $12-15 |
| Hosting (Vercel free tier) | $0 |
| Database | $0 (using Sheets as DB) |
| CDN | $0 (included) |
| SSL | $0 (included) |
| **Total/Year** | **$12-15** |

### Time Investment
| Phase | Hours | Pace |
|-------|-------|------|
| Phase 1 (Core) | 45-57 | 8 weeks @ 6-7 hrs/week |
| Phase 2 (Enhanced) | 48-61 | 8 weeks @ 6-8 hrs/week |
| **Total** | **93-118** | **4 months part-time** |

**If you have 10 hours/week:** 3 months
**If you have 5 hours/week:** 6 months

---

## What You Get

### Phase 1 Complete (2-3 months)
✅ Public website with clean UI
✅ Standings with sorting
✅ League leaders with filtering
✅ Schedule with team filters
✅ Team pages with rosters
✅ Historical season browser
✅ Mobile-friendly
✅ Fast loading
✅ **Shareable URLs** (huge win!)
✅ **All data still in Sheets** (commissioners unchanged)

### Phase 2 Complete (4-6 months)
✅ Everything from Phase 1, plus:
✅ Enhanced player comparison
✅ Retention grades viewer
✅ All-time leaders
✅ Player career stats
✅ Transaction timeline

### What Stays in Sheets
✅ Data entry (box scores, transactions)
✅ All calculations (Update All)
✅ Commissioner tools
✅ Complex logic (retention factors)

---

## Next Steps

1. **Decide on Phase 1 features** - which are must-haves?
2. **Get Google Sheets API credentials** (15 minutes)
3. **Set up Next.js project** (30 minutes)
4. **Build first page (standings)** to validate approach (4-6 hours)
5. **Show to users, get feedback**
6. **Iterate**

**Want me to help you:**
- Set up the Next.js project structure?
- Write the Sheets API integration code?
- Build example components?
- Create a specific page (standings, schedule, etc.)?

Let me know what you'd like to tackle first!

# Phase 2: Data & Navigation Audit Report
**Comets League Baseball Website**

**Audit Date:** November 25, 2025
**Purpose:** Document mock data usage and navigation gaps for Phase 2 implementation
**Status:** Ready for systematic data integration

---

## Executive Summary

**Mock Data:** 14 pages use mock data (needs Google Sheets integration)
**Navigation:** 9 critical pages missing from Header/Sidebar navigation
**Priority:** Fix navigation first, then implement data integration systematically

---

# Part 1: Mock Data Audit

## Pages Using Mock Data

### Core Pages (4 pages)

#### 1. Players List (`/players`)
**File:** `website/app/players/page.tsx`

**Mock Data:**
```typescript
const PLAYERS = [
  { id: 1, name: "Mario", team: "Fireballs", position: "P", avg: ".412", hr: 24, ops: "1.240", stamina: 90 },
  // ... 5 more players
];

const TEAMS = ["All Teams", "Fireballs", "Monsters", "Monarchs", "Eggs", "Muscles"];
const POSITIONS = ["All Positions", "P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];
```

**Data Structure:**
- Player stats (batting averages, home runs, OPS, stamina)
- Team affiliations
- Position data

**Replace With:**
```typescript
import { getAllPlayers } from "@/lib/sheets";

// In component:
const players = await getAllPlayers(false); // false = regular season
const teams = Array.from(new Set(players.map(p => p.team)));
const positions = Array.from(new Set(players.map(p => p.position)));
```

**Reference:** `legacy-site/view-components/PlayersView.tsx`

---

#### 2. Player Detail (`/players/[slug]`)
**File:** `website/app/players/[slug]/page.tsx`

**Mock Data:**
```typescript
const gameLog: GameLogEntry[] = [
  { id: 1, date: "MAY 12", opp: "BOW", ab: 4, h: 2, hr: 1, rbi: 3, pts: 120 },
  { id: 2, date: "MAY 10", opp: "DKW", ab: 3, h: 1, hr: 0, rbi: 0, pts: 45 },
  { id: 3, date: "MAY 08", opp: "PCH", ab: 5, h: 3, hr: 2, rbi: 5, pts: 210 },
];
```

**Data Structure:**
- Game-by-game statistics
- Opponent information
- Performance metrics

**Replace With:**
```typescript
import { getPlayerGameLog, getPlayerBySlug } from "@/lib/sheets";

// In component:
const player = await getPlayerBySlug(slug);
const gameLog = await getPlayerGameLog(player.id, false); // false = regular season
```

**Reference:** `legacy-site/view-components/PlayerProfileView.tsx`

---

#### 3. Teams List (`/teams`)
**File:** `website/app/teams/page.tsx`

**Mock Data:**
```typescript
const TEAMS = [
  { name: "Mario Fireballs", code: "MAR", logoColor: "#FF4D4D", stats: { wins: 12, losses: 2, avg: ".312" }, href: "/teams/mario-fireballs" },
  // ... 7 more teams
];
```

**Data Structure:**
- Team names and codes
- Win/loss records
- Team batting averages
- Team colors

**Replace With:**
```typescript
import { getAllTeams } from "@/lib/sheets";

// In component:
const teams = await getAllTeams();
```

**Reference:** Legacy implementation patterns

---

#### 4. Team Detail (`/teams/[slug]`)
**File:** `website/app/teams/[slug]/page.tsx`

**Mock Data:**
```typescript
const TEAM_DATA = {
  name: "Mario Fireballs",
  code: "MAR",
  logoColor: "#FF4D4D",
  record: "12-2",
  standing: "1st",
  streak: "W5",
  roster: [
    { id: "1", name: "Mario", position: "P", avg: ".412", hr: 24, ops: "1.240" },
    // ... more players
  ],
  schedule: [
    { id: "m1", home: {...}, away: {...}, date: "MAY 12", time: "FINAL", isFinished: true },
    // ... more games
  ]
};
```

**Data Structure:**
- Team metadata
- Roster with player stats
- Schedule/results

**Replace With:**
```typescript
import { getTeamBySlug, getTeamRoster, getTeamSchedule } from "@/lib/sheets";

// In component:
const team = await getTeamBySlug(slug);
const roster = await getTeamRoster(team.id);
const schedule = await getTeamSchedule(team.id);
```

**Reference:** `legacy-site/view-components/TeamPageView.tsx`

---

### Statistical Pages (3 pages)

#### 5. Leaders (`/leaders`)
**File:** `website/app/leaders/page.tsx`

**Mock Data:**
```typescript
const MOCK_LEADERS = {
  batting: {
    avg: [
      { rank: 1, name: "Mario", team: "Fireballs", value: ".487", color: "#FF4D4D" },
      { rank: 2, name: "Luigi", team: "Knights", value: ".456", color: "#2ECC71" },
      { rank: 3, name: "Peach", team: "Monarchs", value: ".445", color: "#FF69B4" },
    ],
    hr: [ /* top 3 home run leaders */ ],
    rbi: [ /* top 3 RBI leaders */ ],
  },
  pitching: {
    era: [ /* top 3 ERA leaders */ ],
    w: [ /* top 3 wins leaders */ ],
    sv: [ /* top 3 saves leaders */ ],
  }
};
```

**Data Structure:**
- Batting leaders (AVG, HR, RBI)
- Pitching leaders (ERA, W, SV)
- Top 3 per category
- Player colors

**Replace With:**
```typescript
import { getCalculatedBattingLeaders, getCalculatedPitchingLeaders } from "@/lib/sheets";

// In component:
const battingLeaders = await getCalculatedBattingLeaders(false);
const pitchingLeaders = await getCalculatedPitchingLeaders(false);
```

**Reference:** `legacy-site/view-components/LeadersView.tsx`

---

#### 6. Standings (`/standings`)
**File:** `website/app/standings/StandingsTable.tsx`

**Mock Data:**
```typescript
const MOCK_STANDINGS: TeamStanding[] = [
  { id: 'fireballs', rank: 1, teamName: 'Mario Fireballs', teamCode: 'MAR', wins: 12, losses: 2, pct: '.857', gb: '-', streak: 'W5', runDiff: 45, logoColor: '#FF4D4D' },
  // ... 5 more teams
];
```

**Data Structure:**
- Team rankings
- Win/loss records
- Win percentage
- Games behind
- Streak information
- Run differential

**Replace With:**
```typescript
import { getStandings } from "@/lib/sheets";

// In component:
const standings = await getStandings(false); // false = regular season
```

**Reference:** Check existing implementation

---

#### 7. Schedule (`/schedule`)
**File:** `website/app/schedule/page.tsx`

**Mock Data:**
```typescript
const MATCHES_BY_WEEK: Record<number, Match[]> = {
  3: [
    {
      id: "w3-1",
      home: { name: "Yoshi Eggs", code: "YOS", logoColor: "#2E86DE", score: 7 },
      away: { name: "Wario Muscles", code: "WAR", logoColor: "#F1C40F", score: 2 },
      date: "MAY 05", time: "FINAL", isFinished: true
    },
    // ... more games
  ],
  4: [ /* week 4 games */ ],
  5: [ /* week 5 games */ ],
};
```

**Data Structure:**
- Weekly game groupings
- Home/away team data
- Scores (for completed games)
- Game status

**Replace With:**
```typescript
import { getSchedule, groupGamesByWeek } from "@/lib/sheets";

// In component:
const schedule = await getSchedule(false); // false = regular season
const matchesByWeek = groupGamesByWeek(schedule);
```

**Reference:** `legacy-site/view-components/ScheduleView.tsx`

---

### Tournament Pages (1 page)

#### 8. Playoffs Bracket (`/playoffs`)
**File:** `website/app/playoffs/page.tsx`

**Mock Data:**
```typescript
const MOCK_BRACKET = {
  semifinals: [
    {
      id: "semi-1",
      name: "Semifinal 1",
      team1: { name: "Mario Fireballs", code: "MAR", color: "#FF4D4D", wins: 3 },
      team2: { name: "Luigi Knights", code: "LUI", color: "#2ECC71", wins: 1 },
      winner: "Mario Fireballs",
      games: [ /* game details */ ]
    },
    // ... semifinal 2
  ],
  finals: {
    id: "finals",
    name: "Championship",
    team1: { name: "Mario Fireballs", code: "MAR", color: "#FF4D4D", wins: 2 },
    team2: { name: "Bowser Monsters", code: "BOW", color: "#F4D03F", wins: 1 },
    winner: null,
    games: [ /* game details */ ]
  }
};
```

**Data Structure:**
- Bracket rounds (semifinals, finals)
- Matchup information
- Win counts per series
- Game details per matchup

**Replace With:**
```typescript
import { getPlayoffSchedule, groupGamesBySeries, buildBracket } from "@/lib/sheets";

// In component:
const playoffGames = await getPlayoffSchedule();
const seriesMap = groupGamesBySeries(playoffGames);
const bracket = buildBracket(seriesMap);
```

**Reference:** `legacy-site/view-components/BracketView.tsx`

---

### Tool Pages (6 pages)

#### 9. Lineup Builder (`/tools/lineup`)
**File:** `website/app/tools/lineup/page.tsx`

**Mock Data:**
```typescript
const AVAILABLE_PLAYERS: Player[] = [
  { id: "1", name: "Mario", team: "Fireballs", teamColor: "#FF4D4D", position: "P/SS", stats: { avg: ".412", power: 85, speed: 75, chemistry: ["Luigi", "Peach"] } },
  // ... 7 more players
];
```

**Data Structure:**
- Player roster with positions
- Player attributes
- Chemistry relationships
- Team colors

**Replace With:**
```typescript
import { getAllPlayers, getPlayerAttributes, getChemistryData } from "@/lib/sheets";

// In component:
const players = await getAllPlayers(false);
const attributes = await getPlayerAttributes();
const chemistry = await getChemistryData();
```

**Reference:** `legacy-site/view-components/LineupBuilderView.tsx`

---

#### 10. Player Compare (`/tools/compare`)
**File:** `website/app/tools/compare/page.tsx`

**Mock Data:**
```typescript
const PLAYER_A = {
  name: "Mario",
  team: "Fireballs",
  color: "#FF4D4D",
  stats: { avg: ".412", hr: 24, ops: "1.240" }
};

const PLAYER_B = {
  name: "Bowser",
  team: "Monsters",
  color: "#F4D03F",
  stats: { avg: ".280", hr: 35, ops: "1.100" }
};
```

**Data Structure:**
- Two player comparison
- Basic stats (avg, hr, ops)
- Team colors

**Replace With:**
```typescript
import { getPlayerByName } from "@/lib/sheets";

// In component (with state for player selection):
const playerA = await getPlayerByName(selectedPlayerA);
const playerB = await getPlayerByName(selectedPlayerB);
```

**Reference:** User selection + data fetch

---

#### 11. Attribute Comparison (`/tools/attributes`)
**File:** `website/app/tools/attributes/page.tsx`

**Mock Data:**
```typescript
const MOCK_PLAYERS = [
  {
    id: "mario",
    name: "Mario",
    team: "Fireballs",
    color: "#FF4D4D",
    attributes: { power: 92, contact: 88, speed: 78, arm: 85, fielding: 80 }
  },
  // ... 7 more players
];
```

**Data Structure:**
- Player attributes (5 categories)
- Player colors
- Team affiliations

**Replace With:**
```typescript
import { getAllPlayerAttributes } from "@/lib/sheets";

// In component:
const players = await getAllPlayerAttributes();
```

**Reference:** `legacy-site/view-components/AttributeComparisonView.tsx`

---

#### 12. Stats Comparison (`/tools/stats`)
**File:** `website/app/tools/stats/page.tsx`

**Mock Data:**
```typescript
const MOCK_PLAYERS = [
  {
    id: "mario",
    name: "Mario",
    team: "Fireballs",
    color: "#FF4D4D",
    batting: { avg: ".412", hr: 24, rbi: 68, sb: 15, ops: "1.240" },
    pitching: { w: 14, era: "2.15", k: 145, sv: 0 },
    fielding: { po: 234, a: 89, e: 3, dp: 12 }
  },
  // ... 7 more players
];
```

**Data Structure:**
- Full player statistics
- Batting, pitching, fielding categories
- Multiple stats per category

**Replace With:**
```typescript
import { getAllPlayers } from "@/lib/sheets";

// In component:
const players = await getAllPlayers(false); // false = regular season
```

**Reference:** `legacy-site/view-components/StatsComparisonView.tsx`

---

#### 13. Chemistry Network (`/tools/chemistry`)
**File:** `website/app/tools/chemistry/page.tsx`

**Mock Data:**
```typescript
const MOCK_CHEMISTRY: ChemistryData = {
  "Mario": { "Luigi": 150, "Peach": 120, "Bowser": -150, "Yoshi": 100 },
  "Luigi": { "Mario": 150, "Daisy": 140, "Waluigi": -120 },
  // ... more relationships
};

const MOCK_PLAYERS = [
  { id: "mario", name: "Mario", team: "Fireballs", color: "#FF4D4D" },
  // ... 7 more players
];
```

**Data Structure:**
- Chemistry relationships (player to player)
- Chemistry values (positive/negative)
- Player roster with colors

**Replace With:**
```typescript
import { getChemistryData, getAllPlayers } from "@/lib/sheets";

// In component:
const chemistryData = await getChemistryData();
const players = await getAllPlayers(false);
```

**Reference:** `legacy-site/view-components/ChemistryToolView.tsx`

---

### Other Pages (1 page)

#### 14. Home Page (`/`)
**File:** `website/app/page.tsx`

**Mock Data:**
- Uses StatHighlight component (likely has mock stats)
- Quick stats section may have hardcoded data

**Data Structure:**
- Featured stats
- Recent highlights
- League summary data

**Replace With:**
- Check what StatHighlight component expects
- May need summary data endpoint
- Recent games/highlights feed

**Reference:** Review component usage

---

## Summary: Mock Data by Type

### Player Data (8 pages)
- Players list
- Player detail
- Lineup builder
- Player compare
- Attribute comparison
- Stats comparison
- Chemistry network
- Home page

### Team Data (3 pages)
- Teams list
- Team detail
- Home page

### Game/Schedule Data (3 pages)
- Schedule
- Playoffs bracket
- Home page

### Statistical Data (3 pages)
- Leaders
- Standings
- Home page

---

# Part 2: Navigation Audit

## Current Navigation Structure

### Header Navigation (4 items)
**File:** `website/components/Header.tsx`

```typescript
const navItems = [
  { name: "Standings", href: "/standings", icon: Trophy },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Stats", href: "/leaders", icon: Users },
  { name: "Lineup.exe", href: "/tools/lineup", icon: Activity },
];
```

**Coverage:** 4 out of 14 pages

---

### Sidebar Navigation (5 items)
**File:** `website/components/Sidebar.tsx`

```typescript
const menuItems = [
  { name: "Standings", href: "/standings", icon: Trophy, color: "text-comets-yellow" },
  { name: "Schedule", href: "/schedule", icon: Calendar, color: "text-comets-red" },
  { name: "Roster Stats", href: "/leaders", icon: Users, color: "text-comets-blue" },
  { name: "Lineup.exe", href: "/tools/lineup", icon: Activity, color: "text-comets-purple" },
  { name: "Head-to-Head", href: "/tools/compare", icon: Swords, color: "text-comets-cyan" },
];
```

**Coverage:** 5 out of 14 pages

---

## Missing Navigation Links

### ❌ Critical Pages Not Accessible

#### Core Pages Missing (2)
1. **Teams List** (`/teams`)
   - Critical navigation hub
   - Links to all team detail pages
   - Currently **NO WAY** to discover teams

2. **Players List** (`/players`)
   - Critical navigation hub
   - Links to all player detail pages
   - Currently **NO WAY** to discover players

#### Tournament Pages Missing (1)
3. **Playoffs Bracket** (`/playoffs`)
   - Major feature page
   - Newly migrated retro design
   - No navigation access

#### Tool Pages Missing (3)
4. **Attribute Comparison** (`/tools/attributes`)
   - Newly migrated feature
   - No navigation access

5. **Stats Comparison** (`/tools/stats`)
   - Newly migrated feature
   - No navigation access

6. **Chemistry Network** (`/tools/chemistry`)
   - Newly migrated feature
   - No navigation access

#### Detail Pages (Expected)
- Player Detail (`/players/[slug]`) - Accessed via Players list
- Team Detail (`/teams/[slug]`) - Accessed via Teams list

---

## Navigation Impact Analysis

### Pages Accessible (6)
✅ Home page (/)
✅ Standings (/standings)
✅ Schedule (/schedule)
✅ Leaders (/leaders)
✅ Lineup Builder (/tools/lineup)
✅ Player Compare (/tools/compare)

### Pages INACCESSIBLE (8)
❌ Teams list (/teams)
❌ Players list (/players)
❌ Playoffs bracket (/playoffs)
❌ Attribute Comparison (/tools/attributes)
❌ Stats Comparison (/tools/stats)
❌ Chemistry Network (/tools/chemistry)
❌ All Team Detail pages (/teams/[slug])
❌ All Player Detail pages (/players/[slug])

**Result:** 57% of pages are inaccessible without direct URL

---

## Recommendations

### Priority 1: Fix Navigation (Immediate)

**Add to Header:**
```typescript
const navItems = [
  { name: "Standings", href: "/standings", icon: Trophy },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Teams", href: "/teams", icon: Users },        // NEW
  { name: "Players", href: "/players", icon: UserCircle }, // NEW
  { name: "Stats", href: "/leaders", icon: BarChart3 },
];
```

**Add to Sidebar:**
```typescript
const menuItems = [
  // Core Pages
  { name: "Standings", href: "/standings", icon: Trophy, color: "text-comets-yellow" },
  { name: "Schedule", href: "/schedule", icon: Calendar, color: "text-comets-red" },
  { name: "Teams", href: "/teams", icon: Users, color: "text-comets-purple" },           // NEW
  { name: "Players", href: "/players", icon: UserCircle, color: "text-comets-cyan" },    // NEW
  { name: "Playoffs", href: "/playoffs", icon: Trophy, color: "text-comets-yellow" },    // NEW

  // Stats & Tools Section
  { name: "League Leaders", href: "/leaders", icon: TrendingUp, color: "text-comets-blue" },

  // Tools Submenu (collapsible)
  { name: "Lineup Builder", href: "/tools/lineup", icon: Activity, color: "text-comets-purple" },
  { name: "Player Compare", href: "/tools/compare", icon: Swords, color: "text-comets-cyan" },
  { name: "Attributes", href: "/tools/attributes", icon: Zap, color: "text-comets-yellow" },     // NEW
  { name: "Stats Compare", href: "/tools/stats", icon: BarChart, color: "text-comets-blue" },    // NEW
  { name: "Chemistry", href: "/tools/chemistry", icon: Network, color: "text-comets-purple" },   // NEW
];
```

**Alternative: Tools Dropdown**
Create a "Tools" dropdown menu with submenu items:
- Lineup Builder
- Player Compare
- Attributes
- Stats Compare
- Chemistry

---

### Priority 2: Data Integration (Systematic)

**Order of Implementation:**

#### Phase 2A: Core Data (Week 1)
1. ✅ Standings (/standings) - Most critical
2. ✅ Schedule (/schedule) - High visibility
3. ✅ Teams list (/teams) - Navigation hub
4. ✅ Players list (/players) - Navigation hub

#### Phase 2B: Detail Pages (Week 2)
5. ✅ Team Detail (/teams/[slug]) - High traffic
6. ✅ Player Detail (/players/[slug]) - High traffic

#### Phase 2C: Statistical Pages (Week 3)
7. ✅ Leaders (/leaders) - Newly migrated
8. ✅ Playoffs (/playoffs) - Newly migrated

#### Phase 2D: Tool Pages (Week 4)
9. ✅ Lineup Builder (/tools/lineup)
10. ✅ Player Compare (/tools/compare)
11. ✅ Attribute Comparison (/tools/attributes)
12. ✅ Stats Comparison (/tools/stats)
13. ✅ Chemistry Network (/tools/chemistry)

#### Phase 2E: Polish (Week 5)
14. ✅ Home Page (/) - Update featured stats

---

## Data Integration Pattern

### Standard Pattern for All Pages

```typescript
// 1. Import Google Sheets functions
import { getDataFunction } from "@/lib/sheets";

// 2. Remove MOCK data constant
// DELETE: const MOCK_DATA = [...];

// 3. Fetch real data in component
export default async function Page() {
  const data = await getDataFunction();

  // 4. Keep all UI/design exactly the same
  return (
    // ... existing retro design JSX
  );
}

// 5. Add loading state
export function Loading() {
  return <RetroLoader />;
}

// 6. Add error handling
if (!data) {
  return <EmptyState message="No data available" />;
}
```

---

## Implementation Checklist

### Navigation Fixes
- [ ] Add Teams link to Header
- [ ] Add Players link to Header
- [ ] Add Teams link to Sidebar
- [ ] Add Players link to Sidebar
- [ ] Add Playoffs link to Sidebar
- [ ] Add Tools section to Sidebar with all tool pages
- [ ] Test navigation on mobile
- [ ] Verify active states work correctly

### Data Integration (by priority)
- [ ] Standings - Replace MOCK_STANDINGS
- [ ] Schedule - Replace MATCHES_BY_WEEK
- [ ] Teams list - Replace TEAMS array
- [ ] Players list - Replace PLAYERS array
- [ ] Team Detail - Replace TEAM_DATA
- [ ] Player Detail - Replace gameLog
- [ ] Leaders - Replace MOCK_LEADERS
- [ ] Playoffs - Replace MOCK_BRACKET
- [ ] Lineup Builder - Replace AVAILABLE_PLAYERS
- [ ] Player Compare - Replace PLAYER_A/B
- [ ] Attribute Comparison - Replace MOCK_PLAYERS
- [ ] Stats Comparison - Replace MOCK_PLAYERS
- [ ] Chemistry Network - Replace MOCK_CHEMISTRY
- [ ] Home Page - Update featured stats

---

## Testing Plan

### Navigation Testing
1. Test all Header links on desktop
2. Test all Sidebar links on desktop
3. Test mobile navigation menu
4. Verify breadcrumb trails
5. Test deep linking (direct URLs)
6. Verify back button behavior

### Data Integration Testing
For each page after integration:
1. ✅ Data loads correctly
2. ✅ Loading state displays
3. ✅ Error handling works
4. ✅ Empty state works
5. ✅ Retro design preserved
6. ✅ Animations still smooth
7. ✅ Build succeeds
8. ✅ No TypeScript errors

---

## Conclusion

**Navigation Status:** ❌ 57% of pages inaccessible - **CRITICAL ISSUE**

**Data Status:** ✅ 14 pages use mock data - Ready for systematic replacement

**Next Steps:**
1. **URGENT:** Fix navigation to make all pages accessible
2. **THEN:** Implement data integration systematically using legacy references

**Timeline:**
- Navigation fixes: 1-2 hours
- Data integration: 4-5 weeks (systematic, page by page)

---

**Report Status:** ✅ Complete
**Pages Audited:** 14/14
**Navigation Items:** 9 (Header + Sidebar)
**Missing Links:** 8 critical pages
**Mock Data Instances:** 14 pages

**Generated:** November 25, 2025
**Priority:** Fix navigation ASAP, then begin Phase 2 data integration

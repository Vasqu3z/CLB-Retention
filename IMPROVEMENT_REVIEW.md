# Comets League Baseball Website - Remaining Improvements

## Executive Summary

The Comets League Baseball website has successfully implemented several key improvements including stat tooltips, keyboard navigation for the Tools dropdown, lazy loading for team emblems, and player profile linking. This document now focuses on the remaining opportunities for improvement across performance optimization, user experience, accessibility, and information architecture.

**Recent Implementations ✅:**
- StatTooltip component with 40+ baseball stat definitions
- Keyboard-accessible Tools dropdown with ARIA attributes
- Lazy loading for team emblem images
- Player name links throughout site (Leaders, Teams pages)
- LiveStatsIndicator component integration

---

## 1. PERFORMANCE OPTIMIZATION

### Current Strengths
- ISR (Incremental Static Regeneration) with 60-second revalidation is appropriate for real-time league data
- Next.js Image component with WebP/AVIF format optimization
- Good use of caching (unstable_cache wrapper for Google Sheets API)
- Memoization in DataTable component for sorted data
- Font optimization with display: 'swap'
- ✅ Team emblems now lazy load in Header

### Remaining Issues

#### 1.1 Bundle Size and Component Rendering
**File:** `/home/user/Comets-League-Baseball/website/app/page.tsx`

**Issue:** The home page loads 12+ card components with individual Tilt and FadeIn animations that trigger on scroll. With Framer Motion animations on many cards, this could cause layout shift.

**Recommendation:**
- Consider code-splitting navigation cards into a separate lazy-loaded component
- Implement React.memo() on navigation cards to prevent re-renders
- Consider using CSS animations instead of Framer Motion for simple fade effects

---

#### 1.3 Data Fetching in LeadersView
**File:** `/home/user/Comets-League-Baseball/website/app/leaders/page.tsx`

**Issue:** Six leaderboard functions (batting, pitching, fielding) are called sequentially on the server. These could run in parallel, and calculating batting/pitching leaders involves filtering all players multiple times.

**Current code (page.tsx):**
```typescript
const [
  initialBattingLeaders,
  initialPitchingLeaders,
  initialFieldingLeaders,
  playoffBattingLeaders,
  playoffPitchingLeaders,
  playoffFieldingLeaders,
] = await Promise.all([
  getCalculatedBattingLeaders(false),
  getCalculatedPitchingLeaders(false),
  getCalculatedFieldingLeaders(false),
  getCalculatedBattingLeaders(true),
  getCalculatedPitchingLeaders(true),
  getCalculatedFieldingLeaders(true),
]);
```

**Recommendation:**
- This is already using Promise.all, which is good
- However, optimize /lib/sheets.ts to cache the getAllPlayers() result within a single server request
- Consider creating a batch function that calculates all leaderboards in one pass through the data

---

#### 1.4 Component Re-renders in PlayersView
**File:** `/home/user/Comets-League-Baseball/website/app/players/PlayersView.tsx` (lines 39-63)

**Issue:** Multiple useMemo hooks filter the same `filteredPlayers` array three times for hitters, pitchers, and fielders. When switching tabs, each filter runs again.

**Recommendation:**
- Combine filtering into a single useMemo that categorizes all players at once:

```typescript
// Current (inefficient):
const hitters = useMemo(() =>
  filteredPlayers.filter(p => p.ab && p.ab > 0),
  [filteredPlayers]
);

const pitchers = useMemo(() =>
  filteredPlayers.filter(p => p.ip && p.ip > 0),
  [filteredPlayers]
);

const fielders = useMemo(() =>
  filteredPlayers.filter(p => (p.np && p.np > 0) || ...),
  [filteredPlayers]
);

// Recommended:
const { hitters, pitchers, fielders } = useMemo(() => {
  const categorized = {
    hitters: [],
    pitchers: [],
    fielders: []
  };

  for (const p of filteredPlayers) {
    if (p.ab && p.ab > 0) categorized.hitters.push(p);
    if (p.ip && p.ip > 0) categorized.pitchers.push(p);
    if ((p.np && p.np > 0) || (p.e && p.e > 0) || (p.sb && p.sb > 0)) {
      categorized.fielders.push(p);
    }
  }
  return categorized;
}, [filteredPlayers]);
```

---

#### 1.5 Large Table Heights
**File:** `/home/user/Comets-League-Baseball/website/components/DataTable.tsx` (line 142)

**Issue:** DataTable uses `max-h-[70vh]` which is fixed height. For users on slower connections, scrolling in a tall viewport could cause performance issues with many rows.

**Recommendation:**
- Implement virtual scrolling for tables with 100+ rows
- Consider using a library like `react-virtual` or `@tanstack/react-virtual`
- Add row virtualization for the players and standings tables

---

### Performance Optimization Summary Table
| Issue | Severity | Impact | Effort |
|-------|----------|--------|--------|
| Multiple array filters | Medium | Reduces memory usage on player pages | Low |
| Virtual scrolling for large tables | Medium | Improves responsiveness with 500+ rows | Medium |
| Home page animation performance | Low | Smoother page interactions | Medium |

---

## 2. UI/UX ENHANCEMENTS

### Current Strengths
- Excellent visual design with consistent color scheme
- Clear navigation structure
- Good use of card-based layouts
- Existing loading and empty states
- Season toggle for regular/playoff data
- Responsive mobile design
- ✅ Comprehensive StatTooltip system with baseball stat definitions
- ✅ Player links on Leaders and Team roster pages

### Remaining Opportunities

#### 2.2 Missing Comprehensive Stats Guide Page

**Issue:** While stat tooltips are now available, a centralized glossary would help users learn all stats at once.

**Recommendations:**

**Add a comprehensive stats guide page** at `/app/stats-guide/page.tsx`:
   - Organized by category (hitting, pitching, fielding)
   - Include calculation formulas (already in tooltips, but show all together)
   - Link from each stats page to relevant sections
   - Add good/bad ranges for each stat
   - Example interpretations

---

#### 2.3 Missing Context Navigation
**Files:**
- `/home/user/Comets-League-Baseball/website/app/standings/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/players/[slug]/PlayerProfileView.tsx`
- `/home/user/Comets-League-Baseball/website/app/teams/[slug]/page.tsx`

**Issue:** When viewing a player or team, there's no quick way to:
- Jump to that player's team roster
- Compare players side-by-side
- See related content (teammates, opponents in upcoming games)

**Recommendations:**

1. **Add "Related Content" section** to player profiles:
```typescript
// In PlayerProfileView.tsx, add after chemistry tab:

<div className="glass-card p-6 mt-6">
  <h3 className="text-lg font-display font-semibold mb-4 text-nebula-orange">
    Related Content
  </h3>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    <Link
      href={`/teams/${teamSlug}`}
      className="p-3 rounded-lg bg-space-blue/30 hover:bg-space-blue/50 transition-all text-center"
    >
      <div className="text-xs text-star-gray">Team Roster</div>
      <div className="font-semibold text-star-white">{team}</div>
    </Link>

    <Link
      href={`/tools/stats?compare=${playerName}`}
      className="p-3 rounded-lg bg-space-blue/30 hover:bg-space-blue/50 transition-all text-center"
    >
      <div className="text-xs text-star-gray">Compare Stats</div>
      <div className="font-semibold text-star-white">vs Others</div>
    </Link>

    <Link
      href="/leaders"
      className="p-3 rounded-lg bg-space-blue/30 hover:bg-space-blue/50 transition-all text-center"
    >
      <div className="text-xs text-star-gray">League Rankings</div>
      <div className="font-semibold text-star-white">Top Players</div>
    </Link>
  </div>
</div>
```

2. **Add quick compare buttons** to players tables:
```typescript
// In PlayersView.tsx, add render function to last column:
{
  key: 'compare',
  label: '',
  align: 'center',
  sortable: false,
  render: (player) => (
    <Link
      href={`/tools/stats?compare=${playerNameToSlug(player.name)}`}
      className="text-xs px-2 py-1 rounded bg-nebula-orange/20 hover:bg-nebula-orange/40 text-nebula-orange transition-all"
    >
      Compare
    </Link>
  ),
}
```

---

#### 2.4 Poor Mobile Data Density
**Files:**
- `/home/user/Comets-League-Baseball/website/components/DataTable.tsx` (lines 140-220)
- `/home/user/Comets-League-Baseball/website/app/standings/StandingsTable.tsx`

**Issue:** On mobile, tables are hard to read with many columns. The "Condense" feature helps, but some columns disappear entirely. Users can't see which columns are hidden.

**Recommendations:**

1. **Improve condensed mode indicator**:
```typescript
// In DataTable.tsx, modify the row count display (line 225-231):

{sortedData.length > 0 && (
  <div className="text-xs text-star-dim font-mono text-right">
    <div className="flex justify-between items-center">
      <span>Showing {sortedData.length} entries</span>
      {isCondensed && enableCondensed && (
        <span className="text-nebula-orange/70 italic">
          {visibleColumns.length} of {columns.length} columns visible
          <button
            onClick={() => setIsCondensed(false)}
            className="ml-2 underline text-nebula-orange hover:text-nebula-orange/80"
          >
            Show all
          </button>
        </span>
      )}
    </div>
  </div>
)}
```

2. **Add card view for mobile** as alternative to tables:
```typescript
// Create CardListView.tsx for mobile display:
// Shows key stats as cards instead of table rows
// Much better UX than scrollable tables on small screens
```

---

#### 2.5 No Sorting/Filtering on many pages
**Files:**
- `/home/user/Comets-League-Baseball/website/app/schedule/ScheduleView.tsx`
- `/home/user/Comets-League-Baseball/website/app/teams/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/playoffs/BracketView.tsx`

**Issue:** Users can't filter schedule by team or sort by date/result. Teams page doesn't have search.

**Recommendations:**

1. **Add team filter to Schedule**:
```typescript
// In ScheduleView.tsx:
const [selectedTeamFilter, setSelectedTeamFilter] = useState<string | null>(null);

const filteredGames = useMemo(() => {
  if (!selectedTeamFilter) return schedule;
  return schedule.filter(game =>
    game.homeTeam === selectedTeamFilter ||
    game.awayTeam === selectedTeamFilter
  );
}, [schedule, selectedTeamFilter]);

// Add filter UI before the schedule
<div className="glass-card p-4 mb-6">
  <label className="block text-sm text-star-gray mb-2">Filter by Team:</label>
  <select
    value={selectedTeamFilter || ''}
    onChange={(e) => setSelectedTeamFilter(e.target.value || null)}
    className="w-full p-2 bg-space-blue/30 border border-cosmic-border rounded text-star-white"
  >
    <option value="">All Teams</option>
    {teams.map(team => (
      <option key={team.name} value={team.name}>{team.name}</option>
    ))}
  </select>
</div>
```

2. **Add search to Teams page**:
```typescript
// Similar to players search in PlayersView.tsx
```

---

#### 2.6 Lack of Feedback for User Actions
**Files:**
- `/home/user/Comets-League-Baseball/website/app/tools/lineup/LineupBuilderView.tsx` (lines 43-50, 70-72)
- `/home/user/Comets-League-Baseball/website/app/tools/stats/StatsComparisonView.tsx`

**Issue:** When users save lineups, clear selections, or add players to comparisons, there's minimal feedback.

**Recommendations:**

1. **Enhance status messages** in LineupBuilder:
```typescript
// Already has setStatusMessage, but enhance styling:
{statusMessage && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg font-display font-semibold ${
      statusMessage.type === 'success'
        ? 'bg-nebula-teal/20 border border-nebula-teal text-nebula-teal'
        : 'bg-nebula-coral/20 border border-nebula-coral text-nebula-coral'
    }`}
  >
    {statusMessage.message}
  </motion.div>
)}
```

2. **Add visual feedback for drag operations**:
   - Highlight drop zones during drag
   - Show ghost image of dragged player
   - Highlight chemistry connections in real-time

---

### UI/UX Enhancements Summary Table
| Issue | Severity | Impact | Effort |
|-------|----------|--------|--------|
| Missing comprehensive stats guide page | Medium | Helpful for learning all stats | Medium |
| No contextual navigation | Medium | Limits discoverability | Medium |
| Poor mobile table UX | Medium | Bad experience on phones | High |
| No schedule/team filtering | Low | Convenience feature | Low |
| Weak action feedback | Low | Polish improvement | Low |

---

## 3. ACCESSIBILITY FOR BASEBALL NOVICES

### Current State
- Good visual design and navigation
- ✅ StatTooltip system explains abbreviations throughout site
- Some abbreviations defined in legends

### Remaining Gaps

#### 3.1 No Comprehensive Baseball Glossary Page
**Files:**
- Site-wide need for centralized glossary

**Issue:** While stat tooltips are helpful in context, users can't browse all definitions in one place to learn before using the site.

**Recommendations:**

1. **Create comprehensive Glossary page** at `/app/glossary/page.tsx`:

```typescript
// Structure:
// - Batting Stats (AB, H, HR, RBI, AVG, OBP, SLG, OPS, etc.)
// - Pitching Stats (IP, W, L, SV, ERA, WHIP, BAA, etc.)
// - Fielding Stats (NP, E, SB, CS, OAA, etc.)
// - League-specific Stats (DP, ROB, etc.)
//
// Each entry should include:
// - Full name
// - Calculation formula
// - What it measures
// - Good/bad ranges
// - Example interpretation

export const glossaryEntries = [
  {
    abbr: "AVG",
    name: "Batting Average",
    category: "hitting",
    description: "How often a batter gets a hit",
    formula: "Hits ÷ At-Bats",
    interpretation: ".300 or higher = excellent, .250 = average, .200 = poor",
    example: "A .300 average means 1 hit per 3 at-bats"
  },
  {
    abbr: "ERA",
    name: "Earned Run Average",
    category: "pitching",
    description: "Average runs allowed per 9 innings pitched",
    formula: "(Runs Allowed × 9) ÷ Innings Pitched",
    interpretation: "3.00 or lower = good, 4.00 = average, 5.00+ = poor",
    example: "A 3.00 ERA means 3 runs allowed per 9 innings"
  },
  // ... more entries
];
```

2. **Add "Baseball 101" tutorial**:
   - Quick video/interactive guide on baseball basics
   - Link prominently from home page and navigation
   - Cover: positions, scoring, basic stats

3. **Explain league-specific stats**:
   - ROB (Hits Robbed - defensive stat)
   - DP (Double Plays Hit Into)
   - OAA (Outs Above Average)
   - NP (Nice Plays)

---

#### 3.2 No Context for League Rules and Format
**Files:**
- All pages assume users understand league structure

**Issue:** Users don't know:
- Are playoffs best-of-3, best-of-5, or best-of-7?
- How many teams are in the league?
- What are qualification thresholds for leaderboards?
- How is chemistry measured?

**Recommendations:**

1. **Create "League Info" page** at `/app/league-info/page.tsx`:
```typescript
// Include:
// - League structure (8 teams, regular season format)
// - Playoff structure (bracket visualization)
// - Season timeline
// - Notable rules (tie-breaker rules, qualification thresholds)
// - How stats are calculated (custom stats like ROB, NP, OAA)
```

2. **Add info icons throughout**:
```typescript
// New component: /components/InfoIcon.tsx
interface InfoIconProps {
  tooltip: string;
}

export function InfoIcon({ tooltip }: InfoIconProps) {
  return (
    <div className="group relative inline-block ml-1">
      <Info className="w-4 h-4 text-star-gray/50 hover:text-star-gray cursor-help" />
      <div className="invisible group-hover:visible absolute z-10 w-48 bg-space-navy border border-nebula-orange rounded p-2 text-xs text-star-gray bottom-full mb-1">
        {tooltip}
      </div>
    </div>
  );
}

// Usage:
<h3>Qualification Thresholds <InfoIcon tooltip="..." /></h3>
```

---

#### 3.3 No Player Type/Role Guidance
**File:** `/home/user/Comets-League-Baseball/website/app/players/[slug]/PlayerProfileView.tsx`

**Issue:** Player attributes show "Class: Power" but don't explain what that means or how it affects gameplay.

**Recommendations:**

1. **Add class descriptions**:
```typescript
// In PlayerProfileView.tsx, after attributes display:

const classDescriptions = {
  'Power': 'Excels at hitting home runs, strong at-bat power',
  'Technique': 'Versatile player with balanced hitting and fielding',
  'Balanced': 'Well-rounded player with no major weaknesses',
  'Speed': 'Fast runner, good at stealing bases and defense'
};

<div className="bg-space-blue/20 p-3 rounded text-sm text-star-gray border border-cosmic-border/30">
  {classDescriptions[attributes.characterClass]}
</div>
```

2. **Add "How to Use This Info" guide**:
   - Explain class/attribute advantages
   - Link to lineup builder tool with suggestions
   - Show how attributes affect in-game performance

---

#### 3.4 Chemistry System Not Explained
**Files:**
- `/home/user/Comets-League-Baseball/website/app/tools/chemistry/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/tools/lineup/page.tsx`

**Issue:** Chemistry values are shown (-200 to +200) but users don't understand impact or how to interpret them.

**Recommendations:**

1. **Add chemistry guide**:
```typescript
// On Chemistry Tool page, add explanation:

<div className="glass-card p-6 mb-6">
  <h2 className="text-xl font-display font-semibold mb-4">Understanding Chemistry</h2>

  <div className="space-y-4 text-sm text-star-gray">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full bg-nebula-teal/50"></div>
        <span className="font-semibold text-star-white">Positive Chemistry</span>
      </div>
      <p>Players have positive chemistry when they complement each other's playing styles. +100 or higher indicates strong synergy.</p>
    </div>

    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full bg-nebula-coral/50"></div>
        <span className="font-semibold text-star-white">Negative Chemistry</span>
      </div>
      <p>Players have negative chemistry when their styles clash. -100 or lower indicates they don't work well together.</p>
    </div>
  </div>
</div>
```

2. **Show chemistry impact**:
   - Total chemistry score for lineup
   - Visual strength indicator
   - Recommendations for improvement

---

#### 3.5 Missing Onboarding/Tutorial
**File:** `/home/user/Comets-League-Baseball/website/app/page.tsx`

**Issue:** First-time users are dropped into standings/leaders without context.

**Recommendations:**

1. **Add quick start guide** to home page:
```typescript
// Add after hero section in page.tsx:

<section className="bg-nebula-orange/5 border border-nebula-orange/30 rounded-xl p-6 mb-12">
  <h2 className="text-2xl font-display font-bold mb-4">First Time Here?</h2>
  <div className="grid md:grid-cols-3 gap-4 text-sm">
    <div className="space-y-2">
      <div className="font-semibold text-nebula-orange">1. Learn the Basics</div>
      <p className="text-star-gray">Check out our <Link href="/glossary" className="text-nebula-cyan hover:underline">Baseball Glossary</Link> to understand stats and abbreviations.</p>
    </div>
    <div className="space-y-2">
      <div className="font-semibold text-nebula-orange">2. Explore Teams</div>
      <p className="text-star-gray">Visit the <Link href="/teams" className="text-nebula-cyan hover:underline">Teams page</Link> to see rosters and individual player stats.</p>
    </div>
    <div className="space-y-2">
      <div className="font-semibold text-nebula-orange">3. Try Tools</div>
      <p className="text-star-gray">Use our <Link href="/tools" className="text-nebula-cyan hover:underline">advanced tools</Link> to compare players and build lineups.</p>
    </div>
  </div>
</section>
```

2. **Add contextual tips throughout**:
   - Tooltip on first visit to explain each page
   - Option to dismiss tips after first view
   - "?" icons with explanations on complex features

---

### Accessibility for Novices Summary Table
| Issue | Severity | Impact | Effort |
|-------|----------|--------|--------|
| No baseball glossary page | High | Would centralize all stat info | Medium |
| League rules/format unexplained | High | Users don't understand context | Medium |
| Chemistry system unclear | High | Tools are confusing | Low |
| Player class not explained | Medium | Attribute info is useless | Low |
| No onboarding | Medium | Poor first-time UX | Medium |
| League-specific stats undocumented | Medium | Custom stats are mysterious | Low |

---

## 4. TECHNICAL ACCESSIBILITY

### Current Strengths
- Skip to main content link (Header.tsx, line 37-42)
- ARIA labels on buttons and navigation
- Semantic HTML (main role, role="navigation")
- Focus ring support on interactive elements
- Good color contrast in most places
- Responsive design works well
- ✅ Tools dropdown now keyboard accessible with Enter/Space/Escape
- ✅ Click-outside handling and proper ARIA attributes

### Remaining Improvements

#### 4.1 Missing ARIA Labels on Key Elements
**Files:**
- `/home/user/Comets-League-Baseball/website/app/standings/StandingsTable.tsx` (Table headers)
- `/home/user/Comets-League-Baseball/website/app/leaders/LeadersView.tsx` (Card layouts)
- `/home/user/Comets-League-Baseball/website/components/DataTable.tsx` (Sortable columns)

**Issue:** Some interactive elements lack proper ARIA labels, making them unclear to screen reader users.

**Recommendations:**

1. **Improve DataTable accessibility**:
```typescript
// In DataTable.tsx, enhance header cells (lines 148-172):

<th
  key={column.key}
  className={...}
  onClick={() => column.sortable !== false && handleSort(column.key)}
  role={column.sortable !== false ? 'button' : undefined}
  tabIndex={column.sortable !== false ? 0 : undefined}
  aria-sort={
    column.sortable !== false && sortKey === column.key
      ? sortDirection === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none' // Add 'none' when not sorted
  }
  aria-label={
    column.sortable !== false
      ? `${column.label}, sortable column. Click to sort by ${column.label}`
      : column.label
  }
>
```

2. **Add ARIA live regions** for dynamic content:
```typescript
// In standings page when data updates:
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
  role="status"
>
  Standings updated. {standings.length} teams currently ranked.
</div>
```

3. **Label filter controls**:
```typescript
// In team filter component:
<div className="mb-4">
  <label
    htmlFor="team-filter"
    className="block text-sm font-semibold text-star-gray mb-2"
  >
    Filter by Team:
  </label>
  <select
    id="team-filter"
    value={selectedTeamFilter || ''}
    onChange={(e) => setSelectedTeamFilter(e.target.value || null)}
    aria-label="Filter schedule by team"
    className="w-full p-2 bg-space-blue/30 border border-cosmic-border rounded"
  >
    <option value="">All Teams</option>
    {teams.map(team => (
      <option key={team.name} value={team.name}>{team.name}</option>
    ))}
  </select>
</div>
```

---

#### 4.2 Remaining Keyboard Navigation Gaps
**Files:**
- `/home/user/Comets-League-Baseball/website/app/tools/lineup/LineupBuilderView.tsx` (Drag & drop)
- `/home/user/Comets-League-Baseball/website/app/schedule/ScheduleView.tsx` (Game cards)

**Issue:**
- Drag & drop operations are not keyboard accessible
- Game cards aren't properly keyboard navigable

**Recommendations:**

1. **Make lineup builder keyboard accessible**:
```typescript
// In LineupBuilderView.tsx, add keyboard handlers:

const handlePositionKeyDown = (e: React.KeyboardEvent, position: number) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setSelectingPosition(position);
    setIsPlayerSelectOpen(true);
  }
};

<button
  onClick={() => {
    setSelectingPosition(position);
    setIsPlayerSelectOpen(true);
  }}
  onKeyDown={(e) => handlePositionKeyDown(e, position)}
  aria-label={`Add player to ${position.name} position`}
  className="..."
>
  {lineup[position.id] || `+ ${position.label}`}
</button>
```

2. **Make schedule cards keyboard accessible**:
```typescript
// In ScheduleView.tsx, game cards should be buttons or links:
{game.boxScoreUrl ? (
  <Link
    href={game.boxScoreUrl}
    className="block rounded-lg p-4 hover:bg-space-blue/30 focus:outline-none focus:ring-2 focus:ring-nebula-orange"
    aria-label={`Game: ${game.awayTeam} vs ${game.homeTeam}, Score: ${game.awayScore}-${game.homeScore}`}
  >
    {/* Game content */}
  </Link>
) : (
  <div className="rounded-lg p-4">
    {/* Game content */}
  </div>
)}
```

---

#### 4.3 Color Contrast Issues
**Files:**
- Various components use `text-star-gray` on dark backgrounds

**Issue:** Some color combinations may not meet WCAG AA standards (4.5:1 for text, 3:1 for graphics).

**Recommendations:**

1. **Test color contrast** with a tool like WebAIM Contrast Checker
2. **Update CSS variables** in globals.css if needed to ensure:
   - `star-gray` on `space-navy` meets 4.5:1 ratio
   - Accent colors on backgrounds meet 3:1 ratio for UI components

3. **Add contrast checking to CI/CD**:
```bash
# Use axe-core or pa11y in testing pipeline
npm install --save-dev @axe-core/cli
```

---

#### 4.4 Mobile Responsiveness Issues
**Files:**
- `/home/user/Comets-League-Baseball/website/components/DataTable.tsx`
- `/home/user/Comets-League-Baseball/website/app/playoffs/BracketView.tsx`

**Issue:** Tables and bracket views don't scale well on very small screens (<320px)

**Recommendations:**

1. **Improve DataTable responsive behavior**:
   - Stack table as card view on mobile (instead of horizontal scroll)
   - Make sure key stats are visible on small screens
   - Test on iPhone SE (375px), older Android phones

2. **Add viewport meta tag** (likely already there):
```html
<!-- In app/layout.tsx -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
```

3. **Test with actual assistive technology**:
   - NVDA (Windows screen reader)
   - JAWS (Windows screen reader)
   - VoiceOver (macOS/iOS)

---

#### 4.5 Missing Heading Hierarchy
**Files:**
- `/home/user/Comets-League-Baseball/website/app/standings/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/players/PlayersView.tsx`
- Multiple DataTable usages

**Issue:** Headings don't always follow proper h1 → h2 → h3 hierarchy. Some pages jump from h1 to h3.

**Recommendations:**

1. **Establish heading hierarchy**:
```typescript
// Example - Standings page should be:
<h1>League Standings</h1>           {/* Page title */}
  <h2>League Stats</h2>            {/* Section */}
    <h3>League Leader</h3>         {/* Stat card title */}
  <h2>Standings Table</h2>         {/* Next major section */}
  <h2>Legend</h2>                  {/* Final section */}
```

2. **Use semantic HTML**:
```typescript
<section>
  <h2>Hitting Leaders</h2>
  <div className="grid ...">
    {/* Cards with h3 */}
    <article>
      <h3>Batting Average</h3>
      {/* Content */}
    </article>
  </div>
</section>
```

---

### Technical Accessibility Summary Table
| Issue | Severity | Impact | Effort |
|-------|----------|--------|--------|
| Missing ARIA labels | Medium | Confusion for screen readers | Low |
| Keyboard navigation gaps (Lineup Builder) | High | Can't use lineup builder | Medium |
| Color contrast unknown | Medium | May fail WCAG AA | Low |
| Heading hierarchy issues | Low | Navigation difficulty | Low |
| Drag & drop not keyboard accessible | High | Can't use lineup builder | Medium |

---

## 5. INFORMATION ARCHITECTURE

### Current Strengths
- Clear top-level navigation (6 main sections + 4 tools)
- Good use of nested URLs (/teams/[slug], /players/[slug])
- Consistent information grouping
- Related data is co-located (standings with stat cards)

### Issues and Opportunities

#### 5.1 Weak Cross-Page Navigation
**Files:**
- `/home/user/Comets-League-Baseball/website/app/standings/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/teams/[slug]/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/players/[slug]/page.tsx`

**Issue:** Users viewing standings can't easily navigate to:
- Individual team pages
- Team rosters
- Player comparison tools

**Recommendations:**

1. **Add breadcrumb navigation**:
```typescript
// New component: /components/Breadcrumb.tsx
interface BreadcrumbProps {
  items: Array<{ label: string; href: string }>
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm">
      <ol className="flex items-center gap-2 text-star-gray">
        {items.map((item, idx) => (
          <li key={item.href} className="flex items-center gap-2">
            {idx > 0 && <span className="text-star-dim">/</span>}
            {idx === items.length - 1 ? (
              <span className="text-star-white font-semibold">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-nebula-cyan transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Usage in team page:
<Breadcrumb items={[
  { label: 'Home', href: '/' },
  { label: 'Teams', href: '/teams' },
  { label: team.name, href: `/teams/${team.slug}` }
]} />
```

2. **Add "back to" navigation in detail pages**:
```typescript
// In PlayerProfileView.tsx:
<Link
  href={`/teams/${teamSlug}`}
  className="flex items-center gap-2 text-nebula-cyan hover:text-nebula-teal mb-4"
>
  <ChevronLeft className="w-4 h-4" />
  Back to {team} roster
</Link>
```

---

#### 5.2 Isolated Tool Pages
**Files:**
- `/home/user/Comets-League-Baseball/website/app/tools/stats/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/tools/attributes/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/tools/chemistry/page.tsx`
- `/home/user/Comets-League-Baseball/website/app/tools/lineup/page.tsx`

**Issue:** Tools are isolated. Users don't understand:
- When to use each tool
- How tools relate to each other
- Recommended workflows

**Recommendations:**

1. **Create Tools Hub** at `/app/tools/page.tsx`:
```typescript
// Show all 4 tools with clear descriptions and recommended use cases:

const tools = [
  {
    name: 'Attribute Comparison',
    href: '/tools/attributes',
    icon: BarChart3,
    description: 'Compare character attributes (speed, power, technique) between players',
    useCases: ['Evaluating player fit for lineup positions', 'Identifying complementary players'],
    relatedTools: ['stats', 'lineup']
  },
  {
    name: 'Stats Comparison',
    href: '/tools/stats',
    icon: TrendingUp,
    description: 'Compare hitting, pitching, and fielding statistics',
    useCases: ['Evaluating player performance', 'Finding top performers in specific stats'],
    relatedTools: ['attributes', 'chemistry']
  },
  {
    name: 'Chemistry Tool',
    href: '/tools/chemistry',
    icon: Sparkles,
    description: 'Analyze chemistry between players',
    useCases: ['Finding compatible players', 'Identifying problem pairings'],
    relatedTools: ['lineup']
  },
  {
    name: 'Lineup Builder',
    href: '/tools/lineup',
    icon: Target,
    description: 'Build 9-player lineups and analyze team chemistry',
    useCases: ['Building optimal lineups', 'Testing chemistry combinations'],
    relatedTools: ['chemistry', 'stats']
  }
];
```

2. **Add "similar pages" section** at bottom of each tools page:
```typescript
// At the end of each tool view:
<div className="mt-12 pt-6 border-t border-cosmic-border">
  <h3 className="text-lg font-display font-semibold mb-4">Related Tools</h3>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {relatedTools.map(tool => (
      <Link
        key={tool.href}
        href={tool.href}
        className="p-3 rounded-lg bg-space-blue/20 hover:bg-space-blue/40 transition-all text-center"
      >
        <Icon className="w-6 h-6 mx-auto mb-2 text-nebula-orange" />
        <div className="text-sm font-semibold text-star-white">{tool.name}</div>
      </Link>
    ))}
  </div>
</div>
```

---

#### 5.3 No Clear User Workflows
**Files:** Multiple pages

**Issue:** Different user types have different needs:
- **League Managers**: Need to track team performance, manage lineups
- **Casual Fans**: Want to see standings, leaders, schedule
- **Advanced Analysts**: Want detailed stats, attribute analysis, chemistry

But the site doesn't acknowledge these different workflows.

**Recommendations:**

1. **Add contextual "Start Here" guides**:
   - On home page: "I want to..." buttons for different user types
   - Link to relevant tools and pages
   - Example: "I'm a league manager" → Standings, Teams, Lineup Builder, Schedule

2. **Create user journey documentation**:
```typescript
// In /public/docs/workflows.md or similar:

## For Casual Fans
1. Check League Standings (/standings)
2. Browse Leaders (/leaders)
3. View upcoming Schedule (/schedule)
4. Click on teams or players for details

## For League Managers
1. Review Team Stats (/teams)
2. Check Player Stats (/players)
3. Use Lineup Builder (/tools/lineup)
4. Analyze Chemistry (/tools/chemistry)
5. Compare Players (/tools/stats)

## For Advanced Analysts
1. View Player Attributes (/tools/attributes)
2. Compare attributes and stats
3. Test chemistry combinations
4. Build optimal lineups
5. Track performance over time
```

3. **Add quick links on home page**:
```typescript
// In page.tsx, add section below navigation cards:
<section className="py-8">
  <h2 className="text-2xl font-display font-bold mb-6">
    How to Use Comets League Baseball
  </h2>

  <div className="grid md:grid-cols-3 gap-6">
    <Link href="/getting-started" className="glass-card p-6 hover:scale-[1.02] transition-all">
      <Users className="w-8 h-8 text-nebula-cyan mb-3" />
      <h3 className="font-semibold mb-2">I'm New to This</h3>
      <p className="text-sm text-star-gray">Learn baseball stats and league structure</p>
    </Link>

    <Link href="/workflows" className="glass-card p-6 hover:scale-[1.02] transition-all">
      <BookOpen className="w-8 h-8 text-nebula-orange mb-3" />
      <h3 className="font-semibold mb-2">Recommended Paths</h3>
      <p className="text-sm text-star-gray">Based on your interests and goals</p>
    </Link>

    <Link href="/tools" className="glass-card p-6 hover:scale-[1.02] transition-all">
      <Zap className="w-8 h-8 text-solar-gold mb-3" />
      <h3 className="font-semibold mb-2">Advanced Tools</h3>
      <p className="text-sm text-star-gray">Compare players, build lineups, analyze chemistry</p>
    </Link>
  </div>
</section>
```

---

#### 5.4 Missing Global Search
**Files:** Multiple pages

**Issue:** No way to search for players or teams globally. Users must navigate to specific pages.

**Recommendations:**

1. **Add global search/command palette**:
```typescript
// New component: /components/CommandPalette.tsx
// Cmd+K opens a search dialog that searches:
// - Players (by name)
// - Teams (by name)
// - Stats/Leaders (by keyword)
// - Pages (by name)

// Usage in layout:
<CommandPalette teams={teams} players={players} />

// Keybindings:
// Cmd+K / Ctrl+K to open
// Type to search
// Arrow keys to navigate
// Enter to select
```

2. **Quick team search in header**:
```typescript
// Or simpler: Add dropdown in header with team/player quick access
<div className="hidden lg:block ml-auto">
  <input
    type="text"
    placeholder="Search players..."
    onFocus={() => setShowSearchDropdown(true)}
    onChange={(e) => handleSearch(e.target.value)}
    className="w-48 px-4 py-2 rounded-lg bg-space-blue/30 border border-cosmic-border text-star-white placeholder-star-gray/50"
  />
  {showSearchDropdown && <SearchDropdown results={searchResults} />}
</div>
```

---

#### 5.5 Unclear Sitemap/Information Structure
**Files:** No sitemap component

**Issue:** Users don't see the overall structure of the site. New users might not know all available pages.

**Recommendations:**

1. **Create Sitemap page** at `/app/sitemap/page.tsx`:
```typescript
// Show all pages organized by section:

export default function SitemapPage() {
  return (
    <div className="space-y-8">
      <h1>Site Map</h1>

      <section>
        <h2>Core League Data</h2>
        <ul className="space-y-2 ml-4">
          <li><Link href="/standings">Standings</Link> - Current team rankings</li>
          <li><Link href="/schedule">Schedule</Link> - Games and results</li>
          <li><Link href="/leaders">Leaders</Link> - Top performers by stat</li>
          <li><Link href="/teams">Teams</Link> - Team rosters and stats</li>
          <li><Link href="/players">Players</Link> - Individual player stats</li>
          <li><Link href="/playoffs">Playoffs</Link> - Playoff bracket</li>
        </ul>
      </section>

      <section>
        <h2>Advanced Tools</h2>
        <ul className="space-y-2 ml-4">
          <li><Link href="/tools/stats">Stats Comparison</Link> - Compare player stats</li>
          <li><Link href="/tools/attributes">Attribute Comparison</Link> - Compare attributes</li>
          <li><Link href="/tools/chemistry">Chemistry Tool</Link> - Analyze chemistry</li>
          <li><Link href="/tools/lineup">Lineup Builder</Link> - Build lineups</li>
        </ul>
      </section>

      <section>
        <h2>Resources</h2>
        <ul className="space-y-2 ml-4">
          <li><Link href="/glossary">Baseball Glossary</Link> - Stat definitions</li>
          <li><Link href="/league-info">League Info</Link> - Rules and structure</li>
          <li><Link href="/help">Help & Tutorials</Link> - Getting started</li>
        </ul>
      </section>
    </div>
  );
}
```

2. **Add XML sitemap** for SEO:
```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://cometsleague.baseball/</loc></url>
  <url><loc>https://cometsleague.baseball/standings</loc></url>
  <url><loc>https://cometsleague.baseball/schedule</loc></url>
  <!-- ... more URLs ... -->
</urlset>
```

---

### Information Architecture Summary Table
| Issue | Severity | Impact | Effort |
|-------|----------|--------|--------|
| No breadcrumb navigation | Medium | Hard to understand location in site | Low |
| Isolated tool pages | Medium | Users don't know how to use tools | Medium |
| No clear workflows | Medium | Confuses new users | Medium |
| No global search | Low | Convenience feature | High |
| No sitemap page | Low | Polish/SEO improvement | Low |
| Weak internal linking | Medium | Limits discoverability | Low |

---

## IMPLEMENTATION PRIORITY MATRIX

### Critical (Do First)
1. ✅ ~~Add stat tooltips~~ (COMPLETED - StatTooltip component integrated)
2. ✅ ~~Fix keyboard navigation in Tools dropdown~~ (COMPLETED - Now accessible)
3. Make lineup builder keyboard accessible (Accessibility blocker)
4. Add league info / rules documentation (Sets context)
5. Create stats glossary page (Centralize all stat info for learning)

### High Priority (Do Soon)
1. Add ARIA labels to DataTable columns
2. Implement breadcrumb navigation
3. Create tools hub page with workflows
4. Optimize array filtering in PlayersView
5. Add "related content" sections to detail pages

### Medium Priority (Do Eventually)
1. Add team filter to schedule
2. Implement virtual scrolling for large tables
3. Add search/filter to teams page
4. Improve mobile table UX
5. Add chemistry guide/explanation

### Low Priority (Nice to Have)
1. Global command palette search
2. Add sitemap page
3. Card view alternative to tables on mobile
4. Status message styling improvements

---

## NEW PAGES TO CREATE

1. `/app/glossary/page.tsx` - Baseball stats glossary (centralize StatTooltip definitions)
2. `/app/league-info/page.tsx` - League rules and structure
3. `/app/tools/page.tsx` - Tools hub with descriptions
4. `/app/getting-started/page.tsx` - Onboarding guide
5. `/app/sitemap/page.tsx` - Site structure overview

---

## COMPONENT IMPROVEMENTS

1. ✅ ~~Create `/components/StatTooltip.tsx`~~ (COMPLETED - Comprehensive with 40+ definitions)
2. Create `/components/Breadcrumb.tsx` - Navigation breadcrumbs
3. Create `/components/RelatedContent.tsx` - Quick links to related pages
4. Enhance `/components/LoadingState.tsx` - Already good, add variants
5. Create `/components/InfoIcon.tsx` - Question mark with tooltip

---

## SUMMARY

The Comets League Baseball website has made significant progress with recent implementations including comprehensive stat tooltips, keyboard navigation, and player linking. The main remaining opportunities for improvement are:

1. **Educating novice fans** through centralized glossaries, guides, and onboarding
2. **Improving discoverability** through better navigation and search
3. **Enhancing accessibility** through keyboard support for all tools and ARIA labels
4. **Optimizing performance** through smart loading and memoization
5. **Creating better UX** through contextual help and related content links

Implementing the critical improvements would significantly improve the experience for new users and make the site more inclusive and discoverable.

# Web App Migration Analysis
## Database & League Hub HTML Tools → Website Migration

### Executive Summary

**Analyzed:** 7 HTML web apps (6 in /database, 1 in /apps-script)
**Total Lines:** ~7,000 lines of HTML/CSS/JavaScript

**Recommendation:**
✅ **Migrate 3 viewer-facing tools to website** (Lineup Builder, Player Comparison, Chemistry Tool)
❌ **Keep 4 admin tools in Sheets** (Chemistry Editor, Attribute Admin, Import/Export)

**Benefits of Migration:**
- Better UX for GMs/viewers (no need for Sheets access)
- Responsive mobile design
- Integration with existing website navigation
- SEO benefits (player pages indexed by Google)
- Can add features like sharing, bookmarking, URL parameters

**Estimated Effort:** 15-20 hours for all 3 tools

---

## Web App Inventory

### /database Module (6 apps)

| # | File | Lines | Purpose | User Type | Read/Write |
|---|------|-------|---------|-----------|------------|
| 1 | DatabaseLineupsApp.html | 2,171 | Interactive baseball field lineup builder with chemistry visualization | GM/Viewer | Read-only (displays data) |
| 2 | DatabaseAttributesAdmin.html | 1,676 | Compare players with league/class averages (admin view) | Admin | Read-only + Edit |
| 3 | DatabaseChemistryApp.html | 953 | Multi-player chemistry comparison tool | GM/Viewer | Read-only |
| 4 | DatabaseChemistryEditor.html | 853 | Visual chemistry editor (edit relationships) | Admin | Write |
| 5 | DatabaseAttributesApp.html | 673 | Basic player attribute comparison (2-5 players) | GM/Viewer | Read-only |
| 6 | DatabaseImportApp.html | 321 | Import/export stats presets from Python tool | Admin | Write |

### /apps-script Module (1 app)

| # | File | Lines | Purpose | User Type | Read/Write |
|---|------|-------|---------|-----------|------------|
| 7 | PlayerComparisonApp.html | 515 | Compare players hitting/pitching/fielding stats | Viewer | Read-only |

---

## Detailed Analysis by App

### 1. 🏟️ Lineup Builder (DatabaseLineupsApp.html)

**Current State:**
- 2,171 lines of sophisticated UI
- Interactive SVG baseball field
- Drag-and-drop player positioning
- Real-time chemistry calculation
- Visual chemistry connections (lines between players)
- Save/load lineup functionality
- Team chemistry score meter

**Apps Script Dependencies:**
```javascript
google.script.run.getLineupCharacterList()        // Get all players
google.script.run.getLineupChemistryData()        // Get chemistry matrix
google.script.run.calculateTeamChemistry(players)  // Calculate chemistry score
google.script.run.saveLineup(lineupData)           // Save lineup
google.script.run.getSavedLineups()                // Load saved lineups
google.script.run.deleteLineup(name)               // Delete lineup
```

**Data Needs:**
- Player list
- Chemistry matrix (player-to-player values)
- Chemistry thresholds (positive/negative boundaries)

**Migration Complexity:** 🟡 Medium (10-12 hours)

**Migration Approach:**

```typescript
// website/app/tools/lineup-builder/page.tsx

import { getChemistryMatrix, getPlayerList } from '@/lib/sheets';

export default async function LineupBuilderPage() {
  const chemistry = await getChemistryMatrix();
  const players = await getPlayerList();

  return (
    <LineupBuilder
      players={players}
      chemistry={chemistry}
      thresholds={{ positive: 100, negative: -100 }}
    />
  );
}

// website/components/LineupBuilder.tsx
"use client"

export function LineupBuilder({ players, chemistry, thresholds }) {
  const [lineup, setLineup] = useState(Array(9).fill(null));
  const [chemistryScore, setChemistryScore] = useState(0);

  // Drag-and-drop logic
  // SVG baseball field rendering
  // Chemistry line visualization
  // Local storage for saved lineups (or API route if you want server-side saves)

  return (
    <div className="lineup-builder">
      <BaseballField lineup={lineup} onPlayerMove={...} />
      <Sidebar players={players} onDrag={...} />
      <ChemistryDisplay score={chemistryScore} />
    </div>
  );
}
```

**Benefits of Migration:**
- ✅ **Better UX** - Mobile-responsive, modern design
- ✅ **Shareable** - URL like `/tools/lineup-builder?lineup=mario,luigi,peach...`
- ✅ **No Sheets access needed** - Open to all viewers
- ✅ **Save to browser** - Local storage for personal lineups
- ✅ **Optional user accounts** - Could save lineups to database later

**Recommendation:** ✅ **MIGRATE TO WEBSITE**

---

### 2. ⚾ Player Attribute Comparison (DatabaseAttributesApp.html)

**Current State:**
- 673 lines
- Compare 2-5 players side-by-side
- Displays all 30 attributes
- Color-coded comparisons (red/green for below/above average)
- Grouped by category (Pitching, Hitting, Fielding, Running)

**Apps Script Dependencies:**
```javascript
google.script.run.getPlayerAttributeList()      // Get all player names
google.script.run.getPlayerAttributes([names])  // Get player attributes
```

**Data Needs:**
- Player list
- Player attributes (30 columns from Advanced Attributes sheet)

**Migration Complexity:** 🟢 Low-Medium (3-4 hours)

**Migration Approach:**

```typescript
// website/app/tools/compare-players/page.tsx

import { searchParams } from 'next/navigation';
import { getPlayerAttributes } from '@/lib/sheets';

export default async function ComparePlayersPage({ searchParams }) {
  const playerNames = searchParams.players?.split(',') || [];

  if (playerNames.length === 0) {
    return <PlayerSelector />; // Let users select players
  }

  const players = await Promise.all(
    playerNames.map(name => getPlayerAttributes(name))
  );

  return <PlayerComparison players={players} />;
}

// Shareable URLs: /tools/compare-players?players=Mario,Luigi,Peach
```

**Benefits of Migration:**
- ✅ **URL sharing** - `/tools/compare-players?players=Mario,Luigi,Peach`
- ✅ **SEO** - Google can index comparison pages
- ✅ **Integration** - Link from player profiles on website
- ✅ **Mobile-friendly** - Responsive table/card design

**Recommendation:** ✅ **MIGRATE TO WEBSITE**

---

### 3. ⚡ Player Chemistry Tool (DatabaseChemistryApp.html)

**Current State:**
- 953 lines
- Compare up to 4 players
- Shows positive/negative chemistry for each
- Team analysis (internal chemistry between selected players)
- Shared chemistry (characters that appear in multiple lists)
- Mixed chemistry detection

**Apps Script Dependencies:**
```javascript
google.script.run.getPlayerList()                     // Get all players
google.script.run.getMultiplePlayerChemistry([names]) // Get chemistry data
```

**Data Needs:**
- Player list
- Chemistry matrix
- Chemistry thresholds

**Migration Complexity:** 🟢 Low (3-4 hours)

**Migration Approach:**

```typescript
// website/app/tools/chemistry-check/page.tsx

export default async function ChemistryCheckPage({ searchParams }) {
  const playerNames = searchParams.players?.split(',') || [];
  const chemistry = await getChemistryMatrix();

  if (playerNames.length === 0) {
    return <PlayerSelector />;
  }

  const analysis = calculateChemistryAnalysis(playerNames, chemistry);

  return <ChemistryDisplay players={playerNames} analysis={analysis} />;
}

// URL: /tools/chemistry-check?players=Mario,Luigi,Peach,Bowser
```

**Benefits of Migration:**
- ✅ **Easy sharing** - "Check out this lineup's chemistry!"
- ✅ **Integration** - Add "Check Chemistry" button to Lineup Builder
- ✅ **Fast** - Client-side calculation, no server round-trips

**Recommendation:** ✅ **MIGRATE TO WEBSITE**

---

### 4. 📊 Player Comparison (PlayerComparisonApp.html) - League Hub

**Current State:**
- 515 lines
- Compare game stats (hitting, pitching, fielding)
- Different from Attribute Comparison (compares performance, not in-game attributes)
- Shows AVG, OPS, ERA, etc.

**Apps Script Dependencies:**
```javascript
google.script.run.getAvailablePlayers()              // Get all players
google.script.run.getPlayersForComparison([names])   // Get player stats
```

**Data Needs:**
- Player list
- Player stats (from 🧮 Players sheet)

**Migration Complexity:** 🟢 Low (2-3 hours)

**Migration Approach:**

```typescript
// website/app/players/compare/page.tsx

import { getPlayerStats } from '@/lib/sheets';

export default async function CompareStatsPage({ searchParams }) {
  const playerNames = searchParams.players?.split(',') || [];

  const stats = await Promise.all(
    playerNames.map(name => getPlayerStats(name))
  );

  return <StatsComparison players={stats} />;
}

// URL: /players/compare?players=Mario,Luigi
```

**Note:** This overlaps with the website's existing player pages. You could:
- **Option A:** Build a dedicated comparison page
- **Option B:** Add "Compare" button to existing player pages
- **Option C:** Merge with Attribute Comparison into one unified comparison tool

**Recommendation:** ✅ **MIGRATE TO WEBSITE** (combine with existing player pages)

---

### 5. 🔐 Attribute Admin Tool (DatabaseAttributesAdmin.html)

**Current State:**
- 1,676 lines
- Advanced version of Attribute Comparison
- Shows league averages and class averages
- Compare player stats vs. averages
- **Admin-only tool** for balance/tuning

**Apps Script Dependencies:**
```javascript
google.script.run.getPlayerAttributeList()
google.script.run.getPlayerAttributesWithAverages([names])
google.script.run.getLeagueAverages(excludeMiis)
google.script.run.getClassAverages(class, excludeMiis)
google.script.run.saveCharacterAttributes(name, changes) // WRITE OPERATION
```

**Data Needs:**
- Player attributes
- League-wide averages
- Class-specific averages
- **Write access** to update attributes

**Migration Complexity:** 🔴 High (8-10 hours + auth system)

**Why Keep in Sheets:**
- ❌ Requires **write access** to modify attributes
- ❌ Admin-only (commissioners shouldn't share this publicly)
- ❌ Would need authentication system on website
- ❌ Would need API routes to write back to Sheets
- ❌ Adds security complexity
- ✅ **Sheets already has permission model** (Share with commissioners)

**Recommendation:** ❌ **KEEP IN SHEETS** (admin tool)

---

### 6. ✏️ Chemistry Editor (DatabaseChemistryEditor.html)

**Current State:**
- 853 lines
- Visual editor for chemistry relationships
- Set positive/neutral/negative chemistry between characters
- Shows compact relationship views
- **Writes changes** to Chemistry Lookup sheet
- Logs changes to Chemistry Change Log

**Apps Script Dependencies:**
```javascript
google.script.run.getLineupChemistryDataFromJSON()
google.script.run.updateChemistryValue(p1, p2, value) // WRITE OPERATION
google.script.run.saveChemistryChanges(changes)       // WRITE OPERATION
```

**Why Keep in Sheets:**
- ❌ **Admin-only** balance/tuning tool
- ❌ **Writes data** to sheets
- ❌ Requires authentication/permissions
- ❌ Not needed by viewers/GMs
- ✅ Commissioners already have Sheets access

**Recommendation:** ❌ **KEEP IN SHEETS** (admin tool)

---

### 7. 📦 Import/Export Tool (DatabaseImportApp.html)

**Current State:**
- 321 lines
- Import chemistry/attributes from Python tool's preset format
- Export to preset format
- Technical admin tool for bulk data operations

**Apps Script Dependencies:**
```javascript
google.script.run.importChemistryFromStatsPreset()   // WRITE OPERATION
google.script.run.exportChemistryToStatsPreset()     // READ OPERATION
```

**Why Keep in Sheets:**
- ❌ **Admin-only** tool
- ❌ **Bulk data operations** (import/export)
- ❌ Integration with external Python tool
- ❌ Not needed by viewers

**Recommendation:** ❌ **KEEP IN SHEETS** (admin tool)

---

## Migration Summary

### ✅ Tools to Migrate to Website (Viewer-Facing)

| Tool | Priority | Effort | Benefit |
|------|----------|--------|---------|
| 1. Lineup Builder | High | 10-12h | High - Most engaging tool |
| 2. Player Attribute Comparison | High | 3-4h | High - Frequently used |
| 3. Chemistry Tool | Medium | 3-4h | Medium - Niche but cool |
| 4. Player Stats Comparison | Low | 2-3h | Low - Overlaps with player pages |

**Total Effort:** 15-20 hours

### ❌ Tools to Keep in Sheets (Admin-Only)

| Tool | Reason |
|------|--------|
| 1. Attribute Admin | Write access, admin-only, needs auth |
| 2. Chemistry Editor | Write access, balance tool |
| 3. Import/Export | Bulk operations, technical tool |

---

## Implementation Plan

### Phase 1: Data Layer (2-3 hours)

**Add to `/website/lib/sheets.ts`:**

```typescript
// Get all players
export async function getPlayerList(): Promise<string[]> {
  const data = await getSheetData("'📋 Player Registry'!A2:A100");
  return data.map(row => row[0]).filter(Boolean);
}

// Get player attributes
export async function getPlayerAttributes(playerName: string) {
  const data = await getSheetData("'🎮 Player Attributes'!A2:AD100");
  const player = data.find(row => row[0] === playerName);

  if (!player) return null;

  return {
    name: player[0],
    characterClass: player[1],
    captain: player[2],
    // ... map all 30 columns
    speed: player[20],
    power: player[19],
    // etc.
  };
}

// Get chemistry matrix
export async function getChemistryMatrix() {
  const data = await getSheetData("'⚡ Chemistry Lookup'!A2:C10000");

  const matrix: Record<string, Record<string, number>> = {};

  data.forEach(([p1, p2, value]) => {
    if (!matrix[p1]) matrix[p1] = {};
    if (!matrix[p2]) matrix[p2] = {};
    matrix[p1][p2] = Number(value);
    matrix[p2][p1] = Number(value); // Symmetric
  });

  return matrix;
}
```

### Phase 2: Lineup Builder (10-12 hours)

**File Structure:**
```
website/
├── app/
│   └── tools/
│       └── lineup-builder/
│           ├── page.tsx              (Server component - fetch data)
│           └── LineupBuilder.tsx      (Client component - UI)
├── components/
│   ├── BaseballField.tsx              (SVG field visualization)
│   ├── ChemistryVisualization.tsx     (Lines between players)
│   └── PlayerCard.tsx                 (Draggable player card)
└── lib/
    └── chemistry.ts                   (Chemistry calculation utils)
```

**Key Features:**
- Drag-and-drop players onto field
- Real-time chemistry calculation
- Visual chemistry connections
- Save to local storage
- Share via URL parameters

### Phase 3: Player Comparison Tools (5-7 hours)

**Option A: Separate Pages**
```
/tools/compare-attributes?players=Mario,Luigi,Peach
/tools/compare-stats?players=Mario,Luigi,Peach
```

**Option B: Unified Comparison (Recommended)**
```
/tools/compare?players=Mario,Luigi,Peach&view=attributes
/tools/compare?players=Mario,Luigi,Peach&view=stats
```

**Features:**
- Tab interface (Attributes | Stats | Chemistry)
- URL sharing
- Side-by-side comparison tables
- Color-coded differences
- Export to image/PDF

### Phase 4: Chemistry Tool (3-4 hours)

**File Structure:**
```
website/
└── app/
    └── tools/
        └── chemistry/
            ├── page.tsx
            └── ChemistryAnalysis.tsx
```

**Features:**
- Select 2-9 players
- Show positive/negative chemistry for each
- Team analysis (internal chemistry)
- Shared chemistry visualization
- Integration with Lineup Builder

---

## Migration Benefits

### For Viewers/GMs

| Before (Sheets Web App) | After (Website) |
|------------------------|-----------------|
| Need Sheets access/permissions | Public, no login needed |
| Modal dialog, limited space | Full-page layouts |
| No mobile optimization | Responsive design |
| Can't share results | Shareable URLs |
| No bookmarking | Browser history/bookmarks work |
| Disconnected from league site | Integrated navigation |

### For Commissioners

| Before | After |
|--------|-------|
| Users ask for access | No access management needed |
| Explain how to open tools | Send direct links |
| Tools hidden in Sheets menu | Prominent website nav |
| No analytics on usage | Can track tool usage |

### Technical Benefits

- **SEO** - Tools indexed by Google
- **Performance** - Client-side calculations (no Apps Script round-trips)
- **Caching** - Chemistry data cached, ultra-fast
- **Mobile** - Responsive, touch-optimized
- **Modern UX** - React components, smooth animations
- **Extensibility** - Easy to add features (export, share, filters)

---

## Data Flow After Migration

### Current (Sheets Web Apps)

```
User → Sheets Menu → Modal Dialog → google.script.run → Apps Script → Sheet Data → Return to Dialog
```

### After Migration (Website Tools)

```
User → Website Nav → Tool Page → getSheetData() → Google Sheets API → Return Data → Client-side rendering
```

**Performance:**
- Sheets Web App: ~2-3 seconds to load + calculate
- Website: ~500ms initial load, then instant (client-side calculations)

---

## Phased Rollout

### Phase 1: Foundation (Week 1)
- Add data layer functions to website
- Test chemistry/attribute data fetching
- Create `/tools` section in website nav

### Phase 2: Lineup Builder (Week 2-3)
- Build baseball field SVG component
- Implement drag-and-drop
- Add chemistry visualization
- Test on mobile/desktop

### Phase 3: Comparison Tools (Week 4)
- Build unified comparison page
- Add attribute/stats tabs
- Implement URL sharing

### Phase 4: Polish & Launch (Week 5)
- Add chemistry tool
- Write documentation
- Announce to league
- Deprecate Sheets web apps (keep for 1 month as backup)

---

## Keeping Admin Tools in Sheets

These tools **remain in Sheets** (merged into League Hub):

1. **🔐 Attribute Admin** - Edit player attributes, view averages
2. **✏️ Chemistry Editor** - Modify chemistry relationships
3. **📦 Import/Export** - Bulk data operations

**Why:**
- Commissioners already have Sheets access
- Write operations need permissions
- No need for public access
- Sheets provides built-in change tracking
- Easier to maintain (no auth system needed)

**Menu Structure After Merge:**

```
League Hub → Menu → 🎮 Player Tools
  ├── ⚾ Attribute Comparison (basic - could link to website)
  ├── 🏟️ Lineup Builder (could link to website)
  ├── ⚡ Chemistry Tool (could link to website)
  ├── ─────────────
  ├── 🔐 Admin: Attribute Editor
  ├── ✏️ Admin: Chemistry Editor
  └── 📦 Admin: Import/Export
```

Or even simpler: **Remove viewer tools from Sheets menu entirely**, only keep admin tools.

---

## Recommendation

**Migrate in this order:**

1. **Player Attribute Comparison** (3-4h) - Simplest, proves concept
2. **Chemistry Tool** (3-4h) - Builds on same data layer
3. **Lineup Builder** (10-12h) - Most complex but highest value

**Skip:**
- Player Stats Comparison (already have player pages)

**Keep in Sheets:**
- All admin/write tools

**Total Effort:** 15-20 hours over 2-3 weeks

**ROI:** High - Better UX, no access management, shareable tools, mobile-friendly

---

## Next Steps

Would you like me to:

1. **Start building the data layer?**
   - Add `getPlayerAttributes()`, `getChemistryMatrix()` to `/website/lib/sheets.ts`
   - Test data fetching

2. **Build one tool as proof-of-concept?**
   - Start with Player Comparison (simplest)
   - Prove the migration approach works

3. **Design the tool navigation?**
   - Create `/tools` section in website
   - Design tool listing page
   - Plan URL structure

Let me know which approach you prefer!

---

**Analysis Date:** November 17, 2025
**Tools Analyzed:** 7 HTML web apps (~7,000 lines)
**Recommendation:** Migrate 3 viewer tools to website, keep 4 admin tools in Sheets
**Estimated Effort:** 15-20 hours

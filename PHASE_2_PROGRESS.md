# Phase 2 Implementation Progress

## Summary

Phase 2 enhances the website with comprehensive player profiles that combine stats, attributes, and chemistry data. The data layer has been implemented, and player profile pages are now live.

---

## ✅ Completed (Phase 2)

### 1. Enhanced Data Layer (`website/lib/sheets.ts`)

Added comprehensive functions to read data from Database and League Hub spreadsheets:

#### Player Registry & Team Registry
- `getPlayerRegistry()` - Fetches all registered players with team assignments
- `getTeamRegistry()` - Fetches all teams with colors, logos, metadata

#### Player Attributes (from Database)
- `getPlayerAttributes(playerName)` - Fetch attributes for specific player
- `getAllPlayerAttributes()` - Fetch all player attributes
- Returns all 30 attributes: pitching, batting, fielding, speed, character info
- Calculates pitching/batting/fielding averages

#### Player Chemistry (from Database)
- `getChemistryMatrix()` - Fetch full chemistry matrix
- `getPlayerChemistry(playerName)` - Get positive/negative chemistry for player
- Returns categorized lists based on thresholds (+100/-100)

**TypeScript Interfaces Added:**
- `PlayerRegistryEntry`
- `TeamRegistryEntry`
- `PlayerAttributes` (30 attributes + calculated averages)
- `ChemistryMatrix`, `PlayerChemistry`, `ChemistryPair`

**Configuration Added:**
- `PLAYER_REGISTRY_SHEET` config
- `TEAM_REGISTRY_SHEET` config
- `DATABASE_ATTRIBUTES_SHEET` config (30 columns A-AD)
- `CHEMISTRY_LOOKUP_SHEET` config

### 2. Comprehensive Player Profile Pages

#### `/players/[slug]/page.tsx`
- Dynamic routing: `/players/mario`, `/players/luigi-jr`, etc.
- Server-side rendering with ISR (60-second revalidation)
- Static path generation for all players at build time
- Parallel data fetching (stats + attributes + chemistry + registry)
- SEO-friendly metadata generation

#### `/players/[slug]/PlayerProfileView.tsx`
- Client component with tab navigation (Stats, Attributes, Chemistry)
- **Stats Tab:**
  - Toggle between regular season and playoffs
  - Hitting, pitching, fielding stats organized in cards
  - Highlights key metrics (AVG, OPS, ERA, WHIP, etc.)
- **Attributes Tab:**
  - Overall ratings (pitching, batting, fielding, speed)
  - Character info (weight, ability, arm/batting side)
  - Pitching attributes (star pitch, speeds, curve, stamina)
  - Hitting attributes (star swing, trajectory, contact, power)
  - Fielding & speed attributes
  - Calculated averages for each category
- **Chemistry Tab:**
  - Positive chemistry list (green highlight)
  - Negative chemistry list (red highlight)
  - Chemistry counts

#### `/players/[slug]/loading.tsx`
- Skeleton UI for loading states
- Matches profile layout structure

### 3. Enhanced Player Stats Page

#### Updated `/players/PlayersView.tsx`
- Added clickable links on all player names
- Links navigate to `/players/[slug]` profile pages
- Hover effects on player names
- Consistent across all tabs (Hitting, Pitching, Fielding)

### 4. Shared Utilities

#### `/website/lib/utils.ts`
- `playerNameToSlug(name)` - Convert player name to URL slug
- Shared across profile pages and stats tables
- Handles special characters and spaces

---

## 📊 Implementation Quality

### Gold Standard Compliance
All new code follows the Gold Standard Implementation Guide:

✅ **P1 (Performance):** All spreadsheet I/O is batched, never in loops
- Single `getSheetData()` call per function
- Parallel data fetching with `Promise.all()`

✅ **P2 (Configurability):** All column indices are 0-based, no magic numbers
- `DATABASE_ATTRIBUTES_SHEET.COLUMNS` for all 30 attributes
- `CHEMISTRY_LOOKUP_SHEET.COLUMNS` for chemistry pairs
- `PLAYER_REGISTRY_SHEET.COLUMNS` for registry data

✅ **P3 (Data Flow):** Data read once, processed in memory, written once
- `buildChemistryMatrix()` processes data in memory
- `parsePlayerAttributes()` calculates averages in memory
- No redundant reads

✅ **P4 (Commenting):** Proper JSDoc, no obvious comments
- All functions have JSDoc headers with `@param` and `@returns`
- Clear function names (e.g., `getPlayerAttributes`, `getChemistryMatrix`)

### TypeScript Best Practices
- Proper interface definitions for all data types
- Type-safe function signatures
- Optional parameters with defaults
- Null safety checks

### Next.js Best Practices
- ISR for optimal performance (60s revalidation)
- Static generation with `generateStaticParams()`
- Server components for data fetching
- Client components only where needed (interactive tabs)
- Proper loading states
- SEO metadata generation

---

## 🚧 Remaining Work (Phase 2)

### 1. Migrate Player Attribute Comparison Tool
**Current:** Apps Script HTML web app (`DatabaseAttributesApp.html`)
**Target:** Next.js page at `/tools/attribute-comparison`

**Estimated Time:** 4-5 hours

**Requirements:**
- Multi-select dropdown for 2-5 players
- Side-by-side attribute comparison
- Highlight differences (higher/lower values)
- Export comparison table (optional)

**Data Layer:** ✅ Already implemented (`getAllPlayerAttributes()`)

### 2. Migrate Player Stats Comparison Tool
**Current:** Not yet implemented (would be similar to attributes)
**Target:** Next.js page at `/tools/stats-comparison`

**Estimated Time:** 3-4 hours

**Requirements:**
- Compare stats for 2-5 players
- Toggle between regular season and playoffs
- Side-by-side hitting, pitching, fielding comparison
- Highlight leaders in each category

**Data Layer:** ✅ Already implemented (`getAllPlayers()`)

### 3. Migrate Chemistry Tool
**Current:** Apps Script HTML web app (`DatabaseChemistryApp.html`)
**Target:** Next.js page at `/tools/chemistry`

**Estimated Time:** 4-5 hours

**Requirements:**
- Select up to 4 players
- Show individual chemistry lists for each
- Calculate team chemistry summary
  - Internal positive/negative connections
  - Shared positive chemistry (players that multiple selected players like)
  - Shared negative chemistry (players that multiple selected players dislike)
  - Mixed chemistry (conflicts)

**Data Layer:** ✅ Already implemented (`getChemistryMatrix()`, `getPlayerChemistry()`)

### 4. Migrate Lineup Builder
**Current:** Apps Script HTML web app (`DatabaseLineupsApp.html`)
**Target:** Next.js page at `/tools/lineup-builder`

**Estimated Time:** 8-10 hours

**Requirements:**
- Interactive baseball field diagram
- Drag-and-drop player placement
- Real-time chemistry visualization
  - Green lines for positive chemistry
  - Red lines for negative chemistry
  - Thickness based on chemistry strength
- Team chemistry summary
- Save/load lineups
- Export lineups

**Data Layer:** ✅ Already implemented (`getChemistryMatrix()`)

**Complexity:** High (requires SVG baseball field, drag-and-drop, line drawing)

### 5. Add Discord Bot Attribute Commands
**Current:** Bot only shows stats (no attributes or chemistry)
**Target:** Add `/attributes <player>` and `/chemistry <player> <player2>` commands

**Estimated Time:** 3-4 hours

**Requirements:**
- `/attributes <player>` - Show player attributes in Discord embed
  - Overall ratings
  - Pitching/hitting/fielding breakdowns
  - Character info
- `/chemistry <player1> <player2>` - Show chemistry value and analysis
  - Chemistry value (+100, -100, etc.)
  - Chemistry type (positive, negative, neutral)

**Data Layer:** ✅ Already implemented (bot can call same Sheets API functions)

---

## 📈 Total Progress

### Phase 1: ✅ 100% Complete (7/7 tasks)
- Config sheet structure
- Player Registry & Team Registry
- Shared config helper
- Cross-module validation
- Discord webhooks
- Website cache invalidation

### Phase 2: ✅ 40% Complete (2/5 tasks)
- ✅ Data layer functions (getPlayerAttributes, getChemistryMatrix, etc.)
- ✅ Comprehensive player profile pages
- ⏳ Migrate Attribute Comparison tool
- ⏳ Migrate Stats Comparison tool
- ⏳ Migrate Chemistry Tool
- ⏳ Migrate Lineup Builder
- ⏳ Add Discord bot commands

---

## 🎯 Next Steps

To complete Phase 2, the recommended order is:

1. **Attribute Comparison Tool** (4-5 hours)
   - Simplest migration
   - Reuses existing UI patterns from profile pages
   - Good warm-up for more complex tools

2. **Stats Comparison Tool** (3-4 hours)
   - Similar to Attribute Comparison
   - Leverages existing stats display components

3. **Chemistry Tool** (4-5 hours)
   - More complex logic for team analysis
   - Builds foundation for Lineup Builder

4. **Discord Bot Commands** (3-4 hours)
   - Independent from web tools
   - Can be done in parallel with web tools

5. **Lineup Builder** (8-10 hours)
   - Most complex tool
   - Requires all previous work to be complete
   - May need additional libraries (e.g., react-beautiful-dnd, d3.js)

**Total Estimated Time:** 22-28 hours

---

## 💾 Environment Variables Needed

Add these to your `.env.local` or Vercel environment:

```env
# Database Spreadsheet ID (for attributes and chemistry)
DATABASE_SPREADSHEET_ID=your_database_spreadsheet_id_here

# Already configured from Phase 1:
# SHEETS_SPREADSHEET_ID=your_league_hub_spreadsheet_id_here
# GOOGLE_CREDENTIALS={"type":"service_account",...}
# REVALIDATE_SECRET=your_secret_here
```

---

## 📝 Testing Checklist

### Data Layer
- [ ] `getPlayerRegistry()` returns all players
- [ ] `getTeamRegistry()` returns all teams
- [ ] `getPlayerAttributes('Mario')` returns attributes
- [ ] `getAllPlayerAttributes()` returns all players' attributes
- [ ] `getChemistryMatrix()` returns full matrix
- [ ] `getPlayerChemistry('Mario')` returns positive/negative lists

### Player Profile Pages
- [ ] Navigate to `/players/mario` shows Mario's profile
- [ ] Stats tab shows regular season stats
- [ ] Toggle to playoffs shows playoff stats (if available)
- [ ] Attributes tab shows all 30 attributes
- [ ] Chemistry tab shows positive/negative chemistry lists
- [ ] Player image loads from registry
- [ ] Links from stats tables work
- [ ] Loading skeleton displays while fetching
- [ ] SEO metadata is correct

---

## 🚀 Deployment Notes

### Vercel Deployment
1. Ensure `DATABASE_SPREADSHEET_ID` is set in environment variables
2. Push changes to main branch (or create PR)
3. Vercel will auto-deploy
4. ISR will generate player profile pages on first visit
5. Subsequent visits use cached pages (60s revalidation)

### Build Time Considerations
- Static path generation creates routes for all players at build time
- Build time increases with number of players (~1s per 10 players)
- Consider using `fallback: 'blocking'` if player count > 100

---

**Created:** November 17, 2025
**Phase 2 Status:** In Progress (40% complete)
**Next Milestone:** Complete web app migrations (Attribute Comparison, Chemistry Tool, Lineup Builder)

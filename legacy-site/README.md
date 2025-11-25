# Legacy Site Components

**Purpose:** Reference implementations for Google Sheets integration and data fetching patterns

**Status:** These files are NOT used in production but preserved for reference

---

## Why These Files Exist

These legacy components contain the original Google Sheets integration logic that needs to be ported to the new retro arcade pages. Keep them until Phase 2 data integration is complete.

---

## Directory Structure

### `view-components/`
Original page view components with Google Sheets data fetching logic:

- **LeadersView.tsx** - Leaders page with sheets integration
- **BracketView.tsx** - Playoffs bracket with sheets data
- **PlayersView.tsx** - Players list with sheets fetching
- **PlayerProfileView.tsx** - Player detail with sheets data
- **ScheduleView.tsx** - Schedule page with sheets integration
- **TeamStatsView.tsx** - Team stats with sheets fetching
- **AttributeComparisonView.tsx** - Attribute comparison with sheets
- **StatsComparisonView.tsx** - Stats comparison with sheets
- **ChemistryToolView.tsx** - Chemistry tool with sheets data
- **LineupBuilderView.tsx** - Lineup builder with sheets integration

**Key patterns to extract:**
- Google Sheets API calls
- Data transformation functions
- Loading states
- Error handling
- Data structure interfaces

### `components/`
Legacy reusable components (replaced by retro components):

#### Data Display
- **DataTable.tsx** - Old table component (replaced by RetroTable)
- **StatCard.tsx** - Old stat card (replaced by inline components)
- **SurfaceCard.tsx** - Old card wrapper (replaced by RetroCard)
- **StatTooltip.tsx** - Tooltip component

#### Interaction
- **PlayerMultiSelect.tsx** - Multi-select component
- **PlayerSelectModal.tsx** - Modal selection
- **SeasonToggle.tsx** - Season switcher
- **LiveStatsIndicator.tsx** - Live badge

#### State
- **EmptyState.tsx** - Empty state display
- **LoadingState.tsx** - Loading component (replaced by RetroLoader)
- **FadeIn.tsx** - Animation wrapper (replaced by framer-motion)

### `components/skeletons/`
Loading skeleton components:

- **CardGridSkeleton.tsx** - Card grid loader
- **TableSkeleton.tsx** - Table loader
- **TeamSkeleton.tsx** - Team loader

### `loading-states/`
Various loading.tsx files from different routes (for reference)

---

## How to Use for Phase 2 Integration

When implementing Google Sheets integration in Phase 2:

1. **Open relevant View component** (e.g., LeadersView.tsx for /leaders page)

2. **Extract data fetching logic:**
   ```typescript
   // Example pattern to look for:
   import { getCalculatedBattingLeaders } from "@/lib/sheets";

   const battingLeaders = await getCalculatedBattingLeaders(false);
   ```

3. **Copy data interfaces:**
   ```typescript
   // Find type definitions like:
   interface LeaderEntry {
     rank: number;
     name: string;
     team: string;
     value: string;
     // ...
   }
   ```

4. **Adapt to retro page:**
   - Replace `MOCK_DATA` with sheets fetch
   - Keep existing retro UI components
   - Add loading states using RetroLoader
   - Add error handling

5. **Test thoroughly:**
   - Verify data displays correctly
   - Check loading states
   - Test error scenarios
   - Ensure retro design is preserved

---

## Pages to Integrate (Phase 2)

### Priority 1: Statistical Pages
- [ ] Leaders Page - Extract from LeadersView.tsx
- [ ] Standings Page - Check existing implementation
- [ ] Schedule Page - Extract from ScheduleView.tsx

### Priority 2: Detail Pages
- [ ] Player Detail - Extract from PlayerProfileView.tsx
- [ ] Team Detail - Extract from TeamPageView.tsx

### Priority 3: Tool Pages
- [ ] Playoffs Bracket - Extract from BracketView.tsx
- [ ] Attribute Comparison - Extract from AttributeComparisonView.tsx
- [ ] Stats Comparison - Extract from StatsComparisonView.tsx
- [ ] Chemistry Network - Extract from ChemistryToolView.tsx
- [ ] Lineup Builder - Extract from LineupBuilderView.tsx

---

## Important: What NOT to Copy

**DO NOT copy these patterns to new pages:**

- ❌ Old component imports (DataTable, StatCard, etc.)
- ❌ Legacy styling classes
- ❌ FadeIn animation wrappers
- ❌ Old skeleton loaders

**DO copy these patterns:**

- ✅ Google Sheets API calls
- ✅ Data transformation functions
- ✅ Type definitions
- ✅ Error handling logic
- ✅ Loading state patterns (but use RetroLoader)

---

## When to Delete This Folder

**Safe to delete when:**

1. ✅ All pages have Google Sheets integration
2. ✅ All data fetching patterns have been ported
3. ✅ Testing complete with real data
4. ✅ No reference needed anymore

**Until then:** Keep this folder for reference during Phase 2 implementation

---

## Related Documentation

- `LEGACY_DESIGN_AUDIT_REPORT.md` - Full audit of legacy vs retro components
- `MIGRATION_COMPLETE.md` - Phase 1 migration report
- `site-beta-2/IMPLEMENTATION_GUIDE.md` - Phase 2 data integration guide

---

**Last Updated:** November 25, 2025
**Status:** Preserved for Phase 2 reference
**Safe to Delete:** After Phase 2 data integration complete

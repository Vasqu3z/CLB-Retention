# Remaining Migration Status

**Purpose:** Track completed beta migration work and identify all pages/components still requiring retro "Neon Void" redesign treatment.

**Context:** This document references the original migration playbooks (`MIGRATION_LLM_PLAYBOOK.md`, `MIGRATION_GUARDRAILS.md`, `MIGRATION_CHECKLIST.md`) and details current progress migrating the Comets League Baseball beta redesign into the Next.js 15 production app.

---

## Migration Progress Summary

### ✅ COMPLETED (Phase 1-4: Foundation → Navigation → UI Kit → Pages)

**Foundation Files (4/4)**
- ✅ `website/app/globals.css` - Replaced with "Neon Void" theme (arcade palette, retro gradients)
- ✅ `website/tailwind.config.ts` - Replaced with beta color tokens and font variables
- ✅ `website/lib/utils.ts` - Updated with beta utilities (preserved legacy `surfaceCardBaseClasses` for old components)
- ✅ `website/app/layout.tsx` - Replaced with beta font stack (Dela Gothic One, Chivo, Rajdhani, Space Mono)

**Navigation Shell (4/4)**
- ✅ `website/components/Header.tsx` - Replaced with beta nav featuring animated pill buttons
- ✅ `website/components/Footer.tsx` - Replaced with retro footer with particle effects
- ✅ `website/components/Sidebar.tsx` - Replaced with beta desktop sidebar with hover glows
- ✅ `website/components/SidebarMobile.tsx` - Replaced with beta mobile slide-in navigation

**UI Components (10/10)**
- ✅ `website/components/ui/RetroButton.tsx` - Core button with arcade styling and motion
- ✅ `website/components/ui/RetroCard.tsx` - Card container with retro border treatments
- ✅ `website/components/ui/RetroLoader.tsx` - Loading animations with retro visuals
- ✅ `website/components/ui/RetroTable.tsx` - Sortable table with neon styling
- ✅ `website/components/ui/StatHighlight.tsx` - Metric spotlight component
- ✅ `website/components/ui/TeamSelectCard.tsx` - Team grid cards with hover effects
- ✅ `website/components/ui/VersusCard.tsx` - Match display with team logos
- ✅ `website/components/ui/HolographicField.tsx` - Animated field overlay
- ✅ `website/components/ui/LoadingPatterns.tsx` - Loading state patterns
- ✅ `website/components/ui/LoadScreen.tsx` - Global loading screen

**Pages (10/10 with beta equivalents)**
- ✅ `website/app/page.tsx` - Homepage with hero and highlights
- ✅ `website/app/schedule/page.tsx` - Schedule display using VersusCard
- ✅ `website/app/players/page.tsx` - Players list with search/filter using RetroTable
- ✅ `website/app/players/[slug]/page.tsx` - Player profile with game log
- ✅ `website/app/teams/page.tsx` - Teams grid using TeamSelectCard
- ✅ `website/app/teams/[slug]/page.tsx` - Team detail with roster and holographic field
- ✅ `website/app/standings/page.tsx` - Standings page wrapper
- ✅ `website/app/standings/StandingsTable.tsx` - Standalone standings table component
- ✅ `website/app/tools/lineup/page.tsx` - Lineup builder with chemistry calculations
- ✅ `website/app/tools/compare/page.tsx` - Head-to-head player comparison
- ✅ `website/app/not-found.tsx` - Custom 404 page with retro styling

**Build Status:** ✅ All TypeScript compilation errors resolved. App successfully deployed.

---

## 🚧 REMAINING WORK

### Pages Without Beta Equivalents (5 pages)

These production pages are **still using the old design system** and need retro "Neon Void" redesign treatment. Copies have been archived in `old-site/pages/` for reference.

#### 1. Leaders Page
- **Production Path:** `website/app/leaders/page.tsx`
- **Archived Copy:** `old-site/pages/leaders-page.tsx`
- **Description:** Statistical leaders board showing top performers across categories (HR, AVG, RBI, etc.)
- **Current Dependencies:** `LeadersView.tsx`, `DataTable`, `SurfaceCard`, `StatTooltip`
- **What It Needs:** Retro table design with neon stat categories, arcade-style leader rankings

#### 2. Playoffs Bracket
- **Production Path:** `website/app/playoffs/page.tsx`
- **Archived Copy:** `old-site/pages/playoffs-page.tsx`
- **Description:** Tournament bracket view showing playoff matchups and progression
- **Current Dependencies:** `BracketView.tsx`, `DataTable`, custom bracket rendering
- **What It Needs:** Retro bracket visualization with neon connectors and holographic effects

#### 3. Attribute Comparison Tool
- **Production Path:** `website/app/tools/attributes/page.tsx`
- **Archived Copy:** `old-site/pages/tools-attributes-page.tsx`
- **Description:** Visual comparison of player attributes (Speed, Power, Contact, Defense, Arm)
- **Current Dependencies:** `AttributeComparisonView.tsx`, `PlayerMultiSelect`, `SurfaceCard`
- **What It Needs:** Retro radar chart or bar comparison with neon gradient fills

#### 4. Chemistry Tool
- **Production Path:** `website/app/tools/chemistry/page.tsx`
- **Archived Copy:** `old-site/pages/tools-chemistry-page.tsx`
- **Description:** Chemistry calculator for lineup optimization
- **Current Dependencies:** `ChemistryToolView.tsx`, `PlayerSelectModal`, custom chemistry logic
- **What It Needs:** Integration with existing `LineupBuilder` retro design or standalone retro treatment

#### 5. Stats Comparison Tool
- **Production Path:** `website/app/tools/stats/page.tsx`
- **Archived Copy:** `old-site/pages/tools-stats-page.tsx`
- **Description:** Side-by-side statistical comparison of multiple players
- **Current Dependencies:** `StatsComparisonView.tsx`, `PlayerMultiSelect`, `DataTable`, `SurfaceCard`
- **What It Needs:** Retro comparison table with neon stat bars and arcade-style headers

---

### Legacy Components Still in Use (13 components)

These components are **still required** by the 5 non-migrated pages above. They use the old design system and should eventually be replaced or removed once their dependent pages are redesigned. Copies have been archived in `old-site/components/` for reference.

#### Core Legacy Components (4)

**1. DataTable.tsx**
- **Production Path:** `website/components/DataTable.tsx`
- **Archived Copy:** `old-site/components/DataTable.tsx`
- **Used By:** Leaders page, Playoffs page, Stats Comparison Tool
- **Description:** Old table component with space theme (different from RetroTable)
- **Status:** ⚠️ Keep until dependent pages are redesigned with RetroTable

**2. SurfaceCard.tsx**
- **Production Path:** `website/components/SurfaceCard.tsx`
- **Archived Copy:** `old-site/components/SurfaceCard.tsx`
- **Used By:** Leaders page, Attribute Tool, Stats Tool
- **Description:** Card container with old space theme, exports `surfaceCardBaseClasses`
- **Status:** ⚠️ Keep until dependent pages are redesigned with RetroCard

**3. StatTooltip.tsx**
- **Production Path:** `website/components/StatTooltip.tsx`
- **Archived Copy:** `old-site/components/StatTooltip.tsx`
- **Used By:** Leaders page, Stats Tool, potentially others
- **Description:** Hover tooltips for stat explanations
- **Status:** ⚠️ Keep until dependent pages implement retro tooltip treatment

**4. LiveStatsIndicator.tsx**
- **Production Path:** `website/components/LiveStatsIndicator.tsx`
- **Archived Copy:** `old-site/components/LiveStatsIndicator.tsx`
- **Used By:** Potentially Leaders page (live stat updates)
- **Description:** Real-time stat update indicator
- **Status:** ⚠️ Keep until live stats are wired with retro styling

#### Player Selection Components (2)

**5. PlayerMultiSelect.tsx**
- **Production Path:** `website/components/PlayerMultiSelect.tsx`
- **Archived Copy:** `old-site/components/PlayerMultiSelect.tsx`
- **Used By:** Attribute Tool, Stats Tool
- **Description:** Multi-player selection dropdown
- **Status:** ⚠️ Keep until tools are redesigned with retro selection UI

**6. PlayerSelectModal.tsx**
- **Production Path:** `website/components/PlayerSelectModal.tsx`
- **Archived Copy:** `old-site/components/PlayerSelectModal.tsx`
- **Used By:** Chemistry Tool
- **Description:** Modal for player selection
- **Status:** ⚠️ Keep until Chemistry Tool is redesigned

#### UI Utility Components (1)

**7. SeasonToggle.tsx**
- **Production Path:** `website/components/SeasonToggle.tsx`
- **Archived Copy:** `old-site/components/SeasonToggle.tsx`
- **Used By:** Multiple pages (season switching)
- **Description:** Toggle between seasons
- **Status:** ⚠️ Keep until retro season toggle is designed

#### Loading/Empty State Components (3)

**8. LoadingState.tsx**
- **Production Path:** `website/components/LoadingState.tsx`
- **Archived Copy:** `old-site/components/LoadingState.tsx`
- **Used By:** Various pages
- **Description:** Generic loading spinner
- **Status:** ⚠️ Can be replaced with RetroLoader once all pages migrate

**9. EmptyState.tsx**
- **Production Path:** `website/components/EmptyState.tsx`
- **Archived Copy:** `old-site/components/EmptyState.tsx`
- **Used By:** Various pages (no data states)
- **Description:** Empty state placeholder
- **Status:** ⚠️ Keep until retro empty state design is created

**10. StatCard.tsx**
- **Production Path:** `website/components/StatCard.tsx`
- **Archived Copy:** `old-site/components/StatCard.tsx`
- **Used By:** Potentially Leaders page, various stat displays
- **Description:** Individual stat display card
- **Status:** ⚠️ Can likely be replaced with StatHighlight or RetroCard

#### Animation Components (1)

**11. FadeIn.tsx**
- **Production Path:** `website/components/animations/FadeIn.tsx`
- **Archived Copy:** `old-site/components/FadeIn.tsx`
- **Used By:** Multiple pages (animation wrapper)
- **Description:** Fade-in animation wrapper
- **Status:** ⚠️ Keep until all pages use framer-motion directly

#### Skeleton Components (3)

**12. CardGridSkeleton.tsx**
- **Production Path:** `website/components/skeletons/CardGridSkeleton.tsx`
- **Archived Copy:** `old-site/components/CardGridSkeleton.tsx`
- **Used By:** Team/Player grids while loading
- **Description:** Loading skeleton for card grids
- **Status:** ⚠️ Keep until retro skeleton design is created

**13. TeamSkeleton.tsx**
- **Production Path:** `website/components/skeletons/TeamSkeleton.tsx`
- **Archived Copy:** `old-site/components/TeamSkeleton.tsx`
- **Used By:** Team detail pages while loading
- **Description:** Loading skeleton for team cards
- **Status:** ⚠️ Keep until retro skeleton design is created

**14. TableSkeleton.tsx**
- **Production Path:** `website/components/skeletons/TableSkeleton.tsx`
- **Archived Copy:** `old-site/components/TableSkeleton.tsx`
- **Used By:** Tables while loading data
- **Description:** Loading skeleton for tables
- **Status:** ⚠️ Keep until retro table skeleton is created

---

### View Components Requiring Redesign (5 components)

These are page-specific view components that contain the core UI logic for non-migrated pages. Archived in `old-site/view-components/` for reference.

**1. LeadersView.tsx**
- **Production Path:** `website/components/views/LeadersView.tsx`
- **Archived Copy:** `old-site/view-components/LeadersView.tsx`
- **Used By:** Leaders page
- **Status:** 🔄 Needs complete retro redesign

**2. BracketView.tsx**
- **Production Path:** `website/components/views/BracketView.tsx`
- **Archived Copy:** `old-site/view-components/BracketView.tsx`
- **Used By:** Playoffs page
- **Status:** 🔄 Needs complete retro redesign

**3. AttributeComparisonView.tsx**
- **Production Path:** `website/components/views/AttributeComparisonView.tsx`
- **Archived Copy:** `old-site/view-components/AttributeComparisonView.tsx`
- **Used By:** Attribute Comparison Tool
- **Status:** 🔄 Needs complete retro redesign

**4. ChemistryToolView.tsx**
- **Production Path:** `website/components/views/ChemistryToolView.tsx`
- **Archived Copy:** `old-site/view-components/ChemistryToolView.tsx`
- **Used By:** Chemistry Tool
- **Status:** 🔄 Needs complete retro redesign (or merge with LineupBuilder)

**5. StatsComparisonView.tsx**
- **Production Path:** `website/components/views/StatsComparisonView.tsx`
- **Archived Copy:** `old-site/view-components/StatsComparisonView.tsx`
- **Used By:** Stats Comparison Tool
- **Status:** 🔄 Needs complete retro redesign

---

## File-by-File Mapping: What's Left

### Pages That Need Retro Design

| Current Production Path | Archived Copy | Component Dependencies | Priority |
|------------------------|---------------|------------------------|----------|
| `website/app/leaders/page.tsx` | `old-site/pages/leaders-page.tsx` | LeadersView, DataTable, SurfaceCard, StatTooltip | HIGH - High traffic page |
| `website/app/playoffs/page.tsx` | `old-site/pages/playoffs-page.tsx` | BracketView, DataTable | MEDIUM - Seasonal content |
| `website/app/tools/attributes/page.tsx` | `old-site/pages/tools-attributes-page.tsx` | AttributeComparisonView, PlayerMultiSelect, SurfaceCard | LOW - Tool page |
| `website/app/tools/chemistry/page.tsx` | `old-site/pages/tools-chemistry-page.tsx` | ChemistryToolView, PlayerSelectModal | LOW - May merge with LineupBuilder |
| `website/app/tools/stats/page.tsx` | `old-site/pages/tools-stats-page.tsx` | StatsComparisonView, PlayerMultiSelect, DataTable | LOW - Tool page |

### Components That Can Be Removed After Redesign

| Component | Current Usage | Can Remove When... |
|-----------|---------------|-------------------|
| DataTable.tsx | Leaders, Playoffs, Stats Tool | All 3 pages use RetroTable |
| SurfaceCard.tsx | Leaders, Attribute Tool, Stats Tool | All 3 pages use RetroCard |
| StatTooltip.tsx | Leaders, Stats Tool | Retro tooltip pattern implemented |
| LiveStatsIndicator.tsx | Leaders (maybe) | Live stats use retro styling |
| PlayerMultiSelect.tsx | Attribute Tool, Stats Tool | Both tools have retro selection UI |
| PlayerSelectModal.tsx | Chemistry Tool | Chemistry Tool redesigned |
| SeasonToggle.tsx | Multiple pages | Retro season toggle created |
| LoadingState.tsx | Various | All pages use RetroLoader |
| EmptyState.tsx | Various | Retro empty state created |
| StatCard.tsx | Various | All stats use StatHighlight or RetroCard |
| FadeIn.tsx | Various | All pages use framer-motion directly |
| CardGridSkeleton.tsx | Grids | Retro skeleton created |
| TeamSkeleton.tsx | Team pages | Retro skeleton created |
| TableSkeleton.tsx | Tables | Retro table skeleton created |

---

## Recommended Execution Order for Remaining Work

### Phase 5: High-Priority Pages

**5.1 Leaders Page Redesign**
1. Design retro leader rankings layout with neon stat categories
2. Replace `LeadersView.tsx` with new retro implementation
3. Use `RetroTable` for leader boards
4. Replace `website/app/leaders/page.tsx` with retro version
5. Test sorting, filtering, and stat category switching

### Phase 6: Medium-Priority Pages

**6.1 Playoffs Bracket Redesign**
1. Design retro bracket visualization (SVG or canvas-based)
2. Replace `BracketView.tsx` with new retro implementation
3. Use neon connectors and holographic effects for matchups
4. Replace `website/app/playoffs/page.tsx` with retro version
5. Test bracket progression and matchup display

### Phase 7: Tool Pages Redesign

**7.1 Attribute Comparison Tool**
1. Design retro radar chart or bar comparison layout
2. Create retro player multi-select component
3. Replace `AttributeComparisonView.tsx` with new retro implementation
4. Replace `website/app/tools/attributes/page.tsx` with retro version

**7.2 Stats Comparison Tool**
1. Design retro side-by-side stat comparison layout
2. Use `RetroTable` for comparison display
3. Replace `StatsComparisonView.tsx` with new retro implementation
4. Replace `website/app/tools/stats/page.tsx` with retro version

**7.3 Chemistry Tool Evaluation**
1. Review existing `LineupBuilder` functionality (`website/app/tools/lineup/page.tsx`)
2. Determine if Chemistry Tool should merge with LineupBuilder or remain standalone
3. If standalone: create retro chemistry visualization
4. If merged: enhance LineupBuilder with chemistry tool features
5. Update or remove `website/app/tools/chemistry/page.tsx` accordingly

### Phase 8: Component Cleanup

**8.1 Remove Legacy Components**
Once all 5 pages are redesigned, remove these components:
- `website/components/DataTable.tsx` (replaced by RetroTable)
- `website/components/SurfaceCard.tsx` (replaced by RetroCard)
- `website/components/StatTooltip.tsx` (replaced by retro tooltip pattern)
- `website/components/LiveStatsIndicator.tsx` (replaced by retro live indicator)
- `website/components/PlayerMultiSelect.tsx` (replaced by retro multi-select)
- `website/components/PlayerSelectModal.tsx` (replaced by retro modal)
- `website/components/LoadingState.tsx` (replaced by RetroLoader)
- `website/components/EmptyState.tsx` (replaced by retro empty state)
- `website/components/StatCard.tsx` (replaced by StatHighlight/RetroCard)
- `website/components/animations/FadeIn.tsx` (replaced by framer-motion)

**8.2 Evaluate Utility Components**
- `SeasonToggle.tsx` - Create retro version if still needed
- Skeleton components - Create retro versions for loading states

**8.3 Remove View Components**
- `website/components/views/LeadersView.tsx`
- `website/components/views/BracketView.tsx`
- `website/components/views/AttributeComparisonView.tsx`
- `website/components/views/ChemistryToolView.tsx`
- `website/components/views/StatsComparisonView.tsx`

### Phase 9: Data Wiring

**9.1 Google Sheets Integration** (ONLY AFTER all visuals match beta)
1. Wire Leaders page to Google Sheets stat leaders data
2. Wire Playoffs page to Google Sheets playoff bracket data
3. Wire tool pages to Google Sheets player/team data
4. Ensure all data updates preserve retro layouts and styling

---

## Design Principles for Remaining Work

When creating retro designs for the 5 remaining pages, follow these established patterns from the completed beta migration:

### Visual Style
- **Color Palette:** Arcade colors (cyan `#00F3FF`, yellow `#F4D03F`, red `#FF4D4D`, purple `#BD00FF`, blue `#2E86DE`)
- **Typography:** Dela Gothic One (display), Chivo (body), Rajdhani (UI), Space Mono (mono)
- **Effects:** Neon glows, scanline overlays, holographic gradients, pixelated borders
- **Animations:** Framer-motion for smooth transitions, subtle hover effects

### Component Patterns
- Use `RetroTable` for all tabular data (leaders, stats, brackets)
- Use `RetroCard` for all card containers (stats, players, teams)
- Use `RetroButton` for all CTAs and actions
- Use `StatHighlight` for featured metrics
- Use `HolographicField` for spatial visualizations

### Layout Patterns
- Consistent spacing using Tailwind utilities
- Arcade-style headers with neon underlines
- Gradient backgrounds with dark base (`#050505`)
- Responsive grid layouts with proper breakpoints

---

## Success Criteria

The migration will be **100% complete** when:

1. ✅ All 5 remaining pages (Leaders, Playoffs, Attribute Tool, Chemistry Tool, Stats Tool) have retro "Neon Void" designs
2. ✅ All 14 legacy components are removed from `website/components/`
3. ✅ All 5 view components are removed from `website/components/views/`
4. ✅ No production code references old design system (space theme, legacy fonts, legacy components)
5. ✅ App builds successfully with zero TypeScript errors
6. ✅ All pages visually match retro arcade aesthetic
7. ✅ Google Sheets data is wired to all redesigned pages
8. ✅ `old-site/` directory can be safely deleted (all content migrated)

---

## Notes

- **Do NOT rewrite beta designs.** When creating new retro pages, follow the established patterns from completed pages.
- **Preserve font stack.** All new pages must use Dela Gothic One, Chivo, Rajdhani, and Space Mono.
- **Component reuse.** Leverage existing retro UI components (`RetroTable`, `RetroCard`, etc.) wherever possible.
- **Data wiring last.** Complete visual designs before integrating Google Sheets data.
- **Test builds frequently.** Run TypeScript compilation after each page migration to catch errors early.

---

**Last Updated:** 2025-11-25
**Migration Progress:** 10/15 pages complete (66%)
**Next Milestone:** Phase 5 - Leaders Page Redesign

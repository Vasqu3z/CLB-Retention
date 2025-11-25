# Migration Checklist for Claude Code

Use this checklist to systematically implement the arcade-style pages.

---

## Pre-Migration Verification

### Environment Check
- [ ] Next.js 15 installed
- [ ] TypeScript configured
- [ ] Tailwind CSS configured
- [ ] App Router structure present (`website/app/`)

### Dependencies Check
```bash
npm list framer-motion
npm list lucide-react
```
- [ ] `framer-motion` installed
- [ ] `lucide-react` installed

If missing:
```bash
npm install framer-motion lucide-react
```

### Configuration Check

**tailwind.config.ts:**
- [ ] Has `comets-cyan` color token
- [ ] Has `comets-yellow` color token
- [ ] Has `comets-red` color token
- [ ] Has `comets-purple` color token
- [ ] Has `comets-blue` color token
- [ ] Has `background` color token
- [ ] Has `surface-dark` color token

**globals.css:**
- [ ] Has `.scanlines` utility class
- [ ] Has `.animate-pulse-slow` class
- [ ] Has CSS variables for comets colors

**app/layout.tsx:**
- [ ] Loads Dela Gothic One font
- [ ] Loads Rajdhani font
- [ ] Loads Space Mono font
- [ ] Font variables configured (font-display, font-ui, font-mono)

**lib/utils.ts:**
- [ ] Exports `cn()` helper function

---

## Directory Structure Setup

### Create Required Directories
```bash
mkdir -p website/app/leaders
mkdir -p website/app/playoffs
mkdir -p website/app/tools/attributes
mkdir -p website/app/tools/stats
```

Verification:
- [ ] `website/app/leaders/` exists
- [ ] `website/app/playoffs/` exists
- [ ] `website/app/tools/attributes/` exists
- [ ] `website/app/tools/stats/` exists

---

## File Migration

### 1. Leaders Page

**Copy:**
```bash
cp leaders-page.tsx website/app/leaders/page.tsx
```

**Verify:**
- [ ] File copied successfully
- [ ] No syntax errors on save
- [ ] Imports resolve correctly

**Test:**
```bash
npm run build
```
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No import errors

**Visual Test:**
```bash
npm run dev
# Visit http://localhost:3000/leaders
```
- [ ] Page loads without errors
- [ ] Title "LEAGUE LEADERS" displays (text-8xl)
- [ ] Cosmic blur orbs visible in background
- [ ] Batting/Pitching toggle works
- [ ] Spring animation on toggle (layoutId transition)
- [ ] Podium cards display (3 leaders per stat)
- [ ] Rank badges show (1st = yellow circle)
- [ ] Hover effects work (scale 1.02)
- [ ] Scanlines visible on cards (subtle horizontal lines)
- [ ] Values display in colored pills (cyan)
- [ ] Mobile responsive (test at 375px width)

---

### 2. Playoffs Page

**Copy:**
```bash
cp playoffs-page.tsx website/app/playoffs/page.tsx
```

**Verify:**
- [ ] File copied successfully
- [ ] No syntax errors on save
- [ ] Imports resolve correctly

**Test:**
```bash
npm run build
```
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No import errors

**Visual Test:**
```bash
npm run dev
# Visit http://localhost:3000/playoffs
```
- [ ] Page loads without errors
- [ ] Title "PLAYOFF BRACKET" displays (text-8xl)
- [ ] Red/yellow blur orbs visible
- [ ] 2-column layout (Semifinals | Finals)
- [ ] Matchup cards display team colors
- [ ] Win counts show in large numbers
- [ ] Crown icons on winners (yellow)
- [ ] Click cards to expand game details
- [ ] Game scores display correctly
- [ ] Spring animation on card click
- [ ] Hover effects work (border cyan)
- [ ] Scanlines visible on cards
- [ ] Mobile responsive (single column)

---

### 3. Attribute Comparison Page

**Copy:**
```bash
cp tools-attributes-page.tsx website/app/tools/attributes/page.tsx
```

**Verify:**
- [ ] File copied successfully
- [ ] No syntax errors on save
- [ ] Imports resolve correctly

**Test:**
```bash
npm run build
```
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No import errors

**Visual Test:**
```bash
npm run dev
# Visit http://localhost:3000/tools/attributes
```
- [ ] Page loads without errors
- [ ] Title "ATTRIBUTE COMPARISON" displays (text-8xl)
- [ ] Purple/cyan blur orbs visible
- [ ] Player selection pills display
- [ ] Pills have colored borders (match player colors)
- [ ] Dots in pills match player colors
- [ ] "Add Player" button works
- [ ] Search dropdown appears
- [ ] Can add players (up to 4)
- [ ] X button removes players
- [ ] Rotate animation on pill removal
- [ ] Attribute bars display
- [ ] Bars animate on load (1s fill)
- [ ] Shimmer effect on bars
- [ ] Max values highlighted (yellow ring)
- [ ] Icon animations work (rotate wiggle)
- [ ] Mobile responsive (bars stack)

---

### 4. Stats Comparison Page

**Copy:**
```bash
cp tools-stats-page.tsx website/app/tools/stats/page.tsx
```

**Verify:**
- [ ] File copied successfully
- [ ] No syntax errors on save
- [ ] Imports resolve correctly

**Test:**
```bash
npm run build
```
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No import errors

**Visual Test:**
```bash
npm run dev
# Visit http://localhost:3000/tools/stats
```
- [ ] Page loads without errors
- [ ] Title "STATS COMPARISON" displays (text-8xl)
- [ ] Cyan/red blur orbs visible
- [ ] Player selection pills work
- [ ] Category tabs display (Batting/Pitching/Fielding)
- [ ] Tab switching has spring animation (layoutId)
- [ ] Player cards in grid layout
- [ ] Card borders match player colors
- [ ] Player headers have colored backgrounds
- [ ] Stats display in colored monospace
- [ ] Category affects which stats show
- [ ] Add/remove players works
- [ ] Search dropdown works
- [ ] Mobile responsive (cards stack)

---

## Integration Testing

### Cross-Page Navigation
- [ ] Can navigate between all pages
- [ ] No console errors on navigation
- [ ] Cosmic blur orbs persist across pages
- [ ] Font loading consistent

### Performance Testing
```bash
npm run build
# Check build output for bundle sizes
```
- [ ] Page components under 50KB each
- [ ] No large bundle warnings
- [ ] Framer Motion tree-shaken properly

### Browser Testing
Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Responsive Testing
Test at breakpoints:
- [ ] Mobile (375px) - Single column, text-6xl
- [ ] Tablet (768px) - 2 columns, text-7xl
- [ ] Desktop (1024px+) - 3-4 columns, text-8xl

### Accessibility Testing
- [ ] Can tab through all interactive elements
- [ ] Focus indicators visible (cyan outline)
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA
- [ ] All buttons have accessible names

### Animation Testing
- [ ] Smooth 60fps on interactions
- [ ] No jank on scroll
- [ ] Spring physics feel satisfying
- [ ] Stagger reveals timed correctly
- [ ] No infinite loops (except blur orbs)

---

## Post-Migration Tasks

### Visual Consistency Review
Compare all 4 pages:
- [ ] Typography scale consistent
- [ ] Color usage consistent
- [ ] Motion patterns consistent
- [ ] Spacing consistent
- [ ] Border styles consistent
- [ ] Card designs consistent

### Code Quality Check
- [ ] No console.log statements
- [ ] No unused imports
- [ ] No TypeScript 'any' types
- [ ] Consistent code formatting
- [ ] Comments where needed

### Documentation Update
- [ ] Update project README with new pages
- [ ] Document any configuration changes
- [ ] Note any dependencies added
- [ ] Create deployment notes

---

## Data Integration (Phase 2)

**ONLY after visual approval, integrate Google Sheets:**

### Leaders Page
```typescript
// Import Google Sheets functions
import { 
  getCalculatedBattingLeaders,
  getCalculatedPitchingLeaders 
} from "@/lib/sheets";

// Replace MOCK_LEADERS with real data
const battingLeaders = await getCalculatedBattingLeaders(false);
const pitchingLeaders = await getCalculatedPitchingLeaders(false);
```

### Playoffs Page
```typescript
import { 
  getPlayoffSchedule,
  groupGamesBySeries,
  buildBracket 
} from "@/lib/sheets";

const playoffGames = await getPlayoffSchedule();
const seriesMap = groupGamesBySeries(playoffGames);
const bracket = buildBracket(seriesMap);
```

### Attributes Page
```typescript
import { getAllPlayerAttributes } from "@/lib/sheets";

const players = await getAllPlayerAttributes();
```

### Stats Page
```typescript
import { getAllPlayers } from "@/lib/sheets";

const players = await getAllPlayers(false); // Regular season
```

**Verification after data integration:**
- [ ] Data displays correctly
- [ ] No null/undefined errors
- [ ] Empty states handled
- [ ] Loading states added
- [ ] Error handling implemented

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No console errors
- [ ] Mobile tested
- [ ] Accessibility verified

### Deployment
- [ ] Code committed to repository
- [ ] Pull request created
- [ ] Code review completed
- [ ] Merged to main branch
- [ ] Deployed to production

### Post-Deployment
- [ ] Verify all pages load in production
- [ ] Test animations in production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Gather user feedback

---

## Rollback Plan

If critical issues found:

### Quick Rollback
```bash
# Revert last commit
git revert HEAD

# Push to production
git push origin main
```

### Selective Rollback
```bash
# Remove specific page
rm website/app/leaders/page.tsx

# Rebuild and deploy
npm run build
```

### Full Rollback
```bash
# Restore from backup
cp -r backup/website/app/* website/app/

# Rebuild and deploy
npm run build
```

---

## Success Metrics

Migration is successful when:

**Technical:**
- ✅ Zero build errors
- ✅ Zero console errors
- ✅ Zero TypeScript errors
- ✅ All imports resolve
- ✅ All pages load

**Visual:**
- ✅ Arcade aesthetic matches design
- ✅ Animations smooth (60fps)
- ✅ Colors display correctly
- ✅ Fonts load properly
- ✅ Responsive on all devices

**Functional:**
- ✅ All interactions work
- ✅ Navigation functions
- ✅ Data displays correctly
- ✅ Error handling works
- ✅ Accessibility meets standards

---

## Completion Sign-Off

- [ ] Technical lead approval
- [ ] Design lead approval
- [ ] QA testing complete
- [ ] Documentation updated
- [ ] Deployed to production
- [ ] Monitoring enabled

---

**Migration Status:** Ready to Begin  
**Package Version:** 1.0  
**Created:** November 25, 2025

**Start with:** Pre-Migration Verification
**Complete when:** All checkboxes marked
**Estimated Time:** 2-3 hours for full migration

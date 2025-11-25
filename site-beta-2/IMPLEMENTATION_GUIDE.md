# Arcade-Style Pages Implementation Guide

## Overview

This package contains 5 production-ready page components designed with the "Neon Void" arcade aesthetic for the Comets League Baseball website. Each page features massive typography, spring physics animations, cosmic backgrounds, and diegetic arcade interface elements.

---

## Files Included

1. **leaders-page.tsx** - Statistical leaders board with podium-style cards
2. **playoffs-page.tsx** - Tournament bracket with geometric matchup visualizations
3. **tools-attributes-page.tsx** - Player attribute comparison with animated bars
4. **tools-stats-page.tsx** - Side-by-side statistical comparison cards
5. **tools-chemistry-page.tsx** - Chemistry network analysis with connection visualization

---

## Design Philosophy Applied

### Motion-First Arcade Experience
- **Spring physics**: Every interaction uses `type: "spring"` with bounce
- **Scale animations**: `whileHover={{ scale: 1.05-1.1 }}` on all interactive elements
- **Stagger delays**: List items animate in sequence (idx * 0.05-0.1)
- **Layout animations**: `layoutId` for smooth category/tab transitions

### High-Contrast Neon Minimalism
- **Massive typography**: `text-6xl md:text-8xl` for page titles
- **Cosmic blur orbs**: Positioned absolute backgrounds with 120px blur
- **Surgical accents**: comets-cyan, comets-yellow, comets-red, comets-purple
- **Near-black base**: bg-background (#050505)
- **Extreme whitespace**: Large padding, generous spacing

### Diegetic Arcade Elements
- **Scanlines**: `scanlines opacity-5` on all cards
- **Geometric shapes**: Rounded-lg cards, rounded-full badges
- **HUD displays**: Monospace numbers in colored boxes
- **Uppercase everything**: `uppercase tracking-widest` for UI text

---

## File Placement

### Production Paths
```
website/app/leaders/page.tsx           ← leaders-page.tsx
website/app/playoffs/page.tsx          ← playoffs-page.tsx
website/app/tools/attributes/page.tsx  ← tools-attributes-page.tsx
website/app/tools/stats/page.tsx       ← tools-stats-page.tsx
```

### Directory Structure Required
```
website/
├── app/
│   ├── leaders/
│   │   └── page.tsx
│   ├── playoffs/
│   │   └── page.tsx
│   └── tools/
│       ├── attributes/
│       │   └── page.tsx
│       ├── stats/
│       │   └── page.tsx
│       └── chemistry/
│           └── page.tsx
├── components/
│   └── ui/
│       └── (existing retro components)
└── lib/
    └── utils.ts (cn helper)
```

---

## Dependencies Required

### Package Dependencies
```json
{
  "framer-motion": "^10.x.x",
  "lucide-react": "^0.x.x",
  "next": "^15.x.x",
  "react": "^18.x.x"
}
```

### Internal Dependencies
All pages use:
- `@/lib/utils` - cn() helper for className merging
- Tailwind CSS with comets-* color tokens
- Font classes: font-display, font-ui, font-mono

### Font Configuration (must exist in layout.tsx)
```typescript
--font-display: 'Dela Gothic One'  // Massive headings
--font-ui: 'Rajdhani'              // UI labels, buttons
--font-mono: 'Space Mono'          // Numbers, data
```

---

## Tailwind Configuration Requirements

### Colors (must be in tailwind.config.ts)
```typescript
colors: {
  background: "var(--background)",    // #050505
  foreground: "var(--foreground)",    // #ffffff
  surface: {
    dark: "var(--surface-dark)",      // #0a0a0a
  },
  comets: {
    cyan: "var(--comets-cyan)",       // #00F3FF
    yellow: "var(--comets-yellow)",   // #F4D03F
    red: "var(--comets-red)",         // #FF4D4D
    purple: "var(--comets-purple)",   // #BD00FF
    blue: "var(--comets-blue)",       // #2E86DE
  },
}
```

### CSS Variables (must be in globals.css)
```css
:root {
  --background: #050505;
  --foreground: #ffffff;
  --surface-dark: #0a0a0a;
  --comets-cyan: #00F3FF;
  --comets-yellow: #F4D03F;
  --comets-red: #FF4D4D;
  --comets-purple: #BD00FF;
  --comets-blue: #2E86DE;
}
```

### Custom Utilities (must be in globals.css)
```css
/* Scanlines effect */
.scanlines {
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(255,255,255,0) 50%,
    rgba(0,0,0,0.2) 50%,
    rgba(0,0,0,0.2)
  );
  background-size: 100% 4px;
  pointer-events: none;
}

/* Slow pulse animation */
.animate-pulse-slow {
  animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## Integration Steps for Claude Code

### 1. Pre-flight Check
```bash
# Verify dependencies installed
npm list framer-motion lucide-react

# Check Tailwind config has comets-* colors
grep -r "comets-cyan" tailwind.config.ts

# Verify font variables in layout
grep -r "font-display" app/layout.tsx
```

### 2. Copy Files
```bash
# Create directories if needed
mkdir -p website/app/leaders
mkdir -p website/app/playoffs
mkdir -p website/app/tools/attributes
mkdir -p website/app/tools/stats

# Copy page files
cp leaders-page.tsx website/app/leaders/page.tsx
cp playoffs-page.tsx website/app/playoffs/page.tsx
cp tools-attributes-page.tsx website/app/tools/attributes/page.tsx
cp tools-stats-page.tsx website/app/tools/stats/page.tsx
```

### 3. Verify Imports
Each page imports:
```typescript
import { motion, AnimatePresence } from "framer-motion";  // Must be installed
import { Icon } from "lucide-react";                       // Various icons
import { cn } from "@/lib/utils";                          // Must exist
```

### 4. Test Build
```bash
npm run build
# Should complete with no errors

npm run dev
# Test each page:
# http://localhost:3000/leaders
# http://localhost:3000/playoffs
# http://localhost:3000/tools/attributes
# http://localhost:3000/tools/stats
```

### 5. Data Integration (Phase 2)
After visual confirmation, replace mock data:

**Leaders Page:**
```typescript
// Replace MOCK_LEADERS with:
import { getCalculatedBattingLeaders, getCalculatedPitchingLeaders } from "@/lib/sheets";

// In component:
const battingLeaders = await getCalculatedBattingLeaders(false);
const pitchingLeaders = await getCalculatedPitchingLeaders(false);
```

**Playoffs Page:**
```typescript
// Replace MOCK_BRACKET with:
import { getPlayoffSchedule, groupGamesBySeries, buildBracket } from "@/lib/sheets";

// In component:
const playoffGames = await getPlayoffSchedule();
const seriesMap = groupGamesBySeries(playoffGames);
const bracket = buildBracket(seriesMap);
```

**Attributes Page:**
```typescript
// Replace MOCK_PLAYERS with:
import { getAllPlayerAttributes } from "@/lib/sheets";

// In component:
const players = await getAllPlayerAttributes();
```

**Stats Page:**
```typescript
// Replace MOCK_PLAYERS with:
import { getAllPlayers } from "@/lib/sheets";

// In component:
const players = await getAllPlayers(false); // false = regular season
```

---

## Visual Verification Checklist

### Leaders Page (/leaders)
- [ ] Massive "League Leaders" title (text-8xl)
- [ ] Cosmic cyan blur orb in background
- [ ] Yellow/cyan toggle with spring animation
- [ ] Podium cards with rank badges (1st = yellow circle)
- [ ] Hover effects scale cards to 1.02
- [ ] Scanlines visible on cards

### Playoffs Page (/playoffs)
- [ ] Massive "Playoff Bracket" title
- [ ] Red/yellow blur orbs
- [ ] Matchup cards with team colors
- [ ] Crown icons on winners (comets-yellow)
- [ ] Click cards to expand game details
- [ ] Spring animation on card interactions

### Attributes Page (/tools/attributes)
- [ ] Massive "Attribute Comparison" title
- [ ] Purple/cyan blur orbs
- [ ] Player selection pills with colored borders
- [ ] Add/remove player animations (rotate, scale)
- [ ] Animated horizontal bars showing attributes
- [ ] Shimmer effect on bars during animation
- [ ] Max values highlighted

### Stats Page (/tools/stats)
- [ ] Massive "Stats Comparison" title
- [ ] Cyan/red blur orbs
- [ ] Player cards in grid layout
- [ ] Category toggle (Batting/Pitching/Fielding) with layoutId
- [ ] Stats display in colored monospace
- [ ] Card borders match player colors

---

## Common Issues & Solutions

### Issue: Colors not showing
**Solution:** Verify Tailwind config includes comets-* tokens and CSS variables are defined in globals.css

### Issue: Fonts look wrong
**Solution:** Check app/layout.tsx has Dela Gothic One, Rajdhani, and Space Mono loaded

### Issue: Animations not smooth
**Solution:** Verify framer-motion is installed: `npm install framer-motion`

### Issue: Import errors
**Solution:** Ensure @/lib/utils exports cn() helper function

### Issue: Blur orbs not visible
**Solution:** Check blur-[120px] is whitelisted in Tailwind safelist

### Issue: Scanlines missing
**Solution:** Verify .scanlines utility is in globals.css

---

## Performance Notes

### Optimization Applied
- **Stagger delays** prevent layout thrash (incremental reveals)
- **AnimatePresence** properly unmounts components
- **Motion values** use GPU-accelerated transforms
- **Conditional rendering** only shows needed elements

### Animation Budget
Each page uses:
- ~10-15 motion components per view
- Stagger delays capped at 1 second total
- Spring physics with reasonable stiffness (200-400)
- No infinite animations except blur orb pulse

---

## Mobile Responsiveness

All pages include:
- `md:` and `lg:` breakpoints for text sizes
- Flex-wrap for player selection pills
- Grid responsive columns (1 col mobile, 2-4 cols desktop)
- Touch-friendly button sizes (min 44px touch target)

Test at:
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1024px+ width

---

## Accessibility Features

- **Keyboard navigation**: All interactive elements focusable
- **Focus indicators**: focus-arcade utility class
- **Semantic HTML**: Proper heading hierarchy
- **ARIA labels**: Where needed for icons
- **Color contrast**: WCAG AA compliant (white on near-black)

---

## Next Steps After Implementation

1. **Visual QA**: Test all pages match arcade aesthetic
2. **Data integration**: Connect to Google Sheets
3. **Error handling**: Add loading states for async data
4. **SEO**: Add metadata exports to each page
5. **Analytics**: Track page views and interactions

---

## Support for Claude Code

When implementing:
1. Copy files exactly as provided
2. Run build after each file
3. Fix any import errors immediately
4. Test visual appearance before data integration
5. Report any Tailwind token mismatches

The pages are designed to work with MOCK data first, then connect to real data after visual confirmation.

---

**Status:** ✅ Ready for Implementation  
**Design Philosophy:** Arcade Sports Interface  
**Target:** Next.js 15 App Router  
**Last Updated:** November 25, 2025

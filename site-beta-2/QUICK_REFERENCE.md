# Quick Reference Card

## 📦 Package Contents
- **4 Page Components** (.tsx files)
- **3 Documentation Files** (.md files)
- **Total:** 7 files, ~2,750 lines

---

## 🎯 Core Design Principles

### Typography Scale
```
Page Titles:  text-6xl → text-8xl  (96px → 128px)
UI Labels:    text-sm → text-xl    (14px → 20px)
Data/Stats:   text-xl → text-3xl   (20px → 30px)
```

### Color Tokens
```
comets-cyan:    #00F3FF  Primary accent
comets-yellow:  #F4D03F  Winners, gold
comets-red:     #FF4D4D  Batting, danger
comets-purple:  #BD00FF  Special states
comets-blue:    #2E86DE  Supporting
background:     #050505  Near-black base
```

### Motion Language
```typescript
whileHover={{ scale: 1.05 }}          // Buttons
whileTap={{ scale: 0.95 }}            // Press effect
whileHover={{ rotate: [0,-5,5,0] }}   // Icon wiggle
transition={{ type: "spring" }}       // All animations
transition={{ delay: idx * 0.1 }}     // Stagger reveals
```

---

## 📁 File Destinations

```
leaders-page.tsx           → website/app/leaders/page.tsx
playoffs-page.tsx          → website/app/playoffs/page.tsx
tools-attributes-page.tsx  → website/app/tools/attributes/page.tsx
tools-stats-page.tsx       → website/app/tools/stats/page.tsx
```

---

## ⚡ Quick Implementation

### 1. Pre-flight (2 minutes)
```bash
npm list framer-motion lucide-react
grep "comets-cyan" tailwind.config.ts
grep "Dela Gothic One" app/layout.tsx
```

### 2. Copy Files (2 minutes)
```bash
mkdir -p website/app/{leaders,playoffs,tools/attributes,tools/stats}
cp *.tsx website/app/[appropriate-paths]/page.tsx
```

### 3. Build & Test (2 minutes)
```bash
npm run build
npm run dev
# Visit each page, verify visuals
```

**Total Time:** ~6 minutes to get pages live

---

## ✅ Visual Checklist

Each page must have:
- [ ] Massive title (text-8xl on desktop)
- [ ] Cosmic blur orbs (600-700px, blur-[120px])
- [ ] Scanlines on cards (subtle horizontal lines)
- [ ] Spring physics on hover (scale 1.05)
- [ ] Uppercase UI text (tracking-widest)
- [ ] Monospace numbers (font-mono)
- [ ] Near-black background (#050505)
- [ ] Stagger reveals (delay: idx * 0.1)

---

## 🎨 Page-Specific Features

### Leaders Page
- Podium-style leader cards (3 per stat)
- Yellow circle badge for 1st place
- Batting/Pitching category toggle
- Cyan/Yellow blur orbs

### Playoffs Page
- Geometric matchup cards (2-column)
- Crown icons on winners
- Click to expand game details
- Red/Yellow blur orbs

### Attributes Page
- Player selection pills (colored borders)
- Horizontal animated bars
- Shimmer effect on bar fills
- Purple/Cyan blur orbs

### Stats Page
- Side-by-side player cards
- Category tabs (Batting/Pitching/Fielding)
- Color-coded stat displays
- Cyan/Red blur orbs

---

## 🔧 Required Config

### tailwind.config.ts
```typescript
colors: {
  background: "var(--background)",
  comets: {
    cyan: "#00F3FF",
    yellow: "#F4D03F",
    red: "#FF4D4D",
    purple: "#BD00FF",
    blue: "#2E86DE"
  }
}
```

### globals.css
```css
.scanlines {
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(255,255,255,0) 50%,
    rgba(0,0,0,0.2) 50%,
    rgba(0,0,0,0.2)
  );
  background-size: 100% 4px;
}

.animate-pulse-slow {
  animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### app/layout.tsx
```typescript
fontFamily: {
  display: ["Dela Gothic One"],
  ui: ["Rajdhani"],
  mono: ["Space Mono"]
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Colors not showing | Check comets-* in tailwind.config + CSS vars |
| Fonts wrong | Verify Dela Gothic One, Rajdhani, Space Mono |
| Animations laggy | Confirm framer-motion installed |
| Import errors | Ensure @/lib/utils has cn() helper |
| Blur orbs invisible | Check blur-[120px] in Tailwind safelist |

---

## 📊 Component Anatomy

### Leader Card Structure
```
┌──────────────────────┐
│ [Scanlines overlay]  │
│ Icon  STAT    TOP 3  │
├──────────────────────┤
│ ●1  Mario  .412      │
│ ○2  Luigi  .305      │
│ ○3  Peach  .280      │
└──────────────────────┘
```

### Matchup Card Structure
```
┌──────────────────────┐
│ SEMIFINAL          ⚔│
├──────────────────────┤
│ MAR Fireballs   [3] │
│ LUI Knights     [1] │
├──────────────────────┤
│ ▼ Game details      │
└──────────────────────┘
```

---

## 🎯 Animation Timing

```
Page load sequence:
0.0s  → Header fades in
0.2s  → Subtitle/badge
0.4s  → Category toggle
0.6s+ → Content grid (staggered)

Interaction timings:
Hover → 300ms transition
Click → Instant feedback (scale 0.95)
Tab switch → 600ms spring
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 768px)
- text-6xl titles
- Single column
- Stacked pills

Tablet (768-1024px)
- text-7xl titles
- 2 columns
- Wrapped pills

Desktop (> 1024px)
- text-8xl titles
- 3-4 columns
- Inline pills
```

---

## 🎭 Mock Data Structure

Each page includes mock data for testing:
- **Leaders**: Top 3 per stat (AVG, HR, RBI, ERA, W, SV)
- **Playoffs**: Semifinal + Finals matchups with games
- **Attributes**: 4 players with 5 attributes each
- **Stats**: 4 players with batting/pitching/fielding stats

Replace with Google Sheets after visual approval.

---

## 📚 Documentation Flow

1. **README.md** ← Start here (overview)
2. **IMPLEMENTATION_GUIDE.md** ← Step-by-step (for Claude Code)
3. **DESIGN_REFERENCE.md** ← Visual system (for designers)
4. **THIS FILE** ← Quick reference (for rapid lookup)

---

## ✨ Success Criteria

Pages are ready when:
- ✅ Build completes with no errors
- ✅ Visual matches arcade aesthetic
- ✅ Animations smooth at 60fps
- ✅ Responsive on all devices
- ✅ Keyboard navigation works
- ✅ No console errors

---

## 🚀 Next Steps

1. Copy files to destinations
2. Run `npm run build`
3. Test visuals at each page
4. Confirm animations work
5. Test mobile responsive
6. Connect Google Sheets data (Phase 2)

---

**Need Help?** See IMPLEMENTATION_GUIDE.md for detailed steps

**Package:** Arcade Pages v1.0  
**Status:** ✅ Production Ready  
**Created:** November 25, 2025

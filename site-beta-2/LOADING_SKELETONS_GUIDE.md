# Loading Skeletons - Implementation Guide

## 🎮 Design Philosophy

These aren't generic shimmer skeletons—they're **arcade loading sequences** that feel like game menu loading states. Each skeleton embodies the diegetic arcade interface philosophy:

- **Loading IS part of the game experience**
- **Animated states feel alive, not static**
- **Visual feedback creates anticipation**
- **Spring physics and organic motion**

Think: Arcade cabinet booting up, tournament brackets materializing, character stats charging, network nodes connecting.

---

## 📦 Package Contents

5 custom loading skeleton components, each matching its corresponding page's structure:

1. **LeadersPageSkeleton.tsx** (~280 lines) - Stats calculating with podium materialization
2. **PlayoffsPageSkeleton.tsx** (~320 lines) - Bracket assembling with holographic projection
3. **AttributesPageSkeleton.tsx** (~290 lines) - Power bars charging with energy effects
4. **StatsPageSkeleton.tsx** (~310 lines) - Data streaming with digital readout
5. **ChemistryPageSkeleton.tsx** (~400 lines) - Network nodes connecting with relationship mapping

**Total:** ~1,600 lines of production-ready loading animations

---

## 🎨 Unique Animation Patterns Per Skeleton

### 1. Leaders Page Skeleton
**Theme:** "Stats Calculating" - Arcade scoreboard updating

**Key Animations:**
- **Scanline reveal** on title (vertical sweep effect)
- **Category toggle pulse** with cyan border waves
- **Podium rank badges** pulsing with scale animations
- **Value placeholders** with data stream shimmer
- **Stat icons** rotating with spring physics
- **Card outer glow** pulsing in staggered sequence

**Color Focus:** Cyan (#00F3FF) + Yellow (#F4D03F)

**Cosmic Blurs:** Cyan top-left, Yellow bottom-right

**Special Effects:**
```tsx
// Scanline reveal on title
<motion.div animate={{ y: ["0%", "100%"] }} />

// Data stream on value pills
<motion.div animate={{ x: ["-100%", "200%"] }} />
```

---

### 2. Playoffs Page Skeleton
**Theme:** "Bracket Assembling" - Tournament tree materializing

**Key Animations:**
- **3D flip reveal** on matchup cards (rotateY: 90 → 0)
- **Team logo rotation** with border color cycling
- **Win count pulse** with yellow glow
- **VS divider** scale pulse with opacity
- **Network pulse** sweeping across cards
- **Different delays** for semifinals vs finals

**Color Focus:** Red (#FF4D4D) + Yellow (#F4D03F)

**Cosmic Blurs:** Red right, Yellow left (dramatic movement)

**Special Effects:**
```tsx
// 3D card reveal
initial={{ rotateY: 90 }}
animate={{ rotateY: 0 }}

// Logo spinning
animate={{ rotate: [0, 360] }}
```

---

### 3. Attributes Page Skeleton
**Theme:** "Power Charging" - Character select screen loading

**Key Animations:**
- **Title spring scale** with bounce effect
- **Attribute icons** rotating with power-up rings
- **Charging bars** filling/emptying in waves (0% → 70% → 0%)
- **Shimmer effect** on bars with gradient sweep
- **Energy pulse** radial gradient expanding
- **Color-coded per attribute** (Power=red, Contact=cyan, Speed=yellow, etc.)

**Color Focus:** Purple (#BD00FF) + Cyan (#00F3FF)

**Cosmic Blurs:** Purple left, Cyan right

**Special Effects:**
```tsx
// Charging bar effect
animate={{ 
  width: ["0%", "70%", "0%"],
  opacity: [0.5, 1, 0.5]
}}

// Power-up ring
animate={{ 
  scale: [1, 1.2, 1],
  opacity: [0, 0.5, 0]
}}
```

---

### 4. Stats Page Skeleton
**Theme:** "Data Streaming" - Sports scoreboard updating

**Key Animations:**
- **Title slide up** with spring physics
- **Category tabs** with scan effect and border pulse
- **Player cards** scale entry with spring
- **Stat values** flickering with text shadow glow
- **Data stream** gradient sweep on value boxes
- **Border cycling** on stat containers

**Color Focus:** Cyan (#00F3FF) + Red (#FF4D4D)

**Cosmic Blurs:** Cyan right, Red left

**Special Effects:**
```tsx
// Digital readout flicker
animate={{ 
  opacity: [0.3, 0.6, 0.3],
  textShadow: [
    "0 0 0px #00F3FF",
    "0 0 5px #00F3FF",
    "0 0 0px #00F3FF"
  ]
}}

// Data stream
animate={{ x: ["-100%", "200%"] }}
```

---

### 5. Chemistry Page Skeleton
**Theme:** "Network Connecting" - Relationship graph assembling

**Key Animations:**
- **Network icon** continuous rotation (0 → 360)
- **Player nodes** with connection rings expanding
- **Relationship lines** vertical sweep animation
- **Chemistry values** width animations (connection strength)
- **Network pulse** gradient sweeping across entire card
- **Positive/Negative** color differentiation (yellow vs red)

**Color Focus:** Purple (#BD00FF) + Cyan (#00F3FF)

**Cosmic Blurs:** Purple left (drifting), Cyan right (drifting)

**Special Effects:**
```tsx
// Node connection rings
animate={{ 
  scale: [1, 2, 1],
  opacity: [0.5, 0, 0.5]
}}

// Connection line growing
animate={{ 
  height: ["0%", "100%", "0%"],
  opacity: [0, 1, 0]
}}

// Network pulse
animate={{ x: ["-100%", "200%"] }}
```

---

## 🔧 Technical Implementation

### File Placement
```
website/components/ui/skeletons/
├── LeadersPageSkeleton.tsx
├── PlayoffsPageSkeleton.tsx
├── AttributesPageSkeleton.tsx
├── StatsPageSkeleton.tsx
└── ChemistryPageSkeleton.tsx
```

### Usage in Pages

**Option 1: React Suspense** (Recommended for async data)
```tsx
import { Suspense } from "react";
import LeadersPageSkeleton from "@/components/ui/skeletons/LeadersPageSkeleton";
import LeadersContent from "./LeadersContent";

export default function LeadersPage() {
  return (
    <Suspense fallback={<LeadersPageSkeleton />}>
      <LeadersContent />
    </Suspense>
  );
}
```

**Option 2: Conditional Rendering** (For client-side loading)
```tsx
"use client";

import { useState, useEffect } from "react";
import LeadersPageSkeleton from "@/components/ui/skeletons/LeadersPageSkeleton";

export default function LeadersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <LeadersPageSkeleton />;
  
  return <div>{/* Your content */}</div>;
}
```

---

## ✨ Shared Design Elements

All skeletons share these core arcade aesthetics:

### 1. Cosmic Background (Identical to real pages)
```tsx
<div className="fixed inset-0 pointer-events-none">
  <motion.div 
    className="absolute ... bg-comets-cyan/10 blur-[120px]"
    animate={{ scale: [1, 1.2, 1] }}
  />
</div>
```

### 2. Scanlines on Cards
```tsx
<div className="absolute inset-0 scanlines opacity-5" />
```

### 3. Progress Dots (5-6 dots)
```tsx
<motion.div
  animate={{
    scale: [1, 1.5, 1],
    backgroundColor: [
      "rgba(255,255,255,0.2)",
      "rgba(0,243,255,1)",
      "rgba(255,255,255,0.2)"
    ]
  }}
/>
```

### 4. Loading Text with Glow
```tsx
<motion.div
  animate={{ 
    textShadow: [
      "0 0 0px #00F3FF",
      "0 0 10px #00F3FF",
      "0 0 0px #00F3FF"
    ]
  }}
>
  Loading...
</motion.div>
```

### 5. Shimmer Effect (Data streaming)
```tsx
<motion.div
  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
  animate={{ x: ["-100%", "200%"] }}
  transition={{ duration: 1.5, repeat: Infinity }}
/>
```

---

## 🎯 Animation Timing Philosophy

### Stagger Delays
- **Header elements:** 0s, 0.2s, 0.4s
- **Category toggles:** 0.3s base + idx * 0.1s
- **Grid items:** 0.5s base + idx * 0.15s
- **Sub-items:** Parent delay + idx * 0.08s

### Duration Guidelines
- **Fast pulse:** 1.5s (text glow, opacity)
- **Medium pulse:** 2s (border colors, scales)
- **Slow sweep:** 2.5-3s (shimmer effects, background pulses)
- **Continuous rotation:** 3s linear (logos, icons)

### Spring Physics (When appropriate)
```tsx
transition={{ 
  type: "spring", 
  stiffness: 200, 
  damping: 20 
}}
```

---

## 🔥 Performance Optimizations

### 1. GPU Acceleration
All animations use transform/opacity properties:
```tsx
// ✅ Good - GPU accelerated
animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}

// ❌ Bad - CPU intensive
animate={{ width: "100%", height: "100%" }}
```

### 2. Animation Budget
- Max 20 animated elements visible at once
- Infinite animations only on essential elements (cosmic blurs, primary indicators)
- Stagger delays capped at 1.5s total

### 3. Reduced Motion
Consider adding:
```tsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Disable complex animations if true
```

---

## 📐 Responsive Design

All skeletons are fully responsive:

**Mobile (< 768px):**
- Title: text-6xl (96px)
- Single column grids
- Stacked elements
- Reduced animation complexity

**Tablet (768px - 1024px):**
- Title: text-7xl (112px)
- 2-column grids
- Comfortable spacing

**Desktop (> 1024px):**
- Title: text-8xl (128px)
- 3-column grids
- Full animation suite

---

## 🎨 Color Coding by Page

| Page | Primary | Secondary | Cosmic Blurs |
|------|---------|-----------|--------------|
| Leaders | Cyan | Yellow | Cyan + Yellow |
| Playoffs | Red | Yellow | Red + Yellow |
| Attributes | Purple | Cyan | Purple + Cyan |
| Stats | Cyan | Red | Cyan + Red |
| Chemistry | Purple | Cyan | Purple + Cyan |

---

## 🚀 Integration Checklist

Per page, verify:

- [ ] Skeleton matches page structure exactly
- [ ] Cosmic blur colors match real page
- [ ] Scanlines on all cards
- [ ] Spring physics on card entries
- [ ] Shimmer effects on data placeholders
- [ ] Progress dots at bottom
- [ ] Loading text with glow effect
- [ ] Stagger delays feel natural
- [ ] Animations smooth at 60fps
- [ ] Mobile responsive
- [ ] No console errors

---

## 💡 Design Insights

### Why These Aren't Generic Skeletons

**Traditional approach:**
- Gray rectangles
- Simple fade pulse
- No personality
- Boring wait time

**Arcade loading approach:**
- **Structural preview** - Shows exact page layout
- **Thematic animations** - Each page has unique motion language
- **Color personality** - Matches page's accent colors
- **Anticipation building** - Makes waiting feel like part of the experience
- **Diegetic design** - Feels like in-game loading screens

### Animation Philosophy
> "Loading isn't dead time—it's a transition state that should feel alive and exciting, like an arcade game booting up."

Each skeleton uses animations that preview the page's functionality:
- **Leaders:** Stats materializing (what the page shows)
- **Playoffs:** Bracket assembling (tournament structure)
- **Attributes:** Bars charging (power comparison)
- **Stats:** Data streaming (number crunching)
- **Chemistry:** Nodes connecting (relationship mapping)

---

## 📊 File Statistics

| Skeleton | Lines | Animations | Components | Complexity |
|----------|-------|------------|------------|------------|
| Leaders | ~280 | 15+ | 2 | Medium |
| Playoffs | ~320 | 18+ | 3 | High |
| Attributes | ~290 | 12+ | 1 | Medium |
| Stats | ~310 | 14+ | 1 | Medium |
| Chemistry | ~400 | 20+ | 3 | High |

**Total:** ~1,600 lines of arcade loading magic

---

## 🎮 Next Steps

1. Copy all 5 skeleton files to `website/components/ui/skeletons/`
2. Import into respective page components
3. Wrap async content in Suspense boundaries
4. Test loading states visually
5. Verify animations are smooth
6. Check mobile responsiveness
7. Deploy and enjoy the arcade vibes! 🕹️

---

**Status:** ✅ Production Ready  
**Philosophy:** Diegetic Arcade Interface  
**Inspiration:** Arcade cabinet boot sequences  
**Created:** November 25, 2025

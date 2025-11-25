# Visual Design Reference - Arcade Aesthetic

## Design DNA

The Comets League Baseball pages embody a **diegetic arcade sports interface** - users feel like they're navigating a playable space baseball game menu, not viewing a traditional stats website.

---

## Typography Hierarchy

### Display (Dela Gothic One)
**Usage:** Page titles, massive hero text  
**Sizes:** `text-6xl md:text-8xl` (96px-128px)  
**Style:** `uppercase leading-none tracking-tighter`  
**Effect:** `text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50`

```
Example:
LEAGUE
LEADERS
```

**Purpose:** Creates immediate visual impact, establishes arcade game menu feel

### UI Labels (Rajdhani)
**Usage:** Buttons, tabs, badges, navigation  
**Sizes:** `text-sm` to `text-xl`  
**Style:** `uppercase tracking-widest` (0.3em-0.05em)  
**Weight:** `font-bold`

```
Example:
BATTING  •  PITCHING  •  FIELDING
```

**Purpose:** Clean, geometric labels that feel like HUD elements

### Data/Stats (Space Mono)
**Usage:** Numbers, scores, statistics  
**Sizes:** `text-xl` to `text-3xl`  
**Style:** Monospace preserves alignment  
**Effect:** Often colored with comets-* tokens

```
Example:
.412  |  28 HR  |  1.240 OPS
```

**Purpose:** Terminal/scoreboard aesthetic for data displays

---

## Color System

### Primary Palette
```
comets-cyan:    #00F3FF  ← Electric blue, primary accent
comets-yellow:  #F4D03F  ← Gold, winner highlights
comets-red:     #FF4D4D  ← Bright red, danger/batting
comets-purple:  #BD00FF  ← Vivid purple, special states
comets-blue:    #2E86DE  ← Deep blue, supporting
```

### Background Layers
```
background:   #050505  ← Near-black base
surface-dark: #0a0a0a  ← Card backgrounds
white/5:      rgba(255,255,255,0.05)  ← Subtle borders
white/10:     rgba(255,255,255,0.10)  ← Hover states
```

### Usage Patterns

**Cosmic Blur Orbs:**
```typescript
<div className="absolute top-1/4 left-1/4 
                w-[600px] h-[600px] 
                bg-comets-cyan/10 
                blur-[120px] 
                rounded-full 
                animate-pulse-slow" />
```

**Neon Borders:**
```typescript
<div className="border-2 border-comets-cyan/50" />
<div className="border border-white/10 
                hover:border-comets-yellow/50" />
```

**Gradient Text:**
```typescript
<span className="bg-gradient-to-b 
                 from-white to-white/50 
                 bg-clip-text text-transparent" />
```

---

## Motion Language

### Spring Physics (Primary)
**All interactions use spring-type transitions:**
```typescript
transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
```

**Button Press Feel:**
```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

**Rotate on Hover (Icons):**
```typescript
whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
```

### Layout Animations
**Smooth category switching:**
```typescript
<motion.div
  layoutId="categoryBg"
  className="absolute inset-0 bg-comets-yellow"
  transition={{ type: "spring", bounce: 0.2 }}
/>
```

### Stagger Reveals
**Sequential list animations:**
```typescript
{items.map((item, idx) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1 }}
  >
))}
```

### Page Load Sequence
1. **Header** (0s) - Fades in from above
2. **Category Toggle** (0.4s) - Scales in
3. **Content Grid** (0.6s+) - Staggered reveals

---

## Geometric Shapes

### Rounded Corners Hierarchy
```
rounded-full  → Pills, badges, circles (9999px)
rounded-lg    → Cards, containers (8px)
rounded-md    → Buttons, small elements (6px)
rounded-sm    → Inputs, minimal radius (2px)
```

### Card Anatomy
```
┌─────────────────────────────────┐
│ [Scanlines overlay - opacity 5%] │
│                                  │
│  ┌──────┐                       │
│  │ Icon │  Title                │
│  └──────┘                       │
│                                  │
│  Content area                   │
│  with padding                   │
│                                  │
└─────────────────────────────────┘
  Border: white/10 → hover: white/30
  Background: surface-dark
```

### Badge Design
```
┌─────────┐
│  ● 1st  │  ← Yellow circle + bold number
└─────────┘
  rounded-full, px-6 py-2
  Border matches ranking (1st=yellow, 2nd=white/20, 3rd=white/10)
```

---

## Diegetic Elements

### Scanlines Overlay
**Creates CRT monitor effect:**
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
```

**Applied to all cards:**
```typescript
<div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />
```

### Cosmic Backgrounds
**Animated blur orbs create depth:**
- Positioned absolutely
- 500px-700px diameter
- 100px-120px blur
- 10% opacity
- Slow pulse animation
- Different colors per page

### HUD-Style Displays
**Stats presented like game overlays:**
```
┌─────────────┐
│  AVG  │ .412 │  ← Label + colored number
└─────────────┘
  Monospace font, colored box
```

---

## Component Patterns

### Leader Podium Card
```
┌─────────────────────────────────┐
│ Icon  STAT NAME         TOP 3   │
├─────────────────────────────────┤
│ [●1]  Mario    Fireballs  .412  │
│ [○2]  Luigi    Knights    .305  │
│ [○3]  Peach    Monarchs   .280  │
└─────────────────────────────────┘
  1st = Yellow badge
  Value in colored pill (cyan)
  Hover: scale 1.02, shift right 4px
```

### Matchup Card (Bracket)
```
┌─────────────────────────────────┐
│               SEMIFINAL        ⚔│
├─────────────────────────────────┤
│ MAR  Mario Fireballs        [3] │ ← Winner: yellow bg
│ LUI  Luigi Knights          [1] │
├─────────────────────────────────┤
│ ▼ Game 1: 5-3                  │
│ ▼ Game 2: 2-8                  │
│ ▼ Game 3: 7-4                  │
│ ▼ Game 4: 6-2                  │
└─────────────────────────────────┘
  Click to expand games
  Crown icon on winner
  Team color borders
```

### Player Selection Pill
```
┌──────────────────┐
│ ●  MARIO      ✕ │  ← Dot color matches team
└──────────────────┘
  Border color: player.color
  Hover: scale 1.05
  X button: rotate 90° on hover
  Remove animation: scale 0
```

### Attribute Bar
```
MARIO    ████████████████░░░░  92
         └─────────────────────┘
         Animated fill (1s duration)
         Shimmer effect on fill
         Max value gets yellow ring
```

---

## Interaction States

### Hover States
- **Cards**: border white/10 → white/30, scale 1.02
- **Buttons**: scale 1.05, brightness increase
- **Icons**: rotate wiggle [0,-5,5,0], scale 1.1
- **Pills**: scale 1.05, border glow

### Active States
- **Tabs**: Background moves with layoutId animation
- **Toggles**: Spring transition between states
- **Selected**: Border becomes player/team color

### Focus States
- **Keyboard nav**: focus-arcade utility (cyan outline)
- **Touch targets**: Minimum 44px height
- **Visible indicators**: All interactive elements

---

## Spacing System

### Padding Scale
```
p-2   8px   ← Tight, pills
p-4   16px  ← Default, small cards
p-6   24px  ← Standard, main cards
p-8   32px  ← Generous, hero sections
p-12  48px  ← Large, page sections
```

### Gap Scale
```
gap-2   8px   ← Tight lists
gap-3   12px  ← Button groups
gap-4   16px  ← Card grids
gap-6   24px  ← Section spacing
gap-12  48px  ← Page sections
```

### Margin Scale
```
mb-4   16px  ← Small spacing
mb-8   32px  ← Medium spacing
mb-12  48px  ← Large spacing
mb-16  64px  ← Section breaks
```

---

## Page-Specific Aesthetics

### Leaders Page
- **Blur Orbs**: Cyan (top) + Yellow (bottom)
- **Primary Color**: Cyan (category toggle)
- **Card Grid**: 1/2/3 columns responsive
- **Special**: Rank badges (1st=yellow circle)

### Playoffs Page
- **Blur Orbs**: Red (right) + Yellow (left)
- **Primary Color**: Red (championship theme)
- **Layout**: 2-column bracket structure
- **Special**: Crown icons on winners

### Attributes Page
- **Blur Orbs**: Purple (left) + Cyan (right)
- **Primary Color**: Purple (analysis theme)
- **Visual**: Horizontal animated bars
- **Special**: Shimmer effect on bar fills

### Stats Page
- **Blur Orbs**: Cyan (right) + Red (left)
- **Primary Color**: Cyan (stats theme)
- **Layout**: Dynamic grid (2-4 columns)
- **Special**: Color-coded player cards

---

## Responsive Breakpoints

### Mobile (< 768px)
- Title: `text-6xl` (96px)
- Single column grids
- Stacked player pills
- Full-width cards

### Tablet (768px - 1024px)
- Title: `text-7xl` (112px)
- 2-column grids
- Wrapped player pills
- Comfortable card sizes

### Desktop (> 1024px)
- Title: `text-8xl` (128px)
- 3-4 column grids
- Inline player pills
- Maximum visual impact

---

## Animation Performance

### GPU-Accelerated Properties
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur on background only)

### Avoided Properties
- `width`/`height` (causes reflow)
- `left`/`top` (causes reflow)
- `margin` (causes reflow)

### Budget Per Page
- Max 15 animated elements visible at once
- Stagger reveals capped at 1 second total
- Spring physics with reasonable stiffness (200-400)
- Only cosmic orbs use infinite animation

---

## Accessibility Features

### Keyboard Navigation
- All buttons/links focusable
- Tab order logical (top to bottom)
- Enter/Space activates buttons
- Escape closes modals/dropdowns

### Focus Indicators
```typescript
className="focus-arcade"  // Cyan outline on focus
```

### Color Contrast
- White text on #050505: 21:1 ratio (WCAG AAA)
- Cyan #00F3FF on black: 15:1 ratio (WCAG AAA)
- All text meets WCAG AA minimum (4.5:1)

### Screen Reader Support
- Semantic HTML (header, main, nav)
- ARIA labels on icon-only buttons
- Meaningful link text
- Proper heading hierarchy (h1 → h2 → h3)

---

## Implementation Checklist

When reviewing a page, verify:

- [ ] Massive display typography (text-6xl+)
- [ ] Cosmic blur orbs in background
- [ ] Spring physics on all interactions
- [ ] Scanlines on all cards
- [ ] Uppercase tracking-widest UI text
- [ ] Monospace colored numbers
- [ ] Stagger animation delays
- [ ] Layout animations with layoutId
- [ ] Near-black background (#050505)
- [ ] Comets-* color tokens used
- [ ] Responsive breakpoints working
- [ ] Keyboard navigation functional
- [ ] Hover states satisfying
- [ ] Focus indicators visible

---

**Design System:** Neon Void Arcade  
**Inspiration:** Mario Strikers Battle League  
**Philosophy:** Diegetic sports game interface  
**Status:** Production Ready

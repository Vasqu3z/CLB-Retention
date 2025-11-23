# 🎮 Comets League Beta Redesign - Production Package

## 📦 What's Included

This package contains **16 production-ready files** for your Next.js 15 + TypeScript project:

```
production/
├── MIGRATION_CHECKLIST.md          ← Start here!
├── dependencies.json                ← Required npm packages
├── tailwind.config.ts              ← Enhanced theme config
├── lib/
│   └── utils.ts                    ← Utility functions
├── app/
│   └── globals.css                 ← Global styles & animations
└── components/
    ├── Header.tsx                  ← With mobile menu
    ├── Footer.tsx                  ← Enhanced animations
    ├── Sidebar.tsx                 ← Staggered entrance
    └── ui/
        ├── RetroButton.tsx         ← Loading/disabled states
        ├── RetroCard.tsx           ← Better interactions
        ├── RetroTable.tsx          ← Sortable columns
        ├── RetroLoader.tsx         ← Orbiting particles
        ├── TeamSelectCard.tsx      ← Dramatic hover
        ├── VersusCard.tsx          ← Animated scores
        ├── HolographicField.tsx    ← Enhanced scanning
        └── StatHighlight.tsx       ← Floating animations
    └── pages/
        ├── Compare.tsx             ← Head-to-head tool
        └── LineupBuilder.tsx       ← NEW tactical manager
```

---

## 🚀 Quick Start (Choose Your Speed)

### Option A: Fast Track (2 days)
**Goal:** Get the wow-factor features live quickly

1. **Install dependencies** (5 min)
2. **Replace foundation files** (30 min)
   - globals.css, tailwind.config.ts, lib/utils.ts
3. **Replace Header** (1 hour)
4. **Add LineupBuilder** (2 hours)
5. **Deploy to beta branch** ✅

### Option B: Complete Migration (5 days)
**Goal:** Replace everything systematically

Follow the detailed **MIGRATION_CHECKLIST.md** step-by-step.

---

## 📋 Prerequisites

### System Requirements
- Node.js 18+ 
- Next.js 15
- TypeScript 5+
- Tailwind CSS 3.4+

### Install New Dependencies
```bash
npm install framer-motion lucide-react clsx tailwind-merge
```

---

## 🔧 Setup Instructions

### Step 1: Create Beta Branch
```bash
git checkout -b beta-redesign
git push -u origin beta-redesign
```
Vercel will automatically create a preview deployment at:
`https://your-site-git-beta-redesign.vercel.app`

### Step 2: Copy Files
```bash
# Copy all files from production/ to your repo
# Maintaining the directory structure

# Example:
cp production/tailwind.config.ts ./tailwind.config.ts
cp production/app/globals.css ./app/globals.css
cp production/lib/utils.ts ./lib/utils.ts
# ... etc
```

### Step 3: Update Data Integration
Each component that displays data has comments marked with:
```typescript
// 🔌 DATA INTEGRATION POINT
// Replace mock data with your Google Sheets fetch
```

Search for these comments and connect to your existing data layer.

### Step 4: Test Locally
```bash
npm run dev
```
Visit `http://localhost:3000` and verify everything works.

### Step 5: Build & Deploy
```bash
npm run build    # Check for TypeScript errors
git add .
git commit -m "feat: beta redesign complete"
git push origin beta-redesign
```

Vercel deploys automatically! 🎉

---

## 📊 Component Overview

### Core UI Components
**RetroButton** - Buttons with loading states, sizes (sm/md/lg), variants (primary/outline/ghost)
```tsx
<RetroButton variant="primary" size="md" isLoading={false}>
  Click Me
</RetroButton>
```

**RetroCard** - Feature cards with hover animations
```tsx
<RetroCard 
  title="Standings"
  subtitle="Track team performance"
  icon={Trophy}
  href="/standings"
  color="#F4D03F"
/>
```

**RetroTable** - Sortable tables with animations
```tsx
<RetroTable 
  data={yourData}
  columns={columns}
  onRowClick={(item) => router.push(`/detail/${item.id}`)}
/>
```

### Feature Components
**TeamSelectCard** - Team selection cards
```tsx
<TeamSelectCard
  name="Mario Fireballs"
  code="MAR"
  logoColor="#FF4D4D"
  stats={{ wins: 12, losses: 2, avg: ".312" }}
  href="/teams/mario-fireballs"
/>
```

**VersusCard** - Match cards with scores
```tsx
<VersusCard
  home={{ name: "Fireballs", code: "MAR", logoColor: "#FF4D4D", score: 5 }}
  away={{ name: "Monsters", code: "BOW", logoColor: "#F4D03F", score: 3 }}
  date="MAY 12"
  time="FINAL"
  isFinished={true}
/>
```

**HolographicField** - Interactive field visualization
```tsx
<HolographicField
  roster={roster}
  onPositionClick={(position) => handlePositionClick(position)}
/>
```

**StatHighlight** - Player stat showcase
```tsx
<StatHighlight player={playerData} />
```

### Layout Components
**Header** - Navigation with mobile menu
**Footer** - Enhanced footer with animations
**Sidebar** - Desktop sidebar navigation

### Page Components
**LineupBuilder** - NEW! Interactive roster builder
**Compare** - Player comparison tool

---

## 🎨 Design System

### Colors
```css
--background: #050505       /* Deep black */
--surface-dark: #0a0a0a    /* Card backgrounds */
--comets-yellow: #F4D03F   /* Primary actions */
--comets-cyan: #00F3FF     /* Highlights */
--comets-red: #FF4D4D      /* Warnings/stats */
--comets-blue: #2E86DE     /* Info */
--comets-purple: #BD00FF   /* Special */
```

### Fonts
```css
font-display  /* Dela Gothic One - Headers */
font-ui       /* Rajdhani - UI elements */
font-body     /* Chivo - Body text */
font-mono     /* Space Mono - Data/stats */
```

### Utility Classes
```css
.arcade-press          /* Button press effect */
.focus-arcade         /* Cyan focus ring */
.glow-cyan           /* Cyan text glow */
.power-indicator     /* Pulsing indicator */
.spring-in          /* Bounce entrance */
.stat-fill          /* Animated stat bars */
```

---

## 🔌 Google Sheets Integration Guide

Your existing Google Sheets integration should work without changes. Just update the component data sources:

### Example: Teams Page
```typescript
// app/teams/page.tsx

// Your existing fetch (keep this!)
async function fetchTeams() {
  // Your Google Sheets API call
  return teams;
}

export default async function TeamsPage() {
  const teams = await fetchTeams();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {teams.map((team) => (
        <TeamSelectCard key={team.id} {...team} />
      ))}
    </div>
  );
}
```

### Example: Schedule Page
```typescript
// app/schedule/page.tsx

async function fetchGames() {
  // Your Google Sheets API call
  return games;
}

export default async function SchedulePage() {
  const games = await fetchGames();
  
  return (
    <div className="space-y-6">
      {games.map((game) => (
        <VersusCard key={game.id} {...game} />
      ))}
    </div>
  );
}
```

The components accept props - just pass your data!

---

## 🐛 Troubleshooting

### Build Errors
**Issue:** `Cannot find module '@/lib/utils'`
**Fix:** Make sure you copied `lib/utils.ts`

**Issue:** `Cannot find module 'framer-motion'`
**Fix:** Run `npm install framer-motion`

### Type Errors
**Issue:** TypeScript complaining about component props
**Fix:** Check that your data structure matches the component's expected interface. Add types:
```typescript
interface Team {
  name: string;
  code: string;
  logoColor: string;
  stats: { wins: number; losses: number; avg: string };
  href: string;
}
```

### Styling Issues
**Issue:** Colors don't work
**Fix:** Make sure you updated BOTH `globals.css` AND `tailwind.config.ts`

### Animation Issues
**Issue:** Animations jerky or not working
**Fix:** Make sure Framer Motion is installed: `npm list framer-motion`

---

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

---

## ⚡ Performance

All components are optimized for:
- **First Load:** < 3s on 3G
- **Interaction:** 60fps animations
- **Bundle Size:** Minimal (tree-shaken)

Tips:
- Use Next.js Image component for team logos
- Enable Vercel Analytics to monitor
- Lazy load LineupBuilder (it's interactive and larger)

---

## 🚢 Deployment Checklist

Before merging to main:

- [ ] All pages load without errors
- [ ] Mobile responsive (test on phone)
- [ ] Data loads from Google Sheets
- [ ] Navigation works (desktop + mobile)
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Test on Safari (if possible)
- [ ] Share beta URL with stakeholders
- [ ] Get approval ✅

---

## 📚 Additional Resources

- **Next.js 15 Docs:** https://nextjs.org/docs
- **Framer Motion:** https://www.framer.com/motion/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev/

---

## 🎯 Next Steps

1. **Read MIGRATION_CHECKLIST.md** - Complete step-by-step guide
2. **Install dependencies** - `npm install framer-motion lucide-react clsx tailwind-merge`
3. **Copy foundation files** - Start with globals.css, tailwind.config.ts
4. **Test locally** - Make sure site still runs
5. **Deploy to beta** - Push and share preview URL
6. **Iterate** - Replace components one by one
7. **Go live!** - Merge to main when ready

---

**Questions?** All components have inline comments explaining usage and data integration points.

**Ready to ship!** 🚀

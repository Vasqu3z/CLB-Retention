# 🎮 Quick Reference - Component Usage

## 🎯 At a Glance

**Total Files:** 16
**Estimated Time:** 3-5 days for full migration
**Fastest Path:** 2 days for core features

---

## 📦 Installation (One Command)

```bash
npm install framer-motion lucide-react clsx tailwind-merge
```

---

## 🗂️ File Structure in Your Repo

```
your-repo/
├── tailwind.config.ts          ← REPLACE
├── lib/
│   └── utils.ts                ← ADD (if missing)
├── app/
│   ├── globals.css             ← REPLACE
│   ├── tools/
│   │   ├── lineup/
│   │   │   └── page.tsx        ← ADD (new page)
│   │   └── compare/
│   │       └── page.tsx        ← UPDATE
├── components/
│   ├── Header.tsx              ← REPLACE
│   ├── Footer.tsx              ← REPLACE
│   ├── Sidebar.tsx             ← REPLACE
│   └── ui/
│       ├── RetroButton.tsx     ← REPLACE
│       ├── RetroCard.tsx       ← REPLACE
│       ├── RetroTable.tsx      ← REPLACE
│       ├── RetroLoader.tsx     ← REPLACE
│       ├── TeamSelectCard.tsx  ← REPLACE
│       ├── VersusCard.tsx      ← REPLACE
│       ├── HolographicField.tsx ← ADD
│       └── StatHighlight.tsx   ← REPLACE
```

---

## 🔥 Fastest Implementation (2 hours)

Want immediate visual impact? Do this:

### 1. Foundation (15 min)
```bash
cp production/tailwind.config.ts ./
cp production/app/globals.css ./app/
cp production/lib/utils.ts ./lib/
npm run dev  # Test - should work!
```

### 2. Header (30 min)
```bash
cp production/components/Header.tsx ./components/
# Update nav links to match your routes
npm run dev  # You now have mobile menu!
```

### 3. Cards (45 min)
```bash
cp production/components/ui/TeamSelectCard.tsx ./components/ui/
cp production/components/ui/VersusCard.tsx ./components/ui/
cp production/components/ui/RetroCard.tsx ./components/ui/
# Update data sources
npm run dev  # Cards look amazing!
```

### 4. Deploy (30 min)
```bash
git add .
git commit -m "feat: visual upgrade"
git push origin beta-redesign
# Vercel auto-deploys ✅
```

**Result:** Your site looks 10x better in 2 hours!

---

## 🎨 Common Patterns

### Pattern 1: Fetch & Display Teams
```typescript
// app/teams/page.tsx
import TeamSelectCard from "@/components/ui/TeamSelectCard";

export default async function TeamsPage() {
  const teams = await fetchFromGoogleSheets(); // Your function
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {teams.map(team => (
        <TeamSelectCard key={team.id} {...team} />
      ))}
    </div>
  );
}
```

### Pattern 2: Fetch & Display Games
```typescript
// app/schedule/page.tsx
import VersusCard from "@/components/ui/VersusCard";

export default async function SchedulePage() {
  const games = await fetchGamesFromSheets(); // Your function
  
  return (
    <div className="space-y-4">
      {games.map(game => (
        <VersusCard key={game.id} {...game} />
      ))}
    </div>
  );
}
```

### Pattern 3: Sortable Table
```typescript
// app/standings/page.tsx
import RetroTable from "@/components/ui/RetroTable";

export default async function StandingsPage() {
  const standings = await fetchStandingsFromSheets();
  
  const columns = [
    { header: "Team", accessorKey: "name", sortable: true },
    { header: "W", accessorKey: "wins", sortable: true },
    { header: "L", accessorKey: "losses", sortable: true },
    // ... more columns
  ];
  
  return <RetroTable data={standings} columns={columns} />;
}
```

### Pattern 4: Loading State
```typescript
import RetroLoader from "@/components/ui/RetroLoader";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<RetroLoader />}>
      <YourContent />
    </Suspense>
  );
}
```

---

## 🔌 Data Integration Cheatsheet

Your Google Sheets data → Component props mapping:

### TeamSelectCard
```typescript
// Your Sheets data:
{ name, code, logoColor, wins, losses, avg }

// Maps to:
<TeamSelectCard
  name={team.name}
  code={team.code}
  logoColor={team.logoColor}
  stats={{ wins: team.wins, losses: team.losses, avg: team.avg }}
  href={`/teams/${team.slug}`}
/>
```

### VersusCard
```typescript
// Your Sheets data:
{ homeTeam, awayTeam, homeScore, awayScore, date, time, isFinished }

// Maps to:
<VersusCard
  home={{ 
    name: game.homeTeam.name, 
    code: game.homeTeam.code,
    logoColor: game.homeTeam.color,
    score: game.homeScore 
  }}
  away={{ 
    name: game.awayTeam.name, 
    code: game.awayTeam.code,
    logoColor: game.awayTeam.color,
    score: game.awayScore 
  }}
  date={game.date}
  time={game.time}
  isFinished={game.isFinished}
/>
```

### RetroTable
```typescript
// Your Sheets data: array of objects
const data = [ { name: "Mario", team: "Fireballs", avg: ".412" }, ... ];

// Define columns:
const columns = [
  { header: "Player", accessorKey: "name" },
  { header: "Team", accessorKey: "team" },
  { header: "AVG", accessorKey: "avg", sortable: true }
];

// Render:
<RetroTable data={data} columns={columns} />
```

---

## ⚡ Power User Tips

### Tip 1: Use TypeScript Interfaces
```typescript
// types/index.ts
export interface Team {
  name: string;
  code: string;
  logoColor: string;
  stats: { wins: number; losses: number; avg: string };
  href: string;
}
```

### Tip 2: Create Data Adapters
```typescript
// lib/adapters.ts
export function adaptSheetToTeamCard(sheetRow: any): Team {
  return {
    name: sheetRow.team_name,
    code: sheetRow.team_code,
    logoColor: sheetRow.primary_color,
    stats: {
      wins: parseInt(sheetRow.wins),
      losses: parseInt(sheetRow.losses),
      avg: sheetRow.batting_avg
    },
    href: `/teams/${sheetRow.slug}`
  };
}
```

### Tip 3: Reusable Fetch Function
```typescript
// lib/sheets.ts
export async function fetchSheet(sheetName: string) {
  // Your Google Sheets API logic
  const data = await fetch(/* ... */);
  return data;
}
```

### Tip 4: Loading States
```typescript
"use client";
import { useState, useEffect } from "react";
import RetroLoader from "@/components/ui/RetroLoader";

export default function ClientComponent() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData().then(() => setLoading(false));
  }, []);
  
  if (loading) return <RetroLoader />;
  return <YourContent />;
}
```

---

## 🚨 Common Gotchas

### Gotcha 1: Missing Path Alias
**Error:** `Cannot find module '@/components/...'`
**Fix:** Check `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Gotcha 2: CSS Variables Not Working
**Error:** Colors show as text like `var(--comets-yellow)`
**Fix:** Make sure you replaced `globals.css` with the new version that defines `:root` variables

### Gotcha 3: Framer Motion Errors
**Error:** `Property 'whileHover' does not exist on type...`
**Fix:** Import from framer-motion: `import { motion } from "framer-motion"`

### Gotcha 4: Build Fails Locally But Not in Dev
**Fix:** Run `npm run build` to catch TypeScript errors before deploying

---

## 📱 Mobile Testing Checklist

- [ ] Mobile menu opens/closes
- [ ] Cards are tappable (not just hoverable)
- [ ] Tables scroll horizontally
- [ ] Text is readable (16px minimum)
- [ ] Buttons are finger-sized (44px minimum)
- [ ] Forms work on mobile keyboards

---

## 🎯 Success Metrics

After migration, you should see:
- ✅ Mobile menu working
- ✅ Smooth animations (60fps)
- ✅ All data loading from Google Sheets
- ✅ No console errors
- ✅ TypeScript builds successfully
- ✅ Responsive on mobile/tablet/desktop
- ✅ Fast page loads (< 3s)

---

## 📞 Quick Help

**Issue:** Something not working?
**Solution:** 
1. Check the component file - has inline comments
2. Check MIGRATION_CHECKLIST.md
3. Check README.md troubleshooting section
4. Run `npm run build` to see TypeScript errors

**Issue:** Need to rollback?
**Solution:**
```bash
git checkout main
git branch -D beta-redesign
# Start fresh
```

---

## ✅ Daily Checklist

**Day 1:**
- [ ] Install dependencies
- [ ] Replace globals.css
- [ ] Replace tailwind.config.ts
- [ ] Add lib/utils.ts
- [ ] Test: `npm run dev` works

**Day 2:**
- [ ] Replace Header.tsx
- [ ] Replace RetroButton.tsx
- [ ] Replace RetroCard.tsx
- [ ] Test: Navigation works

**Day 3:**
- [ ] Replace TeamSelectCard.tsx
- [ ] Replace VersusCard.tsx
- [ ] Hook up Google Sheets data
- [ ] Test: Data displays correctly

**Day 4:**
- [ ] Add LineupBuilder page
- [ ] Add HolographicField component
- [ ] Test: Interactive features work

**Day 5:**
- [ ] Final testing
- [ ] Build: `npm run build`
- [ ] Deploy beta
- [ ] Get feedback

---

**Remember:** You can do this incrementally. Every file you replace makes the site better! 🚀

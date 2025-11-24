# 🎮 Comets League Beta Redesign - Migration Checklist

## ⚡ Quick Start (30 minutes)

### Prerequisites
```bash
# 1. Create beta branch
git checkout -b beta-redesign
git push -u origin beta-redesign

# 2. Install dependencies (if needed)
npm install framer-motion lucide-react clsx tailwind-merge

# 3. Verify Vercel preview deployment works
# Vercel will auto-deploy your beta branch to: your-site-beta-redesign.vercel.app
```

---

## 📋 DAY 1: Foundation (2-3 hours)

### Phase 1A: Global Styles ✅
- [ ] **Backup current files first!**
  ```bash
  cp app/globals.css app/globals.css.backup
  cp tailwind.config.ts tailwind.config.ts.backup
  ```
- [ ] Replace `app/globals.css` with new version
- [ ] Replace `tailwind.config.ts` with new version
- [ ] Test: `npm run dev` - site should still work, just with new colors
- [ ] Commit: `git commit -m "feat: upgrade global styles and tailwind config"`

### Phase 1B: Utils (5 minutes)
- [ ] Check if `lib/utils.ts` exists and has `cn()` function
- [ ] If not, create it (file provided below)
- [ ] Commit: `git commit -m "feat: add cn utility function"`

**Test Checkpoint:** Site runs without errors, colors might look different but everything functional.

---

## 📋 DAY 2: Core UI Components (4-5 hours)

### Phase 2A: Button Component
- [ ] Backup: `cp components/ui/RetroButton.tsx components/ui/RetroButton.tsx.backup` (if exists)
- [ ] Replace `components/ui/RetroButton.tsx` with new version
- [ ] Find/replace old button imports across codebase
- [ ] Test all buttons still work
- [ ] Commit: `git commit -m "feat: upgrade RetroButton component"`

### Phase 2B: Card Components
- [ ] Replace `components/ui/RetroCard.tsx`
- [ ] Test homepage cards (if they exist)
- [ ] Commit: `git commit -m "feat: upgrade RetroCard component"`

### Phase 2C: Table Component
- [ ] Replace `components/ui/RetroTable.tsx`
- [ ] **IMPORTANT:** Update data prop interface to match your Google Sheets data structure
- [ ] Test any existing tables
- [ ] Commit: `git commit -m "feat: upgrade RetroTable with sorting"`

### Phase 2D: Loader Component
- [ ] Replace `components/ui/RetroLoader.tsx`
- [ ] Test loading states
- [ ] Commit: `git commit -m "feat: upgrade RetroLoader component"`

**Test Checkpoint:** All existing pages still work, buttons/cards/tables look better.

---

## 📋 DAY 3: Layout Components (4-5 hours)

### Phase 3A: Header
- [ ] Replace `components/Header.tsx` 
- [ ] **IMPORTANT:** Update navigation links to match your routes
- [ ] Test mobile menu works
- [ ] Test desktop navigation
- [ ] Commit: `git commit -m "feat: upgrade Header with mobile menu"`

### Phase 3B: Footer
- [ ] Replace `components/Footer.tsx`
- [ ] Update footer links to match your routes
- [ ] Test all links work
- [ ] Commit: `git commit -m "feat: upgrade Footer animations"`

### Phase 3C: Sidebar (if you use it)
- [ ] Replace `components/Sidebar.tsx`
- [ ] Update sidebar links to match your routes
- [ ] Test navigation
- [ ] Commit: `git commit -m "feat: upgrade Sidebar animations"`

**Test Checkpoint:** Site navigation works perfectly, mobile menu functions.

---

## 📋 DAY 4: Feature Components (3-4 hours)

### Phase 4A: Team Components
- [ ] Replace `components/ui/TeamSelectCard.tsx`
- [ ] **DATA HOOK:** Update to pull from your Google Sheets team data
- [ ] Test teams page
- [ ] Commit: `git commit -m "feat: upgrade TeamSelectCard"`

### Phase 4B: Game Components
- [ ] Replace `components/ui/VersusCard.tsx`
- [ ] **DATA HOOK:** Update to pull from your Google Sheets game data
- [ ] Test schedule page
- [ ] Commit: `git commit -m "feat: upgrade VersusCard"`

### Phase 4C: Field Component
- [ ] Replace `components/ui/HolographicField.tsx`
- [ ] Will be used in LineupBuilder (next phase)
- [ ] Commit: `git commit -m "feat: add HolographicField component"`

### Phase 4D: Stat Components
- [ ] Replace `components/ui/StatHighlight.tsx`
- [ ] **DATA HOOK:** Update to pull player stats from Google Sheets
- [ ] Test on player profile or homepage
- [ ] Commit: `git commit -m "feat: upgrade StatHighlight"`

**Test Checkpoint:** All data displays correctly with new designs.

---

## 📋 DAY 5: New Feature Pages (2-3 hours)

### Phase 5A: Lineup Builder (NEW!)
- [ ] Create `app/tools/lineup/page.tsx`
- [ ] Copy LineupBuilder component
- [ ] **DATA HOOK:** Fetch available players from Google Sheets
- [ ] Add route to navigation
- [ ] Test full functionality
- [ ] Commit: `git commit -m "feat: add LineupBuilder tool page"`

### Phase 5B: Compare Page
- [ ] Update `app/tools/compare/page.tsx` (or create if new)
- [ ] Copy Compare component
- [ ] **DATA HOOK:** Add player selection UI connected to Google Sheets
- [ ] Test head-to-head comparison
- [ ] Commit: `git commit -m "feat: upgrade Compare page"`

**Test Checkpoint:** New tools work and are accessible.

---

## 🚀 DEPLOYMENT

### Pre-Deploy Checklist
- [ ] All pages load without errors
- [ ] Mobile responsive on all pages
- [ ] Navigation works (desktop + mobile)
- [ ] Data loads from Google Sheets correctly
- [ ] Animations don't cause performance issues
- [ ] TypeScript builds with no errors: `npm run build`
- [ ] All tests pass (if you have tests)

### Deploy to Beta
```bash
# Push to beta branch
git push origin beta-redesign

# Vercel will auto-deploy
# Share beta URL with stakeholders: your-site-beta-redesign.vercel.app
```

### Go Live
```bash
# When ready, merge to main
git checkout main
git merge beta-redesign
git push origin main

# Vercel auto-deploys to production
```

---

## 🔧 DATA INTEGRATION POINTS

You'll need to update these components to fetch from Google Sheets:

### **TeamSelectCard** (Teams Page)
```typescript
// Current: Uses mock TEAMS array
// Update: Fetch from your Google Sheets teams data
const teams = await fetchTeamsFromSheets(); // Your existing function
```

### **VersusCard** (Schedule Page)
```typescript
// Current: Uses mock MATCHES array
// Update: Fetch from your Google Sheets games/schedule data
const games = await fetchGamesFromSheets(); // Your existing function
```

### **StatHighlight** (Player Profiles)
```typescript
// Current: Hardcoded Mario stats
// Update: Pass player data as props
<StatHighlight player={playerData} />
```

### **LineupBuilder** (NEW)
```typescript
// Current: Uses mock AVAILABLE_PLAYERS array
// Update: Fetch all players from Google Sheets
const players = await fetchAllPlayersFromSheets();
```

### **RetroTable** (Standings, Stats Pages)
```typescript
// Already accepts data prop - just pass your Google Sheets data
<RetroTable data={standingsData} columns={columns} />
```

---

## 🆘 TROUBLESHOOTING

### Issue: "Module not found: Can't resolve '@/lib/utils'"
**Fix:** Create `lib/utils.ts` (provided in production files)

### Issue: "Module not found: Can't resolve 'framer-motion'"
**Fix:** `npm install framer-motion`

### Issue: Colors look wrong
**Fix:** Make sure you replaced both `globals.css` AND `tailwind.config.ts`

### Issue: TypeScript errors in components
**Fix:** Make sure your `tsconfig.json` has path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: Build fails
**Fix:** Run `npm run build` locally first, fix errors before deploying

### Issue: Data not loading
**Fix:** Check your Google Sheets API functions are still being called correctly

---

## 📊 PROGRESS TRACKER

**Foundation:**
- [ ] globals.css
- [ ] tailwind.config.ts
- [ ] lib/utils.ts

**Core UI (6 components):**
- [ ] RetroButton.tsx
- [ ] RetroCard.tsx
- [ ] RetroTable.tsx
- [ ] RetroLoader.tsx
- [ ] TeamSelectCard.tsx
- [ ] VersusCard.tsx

**Layout (3 components):**
- [ ] Header.tsx
- [ ] Footer.tsx
- [ ] Sidebar.tsx

**Feature (4 components):**
- [ ] HolographicField.tsx
- [ ] StatHighlight.tsx
- [ ] Compare.tsx
- [ ] LineupBuilder.tsx (NEW)

**TOTAL: 16 files to update/create**

---

## 🎯 FASTEST PATH (If Pressed for Time)

Want to see immediate impact? Do this order:

1. **Day 1 Morning:** globals.css + tailwind.config.ts (1 hour)
2. **Day 1 Afternoon:** Header.tsx with mobile menu (2 hours)
3. **Day 2:** All card components (TeamSelectCard, VersusCard, RetroCard) (3 hours)
4. **Day 3:** LineupBuilder as new showpiece feature (3 hours)
5. **Deploy beta** - you now have visible improvement + new feature

Then finish remaining components over following week.

---

## 📞 SUPPORT

If you hit any issues during migration:
- Check the troubleshooting section above
- Each component file has comments explaining data integration
- TypeScript will catch most import/type issues during development

---

**READY TO START?**
Begin with Day 1 Phase 1A (backup and replace globals.css)

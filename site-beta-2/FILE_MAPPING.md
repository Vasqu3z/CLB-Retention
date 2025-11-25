# File Mapping Reference - Retro Migration

Quick reference for copying files from this package to your Next.js project.

---

## 📁 File Mapping

### Leaders Page
```
SOURCE → DESTINATION

leaders-page-retro.tsx → website/app/leaders/page.tsx
LeadersView-retro.tsx → website/components/views/LeadersView.tsx
```

### Playoffs Bracket Page
```
SOURCE → DESTINATION

playoffs-page-retro.tsx → website/app/playoffs/page.tsx
BracketView-retro.tsx → website/components/views/BracketView.tsx
```

### Attribute Comparison Tool
```
SOURCE → DESTINATION

tools-attributes-page-retro.tsx → website/app/tools/attributes/page.tsx
AttributeComparisonView-retro.tsx → website/components/views/AttributeComparisonView.tsx
```

### Stats Comparison Tool
```
SOURCE → DESTINATION

tools-stats-page-retro.tsx → website/app/tools/stats/page.tsx
StatsComparisonView-retro.tsx → website/components/views/StatsComparisonView.tsx
```

---

## 🗂️ Directory Structure

After migration, your project structure should look like:

```
website/
├── app/
│   ├── leaders/
│   │   └── page.tsx                      ← Updated
│   ├── playoffs/
│   │   └── page.tsx                      ← Updated
│   └── tools/
│       ├── attributes/
│       │   └── page.tsx                  ← Updated
│       ├── stats/
│       │   └── page.tsx                  ← Updated
│       └── lineup/
│           └── page.tsx                  ✓ Already retro
├── components/
│   ├── views/
│   │   ├── LeadersView.tsx               ← Updated
│   │   ├── BracketView.tsx               ← Updated
│   │   ├── AttributeComparisonView.tsx   ← Updated
│   │   └── StatsComparisonView.tsx       ← Updated
│   └── ui/
│       ├── RetroButton.tsx               ✓ Already exists
│       ├── RetroCard.tsx                 ✓ Already exists
│       ├── RetroTable.tsx                ✓ Already exists
│       └── [other retro components]      ✓ Already exists
└── [other directories]
```

---

## 🎯 Quick Copy Commands

```bash
# Navigate to your package directory
cd /path/to/migration-package

# Copy Leaders Page
cp leaders-page-retro.tsx ../website/app/leaders/page.tsx
cp LeadersView-retro.tsx ../website/components/views/LeadersView.tsx

# Copy Playoffs Page
cp playoffs-page-retro.tsx ../website/app/playoffs/page.tsx
cp BracketView-retro.tsx ../website/components/views/BracketView.tsx

# Copy Attribute Comparison
cp tools-attributes-page-retro.tsx ../website/app/tools/attributes/page.tsx
cp AttributeComparisonView-retro.tsx ../website/components/views/AttributeComparisonView.tsx

# Copy Stats Comparison
cp tools-stats-page-retro.tsx ../website/app/tools/stats/page.tsx
cp StatsComparisonView-retro.tsx ../website/components/views/StatsComparisonView.tsx

# Build and test
cd ../website
npm run build
```

---

## ✅ Verification

After copying, verify these files exist with retro styling:

```bash
# Check pages
ls -la website/app/leaders/page.tsx
ls -la website/app/playoffs/page.tsx
ls -la website/app/tools/attributes/page.tsx
ls -la website/app/tools/stats/page.tsx

# Check views
ls -la website/components/views/LeadersView.tsx
ls -la website/components/views/BracketView.tsx
ls -la website/components/views/AttributeComparisonView.tsx
ls -la website/components/views/StatsComparisonView.tsx

# Quick grep to verify retro elements
grep -l "arcade-cyan" website/app/leaders/page.tsx
grep -l "framer-motion" website/components/views/LeadersView.tsx
```

Expected output: All files should contain arcade color classes and framer-motion imports.

---

## 🔍 Visual Verification Checklist

After copying files, check each page in browser:

**Leaders Page (`/leaders`)**
- [ ] Neon gradient title "LEAGUE LEADERS"
- [ ] Cyan/yellow season toggle
- [ ] Arcade-style tab buttons
- [ ] Color-coded leader cards with neon borders
- [ ] Scanline effects visible
- [ ] Smooth animations on load

**Playoffs Page (`/playoffs`)**
- [ ] Yellow/red/purple gradient title
- [ ] Series cards with neon borders
- [ ] Yellow winner highlights
- [ ] Trophy icons on complete series
- [ ] Game-by-game breakdowns
- [ ] Hover effects on cards

**Attribute Comparison (`/tools/attributes`)**
- [ ] Purple/cyan gradient title
- [ ] Custom player search dropdown
- [ ] Player pills with X buttons
- [ ] Tabbed interface (Hitting/Pitching/Fielding)
- [ ] Sticky table headers
- [ ] Cyan highlighting on max values

**Stats Comparison (`/tools/stats`)**
- [ ] Cyan/yellow/red gradient title
- [ ] Season toggle working
- [ ] Custom player search
- [ ] Tab-specific table headers
- [ ] Max value highlighting
- [ ] Rate stat highlighting

---

## 🚨 Common Issues

### Issue: File not found errors
```bash
# Make sure you're in the right directory
pwd
# Should show: /path/to/migration-package

# Check file exists before copying
ls -la leaders-page-retro.tsx
```

### Issue: Permission denied
```bash
# Make destination writable
chmod u+w ../website/app/leaders/page.tsx

# Or use sudo (if needed)
sudo cp leaders-page-retro.tsx ../website/app/leaders/page.tsx
```

### Issue: Files overwritten but changes not visible
```bash
# Clear Next.js cache
cd ../website
rm -rf .next
npm run dev
```

---

## 📊 Migration Progress Tracker

Track your progress:

```
[ ] Leaders Page - Copied
[ ] Leaders Page - Build successful
[ ] Leaders Page - Tested in browser

[ ] Playoffs Page - Copied
[ ] Playoffs Page - Build successful
[ ] Playoffs Page - Tested in browser

[ ] Attribute Comparison - Copied
[ ] Attribute Comparison - Build successful
[ ] Attribute Comparison - Tested in browser

[ ] Stats Comparison - Copied
[ ] Stats Comparison - Build successful
[ ] Stats Comparison - Tested in browser

[ ] All legacy components removed
[ ] Production deployment complete
```

---

## 📝 Notes

- **Always backup** original files before overwriting
- **Test build** after each file copy
- **Check browser console** for any errors
- **Verify data loads** from Google Sheets
- **Test on mobile** for responsiveness

---

Last Updated: November 24, 2025

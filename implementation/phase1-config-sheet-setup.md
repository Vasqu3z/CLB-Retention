# Phase 1: Config Sheet & Registries Implementation Guide

## Part 1: Create Config Sheet in League Hub

### Step 1: Create the Sheet

1. Open your **League Hub** spreadsheet
2. Create a new sheet named: `⚙️ Config`
3. Set up the following structure:

**Row 1 - Headers:**
```
| Key | Value | Description |
```

**Rows 2+ - Configuration Data:**

```
| Key                           | Value                                      | Description |
|-------------------------------|--------------------------------------------|-------------|
| CURRENT_SEASON                | 6                                          | Active season number |
| SEASON_6_LEAGUE_HUB_ID        | [this spreadsheet's ID]                    | Season 6 League Hub |
| BOX_SCORE_SPREADSHEET_ID      | 17x5VoZxGV88RYAiHEcq0M-rxSyZ0fp66OktmJk2AaEU | Box Scores spreadsheet |
| DATABASE_SPREADSHEET_ID       | [your database spreadsheet ID]             | Player Database (temp, will merge) |
| DISCORD_WEBHOOK_URL           |                                            | Discord webhook for notifications |
| DISCORD_NOTIFY_GAMES          | true                                       | Post game results to Discord |
| DISCORD_NOTIFY_STANDINGS      | true                                       | Post standings updates to Discord |
| WEBSITE_URL                   | https://your-site.vercel.app               | Website URL |
| WEBSITE_REVALIDATE_URL        | https://your-site.vercel.app/api/revalidate | Cache invalidation endpoint |
| WEBSITE_REVALIDATE_SECRET     | [generate random secret]                   | Secret key for cache invalidation |
```

### Step 2: Format the Sheet

1. **Freeze row 1** (View → Freeze → 1 row)
2. **Bold the header row**
3. **Column widths:**
   - Column A (Key): 300px
   - Column B (Value): 500px
   - Column C (Description): 300px
4. **Header row background:** Light blue (#cfe2ff)
5. **Alternate row colors:** Light gray for even rows (#f8f9fa)

### Step 3: Add Data Validation (Optional)

For boolean values, add dropdown validation:
- Select cells with "true/false" values
- Data → Data validation
- Criteria: List of items: `true,false`

---

## Part 2: Create Player Registry Sheet

### Step 1: Create the Sheet

1. In **League Hub** spreadsheet
2. Create new sheet named: `📋 Player Registry`
3. Set up the following structure:

**Headers (Row 1):**
```
| Database ID | Player Name | Team | Status | Image URL | Has Attributes |
```

### Step 2: Column Descriptions

- **Database ID** (A): Name used in Database spreadsheet (for mapping)
- **Player Name** (B): Official league name (used everywhere)
- **Team** (C): Current team assignment
- **Status** (D): Active | Inactive | Free Agent | Injured
- **Image URL** (E): Player icon URL for Discord/website
- **Has Attributes** (F): Formula to check if player exists in attributes sheet

### Step 3: Add Formula in Column F

In cell F2, add this formula:
```excel
=IF(B2="","",IF(COUNTIF('Advanced Attributes'!A:A,A2)>0,"✅ Yes","❌ No"))
```

Drag down to all rows.

### Step 4: Format the Sheet

1. **Freeze row 1**
2. **Bold header row**
3. **Column widths:**
   - A (Database ID): 200px
   - B (Player Name): 200px
   - C (Team): 150px
   - D (Status): 100px
   - E (Image URL): 300px
   - F (Has Attributes): 120px
4. **Header background:** Light green (#d4edda)
5. **Conditional formatting for Status column:**
   - Active = Green background (#d4edda)
   - Inactive = Gray background (#e2e3e5)
   - Free Agent = Yellow background (#fff3cd)

### Step 5: Add Data Validation

**Column C (Status):**
- Data → Data validation
- List of items: `Active,Inactive,Free Agent,Injured`

---

## Part 3: Create Team Registry Sheet

### Step 1: Create the Sheet

1. In **League Hub** spreadsheet
2. Create new sheet named: `📋 Team Registry`
3. Set up the following structure:

**Headers (Row 1):**
```
| Team Name | In-Game Captain | Abbreviation | Status | Color | Logo URL | Emblem URL | Discord Role ID |
```

### Step 2: Column Descriptions

- **Team Name** (A): Official team name
- **In-Game Captain** (B): Team captain character
- **Abbreviation** (C): 2-3 letter code (FF, BB, etc.)
- **Status** (D): Active | Inactive | Eliminated
- **Color** (E): Hex color code (#FF0000)
- **Logo URL** (F): Full team logo URL
- **Emblem URL** (G): Simplified emblem URL (for tables)
- **Discord Role ID** (H): Discord role ID for @mentions (optional)

### Step 3: Example Data

```
| Fire Flowers  | Mario       | FF  | Active | #FF0000 | https://... | https://... | 123456789 |
| Banana Bunch  | Donkey Kong | BB  | Active | #FFFF00 | https://... | https://... | 987654321 |
| Shell Shockers| Bowser      | SS  | Active | #00FF00 | https://... | https://... | 555555555 |
```

### Step 4: Format the Sheet

1. **Freeze row 1**
2. **Bold header row**
3. **Column widths:**
   - A (Team Name): 200px
   - B (Captain): 150px
   - C (Abbr): 80px
   - D (Status): 100px
   - E (Color): 100px
   - F (Logo URL): 300px
   - G (Emblem URL): 300px
   - H (Discord Role ID): 150px
4. **Header background:** Light blue (#cfe2ff)
5. **Color column:** Show the actual colors as background

**To add color preview in column E:**
- Use conditional formatting or Apps Script to set background colors

### Step 5: Add Data Validation

**Column D (Status):**
- Data → Data validation
- List of items: `Active,Inactive,Eliminated`

---

## Part 4: Migration Scripts

### Script 1: Migrate Data to Player Registry

This script will populate the Player Registry from existing data sources.

**To run:**
1. Open League Hub → Extensions → Apps Script
2. Create new file: `MigrationScripts.js`
3. Paste the migration script (provided in next file)
4. Run `migrateToPlayerRegistry()`

### Script 2: Populate Team Registry

Manually populate this with your team data, or create a migration script if you have existing team data in a specific format.

---

## Part 5: Verification Checklist

After completing all steps:

### Config Sheet
- [ ] Sheet named `⚙️ Config` exists
- [ ] Has columns: Key | Value | Description
- [ ] All required keys added
- [ ] Headers formatted (bold, colored)
- [ ] Row 1 is frozen

### Player Registry
- [ ] Sheet named `📋 Player Registry` exists
- [ ] Has all 6 columns
- [ ] Formula in column F works (shows ✅ or ❌)
- [ ] Data validation on Status column works
- [ ] Headers formatted
- [ ] Row 1 is frozen

### Team Registry
- [ ] Sheet named `📋 Team Registry` exists
- [ ] Has all 8 columns
- [ ] Example data added for all teams
- [ ] Data validation on Status column works
- [ ] Colors display correctly
- [ ] Headers formatted
- [ ] Row 1 is frozen

---

## Next Steps

Once these sheets are created:
1. Run migration scripts to populate Player Registry
2. Add getSharedConfig() helper function to Apps Script
3. Update existing modules to use shared config
4. Implement validation hooks

See `phase1-shared-config-helper.js` for the Apps Script implementation.

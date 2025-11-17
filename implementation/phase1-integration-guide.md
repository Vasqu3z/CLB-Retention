# Phase 1 Integration Guide

This guide shows how to integrate all Phase 1 components into your existing Apps Script modules.

---

## Step 1: Add All New Files to League Hub Apps Script

1. Open **League Hub** spreadsheet
2. Go to **Extensions → Apps Script**
3. Create new files for each script below:

### Files to Add:

```
- SharedConfig.js          (phase1-shared-config-helper.js)
- Validation.js            (phase1-validation.js)
- DiscordWebhooks.js       (phase1-discord-webhooks.js)
- WebsiteCacheInvalidation.js (phase1-website-cache-invalidation.js)
- MigrationScripts.js      (phase1-migration-scripts.js) - ONE TIME USE
```

Copy the contents from the `implementation/` folder into these new files.

---

## Step 2: Update LeagueCore.js

Add these changes to your existing `LeagueCore.js`:

### A. Import Functions (Add to top of file)

Since Apps Script doesn't have imports, just ensure the new files are in the same project.

### B. Update the `updateAll()` Function

Find the `updateAll()` function and add these calls **at the end**, right before the final toast message:

```javascript
function updateAll() {
  // ... existing code ...

  // STEP 3: Update Standings (existing code)
  updateLeagueHubFromCache(gameData.teamStatsWithH2H, standings);

  var endTime = new Date();
  var elapsed = ((endTime - startTime) / 1000).toFixed(1);

  // ===== NEW: Phase 1 Integration =====

  // Invalidate website cache
  invalidateWebsiteCache();

  // Send Discord notifications
  notifyDiscordStatsUpdated(gameData);

  // ===== End Phase 1 Integration =====

  ss.toast("✅ Update complete! (" + elapsed + "s)", "Success", 5);
}
```

### C. Update the `onOpen()` Function

Add menu items for testing:

```javascript
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  var mainMenu = ui.createMenu('📊 Player Stats')
    .addItem('🚀 Update All', 'updateAll')
    .addItem('⚡ Quick Update', 'quickUpdate')
    .addSeparator()
    // ... existing menu items ...
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Configuration & Testing')
      .addItem('📋 Show Config', 'showConfigValues')
      .addItem('🔄 Refresh Config Cache', 'refreshConfigCache')
      .addItem('✅ Test Cache Invalidation', 'showCacheInvalidationTest')
      .addItem('📊 Validate Roster Integrity', 'showRosterValidationReport'))
    .addToUi();
}

/**
 * Shows roster validation report in a dialog
 */
function showRosterValidationReport() {
  var report = validateRosterIntegrity();

  var message = '=== ROSTER VALIDATION REPORT ===\n\n';
  message += 'Total Players: ' + report.totalPlayers + '\n';
  message += 'Active Teams: ' + report.activeTeams + '\n';
  message += 'Issues Found: ' + report.issues.length + '\n\n';

  if (report.issues.length > 0) {
    message += 'ISSUES:\n';
    for (var i = 0; i < report.issues.length; i++) {
      message += '• ' + report.issues[i].message + ': ' + report.issues[i].player + '\n';
    }
  } else {
    message += '✅ No issues found!';
  }

  SpreadsheetApp.getUi().alert('Roster Validation', message, SpreadsheetApp.getUi().ButtonSet.OK);
}
```

---

## Step 3: Update LeagueGames.js

Add validation to the game processing function.

### Find: `processAllGameSheetsOnce()`

### Add validation call after processing each game:

```javascript
function processAllGameSheetsOnce() {
  // ... existing code ...

  for (var gameIndex = 0; gameIndex < gameSheets.length; gameIndex++) {
    var sheet = gameSheets[gameIndex];
    var sheetName = sheet.getName();

    try {
      // ... existing game processing code ...

      // ===== NEW: Validate game players =====
      var validationResult = validateGamePlayers(gameData, sheetName);

      if (!validationResult.valid) {
        Logger.log('WARNING: ' + validationResult.warnings.join('; '));
      }
      // ===== End validation =====

      // ... rest of existing code ...
    } catch (e) {
      // ... existing error handling ...
    }
  }

  // ... rest of function ...
}
```

---

## Step 4: Update LeagueConfig.js

Add references to the new registry sheets.

### Add to the CONFIG object:

```javascript
var CONFIG = {
  // ===== SHEET NAMES =====
  ERROR_LOG_SHEET: "Error Log",
  PLAYER_REGISTRY_SHEET: "📋 Player Registry",     // NEW
  TEAM_REGISTRY_SHEET: "📋 Team Registry",         // NEW
  CONFIG_SHEET: "⚙️ Config",                       // NEW
  IMAGE_URLS_SHEET: "Image URLs",                  // Will deprecate after migration
  PLAYER_STATS_SHEET: "🧮 Players",
  TEAM_STATS_SHEET: "🧮 Teams",
  // ... rest of existing config ...

  // ===== REGISTRY COLUMN MAPPINGS (0-BASED) =====
  PLAYER_REGISTRY: {
    COLUMNS: {
      PLAYER_NAME: 0,    // Column A
      TEAM: 1,           // Column B
      STATUS: 2,         // Column C
      DATABASE_ID: 3,    // Column D
      IMAGE_URL: 4,      // Column E
      HAS_ATTRIBUTES: 5  // Column F
    }
  },

  TEAM_REGISTRY: {
    COLUMNS: {
      TEAM_NAME: 0,      // Column A
      ABBR: 1,           // Column B
      CAPTAIN: 2,        // Column C
      STATUS: 3,         // Column D
      COLOR: 4,          // Column E
      LOGO_URL: 5,       // Column F
      EMBLEM_URL: 6,     // Column G
      DISCORD_ROLE_ID: 7 // Column H
    }
  }

  // ... rest of existing config ...
};
```

---

## Step 5: Update Box Scores Module (Optional)

If you want dropdown validation in box score sheets:

### Create new file in Box Scores: `BoxScoreValidation.js`

```javascript
// ===== BOX SCORE VALIDATION =====
// Purpose: Validates player names against League Hub registry
// Dependencies: getSharedConfig() from League Hub
// Entry Point(s): setupGameSheetWithValidation()

/**
 * Creates a new game sheet with dropdown validation for player names.
 * Call this from ScoreMenu.js or add as a menu item.
 *
 * @param {string} awayTeam - Away team name
 * @param {string} homeTeam - Home team name
 * @param {number} weekNumber - Week number
 */
function setupGameSheetWithValidation(awayTeam, homeTeam, weekNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Get League Hub ID from shared config
  var leagueHubId = getConfigValue('SEASON_6_LEAGUE_HUB_ID');

  if (!leagueHubId) {
    throw new Error('League Hub ID not configured. Please add to Config sheet.');
  }

  var leagueHubSS = SpreadsheetApp.openById(leagueHubId);
  var registrySheet = leagueHubSS.getSheetByName('📋 Player Registry');

  if (!registrySheet) {
    throw new Error('Player Registry not found in League Hub');
  }

  // ===== P1: Read registry data ONCE =====
  var registryData = registrySheet.getRange(2, 1, registrySheet.getLastRow() - 1, 2).getValues();

  // ===== P3: Build team rosters in memory =====
  var awayRoster = [];
  var homeRoster = [];

  for (var i = 0; i < registryData.length; i++) {
    var playerName = String(registryData[i][0]).trim();
    var team = String(registryData[i][1]).trim();

    if (team === awayTeam) {
      awayRoster.push(playerName);
    } else if (team === homeTeam) {
      homeRoster.push(playerName);
    }
  }

  if (awayRoster.length === 0 || homeRoster.length === 0) {
    SpreadsheetApp.getUi().alert('Warning: One or both teams have no players in registry');
    return;
  }

  // ===== Apply data validation to name columns =====

  var awayRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(awayRoster, true)
    .setAllowInvalid(false)
    .setHelpText('✅ Select from ' + awayTeam + ' active roster')
    .build();

  var homeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(homeRoster, true)
    .setAllowInvalid(false)
    .setHelpText('✅ Select from ' + homeTeam + ' active roster')
    .build();

  // Apply to roster columns (assuming standard box score layout)
  // Away team: B7:B15, Home team: B18:B26
  sheet.getRange('B7:B15').setDataValidation(awayRule);
  sheet.getRange('B18:B26').setDataValidation(homeRule);

  SpreadsheetApp.getUi().alert('✅ Game sheet ready! Rosters locked to active players.');
}

// Copy getSharedConfig() and getConfigValue() from SharedConfig.js here,
// or link the Box Scores project to League Hub if both are in same account
```

---

## Step 6: Run Migration Scripts

### A. Populate Player Registry

1. Ensure all sheets are created (Config, Player Registry, Team Registry)
2. Fill Config sheet with your spreadsheet IDs
3. Open Apps Script in League Hub
4. Run: `migrateToPlayerRegistry()`
5. Check the Execution log for success message
6. Verify data in Player Registry sheet

### B. Populate Team Registry

1. Edit the `teamData` array in `populateTeamRegistry()`
2. Add your actual team data
3. Run: `populateTeamRegistry()`
4. Verify data in Team Registry sheet

### C. Verify Migration

1. Run: `verifyPlayerRegistry()`
2. Check logs for report
3. Fix any duplicates or issues

---

## Step 7: Configure Discord Webhook

### A. Create Discord Webhook

1. Go to your Discord server
2. Select a channel for notifications
3. Click gear icon → Integrations → Webhooks
4. Click "New Webhook"
5. Name it "CLB League Hub"
6. Copy the webhook URL

### B. Add to Config Sheet

1. Open League Hub → ⚙️ Config sheet
2. Add/update these rows:

```
| DISCORD_WEBHOOK_URL     | https://discord.com/api/webhooks/... | Paste webhook URL here |
| DISCORD_NOTIFY_GAMES    | true                                  | Post game results      |
| DISCORD_NOTIFY_STANDINGS| true                                  | Post standings updates |
```

3. Run: `refreshConfigCache()` from menu

### C. Test Discord Webhook

1. Run: `postWeeklySchedule(1)` with a valid week number
2. Check Discord channel for message

---

## Step 8: Configure Website Cache Invalidation

### A. Add Revalidation API Route to Website

Create `/website/app/api/revalidate/route.ts`:

```typescript
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check secret
    if (body.secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    // Invalidate sheets cache
    revalidateTag('sheets');

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
}
```

### B. Add Environment Variable

In Vercel dashboard:

```
REVALIDATE_SECRET=your-random-secret-key-here
```

Generate a random secret: `openssl rand -hex 32`

### C. Update Config Sheet

```
| WEBSITE_URL              | https://your-site.vercel.app                | Your website URL       |
| WEBSITE_REVALIDATE_URL   | https://your-site.vercel.app/api/revalidate | Revalidation endpoint |
| WEBSITE_REVALIDATE_SECRET| your-random-secret-key-here                 | Must match Vercel env |
```

### D. Test Cache Invalidation

1. In League Hub, go to menu: Configuration & Testing → Test Cache Invalidation
2. Dialog should show: ✅ Configured, ✅ Reachable, ✅ Authenticated
3. If any are ❌, check the error message and fix

---

## Step 9: Test End-to-End

### A. Test UpdateAll Flow

1. Make a small change to a game sheet (add a hit or change a score)
2. Run **Update All** from menu
3. Check execution log for:
   - `SUCCESS: Website cache invalidated`
   - `SUCCESS: Discord notification sent`
4. Check Discord for notification
5. Check website to see fresh data (should update within 1-2 seconds)

### B. Test Validation

1. Create a test game sheet
2. Add a player name that doesn't exist in Player Registry (e.g., "Test Player 123")
3. Run **Update All**
4. Check Error Log sheet for validation warning
5. Check execution log for: `WARNING: ...unknown player(s)`

---

## Step 10: Cleanup (Optional)

After migration is complete and tested:

1. Archive `MigrationScripts.js` (you won't need it again)
2. Keep `Image URLs` sheet for now (can deprecate after website migration)
3. Consider deprecating individual team sheets if you have them

---

## Verification Checklist

After completing all steps:

### Config & Registries
- [ ] ⚙️ Config sheet exists with all required keys
- [ ] 📋 Player Registry populated with all players
- [ ] 📋 Team Registry populated with all teams
- [ ] Formula in Player Registry column F shows ✅/❌

### Apps Script
- [ ] All 5 new files added to League Hub project
- [ ] LeagueCore.js updated with webhook + cache invalidation calls
- [ ] LeagueGames.js updated with validation calls
- [ ] LeagueConfig.js updated with registry column mappings
- [ ] Menu items added for testing

### Discord Integration
- [ ] Webhook URL configured in Config sheet
- [ ] Test notification posted successfully
- [ ] UpdateAll sends notifications

### Website Integration
- [ ] Revalidation API route deployed
- [ ] Environment variable set in Vercel
- [ ] Test shows all ✅
- [ ] UpdateAll invalidates cache successfully

### Validation
- [ ] Roster validation report runs without errors
- [ ] Invalid players logged to Error Log sheet
- [ ] Game validation runs during UpdateAll

---

## Troubleshooting

### "Config sheet not found"
- Ensure sheet is named exactly `⚙️ Config` (with emoji)
- Check for extra spaces in sheet name

### Discord webhook not posting
- Verify webhook URL is correct
- Check `DISCORD_NOTIFY_GAMES` is `true` in Config
- Run `refreshConfigCache()` after changing Config
- Check Discord webhook isn't disabled/deleted

### Website cache not invalidating
- Run "Test Cache Invalidation" from menu
- Verify secret matches between Config and Vercel
- Check website API route is deployed
- Verify URL ends with `/api/revalidate`

### Validation warnings not appearing
- Check Error Log sheet exists
- Verify Player Registry has data
- Run `refreshPlayerRegistryCache()` after changing registry

---

## Next Steps

Once Phase 1 is complete:
- **Phase 2**: Add comprehensive player profiles to website
- **Phase 3**: Migrate web apps (Lineup Builder, Comparison tools)
- **Phase 4**: Add Discord bot attribute commands

See the implementation folder for Phase 2 guides.

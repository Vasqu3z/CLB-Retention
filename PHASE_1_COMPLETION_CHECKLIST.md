# Phase 1 Completion Checklist

All sheets have been created and implementation files are ready. Follow this checklist to integrate Phase 1 into your League Hub Apps Script.

---

## ✅ Pre-Integration Checklist

Before you begin, verify you have:

- [x] Created **⚙️ Config** sheet with all keys
- [x] Created **📋 Player Registry** sheet with players
- [x] Created **📋 Team Registry** sheet with teams
- [x] Created Discord webhooks for 4 channels
- [x] Generated `REVALIDATE_SECRET` for website cache invalidation

---

## 📋 Config Sheet - Required Keys

Verify these keys are in your **⚙️ Config** sheet:

### Season Management
```
CURRENT_SEASON                | 1
SEASON_1_LEAGUE_HUB_ID        | [your S1 League Hub ID]
SEASON_1_BOX_SCORE_ID         | [your S1 Box Score ID]
SEASON_2_LEAGUE_HUB_ID        | [blank for now]
SEASON_2_BOX_SCORE_ID         | [blank for now]
```

### Discord Webhooks (4 channels)
```
DISCORD_WEBHOOK_SCORES         | https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_STANDINGS      | https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_SCHEDULE       | https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_TRANSACTIONS   | https://discord.com/api/webhooks/...
DISCORD_NOTIFY_SCORES          | true
DISCORD_NOTIFY_STANDINGS       | true
DISCORD_NOTIFY_SCHEDULE        | true
DISCORD_NOTIFY_TRANSACTIONS    | true
```

### Website Integration
```
WEBSITE_REVALIDATE_URL         | https://comets-league-baseball.vercel.app/api/revalidate
WEBSITE_REVALIDATE_SECRET      | [your generated secret]
WEBSITE_URL                    | https://comets-league-baseball.vercel.app
```

### Database Spreadsheet (for attributes/chemistry)
```
DATABASE_SPREADSHEET_ID        | [your Database spreadsheet ID]
```

---

## 🔧 Step 1: Add Implementation Files to Apps Script

1. Open your **League Hub** spreadsheet
2. Go to **Extensions** → **Apps Script**
3. Add the following files from the `implementation/` folder:

### File 1: `SharedConfig.js`
- Copy contents from: `implementation/phase1-shared-config-helper.js`
- Paste into Apps Script as new file: `SharedConfig.js`

### File 2: `Validation.js`
- Copy contents from: `implementation/phase1-validation.js`
- Paste into Apps Script as new file: `Validation.js`

### File 3: `DiscordWebhooks.js`
- Copy contents from: `implementation/phase1-discord-webhooks.js`
- Paste into Apps Script as new file: `DiscordWebhooks.js`

### File 4: `WebsiteCacheInvalidation.js`
- Copy contents from: `implementation/phase1-website-cache-invalidation.js`
- Paste into Apps Script as new file: `WebsiteCacheInvalidation.js`

**After adding all 4 files, save the project.**

---

## 🔗 Step 2: Integrate with Existing Code

Follow the integration guide in `implementation/phase1-integration-guide.md`:

### 2a. Update `LeagueCore.js` - Add to `updateAll()` function

Find the `updateAll()` function and add these lines **at the end** (before the final toast message):

```javascript
function updateAll() {
  // ... existing code ...

  // ===== PHASE 1: Add these lines at the end =====

  // Invalidate website cache (fresh data within 1-2 seconds)
  invalidateWebsiteCache();

  // Post notifications to Discord
  notifyDiscordStatsUpdated(gameData);

  // ===== End Phase 1 Integration =====

  ss.toast("✅ Update complete!", "Success", 5);
}
```

### 2b. Update `LeagueGames.js` - Add validation (optional but recommended)

Find where games are processed and add validation:

```javascript
function processGame(gameSheetName) {
  // ... existing code to read game data ...

  // ===== PHASE 1: Validate players =====
  var validationResult = validateGamePlayers(gameData, gameSheetName);

  if (!validationResult.valid) {
    // Log warning but continue processing
    Logger.log('WARNING: Invalid players found in ' + gameSheetName);
  }
  // ===== End Phase 1 Integration =====

  // ... continue with normal processing ...
}
```

### 2c. Update `LeagueConfig.js` - Add registry column mappings

Add these constants to your config:

```javascript
var PLAYER_REGISTRY_COLUMNS = {
  DATABASE_ID: 0,      // Column A
  PLAYER_NAME: 1,      // Column B
  TEAM: 2,             // Column C
  STATUS: 3,           // Column D
  IMAGE_URL: 4,        // Column E
  HAS_ATTRIBUTES: 5    // Column F
};

var TEAM_REGISTRY_COLUMNS = {
  TEAM_NAME: 0,        // Column A
  CAPTAIN: 1,          // Column B
  ABBR: 2,             // Column C
  STATUS: 3,           // Column D
  COLOR: 4,            // Column E
  LOGO_URL: 5,         // Column F
  EMBLEM_URL: 6,       // Column G
  DISCORD_ROLE_ID: 7   // Column H
};
```

---

## 🧪 Step 3: Test the Integration

### 3a. Test Config Helper
1. In Apps Script, run: `getSharedConfig()`
2. Check Execution Log - should see all config values
3. Verify no errors

### 3b. Test Discord Webhooks
1. Run: `postWeeklySchedule(1)` (replace 1 with current week)
2. Check your **#schedule** Discord channel
3. Should see schedule posted

### 3c. Test Website Cache Invalidation
1. Run: `invalidateWebsiteCache()`
2. Check Execution Log
3. Should see "SUCCESS: Website cache invalidated"

### 3d. Test Full Integration
1. Process a game using your normal workflow
2. Run `updateAll()`
3. Verify:
   - ✅ Discord posts to #scores channel
   - ✅ Discord posts to #standings channel
   - ✅ Website cache is invalidated
   - ✅ Website shows updated data within 60 seconds

---

## 🎯 Step 4: Set Up Automation (Optional)

### Weekly Schedule Posting
Create a time-driven trigger to post schedule weekly:

1. Apps Script → **Triggers** (clock icon)
2. Click **+ Add Trigger**
3. Function: `postWeeklySchedule`
4. Event: Time-driven
5. Type: Week timer
6. Day: Monday
7. Time: 12pm - 1pm

**Note:** You'll need to manually pass the week number, or create a helper function to determine the current week.

### Example Helper Function:
```javascript
function postCurrentWeekSchedule() {
  var config = getSharedConfig();
  var currentWeek = getCurrentWeek(); // You'll need to implement this
  postWeeklySchedule(currentWeek);
}
```

---

## 🔍 Troubleshooting

### Issue: "getSharedConfig is not defined"
**Solution:** Make sure you added `SharedConfig.js` file to Apps Script.

### Issue: Discord webhook returns 401/403
**Solution:**
- Verify webhook URL is correct in Config sheet
- Check webhook hasn't been deleted in Discord
- Recreate webhook if needed

### Issue: Website cache not invalidating
**Solution:**
- Verify `WEBSITE_REVALIDATE_SECRET` matches in both:
  - Config sheet
  - Vercel environment variables
- Check `WEBSITE_REVALIDATE_URL` is correct

### Issue: Validation warnings showing up
**Solution:** This is normal! Validation warnings mean:
- Player name in box score doesn't match Player Registry
- Fix the name spelling in box score or add to registry

### Issue: Config values not updating
**Solution:**
- Config is cached for 1 hour
- Clear cache by running: `CacheService.getScriptProperties().remove('shared_config')`
- Or wait 1 hour for cache to expire

---

## 📊 Verification Checklist

After integration, verify these work:

- [ ] `getSharedConfig()` returns all config values
- [ ] `validateGamePlayers()` identifies invalid player names
- [ ] `invalidateWebsiteCache()` successfully calls website
- [ ] `notifyDiscordStatsUpdated()` posts to #scores and #standings
- [ ] `postWeeklySchedule()` posts to #schedule
- [ ] `postTransaction()` posts to #transactions
- [ ] Website shows updated data after running UpdateAll

---

## 🎉 Phase 1 Complete!

Once all checks pass, Phase 1 is complete. You now have:

✅ **Centralized configuration** - No more hardcoded IDs
✅ **Single source of truth** - Player Registry and Team Registry
✅ **Automated Discord notifications** - 4 channels
✅ **Website cache invalidation** - Fresh data in 1-2 seconds
✅ **Player validation** - Catch typos and invalid names
✅ **Multi-season support** - Ready for Season 2

---

## 🚀 Next Steps: Phase 2

Phase 2 focuses on enhancing the website and Discord bot:

1. **Player Profile Pages** ✅ (Already completed!)
2. **Migrate Web Apps** (Attribute Comparison, Chemistry Tool, Lineup Builder)
3. **Discord Bot Commands** (`/attributes`, `/chemistry`)

See `PHASE_2_PROGRESS.md` for details.

---

## 📞 Need Help?

If you encounter issues during integration:

1. Check the **Execution log** in Apps Script for errors
2. Review the detailed integration guide: `implementation/phase1-integration-guide.md`
3. Verify all config keys are spelled correctly (case-sensitive!)
4. Test each function individually before testing the full flow

**Good luck with Phase 1 integration!** 🎊

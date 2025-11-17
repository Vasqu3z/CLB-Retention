# CLB Integration Implementation - Phase 1

This folder contains all the code and guides for implementing Phase 1 of the CLB integration plan.

## Phase 1 Goals

✅ Create single source of truth for players and teams
✅ Add cross-module validation
✅ Set up automated Discord notifications
✅ Add website cache invalidation

**Estimated Time:** 6-8 hours
**Difficulty:** Medium

---

## Files in This Folder

### Setup Guides

1. **phase1-config-sheet-setup.md** - Step-by-step guide to create the three foundation sheets
   - ⚙️ Config sheet structure
   - 📋 Player Registry sheet
   - 📋 Team Registry sheet

2. **phase1-integration-guide.md** - Complete integration guide showing how to add everything to your existing modules
   - Update LeagueCore.js
   - Update LeagueGames.js
   - Update LeagueConfig.js
   - Configure Discord webhook
   - Configure website cache invalidation
   - Testing & verification

### Apps Script Files (Copy these to League Hub)

3. **phase1-migration-scripts.js** → `MigrationScripts.js`
   - `migrateToPlayerRegistry()` - One-time migration from Image URLs + Rosters
   - `populateTeamRegistry()` - Populate Team Registry with your teams
   - `verifyPlayerRegistry()` - Verification script

4. **phase1-shared-config-helper.js** → `SharedConfig.js`
   - `getSharedConfig()` - Read config from Config sheet with caching
   - `getConfigValue(key)` - Get single config value
   - `refreshConfigCache()` - Manually refresh cache

5. **phase1-validation.js** → `Validation.js`
   - `validateGamePlayers(gameData, sheetName)` - Validate players in game
   - `validateRosterIntegrity()` - Check all rosters
   - `getPlayerRegistry()` - Get player registry with caching
   - `getTeamRegistry()` - Get team registry

6. **phase1-discord-webhooks.js** → `DiscordWebhooks.js`
   - `notifyDiscordStatsUpdated(gameData)` - Post stats update to Discord
   - `postWeeklySchedule(weekNumber)` - Post weekly schedule
   - `postGameResult(...)` - Post single game result

7. **phase1-website-cache-invalidation.js** → `WebsiteCacheInvalidation.js`
   - `invalidateWebsiteCache()` - Clear Next.js cache
   - `testWebsiteCacheInvalidation()` - Test connection
   - `showCacheInvalidationTest()` - Show test results in dialog

---

## Implementation Steps

### Quick Start (6-8 hours)

Follow these guides in order:

1. **Setup Sheets (1 hour)**
   - Read: `phase1-config-sheet-setup.md`
   - Create ⚙️ Config, 📋 Player Registry, 📋 Team Registry sheets

2. **Add Apps Script Files (30 min)**
   - Copy all 5 .js files to League Hub Apps Script project
   - Name them exactly as shown above

3. **Run Migrations (30 min)**
   - Follow migration section in integration guide
   - Run `migrateToPlayerRegistry()`
   - Run `populateTeamRegistry()`
   - Run `verifyPlayerRegistry()`

4. **Integrate with Existing Modules (2-3 hours)**
   - Read: `phase1-integration-guide.md`
   - Update LeagueCore.js (add webhook + cache invalidation calls)
   - Update LeagueGames.js (add validation calls)
   - Update LeagueConfig.js (add registry column mappings)
   - Update menu system

5. **Configure Discord (30 min)**
   - Create Discord webhook
   - Add to Config sheet
   - Test with `postWeeklySchedule(1)`

6. **Configure Website (1 hour)**
   - Add revalidation API route to website
   - Deploy to Vercel
   - Add environment variable
   - Update Config sheet
   - Run test from menu

7. **Test End-to-End (1 hour)**
   - Run Update All
   - Verify Discord notification
   - Verify website cache invalidated
   - Verify validation warnings appear
   - Check all menu items work

---

## Code Standards

All code follows the **Gold Standard Implementation Guide** principles:

- **P1 (Performance):** All spreadsheet I/O is batched, never in loops
- **P2 (Configurability):** All column indices are 0-based, no magic numbers
- **P3 (Data Flow):** Data read once, processed in memory, written once
- **P4 (Commenting):** Proper headers, JSDoc, no obvious comments

---

## What Phase 1 Accomplishes

After completing Phase 1, you will have:

### Foundation
✅ **Single source of truth** - Player Registry + Team Registry
✅ **Centralized config** - No more hardcoded IDs
✅ **Shared config helper** - All modules can access config with caching

### Automation
✅ **Discord notifications** - Auto-post when stats update
✅ **Website cache invalidation** - Fresh data within 1-2 seconds
✅ **Validation hooks** - Catch invalid players automatically

### Better UX
✅ **Commissioners:** Less manual work, automated notifications
✅ **Viewers:** Fresh data immediately after updates
✅ **Discord users:** Automatic notifications for games and standings

---

## Testing Checklist

Use this checklist to verify Phase 1 is working:

### Sheet Setup
- [ ] ⚙️ Config sheet exists with all required keys
- [ ] 📋 Player Registry populated (verify count matches expected)
- [ ] 📋 Team Registry populated (all 8 teams)
- [ ] Formula in Player Registry column F works (shows ✅/❌)

### Apps Script
- [ ] All 5 new .js files added to project
- [ ] No syntax errors (check Executions log)
- [ ] Menu shows new items under "Configuration & Testing"

### Config
- [ ] Run "Show Config" from menu - all keys loaded
- [ ] Discord webhook URL configured
- [ ] Website revalidate URL configured
- [ ] All boolean values show as `true`/`false` (not strings)

### Validation
- [ ] Run "Validate Roster Integrity" - no errors
- [ ] Add fake player to game sheet
- [ ] Run Update All
- [ ] Check Error Log sheet for validation warning

### Discord
- [ ] Webhook URL is correct (not expired)
- [ ] Run `postWeeklySchedule(1)` - message appears in Discord
- [ ] Run Update All - game results and standings posted

### Website
- [ ] Run "Test Cache Invalidation" - all ✅
- [ ] Run Update All - cache invalidated (check log)
- [ ] Visit website - data is fresh (updated within 1-2 seconds)

---

## Troubleshooting

See the "Troubleshooting" section in `phase1-integration-guide.md` for common issues and solutions.

**Quick fixes:**

- **"Config sheet not found"** → Check exact sheet name with emoji
- **Discord not posting** → Run `refreshConfigCache()` after changing Config
- **Cache not invalidating** → Run test from menu, check secret matches
- **Validation not working** → Run `refreshPlayerRegistryCache()`

---

## Next Steps After Phase 1

Once Phase 1 is complete and tested, you can proceed to:

**Phase 2: Enhanced Player Profiles**
- Add comprehensive player profiles to website
- Combine attributes + stats + chemistry in one view
- Build player comparison pages

**Phase 3: Web App Migration**
- Migrate Lineup Builder to website
- Migrate Player Comparison tools
- Migrate Chemistry Tool

**Phase 4: Discord Bot Enhancements**
- Add `/attributes <player>` command
- Add `/chemistry <p1> <p2>` command
- Add attribute-based rankings

**Database Merge** (can be done anytime after Phase 1)
- Consolidate Database spreadsheet into League Hub
- Follow `database-consolidation-analysis.md` guide

---

## Support

For issues or questions:
1. Check the troubleshooting section in integration guide
2. Review execution logs in Apps Script
3. Verify all configuration values are correct
4. Check that all sheet names match exactly (including emojis)

---

**Created:** November 17, 2025
**Version:** 1.0
**Follows:** Gold Standard Implementation Guide
**Estimated Time:** 6-8 hours
**Difficulty:** Medium

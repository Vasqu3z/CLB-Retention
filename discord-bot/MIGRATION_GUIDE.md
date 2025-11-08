# Discord Bot Migration Guide

**Goal:** Move Discord bot from `CLB-League-Hub/discord-bot/` to a new standalone repository `CLB-League-Discord-Bot`

**Estimated Time:** 20-30 minutes

---

## Prerequisites

✅ GitHub account with repo creation permissions
✅ Railway account (already set up)
✅ Local git configured
✅ Bot currently deployed and working on Railway

---

## Part 1: Create New Repository on GitHub

### Step 1: Create the Repository

1. Go to https://github.com/new
2. Fill in details:
   - **Repository name:** `CLB-League-Discord-Bot`
   - **Description:** "Discord bot for CLB League Hub - player stats, standings, schedules, and more"
   - **Visibility:** Private (or Public if you want to share)
   - **DO NOT** initialize with README/gitignore/license (we'll bring our own)
3. Click **Create repository**
4. **Copy the repository URL** (e.g., `https://github.com/YourUsername/CLB-League-Discord-Bot.git`)

---

## Part 2: Extract Bot to New Repository

### Step 2: Create Local Copy of Bot Directory

```bash
# Navigate to your current project
cd /home/user/CLB-League-Hub

# Create a new directory for the extracted bot
mkdir -p ../CLB-League-Discord-Bot
cp -r discord-bot/* ../CLB-League-Discord-Bot/
cd ../CLB-League-Discord-Bot
```

### Step 3: Clean Up Unnecessary Files

```bash
# Remove node_modules if present (we'll reinstall)
rm -rf node_modules

# Remove any local .env file (will use Railway secrets)
rm -f .env
```

### Step 4: Update package.json

Make sure your `package.json` has the correct name:

```json
{
  "name": "clb-league-discord-bot",
  "version": "1.0.0",
  "description": "Discord bot for CLB League Hub statistics and schedules",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "deploy": "node src/deploy-commands.js"
  },
  "keywords": ["discord", "bot", "baseball", "statistics"],
  "author": "CLB League Hub Team",
  "license": "MIT"
}
```

### Step 5: Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temporary files
*.tmp
*.bak
EOF
```

### Step 6: Create .env.example (for documentation)

```bash
cat > .env.example << 'EOF'
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_GUILD_ID=your_discord_guild_id_here

# Google Sheets API
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Optional: Logging
LOG_LEVEL=INFO
EOF
```

### Step 7: Initialize Git and Push

```bash
# Initialize new git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CLB League Discord Bot v1.0

Features:
- 11 slash commands (stats, standings, rankings, schedules)
- Google Sheets integration with 5-minute caching
- Player/team image support
- Head-to-head matchup tracking
- Gold Standard compliant (9.2/10)

Architecture:
- Discord.js v14 with slash commands
- Google Sheets API v4
- Standardized logging
- Railway deployment ready
"

# Add remote origin (use the URL from Step 1)
git remote add origin https://github.com/YourUsername/CLB-League-Discord-Bot.git

# Push to GitHub
git push -u origin main
```

**Note:** If you get an error about `main` vs `master`, use:
```bash
git branch -M main  # Rename to main if needed
git push -u origin main
```

---

## Part 3: Deploy to Railway

### Step 8: Disconnect Old Deployment (Optional)

If you want to completely remove the old deployment:

1. Go to Railway dashboard: https://railway.app/dashboard
2. Find your current bot deployment
3. Click on it → Settings → Danger Zone → Delete Service

**OR** just leave it and create a new one (Railway allows multiple services).

### Step 9: Create New Railway Service

1. Go to Railway dashboard
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Authorize Railway to access your GitHub (if not already)
5. Select **CLB-League-Discord-Bot** repository
6. Railway will auto-detect it's a Node.js project

### Step 10: Configure Environment Variables

In Railway project settings:

1. Click **Variables** tab
2. Add each environment variable (copy from your current Railway deployment or .env):

```
DISCORD_TOKEN=<your_token>
DISCORD_CLIENT_ID=<your_client_id>
DISCORD_GUILD_ID=<your_guild_id>
GOOGLE_SHEETS_SPREADSHEET_ID=<your_spreadsheet_id>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<your_service_account_email>
GOOGLE_PRIVATE_KEY=<your_private_key_with_newlines>
LOG_LEVEL=INFO
```

**Important:** For `GOOGLE_PRIVATE_KEY`, make sure to preserve the `\n` characters:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n
```

### Step 11: Deploy

1. Railway will automatically deploy on push
2. Click **Deployments** to watch the build
3. Check logs for successful startup:
   ```
   [2025-01-08 ...] [INFO] [CommandLoader] Loaded command: playerstats
   [2025-01-08 ...] [INFO] [CommandLoader] Loaded command: teamstats
   ...
   [2025-01-08 ...] [INFO] [Bot] Logged in as BotName#1234
   [2025-01-08 ...] [INFO] [Bot] Ready and serving 1 server(s)
   ```

### Step 12: Test the Bot

In Discord:
1. Try `/playerstats` - should autocomplete with player names
2. Try `/standings` - should show current standings
3. Try `/schedule current` - should show current week games

---

## Part 4: Update Original Repo

### Step 13: Clean Up CLB-League-Hub Repo

Back in the original repo:

```bash
cd /home/user/CLB-League-Hub

# Create a README in discord-bot/ pointing to new repo
cat > discord-bot/README.md << 'EOF'
# Discord Bot (Moved)

The Discord bot has been moved to its own repository:

**New Location:** https://github.com/YourUsername/CLB-League-Discord-Bot

This directory is kept for reference but is no longer actively developed.

For the latest version, please visit the new repository.
EOF

# Optionally remove the bot code (keep README)
# git rm -r discord-bot/src discord-bot/package.json discord-bot/package-lock.json
# OR just leave it as-is for historical reference

# Commit the update
git add discord-bot/README.md
git commit -m "docs: Discord bot moved to separate repository

Bot is now maintained at:
https://github.com/YourUsername/CLB-League-Discord-Bot"

git push
```

---

## Part 5: Final Checklist

### Verify Everything Works

- [ ] New repo is public/private as intended
- [ ] Railway deployment is running (green status)
- [ ] Bot responds to `/playerstats` in Discord
- [ ] Bot responds to `/standings` in Discord
- [ ] Bot responds to `/schedule` in Discord
- [ ] Autocomplete works (try typing a player name)
- [ ] Images load (player headshots, team icons)
- [ ] All 11 commands work as expected

### Document the Change

- [ ] Update CLB-League-Hub README to mention new bot repo
- [ ] Share new repo URL with team members
- [ ] Copy `SHEET_SCHEMA.md` to CLB-League-Hub repo root
- [ ] Add sync reminders to both repos' config files

---

## Rollback Plan (If Something Goes Wrong)

If the new deployment fails:

1. **Redeploy old version:**
   - Railway keeps old deployments
   - Click on previous deployment → Redeploy

2. **Or revert Railway to old repo:**
   - Go to Service Settings
   - Change GitHub repo back to `CLB-League-Hub`
   - Set root directory to `/discord-bot`

3. **Emergency contact:**
   - Check Railway logs for errors
   - Check Discord bot logs
   - Verify environment variables are set correctly

---

## Post-Migration

### Update Documentation

Create a README.md in the new repo:

```markdown
# CLB League Discord Bot

Discord bot for CLB League Hub - providing real-time player statistics, team standings, schedules, and more.

## Features

- 📊 **Player Stats** - Comprehensive hitting, pitching, and fielding statistics
- 🏆 **League Leaders** - Top 5 rankings for all stat categories
- 📅 **Schedules** - View upcoming games, past scores, and team schedules
- ⚔️ **Head-to-Head** - Historical matchup data between teams
- 🔄 **Live Data** - Syncs with Google Sheets every 5 minutes

## Commands

- `/playerstats` - View stats for any player
- `/teamstats` - View stats for any team
- `/standings` - View league standings
- `/rankings` - View top 5 for any stat
- `/roster` - View team rosters
- `/schedule` - View upcoming games
- `/scores` - View past game results
- `/teamschedule` - View full team schedule
- `/headtohead` - Compare two teams
- `/compare` - Compare two players

## Deployment

Deployed on Railway. Automatic deployment on push to `main` branch.

## Architecture

- **Discord.js v14** - Slash commands with autocomplete
- **Google Sheets API v4** - Real-time data sync
- **In-memory caching** - 5-minute cache for performance
- **Gold Standard compliant** - Professional code structure (9.2/10)

## Schema Sync

This bot shares Google Sheets structure with [CLB-League-Hub](https://github.com/YourUsername/CLB-League-Hub).

See `SHEET_SCHEMA.md` for coordination protocol.

## License

MIT
```

---

## Success! 🎉

Your Discord bot is now in its own repository with independent deployment!

**Benefits:**
- ✅ Cleaner separation of concerns
- ✅ Independent versioning and releases
- ✅ Easier collaboration
- ✅ Better CI/CD isolation
- ✅ Simpler Railway integration

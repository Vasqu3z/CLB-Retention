# Discord Bot Migration Guide (GitHub Desktop)

**Goal:** Move Discord bot from `CLB-League-Hub/discord-bot/` to a new standalone repository `CLB-League-Discord-Bot`

**Estimated Time:** 20-30 minutes

---

## Prerequisites

✅ GitHub account with repo creation permissions
✅ **GitHub Desktop** installed ([download here](https://desktop.github.com/))
✅ Railway account (already set up)
✅ Bot currently deployed and working on Railway

---

## Part 1: Create New Repository on GitHub

### Step 1: Create the Repository

1. Go to https://github.com/new
2. Fill in details:
   - **Repository name:** `CLB-League-Discord-Bot`
   - **Description:** "Discord bot for CLB League Hub - player stats, standings, schedules, and more"
   - **Visibility:** Private (or Public if you want to share)
   - **✅ CHECK** "Add a README file" (makes cloning easier)
3. Click **Create repository**
4. **Leave this browser tab open** - you'll need it in Step 3

---

## Part 2: Extract Bot Files Locally

### Step 2: Copy Bot Files to New Folder

**Using File Explorer (Windows) / Finder (Mac):**

1. Navigate to your current project folder:
   - **Windows:** `C:\Users\YourName\CLB-League-Hub\discord-bot\`
   - **Mac:** `/Users/YourName/CLB-League-Hub/discord-bot/`

2. Create a new folder for the bot:
   - Go up one level to the parent directory
   - Create new folder: `CLB-League-Discord-Bot-Temp`

3. Copy all files from `discord-bot/` to `CLB-League-Discord-Bot-Temp/`:
   - Select all files and folders inside `discord-bot/`
   - Copy (`Ctrl+C` / `Cmd+C`)
   - Paste into `CLB-League-Discord-Bot-Temp/`

4. **Clean up the copied files:**
   - Delete `node_modules/` folder (if present)
   - Delete `.env` file (if present) - we'll use Railway's environment variables

---

## Part 3: Set Up with GitHub Desktop

### Step 3: Clone Your New Repository

1. Open **GitHub Desktop**
2. Click **File** → **Clone Repository**
3. Go to **GitHub.com** tab
4. Find and select **CLB-League-Discord-Bot** from the list
5. Choose where to save it locally (pick a memorable location)
6. Click **Clone**

### Step 4: Replace README with Bot Files

After cloning, you'll have a folder with just a README.md:

1. Open the cloned repository folder in File Explorer/Finder
   - In GitHub Desktop: **Repository** → **Show in Explorer/Finder**
2. **Delete the README.md** that GitHub created
3. Open your `CLB-League-Discord-Bot-Temp` folder from Step 2
4. **Select all files** and copy them
5. **Paste into** the cloned repository folder

Your folder should now contain:
```
CLB-League-Discord-Bot/
├── src/
│   ├── commands/
│   ├── config/
│   ├── services/
│   ├── utils/
│   ├── deploy-commands.js
│   └── index.js
├── MIGRATION_GUIDE.md
├── SHEET_SCHEMA.md
├── package.json
└── package-lock.json
```

### Step 5: Create .gitignore

1. In the cloned folder, create a new file called `.gitignore` (note the dot at the start)
2. Open it with Notepad (Windows) or TextEdit (Mac)
3. Paste this content:

```
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
```

4. Save and close

### Step 6: Create .env.example

1. Create a new file called `.env.example`
2. Open with Notepad/TextEdit
3. Paste this content:

```
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
```

4. Save and close

### Step 7: Commit and Push Using GitHub Desktop

1. Go back to **GitHub Desktop**
2. You should see all your new files in the **Changes** tab (left side)
3. In the bottom left, add a commit message:
   - **Summary:** `Initial commit: CLB League Discord Bot v1.0`
   - **Description:** (optional)
   ```
   Features:
   - 11 slash commands (stats, standings, rankings, schedules)
   - Google Sheets integration with 5-minute caching
   - Player/team image support
   - Head-to-head matchup tracking
   - Gold Standard compliant (9.2/10)
   ```

4. Click **Commit to main**
5. Click **Push origin** (blue button at top)

**✅ Done!** Your code is now on GitHub.

Verify by visiting: `https://github.com/YourUsername/CLB-League-Discord-Bot`

---

## Part 4: Deploy to Railway

### Step 8: Disconnect Old Deployment (Optional)

If you want to remove the old deployment:

1. Go to Railway dashboard: https://railway.app/dashboard
2. Find your current bot deployment
3. Click on it → **Settings** → **Danger Zone** → **Delete Service**

**OR** just leave it (Railway allows multiple services).

### Step 9: Create New Railway Service

1. Go to Railway dashboard: https://railway.app/dashboard
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Click **Configure GitHub App** (if first time):
   - Select which repositories Railway can access
   - Choose **Only select repositories**
   - Select **CLB-League-Discord-Bot**
   - Click **Save**
5. Back in Railway, select **CLB-League-Discord-Bot**
6. Railway will auto-detect Node.js and start deploying

### Step 10: Configure Environment Variables

**Get variables from old deployment:**

1. In Railway, go to your **OLD** bot deployment
2. Click **Variables** tab
3. Copy each variable value (you'll paste into new deployment)

**Add to new deployment:**

1. Go to your **NEW** deployment in Railway
2. Click **Variables** tab
3. Click **+ New Variable** for each:

```
DISCORD_TOKEN=<paste from old>
DISCORD_CLIENT_ID=<paste from old>
DISCORD_GUILD_ID=<paste from old>
GOOGLE_SHEETS_SPREADSHEET_ID=<paste from old>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<paste from old>
GOOGLE_PRIVATE_KEY=<paste from old - keep \n characters>
LOG_LEVEL=INFO
```

**⚠️ Important for GOOGLE_PRIVATE_KEY:**
- Should look like: `-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n`
- Keep the `\n` characters (they represent newlines)

4. Railway will automatically redeploy after adding variables

### Step 11: Monitor Deployment

1. Click **Deployments** tab
2. Click latest deployment
3. Click **View Logs**
4. Wait for success messages:
   ```
   [INFO] [CommandLoader] Loaded command: playerstats
   [INFO] [CommandLoader] Loaded command: teamstats
   ...
   [INFO] [Bot] Logged in as YourBotName#1234
   [INFO] [Bot] Ready and serving 1 server(s)
   ```

### Step 12: Test the Bot

In Discord, test these commands:

- ✅ `/playerstats` - should autocomplete with player names
- ✅ `/standings` - should show current standings
- ✅ `/schedule current` - should show current week games
- ✅ `/teamstats` - should autocomplete with team names
- ✅ `/rankings` - should show stat options

**If everything works, you're done! 🎉**

---

## Part 5: Update Original Repository (Optional)

### Step 13: Add Note to Old Repo

1. Open **GitHub Desktop**
2. Switch to **CLB-League-Hub** repository:
   - Click **Current Repository** dropdown (top left)
   - Select **CLB-League-Hub**
   - If not listed: **Add** → **Add Existing Repository** → browse to folder

3. Navigate to `CLB-League-Hub/discord-bot/` in File Explorer/Finder

4. Create `README.md` with this content:

```markdown
# Discord Bot (Moved)

The Discord bot has been moved to its own repository:

**New Location:** https://github.com/YourUsername/CLB-League-Discord-Bot

This directory is kept for reference but is no longer actively developed.

For the latest version, please visit the new repository.
```

5. Back in **GitHub Desktop**:
   - Should see README.md in Changes
   - **Summary:** `docs: Discord bot moved to separate repository`
   - Click **Commit to main** (or your current branch)
   - Click **Push origin**

6. **Clean up temp folder:**
   - Delete `CLB-League-Discord-Bot-Temp` folder you created in Step 2

---

## Final Checklist

### Verify Everything Works

- [ ] New repo exists on GitHub
- [ ] Railway deployment is running (green status)
- [ ] Bot responds to `/playerstats` in Discord
- [ ] Bot responds to `/standings` in Discord
- [ ] Bot responds to `/schedule` in Discord
- [ ] Autocomplete works (try typing a player name)
- [ ] Images load correctly (player headshots, team icons)
- [ ] All 11 commands work as expected

### Files to Keep Synchronized

**MUST match exactly between repos:**
- ✅ Sheet names (including emojis like `🧮 Hitting`)
- ✅ Column order/indices in all sheets
- ✅ `DATA_START_ROW = 2`
- ✅ Qualification thresholds (2.1 for batting, 1.0 for pitching)

See `SHEET_SCHEMA.md` for details.

---

## Troubleshooting

### Bot not showing in Discord
- Check Railway logs for errors
- Verify all environment variables set correctly
- Ensure `DISCORD_TOKEN` is correct

### Autocomplete not working
- Check `GOOGLE_SHEETS_SPREADSHEET_ID` is correct
- Verify Service Account has spreadsheet access
- Check Railway logs for Google API errors

### Changes not showing in GitHub Desktop
- Make sure you're in correct repository (check top left)
- Try **Repository** → **Refresh**

### Railway deployment failed
- Click failed deployment → **View Logs**
- Common issues:
  - Missing environment variables
  - Syntax errors
  - Wrong `package.json` config

### Need to rollback?
1. Railway → Your service
2. **Deployments** tab
3. Find previous successful deployment
4. Three dots → **Redeploy**

---

## Success! 🎉

Your Discord bot is now:
- ✅ In its own repository
- ✅ Independently deployed on Railway
- ✅ Ready for future updates
- ✅ Easier to maintain and share

**Next Steps:**
- Star your new repo ⭐
- Share URL with team members
- Keep `SHEET_SCHEMA.md` updated when making changes

---

## Need Help?

- **GitHub Desktop:** https://docs.github.com/en/desktop
- **Railway:** https://docs.railway.app/
- **Discord.js:** https://discord.js.org/

For bot issues, check logs in Railway: **Deployments** → **View Logs**

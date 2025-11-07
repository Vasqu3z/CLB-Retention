# Railway Deployment Guide for CLB League Discord Bot

## You're Ready to Deploy! ✅

Your code is already pushed to GitHub on branch:
```
claude/discord-bot-clb-league-011CUsopH7vRYQZ5LLThBaMG
```

You do **NOT** need to run the bot locally first - Railway will build and run it for you!

---

## Step-by-Step Railway Deployment

### Step 1: Create Railway Account (2 minutes)

1. Go to **https://railway.app/**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with GitHub (recommended) - this makes connecting repos easier
4. You'll get **$5 in free credits** and a free trial
5. Add a credit card to get **$5/month in credits** (usually enough for a bot)
   - Don't worry - you only pay if you exceed the $5 credit
   - A Discord bot typically uses $3-5/month

### Step 2: Create New Project from GitHub (3 minutes)

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If this is your first time:
   - Click **"Configure GitHub App"**
   - Select your GitHub account
   - Choose **"All repositories"** or select just **"CLB-League-Hub"**
   - Click **"Install & Authorize"**
4. Back in Railway, select your repository: **"CLB-League-Hub"**
5. Railway will detect the repository

### Step 3: Configure the Service (2 minutes)

1. Railway will start analyzing your repo
2. Click on the service that was created (it might be auto-deploying already - that's okay)
3. Go to **Settings** tab (left sidebar)
4. Scroll to **"Root Directory"**
   - Set it to: `discord-bot`
5. Scroll to **"Start Command"** (should already be set from package.json)
   - Should show: `npm start`
   - If not, set it manually
6. Railway will use the **railway.json** file automatically

### Step 4: Add Environment Variables (5 minutes) ⚠️ IMPORTANT

1. Click on the **Variables** tab (left sidebar)
2. Click **"+ New Variable"** for each of these:

**Discord Configuration:**
```
Variable Name: DISCORD_TOKEN
Value: [Your Discord bot token from Discord Developer Portal]

Variable Name: DISCORD_CLIENT_ID
Value: [Your Discord Client ID from Discord Developer Portal]

Variable Name: DISCORD_GUILD_ID
Value: [Your Discord Server ID - right-click server → Copy Server ID]
```

**Google Sheets Configuration:**
```
Variable Name: GOOGLE_SHEETS_SPREADSHEET_ID
Value: [From your spreadsheet URL - the long ID between /d/ and /edit]

Variable Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: [From your service-account JSON file: "client_email" field]

Variable Name: GOOGLE_PRIVATE_KEY
Value: [From your service-account JSON file: "private_key" field]
```

**⚠️ IMPORTANT for GOOGLE_PRIVATE_KEY:**
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters - they should look like: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...`
- Railway will handle the escaping automatically

**Optional:**
```
Variable Name: CACHE_TTL
Value: 300
```

3. Click **"Add"** after each variable

### Step 5: Deploy! (2 minutes)

1. Railway should automatically deploy after you add variables
2. If not, go to **Deployments** tab and click **"Deploy"**
3. Watch the build logs in real-time:
   - You'll see `npm install` running
   - Then `npm start`
   - Look for: `✅ Logged in as [YourBotName]`
   - And: `🤖 Bot is ready and serving X server(s)!`

### Step 6: Verify It's Working (1 minute)

1. Go to your Discord server
2. Your bot should now show as **Online** (green dot)
3. Type `/` and you should see:
   - `/playerstats`
   - `/teamstats`
   - `/standings`
4. Test a command: `/standings`

---

## Troubleshooting

### Bot shows offline in Discord
**Check Railway logs:**
- Go to Railway → Your service → **"Deployments"** → Click latest deployment
- Look for errors in the logs
- Common issues:
  - Wrong `DISCORD_TOKEN`
  - Missing environment variables

### "Authentication error" in logs
**Check Google credentials:**
- Make sure `GOOGLE_PRIVATE_KEY` is copied completely
- Verify `GOOGLE_SERVICE_ACCOUNT_EMAIL` is correct
- Ensure your spreadsheet is shared with the service account

### Commands don't show up in Discord
**Deploy the commands:**
You need to run the deploy-commands script once. In Railway:
1. Go to **Settings** → **Start Command**
2. Temporarily change it to: `npm run deploy-commands`
3. Let it run once
4. Change back to: `npm start`
5. Redeploy

**OR** run it locally:
```bash
cd discord-bot
npm install
# Create .env with your credentials
npm run deploy-commands
```

Then change Railway back to `npm start`.

### How to view logs
1. Go to Railway dashboard
2. Click your service
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. Logs will stream in real-time

### How to redeploy
Railway auto-deploys when you push to GitHub, but you can also:
1. Go to **Deployments** tab
2. Click the **"⋮"** menu on any deployment
3. Click **"Redeploy"**

---

## After Successful Deployment

### Your bot is now:
- ✅ Running 24/7 on Railway
- ✅ Auto-deploying when you push to GitHub
- ✅ Pulling live data from your Google Sheets
- ✅ Responding to Discord commands

### Monitor Usage:
1. Go to Railway dashboard → Your project
2. Click **"Usage"** tab
3. See how much of your $5 credit you're using
4. Typically: $0.10-0.20 per day = ~$3-6/month

### Update the bot:
1. Make changes to code locally
2. Commit and push to GitHub
3. Railway automatically detects changes and redeploys!

---

## Quick Reference - Railway Dashboard

```
Railway Dashboard
├── Deployments     → View build/runtime logs, redeploy
├── Metrics         → CPU, Memory, Network usage
├── Variables       → Environment variables (secrets)
├── Settings        → Root directory, start command, etc.
└── Usage           → Cost tracking
```

---

## Cost Expectations

**Free Trial:**
- $5 in credits (one-time)
- Usually lasts 1-2 months for a small bot

**After Trial:**
- $5/month in credits with credit card
- Small Discord bot: $3-5/month actual usage
- If bot uses <$5/month: **You pay $0**
- If bot uses >$5/month: You pay the difference

**Example:**
- Month 1: Bot uses $3.50 → You pay $0 (under $5 credit)
- Month 2: Bot uses $5.80 → You pay $0.80

---

## Next Steps

1. ✅ Deploy to Railway (follow steps above)
2. ✅ Test commands in Discord
3. ✅ Share with your league!
4. Optional: Customize embeds, add more commands

**Need help?** Check the Railway logs first - they'll tell you exactly what's wrong!

---

## Alternative: If Railway Doesn't Work

If you have issues with Railway, try these alternatives:

**1. Render (Completely Free, No CC Required)**
- Go to https://render.com
- "New +" → "Background Worker"
- Connect GitHub repo
- Root directory: `discord-bot`
- Add same environment variables
- Deploy!

**2. Oracle Cloud (Free Forever, More Setup)**
- See HOSTING-GUIDE.md for detailed instructions
- Requires setting up a Linux VM
- Completely free, no credit card, no trial limits

---

Good luck! Your bot should be live in under 15 minutes! 🚀

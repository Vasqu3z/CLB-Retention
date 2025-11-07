# Quick Start Guide

Get your CLB League Hub Discord Bot up and running in minutes!

## 🚀 Fast Track Setup (5-10 minutes)

### Step 1: Get Your Discord Bot Token (2 min)

1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name it "CLB League Bot"
3. Go to "Bot" tab → "Add Bot"
4. Copy the token (you'll need this for `.env`)
5. Go to "OAuth2" → "General" → Copy the "Client ID"
6. Go to "OAuth2" → "URL Generator"
   - Check: `bot` and `applications.commands`
   - Check: `Send Messages`, `Embed Links`
   - Copy the URL and open it to invite bot to your server

### Step 2: Get Google Sheets Access (3 min)

1. Go to https://console.cloud.google.com/
2. Create a project: "CLB Discord Bot"
3. Enable Google Sheets API:
   - "APIs & Services" → "Library" → Search "Google Sheets API" → Enable
4. Create Service Account:
   - "APIs & Services" → "Credentials" → "Create Credentials" → "Service Account"
   - Name it "clb-discord-bot" → Create → Done
5. Create Key:
   - Click the service account → "Keys" → "Add Key" → "Create New Key" → JSON
   - Download the JSON file
6. Share your spreadsheet:
   - Open your CLB League Hub spreadsheet
   - Click "Share"
   - Paste the service account email (from JSON file: `client_email`)
   - Give "Viewer" access

### Step 3: Setup Bot Locally (2 min)

```bash
cd discord-bot
npm install
cp .env.example .env
```

Edit `.env` with your values:
```env
DISCORD_TOKEN=<from Step 1>
DISCORD_CLIENT_ID=<from Step 1>
DISCORD_GUILD_ID=<right-click your server → Copy Server ID>
GOOGLE_SHEETS_SPREADSHEET_ID=<from spreadsheet URL>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from JSON>
GOOGLE_PRIVATE_KEY="<private_key from JSON>"
```

### Step 4: Deploy & Run (1 min)

```bash
npm run deploy-commands
npm start
```

Test in Discord: `/playerstats` or `/teamstats`

---

## 🌐 Deploy to Railway (24/7 Hosting) (5 min)

### Prerequisites
- GitHub account
- Railway account (free)
- Your bot working locally

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Discord bot"
   git push
   ```

2. **Deploy to Railway**
   - Go to https://railway.app/
   - "New Project" → "Deploy from GitHub repo"
   - Select your repo
   - Set root directory: `discord-bot`

3. **Add Environment Variables**
   - Click your service → "Variables" tab
   - Add each variable from your `.env` file
   - Click "Deploy"

4. **Done!** Your bot is now online 24/7

---

## 📊 Verify It Works

Try these commands in your Discord server:

```
/playerstats [start typing a name]
/teamstats [start typing a team]
/standings
```

You should see:
- Autocomplete suggestions as you type
- Nicely formatted embeds with stats
- Real-time data from your spreadsheet

---

## ❓ Common Issues

**Bot doesn't respond:**
- Wait 30 seconds after inviting bot
- Try `/` and see if commands appear
- Run `npm run deploy-commands` again

**Autocomplete doesn't work:**
- Commands deployed but bot not started
- Run `npm start`

**"Player not found":**
- Check player name spelling
- Verify spreadsheet is shared with service account
- Check `GOOGLE_SHEETS_SPREADSHEET_ID` is correct

**Authentication errors:**
- Check `GOOGLE_PRIVATE_KEY` has quotes and `\n` preserved
- Verify service account email is correct
- Ensure spreadsheet is shared properly

---

## 🎯 Next Steps

1. **Customize embeds** - Edit `src/utils/embed-builder.js`
2. **Add more commands** - Create new files in `src/commands/`
3. **Add player images** - See README.md "Future Enhancements" section
4. **Monitor bot** - Check Railway logs or local console

---

## 📚 Full Documentation

See [README.md](README.md) for:
- Detailed setup instructions
- All hosting options
- Project structure
- Troubleshooting guide
- Future enhancements

---

**Need help?** Check the console logs - they're your best friend for debugging!

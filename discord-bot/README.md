# CLB League Hub Discord Bot

A Discord bot that provides real-time player and team statistics from the CLB League Hub Google Sheets system.

## Features

- 📊 **Player Stats** - View detailed hitting, pitching, and fielding statistics for any player
- 🏆 **Team Stats** - Get comprehensive team statistics and records
- 📈 **League Standings** - Check current league standings with win-loss records
- 🔍 **Autocomplete** - Smart suggestions for player and team names as you type
- ⚡ **Real-time Data** - Pulls data directly from your Google Sheets
- 💾 **Caching** - Efficient caching to minimize API calls

## Commands

### `/playerstats [name]`
Get detailed statistics for a specific player, including:
- Hitting stats (GP, AB, H, HR, RBI, BB, K, AVG, OBP, SLG, OPS)
- Pitching stats (GP, W, L, SV, ERA, IP, BF, H, HR, R, BB, K, BAA, WHIP)
- Fielding & baserunning (GP, NP, E, SB)

### `/teamstats [teamname]`
View comprehensive team statistics including:
- Win-loss record
- Team hitting statistics
- Team pitching statistics
- Team fielding statistics

### `/standings`
Display current league standings with rankings, records, win percentages, games back, and run differential.

## Setup Instructions

### 1. Prerequisites

- Node.js 18.0.0 or higher
- A Discord Bot Token
- A Google Cloud Service Account with Sheets API access
- Your CLB League Hub Spreadsheet ID

### 2. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section
4. Click "Add Bot"
5. Under "Privileged Gateway Intents", enable:
   - Server Members Intent (optional)
   - Message Content Intent (optional)
6. Click "Reset Token" to get your bot token (save this!)
7. Go to the "OAuth2" section → "General"
8. Copy your Client ID
9. Go to "OAuth2" → "URL Generator"
10. Select scopes: `bot`, `applications.commands`
11. Select bot permissions: `Send Messages`, `Embed Links`
12. Copy the generated URL and open it to add the bot to your server

### 3. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create a Service Account:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Fill in the details and click "Create"
   - Skip granting access (click "Continue" and "Done")
5. Create a Service Account Key:
   - Click on your newly created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create New Key"
   - Choose "JSON" format
   - Save the downloaded file securely
6. Share your Google Sheet with the service account email:
   - Open your CLB League Hub spreadsheet
   - Click "Share"
   - Add the service account email (found in the JSON file as `client_email`)
   - Give it "Viewer" access

### 4. Local Installation

1. Clone or download this repository
2. Navigate to the discord-bot directory:
   ```bash
   cd discord-bot
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

5. Fill in your `.env` file with your credentials:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_GUILD_ID=your_discord_server_id
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key_here\n-----END PRIVATE KEY-----\n"
   CACHE_TTL=300
   ```

   **Finding your values:**
   - `DISCORD_TOKEN`: From Discord Developer Portal (Bot section)
   - `DISCORD_CLIENT_ID`: From Discord Developer Portal (OAuth2 → General)
   - `DISCORD_GUILD_ID`: Right-click your Discord server → "Copy Server ID" (enable Developer Mode in Discord settings first)
   - `GOOGLE_SHEETS_SPREADSHEET_ID`: From your spreadsheet URL (the long ID between `/d/` and `/edit`)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: From your JSON key file (`client_email` field)
   - `GOOGLE_PRIVATE_KEY`: From your JSON key file (`private_key` field) - keep the quotes and newlines

6. Deploy the slash commands:
   ```bash
   npm run deploy-commands
   ```

7. Start the bot:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Hosting Options

To keep your bot online 24/7, you'll need to host it on a cloud platform. Here are some recommended options:

### Option 1: Railway (Recommended - Free Tier Available)

1. Create account at [Railway.app](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository (or fork this one)
4. Set the root directory to `discord-bot`
5. Add environment variables in Railway dashboard
6. Deploy! Railway will automatically use the `railway.json` config

**Pros:** Easy setup, generous free tier ($5 credit/month), automatic deployments
**Cons:** Requires credit card for free tier

### Option 2: Render (Free Tier Available)

1. Create account at [Render.com](https://render.com/)
2. Click "New +" → "Background Worker"
3. Connect your repository
4. Set the root directory to `discord-bot`
5. Add environment variables
6. Deploy!

**Pros:** No credit card required for free tier
**Cons:** Free tier spins down after inactivity (shouldn't affect Discord bots)

### Option 3: Heroku

1. Create account at [Heroku.com](https://heroku.com/)
2. Install Heroku CLI
3. Run:
   ```bash
   cd discord-bot
   heroku create your-bot-name
   heroku config:set DISCORD_TOKEN=your_token
   # ... set other env vars
   git push heroku main
   ```

**Pros:** Well-established platform
**Cons:** No free tier anymore (starting at $7/month)

### Option 4: DigitalOcean App Platform

1. Create account at [DigitalOcean](https://www.digitalocean.com/)
2. Go to App Platform
3. Create new app from GitHub
4. Configure as a Worker
5. Set environment variables
6. Deploy

**Pros:** Reliable, good performance
**Cons:** Costs $5/month minimum

### Option 5: Docker (Any VPS)

If you have a VPS (AWS, DigitalOcean, Linode, etc.):

```bash
cd discord-bot
docker build -t clb-discord-bot .
docker run -d --env-file .env clb-discord-bot
```

## Project Structure

```
discord-bot/
├── src/
│   ├── commands/           # Slash command handlers
│   │   ├── playerstats.js
│   │   ├── teamstats.js
│   │   └── standings.js
│   ├── config/
│   │   └── league-config.js # League stat mappings
│   ├── services/
│   │   └── sheets-service.js # Google Sheets data access
│   ├── utils/
│   │   └── embed-builder.js  # Discord embed formatters
│   ├── index.js             # Main bot file
│   └── deploy-commands.js   # Command registration script
├── .env.example            # Environment variable template
├── .gitignore
├── Dockerfile
├── package.json
├── railway.json            # Railway deployment config
├── render.yaml             # Render deployment config
└── README.md
```

## Caching

The bot implements intelligent caching to minimize API calls to Google Sheets:
- Default cache TTL: 300 seconds (5 minutes)
- Cache is invalidated after successful data fetch
- Adjust `CACHE_TTL` in your `.env` file if needed

## Future Enhancements

### Player & Team Images

To add images to embeds in the future:

1. **Option A: Google Sheet Column**
   - Add an "Image URL" column to Player Data and Team Data sheets
   - Modify `sheets-service.js` to read these URLs
   - Update embed builders to use `.setThumbnail()` or `.setImage()`

2. **Option B: External Storage**
   - Upload images to a CDN (Imgur, Cloudinary, etc.)
   - Create a mapping file (e.g., `images.json`)
   - Reference in embed builders

3. **Option C: Discord Attachments**
   - Store images in a Discord channel
   - Reference message attachment URLs

Example embed modification:
```javascript
embed.setThumbnail(playerData.imageUrl);
embed.setImage(teamData.logoUrl);
```

## Troubleshooting

### Bot not responding to commands
- Ensure bot has been invited with correct permissions
- Run `npm run deploy-commands` again
- Check bot is online in Discord
- Verify environment variables are correct

### "Player/Team not found" errors
- Check spelling and capitalization
- Ensure Google Sheets data is up to date
- Verify service account has access to spreadsheet
- Check spreadsheet ID is correct

### Authentication errors
- Verify `GOOGLE_PRIVATE_KEY` has proper formatting with `\n` for newlines
- Ensure service account email is correct
- Check that spreadsheet is shared with service account
- Verify Google Sheets API is enabled in Google Cloud Console

### Commands not showing up
- Guild commands update instantly
- Global commands can take up to 1 hour
- Use `DISCORD_GUILD_ID` for testing (faster updates)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check console logs for error messages
4. Ensure Google Sheets structure matches expected format

## License

MIT

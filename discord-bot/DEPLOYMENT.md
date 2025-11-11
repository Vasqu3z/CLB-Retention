# Railway Deployment Guide

This guide explains how to deploy the CLB League Discord Bot to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Discord Bot Token**: Create a bot at [Discord Developer Portal](https://discord.com/developers/applications)
3. **Google Service Account**: Set up Google Sheets API access

## Deployment Steps

### 1. Connect Repository to Railway

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your `CLB-League-Hub` repository
4. Railway will automatically detect the Dockerfile

### 2. Configure Root Directory

Since the bot is in a subdirectory:

1. In Railway dashboard, go to **Settings**
2. Under **Build**, set **Root Directory** to: `discord-bot`
3. Click **Save**

### 3. Set Environment Variables

In Railway dashboard, go to **Variables** and add:

#### Discord Configuration
```
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_id
DISCORD_GUILD_ID=your_server_guild_id
```

#### Google Sheets Configuration
```
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n
```

#### Optional Configuration
```
CACHE_TTL=300
NODE_ENV=production
```

**Important**: For `GOOGLE_PRIVATE_KEY`, paste the entire private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. Keep the `\n` characters for newlines.

### 4. Deploy Commands

After initial deployment, you need to register Discord slash commands:

1. In Railway dashboard, click on your service
2. Go to the **Settings** tab
3. Scroll to **Deploy** section
4. Click **Redeploy**

Alternatively, run locally:
```bash
cd discord-bot
npm install
npm run deploy-commands
```

### 5. Verify Deployment

1. Check Railway logs for "Bot is online!" message
2. Go to your Discord server
3. Type `/` and verify CLB commands appear
4. Test with `/standings` or `/schedule`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal | `MTIzNDU2Nzg5MDEyMzQ1Njc4...` |
| `DISCORD_CLIENT_ID` | Application ID from Discord | `1234567890123456789` |
| `DISCORD_GUILD_ID` | Your Discord server ID | `9876543210987654321` |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Google Sheets ID from URL | `1AbC2DeF3GhI...` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | `bot@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Private key from service account JSON | `-----BEGIN PRIVATE KEY-----\n...` |
| `CACHE_TTL` | Cache duration in seconds (optional) | `300` |
| `NODE_ENV` | Environment (optional) | `production` |

## Troubleshooting

### Bot not responding
- Check Railway logs for errors
- Verify `DISCORD_TOKEN` is correct
- Ensure bot has proper Discord permissions

### Commands not showing up
- Run `npm run deploy-commands` to register commands
- Check `DISCORD_CLIENT_ID` and `DISCORD_GUILD_ID` are correct
- Wait a few minutes for Discord to sync

### Google Sheets errors
- Verify service account has access to the spreadsheet
- Check `GOOGLE_PRIVATE_KEY` formatting (must include `\n` for newlines)
- Ensure Google Sheets API is enabled in Google Cloud Console

### Railway-specific issues
- Verify **Root Directory** is set to `discord-bot`
- Check that Dockerfile is being detected
- Review deployment logs in Railway dashboard

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Alerts**: Set up notifications for deployment failures

## Updating the Bot

Railway automatically redeploys when you push to your GitHub repository:

1. Make changes to the code
2. Commit and push to GitHub
3. Railway automatically detects changes and redeploys

## Cost

Railway offers:
- **Free Tier**: $5 credit per month
- **Pro Plan**: $20/month for more resources

The Discord bot should run comfortably within the free tier.

## Support

For issues:
- Check Railway logs first
- Review Discord bot permissions
- Verify environment variables are set correctly

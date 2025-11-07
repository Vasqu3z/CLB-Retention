# Oracle Cloud Free Tier Deployment Guide

## Why Oracle Cloud?

✅ **FREE FOREVER** - Not a trial, actually free
✅ **Generous Resources** - 4 vCPUs, 24GB RAM (way more than needed)
✅ **Always On** - Your bot runs 24/7
✅ **Full Control** - It's your own Linux server

**Cost: $0/month forever**

---

## Part 1: Create Oracle Cloud Account (5-10 minutes)

### Step 1: Sign Up

1. Go to **https://www.oracle.com/cloud/free/**
2. Click **"Start for free"**
3. Fill out the form:
   - **Email** - Use a valid email
   - **Country** - Select your country
   - **Name** - Your actual name
4. Click **"Verify my email"**
5. Check your email and click the verification link
6. Create a password
7. **Important:** Choose your **Home Region** carefully
   - This CANNOT be changed later
   - Choose one close to you (e.g., US East, US West, UK South, etc.)
   - Click **"Continue"**

### Step 2: Account Verification

1. Enter your **Address** information
2. Add a **Payment Method**
   - ⚠️ **You will NOT be charged** - This is just for verification
   - Oracle requires a credit card but won't charge you for free tier
   - You cannot upgrade to paid without explicit action
3. Click **"Add payment verification details"**
4. Agree to terms and click **"Start my free trial"**
5. Wait for account provisioning (1-5 minutes)
6. You'll see "Your Cloud Account is ready!"

---

## Part 2: Create Your Free Compute Instance (10-15 minutes)

### Step 1: Access the Console

1. After account creation, you'll be at the **Oracle Cloud Console**
2. If not, go to **https://cloud.oracle.com/** and sign in
3. You'll see the main dashboard

### Step 2: Create a Compute Instance

1. Click the **☰ hamburger menu** (top left)
2. Go to **Compute** → **Instances**
3. Make sure you're in the correct **Compartment**:
   - Look for the "Compartment" dropdown (left side)
   - Select **root** or your compartment name
4. Click **"Create Instance"**

### Step 3: Configure Instance (Important Settings!)

**Name:**
```
clb-discord-bot
```

**Placement:**
- Leave as default

**Image and Shape:**

1. **Image**: Click **"Change Image"**
   - Select **"Canonical Ubuntu"** (20.04 or 22.04 - either works)
   - Click **"Select Image"**

2. **Shape**: Click **"Change Shape"**
   - Select **"Ampere"** (ARM-based processors)
   - Select **"VM.Standard.A1.Flex"**
   - Set OCPUs: **2** (you can use up to 4 on free tier)
   - Memory: **12 GB** (you can use up to 24 GB on free tier)
   - Click **"Select Shape"**

**⚠️ Important:** If you can't select A1.Flex (says "Out of capacity"):
- Try a different Availability Domain (dropdown above Shape)
- Or try at a different time of day
- Or use AMD shape: **VM.Standard.E2.1.Micro** (1/8 OCPU, 1GB RAM - less powerful but still free)

**Networking:**
- Leave as default - it will create a VCN (Virtual Cloud Network) for you
- Make sure **"Assign a public IPv4 address"** is checked ✅

**Add SSH Keys:**

⚠️ **CRITICAL STEP** - You need SSH keys to access your server!

**Option A: Generate SSH Keys in Oracle Cloud (Easiest)**
1. Select **"Generate a key pair for me"**
2. Click **"Save Private Key"** - Downloads `ssh-key-*.key`
3. Click **"Save Public Key"** - Downloads `ssh-key-*.key.pub`
4. **Save these files somewhere safe!** You can't download them again

**Option B: Use Your Own SSH Keys (If you have them)**
1. Select **"Upload public key files (.pub)"**
2. Upload your existing public key

**Boot Volume:**
- Leave as default (50 GB is plenty)

### Step 4: Create the Instance

1. Review everything
2. Click **"Create"** (bottom of page)
3. Wait 1-2 minutes while instance provisions
4. Status will change from **"PROVISIONING"** → **"RUNNING"** (orange → green)

### Step 5: Note Your Instance Details

Once running, you'll see:
- **Public IP Address** - Write this down! (e.g., 150.136.x.x)
- **Username** - `ubuntu` (for Ubuntu images)

---

## Part 3: Connect to Your Server via SSH (5 minutes)

### On macOS / Linux:

1. Open **Terminal**
2. Move your private key to a safe location:
   ```bash
   mkdir -p ~/.ssh
   mv ~/Downloads/ssh-key-*.key ~/.ssh/oracle-clb-bot.key
   chmod 400 ~/.ssh/oracle-clb-bot.key
   ```
3. Connect to your instance:
   ```bash
   ssh -i ~/.ssh/oracle-clb-bot.key ubuntu@YOUR_PUBLIC_IP
   ```
   Replace `YOUR_PUBLIC_IP` with the IP from Step 5 above

4. Type **"yes"** when asked about fingerprint
5. You're in! You should see `ubuntu@clb-discord-bot:~$`

### On Windows:

**Option A: Use PowerShell (Windows 10+)**
1. Open **PowerShell**
2. Move your key:
   ```powershell
   move Downloads\ssh-key-*.key $env:USERPROFILE\.ssh\oracle-clb-bot.key
   ```
3. Connect:
   ```powershell
   ssh -i $env:USERPROFILE\.ssh\oracle-clb-bot.key ubuntu@YOUR_PUBLIC_IP
   ```

**Option B: Use PuTTY**
1. Download PuTTY from https://www.putty.org/
2. Convert the `.key` file to `.ppk` using PuTTYgen
3. Use PuTTY to connect with the converted key

---

## Part 4: Install Node.js and Dependencies (5 minutes)

You're now connected to your Ubuntu server. Run these commands:

### Step 1: Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 3: Verify Installation
```bash
node --version
# Should show: v18.x.x

npm --version
# Should show: 9.x.x or 10.x.x
```

### Step 4: Install Git and PM2
```bash
sudo apt install -y git
sudo npm install -g pm2
```

---

## Part 5: Deploy Your Discord Bot (10 minutes)

### Step 1: Clone Your Repository

**If your repo is public:**
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/CLB-League-Hub.git
cd CLB-League-Hub/discord-bot
```

**If your repo is private:**
```bash
# First, create a GitHub Personal Access Token:
# 1. Go to GitHub.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
# 2. Generate new token → Check "repo" scope → Generate
# 3. Copy the token (you won't see it again!)

# Then clone:
cd ~
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/CLB-League-Hub.git
cd CLB-League-Hub/discord-bot
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File

Create your `.env` file with your credentials:

```bash
nano .env
```

This opens a text editor. Paste this and **replace with your actual values**:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_application_id_here
DISCORD_GUILD_ID=your_discord_server_id_here

GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_here
-----END PRIVATE KEY-----
"

CACHE_TTL=300
```

**To save:**
- Press `Ctrl + O` (WriteOut)
- Press `Enter` (confirm filename)
- Press `Ctrl + X` (exit)

**⚠️ IMPORTANT for GOOGLE_PRIVATE_KEY:**
- Include the full key with line breaks (not `\n`)
- Keep the quotes around it
- Should look like:
  ```
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
  MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
  (multiple lines)
  ...aBcDeFg==
  -----END PRIVATE KEY-----
  "
  ```

### Step 4: Deploy Slash Commands

Run this ONCE to register your slash commands with Discord:

```bash
npm run deploy-commands
```

You should see:
```
✅ Loaded command: playerstats
✅ Loaded command: teamstats
✅ Loaded command: standings
🔄 Started refreshing 3 application (/) commands.
✅ Successfully registered 3 guild commands.
```

### Step 5: Test the Bot (Optional)

Before setting up PM2, test that it works:

```bash
npm start
```

You should see:
```
✅ Loaded command: playerstats
✅ Loaded command: teamstats
✅ Loaded command: standings
✅ Logged in as YourBotName#1234
🤖 Bot is ready and serving 1 server(s)!
```

Go to Discord and check:
- Bot should be **online** (green dot)
- Try typing `/` - commands should appear
- Test `/standings`

If it works, press `Ctrl + C` to stop it. Now let's set up PM2 to keep it running forever!

---

## Part 6: Setup PM2 for 24/7 Operation (5 minutes)

PM2 will keep your bot running even after:
- Server reboots
- Bot crashes
- You disconnect from SSH

### Step 1: Start Bot with PM2

```bash
pm2 start src/index.js --name clb-bot
```

You should see:
```
┌────┬────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id │ name       │ mode        │ ↺       │ status  │ cpu      │
├────┼────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0  │ clb-bot    │ fork        │ 0       │ online  │ 0%       │
└────┴────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### Step 2: Save PM2 Configuration

```bash
pm2 save
```

This saves the current PM2 process list.

### Step 3: Setup Auto-Start on Boot

```bash
pm2 startup
```

This will output a command like:
```
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**Copy that entire command and run it:**
```bash
# Paste the command PM2 gave you and run it
```

### Step 4: Verify Everything is Running

```bash
pm2 status
```

Should show:
```
│ 0  │ clb-bot    │ online  │
```

### Step 5: View Bot Logs

```bash
pm2 logs clb-bot
```

You should see the bot startup messages. Press `Ctrl + C` to exit logs.

---

## Part 7: Verify in Discord (2 minutes)

1. Go to your Discord server
2. Bot should be **online** (green dot)
3. Type `/` and see your commands:
   - `/playerstats`
   - `/teamstats`
   - `/standings`
4. Test each command!

---

## Part 8: Useful PM2 Commands

### Check Bot Status
```bash
pm2 status
```

### View Logs (real-time)
```bash
pm2 logs clb-bot
```

### Restart Bot
```bash
pm2 restart clb-bot
```

### Stop Bot
```bash
pm2 stop clb-bot
```

### Start Bot
```bash
pm2 start clb-bot
```

### View More Details
```bash
pm2 show clb-bot
```

### Monitor CPU/Memory Usage
```bash
pm2 monit
```

---

## Part 9: Updating Your Bot in the Future

When you make changes to your code and push to GitHub:

```bash
# SSH into your Oracle Cloud instance
ssh -i ~/.ssh/oracle-clb-bot.key ubuntu@YOUR_PUBLIC_IP

# Navigate to bot directory
cd ~/CLB-League-Hub

# Pull latest changes
git pull origin claude/discord-bot-clb-league-011CUsopH7vRYQZ5LLThBaMG

# Restart bot
cd discord-bot
npm install  # If you added new dependencies
pm2 restart clb-bot
```

---

## Troubleshooting

### "Out of capacity for shape VM.Standard.A1.Flex"
- Try different Availability Domains (dropdown in instance creation)
- Try different times of day (evenings are busy)
- Use AMD shape instead: VM.Standard.E2.1.Micro (less powerful but still free)
- Check other regions if you haven't created the instance yet

### Can't SSH in
- Check you're using the correct private key file
- Make sure key has correct permissions: `chmod 400 keyfile.key`
- Verify you're using the correct username: `ubuntu`
- Check the public IP is correct

### Bot shows offline in Discord
```bash
pm2 logs clb-bot
```
Look for errors:
- **Authentication errors** → Check `.env` file, especially `GOOGLE_PRIVATE_KEY`
- **Discord token invalid** → Double-check `DISCORD_TOKEN`
- **Module not found** → Run `npm install` again

### Commands don't appear in Discord
- Make sure you ran `npm run deploy-commands`
- Wait a few minutes for guild commands to register
- Try kicking and re-inviting the bot

### Bot keeps crashing
```bash
pm2 logs clb-bot --err
```
Check error logs for specific issues.

### Forgot SSH key
If you lost your SSH key, you can't recover it. Options:
1. Create a new instance
2. Or use Oracle Cloud Console to access instance console (slower)

---

## Cost Breakdown

### What's Free Forever:
- ✅ VM.Standard.A1.Flex: Up to 4 OCPUs, 24GB RAM
- ✅ 2x VM.Standard.E2.1.Micro (AMD): 1/8 OCPU, 1GB RAM each
- ✅ 200 GB Block Storage total
- ✅ 10 TB outbound data transfer per month
- ✅ Load Balancer (1 instance)

### What You're Using:
- 1x VM.Standard.A1.Flex (2 OCPUs, 12GB RAM)
- ~10 GB storage
- ~1-2 GB outbound transfer per month

**Total Cost: $0/month** ✅

Oracle will **never** charge you for free tier resources unless you:
1. Manually upgrade to paid
2. Explicitly create paid resources

---

## Security Best Practices

### Change SSH Port (Optional, Advanced)
```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
sudo systemctl restart sshd
```

### Enable Automatic Security Updates
```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Keep .env Secure
Your `.env` file contains secrets. Never:
- Commit it to GitHub
- Share it publicly
- Post logs that might contain it

---

## You're Done! 🎉

Your Discord bot is now:
- ✅ Running 24/7 on Oracle Cloud
- ✅ Completely free forever
- ✅ Auto-restarts on crashes
- ✅ Starts automatically on server reboot
- ✅ Pulling live data from Google Sheets

Check your Discord server - the bot should be online and responding to commands!

---

## Quick Reference Card

**SSH into server:**
```bash
ssh -i ~/.ssh/oracle-clb-bot.key ubuntu@YOUR_IP
```

**View logs:**
```bash
pm2 logs clb-bot
```

**Restart bot:**
```bash
pm2 restart clb-bot
```

**Update bot:**
```bash
cd ~/CLB-League-Hub && git pull
cd discord-bot && pm2 restart clb-bot
```

**Stop bot:**
```bash
pm2 stop clb-bot
```

**Start bot:**
```bash
pm2 start clb-bot
```

---

Need help? Check the logs first - they'll tell you what's wrong!
```bash
pm2 logs clb-bot
```

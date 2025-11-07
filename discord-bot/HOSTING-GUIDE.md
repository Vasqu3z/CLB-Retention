# Discord Bot Hosting Guide

## Cost Breakdown

### Google Cloud Costs: $0/month ✅
The Google Sheets API is **completely free** for this bot:
- 300 read requests/minute limit (you'll use ~5-10/minute max)
- 1M+ requests per day
- No direct costs, only quotas

**The only cost is hosting the bot process itself.**

---

## Free Hosting Options (Recommended)

### 1. Oracle Cloud Free Tier ⭐ BEST FREE OPTION
**Cost:** $0/month FOREVER

**What you get:**
- ARM-based compute instance (4 OCPUs, 24GB RAM)
- Or 2x AMD instances (1/8 OCPU, 1GB RAM each)
- Always free, no credit card trial

**Setup:**
1. Create account at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Create a Compute Instance (VM.Standard.A1.Flex)
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```
4. Clone your repo and setup:
   ```bash
   git clone <your-repo>
   cd discord-bot
   npm install
   npm install -g pm2
   ```
5. Create `.env` file with your credentials
6. Run with PM2 (keeps bot alive):
   ```bash
   pm2 start src/index.js --name clb-bot
   pm2 save
   pm2 startup  # Follow the command it gives you
   ```

**Pros:**
- Truly free forever (not a trial)
- Generous resources
- Full control

**Cons:**
- More technical setup
- You manage the server

---

### 2. Render Free Tier
**Cost:** $0/month

**What you get:**
- Background worker (perfect for Discord bots)
- Automatic deploys from GitHub
- 750 hours/month free

**Setup:**
1. Go to [render.com](https://render.com)
2. Sign up (no credit card required)
3. "New +" → "Background Worker"
4. Connect your GitHub repo
5. Root directory: `discord-bot`
6. Build command: `npm install`
7. Start command: `npm start`
8. Add environment variables
9. Deploy!

**Pros:**
- Zero configuration
- No credit card needed
- Auto-deploys on git push

**Cons:**
- Free tier may spin down with inactivity (usually not an issue for bots)

---

### 3. Fly.io Free Tier
**Cost:** $0/month (up to 3 shared VMs)

**What you get:**
- 3 shared-cpu-1x VMs (256MB RAM each)
- 3GB persistent storage total
- 160GB outbound transfer

**Setup:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. In discord-bot directory:
   ```bash
   fly launch
   # Follow prompts, use Dockerfile
   ```
4. Set secrets:
   ```bash
   fly secrets set DISCORD_TOKEN=xxx
   fly secrets set DISCORD_CLIENT_ID=xxx
   # ... etc
   ```
5. Deploy: `fly deploy`

**Pros:**
- Good free tier
- Uses your Dockerfile
- Fast deployments

**Cons:**
- Requires credit card (for verification, not charged)

---

## Low-Cost Options ($5-10/month)

### 4. Railway ⭐ EASIEST PAID OPTION
**Cost:** $5/month for ~$5 worth of usage (covers small bots easily)

**What you get:**
- Pay-as-you-go after $5 trial credit
- Estimated ~$5/month for 24/7 bot
- Automatic deploys
- Built-in logging

**Setup:**
1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Select your repo
4. Set root directory: `discord-bot`
5. Add environment variables
6. Deploy (uses railway.json automatically)

**Pros:**
- Stupidly easy
- Great developer experience
- Excellent logging

**Cons:**
- Requires credit card
- Not free (but very cheap)

---

### 5. DigitalOcean Droplet
**Cost:** $4-6/month

**What you get:**
- Basic Droplet (512MB-1GB RAM)
- Full Linux server
- Can host multiple bots/projects

**Setup:**
Similar to Oracle Cloud but you pay monthly.

**Pros:**
- Cheap
- Reliable
- Full control

**Cons:**
- Manual server management
- Need basic Linux knowledge

---

### 6. PebbleHost (VPS)
**Cost:** $1-3/month for basic VPS

**What you get:**
- Minecraft hosting company also offers cheap VPS
- Good for small bots

**Pros:**
- Very cheap
- Simple control panel

**Cons:**
- Limited resources on cheapest tiers

---

## Not Recommended (But Possible)

### 7. Heroku
**Cost:** $7/month minimum (no free tier anymore)

Used to be the go-to, but they killed the free tier in 2022.

### 8. AWS/GCP/Azure
**Cost:** Variable, typically $5-20/month

Overkill for a Discord bot. Their free tiers are complex and time-limited.

---

## Self-Hosting (Free if you have hardware)

### Raspberry Pi
**Cost:** $35-75 one-time + electricity (~$1/month)

**Setup:**
1. Install Raspberry Pi OS
2. Install Node.js
3. Clone repo, install dependencies
4. Use PM2 to keep bot running
5. Configure to start on boot

**Pros:**
- One-time cost
- Learn Linux/networking
- Full control

**Cons:**
- Requires hardware
- Depends on your home internet
- You're responsible for uptime

### Old Laptop/Desktop
**Cost:** Free if you have one lying around

Same setup as Raspberry Pi. Just install Linux and follow the steps.

---

## Recommendation Based on Your Needs

### For Zero Cost:
**Oracle Cloud Free Tier** - Best bang for your buck (it's free!), but requires some Linux knowledge.

**Alternative:** Render Free Tier - Easier, but may have limitations.

### For Ease of Use:
**Railway ($5/month)** - Worth it if you want zero hassle and excellent developer experience.

### For Learning:
**Raspberry Pi** - Great project, one-time cost, learn valuable skills.

---

## Cost Comparison Table

| Option | Monthly Cost | Setup Difficulty | Reliability | Notes |
|--------|--------------|------------------|-------------|-------|
| Oracle Cloud | $0 | Medium | High | Best free option |
| Render | $0 | Very Easy | Medium | May spin down |
| Fly.io | $0 | Easy | High | Requires CC |
| Railway | ~$5 | Very Easy | High | Best paid option |
| DigitalOcean | $4-6 | Medium | High | Classic VPS |
| Raspberry Pi | ~$1* | Medium | Medium | *Electricity only |
| Heroku | $7+ | Easy | High | Expensive for bots |

---

## FAQ

**Q: What about Google Cloud Functions?**
A: Won't work - Discord bots need persistent WebSocket connections. Cloud Functions are for request/response.

**Q: Can I use GitHub Actions to run the bot?**
A: No - Actions have time limits and aren't meant for persistent processes.

**Q: What about Replit?**
A: Possible on paid plan ($7/month), but free tier requires browser tab open. Not recommended.

**Q: How much bandwidth does a Discord bot use?**
A: Very little - typically 50-200MB/month for small bots. All the options above include plenty.

**Q: Do I need a VPS with Docker support?**
A: No, but it makes deployments easier. Node.js directly on the server works fine.

---

## My Recommendation

Start with **Oracle Cloud Free Tier** or **Render Free Tier**:

- If comfortable with Linux: **Oracle Cloud** (free forever, great resources)
- If you want easy button: **Render** (free, auto-deploys, zero config)
- If willing to pay for convenience: **Railway** ($5/month, best DX)

All three will cost you **$0 in Google Sheets API fees** - that part is completely free regardless of hosting choice!

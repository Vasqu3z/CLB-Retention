# Comets League Baseball - Setup Guide

This guide will walk you through setting up your local environment and deploying to Vercel.

## ✅ Prerequisites Complete

You've already completed:
- [x] Google Cloud project created
- [x] Service Account created
- [x] JSON credentials downloaded
- [x] Spreadsheet shared with service account
- [x] Project files created

---

## 🚀 Next Steps

### Step 1: Configure Environment Variables

1. Copy the environment template:
```bash
cd /home/user/comets-league-baseball
cp .env.example .env.local
```

2. Edit `.env.local` with your credentials:

```env
# Your spreadsheet ID
SHEETS_SPREADSHEET_ID=1xHZxIgXXzb9h-pL6gqhMJesw4q63XFyfU5wst-09BHY

# Paste your entire service account JSON file here (one line)
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}
```

**Tips:**
- The spreadsheet ID is already set (from the URL you provided)
- For `GOOGLE_CREDENTIALS`, open your downloaded JSON file and copy the entire contents
- Paste it as a single line (you can use an online JSON minifier if needed)

### Step 2: Test the Development Server

1. Start the dev server:
```bash
npm run dev
```

2. Open your browser to [http://localhost:3000](http://localhost:3000)

3. Navigate to "Standings" - you should see your league standings!

**If you see an error:**
- Check that `.env.local` exists
- Verify the JSON credentials are valid
- Ensure the service account has access to the spreadsheet
- Restart the dev server after changing `.env.local`

### Step 3: Verify the Standings Page

The Standings page should display:
- Team rankings
- Win/Loss records
- Run differential
- Color-coded team names

**If data looks wrong:**
- Check that your sheet is named exactly "🏆 Rankings"
- Verify the data is in rows 4-11, columns A-H
- Check the Google Sheets cell references in `lib/sheets.ts`

---

## 📦 Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Fastest)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd /home/user/comets-league-baseball
vercel
```

3. Follow the prompts:
   - "Set up and deploy?" → Yes
   - "Which scope?" → Your personal account
   - "Link to existing project?" → No
   - "What's your project's name?" → comets-league-baseball
   - "In which directory is your code located?" → ./
   - "Want to override settings?" → No

4. Add environment variables:
```bash
vercel env add SHEETS_SPREADSHEET_ID
# Paste: 1xHZxIgXXzb9h-pL6gqhMJesw4q63XFyfU5wst-09BHY

vercel env add GOOGLE_CREDENTIALS
# Paste your entire JSON credentials
```

5. Deploy to production:
```bash
vercel --prod
```

Your site will be live at `https://comets-league-baseball.vercel.app`

### Option 2: Deploy via Vercel Dashboard

1. Push code to GitHub:
```bash
cd /home/user/comets-league-baseball
git init
git add .
git commit -m "Initial commit: Comets League Baseball website"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)

3. Click "Import Project"

4. Select your GitHub repository

5. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: (leave default)

6. Add Environment Variables:
   - Name: `SHEETS_SPREADSHEET_ID`
   - Value: `1xHZxIgXXzb9h-pL6gqhMJesw4q63XFyfU5wst-09BHY`

   - Name: `GOOGLE_CREDENTIALS`
   - Value: (paste your entire JSON file)

7. Click "Deploy"

8. Wait 2-3 minutes

9. Click the generated URL to view your site!

---

## 🧪 Testing Checklist

After deployment, verify:

- [ ] Home page loads
- [ ] Navigation links work
- [ ] Standings page displays correct data
- [ ] Team names link to team pages (404 for now - that's OK)
- [ ] Mobile view looks good
- [ ] Page loads in < 3 seconds

---

## 🐛 Troubleshooting

### Error: "Cannot read sheet data"

**Solution:**
1. Verify service account email has access to spreadsheet
2. Check spreadsheet ID is correct
3. Ensure `GOOGLE_CREDENTIALS` is valid JSON

### Error: "Module not found: @/config/league"

**Solution:**
1. Run `npm install`
2. Restart dev server
3. Check `tsconfig.json` has correct path mapping

### Standings page shows empty/wrong data

**Solution:**
1. Check sheet name is exactly "🏆 Rankings"
2. Verify data is in rows 4-11, columns A-H
3. Check that "Update All" has been run in Apps Script

### Deployment fails on Vercel

**Solution:**
1. Check build logs for errors
2. Verify environment variables are set
3. Ensure `next.config.js` exists
4. Try deploying again (sometimes it's a temporary issue)

---

## 📊 Next Steps After Deployment

### Phase 1 Features to Build:

1. **League Leaders Page** (`/leaders`)
   - Display top 5 in each category
   - Filterable by stat
   - Estimated: 6-8 hours

2. **Schedule Page** (`/schedule`)
   - List games by week
   - Filter by team
   - Show results
   - Estimated: 10-12 hours

3. **Team Pages** (`/teams/[slug]`)
   - Display roster
   - Show team stats
   - List team schedule
   - **This is the big one** - eliminates 50% of UpdateAll time
   - Estimated: 18-22 hours

4. **Modify Apps Script**
   - Comment out team sheet updates in `LeagueCore.js`
   - Measure new UpdateAll time (~30s expected)

### Phase 2 Features:

5. **Transaction Timeline** (`/transactions`)
6. **Historical Archives** (`/seasons`)
7. **All-Time Leaders** (`/all-time`)

---

## 📞 Need Help?

If you encounter issues:

1. Check the error message carefully
2. Review this guide's troubleshooting section
3. Check the README.md for additional info
4. Verify your Google Cloud setup
5. Test locally before deploying

---

## 🎉 Success Criteria

You'll know everything is working when:

✅ Local dev server runs without errors
✅ Standings page displays your league data
✅ Site is deployed to Vercel
✅ Navigation works on all pages
✅ Mobile view looks good

**Congratulations! You've successfully set up the Comets League Baseball website!** 🚀⚾

---

**Next:** Start building the Leaders page or Schedule page!

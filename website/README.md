# Comets League Baseball (CLB) Web Application

Modern web interface for Comets League Baseball statistics and standings.

## Features

- 🏆 **League Standings** - Real-time standings with team records
- 📊 **League Leaders** - Top performers in batting, pitching, and fielding
- 📅 **Schedule** - Game schedule and results
- 🧢 **Team Pages** - Team rosters and statistics
- 📱 **Mobile-Friendly** - Responsive design for all devices
- ⚡ **Fast Loading** - Server-side rendering with Next.js
- 🎯 **Consistent Motion** - Shared animation tokens with reduced-motion support

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Source:** Google Sheets API
- **Hosting:** Vercel (free tier)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Cloud account (free)
- Access to the CLB Google Sheets spreadsheet

### 1. Clone the Repository

```bash
cd /home/user/comets-league-baseball
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "CLB League Hub"
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name it "clb-sheets-reader"
   - Click "Create and Continue"
   - Skip roles and permissions (click "Continue")
   - Click "Done"
5. Create a Key:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" → "Create New Key"
   - Choose JSON format
   - Download the JSON file (keep it safe!)
6. Share your spreadsheet:
   - Open your Google Sheets spreadsheet
   - Click "Share"
   - Paste the service account email (from the JSON file)
   - Give it "Viewer" access

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Your spreadsheet ID (from the URL)
SHEETS_SPREADSHEET_ID=1xHZxIgXXzb9h-pL6gqhMJesw4q63XFyfU5wst-09BHY

# Paste the entire contents of your service account JSON file
# Replace newlines with \\n if pasting directly
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
comets-league-baseball/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── standings/         # Standings page
│   ├── leaders/           # League leaders page (TODO)
│   ├── schedule/          # Schedule page (TODO)
│   └── teams/             # Team pages (TODO)
├── components/            # React components
│   ├── Header.tsx         # Site header
│   └── Footer.tsx         # Site footer
├── config/                # Configuration files
│   └── league.ts          # League config (teams, colors, etc.)
├── lib/                   # Utility libraries
│   └── sheets.ts          # Google Sheets API integration
├── public/                # Static files
├── docs/                  # Design and animation checklists
└── README.md              # This file
```

## Animation Standards

Motion should use the shared tokens and variants defined in `components/animations`.
Before shipping any animation changes, review the [Animation Pre-Ship Checklist](./docs/animation-checklist.md).

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - `SHEETS_SPREADSHEET_ID`
   - `GOOGLE_CREDENTIALS`
6. Click "Deploy"

Your site will be live at `https://your-app.vercel.app`

### Custom Domain (Optional)

1. Buy a domain (e.g., clbleague.com)
2. In Vercel, go to your project settings
3. Click "Domains"
4. Add your custom domain
5. Update DNS records as instructed

## Development Roadmap

### Phase 1 (Current)
- [x] Project setup
- [x] Basic layout (Header, Footer)
- [x] League configuration
- [x] Google Sheets API integration
- [x] Standings page
- [ ] League Leaders page
- [ ] Schedule page
- [ ] Team pages

### Phase 2
- [ ] Transaction timeline
- [ ] Historical season archives
- [ ] All-time leaders
- [ ] Player career stats
- [ ] Mobile menu
- [ ] Search functionality

### Phase 3
- [ ] Box score pages
- [ ] Enhanced player comparison
- [ ] Retention grades viewer
- [ ] Advanced analytics
- [ ] Dark mode

## Modifying Apps Script

Once the Team Pages feature is implemented, you can optimize the Apps Script:

```javascript
// In LeagueCore.js - updateAll() function
// Comment out Step 3 (Update team sheets):

// STEP 3: DEPRECATED - Website now handles team pages
var step3Time = 0; // Skip team sheets
```

This will reduce "Update All" time by 40-50%.

## Troubleshooting

### "Cannot read sheet data"
- Verify the service account has access to the spreadsheet
- Check that the spreadsheet ID is correct
- Ensure GOOGLE_CREDENTIALS is valid JSON

### "Module not found: @/config/league"
- Run `npm install` to install dependencies
- Check that tsconfig.json has the correct path mapping

### "Spreadsheet ID not provided"
- Make sure `.env.local` exists and has `SHEETS_SPREADSHEET_ID`
- Restart the dev server after changing environment variables

## Contributing

This is a private league project. For questions or issues, contact the commissioner.

## License

Private - Comets League Baseball

---

**Built with ❤️ for CLB**

# SharpEdge — AI Sports Betting Analytics

> For informational and entertainment purposes only. See disclaimer in app.

## What This Is
A full-stack sports analytics web app that:
- Pulls **live odds** from DraftKings, FanDuel, BetMGM via The Odds API
- Pulls **team stats + standings** via API-Sports (NFL + NBA)
- Uses **Claude AI** to generate structured pick analysis based on real data
- Tracks your bets with full P/L and ROI dashboard
- **Your API keys stay hidden** — users hit /api/ endpoints, never your keys

---

## Deploy in 10 Minutes

### Step 1 — Get your free API keys

| Service | Free Tier | Sign Up |
|---|---|---|
| The Odds API | 500 req/month | https://the-odds-api.com |
| API-Sports | 100 req/day | https://api-sports.io |
| Anthropic | Pay per use (~$0.01/pick) | https://console.anthropic.com |

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "SharpEdge v1"
git remote add origin https://github.com/YOURUSERNAME/sharpedge.git
git push -u origin main
```

### Step 3 — Deploy to Vercel
1. Go to https://vercel.com → Sign up free
2. Click "Add New Project" → Import your GitHub repo
3. Go to **Settings → Environment Variables** and add:
   - `ODDS_API_KEY` = your key from the-odds-api.com
   - `API_SPORTS_KEY` = your key from api-sports.io
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
4. Click **Deploy**

Your app is live at `https://sharpedge-YOURNAME.vercel.app`

---

## Data Sources

```
User requests a pick
        ↓
/api/odds.js  → The Odds API (live spreads, ML, O/U from DraftKings/FanDuel/BetMGM)
/api/stats.js → API-Sports (NFL/NBA standings) + balldontlie (NBA player stats, free)
        ↓
All data bundled → /api/picks.js → Claude AI generates structured analysis
        ↓
Pick displayed to user (with real odds numbers as context)
```

**Why not StatMuse?**
StatMuse's Terms of Service require a commercial license for API use in paid products.
Email api@statmuse.com if you want to pursue that as you scale.
API-Sports + balldontlie cover the same data for free.

---

## Project Structure

```
sharpedge/
├── index.html          ← Full frontend (single file, no build step)
├── vercel.json         ← Vercel routing config
├── .env.example        ← Template — copy to .env, add your keys
└── api/
    ├── odds.js         ← Fetches live odds (your Odds API key is safe here)
    ├── stats.js        ← Fetches team/player stats (your API-Sports key is safe here)
    └── picks.js        ← Calls Claude AI (your Anthropic key is safe here)
```

---

## Monetization (Next Steps)

1. **Add Stripe** — free users get 3 picks/month, paid ($15/mo) get unlimited
2. **Track usage per user** — add a simple database (Vercel KV, free tier)
3. **Market on Reddit** — r/sportsbook (800k members), r/nfl, r/nba
4. **50 subscribers × $15/month = $750/month recurring**

---

## Legal

This app does not accept wagers, guarantee outcomes, or provide licensed gambling advice.
Users are shown a clear disclaimer on every page.
All odds data is publicly available information from licensed sportsbooks.

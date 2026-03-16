// api/stats.js — Vercel Serverless Function
// Fetches team stats, injury reports, and standings.
// Sources: API-Sports (NFL + NBA) + balldontlie (NBA player stats, free/no key)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { type, sport, team, season } = req.query;
  const apiSportsKey = process.env.API_SPORTS_KEY;

  // ── NBA PLAYER STATS (balldontlie — no key needed) ──────────────────────
  if (type === 'nba_player' && team) {
    try {
      // Search for player by team name
      const searchUrl = `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(team)}&per_page=5`;
      const r = await fetch(searchUrl);
      const d = await r.json();
      return res.status(200).json({ source: 'balldontlie', data: d.data || [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── NBA TEAM SEASON AVERAGES (balldontlie) ───────────────────────────────
  if (type === 'nba_team_stats') {
    try {
      const yr = season || '2024';
      const url = `https://api.balldontlie.io/v1/season_averages?season=${yr}&team_ids[]=`;
      // Return standings as a proxy for team strength
      const standUrl = `https://api.balldontlie.io/v1/standings?season=${yr}`;
      const r = await fetch(standUrl);
      const d = await r.json();
      return res.status(200).json({ source: 'balldontlie', data: d.data || [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── NFL / NBA via API-Sports ─────────────────────────────────────────────
  if (!apiSportsKey) {
    return res.status(500).json({ error: 'API_SPORTS_KEY not set. Add it to your .env file.' });
  }

  const headers = {
    'x-rapidapi-host': sport === 'nfl' ? 'v1.american-football.api-sports.io' : 'v1.basketball.api-sports.io',
    'x-rapidapi-key': apiSportsKey,
  };

  try {
    let apiUrl = '';

    if (sport === 'nfl' && type === 'standings') {
      const yr = season || '2024';
      apiUrl = `https://v1.american-football.api-sports.io/standings?league=1&season=${yr}`;
    } else if (sport === 'nfl' && type === 'injuries') {
      apiUrl = `https://v1.american-football.api-sports.io/injuries?season=2024`;
    } else if (sport === 'nba' && type === 'standings') {
      const yr = season || '2024-2025';
      apiUrl = `https://v1.basketball.api-sports.io/standings?league=12&season=${yr}`;
    } else {
      return res.status(400).json({ error: 'Unknown type/sport combination.' });
    }

    const r = await fetch(apiUrl, { headers });
    const d = await r.json();
    return res.status(200).json({ source: 'api-sports', data: d.response || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

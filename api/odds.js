// api/odds.js — Vercel Serverless Function
// Fetches live odds from The Odds API. Your key stays secret on the server.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { sport = 'americanfootball_nfl' } = req.query;
  const key = process.env.ODDS_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'ODDS_API_KEY not set in environment variables.' });
  }

  const allowedSports = ['americanfootball_nfl', 'basketball_nba'];
  if (!allowedSports.includes(sport)) {
    return res.status(400).json({ error: 'Invalid sport. Use americanfootball_nfl or basketball_nba.' });
  }

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${key}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=draftkings,fanduel,betmgm`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.message || 'Odds API error' });
    }

    const data = await response.json();

    // Return remaining quota in headers so you can monitor usage
    res.setHeader('X-Odds-Remaining', response.headers.get('x-requests-remaining') || '?');
    res.setHeader('X-Odds-Used', response.headers.get('x-requests-used') || '?');

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// api/picks.js — Vercel Serverless Function
// Calls Claude AI with live odds + stats context to generate picks.
// Your Anthropic key stays on the server — users never see it.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set.' });
  }

  const { game, sport, betType, style, bankroll, oddsContext, statsContext } = req.body;

  if (!game || !oddsContext) {
    return res.status(400).json({ error: 'Missing game or oddsContext in request body.' });
  }

  const prompt = `You are a sharp sports betting analyst. Provide an analysis for the following game.

GAME: ${game}
SPORT: ${sport || 'Unknown'}
BET TYPE FOCUS: ${betType || 'All markets'}
ANALYSIS STYLE: ${style || 'Sharp & concise'}
${bankroll ? `BETTOR BANKROLL: $${bankroll}` : ''}

LIVE ODDS (from DraftKings / FanDuel):
${oddsContext}

${statsContext ? `TEAM & PLAYER CONTEXT:\n${statsContext}` : ''}

Provide a structured analysis with these exact sections:
**THE PICK** — your exact recommendation (team + line/number)
**CONFIDENCE** — one word only: High, Medium, or Low
**KEY FACTORS** — 2-3 sharp reasons, reference the actual odds numbers
**LINE VALUE** — is this line sharp or soft? where is the value?
**RISK NOTE** — one thing that could beat this pick
**UNIT SIZE** — ${bankroll ? `recommended wager from $${bankroll} bankroll` : 'flat unit recommendation (1-3 units)'}

Be precise. Reference specific numbers. No fluff. No guarantees.

DISCLAIMER: This is for entertainment and informational purposes only.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    const text = data.content.map(c => c.text || '').join('');
    return res.status(200).json({ pick: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

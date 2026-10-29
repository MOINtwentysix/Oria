import { Request, Response, Router } from 'express';
import { query } from '../db';

const router = Router();

/**
 * POST /api/ai/recommend
 * Body: { prompt, userLat, userLon, userId }
 */
router.post('/recommend', async (req: Request, res: Response) => {
  const { prompt, userLat, userLon, userId = 'guest' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // 1. Server-side Rate Limiting & Usage Tracking via Neon PostgreSQL
  try {
    const userRes = await query(
      `SELECT tier, ai_requests_used, ai_requests_limit FROM users WHERE clerk_id = $1`,
      [userId]
    );

    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      if (user.tier === 'free' && user.ai_requests_used >= user.ai_requests_limit) {
        return res.status(429).json({
          error: 'QUOTA_EXCEEDED',
          message:
            'You have reached your 50 free monthly AI discovery requests. Upgrade to Oria Pro for unlimited recommendations.',
        });
      }

      // Increment count in Neon DB
      await query(
        `UPDATE users SET ai_requests_used = ai_requests_used + 1, updated_at = NOW() WHERE clerk_id = $1`,
        [userId]
      );
    }
  } catch (dbErr) {
    console.warn('[AI Route] DB quota check skipped (decoupled mode):', dbErr);
  }

  // 2. Fetch real Overpass data for location grounding
  const lat = userLat || 48.137154;
  const lon = userLon || 11.576124;

  const lower = prompt.toLowerCase();
  let amenityFilter = 'amenity~"cafe|restaurant|bar"';
  if (lower.includes('cafe') || lower.includes('coffee')) amenityFilter = 'amenity="cafe"';
  else if (lower.includes('park') || lower.includes('green')) amenityFilter = 'leisure="park"';
  else if (lower.includes('museum') || lower.includes('art')) amenityFilter = 'tourism="museum"';
  else if (lower.includes('attraction') || lower.includes('sight')) amenityFilter = 'tourism="attraction"';

  const overpassQl = `[out:json][timeout:10];(node[${amenityFilter}](around:3000,${lat},${lon}););out center 15;`;

  let realPlaces: any[] = [];
  try {
    const opRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'OriaServer/1.0',
      },
      body: `data=${encodeURIComponent(overpassQl)}`,
    });

    if (opRes.ok) {
      const opData = await opRes.json();
      realPlaces = (opData.elements || [])
        .filter((el: any) => el.tags && (el.tags.name || el.tags.brand))
        .map((el: any) => ({
          osmId: el.id,
          name: el.tags.name || el.tags.brand,
          category: el.tags.amenity || el.tags.tourism || el.tags.leisure || 'place',
          latitude: el.lat ?? el.center?.lat,
          longitude: el.lon ?? el.center?.lon,
          address: el.tags['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim() : undefined,
          openingHours: el.tags.opening_hours,
        }));
    }
  } catch (err) {
    console.warn('Overpass grounding query error:', err);
  }

  // 3. Grounded response generation (Configurable AI Provider)
  // If GEMINI_API_KEY or OPENAI_API_KEY is present in env, call it with strict grounding instructions
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let answerText = '';

  if (geminiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const systemInstruction = `You are Oria AI, an Apple-inspired premium location concierge.
Ground your response ONLY in the real places provided below. Never invent places, addresses, or fake hours.
Real Places: ${JSON.stringify(realPlaces.slice(0, 5))}`;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }],
            },
          ],
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        answerText =
          geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch (e) {
      console.warn('Gemini request failed:', e);
    }
  }

  // Fallback if no external provider or API key not yet inserted
  if (!answerText) {
    const top = realPlaces.slice(0, 4);
    if (top.length > 0) {
      answerText = `I discovered these verified real places near your location matching "${prompt}":\n\n` +
        top.map((p, idx) => `• **${p.name}** (${p.category})${p.address ? ` on ${p.address}` : ''}${p.openingHours ? ` — Open: ${p.openingHours}` : ''}`).join('\n') +
        `\n\nAll recommendations are verified OpenStreetMap locations.`;
    } else {
      answerText = `I couldn't find any specific verified spots matching "${prompt}" in the immediate vicinity. Try expanding your search radius or exploring another category!`;
    }
  }

  // Log in Neon DB if active
  try {
    await query(
      `INSERT INTO ai_logs (user_id, prompt, recommended_count) VALUES ($1, $2, $3)`,
      [userId, prompt, realPlaces.length]
    );
  } catch {}

  return res.json({
    content: answerText,
    recommendedPlaces: realPlaces.slice(0, 5),
    placesCount: realPlaces.length,
    grounded: true,
  });
});

export default router;

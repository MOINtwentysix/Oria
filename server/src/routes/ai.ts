import { Request, Response, Router } from 'express';
import { query } from '../db';

const router = Router();
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const MISTRAL_MODEL = 'mistral-small-latest';

/**
 * POST /api/ai/recommend
 * Body: { prompt, userLat, userLon, userId }
 */
router.post('/recommend', async (req: Request, res: Response) => {
  const { prompt, userLat, userLon, userId = 'guest' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // 1. Fetch real Overpass data for location grounding
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

  // 2. Call Mistral AI (mistral-small-latest)
  let answerText = '';

  if (MISTRAL_API_KEY) {
    try {
      const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: MISTRAL_MODEL,
          messages: [
            {
              role: 'system',
              content: `You are Oria AI, an Apple-inspired concierge for location discovery.
Ground your response ONLY in the real places provided below. Never invent places, addresses, or fake hours.
Real Places: ${JSON.stringify(realPlaces.slice(0, 5))}`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 600,
        }),
      });

      if (mistralRes.ok) {
        const mistralData = await mistralRes.json();
        answerText = mistralData.choices?.[0]?.message?.content || '';
      }
    } catch (e) {
      console.warn('Mistral API call failed:', e);
    }
  }

  // Fallback if Mistral key is not yet set
  if (!answerText) {
    const top = realPlaces.slice(0, 4);
    if (top.length > 0) {
      answerText = `I discovered these verified real places near your location matching "${prompt}":\n\n` +
        top.map((p) => `• **${p.name}** (${p.category})${p.address ? ` on ${p.address}` : ''}${p.openingHours ? ` — Open: ${p.openingHours}` : ''}`).join('\n') +
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

import { Request, Response, Router } from 'express';

const router = Router();
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Simple in-memory LRU cache to respect OSM usage policies
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * GET /api/places/search?q=query
 */
router.get('/search', async (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  const cacheKey = `search_${q.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(
      q
    )}&format=json&addressdetails=1&extratags=1&limit=25`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OriaLocationServer/1.0 (server@oria.app)' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Nominatim query failed' });
    }

    const data = await response.json();
    cache.set(cacheKey, { timestamp: Date.now(), data });
    return res.json(data);
  } catch (err: any) {
    console.error('Search error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * POST /api/places/nearby
 * Body: { lat, lon, category, radius }
 */
router.post('/nearby', async (req: Request, res: Response) => {
  const { lat, lon, category = 'all', radius = 2500 } = req.body;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  const cacheKey = `nearby_${parseFloat(lat).toFixed(3)}_${parseFloat(lon).toFixed(3)}_${category}_${radius}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  // 1. Photon fast path (<300ms)
  try {
    let q = 'cafe';
    if (category === 'restaurant') q = 'restaurant';
    else if (category === 'park') q = 'park';
    else if (category === 'attraction') q = 'tourism';
    else if (category === 'museum') q = 'museum';
    else if (category === 'shopping') q = 'shop';
    else if (category === 'nightlife') q = 'bar';
    else if (category === 'entertainment') q = 'cinema';

    const url = `https://photon.komoot.io/api/?lat=${lat}&lon=${lon}&q=${encodeURIComponent(q)}&limit=35`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const photonRes = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'OriaLocationServer/1.0 (https://oria.app)' }
    });
    clearTimeout(timer);

    if (photonRes.ok) {
      const data = await photonRes.json();
      if (data.features && data.features.length > 0) {
        cache.set(cacheKey, { timestamp: Date.now(), data });
        return res.json(data);
      }
    }
  } catch (err) {
    // Continue to Overpass fallback
  }

  // 2. Overpass BBOX fallback with 3.5s timeout
  const delta = 0.025;
  const s = (parseFloat(lat) - delta).toFixed(5);
  const w = (parseFloat(lon) - delta).toFixed(5);
  const n = (parseFloat(lat) + delta).toFixed(5);
  const e = (parseFloat(lon) + delta).toFixed(5);

  let filters = `node["amenity"~"cafe|restaurant|bar"](${s},${w},${n},${e});`;
  if (category === 'cafe') filters = `node["amenity"="cafe"](${s},${w},${n},${e});`;
  else if (category === 'restaurant') filters = `node["amenity"~"restaurant|fast_food"](${s},${w},${n},${e});`;
  else if (category === 'park') filters = `node["leisure"~"park|garden"](${s},${w},${n},${e});`;
  else if (category === 'attraction') filters = `node["tourism"~"attraction|viewpoint"](${s},${w},${n},${e});`;
  else if (category === 'museum') filters = `node["tourism"~"museum|gallery"](${s},${w},${n},${e});`;
  else if (category === 'shopping') filters = `node["shop"](${s},${w},${n},${e});`;
  else if (category === 'nightlife') filters = `node["amenity"~"bar|pub|nightclub"](${s},${w},${n},${e});`;

  const overpassQl = `[out:json][timeout:4];(${filters});out 30;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'OriaLocationServer/1.0 (https://oria.app)',
        },
        body: `data=${encodeURIComponent(overpassQl)}`,
      });
      clearTimeout(timer);

      if (!response.ok) continue;

      const data = await response.json();
      cache.set(cacheKey, { timestamp: Date.now(), data });
      return res.json(data);
    } catch (e) {
      // Continue to next mirror
    }
  }

  return res.json({ elements: [] });
});

export default router;

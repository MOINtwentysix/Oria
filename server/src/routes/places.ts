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

  let filters = '';
  switch (category) {
    case 'cafe':
      filters = `node["amenity"="cafe"](around:${radius},${lat},${lon});`;
      break;
    case 'restaurant':
      filters = `node["amenity"~"restaurant|fast_food|food_court"](around:${radius},${lat},${lon});`;
      break;
    case 'park':
      filters = `node["leisure"~"park|garden"](around:${radius},${lat},${lon}); way["leisure"="park"](around:${radius},${lat},${lon});`;
      break;
    case 'attraction':
      filters = `node["tourism"~"attraction|viewpoint"](around:${radius},${lat},${lon}); node["historic"="monument"](around:${radius},${lat},${lon});`;
      break;
    case 'museum':
      filters = `node["tourism"~"museum|gallery"](around:${radius},${lat},${lon}); node["amenity"="theatre"](around:${radius},${lat},${lon});`;
      break;
    case 'shopping':
      filters = `node["shop"](around:${radius},${lat},${lon});`;
      break;
    case 'nightlife':
      filters = `node["amenity"~"bar|pub|nightclub"](around:${radius},${lat},${lon});`;
      break;
    case 'all':
    default:
      filters = `
        node["amenity"~"cafe|restaurant|bar|cinema"](around:${radius},${lat},${lon});
        node["tourism"~"attraction|museum|viewpoint"](around:${radius},${lat},${lon});
        node["leisure"="park"](around:${radius},${lat},${lon});
      `;
      break;
  }

  const overpassQl = `[out:json][timeout:15];(${filters});out center 50;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'OriaLocationServer/1.0 (https://oria.app)',
        },
        body: `data=${encodeURIComponent(overpassQl)}`,
      });

      if (!response.ok) continue;

      const data = await response.json();
      cache.set(cacheKey, { timestamp: Date.now(), data });
      return res.json(data);
    } catch (e) {
      console.warn(`Overpass proxy error on ${endpoint}:`, e);
    }
  }

  return res.status(503).json({ error: 'Overpass mirrors currently unreachable' });
});

export default router;

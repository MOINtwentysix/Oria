import { Request, Response, Router } from 'express';

const router = Router();
const OSRM_BASE = 'https://router.project-osrm.org';

/**
 * POST /api/routing/route
 * Body: { coordinates: [[lon, lat], ...], mode: 'foot' | 'bike' | 'car' }
 */
router.post('/route', async (req: Request, res: Response) => {
  const { coordinates, mode = 'foot' } = req.body;
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return res.status(400).json({ error: 'At least 2 coordinates [lon, lat] required' });
  }

  const profile = mode === 'bike' ? 'bike' : mode === 'car' ? 'car' : 'foot';
  const coordStr = coordinates.map((c: [number, number]) => `${c[0]},${c[1]}`).join(';');
  const url = `${OSRM_BASE}/route/v1/${profile}/${coordStr}?overview=full&steps=true&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Routing request failed' });
    }
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error('OSRM route error:', err);
    return res.status(500).json({ error: err.message || 'Routing service error' });
  }
});

export default router;

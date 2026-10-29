import { Request, Response, Router } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/partners
 * Retrieve verified partner locations (modular architecture)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM partners WHERE is_active = TRUE ORDER BY name ASC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
});

/**
 * GET /api/partners/nearby?lat=...&lon=...
 */
router.get('/nearby', async (req: Request, res: Response) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon required' });
  }

  try {
    const result = await query(
      `SELECT * FROM partners WHERE is_active = TRUE`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
});

export default router;

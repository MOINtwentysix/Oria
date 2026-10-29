import { Request, Response, Router } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/lists?userId=xxx
 */
router.get('/', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    const listRes = await query(
      `SELECT l.*, COUNT(p.id) as place_count 
       FROM lists l 
       LEFT JOIN list_places p ON l.id = p.list_id 
       WHERE l.user_id = $1 
       GROUP BY l.id 
       ORDER BY l.updated_at DESC`,
      [userId]
    );

    return res.json(listRes.rows);
  } catch (err: any) {
    console.error('Fetch lists error:', err);
    return res.status(500).json({ error: 'Database error fetching lists' });
  }
});

/**
 * POST /api/lists
 * Body: { userId, title, description, coverImage, isPrivate }
 */
router.post('/', async (req: Request, res: Response) => {
  const { userId, title, description, coverImage, isPrivate = true } = req.body;
  if (!userId || !title) {
    return res.status(400).json({ error: 'userId and title are required' });
  }

  try {
    // Check user tier & limit
    const userRes = await query(`SELECT tier, lists_limit FROM users WHERE clerk_id = $1`, [userId]);
    const user = userRes.rows[0];
    if (user && user.tier === 'free') {
      const countRes = await query(`SELECT COUNT(*) FROM lists WHERE user_id = $1`, [userId]);
      const currentCount = parseInt(countRes.rows[0].count, 10);
      if (currentCount >= (user.lists_limit || 10)) {
        return res.status(403).json({
          error: 'LIST_LIMIT_REACHED',
          message: 'Free users can create up to 10 lists. Upgrade to Oria Pro for unlimited lists.',
        });
      }
    }

    const listId = `list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const shareCode = Math.random().toString(36).substring(2, 9);

    await query(
      `INSERT INTO lists (id, user_id, title, description, cover_image, is_private, share_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [listId, userId, title, description, coverImage, isPrivate, shareCode]
    );

    return res.status(201).json({
      id: listId,
      userId,
      title,
      description,
      coverImage,
      isPrivate,
      shareCode,
    });
  } catch (err: any) {
    console.error('Create list error:', err);
    return res.status(500).json({ error: 'Database error creating list' });
  }
});

/**
 * GET /api/lists/share/:shareCode (Public list sharing)
 */
router.get('/share/:shareCode', async (req: Request, res: Response) => {
  const { shareCode } = req.params;
  try {
    const listRes = await query(
      `SELECT * FROM lists WHERE share_code = $1 AND is_private = FALSE`,
      [shareCode]
    );

    if (listRes.rows.length === 0) {
      return res.status(404).json({ error: 'List not found or private' });
    }

    const list = listRes.rows[0];
    const placesRes = await query(
      `SELECT * FROM list_places WHERE list_id = $1 ORDER BY created_at DESC`,
      [list.id]
    );

    return res.json({
      ...list,
      places: placesRes.rows,
    });
  } catch (err: any) {
    console.error('Share list fetch error:', err);
    return res.status(500).json({ error: 'Database error fetching shared list' });
  }
});

/**
 * DELETE /api/lists/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await query(`DELETE FROM lists WHERE id = $1`, [id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Database error deleting list' });
  }
});

/**
 * POST /api/lists/:id/places
 * Add place to list
 */
router.post('/:id/places', async (req: Request, res: Response) => {
  const listId = req.params.id;
  const place = req.body;

  if (!place || !place.osmId || !place.name) {
    return res.status(400).json({ error: 'Valid place data required' });
  }

  const placeId = `lp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  try {
    await query(
      `INSERT INTO list_places 
       (id, list_id, osm_id, osm_type, name, category, sub_category, latitude, longitude, address, city, phone, website, opening_hours, wheelchair, cuisine, image_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        placeId,
        listId,
        place.osmId,
        place.osmType || 'node',
        place.name,
        place.category || 'place',
        place.subCategory || null,
        place.latitude,
        place.longitude,
        place.address || null,
        place.city || null,
        place.phone || null,
        place.website || null,
        place.openingHours || null,
        place.wheelchair || null,
        place.cuisine || null,
        place.imageUrl || null,
        place.notes || null,
      ]
    );

    // Update list timestamp
    await query(`UPDATE lists SET updated_at = NOW() WHERE id = $1`, [listId]);
    return res.status(201).json({ success: true, id: placeId });
  } catch (err) {
    console.error('Add place error:', err);
    return res.status(500).json({ error: 'Database error adding place' });
  }
});

/**
 * DELETE /api/lists/:id/places/:placeId
 */
router.delete('/:id/places/:placeId', async (req: Request, res: Response) => {
  const { id: listId, placeId } = req.params;
  try {
    await query(`DELETE FROM list_places WHERE list_id = $1 AND id = $2`, [listId, placeId]);
    await query(`UPDATE lists SET updated_at = NOW() WHERE id = $1`, [listId]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Database error removing place' });
  }
});

export default router;

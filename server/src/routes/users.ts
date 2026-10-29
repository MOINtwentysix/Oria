import { Request, Response, Router } from 'express';
import { query } from '../db';

const router = Router();

/**
 * POST /api/users/sync
 * Sync Clerk user with Neon database
 */
router.post('/sync', async (req: Request, res: Response) => {
  const { clerkId, email, name, avatarUrl } = req.body;
  if (!clerkId || !email) {
    return res.status(400).json({ error: 'clerkId and email required' });
  }

  try {
    const checkRes = await query(`SELECT * FROM users WHERE clerk_id = $1`, [clerkId]);
    if (checkRes.rows.length === 0) {
      const id = `user_${Date.now()}`;
      await query(
        `INSERT INTO users (id, clerk_id, email, name, avatar_url, tier, ai_requests_used, ai_requests_limit, lists_limit)
         VALUES ($1, $2, $3, $4, $5, 'free', 0, 50, 10)`,
        [id, clerkId, email, name || 'Explorer', avatarUrl || null]
      );
      return res.status(201).json({ status: 'created', tier: 'free', aiRequestsUsed: 0 });
    } else {
      const user = checkRes.rows[0];
      await query(
        `UPDATE users SET email = $1, name = $2, avatar_url = $3, updated_at = NOW() WHERE clerk_id = $4`,
        [email, name || user.name, avatarUrl || user.avatar_url, clerkId]
      );
      return res.json({
        status: 'synced',
        tier: user.tier,
        aiRequestsUsed: user.ai_requests_used,
        aiRequestsLimit: user.ai_requests_limit,
        listsLimit: user.lists_limit,
      });
    }
  } catch (err) {
    console.error('User sync error:', err);
    return res.status(500).json({ error: 'Database error syncing user' });
  }
});

/**
 * POST /api/users/:clerkId/upgrade-pro
 */
router.post('/:clerkId/upgrade-pro', async (req: Request, res: Response) => {
  const { clerkId } = req.params;
  try {
    await query(
      `UPDATE users SET tier = 'pro', ai_requests_limit = -1, lists_limit = -1, updated_at = NOW() WHERE clerk_id = $1`,
      [clerkId]
    );
    return res.json({ success: true, tier: 'pro' });
  } catch (err) {
    return res.status(500).json({ error: 'Database error upgrading tier' });
  }
});

/**
 * DELETE /api/users/:clerkId/delete-account
 * GDPR Right to Erasure
 */
router.delete('/:clerkId/delete-account', async (req: Request, res: Response) => {
  const { clerkId } = req.params;
  try {
    await query(`DELETE FROM users WHERE clerk_id = $1`, [clerkId]);
    return res.json({ success: true, message: 'Account and associated data deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Database error deleting account' });
  }
});

export default router;

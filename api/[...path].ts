import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');
const USERINFO_URL = process.env.SSO_USERINFO_URL || process.env.EXPO_PUBLIC_SSO_USERINFO_URL || 'https://clerk.moin26.dev/oauth/userinfo';

type Request = { method?: string; headers: Record<string, string | string[] | undefined>; body?: any; query?: { path?: string | string[] } };
type Response = { status: (code: number) => Response; json: (value: any) => void; setHeader: (name: string, value: string) => void; end: () => void };

const json = (res: Response, status: number, body: any) => res.status(status).json(body);

async function currentUser(req: Request) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  const authorization = req.headers.authorization;
  if (!authorization || Array.isArray(authorization)) throw new Error('Unauthorized');
  const response = await fetch(USERINFO_URL, { headers: { Authorization: authorization } });
  if (!response.ok) throw new Error('Unauthorized');
  const account = await response.json() as any;
  if (!account.sub && !account.id) throw new Error('Unauthorized');
  const accountId = account.sub || account.id;
  const email = account.email || account.emailAddresses?.[0]?.emailAddress || `${accountId}@unknown.local`;
  const result = await sql`
    INSERT INTO users (account_id, email, first_name, last_name, image_url)
    VALUES (${accountId}, ${email}, ${account.given_name || account.firstName}, ${account.family_name || account.lastName}, ${account.picture || account.imageUrl})
    ON CONFLICT (account_id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      image_url = EXCLUDED.image_url,
      updated_at = NOW()
    RETURNING id, account_id, email
  `;
  return result[0];
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  try {
    const path = req.query?.path;
    const parts = (Array.isArray(path) ? path : typeof path === 'string' ? path.split('/') : []).filter(Boolean);
    const body = req.body || {};
    const user = await currentUser(req);

    if (parts[0] === 'saved' && parts[1] === 'lists' && parts.length === 2) {
      if (req.method === 'GET') {
        const results = await sql`
          SELECT sl.*, (SELECT COUNT(*) FROM saved_list_items WHERE list_id = sl.id) AS place_count,
            (SELECT COUNT(*) FROM saved_list_members WHERE list_id = sl.id) AS member_count
          FROM saved_lists sl WHERE sl.user_id = ${user.id}
          ORDER BY sl.is_default DESC, sl.updated_at DESC
        `;
        return json(res, 200, { results });
      }
      if (req.method === 'POST') {
        const created = await sql`
          INSERT INTO saved_lists (user_id, name, description, is_shared, share_token)
          VALUES (${user.id}, ${body.name}, ${body.description || null}, ${Boolean(body.is_shared)}, ${body.is_shared ? `${Date.now()}-${Math.random().toString(36).slice(2)}` : null})
          RETURNING *
        `;
        await sql`INSERT INTO saved_list_members (list_id, user_id, role) VALUES (${created[0].id}, ${user.id}, 'owner')`;
        return json(res, 201, created[0]);
      }
    }

    if (parts[0] === 'saved' && parts[1] === 'places' && parts.length === 2) {
      if (req.method === 'GET') {
        const results = await sql`SELECT * FROM saved_places WHERE user_id = ${user.id} ORDER BY created_at DESC`;
        return json(res, 200, { results });
      }
      if (req.method === 'POST') {
        const saved = await sql`
          INSERT INTO saved_places (user_id, place_id, place_data, list_id, notes)
          VALUES (${user.id}, ${body.place_id}, ${JSON.stringify(body.place_data || {})}, ${body.list_id || null}, ${body.notes || null})
          ON CONFLICT (user_id, place_id, list_id) DO UPDATE SET place_data = EXCLUDED.place_data, notes = EXCLUDED.notes, updated_at = NOW()
          RETURNING *
        `;
        if (body.list_id) {
          await sql`
            INSERT INTO saved_list_items (list_id, place_id, place_data, added_by, notes)
            VALUES (${body.list_id}, ${body.place_id}, ${JSON.stringify(body.place_data || {})}, ${user.id}, ${body.notes || null})
            ON CONFLICT (list_id, place_id) DO UPDATE SET place_data = EXCLUDED.place_data, notes = EXCLUDED.notes, updated_at = NOW()
          `;
          await sql`UPDATE saved_lists SET place_count = (SELECT COUNT(*) FROM saved_list_items WHERE list_id = ${body.list_id}), updated_at = NOW() WHERE id = ${body.list_id}`;
        }
        return json(res, 201, saved[0]);
      }
    }

    if (parts[0] === 'saved' && parts[1] === 'lists' && parts[2] && parts[3] === 'items') {
      const listId = parts[2];
      const owned = await sql`SELECT id FROM saved_lists WHERE id = ${listId} AND user_id = ${user.id}`;
      if (!owned[0]) return json(res, 404, { error: 'List not found' });
      if (req.method === 'GET') {
        const results = await sql`SELECT * FROM saved_list_items WHERE list_id = ${listId} ORDER BY position, created_at`;
        return json(res, 200, { results });
      }
      if (req.method === 'POST') {
        const item = await sql`
          INSERT INTO saved_list_items (list_id, place_id, place_data, added_by, notes, position)
          VALUES (${listId}, ${body.place_id}, ${JSON.stringify(body.place_data || {})}, ${user.id}, ${body.notes || null}, ${body.position || 0})
          ON CONFLICT (list_id, place_id) DO UPDATE SET place_data = EXCLUDED.place_data, notes = EXCLUDED.notes, position = EXCLUDED.position, updated_at = NOW()
          RETURNING *
        `;
        await sql`UPDATE saved_lists SET place_count = (SELECT COUNT(*) FROM saved_list_items WHERE list_id = ${listId}), updated_at = NOW() WHERE id = ${listId}`;
        return json(res, 201, item[0]);
      }
      if (req.method === 'DELETE' && parts[4]) {
        await sql`DELETE FROM saved_list_items WHERE id = ${parts[4]} AND list_id = ${listId}`;
        await sql`UPDATE saved_lists SET place_count = (SELECT COUNT(*) FROM saved_list_items WHERE list_id = ${listId}), updated_at = NOW() WHERE id = ${listId}`;
        return res.status(204).end();
      }
    }

    return json(res, 404, { error: 'Endpoint not found' });
  } catch (error: any) {
    const message = error?.message || 'Internal server error';
    return json(res, message === 'Unauthorized' ? 401 : 500, { error: message });
  }
}

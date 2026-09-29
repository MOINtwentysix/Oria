import { neon } from '@neondatabase/serverless';
const databaseUrl = process.env.DATABASE_URL || '';
const userinfoUrl = process.env.SSO_USERINFO_URL || process.env.EXPO_PUBLIC_SSO_USERINFO_URL || 'https://clerk.moin26.dev/oauth/userinfo';
type Request = { method?: string; headers: Record<string, string | string[] | undefined>; body?: Record<string, unknown>; query?: { path?: string | string[]; latitude?: string; longitude?: string; q?: string } };
type Response = { status: (code: number) => Response; json: (value: unknown) => void; end: () => void; setHeader: (name: string, value: string) => void };
const reply = (res: Response, status: number, value: unknown) => res.status(status).json(value);

const safeQuery = (value: string) => value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/"/g, '').slice(0, 80);
async function getPlaces(latitude: number, longitude: number, search: string) {
  const named = search ? `["name"~"${safeQuery(search)}",i]` : '["name"]';
  const around = `(around:1800,${latitude},${longitude})`;
  const query = `[out:json][timeout:12];(node${named}${around}["amenity"~"cafe|restaurant|bar|pub|bakery|fast_food|biergarten|library|arts_centre|theatre"];node${named}${around}["tourism"~"museum|gallery|attraction|viewpoint"];node${named}${around}["leisure"~"park|garden|nature_reserve"];);out 60;`;
  const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, { headers: { Accept: 'application/json', 'User-Agent': 'Oria/1.0 (+https://oria.moin26.dev)' } });
      if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
      return await response.json();
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error('No places endpoint is available');
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS'); if (req.method === 'OPTIONS') return res.status(204).end();
  const parts = (Array.isArray(req.query?.path) ? req.query?.path : String(req.query?.path || '').split('/')).filter(Boolean);
  if (parts.join('/') === 'places' && req.method === 'GET') {
    const latitude = Number(req.query?.latitude); const longitude = Number(req.query?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return reply(res, 400, { error: 'Valid latitude and longitude are required' });
    try { res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); return reply(res, 200, await getPlaces(latitude, longitude, String(req.query?.q || ''))); }
    catch { return reply(res, 502, { error: 'Places are temporarily unavailable' }); }
  }
  if (!databaseUrl) return reply(res, 503, { error: 'DATABASE_URL is not configured' });
  const authorization = req.headers.authorization; if (!authorization || Array.isArray(authorization)) return reply(res, 401, { error: 'Unauthorized' });
  const account = await fetch(userinfoUrl, { headers: { Authorization: authorization } }); if (!account.ok) return reply(res, 401, { error: 'Unauthorized' });
  const profile = await account.json() as any; const accountId = profile.sub || profile.id; if (!accountId) return reply(res, 401, { error: 'Unauthorized' });
  const sql = neon(databaseUrl); const [user] = await sql`INSERT INTO users (account_id, email) VALUES (${accountId}, ${profile.email || `${accountId}@unknown.local`}) ON CONFLICT (account_id) DO UPDATE SET updated_at = NOW() RETURNING id`;
  const body = req.body || {};
  if (parts.join('/') === 'saved/places' && req.method === 'GET') return reply(res, 200, { results: await sql`SELECT * FROM saved_places WHERE user_id = ${user.id} ORDER BY created_at DESC` });
  if (parts.join('/') === 'saved/places' && req.method === 'POST') return reply(res, 201, (await sql`INSERT INTO saved_places (user_id, place_id, place_data) VALUES (${user.id}, ${String(body.place_id || '')}, ${JSON.stringify(body.place_data || {})}) ON CONFLICT (user_id, place_id, list_id) DO UPDATE SET place_data = EXCLUDED.place_data RETURNING *`)[0]);
  return reply(res, 404, { error: 'Endpoint not found' });
}

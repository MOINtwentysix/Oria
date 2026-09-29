import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || '';
const userinfoUrl = process.env.SSO_USERINFO_URL || process.env.EXPO_PUBLIC_SSO_USERINFO_URL || 'https://clerk.moin26.dev/oauth/userinfo';

type Request = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
  query?: { path?: string | string[]; latitude?: string; longitude?: string; q?: string };
};
type Response = { status: (code: number) => Response; json: (value: unknown) => void; end: () => void; setHeader: (name: string, value: string) => void };
type NominatimResult = { osm_type: string; osm_id: number; lat: string; lon: string; name?: string; display_name: string; category?: string; type?: string; address?: Record<string, string> };

const reply = (res: Response, status: number, value: unknown) => res.status(status).json(value);
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const safeQuery = (value: string) => value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/"/g, '').slice(0, 80);

async function fetchWithTimeout(url: string, milliseconds: number, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), milliseconds);
  try { return await fetch(url, { headers, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}

async function getOverpassPlaces(latitude: number, longitude: number, search: string) {
  const named = search ? `["name"~"${safeQuery(search)}",i]` : '["name"]';
  const around = `(around:1800,${latitude},${longitude})`;
  const query = `[out:json][timeout:8];(node${named}${around}["amenity"~"cafe|restaurant|bar|pub|bakery|fast_food|biergarten|library|arts_centre|theatre"];node${named}${around}["tourism"~"museum|gallery|attraction|viewpoint"];node${named}${around}["leisure"~"park|garden|nature_reserve"];);out 60;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const response = await fetchWithTimeout(url, 5000, { Accept: 'application/json', 'User-Agent': 'Oria/1.0 (+https://oria.moin26.dev)' });
  if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
  return await response.json();
}

const resultToElement = (result: NominatimResult) => {
  const address = result.address || {};
  const categoryKey = ['amenity', 'tourism', 'leisure'].includes(result.category || '') ? result.category as 'amenity' | 'tourism' | 'leisure' : 'amenity';
  return {
    type: result.osm_type,
    id: Number(result.osm_id),
    lat: Number(result.lat),
    lon: Number(result.lon),
    tags: {
      name: result.name || result.display_name.split(',')[0],
      [categoryKey]: result.type || 'place',
      'addr:street': address.road || '',
      'addr:housenumber': address.house_number || '',
      'addr:postcode': address.postcode || '',
      'addr:city': address.city || address.town || address.village || '',
    },
  };
};

async function getNominatimPlaces(latitude: number, longitude: number, search: string) {
  const terms = search ? [search.slice(0, 80)] : ['cafe', 'restaurant', 'museum'];
  const longitudeDelta = 0.035;
  const latitudeDelta = 0.024;
  const viewbox = [longitude - longitudeDelta, latitude + latitudeDelta, longitude + longitudeDelta, latitude - latitudeDelta].join(',');
  const elements: ReturnType<typeof resultToElement>[] = [];
  for (const [index, term] of terms.entries()) {
    const params = new URLSearchParams({ q: term, format: 'jsonv2', limit: '20', addressdetails: '1', bounded: '1', viewbox });
    const response = await fetchWithTimeout(`https://nominatim.openstreetmap.org/search?${params.toString()}`, 7000, { Accept: 'application/json', 'User-Agent': 'Oria/1.0 (+https://oria.moin26.dev)' });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);
    const results = await response.json() as NominatimResult[];
    elements.push(...results.map(resultToElement));
    // Nominatim asks public clients to keep requests at or below one per second.
    if (index < terms.length - 1) await wait(1050);
  }
  return { elements };
}

async function getPlaces(latitude: number, longitude: number, search: string) {
  try { return await getOverpassPlaces(latitude, longitude, search); }
  catch { return await getNominatimPlaces(latitude, longitude, search); }
}

function requestParts(req: Request) {
  const queryPath = Array.isArray(req.query?.path) ? req.query.path : String(req.query?.path || '').split('/');
  const fromQuery = queryPath.filter(Boolean);
  if (fromQuery.length) return fromQuery;
  const pathname = new URL(req.url || '/', 'https://oria.moin26.dev').pathname;
  return pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
}

function requestValue(req: Request, name: 'latitude' | 'longitude' | 'q') {
  const fromQuery = req.query?.[name];
  if (fromQuery !== undefined) return fromQuery;
  return new URL(req.url || '/', 'https://oria.moin26.dev').searchParams.get(name) || '';
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const parts = requestParts(req);
  if (parts.join('/') === 'places' && req.method === 'GET') {
    const latitude = Number(requestValue(req, 'latitude')); const longitude = Number(requestValue(req, 'longitude'));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return reply(res, 400, { error: 'Valid latitude and longitude are required' });
    try {
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return reply(res, 200, await getPlaces(latitude, longitude, String(requestValue(req, 'q'))));
    } catch { return reply(res, 502, { error: 'Places are temporarily unavailable' }); }
  }

  if (!databaseUrl) return reply(res, 503, { error: 'DATABASE_URL is not configured' });
  const authorization = req.headers.authorization;
  if (!authorization || Array.isArray(authorization)) return reply(res, 401, { error: 'Unauthorized' });
  const account = await fetch(userinfoUrl, { headers: { Authorization: authorization } });
  if (!account.ok) return reply(res, 401, { error: 'Unauthorized' });
  const profile = await account.json() as any; const accountId = profile.sub || profile.id;
  if (!accountId) return reply(res, 401, { error: 'Unauthorized' });
  const sql = neon(databaseUrl);
  const [user] = await sql`INSERT INTO users (account_id, email) VALUES (${accountId}, ${profile.email || `${accountId}@unknown.local`}) ON CONFLICT (account_id) DO UPDATE SET updated_at = NOW() RETURNING id`;
  const body = req.body || {};
  if (parts.join('/') === 'saved/places' && req.method === 'GET') return reply(res, 200, { results: await sql`SELECT * FROM saved_places WHERE user_id = ${user.id} ORDER BY created_at DESC` });
  if (parts.join('/') === 'saved/places' && req.method === 'POST') return reply(res, 201, (await sql`INSERT INTO saved_places (user_id, place_id, place_data) VALUES (${user.id}, ${String(body.place_id || '')}, ${JSON.stringify(body.place_data || {})}) ON CONFLICT (user_id, place_id, list_id) DO UPDATE SET place_data = EXCLUDED.place_data RETURNING *`)[0]);
  return reply(res, 404, { error: 'Endpoint not found' });
}

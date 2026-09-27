import { json, sameOrigin, type Env } from './checkout';
import { supabaseFrom } from './supabase';

const ABOUT = ['box', 'workshop', 'table'];
const ANSWER_KEYS = ['occasion', 'occasionOther', 'serves', 'look', 'flavour', 'flavourOther', 'words', 'date'];

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * POST /api/enquiries — saves a custom-cake send or a company enquiry.
 * Body: { kind: 'custom', answers, fromPrice, photos, message } or { kind: 'company', about, message }.
 */
export async function handleEnquiries(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!sameOrigin(request)) return json({ error: 'Forbidden' }, 403);
  const db = supabaseFrom(env);
  if (!db) return json({ error: 'Enquiry log is not set up' }, 503);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  if (!body || typeof body !== 'object') return json({ error: 'Invalid request' }, 400);

  const kind = str(body.kind, 10);
  if (kind !== 'custom' && kind !== 'company') return json({ error: 'Unknown enquiry' }, 400);
  const message = str(body.message, 4000);
  if (!message) return json({ error: 'Empty message' }, 400);

  const row: Record<string, unknown> = { kind, message };
  if (kind === 'company') {
    const about = str(body.about, 10);
    row.about = ABOUT.includes(about) ? about : null;
  } else {
    const a = (body.answers ?? {}) as Record<string, unknown>;
    row.answers = Object.fromEntries(ANSWER_KEYS.map((k) => [k, str(a[k], 200)]));
    const from = Number(body.fromPrice);
    row.from_price = Number.isFinite(from) && from > 0 && from < 100000 ? Math.round(from) : null;
    const photos = Array.isArray(body.photos) ? body.photos : [];
    row.photos = photos
      .filter((p): p is string => typeof p === 'string' && p.startsWith(`${db.url}/storage/v1/`))
      .slice(0, 3);
  }

  try {
    await db.insert('enquiries', row);
  } catch (e) {
    console.error('enquiries insert', String(e));
    return json({ error: 'Could not save the enquiry' }, 502);
  }
  return json({ ok: true }, 201);
}

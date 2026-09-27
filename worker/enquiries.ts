import { json, sameOrigin, type Env } from './checkout';
import { supabaseFrom } from './supabase';

const ABOUT = ['box', 'workshop', 'table', 'event'];
const CUSTOM_KEYS = ['occasion', 'occasionOther', 'serves', 'servesOther', 'look', 'lookOther', 'flavour', 'flavourOther', 'words', 'noWords', 'date'];
const COMPANY_KEYS = ['qty', 'boxSize', 'logo', 'where', 'format', 'date', 'area', 'company', 'name'];

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const pick = (value: unknown, keys: string[]) => {
  const o = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(keys.map((k) => [k, str(o[k], 200)]));
};

/** Validates a POST body and shapes the `enquiries` row. Photo links must start with `storagePrefix`. */
export function enquiryRow(body: unknown, storagePrefix: string): { row: Record<string, unknown> } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' };
  const b = body as Record<string, unknown>;
  const kind = str(b.kind, 10);
  if (kind !== 'custom' && kind !== 'company') return { error: 'Unknown enquiry' };
  const message = str(b.message, 4000);
  if (!message) return { error: 'Empty message' };

  const row: Record<string, unknown> = { kind, message };
  if (kind === 'company') {
    const about = str(b.about, 10);
    row.about = ABOUT.includes(about) ? about : null;
    row.answers = pick(b.answers, COMPANY_KEYS);
  } else {
    row.answers = pick(b.answers, CUSTOM_KEYS);
    const from = Number(b.fromPrice);
    row.from_price = Number.isFinite(from) && from > 0 && from < 100000 ? Math.round(from) : null;
    const photos = Array.isArray(b.photos) ? b.photos : [];
    row.photos = photos.filter((p): p is string => typeof p === 'string' && p.startsWith(storagePrefix)).slice(0, 3);
  }
  return { row };
}

/** POST /api/enquiries — saves a custom-cake send or a company quote request. */
export async function handleEnquiries(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!sameOrigin(request)) return json({ error: 'Forbidden' }, 403);
  const db = supabaseFrom(env);
  if (!db) return json({ error: 'Enquiry log is not set up' }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  const shaped = enquiryRow(body, `${db.url}/storage/v1/`);
  if ('error' in shaped) return json({ error: shaped.error }, 400);

  try {
    await db.insert('enquiries', shaped.row);
  } catch (e) {
    console.error('enquiries insert', String(e));
    return json({ error: 'Could not save the enquiry' }, 502);
  }
  return json({ ok: true }, 201);
}

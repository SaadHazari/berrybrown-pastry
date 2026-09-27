import { IMAGE_EXT, sniffImage } from '../src/lib/image';
import { INSPIRATION_PATH, MAX_BYTES, MAX_FILES, RATE_LIMIT_PER_HOUR, SIGNED_URL_SECONDS, hashIp, inspirationKey, randomHex16 } from '../src/lib/inspiration';
import { json, sameOrigin, type Env } from './checkout';
import { supabaseFrom } from './supabase';

const BUCKET = 'inspiration';

/**
 * POST /api/inspiration — up to 3 images (≤10 MB each) → Supabase Storage (private bucket),
 * returns 30-day signed links for the WhatsApp message.
 */
export async function handleInspiration(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method !== 'POST' || url.pathname !== INSPIRATION_PATH) return json({ error: 'Method not allowed' }, 405);
  if (!sameOrigin(request)) return json({ error: 'Forbidden' }, 403);
  const db = supabaseFrom(env);
  if (!db) return json({ error: 'Photo upload is not set up yet' }, 503);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Invalid upload' }, 400);
  }
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) return json({ error: 'No photos received' }, 400);
  if (files.length > MAX_FILES) return json({ error: `Up to ${MAX_FILES} photos` }, 400);

  const checked: { bytes: ArrayBuffer; type: keyof typeof IMAGE_EXT }[] = [];
  for (const f of files) {
    if (f.size > MAX_BYTES) return json({ error: 'Each photo must be under 10 MB' }, 413);
    const bytes = await f.arrayBuffer();
    const type = sniffImage(new Uint8Array(bytes, 0, Math.min(16, bytes.byteLength)));
    if (!type) return json({ error: 'Only JPG, PNG, WebP or HEIC photos' }, 415);
    checked.push({ bytes, type });
  }

  // Rate limit: 10 photos per IP per hour, counted from the uploads table.
  const ipHash = await hashIp(request.headers.get('CF-Connecting-IP') ?? 'unknown');
  const now = Date.now();
  const since = new Date(now - 3_600_000).toISOString();
  const recent = await db.count('uploads', { ip_hash: `eq.${ipHash}`, created_at: `gte.${since}` });
  if (recent + checked.length > RATE_LIMIT_PER_HOUR) {
    return json({ error: 'Too many photos this hour. Send them in WhatsApp instead.' }, 429);
  }

  const urls: string[] = [];
  for (const { bytes, type } of checked) {
    const path = inspirationKey(ipHash, now, randomHex16(), IMAGE_EXT[type]);
    await db.upload(BUCKET, path, bytes, type);
    await db.insert('uploads', { ip_hash: ipHash, path, bytes: bytes.byteLength, content_type: type });
    urls.push(await db.signedUrl(BUCKET, path, SIGNED_URL_SECONDS));
  }
  return json({ urls });
}

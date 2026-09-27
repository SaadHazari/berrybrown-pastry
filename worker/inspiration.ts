import { IMAGE_EXT, sniffImage } from '../src/lib/image';
import { INSPIRATION_PATH, MAX_BYTES, MAX_FILES, RATE_LIMIT_PER_HOUR, countRecent, hashIp, inspirationKey, isInspirationKey, randomHex16 } from '../src/lib/inspiration';
import type { Env } from './checkout';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/**
 * POST /api/inspiration           — up to 3 images (≤10 MB each) → stored in R2, public URLs returned.
 * GET  /api/inspiration/<key>     — serves one stored image (WhatsApp opens these links).
 */
export async function handleInspiration(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname.startsWith(`${INSPIRATION_PATH}/`)) return serve(url.pathname.slice(INSPIRATION_PATH.length + 1), env);
  if (request.method === 'POST' && url.pathname === INSPIRATION_PATH) return upload(request, env, url.origin);
  return json({ error: 'Method not allowed' }, 405);
}

async function upload(request: Request, env: Env, origin: string): Promise<Response> {
  if (!env.INSPIRATION) return json({ error: 'Photo upload is not set up yet' }, 503);
  const reqOrigin = request.headers.get('Origin');
  if (reqOrigin && reqOrigin !== origin) return json({ error: 'Forbidden' }, 403);

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

  // Rate limit: 10 photos per IP per hour, counted from what is already in the bucket.
  const ipHash = await hashIp(request.headers.get('CF-Connecting-IP') ?? 'unknown');
  const now = Date.now();
  const listed = await env.INSPIRATION.list({ prefix: `${ipHash}/`, limit: 200 });
  if (countRecent(listed.objects.map((o) => o.key), now) + checked.length > RATE_LIMIT_PER_HOUR) {
    return json({ error: 'Too many photos this hour. Send them in WhatsApp instead.' }, 429);
  }

  const urls: string[] = [];
  for (const { bytes, type } of checked) {
    const key = inspirationKey(ipHash, now, randomHex16(), IMAGE_EXT[type]);
    await env.INSPIRATION.put(key, bytes, {
      httpMetadata: { contentType: type, cacheControl: 'public, max-age=2592000' },
      customMetadata: { uploadedAt: new Date(now).toISOString() },
    });
    urls.push(`${origin}${INSPIRATION_PATH}/${key}`);
  }
  return json({ urls });
}

async function serve(key: string, env: Env): Promise<Response> {
  if (!env.INSPIRATION || !isInspirationKey(key)) return new Response('Not found', { status: 404 });
  const obj = await env.INSPIRATION.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('ETag', obj.httpEtag);
  headers.set('Cache-Control', 'public, max-age=86400');
  headers.set('Content-Disposition', 'inline');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
  return new Response(obj.body, { headers });
}

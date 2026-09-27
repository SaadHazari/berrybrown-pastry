/**
 * A tiny Supabase client for the Worker: PostgREST and Storage over fetch, with the secret key.
 * No SDK — nothing to pin, nothing to bundle. The secret key goes on the `apikey` header only
 * (the new sb_secret_* keys are not JWTs, so they must not be sent as a Bearer token).
 *
 * All variables are BB_-prefixed so a Dormers key can never be picked up by accident.
 */
export type SupabaseEnv = { BB_SUPABASE_URL?: string; BB_SUPABASE_SECRET_KEY?: string };

export class SupabaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type Supabase = ReturnType<typeof createSupabase>;

/** Returns null when the Worker has no Supabase config, so callers can degrade gracefully. */
export function supabaseFrom(env: SupabaseEnv) {
  if (!env.BB_SUPABASE_URL || !env.BB_SUPABASE_SECRET_KEY) return null;
  return createSupabase(env.BB_SUPABASE_URL.replace(/\/$/, ''), env.BB_SUPABASE_SECRET_KEY);
}

function createSupabase(url: string, key: string) {
  const base = { apikey: key };

  async function check(res: Response, what: string): Promise<Response> {
    if (res.ok) return res;
    const text = await res.text().catch(() => '');
    throw new SupabaseError(`${what} failed: ${res.status} ${text.slice(0, 300)}`, res.status);
  }

  return {
    url,

    /** INSERT one row. Returns nothing. */
    async insert(table: string, row: Record<string, unknown>): Promise<void> {
      await check(
        await fetch(`${url}/rest/v1/${table}`, {
          method: 'POST',
          headers: { ...base, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify(row),
        }),
        `insert ${table}`,
      );
    },

    /** INSERT, or on a unique conflict either merge (`merge`) or leave the existing row (`ignore`). Returns the stored row. */
    async upsert<T extends Record<string, unknown>>(table: string, row: Record<string, unknown>, onConflict: string, mode: 'merge' | 'ignore' = 'merge'): Promise<T | null> {
      const res = await check(
        await fetch(`${url}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
          method: 'POST',
          headers: { ...base, 'Content-Type': 'application/json', Prefer: `return=representation, resolution=${mode === 'merge' ? 'merge-duplicates' : 'ignore-duplicates'}` },
          body: JSON.stringify(row),
        }),
        `upsert ${table}`,
      );
      const rows = (await res.json()) as T[];
      return rows[0] ?? null;
    },

    /** SELECT rows matching `filters` (PostgREST syntax: { ref: 'eq.BB-…' }). */
    async select<T>(table: string, columns: string, filters: Record<string, string>, limit = 10): Promise<T[]> {
      const qs = new URLSearchParams({ select: columns, ...filters, limit: String(limit) }).toString();
      const res = await check(await fetch(`${url}/rest/v1/${table}?${qs}`, { headers: { ...base, Accept: 'application/json' } }), `select ${table}`);
      return (await res.json()) as T[];
    },

    /** UPDATE rows matching `filters`. Returns the number of rows changed. */
    async update(table: string, filters: Record<string, string>, patch: Record<string, unknown>): Promise<number> {
      const qs = new URLSearchParams(filters).toString();
      const res = await check(
        await fetch(`${url}/rest/v1/${table}?${qs}`, {
          method: 'PATCH',
          headers: { ...base, 'Content-Type': 'application/json', Prefer: 'return=minimal, count=exact' },
          body: JSON.stringify(patch),
        }),
        `update ${table}`,
      );
      return contentRangeCount(res.headers.get('Content-Range'));
    },

    /** COUNT rows matching `filters` without fetching them. */
    async count(table: string, filters: Record<string, string>): Promise<number> {
      const qs = new URLSearchParams({ select: 'id', ...filters }).toString();
      const res = await check(
        await fetch(`${url}/rest/v1/${table}?${qs}`, {
          method: 'HEAD',
          headers: { ...base, Prefer: 'count=exact', Range: '0-0' },
        }),
        `count ${table}`,
      );
      return contentRangeCount(res.headers.get('Content-Range'));
    },

    /** Upload bytes to a bucket path. Fails if the path exists (no upsert, no stale CDN copies). */
    async upload(bucket: string, path: string, bytes: ArrayBuffer, contentType: string): Promise<void> {
      await check(
        await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
          method: 'POST',
          headers: { ...base, 'Content-Type': contentType, 'Cache-Control': 'max-age=2592000' },
          body: bytes,
        }),
        `upload ${bucket}/${path}`,
      );
    },

    /** A time-limited public link to a private object. */
    async signedUrl(bucket: string, path: string, expiresInSeconds: number): Promise<string> {
      const res = await check(
        await fetch(`${url}/storage/v1/object/sign/${bucket}/${path}`, {
          method: 'POST',
          headers: { ...base, 'Content-Type': 'application/json' },
          body: JSON.stringify({ expiresIn: expiresInSeconds }),
        }),
        `sign ${bucket}/${path}`,
      );
      const data = (await res.json()) as { signedURL?: string; signedUrl?: string };
      const signed = data.signedURL ?? data.signedUrl;
      if (!signed) throw new SupabaseError('sign returned no URL', 502);
      return signed.startsWith('http') ? signed : `${url}/storage/v1${signed}`;
    },
  };
}

/** PostgREST puts the total at the end of Content-Range, e.g. "0-0/42" (or "* / 0" for none). */
export function contentRangeCount(header: string | null): number {
  const m = /\/(\d+)$/.exec(header ?? '');
  return m ? Number(m[1]) : 0;
}

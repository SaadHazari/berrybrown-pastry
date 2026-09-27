/**
 * Live content from Supabase: the cake log and reviews. Read with the publishable key.
 * Every reader falls back to the sample data in content.ts until real rows exist,
 * so the page never depends on Supabase being up.
 */
import { useEffect, useState } from 'react';
import { LOG, REVIEWS, cakeNumber, type LogEntry, type Review } from '../data/content';
import type { Media } from '../data/media';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, cakePhotoUrl } from '../data/supabase';

export type CakeRow = { n: number; made_for: string; flavour: string; size: string; photo_path: string | null };
export type ReviewRow = { id: string; name: string; area: string; text: string; cake: string; stars: number };

export function cakeFromRow(r: CakeRow): LogEntry {
  const label = cakeNumber(r.n);
  const image: Media = r.photo_path
    ? { src: cakePhotoUrl(r.photo_path), alt: `Cake ${label}, ${r.flavour}`, label, placeholder: false }
    : { src: '', alt: `Cake ${label}`, label, placeholder: true };
  return { n: r.n, for: r.made_for, flavour: r.flavour, size: r.size, image, sample: false };
}

export function reviewFromRow(r: ReviewRow): Review {
  return { name: r.name, area: r.area, text: r.text, cake: r.cake, sample: false };
}

async function rest<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return (await res.json()) as T[];
}

const cache = new Map<string, Promise<unknown>>();
function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
}

/** Newest published cakes, at most `limit`. Empty when Supabase is unreachable. */
export const fetchCakes = (limit = 3) =>
  once(`cakes-${limit}`, async () => {
    try {
      return (await rest<CakeRow>(`cakes?select=n,made_for,flavour,size,photo_path&published=eq.true&order=n.desc&limit=${limit}`)).map(cakeFromRow);
    } catch {
      return [] as LogEntry[];
    }
  });

/** Newest published reviews, at most `limit`. Empty when Supabase is unreachable. */
export const fetchReviews = (limit = 12) =>
  once(`reviews-${limit}`, async () => {
    try {
      return (await rest<ReviewRow>(`reviews?select=id,name,area,text,cake,stars&published=eq.true&order=created_at.desc&limit=${limit}`)).map(reviewFromRow);
    } catch {
      return [] as Review[];
    }
  });

function useLive<T>(load: () => Promise<T[]>, fallback: T[]): T[] {
  const [rows, setRows] = useState<T[]>(fallback);
  useEffect(() => {
    let alive = true;
    load().then((r) => {
      if (alive && r.length > 0) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, [load]);
  return rows;
}

/** The log: live cakes, or the samples until at least one real cake is published. */
export const useLog = () => useLive(fetchCakes, LOG);
/** Kind words: live reviews, or the samples until at least one real review is published. */
export const useReviews = () => useLive(fetchReviews, REVIEWS);

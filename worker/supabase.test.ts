import { describe, expect, it } from 'vitest';
import { contentRangeCount, supabaseFrom } from './supabase';

describe('worker supabase helper', () => {
  it('reads the total from Content-Range', () => {
    expect(contentRangeCount('0-0/42')).toBe(42);
    expect(contentRangeCount('*/0')).toBe(0);
    expect(contentRangeCount(null)).toBe(0);
  });

  it('is null without config, so the site keeps working', () => {
    expect(supabaseFrom({})).toBeNull();
    expect(supabaseFrom({ BB_SUPABASE_URL: 'https://x.supabase.co/', BB_SUPABASE_SECRET_KEY: 'sb_secret_x' })?.url).toBe('https://x.supabase.co');
  });
});

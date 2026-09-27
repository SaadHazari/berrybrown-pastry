import { describe, expect, it } from 'vitest';
import { enquiryRow } from './enquiries';

const prefix = 'https://x.supabase.co/storage/v1/';
const row = (body: unknown) => {
  const r = enquiryRow(body, prefix);
  if ('error' in r) throw new Error(r.error);
  return r.row;
};

describe('enquiry rows', () => {
  it('rejects unknown kinds, empty messages and non-objects', () => {
    expect(enquiryRow({ kind: 'spam', message: 'hi' }, prefix)).toEqual({ error: 'Unknown enquiry' });
    expect(enquiryRow({ kind: 'custom', message: '  ' }, prefix)).toEqual({ error: 'Empty message' });
    expect(enquiryRow(null, prefix)).toEqual({ error: 'Invalid request' });
  });

  it('keeps only known custom answers and our own photo links', () => {
    const r = row({
      kind: 'custom',
      message: 'Hi',
      fromPrice: 360,
      answers: { occasion: 'customised', occasionOther: 'Graduation', lookOther: 'Gold', noWords: 'yes', evil: 'x' },
      photos: [`${prefix}object/sign/a.jpg`, 'https://evil.example/b.jpg'],
    });
    expect(r.answers).toMatchObject({ occasion: 'customised', occasionOther: 'Graduation', lookOther: 'Gold', noWords: 'yes' });
    expect((r.answers as Record<string, string>).evil).toBeUndefined();
    expect(r.photos).toEqual([`${prefix}object/sign/a.jpg`]);
    expect(r.from_price).toBe(360);
  });

  it('accepts event quotes and stores their answers', () => {
    const r = row({ kind: 'company', about: 'event', message: 'Hi', answers: { format: 'table', qty: '45', area: 'DIFC', name: 'Omar', extra: 'x' } });
    expect(r.about).toBe('event');
    expect(r.answers).toMatchObject({ format: 'table', qty: '45', area: 'DIFC', name: 'Omar' });
    expect((r.answers as Record<string, string>).extra).toBeUndefined();
  });

  it('drops an unknown company topic', () => {
    expect(row({ kind: 'company', about: 'party', message: 'Hi' }).about).toBeNull();
  });
});

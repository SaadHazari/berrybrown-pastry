import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, isValidPhone, validateDetails, validateWhen } from './checkoutState';

describe('checkout validation', () => {
  it('accepts common UAE mobile formats', () => {
    for (const p of ['0501234567', '+971 50 123 4567', '971501234567', '00971 55-123-4567', '50 123 4567']) {
      expect(isValidPhone(p), p).toBe(true);
    }
    expect(isValidPhone('041234567')).toBe(false);
    expect(isValidPhone('12345')).toBe(false);
  });

  it('requires area, date and slot for delivery', () => {
    expect(Object.keys(validateWhen(EMPTY_FORM, '2026-09-18')).sort()).toEqual(['date', 'slotId', 'zoneId']);
    const ok = { ...EMPTY_FORM, zoneId: 'downtown', date: '2026-09-18', slotId: 'evening' };
    expect(validateWhen(ok, '2026-09-18')).toEqual({});
    expect(validateWhen({ ...ok, date: '2026-09-17' }, '2026-09-18').date).toBeTruthy();
  });

  it('does not need an area or address for pickup', () => {
    const f = { ...EMPTY_FORM, fulfilment: 'pickup' as const, date: '2026-09-18', slotId: 'morning', customer: { ...EMPTY_FORM.customer, name: 'Sara', phone: '0501234567' } };
    expect(validateWhen(f, '2026-09-18')).toEqual({});
    expect(validateDetails(f)).toEqual({});
  });

  it('flags missing details', () => {
    expect(Object.keys(validateDetails(EMPTY_FORM)).sort()).toEqual(['address', 'name', 'phone']);
  });
});

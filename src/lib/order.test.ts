import { describe, expect, it } from 'vitest';
import { orderRef, whatsappLink, whatsappOrderText } from './order';

describe('order', () => {
  it('formats an order reference', () => {
    const ref = orderRef(new Date(2026, 8, 17), () => 0.5);
    expect(ref).toMatch(/^BB-260917-[A-Z0-9]{4}$/);
  });

  it('builds a WhatsApp order message with everything Safa needs', () => {
    const text = whatsappOrderText({
      ref: 'BB-260917-AB12',
      lines: [{ productId: 'berry-chocolate-drip', sizeId: 'classic', flavourId: 'dark', qty: 2, message: 'Happy 30th Sara' }],
      zoneId: 'downtown',
      date: '2026-09-19',
      slotId: 'evening',
      customer: { name: 'Sara', phone: '0501234567', email: '', address: 'Burj Views T2, 1204', notes: '' },
      paid: false,
    });
    expect(text).toContain('BB-260917-AB12');
    expect(text).toContain('2 × Berry Chocolate Drip');
    expect(text).toContain('Happy 30th Sara');
    expect(text).toContain('AED 590');
    expect(text).toContain('Total: AED 590'); // free delivery over 500
    expect(text).toContain('6pm – 9pm');
    expect(text).toContain('Burj Views T2');
  });

  it('encodes the WhatsApp link', () => {
    expect(whatsappLink('Hi & bye')).toBe('https://wa.me/971501234567?text=Hi%20%26%20bye');
  });
});

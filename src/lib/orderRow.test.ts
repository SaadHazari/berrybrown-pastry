import { describe, expect, it } from 'vitest';
import { orderRow } from './orderRow';

const order = {
  ref: 'BB-260927-AB12',
  lines: [
    { productId: 'berry-chocolate-drip', sizeId: '6in', flavourId: 'dark', qty: 2, message: 'Happy 30th' },
    { productId: 'pistachio-kunafa', sizeId: '5in', flavourId: 'rose', qty: 1 },
  ],
  zoneId: 'dubai',
  date: '2026-09-29',
  slotId: 'afternoon',
  customer: { name: 'Sara', phone: '0501234567', email: '', address: 'Burj Views T2, 1204', notes: 'Gate 3' },
};

describe('orderRow', () => {
  it('copies names and prices into the row so it reads without the catalogue', () => {
    const row = orderRow(order, 'whatsapp');
    expect(row.channel).toBe('whatsapp');
    expect(row.status).toBe('pending');
    expect(row.fulfilment).toBe('delivery');
    expect(row.slot).toBe('2pm – 5pm');
    expect(row.customer_email).toBeNull();
    expect(row.address).toBe('Burj Views T2, 1204');
    expect(row.lines[0]).toMatchObject({ product: 'Berry Chocolate Drip', size: '6"', flavour: 'Dark chocolate & raspberry', unit: 200, qty: 2, message: 'Happy 30th' });
    expect(row.subtotal).toBe(550);
    expect(row.delivery).toBe(0);
    expect(row.total).toBe(550);
    expect(row.stripe_session_id).toBeNull();
  });

  it('marks pickup and keeps the Stripe session id for online orders', () => {
    const row = orderRow({ ...order, zoneId: 'pickup', lines: [order.lines[1]] }, 'online', 'cs_test_123');
    expect(row.fulfilment).toBe('pickup');
    expect(row.address).toBeNull();
    expect(row.delivery).toBe(0);
    expect(row.total).toBe(150);
    expect(row.stripe_session_id).toBe('cs_test_123');
  });
});

import { describe, expect, it } from 'vitest';
import { EMPTY_CUSTOM } from '../data/custom';
import { customCakeMessage, enquiryMessage, orderRef, whatsappLink, whatsappOrderText } from './order';

describe('order', () => {
  it('formats an order reference', () => {
    const ref = orderRef(new Date(2026, 8, 17), () => 0.5);
    expect(ref).toMatch(/^BB-260917-[A-Z0-9]{4}$/);
  });

  it('builds a WhatsApp order message with everything Safa needs', () => {
    const text = whatsappOrderText({
      ref: 'BB-260917-AB12',
      lines: [{ productId: 'berry-chocolate-drip', sizeId: '6in', flavourId: 'dark', qty: 2, message: 'Happy 30th Sara' }],
      zoneId: 'dubai',
      date: '2026-09-19',
      slotId: 'evening',
      customer: { name: 'Sara', phone: '0501234567', email: '', address: 'Burj Views T2, 1204', notes: '' },
      paid: false,
    });
    expect(text).toContain('BB-260917-AB12');
    expect(text).toContain('2 × Berry Chocolate Drip');
    expect(text).toContain('Happy 30th Sara');
    expect(text).toContain('AED 400');
    expect(text).toContain('Delivery: Free'); // free delivery over 300
    expect(text).toContain('Total: AED 400');
    expect(text).toContain('6pm – 9pm');
    expect(text).toContain('Burj Views T2');
    expect(text).not.toMatch(/[!\u{1F300}-\u{1FAFF}]/u); // no exclamation marks, no emoji
  });

  it('charges delivery under 300', () => {
    const text = whatsappOrderText({
      ref: 'BB-260917-AB12',
      lines: [{ productId: 'berry-chocolate-drip', sizeId: '5in', flavourId: 'dark', qty: 1 }],
      zoneId: 'dubai',
      date: '2026-09-19',
      slotId: 'morning',
      customer: { name: 'Sara', phone: '0501234567', email: '', address: 'Burj Views', notes: '' },
      paid: true,
    });
    expect(text).toContain('Delivery: AED 20');
    expect(text).toContain('Total: AED 170 (paid)');
  });

  it('encodes the WhatsApp link with the studio number', () => {
    expect(whatsappLink('Hi & bye')).toBe('https://wa.me/971509478943?text=Hi%20%26%20bye');
  });
});

describe('customCakeMessage', () => {
  const form = {
    ...EMPTY_CUSTOM,
    occasion: 'birthday',
    serves: '6-8',
    look: 'flowers',
    flavour: 'pistachio-kunafa',
    words: 'Happy 60th, Dad',
    date: '2026-10-03',
  };

  it('lists the six answers and the from-price', () => {
    const text = customCakeMessage(form);
    expect(text).toContain('Occasion: Birthday');
    expect(text).toContain('People: 6–8 · 6"');
    expect(text).toContain('Look: Fresh flowers');
    expect(text).toContain('Flavour: Pistachio Kunafa');
    expect(text).toContain('Words on the cake: "Happy 60th, Dad"');
    expect(text).toContain('Date: Sat 3 Oct');
    expect(text).toContain('From AED 300 on the site');
    expect(text).not.toContain('Inspiration:');
    expect(text).not.toContain("I'll send");
  });

  it('adds inspiration links when photos uploaded (route A)', () => {
    const text = customCakeMessage(form, ['https://berrybrown.me/api/inspiration/a/1.jpg', 'https://berrybrown.me/api/inspiration/a/2.jpg']);
    expect(text.match(/Inspiration: https:/g)).toHaveLength(2);
    expect(text).not.toContain("I'll send");
  });

  it('falls back to sending photos in WhatsApp when upload failed (route B)', () => {
    const text = customCakeMessage(form, [], 3);
    expect(text).toContain("I'll send my inspiration photos here.");
  });

  it('uses the free-text answers for "Something else"', () => {
    const text = customCakeMessage({ ...form, occasion: 'other', occasionOther: 'Graduation', flavour: 'other', flavourOther: 'Lemon and thyme', serves: 'more' });
    expect(text).toContain('Occasion: Graduation');
    expect(text).toContain('Flavour: Lemon and thyme');
    expect(text).toContain('People: More · Two tiers (quoted separately)');
    expect(text).toContain('From AED 850');
  });
});

describe('enquiryMessage', () => {
  it('names the product the customer clicked', () => {
    expect(enquiryMessage('box')).toContain('ask about The Box');
    expect(enquiryMessage('workshop')).toContain('Make one with Safa');
    expect(enquiryMessage('table')).toContain('The Table');
    expect(enquiryMessage(null)).toContain('for my company');
    expect(enquiryMessage('box')).toContain('Headcount:');
  });
});

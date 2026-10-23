import { LOG_MEDIA, media, type Media } from './media';

export const CONTACT = {
  whatsapp: '971547944882',
  phoneDisplay: '+971 54 794 4882',
  email: 'connect@berrybrown.me',
  /** Handle only, no @. Blank shows "From the studio" with no links. */
  instagram: 'berrybrown.ae',
  /** Saad to confirm the pickup / studio wording. */
  location: 'Dubai',
  hours: 'Every day · 9am – 9pm',
  legal: 'Berry Brown is a trading name of Dormers Restaurant L.L.C., Dubai. Trade licence 1433956. Not registered for VAT.',
};

/** Shown under the Six and in the footer while the photos are AI-made stand-ins. */
export const PHOTO_NOTE = 'Photos show the style. Each cake is made by hand, so yours will look a little different.';

export type Stat = { value: number; suffix: string; label: string; sample: boolean };

/** SAMPLE stats — they count up once in view. Saad swaps in the real ones. */
export const STATS: Stat[] = [
  { value: 12, suffix: '', label: 'years', sample: true },
  { value: 3400, suffix: '+', label: 'cakes', sample: true },
  { value: 100, suffix: '%', label: 'from scratch', sample: true },
];

export type Review = { name: string; area: string; text: string; cake: string; sample: boolean };

/**
 * Real reviews Saad has ticked ✅ in docs/Berry_Brown_Testimonials.md (the customer said yes).
 * The fallback when Supabase is down. Keep it the same as the published rows in the reviews table.
 * Strongest first. Customers' own words: copy them exactly (see the doc's §2).
 * Empty: the Reviews section and the hero quote stay hidden.
 */
export const REVIEWS: Review[] = [
  { name: 'Kseniia', area: 'Wedding', cake: 'Custom wedding cake', text: 'Best cake ever, it was delicious. Thank you so much, you completed our wedding perfect.', sample: false },
  { name: 'Cialymar', area: 'Event guest', cake: 'Buttercream cake', text: 'I had a slice earlier and it was so good! Perfect sweetness and the buttercream was heaven!', sample: false },
  { name: 'Joanna', area: 'Event cake', cake: 'Raspberry cake', text: 'Omg, I just tried the cake finally. The raspberry, wow. It looked so beautiful.', sample: false },
  { name: 'Joumana', area: 'Cake order', cake: 'Earl Grey & Honey', text: 'Thank you for the Earl Grey tea and honey cake, it was so delicious.', sample: false },
  { name: 'Afaf', area: 'Cake order', cake: 'Custom cake', text: 'Gurl, the cake was AMAZING. It was TOO TASTY.', sample: false },
  { name: 'Mou', area: 'Dubailand', cake: 'Brownies', text: 'Amazing brownie. We liked the taste and texture.', sample: false },
  { name: 'Claudia', area: 'Custom cake', cake: 'Heart cake', text: 'So cute, thank you!', sample: false },
  { name: 'Noora', area: 'Gift', cake: 'Cake', text: 'Thank you so much for the thoughtful gesture and the lovely cake. It truly meant a lot to us.', sample: false },
  { name: 'Tasneem', area: 'Fellow baker', cake: 'Cake', text: 'I tried the cake, it was delicious.', sample: false },
  { name: 'Akshata', area: 'Friend', cake: 'Cake', text: 'Super cake. Nice, fluffy and spongy. A different kind of flavour, a little tangy too. Someone here ate 4 pieces in one sitting.', sample: false },
];

/** The one short quote in the hero. Shown only while a review from this name is published. */
export const HERO_QUOTE = { text: 'Best cake ever.', name: 'Kseniia' };

export const FAQS = [
  { q: 'How early should I order?', a: 'The Six need 24 hours. Custom cakes need a week. Gift boxes need 3–5 days, or 2–3 weeks with your logo.' },
  { q: 'How do cakes survive the Dubai heat?', a: 'Every cake travels in an air-conditioned van, so it arrives cool and set.' },
  { q: 'Is everything Halal?', a: 'Yes. We only use halal gelatin, fruit pectin and agar agar.' },
  { q: 'Can I add a message?', a: 'Yes. Every cake can carry a hand-piped message of up to 35 characters.' },
  { q: 'How do I pay?', a: 'Pay online by card or Apple Pay, or send your order on WhatsApp and pay by bank transfer or cash on delivery.' },
  { q: 'Do you deliver?', a: 'Yes, anywhere in Dubai for AED 20. Orders over AED 300 travel free. You can also collect from us.' },
  { q: 'Do you do corporate orders?', a: 'Yes. Gift boxes from 20, workshops from 5 people, and events for up to 60 guests. Tap Get a quote and we reply with a price and an invoice.' },
  { q: 'How do deposits work?', a: 'Custom cakes and gift boxes are confirmed with a 50% deposit. The rest is due before delivery. Workshops and events are paid in full to book.' },
  { q: 'Can I cancel?', a: 'Yes, with 48 hours’ notice. After that we keep the deposit.' },
];

export type LogEntry = { n: number; for: string; flavour: string; size: string; image: Media; sample: boolean };

/** The log — numbered real cakes, newest first. SAMPLE entries until real cakes exist. */
export const LOG: LogEntry[] = [
  { n: 41, for: "for Ayesha's dad, 60th", flavour: 'Classic chocolate', size: '7"', image: LOG_MEDIA[0], sample: true },
  { n: 40, for: 'for a baby shower in Jumeirah', flavour: 'Strawberry & mascarpone', size: '6"', image: LOG_MEDIA[1], sample: true },
  { n: 39, for: "for Lina and Omar's engagement", flavour: 'Vanilla raspberry', size: '7"', image: LOG_MEDIA[2], sample: true },
];

export const cakeNumber = (n: number) => `#${String(n).padStart(3, '0')}`;


export type Step = { n: string; title: string; text: string; image: Media };

export const STEPS: Step[] = [
  { n: '01', title: 'Pick your cake', text: 'Choose one of the Six, or design your own.', image: media.how[0] },
  { n: '02', title: 'Choose a day', text: 'We bake to order. The Six need 24 hours, custom cakes a week.', image: media.how[1] },
  { n: '03', title: 'We bring it chilled', text: 'Delivered in a chilled, air-conditioned vehicle to keep your cake cool and secure.', image: media.how[2] },
];

export type GalleryItem = { image: Media; caption: string; tall: boolean };

export const GALLERY: GalleryItem[] = [
  { image: media.kitchen.layers, caption: 'Berry layers', tall: true },
  { image: media.kitchen.crumb, caption: 'The crumb', tall: false },
  { image: media.kitchen.cocoa, caption: 'Cocoa', tall: true },
  { image: media.six[1], caption: 'Vanilla raspberry', tall: true },
  { image: media.kitchen.packing, caption: 'Packed by hand', tall: false },
  { image: media.kitchen.flowers, caption: 'Fresh flowers', tall: true },
];

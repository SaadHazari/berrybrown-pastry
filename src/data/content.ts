import { media } from './media';

export const CONTACT = {
  whatsapp: '971501234567',
  phoneDisplay: '+971 50 123 4567',
  email: 'hello@berrybrown.ae',
  instagram: 'berrybrown.pastry',
  location: 'Al Quoz, Dubai',
  hours: 'Every day · 9am – 9pm',
};

/** SAMPLE rating — replace with the real Google/Instagram rating before launch. */
export const RATING = { score: 4.9, count: 260 };

export const MARQUEE_ITEMS = [
  'Baked to order',
  '100% Halal',
  'Chilled delivery across Dubai',
  'No gelatin',
  'Real butter, real fruit',
  'Made with heart, not haste',
];

/** Rotates per visit — a small "variable reward" for returning visitors. */
export const OVEN_NOTES = [
  'Fresh from the oven today: pistachio sponges',
  'Today in the kitchen: whipping up a berry drip cake',
  'This week: mangoes are perfect, tarts are back',
  'Just out: a tray of chocolate sponges cooling',
];

export const STEPS = [
  { n: '01', title: 'Pick your cake', text: 'Choose a size and flavour, and add a message.', image: media.gallery.berrySlice },
  { n: '02', title: 'Choose a day', text: 'We bake it fresh for you, with just 24 hours notice.', image: media.gallery.kneading },
  { n: '03', title: 'We bring it chilled', text: 'Delivered cold to your door, or picked up in Al Quoz.', image: media.gallery.birthday },
];

/** SAMPLE numbers — replace with Safa's real figures before launch. */
export const STATS = [
  { value: 12, suffix: ' yrs', label: 'baking' },
  { value: 3400, suffix: '+', label: 'cakes baked' },
  { value: 100, suffix: '%', label: 'from scratch' },
];

/** SAMPLE reviews — replace with real customer reviews (with permission) before launch. */
export const REVIEWS = [
  {
    name: 'Reem A.',
    area: 'Emirates Hills',
    text: 'The drip cake was gone in ten minutes. Not too sweet, just perfect. My kids are still talking about it!',
    cake: 'Berry Chocolate Drip',
  },
  {
    name: 'Maya & Alex',
    area: 'Palm Jumeirah',
    text: 'Safa made our wedding cake and it tasted even better than it looked. Every guest asked where it came from.',
    cake: 'Floral Celebration Cake',
  },
  {
    name: 'Fatima H.',
    area: 'Downtown',
    text: 'The pistachio kunafa cake is a dream. Arrived cold and perfect in the middle of August.',
    cake: 'Pistachio Kunafa Cake',
  },
  {
    name: 'Omar K.',
    area: 'Dubai Hills',
    text: 'Ordered at night, cake at the door next evening. Easy, friendly, and so good.',
    cake: 'Blueberry Cheesecake',
  },
  {
    name: 'Sara M.',
    area: 'JVC',
    text: 'Feels like a cake your favourite aunt would make, but prettier. We order every birthday now.',
    cake: 'Berry Cream Sponge',
  },
];

export const FAQS = [
  {
    q: 'How early should I order?',
    a: 'Most cakes need 24 hours. Tiered celebration cakes need 48 hours, and a week is ideal for weddings.',
  },
  {
    q: 'How do cakes survive the Dubai heat?',
    a: 'Every cake is packed with ice packs in an insulated box and driven over chilled. Keep it in the fridge until about 15 minutes before serving.',
  },
  {
    q: 'Is everything Halal?',
    a: 'Yes, 100%. We never use gelatin. We set creams with fruit pectin or agar instead.',
  },
  {
    q: 'Can I add a message?',
    a: 'Yes. Every cake can have a free handwritten chocolate plaque (up to 35 characters).',
  },
  {
    q: 'How do I pay?',
    a: 'Pay online by card or Apple Pay, or send your order on WhatsApp and pay by bank transfer or cash on delivery.',
  },
];

export type GalleryItem = { src: string; alt: string; caption: string; tall?: boolean };

export const GALLERY: GalleryItem[] = [
  { ...media.gallery.rusticCake, tall: true, caption: 'Sunday sugar cake' },
  { ...media.gallery.berrySlice, tall: true, caption: 'Berry layers' },
  { ...media.gallery.coffee, caption: 'Coffee break' },
  { ...media.gallery.tartDisplay, tall: true, caption: 'Tart morning' },
  { ...media.gallery.pistachioSlice, tall: true, caption: 'Pistachio & raspberry' },
  { ...media.gallery.kneading, caption: 'Where it starts' },
  { ...media.gallery.chocolateSlice, tall: true, caption: 'Last slice' },
  { ...media.gallery.birthday, caption: 'Make a wish' },
];

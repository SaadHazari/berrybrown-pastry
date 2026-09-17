import { media } from './media';

export type Size = { id: string; label: string; serves: string; price: number; popular?: boolean };
export type Flavour = { id: string; name: string };
export type Category = 'signature' | 'celebration' | 'tarts';

export type Product = {
  id: string;
  name: string;
  short: string;
  note: string; // handwritten aside from Safa
  category: Category;
  badge?: string;
  image: string;
  gallery: string[];
  leadTimeHours: number;
  sizes: Size[];
  flavours: Flavour[];
  tags: string[];
  allergens: string[];
};

const round = (id: string, price: number, serves: string, label: string, popular = false): Size => ({
  id,
  price,
  serves,
  label,
  popular,
});

const STANDARD_SIZES = (petite: number, classic: number, grand: number): Size[] => [
  round('petite', petite, '2–4', '4" Petite'),
  round('classic', classic, '6–8', '6" Classic', true),
  round('grand', grand, '10–14', '8" Grand'),
];

export const PRODUCTS: Product[] = [
  {
    id: 'berry-chocolate-drip',
    name: 'Berry Chocolate Drip',
    short: 'Dark chocolate sponge, berry jam and a glossy ganache drip.',
    note: 'the one everyone asks for',
    category: 'signature',
    badge: 'Most loved',
    image: media.products.chocolateDrip.src,
    gallery: [media.products.chocolateDrip.src, media.gallery.chocolateSlice.src],
    leadTimeHours: 24,
    sizes: STANDARD_SIZES(195, 295, 420),
    flavours: [
      { id: 'dark', name: 'Dark chocolate & raspberry' },
      { id: 'milk', name: 'Milk chocolate & strawberry' },
      { id: 'mocha', name: 'Mocha & blackberry' },
    ],
    tags: ['Halal', 'No gelatin'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
  },
  {
    id: 'pistachio-kunafa',
    name: 'Pistachio Kunafa Cake',
    short: 'Pistachio cream, crunchy golden kunafa and a hint of orange blossom.',
    note: 'a little taste of home',
    category: 'signature',
    badge: 'Dubai favourite',
    image: media.products.pistachioKunafa.src,
    gallery: [media.products.pistachioKunafa.src, media.gallery.pistachioSlice.src],
    leadTimeHours: 24,
    sizes: STANDARD_SIZES(220, 320, 460),
    flavours: [
      { id: 'classic', name: 'Pistachio & kunafa' },
      { id: 'rose', name: 'Pistachio, rose & raspberry' },
    ],
    tags: ['Halal', 'No gelatin'],
    allergens: ['Dairy', 'Pistachio', 'Gluten', 'Eggs'],
  },
  {
    id: 'berry-cream-sponge',
    name: 'Berry Cream Sponge',
    short: 'Light vanilla sponge, whipped cream and a big pile of fresh berries.',
    note: 'soft as a cloud',
    category: 'signature',
    image: media.products.creamSponge.src,
    gallery: [media.products.creamSponge.src, media.gallery.berrySlice.src],
    leadTimeHours: 24,
    sizes: STANDARD_SIZES(175, 265, 380),
    flavours: [
      { id: 'vanilla', name: 'Vanilla & mixed berries' },
      { id: 'lemon', name: 'Lemon & raspberry' },
    ],
    tags: ['Halal', 'Fresh fruit'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
  },
  {
    id: 'salted-caramel-chocolate',
    name: 'Salted Caramel Chocolate',
    short: 'Rich chocolate mousse over a soft caramel centre and hazelnut crunch.',
    note: 'for the serious chocolate people',
    category: 'signature',
    image: media.products.caramelChocolate.src,
    gallery: [media.products.caramelChocolate.src],
    leadTimeHours: 24,
    sizes: STANDARD_SIZES(210, 310, 440),
    flavours: [
      { id: 'caramel', name: 'Dark chocolate & salted caramel' },
      { id: 'praline', name: 'Double hazelnut praline' },
    ],
    tags: ['Halal', 'No gelatin', 'Less sugar'],
    allergens: ['Dairy', 'Hazelnut', 'Gluten', 'Eggs'],
  },
  {
    id: 'blueberry-cheesecake',
    name: 'Blueberry Cheesecake',
    short: 'Creamy baked cheesecake on a buttery biscuit base, crowned with blueberries.',
    note: 'baked slow, the old way',
    category: 'celebration',
    image: media.products.blueberryCheesecake.src,
    gallery: [media.products.blueberryCheesecake.src],
    leadTimeHours: 24,
    sizes: STANDARD_SIZES(185, 275, 395),
    flavours: [
      { id: 'blueberry', name: 'Vanilla & blueberry' },
      { id: 'lotus', name: 'Lotus biscoff' },
    ],
    tags: ['Halal', 'No gelatin'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
  },
  {
    id: 'berry-charlotte',
    name: 'Vanilla Berry Charlotte',
    short: 'Ladyfingers tied with ribbon around vanilla cream and berries.',
    note: 'pretty enough for a tea party',
    category: 'celebration',
    image: media.products.charlotte.src,
    gallery: [media.products.charlotte.src],
    leadTimeHours: 24,
    sizes: [
      round('classic', 290, '6–8', '6" Classic', true),
      round('grand', 420, '10–14', '8" Grand'),
    ],
    flavours: [
      { id: 'vanilla', name: 'Vanilla & wild berries' },
      { id: 'lemon', name: 'Lemon & raspberry' },
    ],
    tags: ['Halal', 'Fresh fruit'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
  },
  {
    id: 'celebration-tiered',
    name: 'Floral Celebration Cake',
    short: 'Two or three tiers of buttercream and fresh flowers for the big days.',
    note: "let's make it yours",
    category: 'celebration',
    badge: '48h notice',
    image: media.products.celebration.src,
    gallery: [media.products.celebration.src, media.gallery.birthday.src],
    leadTimeHours: 48,
    sizes: [
      round('two', 850, '18–24', '2 tiers', true),
      round('two-grand', 1250, '30–38', '2 tiers, tall'),
      round('three', 1850, '50–65', '3 tiers'),
    ],
    flavours: [
      { id: 'vanilla-berry', name: 'Vanilla & strawberry' },
      { id: 'choc-caramel', name: 'Chocolate & salted caramel' },
      { id: 'pistachio-rose', name: 'Pistachio & cardamom rose' },
    ],
    tags: ['Halal', 'No gelatin'],
    allergens: ['Dairy', 'Almond', 'Gluten', 'Eggs'],
  },
  {
    id: 'mango-passion-tart',
    name: 'Mango Passion Tart',
    short: 'Crisp butter pastry, passion fruit curd and a mango rose on top.',
    note: 'sunshine on a plate',
    category: 'tarts',
    badge: 'Seasonal',
    image: media.products.mangoTart.src,
    gallery: [media.products.mangoTart.src],
    leadTimeHours: 24,
    sizes: [
      round('classic', 240, '5–7', '6" Tart', true),
      round('grand', 340, '8–11', '8" Tart'),
    ],
    flavours: [
      { id: 'passion', name: 'Passion fruit & mango' },
      { id: 'lime', name: 'Lime & coconut' },
    ],
    tags: ['Halal', 'Fresh fruit'],
    allergens: ['Dairy', 'Almond', 'Gluten', 'Eggs'],
  },
  {
    id: 'citrus-almond-tart',
    name: 'Citrus Almond Tart',
    short: 'Almond cream, lemon curd and fresh orange and grapefruit.',
    note: 'bright and not too sweet',
    category: 'tarts',
    image: media.products.citrusTart.src,
    gallery: [media.products.citrusTart.src],
    leadTimeHours: 24,
    sizes: [
      round('mini', 95, '1–2', 'Individual (x2)'),
      round('classic', 220, '5–7', '6" Tart', true),
      round('grand', 320, '8–11', '8" Tart'),
    ],
    flavours: [{ id: 'citrus', name: 'Orange, grapefruit & lemon' }],
    tags: ['Halal', 'Fresh fruit'],
    allergens: ['Dairy', 'Almond', 'Gluten', 'Eggs'],
  },
];

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'signature', label: 'Signature cakes' },
  { id: 'celebration', label: 'Celebrations' },
  { id: 'tarts', label: 'Tarts' },
];

export const FAVOURITE_IDS = [
  'berry-chocolate-drip',
  'pistachio-kunafa',
  'berry-cream-sponge',
  'mango-passion-tart',
  'blueberry-cheesecake',
  'celebration-tiered',
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function defaultSize(p: Product): Size {
  return p.sizes.find((s) => s.popular) ?? p.sizes[0];
}

export function fromPrice(p: Product): number {
  return Math.min(...p.sizes.map((s) => s.price));
}

import { media, type Media } from './media';

export type Size = { id: string; label: string; serves: string; price: number; popular?: boolean };
export type Flavour = { id: string; name: string };

export type Product = {
  id: string;
  name: string;
  short: string;
  image: Media;
  leadTimeHours: number;
  sizes: Size[];
  flavours: Flavour[];
  allergens: string[];
  /** Names are provisional until the studio confirms the real Six. */
  sample: boolean;
};

/** One flat ladder for all six. 150 / 200 / 280 — agreed 21 Sep, Saad to confirm before merge. */
export const PRICE_LADDER: Size[] = [
  { id: '5in', label: '5"', serves: '4–6', price: 150 },
  { id: '6in', label: '6"', serves: '6–8', price: 200, popular: true },
  { id: '8in', label: '8"', serves: '10–14', price: 280 },
];

const cake = (
  id: string,
  name: string,
  short: string,
  image: Media,
  flavours: Flavour[],
  allergens: string[],
): Product => ({
  id,
  name,
  short,
  image,
  leadTimeHours: 24,
  sizes: PRICE_LADDER,
  flavours,
  allergens,
  sample: true,
});

export const PRODUCTS: Product[] = [
  cake(
    'berry-chocolate-drip',
    'Berry Chocolate Drip',
    'Dark chocolate sponge, berry jam and a glossy ganache drip.',
    media.six[0],
    [
      { id: 'dark', name: 'Dark chocolate & raspberry' },
      { id: 'milk', name: 'Milk chocolate & strawberry' },
    ],
    ['Dairy', 'Gluten', 'Eggs'],
  ),
  cake(
    'pistachio-kunafa',
    'Pistachio Kunafa',
    'Pistachio cream, crisp golden kunafa and a little orange blossom.',
    media.six[1],
    [
      { id: 'classic', name: 'Pistachio & kunafa' },
      { id: 'rose', name: 'Pistachio, rose & raspberry' },
    ],
    ['Dairy', 'Pistachio', 'Gluten', 'Eggs'],
  ),
  cake(
    'berry-cream-sponge',
    'Berry Cream Sponge',
    'Light vanilla sponge, whipped cream and fresh berries.',
    media.six[2],
    [
      { id: 'vanilla', name: 'Vanilla & mixed berries' },
      { id: 'lemon', name: 'Lemon & raspberry' },
    ],
    ['Dairy', 'Gluten', 'Eggs'],
  ),
  cake(
    'salted-caramel-chocolate',
    'Salted Caramel Chocolate',
    'Chocolate mousse over a soft caramel centre and hazelnut crunch.',
    media.six[3],
    [
      { id: 'caramel', name: 'Dark chocolate & salted caramel' },
      { id: 'praline', name: 'Double hazelnut praline' },
    ],
    ['Dairy', 'Hazelnut', 'Gluten', 'Eggs'],
  ),
  cake(
    'blueberry-cheesecake',
    'Blueberry Cheesecake',
    'Baked cheesecake on a butter biscuit base, topped with blueberries.',
    media.six[4],
    [
      { id: 'blueberry', name: 'Vanilla & blueberry' },
      { id: 'lotus', name: 'Lotus biscoff' },
    ],
    ['Dairy', 'Gluten', 'Eggs'],
  ),
  cake(
    'berry-charlotte',
    'Vanilla Berry Charlotte',
    'Ladyfingers tied with ribbon around vanilla cream and berries.',
    media.six[5],
    [
      { id: 'vanilla', name: 'Vanilla & wild berries' },
      { id: 'lemon', name: 'Lemon & raspberry' },
    ],
    ['Dairy', 'Gluten', 'Eggs'],
  ),
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function defaultSize(p: Product): Size {
  return p.sizes.find((s) => s.popular) ?? p.sizes[0];
}

/** The size a visitor chose on the card, or the popular 6" when they have not chosen one. */
export function sizeFor(p: Product, id: string | null | undefined): Size {
  return p.sizes.find((s) => s.id === id) ?? defaultSize(p);
}

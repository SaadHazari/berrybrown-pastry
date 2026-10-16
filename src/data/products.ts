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
  /** True while the name or price is a placeholder. */
  sample: boolean;
};

/** Sizes 5" / 6" / 7". Each cake has its own prices, from the studio price list of 16 Oct 2026. */
const ladder = (p5: number, p6: number, p7: number): Size[] => [
  { id: '5in', label: '5"', serves: '4–6', price: p5 },
  { id: '6in', label: '6"', serves: '6–8', price: p6, popular: true },
  { id: '7in', label: '7"', serves: '10–12', price: p7 },
];

/** Each of the Six is one flavour, so the cake's only flavour has the same name. */
const cake = (id: string, name: string, short: string, image: Media, prices: [number, number, number], allergens: string[]): Product => ({
  id,
  name,
  short,
  image,
  leadTimeHours: 24,
  sizes: ladder(...prices),
  flavours: [{ id, name }],
  allergens,
  sample: false,
});

export const PRODUCTS: Product[] = [
  cake('brown-butter', 'Brown Butter & Cinnamon', 'Brown butter and cinnamon sponge with salted caramel.', media.six[0], [145, 180, 245], ['Dairy', 'Gluten', 'Eggs']),
  cake('vanilla-raspberry', 'Vanilla Raspberry', 'Vanilla sponge with raspberry.', media.six[1], [145, 180, 245], ['Dairy', 'Gluten', 'Eggs']),
  cake('lemon', 'Lemon & Cream Cheese', 'Lemon sponge with cream cheese frosting.', media.six[2], [155, 195, 265], ['Dairy', 'Gluten', 'Eggs']),
  cake('chocolate', 'Classic Chocolate', 'Our classic chocolate cake.', media.six[3], [160, 200, 270], ['Dairy', 'Gluten', 'Eggs']),
  cake('earl-grey', 'Earl Grey & Honey', 'Earl Grey sponge with honey.', media.six[4], [155, 190, 255], ['Dairy', 'Gluten', 'Eggs']),
  cake('strawberry', 'Strawberry & Mascarpone', 'Fresh strawberries and mascarpone cream.', media.six[5], [175, 210, 280], ['Dairy', 'Gluten', 'Eggs']),
];

/** The flavour, worth showing only when the cake offers more than one. Each of the Six has one, named like the cake. */
export function flavourNote(p: Product, f: Flavour): string | null {
  return p.flavours.length > 1 ? f.name : null;
}

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

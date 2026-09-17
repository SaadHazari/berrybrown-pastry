import { media } from './media';

export type BuilderOption = { id: string; label: string; hint?: string; add: number; emoji?: string };
export type BuilderGroup = { id: 'occasion' | 'tiers' | 'finish' | 'flavour'; title: string; options: BuilderOption[] };
export type BuilderSelection = Record<BuilderGroup['id'], string>;

export const BUILDER_IMAGE = media.products.celebration;

export const BUILDER_GROUPS: BuilderGroup[] = [
  {
    id: 'occasion',
    title: "What's the occasion?",
    options: [
      { id: 'birthday', label: 'Birthday', emoji: '🎂', add: 0 },
      { id: 'wedding', label: 'Wedding', emoji: '💍', add: 250 },
      { id: 'baby', label: 'Baby shower', emoji: '🍼', add: 0 },
      { id: 'other', label: 'Just because', emoji: '🌸', add: 0 },
    ],
  },
  {
    id: 'tiers',
    title: 'How many guests?',
    options: [
      { id: '1', label: 'Up to 15', hint: '1 tier', add: 450 },
      { id: '2', label: '20 – 40', hint: '2 tiers', add: 900 },
      { id: '3', label: '50 – 80', hint: '3 tiers', add: 1600 },
    ],
  },
  {
    id: 'finish',
    title: 'Pick a look',
    options: [
      { id: 'buttercream', label: 'Soft buttercream', add: 0 },
      { id: 'florals', label: 'Fresh flowers', add: 180 },
      { id: 'drip', label: 'Drip & berries', add: 120 },
      { id: 'gold', label: 'Gold leaf', add: 220 },
    ],
  },
  {
    id: 'flavour',
    title: 'And the flavour',
    options: [
      { id: 'vanilla-berry', label: 'Vanilla & berry', add: 0 },
      { id: 'chocolate', label: 'Chocolate & caramel', add: 40 },
      { id: 'pistachio', label: 'Pistachio & rose', add: 80 },
    ],
  },
];

export const DEFAULT_SELECTION: BuilderSelection = {
  occasion: 'birthday',
  tiers: '2',
  finish: 'florals',
  flavour: 'vanilla-berry',
};

function pick(group: BuilderGroup['id'], id: string): BuilderOption {
  const g = BUILDER_GROUPS.find((x) => x.id === group)!;
  return g.options.find((o) => o.id === id) ?? g.options[0];
}

/** Rough price range for a custom cake; the final quote comes from Safa. */
export function estimate(sel: BuilderSelection): { min: number; max: number } {
  const base = (Object.keys(sel) as BuilderGroup['id'][]).reduce((sum, g) => sum + pick(g, sel[g]).add, 0);
  const min = Math.round(base / 10) * 10;
  const max = Math.round((base * 1.25) / 10) * 10;
  return { min, max };
}

export function describe(sel: BuilderSelection): string[] {
  return BUILDER_GROUPS.map((g) => {
    const o = pick(g.id, sel[g.id]);
    return `${g.title.replace(/\?$/, '')}: ${o.label}${o.hint ? ` (${o.hint})` : ''}`;
  });
}

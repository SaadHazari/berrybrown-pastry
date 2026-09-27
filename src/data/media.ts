import { READY_PHOTOS } from './photos.generated';

/**
 * Every photo on the page, by slot. They are AI-made stand-ins (`ai: true`) until real photos exist.
 * Files: /public/images/ai/<slot>-640.webp and <slot>-1200.webp, written by scripts/grade-photos.py,
 * which also lists finished slots in photos.generated.ts. A slot without files renders the Rose placeholder.
 * To swap in a real photo: run `python3 scripts/grade-photos.py <folder> --real` with the file named <slot>.jpg,
 * then set `ai` to false for that slot.
 */
export type Ratio = '4:5' | '1:1' | '4:3' | '3:4' | '3:2';

export type Media = {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
  alt: string;
  label: string;
  /** No file yet: render the Rose placeholder. */
  placeholder: boolean;
  /** An AI-made stand-in, to be replaced by a real photo. */
  ai?: boolean;
  slot?: string;
  ratio?: Ratio;
};

const SIZE: Record<Ratio, [number, number]> = {
  '4:5': [1200, 1500],
  '1:1': [1200, 1200],
  '4:3': [1200, 900],
  '3:4': [1200, 1600],
  '3:2': [1200, 800],
};

const ready = new Set(READY_PHOTOS);

export function aiPhoto(slot: string, ratio: Ratio, alt: string, label: string): Media {
  const base = `/images/ai/${slot}`;
  const [width, height] = SIZE[ratio];
  return { src: `${base}-1200.webp`, srcSet: `${base}-640.webp 640w, ${base}-1200.webp 1200w`, width, height, alt, label, placeholder: !ready.has(slot), ai: true, slot, ratio };
}

export const media = {
  hero: {
    cake: aiPhoto('hero-cake', '4:5', 'A chocolate drip cake with fresh raspberries on a cream cake stand', 'The Six · Berry Chocolate Drip'),
    slice: aiPhoto('hero-slice', '1:1', 'A slice of berry layer cake on a small plate', 'A slice'),
    hands: aiPhoto('hero-hands', '4:5', 'Hands piping cream onto a berry cake', 'Piping by hand'),
  },
  six: [
    aiPhoto('six-berry-chocolate-drip', '4:5', 'Berry Chocolate Drip cake', 'The Six · 1 of 6'),
    aiPhoto('six-pistachio-kunafa', '4:5', 'Pistachio Kunafa cake', 'The Six · 2 of 6'),
    aiPhoto('six-berry-cream-sponge', '4:5', 'Berry Cream Sponge cake', 'The Six · 3 of 6'),
    aiPhoto('six-salted-caramel-chocolate', '4:5', 'Salted Caramel Chocolate cake', 'The Six · 4 of 6'),
    aiPhoto('six-blueberry-cheesecake', '4:5', 'Blueberry Cheesecake', 'The Six · 5 of 6'),
    aiPhoto('six-vanilla-berry-charlotte', '4:5', 'Vanilla Berry Charlotte cake', 'The Six · 6 of 6'),
  ],
  looks: {
    buttercream: aiPhoto('look-buttercream', '4:5', 'A cake finished in soft buttercream', 'Soft buttercream'),
    flowers: aiPhoto('look-flowers', '4:5', 'A cake decorated with fresh roses', 'Fresh flowers'),
    drip: aiPhoto('look-drip', '4:5', 'A cake with a chocolate drip and fresh berries', 'Drip & berries'),
    custom: aiPhoto('look-custom', '4:5', 'A sketchbook with a cake drawing and colour swatches', 'The one we make for you'),
  },
  how: [
    aiPhoto('how-pick', '4:3', 'Small cakes on a counter, ready to choose', 'Step 1'),
    aiPhoto('how-bake', '4:3', 'Sponge layers being filled with cream', 'Step 2'),
    aiPhoto('how-deliver', '4:3', 'A cake box handed over at a door', 'Step 3'),
  ],
  box: {
    open: aiPhoto('box-open', '4:5', 'An open gift box of brownies and cookies with a hand-written card', 'The Box'),
    stack: aiPhoto('box-stack', '1:1', 'A stack of gift boxes with sleeves and ribbon', 'Boxes, packed'),
  },
  workshop: {
    table: aiPhoto('workshop-table', '4:5', 'Hands decorating small cakes at a long table', 'Workshop'),
    piping: aiPhoto('workshop-piping', '1:1', 'Piping bags and bowls of berries on a table', 'Piping bags'),
  },
  events: {
    session: aiPhoto('event-session', '3:2', 'An office table set for a cake decorating session', 'The decorating session'),
    table: aiPhoto('event-table', '3:2', 'A dessert table of mini cakes and tarts', 'The Table'),
  },
  studio: {
    hands: aiPhoto('studio-hands', '4:5', 'Hands smoothing buttercream with a scraper', 'Finished by hand'),
    berries: aiPhoto('studio-berries', '1:1', 'A bowl of fresh raspberries and strawberries', 'Fresh berries'),
  },
  kitchen: {
    layers: aiPhoto('kitchen-layers', '3:4', 'Sponge layers on a board with berry jam', 'Berry layers'),
    crumb: aiPhoto('kitchen-crumb', '4:3', 'A slice of chocolate cake with a fork', 'The crumb'),
    cocoa: aiPhoto('kitchen-cocoa', '3:4', 'Cocoa powder dusted over a chocolate cake', 'Cocoa'),
    piping: aiPhoto('kitchen-piping', '3:4', 'A hand piping cream rosettes on a cake', 'Piping by hand'),
    packing: aiPhoto('kitchen-packing', '4:3', 'A cake being packed into a box', 'Packed by hand'),
    flowers: aiPhoto('kitchen-flowers', '3:4', 'Fresh roses pressed into buttercream', 'Fresh flowers'),
  },
  faq: aiPhoto('faq-coffee', '1:1', 'Coffee and a slice of cake on a tray', 'Ask us anything'),
};

/** The log samples reuse the look photos until real numbered cakes are published in Supabase. */
export const LOG_MEDIA: Media[] = [media.looks.drip, media.looks.flowers, media.looks.buttercream];

/** Every distinct slot — the photo pipeline and the tests walk this list. */
export const ALL_MEDIA: Media[] = [
  ...Object.values(media.hero),
  ...media.six,
  ...Object.values(media.looks),
  ...media.how,
  ...Object.values(media.box),
  ...Object.values(media.workshop),
  ...Object.values(media.events),
  ...Object.values(media.studio),
  ...Object.values(media.kitchen),
  media.faq,
];

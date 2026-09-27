# Berry Brown — website

One-page marketing site + shop for Berry Brown, a cake studio in Dubai led by Chef Safa.
Stack: React 19 · TypeScript · Vite · Tailwind v4 · Cloudflare Workers (see README.md).

## Read these before any design, CSS or copy change

1. `docs/Berry_Brown_Website_Brief_v2.md` — what to build, section by section, and the order of work.
2. `docs/brand/Berry_Brown_Brand_Guidelines.md` — colours, fonts, logo rules, voice.
3. `docs/brand/berrybrown-colours.css` — the exact colour and type tokens.

## Rules that never bend

- The name is always a logo file from `public/brand/`. Never type "Berry Brown" as a logo.
- Sentences in **Alegreya**. Labels, buttons, prices and numbers in **Jost**. No other fonts. No handwriting fonts.
- Four colours only: Butter `#F6EEDF`, Cocoa `#3E2A21`, Rose `#E7CFC6`, Claret `#7A2A3A`, plus Cocoa 70% `#726156` for second-level text and Cocoa 15% for hairlines.
- **One** Claret element per section, besides the berry in the logo.
- Corners 4 px. Never pills, never sharp. Hairlines, not boxes.
- Nothing moves on its own: no smooth-scroll library, no marquee, no auto-play, no count-ups. One fade-in on section entry is the limit.
- Copy: short sentences, no exclamation marks, no "indulge / delight / treat yourself". "We", not "I". Never "homemade".
- Max 12 photos on the page. Image slots use the Rose placeholder until real photos exist.
- Spacing and type sizes follow the golden-ratio scale in the brief §5 (base 18 px; tokens 2xs…3xl).

## Where things live

| What | Where |
|---|---|
| Logo SVGs, colour circles | `public/brand/` |
| Web fonts (WOFF2) | `public/fonts/` |
| Favicons | `public/` (snippet in `docs/brand/favicon-snippet.html`) |
| Cakes, sizes, prices | `src/data/products.ts` |
| Contact, reviews, FAQ, stats | `src/data/content.ts` |
| Tokens | `src/index.css` |

Anything marked `sample: true` in `src/data/` is placeholder content. Never present it as real.

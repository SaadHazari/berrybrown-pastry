# Berry Brown — website

One-page marketing site + shop for Berry Brown, a cake studio in Dubai led by Chef Safa.
Stack: React 19 · TypeScript · Vite · Tailwind v4 · Cloudflare Workers (see README.md).

## Read these before any design, CSS or copy change

1. `docs/superpowers/specs/2026-09-27-berrybrown-lively-redesign-design.md` — the current design: page order, sections, motion, photos.
2. `docs/brand/Berry_Brown_Brand_Guidelines.md` — colours, fonts, logo rules, voice.
3. `docs/Berry_Brown_Website_Brief_v2.md` §5 — the LiftKit spacing and type maths (`docs/brand/berrybrown-colours.css` has the exact colour tokens).

## Rules that never bend

- The name is always a logo file from `public/brand/`. Never type "Berry Brown" as a logo.
- Sentences in **Alegreya**. Labels, buttons, prices and numbers in **Jost**. No other fonts. No handwriting fonts.
- Four colours only: Butter `#F6EEDF`, Cocoa `#3E2A21`, Rose `#E7CFC6`, Claret `#7A2A3A`, plus Cocoa 70% `#726156` for second-level text and Cocoa 15% for hairlines.
- **One** Claret element per section, besides the berry in the logo.
- Corners 4 px on cards, buttons and chips. Circles only for icon-only buttons, avatars and dots. Never pill-shaped text buttons, never sharp. Hairlines, not boxes.
- Motion happens only on scroll, pointer or tap. Two exceptions: the review rows drift, with a pause button; and once per visit, the hero intro (the logo glides into the top bar while the tagline types in, about 2.5 s; any scroll, key or tap ends it). No smooth-scroll library, no marquee strip, no video, no preloader. `prefers-reduced-motion` stops all of it.
- Copy: short sentences, no exclamation marks, no "indulge / delight / treat yourself". "We", "us", "our team" — never "I", never "Chef Safa" or "Safa" on the site. Never "homemade".
- Photos are AI-made in the palette until real ones exist (`ai: true` in `src/data/media.ts`, files from `scripts/grade-photos.py`). Replace them one by one. The Rose placeholder is only the fallback for a missing file.
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
| Photos, prompts, grading | `public/images/ai/`, `scripts/photo-slots.json`, `scripts/grade-photos.py` |
| Company channels, deadlines, quotes | `src/data/companies.ts`, `src/data/quote.ts` |

Anything marked `sample: true` in `src/data/` is placeholder content. Never present it as real.

# Berry Brown — Brand Guidelines (text version)

**Edition 1 · 25 Sep 2026.** The designed version is `Berry Brown Brand Book.pdf` (14 pages, A4) in iCloud → `1.Projects/Berry brown/Branding/`. The full kit is beside it in `BerryBrown-Brand-Kit/`. This repo carries only the web subset: logo SVGs in `public/brand/`, fonts in `public/fonts/`, tokens in `docs/brand/berrybrown-colours.css`.

## The three rules

1. The name is always the logo file (lettering traced from the original Pony Club logo). Never type the name as a logo. Pony Club is not a text font.
2. A sentence is **Alegreya**. A label, button, price or number is **Jost**.
3. One **Claret** thing per layout, besides the berry in the logo (one button, one number or one word).

## Colour

| Name | HEX | RGB | Job |
|---|---|---|---|
| Butter | #F6EEDF | 246 238 223 | Background |
| Cocoa | #3E2A21 | 62 42 33 | Ink |
| Rose | #E7CFC6 | 231 207 198 | Soft background, panels, image mats |
| Claret | #7A2A3A | 122 42 58 | The berry, one accent |

Tints: Cocoa 70% #726156 (second-level text, 5.1:1 on Butter); Cocoa 15% for hairlines only. Mix ≈ Butter 60 / Cocoa 25 / Rose 10 / Claret 5. Contrast: Cocoa on Butter 11.7, Cocoa on Rose 9.1, Butter on Claret 8.2 — Claret on Cocoa 1.4, never.

## Type

| Style | Font | Web |
|---|---|---|
| Label | Jost Medium, caps, +0.20 em | 11–12 px |
| Headline | Alegreya SemiBold | 32–44 px |
| Section | Alegreya SemiBold | 22–24 px |
| One-liner | Alegreya Medium Italic | 19 px |
| Body | Alegreya Medium, line 1.55 | 18 px |
| Caption | Alegreya Medium Italic | 14 px |
| Button | Jost Medium, caps, +0.16 em, Butter on Claret | 12–13 px |
| Price / numbers | Jost Medium, tabular | 14–16 px |

- Always turn on lining figures for Alegreya (`font-variant-numeric: lining-nums`), or 0 looks like o. The CSS `font` shorthand resets this — use longhand properties.
- Never Alegreya in capitals; never sentences in Jost. Smallest sentences 16 px; smallest labels 11 px.
- Tagline lockup: MADE WITH HEART · NOT HASTE (Jost Medium caps, +0.32 em, 86% of name width) — use `public/brand/berrybrown-tagline.svg`. In running text: "Made with heart, not haste."
- Web fonts in `public/fonts/`: `alegreya-500.woff2`, `alegreya-500-italic.woff2`, `alegreya-600.woff2`, `jost-500.woff2`. Self-host these; do not load Google Fonts.

## Logo use

Files in `public/brand/`:

| File | Use |
|---|---|
| `berrybrown-logo-horizontal.svg` | Website header, invoices, email — anything wider than tall |
| `berrybrown-logo-primary.svg` | Stacked signature: hero, covers, cards (over 40 mm / ~150 px) |
| `berrybrown-logo-primary-small-sizes.svg` | Stacked, 72–150 px |
| `berrybrown-sprig.svg` | Icon on its own, under 72 px; placeholder panels |
| `berrybrown-logo-on-dark.svg` | On Cocoa backgrounds (footer) |
| `berrybrown-logo-one-colour.svg` | Stamps, one-ink |
| `berrybrown-seal.svg` | Box lid sticker only |
| `berrybrown-circle-{butter,rose,cocoa,claret}.svg` | Icons for cards, Instagram highlights |
| `berrybrown-avatar.svg` | Profile photo shape |

- Clear space = the berry's height on every side.
- Never: stretch, recolour, add effects, place directly on a photo (use a Butter or Rose panel), type the name, tilt or rearrange.

## Details (use one or two per piece, never all)

Sprig · lace seal · colour circles · lace edge · middle dot (caps and short lists only) · cake number (#041, Jost) · slot dot (filled Cocoa = live, empty = sold out) · Safa's real handwriting on labels (never a handwriting font).

## Shapes and layout

Soft corners 4 px, never pill, never sharp. Hairlines, not boxes. About a third of any layout is empty. Centre signature pieces (logo, stickers); left-align anything people read.

## Photography

Phone camera, window light, her counter and plates, hands in frame, imperfections left in. No studio, white backdrop, ring light, retouching, stock photos, AI-made cakes, or other bakeries' cakes. Until real photos exist, every image slot is a Rose panel with the sprig at 30% and a Jost label (see `Shot-list.md`).

## Voice

Short sentences. No exclamation marks. No "indulge", "delight", "treat yourself". On the website: "we", not "I"; "cake studio", never "homemade". Last test: would Safa be happy to put her name on it?

## Open items

- Instagram handle not yet recorded.
- The six flavour names not yet recorded — "Classic chocolate" is the only example used.
- Brand photos to be shot.

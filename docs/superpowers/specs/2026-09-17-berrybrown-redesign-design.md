# BerryBrown Redesign — Design Spec

Date: 2026-09-17
Status: Approved (direction + stack option 1, video hero added)

## Goal

Replace the current text-heavy, "5-star hotel" vanilla-JS site with an image-led,
homely-modern marketing + ordering site for Chef Safa's BerryBrown (Dubai). It is the
landing destination for Instagram / ads traffic, so it must convert on mobile first
and feel premium on desktop.

## Direction — "Safa's kitchen, not a hotel lobby"

- Palette: warm cream paper (`#F6EFE4`), soft oat (`#EADFCC`), cocoa ink (`#2B1B14`),
  milk chocolate (`#6B4A3A`), berry accent (`#9E2A4B`), blush (`#F2D6D9`), sage
  (`#8A9A7B`) for small tags. No gold, no black.
- Type: Fraunces (display, soft optical sizes), Caveat (handwritten notes echoing the
  logo), Inter (body/UI). Loaded from Google Fonts.
- Texture: SVG paper grain overlay, rounded image cards, slightly rotated polaroids,
  hand-drawn squiggle/underline SVGs, logo sketch used as a motif.
- Copy: ≤ 2 short lines per section; images carry the story.

## Stack

React 19 + Vite + TypeScript, Tailwind CSS v4, `motion` (Framer Motion) for animation,
`lenis` for smooth scroll, `lucide-react` icons, `canvas-confetti` for success.
Hosted on Cloudflare Pages (Node 20). Stripe via a Cloudflare Pages Function
(`functions/api/checkout.ts`) using Stripe's REST API with `fetch` (no SDK needed).

## Page structure (single page)

1. Preloader — logo sketch reveals, motto writes in; short variant for return visits
   (`localStorage`), skippable, respects reduced motion.
2. Hero — full-bleed looping muted `playsInline` video with poster image and warm
   gradient scrim; word-by-word headline, handwritten motto, two CTAs
   ("Order a cake", "Design a custom cake"), small proof chips. Video paused when
   off-screen and replaced by poster under `prefers-reduced-motion`.
3. Marquee — "Baked fresh daily · 100% Halal · Chilled delivery across Dubai · …"
4. Favourites — drag/swipe carousel of cards; quick-add with fly-to-cart; "View" opens
   product sheet; "See full menu" opens menu overlay.
5. Gallery "From Safa's kitchen" — masonry with tilt/zoom; tap opens lightbox.
6. How it works — 3 steps; sticky scroll-driven cards on mobile, row on desktop.
7. Story — portrait + handwritten note, count-up stats.
8. Custom cake builder — tap-to-select cards (occasion, tiers, finish, flavour),
   live AED estimate, WhatsApp request.
9. Reviews — chat bubble cards (swipeable on mobile).
10. FAQ — short accordion.
11. Footer reveal — main content with rounded clipped bottom, footer underneath with
    big "Made with heart, not haste", Instagram tiles, contact.

Persistent: floating glass pill nav with scroll-spy + in-pill mobile menu; cart button
with bounce + count; mobile sticky "View bag · AED X" bar when cart non-empty;
floating WhatsApp button.

## Shop

- Menu overlay: full product grid with category filter chips (animated layout).
- Product sheet: desktop right-side panel, mobile bottom sheet. Size + flavour
  selectors, plaque message (≤35 chars), quantity, allergens, add to bag.
- Cart drawer: line items with qty steppers, free-delivery progress bar, subtotal.
  Persisted in `localStorage` (`bb-cart-v2`).
- Checkout (3 steps, overlay):
  1. Delivery vs pickup, zone, date (min notice = max lead time in cart),
     time slot.
  2. Name, phone (UAE), email, address/notes.
  3. Review + pay: **Pay online (Stripe Checkout)** or **Send order on WhatsApp**.
- Stripe flow: client POSTs `{items:[{productId,sizeId,flavourId,qty,message}], zoneId, customer, schedule}`
  to `/api/checkout`; function re-prices from shared `src/data` catalogue, creates a
  Checkout Session (AED, line items + delivery fee), returns URL. Success URL
  `/?order=success&session_id=…` shows success overlay with confetti, order ref, and
  a WhatsApp handoff; cancel returns to checkout. Requires `STRIPE_SECRET_KEY` env var;
  if missing the function returns 503 and UI falls back to WhatsApp with a message.
- WhatsApp flow: formatted order text to `wa.me/<number>`, success overlay shown.

## Data & media

- `src/data/products.ts`, `zones.ts`, `content.ts` (reviews, FAQs, contact),
  `builder.ts` (custom cake options) — typed, shared with the Pages Function.
- `src/data/media.ts` — single registry for every image/video; placeholders
  (Unsplash / Pexels) marked `placeholder: true` for later replacement.
- Product copy rewritten shorter and warmer; prices kept.

## Motion system

`src/lib/motion.ts`: shared eases (`standard [0.25,0.46,0.45,0.94]`,
`dramatic [0.76,0,0.24,1]`, `smooth [0.65,0,0.35,1]`) and springs. Reusable
components: `Reveal`, `SplitWords`, `Magnetic`, `TiltCard`, `Marquee`, `CountUp`.
All disabled / simplified with `useReducedMotion`.

## Quality bar

- Mobile-first; tested at 390×844 and 1440×900 with Playwright screenshots.
- Accessibility: focus-trapped dialogs, Esc to close, labelled controls, visible focus,
  contrast AA, alt text.
- Performance: lazy images with explicit sizes, video `preload="metadata"`, fonts
  `display=swap`, code-split overlays.
- `npm run build` passes with no TypeScript errors.

## Out of scope

Admin/CMS, order database, real inventory, user accounts, multi-language.

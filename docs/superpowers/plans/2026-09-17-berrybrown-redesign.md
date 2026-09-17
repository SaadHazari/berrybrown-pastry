# BerryBrown Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild BerryBrown as an image/video-led, homely-modern single-page marketing site with menu, cart, and checkout (Stripe + WhatsApp).

**Architecture:** React SPA built by Vite, one long page of section components plus overlay components (menu, product sheet, cart, checkout, success) driven by a small store (React context + reducer). Pure pricing/order logic lives in `src/lib/` and is shared with a Cloudflare Pages Function that creates Stripe Checkout Sessions.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), `motion`, `lenis`, `lucide-react`, `canvas-confetti`, Vitest, Playwright (verification), Cloudflare Pages Functions.

**Spec:** `docs/superpowers/specs/2026-09-17-berrybrown-redesign-design.md`

## Global Constraints

- Node 20 on Cloudflare Pages (`.nvmrc` = 20). Build command `npm run build`, output `dist`.
- Currency AED, integers. WhatsApp number `971501234567`.
- Palette tokens: cream `#F6EFE4`, oat `#EADFCC`, cocoa `#2B1B14`, milk `#6B4A3A`, berry `#9E2A4B`, blush `#F2D6D9`, sage `#8A9A7B`. No gold/black.
- Fonts: Fraunces (display), Caveat (hand), Inter (body).
- Copy ≤ 2 short lines per section.
- Every animation respects `prefers-reduced-motion`.
- All media referenced only via `src/data/media.ts`.
- Cart localStorage key `bb-cart-v2`.

---

## File Structure

```
index.html                         SEO meta, fonts, root div
vite.config.ts / tsconfig.json     build + vitest config
functions/api/checkout.ts          Stripe session creation (Pages Function)
public/images/*, public/videos/*   local media
src/main.tsx, src/App.tsx          bootstrap, layout, overlays, Lenis
src/index.css                      Tailwind + tokens + grain + utilities
src/data/products.ts               catalogue (typed)
src/data/zones.ts                  delivery zones + time slots
src/data/content.ts                reviews, FAQs, contact, stats, steps
src/data/builder.ts                custom cake options
src/data/media.ts                  media registry
src/lib/pricing.ts                 pure price/lead-time/delivery math   (tested)
src/lib/order.ts                   order ref + WhatsApp message builder (tested)
src/lib/motion.ts                  eases, springs
src/lib/format.ts                  aed() formatter
src/store/cart.tsx                 CartProvider, useCart, reducer       (reducer tested)
src/store/ui.tsx                   UIProvider: which overlay is open
src/components/ui/*                Button, Magnetic, Reveal, SplitWords, Marquee,
                                   CountUp, TiltCard, Sheet (dialog), Chip, Stepper
src/components/layout/*            Navbar, MobileBagBar, WhatsAppFab, Footer, Preloader, Grain
src/components/sections/*          Hero, Favourites, Gallery, HowItWorks, Story,
                                   Builder, Reviews, Faq
src/components/shop/*              ProductCard, MenuOverlay, ProductSheet,
                                   CartDrawer, Checkout (steps), SuccessOverlay
```

---

## Stage 1 — Foundation

### Task 1: Scaffold React/Tailwind/Vitest, remove legacy code

**Files:** Modify `package.json`, `index.html`, `.gitignore`; Create `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `src/index.css`; Delete `src/main.js`, `src/style.css`, `src/components/*.js`, `src/styles/*`, `src/data/*.js`, `dist/` (untracked build output).

- [ ] Install: `npm i react react-dom motion lenis lucide-react canvas-confetti` and `npm i -D typescript @types/react @types/react-dom @vitejs/plugin-react tailwindcss @tailwindcss/vite vitest @types/canvas-confetti @cloudflare/workers-types`.
- [ ] Scripts: `"dev": "vite"`, `"build": "tsc --noEmit && vite build"`, `"test": "vitest run"`, `"preview": "vite preview"`.
- [ ] `src/index.css`: `@import "tailwindcss";` plus `@theme` tokens (colors above, `--font-display/hand/sans`), base body styles, `.grain` overlay, focus-visible ring.
- [ ] `npm run build` succeeds with an App rendering "BerryBrown".
- [ ] Commit `chore: migrate to React + Vite + Tailwind v4`.

### Task 2: Typed data + media registry + pure logic (TDD)

**Files:** Create `src/data/{products,zones,content,builder,media}.ts`, `src/lib/{pricing,order,format}.ts`, tests `src/lib/pricing.test.ts`, `src/lib/order.test.ts`.

**Interfaces (Produces):**
```ts
// products.ts
export type Size = { id: string; label: string; serves: string; price: number };
export type Flavour = { id: string; name: string };
export type Category = 'signature' | 'celebration' | 'tarts';
export type Product = { id: string; name: string; short: string; category: Category;
  badge?: string; image: string; gallery?: string[]; leadTimeHours: number;
  sizes: Size[]; flavours: Flavour[]; tags: string[]; allergens: string[] };
export const PRODUCTS: Product[]; export const CATEGORIES: {id: Category|'all'; label: string}[];
export function getProduct(id: string): Product | undefined;
// zones.ts
export type Zone = { id: string; name: string; fee: number; freeOver: number; pickup?: boolean };
export const ZONES: Zone[]; export const TIME_SLOTS: {id: string; label: string}[];
// pricing.ts
export type LineInput = { productId: string; sizeId: string; flavourId: string; qty: number; message?: string };
export function unitPrice(l: LineInput): number;            // throws on unknown product/size
export function subtotal(lines: LineInput[]): number;
export function deliveryFee(sub: number, zoneId: string): number; // 0 when sub >= freeOver or pickup
export function maxLeadHours(lines: LineInput[]): number;    // default 24
export function earliestDate(lines: LineInput[], now: Date): string; // YYYY-MM-DD, now + lead rounded up to next day
// order.ts
export function orderRef(now?: Date, rand?: () => number): string; // "BB-YYMMDD-XXXX"
export function whatsappOrderText(o: OrderSummary): string;
export function whatsappLink(text: string): string;          // https://wa.me/971501234567?text=...
```

- [ ] Write tests first: unitPrice for known size; throws for bad size; subtotal sums qty; deliveryFee 35 below threshold, 0 above, 0 for pickup; earliestDate honours 48h; orderRef format regex `/^BB-\d{6}-[A-Z0-9]{4}$/`; whatsapp text contains ref, items, total; link encodes.
- [ ] Run `npm test` → FAIL. Implement. Run → PASS.
- [ ] Commit `feat: typed catalogue, media registry, pricing + order logic`.

### Task 3: Motion system, UI primitives, stores

**Files:** `src/lib/motion.ts`, `src/components/ui/*`, `src/store/cart.tsx` (+ `cart.test.ts` for reducer), `src/store/ui.tsx`.

**Interfaces:**
```ts
export const ease = { standard: [0.25,0.46,0.45,0.94], dramatic: [0.76,0,0.24,1], smooth: [0.65,0,0.35,1] } as const;
// cart
export type CartLine = LineInput & { key: string };   // key = productId|sizeId|flavourId|message
export type CartAction = {type:'add'; line: LineInput} | {type:'qty'; key: string; qty: number} | {type:'remove'; key: string} | {type:'clear'};
export function cartReducer(s: CartLine[], a: CartAction): CartLine[];
export function useCart(): { lines: CartLine[]; count: number; subtotal: number; add(l: LineInput): void; setQty(k: string, q: number): void; remove(k: string): void; clear(): void; pulse: number };
// ui
export type Overlay = null | {kind:'menu'} | {kind:'product'; id: string} | {kind:'cart'} | {kind:'checkout'} | {kind:'success'; ref: string; paid: boolean};
export function useUI(): { overlay: Overlay; open(o: Overlay): void; close(): void };
```
- [ ] Reducer tests: add merges same key; qty 0 removes; clear. FAIL → implement → PASS.
- [ ] Primitives: `Button` (variants primary/ghost/soft, spring press), `Magnetic`, `Reveal`, `SplitWords`, `Marquee`, `CountUp`, `TiltCard`, `Sheet` (native `<dialog>`-free accessible overlay: focus trap, Esc, scroll lock, side|bottom|center variants with AnimatePresence).
- [ ] Commit `feat: motion system, UI primitives, cart + ui stores`.

## Stage 2 — Marketing page

### Task 4: Layout chrome
Navbar (glass pill, scroll-spy, in-pill mobile menu, cart button with badge bounce keyed on `pulse`), MobileBagBar, WhatsAppFab, Preloader (sketch logo reveal + motto, short on return), Grain, Footer reveal (main `rounded-b-[48px]` above sticky footer). Lenis in App (disabled on reduced motion). Commit.

### Task 5: Hero with video + marquee
Full-bleed `<video autoPlay muted loop playsInline preload="metadata" poster>`; pauses via IntersectionObserver; reduced motion → poster image. SplitWords headline, Caveat motto, CTAs (open menu / scroll to builder), proof chips. Marquee below. Commit.

### Task 6: Favourites + Gallery + How it works
Drag carousel (`motion` drag constraints) of `ProductCard` (quick add → cart.add default size/flavour + fly "+1"); Gallery masonry (CSS columns) with TiltCard + lightbox Sheet; HowItWorks row (desktop) / sticky scroll cards (mobile, `useScroll({target})`). Commit.

### Task 7: Story + Builder + Reviews + FAQ
Story portrait polaroid + handwritten note + CountUp stats. Builder: option cards, live estimate from `builder.ts` (`estimate(sel): {min:number;max:number}` tested), WhatsApp request. Reviews: bubble cards, horizontal snap on mobile. FAQ: animated accordion. Commit.

## Stage 3 — Shop

### Task 8: Menu overlay + Product sheet + Cart drawer
Menu: filter chips with `layoutId` pill, grid with `layout` animation. ProductSheet: gallery, size/flavour chips, plaque input (35 max with counter), qty stepper, price animates, add → toast + close + pulse. CartDrawer: lines, steppers, free-delivery progress bar, checkout CTA, empty state illustration. Commit.

## Stage 4 — Checkout

### Task 9: Checkout overlay + WhatsApp path + Success
Steps with animated progress; validation inline (phone `/^(\+?971|0)?5\d{8}$/` after stripping spaces); date `min=earliestDate`; review summary; "Send on WhatsApp" opens link, clears cart, shows Success. Success overlay with confetti + ref. Commit.

### Task 10: Stripe Pages Function + client
`functions/api/checkout.ts`: `onRequestPost` validates body, re-prices with `src/lib/pricing`, POSTs form-encoded to `https://api.stripe.com/v1/checkout/sessions` (mode payment, currency aed, amounts ×100, delivery line, metadata ref/customer/schedule, success/cancel URLs from request origin), returns `{url}`; 503 if no `STRIPE_SECRET_KEY`; 400 on invalid. Client: "Pay online" → fetch → `location.href = url`; errors show inline with WhatsApp fallback. On load, `?order=success&ref=` opens Success (paid) and clears cart; `?order=cancelled` reopens checkout. Add `wrangler`-free docs in README. Commit.

## Stage 5 — Polish & verify

### Task 11: Media assets, SEO, README
Download hero video + poster and placeholder photos into `public/`; compress where possible; update meta/OG/JSON-LD; rewrite README (stack, env vars, swapping photos). Commit.

### Task 12: Verification
`npm test`, `npm run build`; Playwright screenshots at 390×844 and 1440×900 for each section and overlay; click through add → cart → checkout → WhatsApp; fix issues; run web-design-guidelines + accessibility review; commit fixes.

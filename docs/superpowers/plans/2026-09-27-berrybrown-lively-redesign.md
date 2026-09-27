# Berry Brown Lively Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild berrybrown.me with the 17 Sep page's life (photos, big type, motion on scroll, drifting reviews, big footer) in the new brand, plus a section and a quote form for every revenue channel.

**Architecture:** Same React 19 + Vite + Tailwind v4 + Cloudflare Worker app. Sections are rebuilt one at a time on shared UI primitives (`motion/react` for scroll and hover motion, a photo registry backed by AI photos from Canva, golden-ratio tokens). Data and message logic stay pure and tested in `src/data` and `src/lib`; the Worker gains a pure `enquiryRow` shaper; one Supabase migration widens a check constraint.

**Tech Stack:** React 19.3, TypeScript 7, Vite 8, Tailwind 4.3, motion 13.4, lucide-react, Vitest 5, Cloudflare Workers, Supabase (REST), Canva MCP (photos), Python 3 + Pillow (photo grading), playwright-core (QA screenshots, uses installed Chrome).

**Spec:** `docs/superpowers/specs/2026-09-27-berrybrown-lively-redesign-design.md`

## Global Constraints

- Colours: Butter `#F6EEDF`, Cocoa `#3E2A21`, Rose `#E7CFC6`, Claret `#7A2A3A`, Cocoa 70 `#726156`, Cocoa 15 `#D9D0C8`, Butter 60 `rgb(246 238 223 / 0.6)`. No other colours.
- Fonts: Alegreya (500, 500 italic, 600) for sentences; Jost 500 for labels, buttons, prices and numbers. No other fonts, no handwriting fonts. `font-variant-numeric: lining-nums` on Alegreya.
- One Claret element per section (spec §4 table). Never Claret on Cocoa.
- Corners 4 px (`rounded`). Circles only for icon-only buttons, avatars and dots. Never pill-shaped text buttons.
- Spacing only from the tokens `2xs xs sm md lg xl 2xl 3xl` (LiftKit, base 18 px).
- The name is always a logo file from `public/brand/`.
- Copy: short sentences, no exclamation marks, no "indulge / delight / treat yourself", never "homemade". "We / us / our team". Never "I", never "Safa" or "Chef Safa" on the site.
- Contact: WhatsApp `971547944882` (display `+971 54 794 4882`), email `connect@berrybrown.me`. Every WhatsApp message starts "Hi Berry Brown,".
- Motion only on scroll, pointer or tap; the review rows are the one thing that moves on its own (with pause). No smooth-scroll library, no marquee strip, no video, no preloader, no infinite pulses. `prefers-reduced-motion: reduce` → final states, review rows stop.
- Custom cakes: 1 week notice; sizes 6" from 300, 8" from 420, two tiers from 850; custom flavour +60.
- Work on branch `redesign/lively`. Never push or merge to `main` without Saad saying "go live".
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Stale "Customised" text.** A customer types a custom occasion, then goes back and picks "Birthday". The message and summary must say "Birthday", never the old text. → Test in Task 10 (`customCakeMessage` ignores `occasionOther` when a normal option is picked).
2. **Typed dates earlier than allowed.** Date inputs accept typed dates below `min`. Custom cakes (1 week) and quotes (5 / 21 / 7 days) must refuse them with a clear line. → Tests in Task 5 (`validateQuote`) and Task 10 (`validateCustom`, `isStepDone`).
3. **A deadline on its own day.** On 20 Oct the Diwali branded date is still open; on 21 Oct only the plain date shows. → Test in Task 5 (`nextDeadline` on the day itself).
4. **Messy quantities.** People type " 25 ", "20 boxes" or "2.5". Trimmed whole numbers pass; anything else gets the minimum message. → Test in Task 5.
5. **Short screens and reduced motion.** A 1440 × 760 laptop must still see the whole footer (sticky reveal only when the footer fits), and a reduced-motion visitor sees every section without waiting for animations. → QA checks in Task 17 (`qa-shots.mjs --reduced` and a 760 px tall run).

---

## File map

| Path | Status | Responsibility |
|---|---|---|
| `src/index.css` | modify | Tokens, type scale (adds display sizes), utilities (frame, lace edge, drift, grain) |
| `src/lib/motion.ts` | create | Shared easings and springs |
| `src/lib/dates.ts` | create | `localIso`, `addDays`, `shortDate` |
| `src/lib/storage.ts` | create | sessionStorage flags that never throw |
| `src/lib/topbar.ts` | create | Pure top-bar state machine |
| `src/lib/hooks.ts` | modify | `useTopBar`, `useScrollSpy`, `useIsWide` |
| `src/lib/useDragScroll.ts` | create | Mouse drag for native horizontal scrollers |
| `src/lib/order.ts` | modify | All WhatsApp/email messages |
| `src/lib/api.ts` | modify | Enquiry body type (company answers) |
| `src/data/content.ts` | modify | Contact, reviews, FAQ, stats, how-it-works steps, gallery, log |
| `src/data/media.ts` | rewrite | Photo slot registry (AI photos) |
| `src/data/photos.generated.ts` | create (generated) | Slots that have files |
| `src/data/companies.ts` | create | Gift boxes, workshops, events, deadlines |
| `src/data/quote.ts` | create | Quote form shape and validation |
| `src/data/custom.ts` | rewrite | Custom cake options, steps, validation, summary |
| `scripts/photo-slots.json` | create | Slot → ratio → Canva enum → prompt |
| `scripts/grade-photos.py` | create | Palette grade + WebP export + manifest |
| `scripts/qa-shots.mjs` | create | Scroll-through screenshots for QA |
| `src/components/ui/*` | create/modify | Rise, SplitWords, Heading, Parallax, Magnetic, CountUp, DriftRow, Frame, Field, Photo |
| `src/components/layout/*` | create/modify | DeadlineStrip, Navbar, WhatsAppFab, Footer |
| `src/components/sections/*` | create/modify | Hero, TheSix, custom/*, HowItWorks, GiftBoxes, Workshops, CompanyEvents, Udora, Studio, Kitchen, Reviews, Faq, Closing, CakeLog |
| `src/components/shop/*` | create/modify | ProductCard, QuoteSheet, Lightbox, Overlays, SuccessOverlay, Checkout (copy) |
| `worker/enquiries.ts` | modify | Pure `enquiryRow`; company answers; `event` |
| `supabase/migrations/20260927140000_enquiries_event.sql` | create | Widen `enquiries.about` check |
| `CLAUDE.md`, `AGENTS.md`, `README.md`, `index.html` | modify | Rules, docs, meta |

---

### Task 1: Foundation — motion, tokens, date and storage helpers

**Files:**
- Modify: `package.json` (via npm)
- Modify: `src/index.css`
- Create: `src/lib/motion.ts`, `src/lib/dates.ts`, `src/lib/dates.test.ts`, `src/lib/storage.ts`
- Modify: `src/components/ui/Button.tsx`

**Interfaces:**
- Produces: `ease.out`, `ease.smooth`, `spring.soft`, `spring.snappy` (`src/lib/motion.ts`); `localIso(d: Date): string`, `addDays(d: Date, days: number): Date`, `shortDate(iso: string): string` (`src/lib/dates.ts`); `readFlag(key: string): boolean`, `writeFlag(key: string): void` (`src/lib/storage.ts`); CSS utilities `t-display2`, `t-display1`, `t-giant`, `frame`, `btn-butter`, `carousel-pad`, `lace-edge`, `bubble-tail`, `animate-drift`, `shadow-frame`, `shadow-page`, class `.grain`; `ButtonVariant` gains `'butter'`.

- [ ] **Step 1: Install motion**

Run: `npm install motion@^13.4.4`
Expected: `package.json` dependencies list `"motion": "^13.4.4"`.

- [ ] **Step 2: Write the failing date test** — `src/lib/dates.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { addDays, localIso, shortDate } from './dates';

describe('dates', () => {
  it('formats a local ISO date', () => {
    expect(localIso(new Date(2026, 8, 7))).toBe('2026-09-07');
  });

  it('adds calendar days across a month end, ignoring the time of day', () => {
    expect(localIso(addDays(new Date(2026, 8, 27, 23, 30), 7))).toBe('2026-10-04');
  });

  it('shows a short date', () => {
    expect(shortDate('2026-10-20')).toBe('20 Oct');
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run src/lib/dates.test.ts`
Expected: FAIL — cannot find module `./dates`.

- [ ] **Step 4: Create `src/lib/dates.ts`**

```ts
/** YYYY-MM-DD in local time. */
export const localIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Midnight of the day `days` calendar days after `d`, in local time. */
export function addDays(d: Date, days: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() + days);
  return out;
}

/** "20 Oct" from "2026-10-20". */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
```

- [ ] **Step 5: Run the test to see it pass**

Run: `npx vitest run src/lib/dates.test.ts`
Expected: 3 passed.

- [ ] **Step 6: Create `src/lib/motion.ts` and `src/lib/storage.ts`**

```ts
// src/lib/motion.ts
import type { Transition } from 'motion/react';

/** The house curve: quick start, long soft landing. */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  smooth: [0.65, 0, 0.35, 1],
} as const;

export const spring = {
  soft: { type: 'spring', stiffness: 260, damping: 26 } satisfies Transition,
  snappy: { type: 'spring', stiffness: 420, damping: 30 } satisfies Transition,
};
```

```ts
// src/lib/storage.ts
/** sessionStorage flags that never throw (private mode, blocked site data). */
export function readFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function writeFlag(key: string): void {
  try {
    window.sessionStorage.setItem(key, '1');
  } catch {
    /* storage blocked: the flag lasts until reload */
  }
}
```

- [ ] **Step 7: Extend `src/index.css`**

In the `@theme` block, replace the shape/motion lines (from `--radius-*: initial;` to the end of the `@keyframes toast-in` block) with:

```css
  /* Shape — 4 px corners everywhere. Shadows only on floating photo frames, the lifted page and open sheets. */
  --radius-*: initial;
  --radius: 4px;
  --shadow-*: initial;
  --shadow-sheet: 0 24px 48px -16px rgb(62 42 33 / 0.25);
  --shadow-frame: 0 1px 1px rgb(62 42 33 / 0.06), 0 18px 36px -18px rgb(62 42 33 / 0.35);
  --shadow-page: 0 30px 60px -30px rgb(62 42 33 / 0.45);
  --animate-*: initial;
  --animate-toast: toast-in 200ms ease-out;
  --animate-drift: drift var(--drift-duration, 60s) linear infinite;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes toast-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes drift {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
```

In `@layer base`, change `scroll-padding-top: calc(64px + var(--spacing-md));` to `scroll-padding-top: calc(76px + var(--spacing-md));`.

After the `t-display` utility line, add:

```css
@utility t-display2 { font-family: var(--font-voice); font-weight: 500; font-size: clamp(2.058rem, 1.2rem + 3.6vw, 3.33rem); line-height: 1.08; letter-spacing: -0.02em; font-variant-numeric: lining-nums; }
@utility t-display1 { font-family: var(--font-voice); font-weight: 500; font-size: clamp(2.618rem, 1.4rem + 5vw, 4.236rem); line-height: 1.05; letter-spacing: -0.02em; font-variant-numeric: lining-nums; }
@utility t-giant { font-family: var(--font-voice); font-weight: 500; font-size: clamp(3.33rem, 1rem + 10vw, 6.854rem); line-height: 0.98; letter-spacing: -0.025em; font-variant-numeric: lining-nums; }
```

After the `btn-ghost` utility, add:

```css
@utility btn-butter {
  background: var(--color-butter);
  color: var(--color-cocoa);
  &:hover:not(:disabled) { background: color-mix(in srgb, var(--color-butter), #000 6%); }
}
```

After the `mat` utility, add:

```css
/* A photo on a Butter card, like a print. Pair with `shadow-frame` when it floats. */
@utility frame {
  display: block;
  background: var(--color-butter);
  padding: var(--spacing-xs);
  border: 1px solid var(--color-cocoa-15);
  border-radius: var(--radius);
}
/* Horizontal scrollers that start on the container's left edge and bleed off the right. */
@utility carousel-pad {
  --pad: max(var(--spacing-md), env(safe-area-inset-left));
  @media (width >= 1024px) { --pad: calc(max(0px, (100vw - 1257px) / 2) + 4.235rem); }
  padding-inline: var(--pad);
  scroll-padding-inline: var(--pad);
}
/* The brand's lace detail: Butter scallops hanging off the bottom of the page over the Cocoa footer. */
@utility lace-edge {
  height: 12px;
  background-image: radial-gradient(circle at 8px 0, var(--color-butter) 7.5px, transparent 8px);
  background-size: 16px 12px;
  background-repeat: repeat-x;
}
/* Review bubbles: a small tail under the bottom-left corner, in the bubble's own colour. */
@utility bubble-tail {
  &::after {
    content: '';
    position: absolute;
    left: var(--spacing-lg);
    top: 100%;
    width: 14px;
    height: 10px;
    background: inherit;
    clip-path: polygon(0 0, 100% 0, 0 100%);
  }
}
```

At the very end of the file (after the reduced-motion block), add:

```css
/* Paper grain — fixed, static, never interactive. */
.grain {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 60;
  opacity: 0.05;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.24 0 0 0 0 0.16 0 0 0 0 0.13 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 8: Add the Butter button** — `src/components/ui/Button.tsx`

Change the variant type and map to:

```ts
export type ButtonVariant = 'claret' | 'cocoa' | 'ghost' | 'butter';

const VARIANT: Record<ButtonVariant, string> = { claret: 'btn-claret', cocoa: 'btn-cocoa', ghost: 'btn-ghost', butter: 'btn-butter' };
```

- [ ] **Step 9: Verify**

Run: `npm test && npm run build`
Expected: all tests pass; build ends with `✓ built in …`.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json src/index.css src/lib/motion.ts src/lib/dates.ts src/lib/dates.test.ts src/lib/storage.ts src/components/ui/Button.tsx
git commit -m "feat: motion library, display type sizes, frame and lace utilities, date helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Contact details and the team voice

**Files:**
- Modify: `src/data/content.ts`, `src/data/content.test.ts`
- Modify: `src/lib/order.ts`, `src/lib/order.test.ts`
- Modify: `src/components/layout/Footer.tsx`, `src/components/shop/Checkout.tsx`, `src/components/shop/SuccessOverlay.tsx`, `src/components/sections/CustomCake.tsx`
- Modify: `index.html`

**Interfaces:**
- Produces: `CONTACT.udora: string`, `PHOTO_NOTE: string` (content.ts); `GREETING = 'Hi Berry Brown,'`, `GENERAL_MESSAGE: string`, `mailtoLink(subject: string, body?: string): string` (order.ts).

- [ ] **Step 1: Write the failing tests**

In `src/lib/order.test.ts`: change the import line to

```ts
import { GENERAL_MESSAGE, customCakeMessage, enquiryMessage, mailtoLink, orderRef, whatsappLink, whatsappOrderText } from './order';
```

replace the test `encodes the WhatsApp link with the studio number` with

```ts
  it('encodes the WhatsApp link with the studio number', () => {
    expect(whatsappLink('Hi & bye')).toBe('https://wa.me/971547944882?text=Hi%20%26%20bye');
  });

  it('greets the team, never a person', () => {
    expect(GENERAL_MESSAGE).toBe('Hi Berry Brown, I have a question about a cake.');
  });

  it('builds a mailto link to the studio email', () => {
    expect(mailtoLink('Gift boxes', 'Hi & bye')).toBe('mailto:connect@berrybrown.me?subject=Gift%20boxes&body=Hi%20%26%20bye');
    expect(mailtoLink('Workshop')).toBe('mailto:connect@berrybrown.me?subject=Workshop');
  });
```

In the test `builds a WhatsApp order message with everything Safa needs`, rename it to `builds a WhatsApp order message with everything the studio needs` and add as the first expectation:

```ts
    expect(text.split('\n')[0]).toBe("Hi Berry Brown, I'd like to order:");
```

In the `enquiryMessage` test, change `expect(enquiryMessage('workshop')).toContain('Make one with Safa');` to `expect(enquiryMessage('workshop')).toContain('Make one with us');`.

In `src/data/content.test.ts`, change the import to `import { CONTACT, FAQS, LOG, REVIEWS, cakeNumber, upcomingDeadlines } from './content';` and add:

```ts
  it('uses the studio contact details', () => {
    expect(CONTACT.whatsapp).toBe('971547944882');
    expect(CONTACT.phoneDisplay).toBe('+971 54 794 4882');
    expect(CONTACT.email).toBe('connect@berrybrown.me');
  });

  it('speaks as a team in customer-facing copy', () => {
    expect(JSON.stringify({ REVIEWS, FAQS })).not.toMatch(/Safa/);
  });
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run src/lib/order.test.ts src/data/content.test.ts`
Expected: FAIL — `GENERAL_MESSAGE`/`mailtoLink` not exported, old number, "Safa" found.

- [ ] **Step 3: Update `src/data/content.ts`**

Replace the `CONTACT` object with:

```ts
export const CONTACT = {
  whatsapp: '971547944882',
  phoneDisplay: '+971 54 794 4882',
  email: 'connect@berrybrown.me',
  /** Saad to confirm the handle. Blank shows "From the studio" with no links. */
  instagram: '',
  /** The Udora shop link. Blank shows "Coming soon to Udora". */
  udora: '',
  /** Saad to confirm the pickup / studio wording. */
  location: 'Dubai',
  hours: 'Every day · 9am – 9pm',
  legal: 'Berry Brown is a trading name of Dormers Restaurant L.L.C., Dubai. Trade licence 1433956. Not registered for VAT.',
};

/** Shown under the Six and in the footer while the photos are AI-made stand-ins. */
export const PHOTO_NOTE = 'Photos show the style. Each cake is made by hand, so yours will look a little different.';
```

In `REVIEWS`, change Maya & Alex's text to `'They made our wedding cake and it tasted even better than it looked. Every guest asked where it came from.'`.

Replace `FAQS` with:

```ts
export const FAQS = [
  { q: 'How early should I order?', a: 'The Six need 24 hours. Custom cakes need a week. Gift boxes need 3–5 days, or 2–3 weeks with your logo.' },
  { q: 'How do cakes survive the Dubai heat?', a: 'Every cake travels with ice packs in an insulated box. Keep it in the fridge until about 15 minutes before serving.' },
  { q: 'Is everything Halal?', a: 'Yes. We never use gelatin. Creams are set with fruit pectin or agar instead.' },
  { q: 'Can I add a message?', a: 'Yes. Every cake can carry a hand-piped message of up to 35 characters.' },
  { q: 'How do I pay?', a: 'Pay online by card or Apple Pay, or send your order on WhatsApp and pay by bank transfer or cash on delivery.' },
  { q: 'Do you deliver?', a: 'Yes, anywhere in Dubai for AED 20. Orders over AED 300 travel free. You can also collect from us.' },
  { q: 'Do you do corporate orders?', a: 'Yes. Gift boxes from 20, workshops from 12 people, and events for up to 60 guests. Tap Get a quote and we reply with a price and an invoice.' },
  { q: 'How do deposits work?', a: 'Custom cakes and gift boxes are confirmed with a 50% deposit. The rest is due before delivery. Workshops and events are paid in full to book.' },
  { q: 'Can I cancel?', a: 'Yes, with 48 hours’ notice. After that we keep the deposit.' },
];
```

In `OFFERS`, change `title: 'Make one with Safa'` to `title: 'Make one with us'`.

- [ ] **Step 4: Update `src/lib/order.ts`**

Under the imports add:

```ts
/** Every message opens by greeting the studio, never a person. */
export const GREETING = 'Hi Berry Brown,';
export const GENERAL_MESSAGE = `${GREETING} I have a question about a cake.`;
```

Replace every `Hi Safa,` with `${GREETING}` inside template literals: in `whatsappOrderText` the first line becomes `` `${GREETING} ${o.paid ? 'I just paid online for' : "I'd like to order"}:` ``; in `customCakeMessage` the first line becomes `` `${GREETING} I'd like a custom cake.` ``; in `enquiryMessage` the first line becomes `` offer ? `${GREETING} I'd like to ask about ${offer.title}.` : `${GREETING} I'd like to ask about an order for my company.` ``.

At the end of the file add:

```ts
/** A mailto link to the studio. */
export function mailtoLink(subject: string, body = ''): string {
  const query = [`subject=${encodeURIComponent(subject)}`, body ? `body=${encodeURIComponent(body)}` : ''].filter(Boolean).join('&');
  return `mailto:${CONTACT.email}?${query}`;
}
```

- [ ] **Step 5: Update the remaining copy**

- `src/components/layout/Footer.tsx`: import `GENERAL_MESSAGE` from `../../lib/order` and replace `whatsappLink('Hi Safa, I have a question about a cake.')` with `whatsappLink(GENERAL_MESSAGE)`.
- `src/components/shop/Checkout.tsx`: replace `'Safa confirms, then pay by transfer or cash.'` with `'We confirm, then you pay by transfer or cash.'`.
- `src/components/shop/SuccessOverlay.tsx`: replace `'Your payment went through. Safa will message you to confirm the details.'` with `'Your payment went through. We will message you to confirm the details.'`; replace `'Your order is ready in WhatsApp. Press send, and Safa will confirm and share payment details.'` with `'Your order is ready in WhatsApp. Press send, and we will confirm and share payment details.'`; replace `'Send order details to Safa'` with `'Send order details to our team'`.
- `src/components/sections/CustomCake.tsx`: replace `"Six questions. Safa replies on WhatsApp with the price."` with `"Six questions. We reply on WhatsApp with the price."`, `Final price from Safa on WhatsApp.` with `Final price on WhatsApp.`, and both `'Send to Safa'` with `'Send on WhatsApp'`.

- [ ] **Step 6: Update `index.html`**

```html
    <title>Berry Brown · Cake studio in Dubai — signature cakes, custom cakes, gift boxes and workshops</title>
    <meta name="description" content="A cake studio in Dubai. Six signature cakes, custom cakes, gift boxes, workshops and dessert tables. Made to order." />
```

`og:description` content: `Six signature cakes, custom cakes, gift boxes and workshops. Made to order in Dubai.`

In the JSON-LD: `"description": "Cake studio in Dubai. Six signature cakes, custom cakes, gift boxes and workshops, made to order."`, `"telephone": "+971547944882"`, `"email": "connect@berrybrown.me"`, `"priceRange": "AED 35 – AED 1,100"`, and delete the `"founder"` line (remove the trailing comma on `paymentAccepted`).

`<noscript>`: `Berry Brown needs JavaScript to take orders. Message us on WhatsApp: +971 54 794 4882`

- [ ] **Step 7: Verify**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add -A src index.html
git commit -m "feat: new WhatsApp and email, team voice in every message and label

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Photo registry and the Photo component

**Files:**
- Create: `scripts/photo-slots.json`, `src/data/photos.generated.ts`, `src/data/media.test.ts`
- Rewrite: `src/data/media.ts`, `src/components/ui/Photo.tsx`
- Modify: `src/data/content.ts` (LOG images), `src/data/content.test.ts` (drop the 12-photo test), `src/components/sections/Hero.tsx`, `src/components/sections/CustomCake.tsx`, `src/components/sections/Safa.tsx`

**Interfaces:**
- Produces: `type Media = { src; srcSet?; width?; height?; alt; label; placeholder: boolean; ai?: boolean; slot?: string; ratio?: Ratio }`; `type Ratio = '4:5' | '1:1' | '4:3' | '3:4' | '3:2'`; `aiPhoto(slot, ratio, alt, label): Media`; `media.hero.{cake,slice,hands}`, `media.six[0..5]`, `media.looks.{buttercream,flowers,drip,custom}`, `media.how[0..2]`, `media.box.{open,stack}`, `media.workshop.{table,piping}`, `media.events.{session,table}`, `media.studio.{hands,berries}`, `media.kitchen.{layers,crumb,cocoa,piping,packing,flowers}`, `media.faq`; `LOG_MEDIA: Media[]`; `ALL_MEDIA: Media[]` (31); `READY_PHOTOS: readonly string[]`; `<Photo media className? imgClassName? ratio? sizes? eager? zoom? />`.

- [ ] **Step 1: Create `scripts/photo-slots.json`**

Every prompt is sent to Canva as `prompt + " " + STYLE` (STYLE is in Task 4). The Six also get SIX_SET before STYLE.

```json
[
  { "slot": "hero-cake", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "A tall layered chocolate cake with a glossy dark ganache drip, topped with fresh raspberries, blackberries and small chocolate curls, on a cream ceramic cake stand, a dusty rose linen napkin beside it." },
  { "slot": "hero-slice", "ratio": "1:1", "canva": "SQUARE_1_1", "prompt": "A single slice of vanilla sponge layered with whipped cream and raspberry jam, fresh raspberries on top, on a small cream plate with a fork, seen from above at an angle." },
  { "slot": "hero-hands", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "Close-up of two hands piping soft whipped cream rosettes onto the top of a berry cake with a cloth piping bag, cream apron visible." },
  { "slot": "six-berry-chocolate-drip", "ratio": "4:5", "canva": "PORTRAIT_4_5", "six": true, "prompt": "A round dark chocolate layer cake with a glossy ganache drip down the sides, crowned with fresh raspberries and blackberries." },
  { "slot": "six-pistachio-kunafa", "ratio": "4:5", "canva": "PORTRAIT_4_5", "six": true, "prompt": "A round cake covered in pale green pistachio cream, topped with a crown of golden crisp kunafa pastry, chopped pistachios and a few dried rose petals." },
  { "slot": "six-berry-cream-sponge", "ratio": "4:5", "canva": "PORTRAIT_4_5", "six": true, "prompt": "A light vanilla sponge cake layered with whipped cream, the top piled with fresh strawberries, raspberries and blueberries, a dusting of icing sugar." },
  { "slot": "six-salted-caramel-chocolate", "ratio": "4:5", "canva": "PORTRAIT_4_5", "six": true, "prompt": "A smooth glossy chocolate mousse cake with a soft salted caramel drizzle on top, a few caramelised hazelnuts and flakes of sea salt." },
  { "slot": "six-blueberry-cheesecake", "ratio": "4:5", "canva": "PORTRAIT_4_5", "six": true, "prompt": "A baked vanilla cheesecake on a golden butter biscuit base, topped with a glossy layer of blueberry compote and fresh blueberries." },
  { "slot": "six-vanilla-berry-charlotte", "ratio": "4:5", "canva": "PORTRAIT_4_5", "six": true, "prompt": "A charlotte cake with ladyfinger biscuits standing around the sides, tied with a dusty rose ribbon, filled with vanilla cream and topped with fresh berries." },
  { "slot": "look-buttercream", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "A tall round cake finished in smooth, softly textured cream buttercream with gentle palette-knife swirls and a small sprig of berries on top, on a cream cake stand." },
  { "slot": "look-flowers", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "A round buttercream cake decorated with fresh garden roses in dusty pink and deep claret and a few small green leaves, on a cream cake stand." },
  { "slot": "look-drip", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "A round cake in pale buttercream with a dark chocolate drip running down the sides and fresh raspberries and blackberries piled on top, on a cream cake stand." },
  { "slot": "look-custom", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "A cake designer's sketchbook open on a linen table, showing a pencil drawing of a two-tier cake, with fabric colour swatches in dusty rose, cream and claret, a pencil and a few fresh berries beside it." },
  { "slot": "how-pick", "ratio": "4:3", "canva": "LANDSCAPE_4_3", "prompt": "Three small finished cakes on cream plates lined up on a linen-covered counter, a hand pointing at one of them." },
  { "slot": "how-bake", "ratio": "4:3", "canva": "LANDSCAPE_4_3", "prompt": "Hands spreading whipped cream between two golden sponge layers on a cake turntable, a bowl of raspberries beside it." },
  { "slot": "how-deliver", "ratio": "4:3", "canva": "LANDSCAPE_4_3", "prompt": "Hands passing a cream cake box tied with a dusty rose ribbon across a doorway, a small insulated bag with an ice pack beside it." },
  { "slot": "box-open", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "An open cream gift box seen from above, filled with neat rows of fudgy chocolate brownies and chunky cookies, a dusty rose paper sleeve beside it and a small blank hand-written card." },
  { "slot": "box-stack", "ratio": "1:1", "canva": "SQUARE_1_1", "prompt": "A neat stack of cream gift boxes wrapped in dusty rose paper sleeves and tied with thin claret ribbon, on a linen table." },
  { "slot": "workshop-table", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "A long wooden table where several pairs of hands decorate small round cakes on turntables, with piping bags and bowls of berries and cream, a relaxed workshop." },
  { "slot": "workshop-piping", "ratio": "1:1", "canva": "SQUARE_1_1", "prompt": "Filled piping bags in cream and pale pink laid next to small bowls of raspberries, blueberries and chocolate shavings on a linen table." },
  { "slot": "event-session", "ratio": "3:2", "canva": "LANDSCAPE_3_2", "prompt": "A bright office meeting table set for a cake decorating session, small plain cakes on cake boards, piping bags and aprons at each seat, a few hands starting to decorate." },
  { "slot": "event-table", "ratio": "3:2", "canva": "LANDSCAPE_3_2", "prompt": "An elegant dessert table with rows of mini cakes, small tarts and chocolate brownie bites on cream stands and plates, dusty rose linen and fresh berries." },
  { "slot": "studio-hands", "ratio": "4:5", "canva": "PORTRAIT_4_5", "prompt": "Hands smoothing the buttercream on a tall cake with a metal scraper while turning it on a turntable, cream apron." },
  { "slot": "studio-berries", "ratio": "1:1", "canva": "SQUARE_1_1", "prompt": "A cream ceramic bowl full of fresh raspberries and strawberries on a linen cloth, a few berries spilling out." },
  { "slot": "kitchen-layers", "ratio": "3:4", "canva": "PORTRAIT_3_4", "prompt": "Three baked golden sponge layers stacked on a wooden board beside a jar of berry jam and a bowl of cream, a lightly floured counter." },
  { "slot": "kitchen-crumb", "ratio": "4:3", "canva": "LANDSCAPE_4_3", "prompt": "A slice of rich chocolate cake on a cream plate with a fork resting on it, a few crumbs scattered on the linen." },
  { "slot": "kitchen-cocoa", "ratio": "3:4", "canva": "PORTRAIT_3_4", "prompt": "Cocoa powder being dusted through a small sieve over a dark chocolate cake, the powder visible in the soft light." },
  { "slot": "kitchen-piping", "ratio": "3:4", "canva": "PORTRAIT_3_4", "prompt": "A hand piping small cream rosettes along the edge of a cake, close-up, the rest of the cake softly out of focus." },
  { "slot": "kitchen-packing", "ratio": "4:3", "canva": "LANDSCAPE_4_3", "prompt": "Hands lowering a finished berry cake into a cream cake box on a counter, tissue paper and ribbon beside it." },
  { "slot": "kitchen-flowers", "ratio": "3:4", "canva": "PORTRAIT_3_4", "prompt": "Close-up of fresh dusty pink roses and small leaves pressed into the soft buttercream of a cake." },
  { "slot": "faq-coffee", "ratio": "1:1", "canva": "SQUARE_1_1", "prompt": "A cup of coffee in a cream cup and a slice of berry cake on a small plate, on a linen-covered tray, seen from above." }
]
```

- [ ] **Step 2: Create `src/data/photos.generated.ts`**

```ts
// Written by scripts/grade-photos.py. Slots with files in public/images/ai.
export const READY_PHOTOS: readonly string[] = [];
```

- [ ] **Step 3: Write the failing test** — `src/data/media.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import slots from '../../scripts/photo-slots.json';
import { ALL_MEDIA, aiPhoto } from './media';

describe('media', () => {
  it('has 31 distinct AI photo slots, each with alt text and a label', () => {
    expect(ALL_MEDIA).toHaveLength(31);
    expect(new Set(ALL_MEDIA.map((m) => m.slot)).size).toBe(31);
    for (const m of ALL_MEDIA) {
      expect(m.ai).toBe(true);
      expect(m.alt.length).toBeGreaterThan(5);
      expect(m.label.length).toBeGreaterThan(0);
    }
  });

  it('matches the photo pipeline list slot for slot', () => {
    const ratios = new Map(slots.map((s) => [s.slot, s.ratio]));
    expect(slots).toHaveLength(ALL_MEDIA.length);
    for (const m of ALL_MEDIA) expect(ratios.get(m.slot ?? '')).toBe(m.ratio);
  });

  it('builds a two-width srcset under /images/ai, and a placeholder until the files exist', () => {
    const m = aiPhoto('test-slot', '4:5', 'A test photo', 'Test');
    expect(m.src).toBe('/images/ai/test-slot-1200.webp');
    expect(m.srcSet).toBe('/images/ai/test-slot-640.webp 640w, /images/ai/test-slot-1200.webp 1200w');
    expect([m.width, m.height]).toEqual([1200, 1500]);
    expect(m.placeholder).toBe(true);
  });
});
```

- [ ] **Step 4: Run it to see it fail**

Run: `npx vitest run src/data/media.test.ts`
Expected: FAIL — `aiPhoto` is not exported.

- [ ] **Step 5: Rewrite `src/data/media.ts`**

```ts
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
```

- [ ] **Step 6: Rewrite `src/components/ui/Photo.tsx`**

```tsx
import type { Media } from '../../data/media';
import { cn } from '../../lib/cn';
import { Placeholder } from './Placeholder';

type Props = {
  media: Media;
  className?: string;
  imgClassName?: string;
  /** CSS aspect-ratio such as "4 / 5". Defaults to the photo's own ratio. */
  ratio?: string;
  sizes?: string;
  eager?: boolean;
  /** Zoom 5% while the pointer is over the photo. */
  zoom?: boolean;
};

/** A photo slot: the image when its file exists, the Rose placeholder until then. */
export function Photo({ media, className, imgClassName, ratio, sizes = '(min-width: 1024px) 33vw, 90vw', eager = false, zoom = false }: Props) {
  const aspect = ratio ?? (media.width && media.height ? `${media.width} / ${media.height}` : '4 / 5');
  if (media.placeholder) return <Placeholder label={media.label} ratio={aspect} className={className} />;
  return (
    <div className={cn('group/photo relative overflow-hidden rounded bg-rose', className)} style={{ aspectRatio: aspect }}>
      <img
        src={media.src}
        srcSet={media.srcSet}
        sizes={media.srcSet ? sizes : undefined}
        width={media.width}
        height={media.height}
        alt={media.alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        draggable={false}
        className={cn('absolute inset-0 size-full object-cover', zoom && 'transition-transform duration-700 ease-out group-hover/photo:scale-105', imgClassName)}
      />
    </div>
  );
}
```

- [ ] **Step 7: Point the old consumers at the new slots**

- `src/data/content.ts`: change `import { media, type Media } from './media';` to `import { LOG_MEDIA, type Media } from './media';` and in `LOG` replace `media.log[0]`, `media.log[1]`, `media.log[2]` with `LOG_MEDIA[0]`, `LOG_MEDIA[1]`, `LOG_MEDIA[2]`.
- `src/data/content.test.ts`: delete the test `keeps the photo budget at twelve slots` and the `ALL_MEDIA` import.
- `src/components/sections/Hero.tsx`: `media={media.hero}` → `media={media.hero.cake}`.
- `src/components/sections/CustomCake.tsx`: `media={media.custom}` → `media={media.looks.custom}`.
- `src/components/sections/Safa.tsx`: `media={media.safa}` → `media={media.studio.hands}`.

- [ ] **Step 8: Verify**

Run: `npm test && npm run build`
Expected: all pass (media tests 3 passed).

- [ ] **Step 9: Commit**

```bash
git add scripts/photo-slots.json src/data src/components
git commit -m "feat: photo slot registry for AI photos, Photo with srcset and zoom

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: AI photos from Canva, graded to the palette

Saad approved AI photos (27 Sep) and, in the plan hand-off, saving one holder design in his Canva so the files can be downloaded. If that approval is missing when this task starts, stop after Step 3, show him the thumbnails, and wait.

**Files:**
- Create: `scripts/grade-photos.py`
- Create (generated): `public/images/ai/*.webp` (62 files), `src/data/photos.generated.ts`
- Modify: `index.html` (preload the hero photo)

**Interfaces:**
- Consumes: `scripts/photo-slots.json` (Task 3).
- Produces: `READY_PHOTOS` listing all 31 slots, so every `Media.placeholder` becomes `false`.

STYLE (append to every prompt):
> Editorial food photograph taken on a phone, soft natural window light from the left, warm butter-cream linen and plaster backdrop (#F6EEDF), dusty rose props (#E7CFC6), deep claret berries (#7A2A3A), dark cocoa chocolate tones (#3E2A21), shallow depth of field, real handmade imperfections, no text, no logos, no faces.

SIX_SET (insert before STYLE when `"six": true`):
> Shot at a 45-degree angle from the left, the cake on a matte cream ceramic plate on a linen-covered counter, the same light and backdrop as the rest of the series.

- [ ] **Step 1: Generate the 31 images**

For each entry in `scripts/photo-slots.json`, call the Canva MCP tool `generate-image` with `prompt` = entry prompt (+ SIX_SET) + STYLE and `aspectRatio` = entry `canva`. Poll `get-generate-image-job` with the returned `jobId` until `SUCCESS` (wait a few seconds between polls). The result holds a MEDIA id and a small preview. Reuse `MAHWZZhyT6s` (already generated on 27 Sep) for `hero-cake`.

Look at every preview. Regenerate (at most twice) when it shows text or logos, faces, deformed hands, colours far from the palette, or does not match the prompt. Record `{ "slot": "...", "media": "M..." }` for each in `<scratchpad>/photos/ids.json`.

- [ ] **Step 2: Read each image's size**

Call `get-assets` with all 31 media ids (in batches). Record `metadata.width` and `metadata.height` per slot in `ids.json`.

- [ ] **Step 3: Place the images in the holder design**

The blank holder design is `DAHWZVHNz6A` ("Blank warm cream Instagram holder", made 27 Sep). Rename it on the first edit with `update_title` to `Berry Brown — website photos`.

1. `read-design` with `design_id: "DAHWZVHNz6A"`, `open_transaction: true`, `filter.fields: ["page_metadata", "thumbnails"]` → keep the `transaction_id`.
2. `edit-design` (`page_index: 1`, `finalize: "keep_open"`) with one `add_page` operation per slot, in `photo-slots.json` order, each with that image's `width` and `height`, plus the `update_title` operation.
3. `read-design` with the `transaction_id` and `filter.fields: ["page_metadata"]` → page ids for pages 2…32.
4. For each page n (2…32): `edit-design` with `page_index: n`, `finalize: "keep_open"`, operation `insert_fill` `{ page_id, asset_type: "image", asset_id, alt_text: slot, left: 0, top: 0, width, height }`.
5. `read-design` with the `transaction_id` and `filter.fields: ["thumbnails"]`, `thumbnail_pages: [2, 3, …]` to check a few pages are filled edge to edge.
6. `edit-design` with `finalize: "commit"` (no operations).

- [ ] **Step 4: Export and download**

Call `export-design` with `design_id: "DAHWZVHNz6A"`, `format: { "type": "jpg", "quality": 95, "pages": [2, 3, …, 32] }` (no width, so pages keep their size). Download each URL in order to `<scratchpad>/photos/raw/<slot>.jpg`:

```bash
curl -sSf -o "<scratchpad>/photos/raw/hero-cake.jpg" "<url for page 2>"
```

Check: `ls <scratchpad>/photos/raw | wc -l` → `31`.

- [ ] **Step 5: Create `scripts/grade-photos.py`**

```python
#!/usr/bin/env python3
"""Grade photos into the Berry Brown palette and write the WebP pairs the site loads.

  python3 scripts/grade-photos.py <raw-dir>          grade every <slot>.jpg / <slot>.png listed in scripts/photo-slots.json
  python3 scripts/grade-photos.py <raw-dir> --real   crop and resize only (real photos keep their own colour)

Writes public/images/ai/<slot>-640.webp and <slot>-1200.webp, rewrites src/data/photos.generated.ts
with every slot that has both files, and saves <raw-dir>/contact-sheet.jpg to check the set by eye.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'images' / 'ai'
MANIFEST = ROOT / 'src' / 'data' / 'photos.generated.ts'
SLOTS = json.loads((ROOT / 'scripts' / 'photo-slots.json').read_text())
BUTTER = (246, 238, 223)
COCOA = (62, 42, 33)
MID = (170, 138, 124)
WIDTHS = (640, 1200)


def crop_to(im, ratio):
    rw, rh = (int(x) for x in ratio.split(':'))
    w, h = im.size
    target = rw / rh
    if w / h > target:
        nw = round(h * target)
        left = (w - nw) // 2
        return im.crop((left, 0, left + nw, h))
    nh = round(w / target)
    top = (h - nh) // 2
    return im.crop((0, top, w, top + nh))


def grade(im):
    """Split-tone toward Cocoa shadows and Butter highlights, calm the colour, lift the blacks a little."""
    toned = ImageOps.colorize(ImageOps.grayscale(im), black=COCOA, white=BUTTER, mid=MID)
    im = Image.blend(im, toned, 0.22)
    im = ImageEnhance.Color(im).enhance(0.94)
    return im.point(lambda v: round(10 + v * 245 / 255))


def export(slot, im):
    OUT.mkdir(parents=True, exist_ok=True)
    for w in WIDTHS:
        tw = min(w, im.width)
        th = round(im.height * tw / im.width)
        im.resize((tw, th), Image.LANCZOS).save(OUT / f'{slot}-{w}.webp', 'WEBP', quality=80, method=6)


def write_manifest():
    ready = sorted(s['slot'] for s in SLOTS if all((OUT / f"{s['slot']}-{w}.webp").exists() for w in WIDTHS))
    lines = ''.join(f"  '{slot}',\n" for slot in ready)
    MANIFEST.write_text(
        '// Written by scripts/grade-photos.py. Slots with files in public/images/ai.\n'
        f'export const READY_PHOTOS: readonly string[] = [\n{lines}];\n'
    )
    return ready


def contact_sheet(raw_dir, slots):
    if not slots:
        return
    cell, cols = 200, 8
    rows = (len(slots) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell, rows * cell), BUTTER)
    for i, slot in enumerate(slots):
        thumb = Image.open(OUT / f'{slot}-640.webp').convert('RGB')
        thumb.thumbnail((cell - 8, cell - 8))
        sheet.paste(thumb, ((i % cols) * cell + 4, (i // cols) * cell + 4))
    sheet.save(raw_dir / 'contact-sheet.jpg', quality=85)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        sys.exit(__doc__)
    raw = Path(args[0])
    real = '--real' in sys.argv
    done = []
    for s in SLOTS:
        src = next((p for p in (raw / f"{s['slot']}.jpg", raw / f"{s['slot']}.png") if p.exists()), None)
        if src is None:
            continue
        im = crop_to(Image.open(src).convert('RGB'), s['ratio'])
        export(s['slot'], im if real else grade(im))
        done.append(s['slot'])
    ready = write_manifest()
    contact_sheet(raw, done)
    print(f'graded {len(done)} photos; {len(ready)} slots ready')


if __name__ == '__main__':
    main()
```

- [ ] **Step 6: Grade and check the set**

Run: `python3 scripts/grade-photos.py "<scratchpad>/photos/raw"`
Expected: `graded 31 photos; 31 slots ready`; `ls public/images/ai | wc -l` → `62`; `src/data/photos.generated.ts` lists 31 slots.

Open `<scratchpad>/photos/raw/contact-sheet.jpg` with the Read tool. The set must read as one shoot: warm cream backgrounds, rose and claret accents, no cold whites or saturated greens. If one photo breaks the set, regenerate that slot (Step 1), re-export only that page, and re-run the script.

Run: `du -sh public/images/ai` → expected under 6 MB.

- [ ] **Step 7: Preload the hero photo** — in `index.html`, after the font preloads:

```html
    <link rel="preload" as="image" href="/images/ai/hero-cake-1200.webp" imagesrcset="/images/ai/hero-cake-640.webp 640w, /images/ai/hero-cake-1200.webp 1200w" imagesizes="(min-width: 1024px) 460px, 88vw" fetchpriority="high" />
```

- [ ] **Step 8: Verify**

Run: `npm test && npm run build`
Expected: all pass; `dist/images/ai` holds 62 files.

- [ ] **Step 9: Commit**

```bash
git add scripts/grade-photos.py public/images/ai src/data/photos.generated.ts index.html
git commit -m "feat: 31 AI photos in the brand palette, graded as one set

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Company channels and quote data

**Files:**
- Create: `src/data/companies.ts`, `src/data/companies.test.ts`, `src/data/quote.ts`, `src/data/quote.test.ts`
- Modify: `src/lib/order.ts`, `src/lib/order.test.ts`

**Interfaces:**
- Consumes: `localIso`, `addDays`, `shortDate` (Task 1); `media.events` (Task 3); `GREETING` (Task 2).
- Produces:
  - companies.ts: `type QuoteAbout = 'box' | 'workshop' | 'event'`; `isQuoteAbout(v: string | null): v is QuoteAbout`; `BOX { sizes: BoxSize[]; minBoxes; minBranded; plainDays; brandedDays; facts }`; `WORKSHOP { places: WorkshopPlace[]; minSeats; leadDays; facts }`; `EVENTS { formats: EventFormat[]; leadDays; facts }`; `QUOTE_INFO: Record<QuoteAbout, { name; price; facts; subject }>`; `type Deadline`; `DEADLINES`; `upcomingDeadlines(now?)`; `deadlineLine(d, now?)`; `nextDeadline(now?): { label; date } | null`.
  - quote.ts: `type QuoteForm`; `EMPTY_QUOTE`; `type QuoteErrors`; `earliestQuoteDate(about, f, now?)`; `validateQuote(about, f, now?)`; `quoteAnswers(f): Record<string, string>`.
  - order.ts: `quoteMessage(about: QuoteAbout, f: QuoteForm): string`.

- [ ] **Step 1: Write the failing tests**

`src/data/companies.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { deadlineLine, isQuoteAbout, nextDeadline, upcomingDeadlines } from './companies';

const day = (m: number, d: number) => new Date(2026, m - 1, d, 12);

describe('gift-box deadlines', () => {
  it('lists every deadline at the end of September', () => {
    expect(upcomingDeadlines(day(9, 27)).map((d) => d.label)).toEqual(['Diwali', 'National Day', 'Year-end']);
  });

  it('keeps Diwali open for plain boxes after the branded date', () => {
    const open = upcomingDeadlines(day(10, 21));
    expect(open.map((d) => d.label)).toEqual(['Diwali', 'National Day', 'Year-end']);
    expect(deadlineLine(open[0], day(10, 21))).toBe('Diwali · 28 Oct plain');
    expect(upcomingDeadlines(day(10, 29)).map((d) => d.label)).toEqual(['National Day', 'Year-end']);
  });

  it('shows both dates while both are open', () => {
    expect(deadlineLine({ label: 'Year-end', branded: '2026-11-27', plain: '2026-12-03' }, day(11, 1))).toBe('Year-end · 27 Nov with your logo, 3 Dec plain');
    expect(deadlineLine({ label: 'National Day', date: '2026-11-10' }, day(11, 1))).toBe('National Day · 10 Nov');
  });

  it('points the strip at the soonest open date, including on the day itself', () => {
    expect(nextDeadline(day(9, 27))).toEqual({ label: 'Diwali', date: '2026-10-20' });
    expect(nextDeadline(day(10, 20))).toEqual({ label: 'Diwali', date: '2026-10-20' });
    expect(nextDeadline(day(10, 21))).toEqual({ label: 'Diwali', date: '2026-10-28' });
    expect(nextDeadline(day(12, 4))).toBeNull();
  });

  it('recognises quote kinds', () => {
    expect(isQuoteAbout('box')).toBe(true);
    expect(isQuoteAbout('event')).toBe(true);
    expect(isQuoteAbout('table')).toBe(false);
    expect(isQuoteAbout(null)).toBe(false);
  });
});
```

`src/data/quote.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_QUOTE, earliestQuoteDate, validateQuote } from './quote';

const now = new Date(2026, 8, 27, 10);
const keys = (o: object) => Object.keys(o).sort();

describe('quote validation', () => {
  it('asks for everything on an empty gift-box form', () => {
    expect(keys(validateQuote('box', EMPTY_QUOTE, now))).toEqual(['boxSize', 'date', 'logo', 'name', 'qty']);
  });

  it('needs 20 boxes, and 50 with a logo', () => {
    const base = { ...EMPTY_QUOTE, boxSize: '8', logo: 'no' as const, date: '2026-10-05', name: 'Lina' };
    expect(validateQuote('box', { ...base, qty: '19' }, now).qty).toBe('The minimum is 20 boxes');
    expect(validateQuote('box', { ...base, qty: '20' }, now)).toEqual({});
    expect(validateQuote('box', { ...base, logo: 'yes', qty: '30', date: '2026-10-20' }, now).qty).toBe('Your logo needs 50 boxes or more');
  });

  it('accepts trimmed whole numbers only', () => {
    const base = { ...EMPTY_QUOTE, boxSize: '6', logo: 'no' as const, date: '2026-10-05', name: 'Lina' };
    expect(validateQuote('box', { ...base, qty: ' 25 ' }, now)).toEqual({});
    expect(validateQuote('box', { ...base, qty: '20 boxes' }, now).qty).toBe('The minimum is 20 boxes');
    expect(validateQuote('box', { ...base, qty: '25.5' }, now).qty).toBe('The minimum is 20 boxes');
  });

  it('gives plain boxes 5 days and branded boxes 3 weeks, and refuses typed earlier dates', () => {
    expect(earliestQuoteDate('box', { ...EMPTY_QUOTE, logo: 'no' }, now)).toBe('2026-10-02');
    expect(earliestQuoteDate('box', { ...EMPTY_QUOTE, logo: 'yes' }, now)).toBe('2026-10-18');
    const f = { ...EMPTY_QUOTE, boxSize: '6', logo: 'yes' as const, qty: '60', date: '2026-10-10', name: 'Lina' };
    expect(validateQuote('box', f, now).date).toBe('The earliest date is 18 Oct');
  });

  it('needs 12 people and a place for a workshop', () => {
    const f = { ...EMPTY_QUOTE, where: 'venue' as const, qty: '11', date: '2026-10-10', name: 'Mira' };
    expect(validateQuote('workshop', f, now).qty).toBe('The minimum is 12 people');
    expect(validateQuote('workshop', { ...f, qty: '12' }, now)).toEqual({});
    expect(validateQuote('workshop', { ...f, qty: '12', date: '2026-10-01' }, now).date).toBe('The earliest date is 4 Oct');
  });

  it('keeps each event format inside its headcount', () => {
    const f = { ...EMPTY_QUOTE, format: 'table' as const, qty: '30', date: '2026-10-10', area: 'DIFC', name: 'Omar' };
    expect(validateQuote('event', f, now).qty).toBe('The Table is for 40–60 guests');
    expect(validateQuote('event', { ...f, qty: '45' }, now)).toEqual({});
    expect(validateQuote('event', { ...f, format: 'session', qty: '25' }, now).qty).toBe('The decorating session is for 12–20 people');
    expect(keys(validateQuote('event', { ...EMPTY_QUOTE, name: 'O' }, now))).toEqual(['area', 'date', 'format']);
  });
});
```

In `src/lib/order.test.ts` add the imports `quoteMessage` (from `./order`) and `EMPTY_QUOTE` (from `../data/quote`), and append:

```ts
describe('quoteMessage', () => {
  it('writes a gift-box quote', () => {
    const text = quoteMessage('box', { ...EMPTY_QUOTE, qty: '60', boxSize: '8', logo: 'yes', date: '2026-10-20', company: 'Acme', name: 'Lina' });
    expect(text.split('\n')[0]).toBe("Hi Berry Brown, I'd like a quote for gift boxes.");
    expect(text).toContain('Boxes: 60');
    expect(text).toContain('Box: 8 pieces, AED 90 each');
    expect(text).toContain('Our logo on the sleeve: yes');
    expect(text).toContain('Deliver by: Tue 20 Oct');
    expect(text).toContain('Company: Acme');
    expect(text).toContain('Name: Lina');
  });

  it('writes a workshop quote', () => {
    const text = quoteMessage('workshop', { ...EMPTY_QUOTE, where: 'venue', qty: '14', date: '2026-10-10', company: 'Book club', name: 'Mira' });
    expect(text.split('\n')[0]).toBe("Hi Berry Brown, I'd like a quote for a workshop.");
    expect(text).toContain('Where: at your venue');
    expect(text).toContain('People: 14');
    expect(text).toContain('Group: Book club');
  });

  it('writes an event quote and leaves out empty optional lines', () => {
    const text = quoteMessage('event', { ...EMPTY_QUOTE, format: 'table', qty: '45', date: '2026-10-10', area: 'DIFC', name: 'Omar' });
    expect(text).toContain('Event: The Table');
    expect(text).toContain('Office area: DIFC');
    expect(text).not.toContain('Company:');
    expect(text).not.toMatch(/[!\u{1F300}-\u{1FAFF}]/u);
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run src/data/companies.test.ts src/data/quote.test.ts src/lib/order.test.ts`
Expected: FAIL — modules and `quoteMessage` missing.

- [ ] **Step 3: Create `src/data/companies.ts`**

```ts
import { localIso, shortDate } from '../lib/dates';
import { media, type Media } from './media';

export type QuoteAbout = 'box' | 'workshop' | 'event';
export const isQuoteAbout = (v: string | null): v is QuoteAbout => v === 'box' || v === 'workshop' || v === 'event';

export type BoxSize = { id: string; pieces: number; price: number };
const BOX_SIZES: BoxSize[] = [
  { id: '6', pieces: 6, price: 65 },
  { id: '8', pieces: 8, price: 90 },
  { id: '10', pieces: 10, price: 120 },
];

/** The Box — revenue brief channel 6. */
export const BOX = {
  sizes: BOX_SIZES,
  minBoxes: 20,
  minBranded: 50,
  /** Plain boxes take 3–5 days and branded 2–3 weeks; the form uses the long end. */
  plainDays: 5,
  brandedDays: 21,
  facts: ['Min 20 boxes', 'Your logo from 50', 'Ready in 3–5 days', '2–3 weeks with your logo', 'We invoice your company'],
};

export type WorkshopPlace = { id: 'venue' | 'kitchen'; label: string; from: number };
const PLACES: WorkshopPlace[] = [
  { id: 'venue', label: 'At your venue', from: 150 },
  { id: 'kitchen', label: 'At a kitchen we book', from: 200 },
];

/** Make one with us — revenue brief channel 3. */
export const WORKSHOP = {
  places: PLACES,
  minSeats: 12,
  leadDays: 7,
  facts: ['12 seats minimum', 'One cake each', '90 minutes', 'Paid in full to book'],
};

export type EventFormat = { id: 'session' | 'table'; title: string; text: string; price: string; min: number; max: number; unit: string; image: Media };
const FORMATS: EventFormat[] = [
  { id: 'session', title: 'The decorating session', text: '90 minutes in your office. Each person decorates a cake and takes it home.', price: 'AED 175–250 a person · 12–20 people', min: 12, max: 20, unit: 'people', image: media.events.session },
  { id: 'table', title: 'The Table', text: 'Minis of the Six for 40–60 guests. We set up, serve and clear.', price: 'AED 35–70 a guest · 40–60 guests', min: 40, max: 60, unit: 'guests', image: media.events.table },
];

/** Corporate events — revenue brief channel 5. */
export const EVENTS = {
  formats: FORMATS,
  leadDays: 7,
  facts: ['Paid in advance', 'Final headcount 72 hours before', 'You pay for the number booked'],
};

export const QUOTE_INFO: Record<QuoteAbout, { name: string; price: string; facts: string[]; subject: string }> = {
  box: { name: 'Gift boxes', price: 'From AED 65 a box · min 20', facts: BOX.facts, subject: 'Gift boxes' },
  workshop: { name: 'Workshops', price: 'From AED 150 a seat · 12 seats', facts: WORKSHOP.facts, subject: 'Workshop' },
  event: { name: 'Company events', price: 'From AED 35 a guest', facts: EVENTS.facts, subject: 'Company event' },
};

export type Deadline = { label: string; branded?: string; plain?: string; date?: string };

/** Gift-box order-by dates (revenue brief, 27 Sep). Dates that have passed hide themselves. */
export const DEADLINES: Deadline[] = [
  { label: 'Diwali', branded: '2026-10-20', plain: '2026-10-28' },
  { label: 'National Day', date: '2026-11-10' },
  { label: 'Year-end', branded: '2026-11-27', plain: '2026-12-03' },
];

const openDates = (d: Deadline, today: string) => [d.branded, d.date, d.plain].filter((x): x is string => !!x && x >= today).sort();

export function upcomingDeadlines(now: Date = new Date()): Deadline[] {
  const today = localIso(now);
  return DEADLINES.filter((d) => openDates(d, today).length > 0);
}

/** "Diwali · 20 Oct with your logo, 28 Oct plain" — only the dates still open. */
export function deadlineLine(d: Deadline, now: Date = new Date()): string {
  if (d.date) return `${d.label} · ${shortDate(d.date)}`;
  const today = localIso(now);
  const parts: string[] = [];
  if (d.branded && d.branded >= today) parts.push(`${shortDate(d.branded)} with your logo`);
  if (d.plain && d.plain >= today) parts.push(`${shortDate(d.plain)} plain`);
  return `${d.label} · ${parts.join(', ')}`;
}

/** The deadline strip: the soonest date that is still open. */
export function nextDeadline(now: Date = new Date()): { label: string; date: string } | null {
  const today = localIso(now);
  for (const d of DEADLINES) {
    const dates = openDates(d, today);
    if (dates.length) return { label: d.label, date: dates[0] };
  }
  return null;
}
```

- [ ] **Step 4: Create `src/data/quote.ts`**

```ts
import { addDays, localIso, shortDate } from '../lib/dates';
import { BOX, EVENTS, WORKSHOP, type QuoteAbout } from './companies';

export type QuoteForm = {
  /** Boxes, or people, as typed. */
  qty: string;
  boxSize: string;
  logo: '' | 'yes' | 'no';
  where: '' | 'venue' | 'kitchen';
  format: '' | 'session' | 'table';
  date: string;
  area: string;
  company: string;
  name: string;
};

export const EMPTY_QUOTE: QuoteForm = { qty: '', boxSize: '', logo: '', where: '', format: '', date: '', area: '', company: '', name: '' };

export type QuoteErrors = Partial<Record<keyof QuoteForm, string>>;

function leadDays(about: QuoteAbout, f: QuoteForm): number {
  if (about === 'box') return f.logo === 'yes' ? BOX.brandedDays : BOX.plainDays;
  return about === 'workshop' ? WORKSHOP.leadDays : EVENTS.leadDays;
}

export function earliestQuoteDate(about: QuoteAbout, f: QuoteForm, now: Date = new Date()): string {
  return localIso(addDays(now, leadDays(about, f)));
}

/** A trimmed whole number, or null. "20 boxes" and "2.5" are null. */
function count(qty: string): number | null {
  const t = qty.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

export function validateQuote(about: QuoteAbout, f: QuoteForm, now: Date = new Date()): QuoteErrors {
  const e: QuoteErrors = {};
  const n = count(f.qty);
  if (about === 'box') {
    if (!f.boxSize) e.boxSize = 'Pick a box size';
    if (!f.logo) e.logo = 'Pick yes or no';
    if (n === null || n < BOX.minBoxes) e.qty = `The minimum is ${BOX.minBoxes} boxes`;
    else if (f.logo === 'yes' && n < BOX.minBranded) e.qty = `Your logo needs ${BOX.minBranded} boxes or more`;
  } else if (about === 'workshop') {
    if (!f.where) e.where = 'Pick a place';
    if (n === null || n < WORKSHOP.minSeats) e.qty = `The minimum is ${WORKSHOP.minSeats} people`;
  } else {
    const fmt = EVENTS.formats.find((x) => x.id === f.format);
    if (!fmt) e.format = 'Pick one';
    else if (n === null || n < fmt.min || n > fmt.max) e.qty = `${fmt.title} is for ${fmt.min}–${fmt.max} ${fmt.unit}`;
    if (!f.area.trim()) e.area = 'Tell us the office area';
  }
  const earliest = earliestQuoteDate(about, f, now);
  if (!f.date) e.date = 'Pick a date';
  else if (f.date < earliest) e.date = `The earliest date is ${shortDate(earliest)}`;
  if (!f.name.trim()) e.name = 'Tell us your name';
  return e;
}

/** The answers as plain strings, for the enquiry log. */
export const quoteAnswers = (f: QuoteForm): Record<string, string> => ({ ...f });
```

- [ ] **Step 5: Add `quoteMessage` to `src/lib/order.ts`**

Add imports: `import { BOX, EVENTS, WORKSHOP, type QuoteAbout } from '../data/companies';` and `import type { QuoteForm } from '../data/quote';`. Append:

```ts
/** The WhatsApp or email text behind "Get a quote". Optional lines are left out when empty. */
export function quoteMessage(about: QuoteAbout, f: QuoteForm): string {
  const when = f.date ? prettyDate(f.date) : '';
  const company = f.company.trim();
  const lines: string[] = [];
  if (about === 'box') {
    const size = BOX.sizes.find((s) => s.id === f.boxSize);
    lines.push(`${GREETING} I'd like a quote for gift boxes.`, '', `Boxes: ${f.qty.trim()}`);
    if (size) lines.push(`Box: ${size.pieces} pieces, AED ${size.price} each`);
    lines.push(`Our logo on the sleeve: ${f.logo === 'yes' ? 'yes' : 'no'}`, `Deliver by: ${when}`);
    if (company) lines.push(`Company: ${company}`);
  } else if (about === 'workshop') {
    const place = WORKSHOP.places.find((p) => p.id === f.where);
    lines.push(`${GREETING} I'd like a quote for a workshop.`, '', `Date: ${when}`);
    if (place) lines.push(`Where: ${place.label.toLowerCase()}`);
    lines.push(`People: ${f.qty.trim()}`);
    if (company) lines.push(`Group: ${company}`);
  } else {
    const fmt = EVENTS.formats.find((x) => x.id === f.format);
    lines.push(`${GREETING} I'd like a quote for a company event.`, '');
    if (fmt) lines.push(`Event: ${fmt.title}`);
    lines.push(`Date: ${when}`, `People: ${f.qty.trim()}`, `Office area: ${f.area.trim()}`);
    if (company) lines.push(`Company: ${company}`);
  }
  lines.push(`Name: ${f.name.trim()}`);
  return lines.join('\n');
}
```

- [ ] **Step 6: Run the tests to see them pass**

Run: `npx vitest run src/data/companies.test.ts src/data/quote.test.ts src/lib/order.test.ts`
Expected: all passed.

- [ ] **Step 7: Verify and commit**

Run: `npm test && npm run build` → all pass.

```bash
git add src/data/companies.ts src/data/companies.test.ts src/data/quote.ts src/data/quote.test.ts src/lib/order.ts src/lib/order.test.ts
git commit -m "feat: gift boxes, workshops, events and deadlines data; quote validation and messages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: UI kit — motion primitives, heading, frame, fields, top-bar logic

**Files:**
- Create: `src/components/ui/Rise.tsx`, `SplitWords.tsx`, `Heading.tsx`, `Parallax.tsx`, `Magnetic.tsx`, `CountUp.tsx`, `DriftRow.tsx`, `Frame.tsx`, `Field.tsx`
- Create: `src/lib/topbar.ts`, `src/lib/topbar.test.ts`, `src/lib/useDragScroll.ts`
- Modify: `src/lib/hooks.ts`, `src/components/ui/Icons.tsx`

**Interfaces:**
- Consumes: `ease`, `spring` (Task 1); `Chip` (existing).
- Produces:
  - `<Rise as? delay? className?>`; `<SplitWords text accent? accentClassName? delay? stagger? className?>`; `<Heading id? label title accent? accentClassName? oneliner? tone?: 'butter'|'rose'|'cocoa' align?: 'left'|'center' className?>`; `<Parallax offset? rotate? className?>`; `<Magnetic strength? className?>`; `<CountUp to suffix? duration?>`; `<DriftRow duration? reverse? paused? className?>`; `<Frame caption? tilt? shadow? className?>`; `<TextField label error? hint? …input props>`; `<ChoiceField label options value onChange error?>`.
  - `type BarState = { condensed: boolean; hidden: boolean }`; `nextBarState(prev, y, lastY, locked): BarState`; `useTopBar(locked: boolean): BarState`; `useScrollSpy(ids: readonly string[]): string | null`; `useIsWide(): boolean` (≥ 1024 px); `useDragScroll<T>()` → `{ ref, handlers }`; `InstagramIcon`.

- [ ] **Step 1: Write the failing top-bar test** — `src/lib/topbar.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { nextBarState } from './topbar';

const shown = { condensed: false, hidden: false };

describe('top bar', () => {
  it('condenses after 80 px', () => {
    expect(nextBarState(shown, 81, 0, false).condensed).toBe(true);
    expect(nextBarState(shown, 80, 0, false).condensed).toBe(false);
  });

  it('hides while scrolling down past 400 px and comes back on any scroll up', () => {
    const down = nextBarState(shown, 900, 800, false);
    expect(down.hidden).toBe(true);
    expect(nextBarState(down, 880, 900, false).hidden).toBe(false);
  });

  it('never hides near the top or while locked', () => {
    expect(nextBarState(shown, 300, 200, false).hidden).toBe(false);
    expect(nextBarState({ condensed: true, hidden: true }, 900, 800, true).hidden).toBe(false);
  });

  it('ignores tiny moves and keeps the same object', () => {
    const s = { condensed: true, hidden: false };
    expect(nextBarState(s, 902, 900, false)).toBe(s);
  });
});
```

Run: `npx vitest run src/lib/topbar.test.ts` → FAIL (module missing).

- [ ] **Step 2: Create `src/lib/topbar.ts`**

```ts
export type BarState = { condensed: boolean; hidden: boolean };

/** Where the top bar should be after a scroll from `lastY` to `y`. A locked bar (menu or overlay open) never hides. */
export function nextBarState(prev: BarState, y: number, lastY: number, locked: boolean): BarState {
  const condensed = y > 80;
  let hidden = prev.hidden;
  if (locked || y < 400) hidden = false;
  else if (y > lastY + 4) hidden = true;
  else if (y < lastY - 4) hidden = false;
  return prev.condensed === condensed && prev.hidden === hidden ? prev : { condensed, hidden };
}
```

Run: `npx vitest run src/lib/topbar.test.ts` → 4 passed.

- [ ] **Step 3: Add hooks** — append to `src/lib/hooks.ts` (add `import { nextBarState, type BarState } from './topbar';` at the top)

```ts
export const useIsWide = () => useMediaQuery('(min-width: 1024px)');

/** Condense after 80 px; hide while scrolling down, show on scroll up; never hide while `locked`. */
export function useTopBar(locked: boolean): BarState {
  const [state, setState] = useState<BarState>({ condensed: false, hidden: false });
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const from = last;
      setState((prev) => nextBarState(prev, y, from, lockedRef.current));
      if (Math.abs(y - last) > 4) last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    if (locked) setState((prev) => (prev.hidden ? { ...prev, hidden: false } : prev));
  }, [locked]);
  return state;
}

/** The id of the section in the middle band of the viewport. */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(' ');
  useEffect(() => {
    const els = key
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
}
```

- [ ] **Step 4: Create `src/lib/useDragScroll.ts`**

```ts
import { useRef, type MouseEvent, type PointerEvent } from 'react';

/** Mouse drag on a native horizontal scroller. Touch keeps native swipe. A drag never fires the click under it. */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const state = useRef({ down: false, x: 0, left: 0, moved: false });

  const onPointerDown = (e: PointerEvent<T>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    state.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: PointerEvent<T>) => {
    const s = state.current;
    const el = ref.current;
    if (!s.down || !el) return;
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) > 5) {
      s.moved = true;
      el.style.scrollSnapType = 'none';
      el.setPointerCapture(e.pointerId);
    }
    if (s.moved) el.scrollLeft = s.left - dx;
  };
  const end = () => {
    state.current.down = false;
    if (ref.current) ref.current.style.scrollSnapType = '';
  };
  const onClickCapture = (e: MouseEvent<T>) => {
    if (!state.current.moved) return;
    e.preventDefault();
    e.stopPropagation();
    state.current.moved = false;
  };
  return { ref, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerLeave: end, onClickCapture } };
}
```

- [ ] **Step 5: Create the motion primitives**

`src/components/ui/Rise.tsx`:

```tsx
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { ease } from '../../lib/motion';

const TAGS = { div: motion.div, li: motion.li, figure: motion.figure, p: motion.p };

/** Fade and rise 24 px the first time it scrolls into view. Renders in place with reduced motion. */
export function Rise({ children, className, delay = 0, as = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: keyof typeof TAGS }) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: ease.out }}
    >
      {children}
    </Tag>
  );
}
```

`src/components/ui/SplitWords.tsx`:

```tsx
import { motion, useReducedMotion } from 'motion/react';
import { ease } from '../../lib/motion';

type Props = { text: string; className?: string; delay?: number; stagger?: number; accent?: string[]; accentClassName?: string };

/** A headline whose words rise out of a mask, once, when it scrolls into view. Screen readers get the plain text. */
export function SplitWords({ text, className, delay = 0, stagger = 0.07, accent = [], accentClassName = 'italic' }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className={`inline-block ${accent.includes(w) ? accentClassName : ''}`}
              initial={reduce ? false : { y: '105%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.9, delay: delay + i * stagger, ease: ease.out }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </span>
  );
}
```

`src/components/ui/Heading.tsx`:

```tsx
import { cn } from '../../lib/cn';
import { SplitWords } from './SplitWords';

type Tone = 'butter' | 'rose' | 'cocoa';

/** Muted text per background: Cocoa 70 is only 3.9:1 on Rose, so Rose sections use full Cocoa. */
const MUTED: Record<Tone, string> = { butter: 'text-cocoa-70', rose: 'text-cocoa', cocoa: 'text-butter-60' };

type Props = { id?: string; label: string; title: string; accent?: string[]; accentClassName?: string; oneliner?: string; tone?: Tone; align?: 'left' | 'center'; className?: string };

/** Section heading: a Jost label, a display headline that rises word by word, an optional one-liner. */
export function Heading({ id, label, title, accent, accentClassName, oneliner, tone = 'butter', align = 'left', className }: Props) {
  const center = align === 'center';
  return (
    <div className={cn(center && 'text-center', className)}>
      <p className={cn('t-label', MUTED[tone])}>{label}</p>
      <h2 id={id} className={cn('t-display2 mt-sm max-w-[18ch]', center && 'mx-auto')}>
        <SplitWords text={title} accent={accent} accentClassName={accentClassName} />
      </h2>
      {oneliner && <p className={cn('t-oneliner mt-md max-w-[46ch]', MUTED[tone], center && 'mx-auto')}>{oneliner}</p>}
    </div>
  );
}
```

`src/components/ui/Parallax.tsx`:

```tsx
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

type Props = { children: ReactNode; className?: string; /** px travelled between entering and leaving the view; negative drifts the other way. */ offset?: number; rotate?: number };

/** Drifts its child while the page scrolls past. Holds still with reduced motion. */
export function Parallax({ children, className, offset = 40, rotate = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? { rotate } : { y, rotate }}>
      {children}
    </motion.div>
  );
}
```

`src/components/ui/Magnetic.tsx`:

```tsx
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useRef, type PointerEvent, type ReactNode } from 'react';

/** Gently pulls its child toward a mouse pointer. Touch and reduced motion: no effect. */
export function Magnetic({ children, strength = 0.25, className = 'inline-block' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
```

`src/components/ui/CountUp.tsx`:

```tsx
import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/** Counts from 0 to `to` once, when it scrolls into view. Shows the final number with reduced motion. */
export function CountUp({ to, suffix = '', duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const c = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, to, duration]);
  return (
    <span ref={ref}>
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}
```

`src/components/ui/DriftRow.tsx`:

```tsx
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Props = { children: ReactNode; duration?: number; reverse?: boolean; paused?: boolean; className?: string };

/**
 * The review rows: the content twice, sliding left forever. Pauses on hover, on keyboard focus and with `paused`.
 * With reduced motion it stops and becomes a normal horizontal scroller without the copy.
 */
export function DriftRow({ children, duration = 60, reverse = false, paused = false, className }: Props) {
  const style = { '--drift-duration': `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal', animationPlayState: paused ? 'paused' : undefined } as CSSProperties;
  return (
    <div className={cn('group/drift flex overflow-hidden motion-reduce:no-scrollbar motion-reduce:overflow-x-auto', className)}>
      <div className="flex w-max shrink-0 animate-drift group-hover/drift:[animation-play-state:paused] group-focus-within/drift:[animation-play-state:paused] motion-reduce:animate-none" style={style}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0 motion-reduce:hidden" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
```

`src/components/ui/Frame.tsx`:

```tsx
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** A photo on a Butter card with a hairline, like a print. Optional Jost caption, tilt and soft shadow. */
export function Frame({ children, caption, tilt = 0, shadow = true, className }: { children: ReactNode; caption?: string; tilt?: number; shadow?: boolean; className?: string }) {
  return (
    <figure className={cn('frame', shadow && 'shadow-frame', className)} style={tilt ? { rotate: `${tilt}deg` } : undefined}>
      {children}
      {caption && <figcaption className="t-label px-2xs pb-2xs pt-xs text-cocoa-70">{caption}</figcaption>}
    </figure>
  );
}
```

`src/components/ui/Field.tsx`:

```tsx
import { useId, type InputHTMLAttributes } from 'react';
import { Chip } from './Chip';

type TextProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

/** Label, input, then a hint or an error read out by screen readers. */
export function TextField({ label, error, hint, ...input }: TextProps) {
  const id = useId();
  const described = error ? `${id}-e` : hint ? `${id}-h` : undefined;
  return (
    <div>
      <label htmlFor={id} className="t-label text-cocoa-70">
        {label}
      </label>
      <input id={id} className="field mt-xs" aria-invalid={error ? true : undefined} aria-describedby={described} {...input} />
      {hint && !error && (
        <p id={`${id}-h`} className="t-caption mt-2xs text-cocoa-70">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-e`} role="alert" className="t-caption mt-2xs text-cocoa">
          {error}
        </p>
      )}
    </div>
  );
}

type ChoiceProps = { label: string; options: { id: string; label: string }[]; value: string; onChange(id: string): void; error?: string };

/** A row of pressable chips for one pick. */
export function ChoiceField({ label, options, value, onChange, error }: ChoiceProps) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={`${id}-l`}>
      <p id={`${id}-l`} className="t-label text-cocoa-70">
        {label}
      </p>
      <div className="mt-xs flex flex-wrap gap-xs">
        {options.map((o) => (
          <Chip key={o.id} role="button" selected={value === o.id} onSelect={() => onChange(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>
      {error && (
        <p role="alert" className="t-caption mt-2xs text-cocoa">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Add the Instagram icon** — append to `src/components/ui/Icons.tsx`

```tsx
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
```

- [ ] **Step 7: Verify and commit**

Run: `npm test && npm run build` → all pass.

```bash
git add src/components/ui src/lib/topbar.ts src/lib/topbar.test.ts src/lib/useDragScroll.ts src/lib/hooks.ts
git commit -m "feat: UI kit — rise, split words, heading, parallax, magnetic, count-up, drift row, frame, fields

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Top bar, deadline strip, WhatsApp button and the page shell

**Files:**
- Create: `src/components/layout/DeadlineStrip.tsx`, `src/components/layout/WhatsAppFab.tsx`, `scripts/qa-shots.mjs`
- Rewrite: `src/components/layout/Navbar.tsx`
- Modify: `src/App.tsx`, `package.json` (dev dependency), `.gitignore`

**Interfaces:**
- Consumes: `nextDeadline` (Task 5), `shortDate` (Task 1), `readFlag`/`writeFlag` (Task 1), `useTopBar`, `useScrollSpy`, `useIsWide` (Task 6), `GENERAL_MESSAGE`, `whatsappLink` (Task 2), `spring`, `ease` (Task 1).
- Produces: `<DeadlineStrip />`, `<Navbar />` (sticky), `<WhatsAppFab />`, `COMPANY_LINKS`; `scripts/qa-shots.mjs [url] [outDir] [--reduced] [--height=N]`.

- [ ] **Step 1: Create `src/components/layout/DeadlineStrip.tsx`**

```tsx
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { nextDeadline } from '../../data/companies';
import { shortDate } from '../../lib/dates';
import { readFlag, writeFlag } from '../../lib/storage';

const KEY = 'bb-strip-closed';

/** The next gift-box order-by date, above the top bar. Scrolls away with the page; closes for the session. */
export function DeadlineStrip() {
  const next = useMemo(() => nextDeadline(), []);
  const [closed, setClosed] = useState(() => readFlag(KEY));
  if (!next || closed) return null;
  return (
    <div className="bg-cocoa text-butter">
      <div className="container-x flex min-h-[44px] items-center gap-md">
        <a href="#gift-boxes" className="t-label min-w-0 flex-1 truncate">
          {next.label} gift boxes · order by {shortDate(next.date)}
        </a>
        <a href="#gift-boxes" className="t-label link hidden shrink-0 sm:inline">
          Get a quote →
        </a>
        <button
          type="button"
          onClick={() => {
            setClosed(true);
            writeFlag(KEY);
          }}
          className="-mr-sm grid size-[44px] shrink-0 place-items-center rounded transition-colors hover:bg-butter/10"
          aria-label="Hide this message"
        >
          <X className="size-[14px]" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `src/components/layout/Navbar.tsx`**

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CONTACT } from '../../data/content';
import { cn } from '../../lib/cn';
import { useScrollSpy, useTopBar } from '../../lib/hooks';
import { ease, spring } from '../../lib/motion';
import { GENERAL_MESSAGE, whatsappLink } from '../../lib/order';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { WhatsAppIcon } from '../ui/Icons';
import { Sheet } from '../ui/Sheet';
import { Sprig } from '../ui/Sprig';

type NavId = 'the-six' | 'custom' | 'companies' | 'studio' | 'faq';

const LINKS: { id: NavId; label: string; href: string }[] = [
  { id: 'the-six', label: 'The Six', href: '#the-six' },
  { id: 'custom', label: 'Custom cakes', href: '#custom' },
  { id: 'companies', label: 'For companies', href: '#gift-boxes' },
  { id: 'studio', label: 'Our studio', href: '#studio' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

export const COMPANY_LINKS = [
  { href: '#gift-boxes', label: 'Gift boxes', price: 'From AED 65 a box', icon: '/brand/berrybrown-circle-cocoa.svg' },
  { href: '#workshops', label: 'Workshops', price: 'From AED 150 a seat', icon: '/brand/berrybrown-circle-rose.svg' },
  { href: '#events', label: 'Company events', price: 'From AED 35 a guest', icon: '/brand/berrybrown-circle-claret.svg' },
];

const MOBILE_LINKS = [
  { href: '#the-six', label: 'The Six' },
  { href: '#custom', label: 'Custom cakes' },
  { href: '#gift-boxes', label: 'Gift boxes' },
  { href: '#workshops', label: 'Workshops' },
  { href: '#events', label: 'Company events' },
  { href: '#studio', label: 'Our studio' },
  { href: '#faq', label: 'FAQ' },
];

const SPY = ['the-six', 'custom', 'how', 'gift-boxes', 'workshops', 'events', 'udora', 'studio', 'kitchen', 'reviews', 'faq'];

function navFor(section: string | null): NavId | null {
  if (section === 'the-six' || section === 'custom' || section === 'studio' || section === 'faq') return section;
  if (section === 'gift-boxes' || section === 'workshops' || section === 'events' || section === 'udora') return 'companies';
  return null;
}

/** The one Claret thing in the bar: a dot under the section in view. It slides between links. */
function ActiveDot() {
  return <motion.span layoutId="nav-dot" className="absolute -bottom-2xs left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-claret" transition={spring.soft} aria-hidden />;
}

function BagButton({ count, onClick, className }: { count: number; onClick(): void; className?: string }) {
  const [bump, setBump] = useState(0);
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) setBump((b) => b + 1);
    prev.current = count;
  }, [count]);
  return (
    <button type="button" onClick={onClick} className={cn('flex h-[44px] items-center rounded px-xs transition-colors hover:bg-cocoa/6', className)} aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}>
      <motion.span key={bump} initial={{ scale: bump ? 1.3 : 1 }} animate={{ scale: 1 }} transition={spring.snappy} className="flex items-center gap-2xs">
        <ShoppingBag className="size-[18px]" strokeWidth={1.6} aria-hidden />
        <span className="t-price">{count}</span>
      </motion.span>
    </button>
  );
}

function CompaniesMenu({ active, open, setOpen }: { active: boolean; open: boolean; setOpen(v: boolean): void }) {
  const wrap = useRef<HTMLLIElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);
  return (
    <li ref={wrap} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="nav-companies"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown') return;
          e.preventDefault();
          setOpen(true);
          window.setTimeout(() => first.current?.focus(), 30);
        }}
        className="t-label relative flex items-center gap-2xs py-xs"
      >
        For companies
        <ChevronDown className={cn('size-[12px] transition-transform duration-300', open && 'rotate-180')} strokeWidth={1.75} aria-hidden />
        {active && <ActiveDot />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-companies"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ease.out }}
            className="absolute left-1/2 top-full mt-md w-[360px] -translate-x-1/2 rounded border border-cocoa-15 bg-butter p-xs shadow-sheet"
          >
            <ul>
              {COMPANY_LINKS.map((l, i) => (
                <li key={l.href}>
                  <a ref={i === 0 ? first : undefined} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-md rounded p-sm transition-colors hover:bg-cocoa/6">
                    <img src={l.icon} alt="" width={200} height={200} className="size-[40px]" />
                    <span>
                      <span className="t-heading block">{l.label}</span>
                      <span className="t-price-sm text-cocoa-70">{l.price}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Navbar() {
  const { count } = useCart();
  const { open, overlay } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { condensed, hidden } = useTopBar(menuOpen || dropOpen || overlay !== null);
  const active = navFor(useScrollSpy(SPY));

  const goFromMenu = (href: string) => {
    setMenuOpen(false);
    // Let the sheet release the scroll lock first, then jump natively (scroll-padding keeps the heading clear).
    window.setTimeout(() => {
      window.location.hash = href;
    }, 80);
  };

  return (
    <>
      <header className={cn('sticky top-0 z-50 border-b border-cocoa-15 bg-butter/92 backdrop-blur-[8px] transition-transform duration-500 ease-out', hidden && '-translate-y-full')}>
        <nav aria-label="Main" className={cn('container-x flex items-center gap-md transition-[height] duration-300', condensed ? 'h-[60px]' : 'h-[64px] lg:h-[76px]')}>
          <a href="#top" className="flex shrink-0 items-center" aria-label="Berry Brown, back to top">
            <img src="/brand/berrybrown-logo-horizontal.svg" alt="" width={437} height={137} className={cn('w-auto transition-[height] duration-300', condensed ? 'h-[42px]' : 'h-[44px] lg:h-[56px]')} />
          </a>

          <ul className="mx-auto hidden items-center gap-lg lg:flex">
            {LINKS.map((l) =>
              l.id === 'companies' ? (
                <CompaniesMenu key={l.id} active={active === 'companies'} open={dropOpen} setOpen={setDropOpen} />
              ) : (
                <li key={l.id}>
                  <a href={l.href} className="t-label link relative block py-xs" aria-current={active === l.id ? 'location' : undefined}>
                    {l.label}
                    {active === l.id && <ActiveDot />}
                  </a>
                </li>
              ),
            )}
          </ul>

          <div className="ml-auto flex items-center gap-xs lg:ml-0">
            <a href={whatsappLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="hidden size-[44px] place-items-center rounded text-cocoa transition-colors hover:bg-cocoa/6 lg:grid" aria-label={`WhatsApp us, ${CONTACT.phoneDisplay}`}>
              <WhatsAppIcon className="size-[18px]" />
            </a>
            <BagButton count={count} onClick={() => open({ kind: 'cart' })} className={count === 0 ? 'hidden lg:flex' : undefined} />
            <Button variant="cocoa" onClick={() => open({ kind: 'menu' })} className="min-h-[40px]! px-md!">
              Order
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex size-[44px] flex-col items-center justify-center gap-xs rounded transition-colors hover:bg-cocoa/6 lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span className="block h-px w-[20px] bg-cocoa" />
              <span className="block h-px w-[20px] bg-cocoa" />
            </button>
          </div>
        </nav>
      </header>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" hideTitle variant="full">
        <nav aria-label="Site" className="flex min-h-full flex-col px-md py-lg md:px-lg">
          <ol>
            {MOBILE_LINKS.map((l, i) => (
              <motion.li key={l.href} className="border-b border-cocoa-15" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: ease.out }}>
                <a
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    goFromMenu(l.href);
                  }}
                  className="flex items-baseline justify-between gap-md py-md"
                >
                  <span className="t-title2">{l.label}</span>
                  <span className="t-price text-cocoa-70">{String(i + 1).padStart(2, '0')}</span>
                </a>
              </motion.li>
            ))}
          </ol>
          <div className="mt-xl space-y-xs">
            <a href={whatsappLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="t-body link block">
              WhatsApp {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="t-body link block">
              {CONTACT.email}
            </a>
          </div>
          <Button
            variant="cocoa"
            className="mt-xl w-full"
            onClick={() => {
              setMenuOpen(false);
              open({ kind: 'menu' });
            }}
          >
            Order a cake
          </Button>
          <Sprig className="mx-auto mt-auto w-[64px] pt-xl text-cocoa-15" />
        </nav>
      </Sheet>
    </>
  );
}
```

- [ ] **Step 3: Create `src/components/layout/WhatsAppFab.tsx`**

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { CONTACT } from '../../data/content';
import { cn } from '../../lib/cn';
import { useIsWide } from '../../lib/hooks';
import { spring } from '../../lib/motion';
import { GENERAL_MESSAGE, whatsappLink } from '../../lib/order';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { WhatsAppIcon } from '../ui/Icons';

/** Cocoa WhatsApp button. Shows once the hero has gone; hides over the custom form on small screens and under overlays. */
export function WhatsAppFab() {
  const { overlay } = useUI();
  const { count } = useCart();
  const wide = useIsWide();
  const [pastHero, setPastHero] = useState(false);
  const [overForm, setOverForm] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setPastHero(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target.id === 'top') setPastHero(!e.isIntersecting);
        if (e.target.id === 'custom') setOverForm(e.isIntersecting);
      }
    });
    ['top', 'custom'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const visible = pastHero && overlay === null && (wide || !overForm);
  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={whatsappLink(GENERAL_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with our team on WhatsApp, ${CONTACT.phoneDisplay}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={spring.snappy}
          className={cn(
            'group fixed right-md z-40 grid size-[56px] place-items-center rounded-full bg-cocoa text-butter shadow-frame md:bottom-lg md:right-lg',
            count > 0 ? 'bottom-[calc(80px+env(safe-area-inset-bottom))]' : 'bottom-[max(var(--spacing-md),env(safe-area-inset-bottom))]',
          )}
        >
          <WhatsAppIcon className="size-[26px]" />
          <span className="t-label pointer-events-none absolute right-full mr-sm hidden translate-x-2 whitespace-nowrap rounded bg-cocoa px-sm py-xs text-butter opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
            Chat with our team
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Update `src/App.tsx`**

Wrap everything in `<MotionConfig reducedMotion="user">` (import `MotionConfig` from `motion/react`), import `DeadlineStrip` and `WhatsAppFab`, and change the layout part of the JSX to:

```tsx
        <DeadlineStrip />
        <Navbar />
        <main id="main" className="relative z-10 bg-butter shadow-page">
          <Hero />
          <CustomCake />
          <TheSix />
          <Companies />
          <Safa />
          <TheLog />
          <Reviews />
          <Faq />
          <Closing />
          <div aria-hidden className="lace-edge absolute inset-x-0 top-full" />
        </main>
        <Footer />
        <MobileBagBar />
        <WhatsAppFab />
        <ToastLayer />
        <Suspense fallback={null}>
          <Overlays />
        </Suspense>
        <div className="grain" aria-hidden />
```

(`main` loses `pt-[56px] lg:pt-[64px]`: the bar is sticky now, not fixed.)

- [ ] **Step 5: Add the QA screenshot script**

Run: `npm install --save-dev playwright-core@^1.56.0` and add `qa-shots` to `.gitignore`.

Create `scripts/qa-shots.mjs`:

```js
// Screenshots of a running site at phone, tablet and desktop widths. It scrolls through first,
// so every scroll-triggered section has appeared, then saves one viewport shot per screen height.
// Usage: node scripts/qa-shots.mjs [url] [outDir] [--reduced] [--height=760]
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const [url = 'http://localhost:5173/', out = 'qa-shots'] = args.filter((a) => !a.startsWith('--'));
const reduced = args.includes('--reduced');
const fixedHeight = Number(args.find((a) => a.startsWith('--height='))?.split('=')[1]) || 0;
const screens = [
  [390, 844, 'phone'],
  [768, 1024, 'tablet'],
  [1440, 900, 'desktop'],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const [width, baseHeight, name] of screens) {
  const height = fixedHeight || baseHeight;
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.goto(url, { waitUntil: 'networkidle' });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += Math.round(height * 0.5)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const fonts = await page.evaluate(() => [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))]);
  let i = 0;
  for (let y = 0; y < total; y += height) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/${name}${reduced ? '-reduced' : ''}-${String(i++).padStart(2, '0')}.png` });
  }
  console.log(`${name}: ${width}×${height}, page ${total}px, horizontal overflow ${overflow}px, fonts ${fonts.join(', ')}, ${i} shots`);
  await page.close();
}
await browser.close();
```

- [ ] **Step 6: Verify in the browser**

Run: `npm test && npm run build` → all pass.
Run `npm run dev` in the background, then `node scripts/qa-shots.mjs http://localhost:5173/ qa-shots`.
Expected console: `horizontal overflow 0px` for all three; fonts `Alegreya, Jost`.
Open `qa-shots/desktop-00.png` and `qa-shots/phone-00.png`: Cocoa deadline strip on top, bar below with the 56 px logo on desktop and 44 px on the phone, links on desktop, Order button. Scroll check with a second shot series is not needed yet.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout src/App.tsx scripts/qa-shots.mjs package.json package-lock.json .gitignore
git commit -m "feat: sticky top bar with bigger logo, companies menu, deadline strip, WhatsApp button, lace edge and grain

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Hero

**Files:**
- Rewrite: `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `media.hero`, `media.six` (Task 3); `Frame`, `Parallax`, `Magnetic`, `Photo` (Tasks 3, 6); `RATING`; `ease` (Task 1).

- [ ] **Step 1: Rewrite `src/components/sections/Hero.tsx`**

```tsx
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { RATING } from '../../data/content';
import { media } from '../../data/media';
import { ease } from '../../lib/motion';
import { useUI } from '../../store/ui';
import { Button, ButtonLink } from '../ui/Button';
import { Frame } from '../ui/Frame';
import { StarIcon } from '../ui/Icons';
import { Magnetic } from '../ui/Magnetic';
import { Parallax } from '../ui/Parallax';
import { Photo } from '../ui/Photo';

const AVATARS = [media.six[0], media.six[1], media.six[4]];

export function Hero() {
  const { open } = useUI();
  const reduce = useReducedMotion();
  const rise = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.1 + i * 0.06, ease: ease.out } };

  return (
    <section id="top" className="relative overflow-clip pb-3xl pt-xl lg:pt-2xl" aria-labelledby="hero-title">
      <div className="container-x grid items-center gap-2xl lg:grid-cols-12">
        <div className="lg:col-span-6">
          <motion.h1 id="hero-title" {...rise(0)} className="mx-auto w-[280px] md:w-[360px] lg:mx-0 lg:w-[440px]">
            <img src="/brand/berrybrown-logo-primary.svg" alt="Berry Brown — made with heart, not haste" width={396} height={329} className="h-auto w-full" />
          </motion.h1>
          <motion.p {...rise(1)} className="t-title3 mt-xl">
            A cake studio in Dubai.
          </motion.p>
          <motion.p {...rise(2)} className="t-body mt-sm max-w-[40ch] text-cocoa-70">
            Six signature cakes, custom cakes for the days that matter, and gift boxes and workshops for your team. All made to order.
          </motion.p>
          <motion.div {...rise(3)} className="mt-xl flex flex-col gap-sm sm:flex-row sm:items-center">
            <Magnetic className="block sm:inline-block">
              <Button variant="claret" onClick={() => open({ kind: 'menu' })} className="w-full sm:w-auto">
                Order a cake <ArrowRight className="size-[14px]" strokeWidth={1.75} aria-hidden />
              </Button>
            </Magnetic>
            <ButtonLink href="#custom" variant="ghost">
              Design your cake
            </ButtonLink>
          </motion.div>
          <motion.div {...rise(4)} className="mt-lg flex items-center gap-sm">
            <span className="flex -space-x-2" aria-hidden>
              {AVATARS.filter((m) => !m.placeholder).map((m) => (
                <img key={m.src} src={m.srcSet ? m.src.replace('-1200.', '-640.') : m.src} alt="" className="size-[32px] rounded-full object-cover ring-2 ring-butter" />
              ))}
            </span>
            <StarIcon className="size-[14px] text-cocoa" />
            <span className="t-price">
              {RATING.score} · {RATING.count}+ reviews
            </span>
          </motion.div>
        </div>

        <motion.div {...rise(3)} className="relative lg:col-span-6">
          <div aria-hidden className="absolute bottom-[4%] left-[14%] top-[8%] -right-md rounded bg-rose lg:-right-2xl" />
          <Parallax offset={24} className="relative ml-auto w-[88%] max-w-[460px]">
            <Frame caption={media.hero.cake.label}>
              <Photo media={media.hero.cake} eager sizes="(min-width: 1024px) 460px, 88vw" />
            </Frame>
          </Parallax>
          <Parallax offset={60} rotate={-3} className="absolute -bottom-lg left-0 w-[42%] max-w-[220px]">
            <Frame>
              <Photo media={media.hero.slice} sizes="220px" />
            </Frame>
          </Parallax>
          <Parallax offset={-40} rotate={3} className="absolute -top-lg right-0 hidden w-[34%] max-w-[180px] md:block">
            <Frame>
              <Photo media={media.hero.hands} sizes="180px" />
            </Frame>
          </Parallax>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build` → passes.
Run: `node scripts/qa-shots.mjs http://localhost:5173/ qa-shots` and open `desktop-00.png` and `phone-00.png`/`phone-01.png`.
Expected: logo about 440 px wide on the left (desktop) / 280 px centred (phone); three framed photos on a Rose block to the right (desktop) / below (phone); the Claret "Order a cake" button; no horizontal overflow.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: hero with the large stacked logo and a drifting photo stack

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: The Six carousel and the product card

**Files:**
- Rewrite: `src/components/sections/TheSix.tsx`, `src/components/shop/ProductCard.tsx`
- Modify: `src/App.tsx` (order: `<TheSix />` right after `<Hero />`)

**Interfaces:**
- Consumes: `useDragScroll` (Task 6), `Heading`, `Rise`, `Photo` (Tasks 3, 6), `PHOTO_NOTE` (Task 2), `PRODUCTS`, `WRITTEN_ON`, `ladderLine`, `defaultSize`.
- Produces: `<ProductCard product index? />` (still used by `MenuOverlay` without `index`).

- [ ] **Step 1: Rewrite `src/components/shop/ProductCard.tsx`**

```tsx
import { Plus } from 'lucide-react';
import { defaultSize, ladderLine, type Product } from '../../data/products';
import { aed } from '../../lib/format';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Photo } from '../ui/Photo';

/** One of the Six: photo, name, one line, the price ladder. The photo opens the sheet; "+" adds the 6" straight to the bag. */
export function ProductCard({ product, index }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { open, notify, overlay } = useUI();
  const size = defaultSize(product);

  const quickAdd = () => {
    add({ productId: product.id, sizeId: size.id, flavourId: product.flavours[0].id, qty: 1 });
    notify(`${product.name} added`);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={() => open({ kind: 'product', id: product.id, back: overlay?.kind === 'menu' ? 'menu' : undefined })}
          className="relative block w-full overflow-hidden rounded text-left"
          aria-label={`${product.name}: choose size and flavour`}
        >
          <Photo media={product.image} zoom sizes="(min-width: 1024px) 360px, (min-width: 640px) 44vw, 78vw" />
          {index !== undefined && (
            <span className="t-label absolute left-sm top-sm rounded bg-butter/90 px-xs py-2xs text-cocoa">
              {index + 1} of 6
            </span>
          )}
          <span className="t-label absolute bottom-sm left-sm hidden translate-y-2 rounded bg-butter px-sm py-xs text-cocoa opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block" aria-hidden>
            Choose size & flavour
          </span>
        </button>
        <button
          type="button"
          onClick={quickAdd}
          className="absolute bottom-sm right-sm grid size-[44px] place-items-center rounded bg-cocoa text-butter transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label={`Quick add ${product.name}, ${size.label}, ${aed(size.price)}`}
        >
          <Plus className="size-[18px]" strokeWidth={2} aria-hidden />
        </button>
      </div>
      <h3 className="t-heading mt-md">{product.name}</h3>
      <p className="t-callout mt-2xs text-cocoa-70">{product.short}</p>
      <p className="t-price mt-sm">{ladderLine(product)}</p>
    </article>
  );
}
```

- [ ] **Step 2: Rewrite `src/components/sections/TheSix.tsx`**

```tsx
import { motion, useReducedMotion, useScroll } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PHOTO_NOTE } from '../../data/content';
import { PRODUCTS, WRITTEN_ON } from '../../data/products';
import { useDragScroll } from '../../lib/useDragScroll';
import { useUI } from '../../store/ui';
import { ProductCard } from '../shop/ProductCard';
import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';
import { Rise } from '../ui/Rise';

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick(): void }) {
  const Icon = dir < 0 ? ArrowLeft : ArrowRight;
  return (
    <button type="button" onClick={onClick} className="grid size-[44px] place-items-center rounded border border-cocoa-15 text-cocoa transition-colors hover:bg-cocoa hover:text-butter" aria-label={dir < 0 ? 'Previous cakes' : 'More cakes'}>
      <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
    </button>
  );
}

export function TheSix() {
  const { open } = useUI();
  const reduce = useReducedMotion();
  const { ref, handlers } = useDragScroll<HTMLUListElement>();
  const { scrollXProgress } = useScroll({ container: ref });

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    const card = el?.querySelector('li');
    if (!el) return;
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 29), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section id="the-six" className="section-more" aria-labelledby="six-title">
      <div className="container-x flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
        <Heading id="six-title" label="The Six" title="Our signature cakes." oneliner="Six cakes. Three sizes. 24 hours’ notice." />
        <div className="flex items-center gap-sm">
          <div className="hidden gap-xs md:flex">
            <Arrow dir={-1} onClick={() => nudge(-1)} />
            <Arrow dir={1} onClick={() => nudge(1)} />
          </div>
          <Button variant="cocoa" onClick={() => open({ kind: 'menu' })}>
            See the full menu
          </Button>
        </div>
      </div>

      <ul ref={ref} {...handlers} className="no-scrollbar carousel-pad mt-xl flex snap-x snap-mandatory gap-lg overflow-x-auto pb-md md:cursor-grab md:active:cursor-grabbing" aria-label="The Six">
        {PRODUCTS.map((p, i) => (
          <li key={p.id} className="w-[78vw] shrink-0 snap-start sm:w-[44vw] md:w-[340px] lg:w-[360px]">
            <Rise delay={i * 0.06} className="h-full">
              <ProductCard product={p} index={i} />
            </Rise>
          </li>
        ))}
        <li className="w-px shrink-0" aria-hidden />
      </ul>

      <div className="container-x mt-sm">
        <div className="h-[2px] overflow-hidden rounded-full bg-cocoa-15">
          <motion.div className="h-full origin-left bg-claret" style={{ scaleX: scrollXProgress }} />
        </div>
        <p className="t-label mt-lg text-cocoa-70">Written on — a hand-piped message and one decoration on any of the Six, +{WRITTEN_ON.price}.</p>
        <p className="t-caption mt-xs text-cocoa-70">{PHOTO_NOTE}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Move The Six up** — in `src/App.tsx`, put `<TheSix />` directly after `<Hero />` (before `<CustomCake />`).

- [ ] **Step 4: Verify**

Run: `npm test && npm run build` → pass.
Screenshots (`node scripts/qa-shots.mjs`): the row of six photo cards bleeds off the right edge on desktop, starts aligned with the heading; "1 of 6" chips; Cocoa "+" buttons; Claret progress line; phone shows one card and a sliver of the next. In the dev server, click "+" once: the toast shows and the bag count appears in the bar.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/TheSix.tsx src/components/shop/ProductCard.tsx src/App.tsx
git commit -m "feat: The Six as the old sliding carousel with quick add and a progress line

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Design your cake — the stepper

**Files:**
- Rewrite: `src/data/custom.ts`, `src/data/custom.test.ts`
- Modify: `src/lib/order.ts` (`customCakeMessage`), `src/lib/order.test.ts`
- Modify: `worker/enquiries.ts`; Create: `worker/enquiries.test.ts`
- Create: `src/components/sections/custom/CustomCake.tsx`, `Options.tsx`, `Upload.tsx`, `Progress.tsx`, `Ticket.tsx`
- Delete: `src/components/sections/CustomCake.tsx`
- Modify: `src/App.tsx` (import path)

**Interfaces:**
- Consumes: `addDays`, `localIso` (Task 1); `media.looks` (Task 3); `Heading`, `Photo`, `Button` (Tasks 3, 6); `GREETING`, `mailtoLink`, `whatsappLink` (Task 2); `recordEnquiry`, `uploadInspiration` (existing api.ts).
- Produces:
  - custom.ts: `CUSTOMISED = 'customised'`; `type Option = { id; label; sub?; image? }`; `OCCASIONS`, `SIZES` (`SizeOption` with `size`, `from`), `LOOKS`, `FLAVOURS` (4 each); `type StepId = 'occasion' | 'serves' | 'look' | 'flavour' | 'words' | 'date'`; `CUSTOM_STEPS: { id: StepId; question: string }[]`; `WORDS_MAX = 35`, `OTHER_MAX = 60`, `IDEA_MAX = 120`, `MAX_PHOTOS = 3`, `MAX_PHOTO_BYTES`, `CUSTOM_FLAVOUR_ADD = 60`, `CUSTOM_LEAD_DAYS = 7`; `type CustomForm`; `EMPTY_CUSTOM`; `earliestCustomDate(now?)`; `isStepDone(step, f, earliest?)`; `remaining(f, earliest?)`; `customFromPrice(f)`; `validateCustom(f, earliest?)`; `customSummary(f): { step; label; value }[]`; `ticketImage(f): Media`; `customAnswers(f): Record<string, string>`.
  - worker: `enquiryRow(body: unknown, storagePrefix: string): { row: Record<string, unknown> } | { error: string }` (accepts `about` in box / workshop / table / event and stores company answers).

- [ ] **Step 1: Write the failing data test** — replace `src/data/custom.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { CUSTOMISED, CUSTOM_STEPS, EMPTY_CUSTOM, FLAVOURS, LOOKS, OCCASIONS, SIZES, customAnswers, customFromPrice, customSummary, earliestCustomDate, isStepDone, remaining, ticketImage, validateCustom } from './custom';
import { media } from './media';

const earliest = '2026-10-04';
const full = { ...EMPTY_CUSTOM, occasion: 'birthday', serves: '6in', look: 'flowers', flavour: 'pistachio', date: '2026-10-05' };

describe('custom cake form', () => {
  it('offers three choices plus Customised in every group', () => {
    for (const list of [OCCASIONS, SIZES, LOOKS, FLAVOURS]) {
      expect(list).toHaveLength(4);
      expect(list.at(-1)?.id).toBe(CUSTOMISED);
    }
  });

  it('asks six questions in order', () => {
    expect(CUSTOM_STEPS.map((s) => s.id)).toEqual(['occasion', 'serves', 'look', 'flavour', 'words', 'date']);
  });

  it('needs a week', () => {
    expect(earliestCustomDate(new Date(2026, 8, 27, 10))).toBe('2026-10-04');
  });

  it('prices from the size, plus 60 for a custom flavour', () => {
    expect(customFromPrice(EMPTY_CUSTOM)).toBe(300);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: '8in' })).toBe(420);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: 'tiers' })).toBe(850);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: CUSTOMISED })).toBe(300);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: '8in', flavour: CUSTOMISED })).toBe(480);
  });

  it('marks a step done only when answered, and Customised only with its text', () => {
    expect(isStepDone('occasion', EMPTY_CUSTOM, earliest)).toBe(false);
    expect(isStepDone('occasion', { ...EMPTY_CUSTOM, occasion: CUSTOMISED }, earliest)).toBe(false);
    expect(isStepDone('occasion', { ...EMPTY_CUSTOM, occasion: CUSTOMISED, occasionOther: 'Graduation' }, earliest)).toBe(true);
    expect(isStepDone('words', EMPTY_CUSTOM, earliest)).toBe(true);
    expect(isStepDone('date', { ...EMPTY_CUSTOM, date: '2026-10-03' }, earliest)).toBe(false);
    expect(remaining(EMPTY_CUSTOM, earliest)).toBe(5);
    expect(remaining(full, earliest)).toBe(0);
  });

  it('validates every required answer and refuses typed dates inside the week', () => {
    expect(Object.keys(validateCustom(EMPTY_CUSTOM, earliest)).sort()).toEqual(['date', 'flavour', 'look', 'occasion', 'serves']);
    const custom = { ...full, occasion: CUSTOMISED, serves: CUSTOMISED, look: CUSTOMISED, flavour: CUSTOMISED };
    expect(Object.keys(validateCustom(custom, earliest)).sort()).toEqual(['flavourOther', 'lookOther', 'occasionOther', 'servesOther']);
    expect(validateCustom({ ...full, date: '2026-10-03' }, earliest).date).toBe('Custom cakes need a week');
    expect(validateCustom({ ...full, words: 'x'.repeat(36) }, earliest).words).toBeTruthy();
    expect(validateCustom(full, earliest)).toEqual({});
  });

  it('summarises the answers, using Customised text only when Customised is picked', () => {
    const rows = customSummary({ ...full, occasion: CUSTOMISED, occasionOther: 'Graduation', words: ' Well done ' });
    expect(rows.map((r) => r.label)).toEqual(['Occasion', 'People', 'Look', 'Flavour', 'Words', 'Date']);
    expect(rows.map((r) => r.value)).toEqual(['Graduation', '6–8 people · 6 inch', 'Fresh flowers', 'Pistachio & kunafa', 'Well done', '2026-10-05']);
    expect(customSummary({ ...full, occasionOther: 'Stale text' })[0].value).toBe('Birthday');
    expect(customSummary({ ...full, noWords: true })[4].value).toBe('No words');
  });

  it('shows the photo of the chosen look', () => {
    expect(ticketImage(EMPTY_CUSTOM)).toBe(media.looks.custom);
    expect(ticketImage({ ...EMPTY_CUSTOM, look: 'drip' })).toBe(media.looks.drip);
  });

  it('turns the answers into strings for the enquiry log', () => {
    expect(customAnswers({ ...full, noWords: true }).noWords).toBe('yes');
    expect(customAnswers(full).noWords).toBe('');
    expect(customAnswers(full).serves).toBe('6in');
  });
});
```

Run: `npx vitest run src/data/custom.test.ts` → FAIL.

- [ ] **Step 2: Rewrite `src/data/custom.ts`**

```ts
import { addDays, localIso } from '../lib/dates';
import { media, type Media } from './media';

export const CUSTOMISED = 'customised';

export type Option = { id: string; label: string; sub?: string; image?: Media };
export type SizeOption = Option & { size: string; from: number };

export const OCCASIONS: Option[] = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'baby', label: 'Baby shower' },
  { id: CUSTOMISED, label: 'Customised' },
];

export const SIZES: SizeOption[] = [
  { id: '6in', label: '6–8 people', size: '6 inch', from: 300, sub: '6 inch · from AED 300' },
  { id: '8in', label: '10–14 people', size: '8 inch', from: 420, sub: '8 inch · from AED 420' },
  { id: 'tiers', label: '20–30 people', size: 'Two tiers', from: 850, sub: 'Two tiers · from AED 850' },
  { id: CUSTOMISED, label: 'Customised', size: 'Quoted by our team', from: 300, sub: 'Quoted by our team' },
];

export const LOOKS: Option[] = [
  { id: 'buttercream', label: 'Soft buttercream', image: media.looks.buttercream },
  { id: 'flowers', label: 'Fresh flowers', image: media.looks.flowers },
  { id: 'drip', label: 'Drip & berries', image: media.looks.drip },
  { id: CUSTOMISED, label: 'Customised', image: media.looks.custom },
];

export const FLAVOURS: Option[] = [
  { id: 'chocolate-berry', label: 'Chocolate & berry' },
  { id: 'pistachio', label: 'Pistachio & kunafa' },
  { id: 'vanilla-berry', label: 'Vanilla & berries' },
  { id: CUSTOMISED, label: 'Customised', sub: '+ AED 60' },
];

export type StepId = 'occasion' | 'serves' | 'look' | 'flavour' | 'words' | 'date';

export const CUSTOM_STEPS: { id: StepId; question: string }[] = [
  { id: 'occasion', question: 'What are we celebrating?' },
  { id: 'serves', question: 'How many people?' },
  { id: 'look', question: 'Pick a look.' },
  { id: 'flavour', question: 'Pick a flavour.' },
  { id: 'words', question: 'Any words on the cake?' },
  { id: 'date', question: 'When is it?' },
];

export const CUSTOM_FLAVOUR_ADD = 60;
export const WORDS_MAX = 35;
export const OTHER_MAX = 60;
export const IDEA_MAX = 120;
export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const CUSTOM_LEAD_DAYS = 7;

export type CustomForm = {
  occasion: string;
  occasionOther: string;
  serves: string;
  servesOther: string;
  look: string;
  lookOther: string;
  flavour: string;
  flavourOther: string;
  words: string;
  noWords: boolean;
  date: string;
};

export const EMPTY_CUSTOM: CustomForm = {
  occasion: '',
  occasionOther: '',
  serves: '',
  servesOther: '',
  look: '',
  lookOther: '',
  flavour: '',
  flavourOther: '',
  words: '',
  noWords: false,
  date: '',
};

const OTHER_KEY = { occasion: 'occasionOther', serves: 'servesOther', look: 'lookOther', flavour: 'flavourOther' } as const;

/** Earliest date for a custom cake: a week from today. */
export function earliestCustomDate(now: Date = new Date()): string {
  return localIso(addDays(now, CUSTOM_LEAD_DAYS));
}

/** Answered, and Customised only with its text. Words are optional, so that step is always done. */
export function isStepDone(step: StepId, f: CustomForm, earliest: string = earliestCustomDate()): boolean {
  if (step === 'words') return true;
  if (step === 'date') return f.date !== '' && f.date >= earliest;
  const v = f[step];
  if (!v) return false;
  return v !== CUSTOMISED || f[OTHER_KEY[step]].trim().length > 0;
}

export function remaining(f: CustomForm, earliest?: string): number {
  return CUSTOM_STEPS.filter((s) => !isStepDone(s.id, f, earliest)).length;
}

export function customFromPrice(f: CustomForm): number {
  const base = SIZES.find((s) => s.id === f.serves)?.from ?? SIZES[0].from;
  return base + (f.flavour === CUSTOMISED ? CUSTOM_FLAVOUR_ADD : 0);
}

export type CustomErrors = Partial<Record<keyof CustomForm, string>>;

export function validateCustom(f: CustomForm, earliest: string = earliestCustomDate()): CustomErrors {
  const e: CustomErrors = {};
  if (!f.occasion) e.occasion = 'Pick an occasion';
  else if (f.occasion === CUSTOMISED && !f.occasionOther.trim()) e.occasionOther = 'Tell us the occasion';
  if (!f.serves) e.serves = 'Pick how many people';
  else if (f.serves === CUSTOMISED && !f.servesOther.trim()) e.servesOther = 'Tell us how many people';
  if (!f.look) e.look = 'Pick a look';
  else if (f.look === CUSTOMISED && !f.lookOther.trim()) e.lookOther = 'Describe your idea';
  if (!f.flavour) e.flavour = 'Pick a flavour';
  else if (f.flavour === CUSTOMISED && !f.flavourOther.trim()) e.flavourOther = 'Tell us the flavour';
  if (f.words.length > WORDS_MAX) e.words = `Keep it under ${WORDS_MAX} characters`;
  if (!f.date) e.date = 'Pick a date';
  else if (f.date < earliest) e.date = 'Custom cakes need a week';
  return e;
}

const labelFor = (list: Option[], id: string, other: string) => {
  if (!id) return '';
  if (id === CUSTOMISED) return other.trim() || 'Customised';
  return list.find((o) => o.id === id)?.label ?? '';
};

export type SummaryRow = { step: StepId; label: string; value: string };

/** The six answers as rows. Empty values mean "not answered yet". */
export function customSummary(f: CustomForm): SummaryRow[] {
  const size = SIZES.find((s) => s.id === f.serves);
  const people = f.serves === CUSTOMISED ? f.servesOther.trim() || 'Customised' : size ? `${size.label} · ${size.size}` : '';
  return [
    { step: 'occasion', label: 'Occasion', value: labelFor(OCCASIONS, f.occasion, f.occasionOther) },
    { step: 'serves', label: 'People', value: people },
    { step: 'look', label: 'Look', value: labelFor(LOOKS, f.look, f.lookOther) },
    { step: 'flavour', label: 'Flavour', value: labelFor(FLAVOURS, f.flavour, f.flavourOther) },
    { step: 'words', label: 'Words', value: f.noWords ? 'No words' : f.words.trim() },
    { step: 'date', label: 'Date', value: f.date },
  ];
}

/** The ticket photo: the chosen look, or the custom-cake sketch before a look is picked. */
export function ticketImage(f: CustomForm): Media {
  return LOOKS.find((l) => l.id === f.look)?.image ?? media.looks.custom;
}

/** The answers as plain strings, for the enquiry log. */
export function customAnswers(f: CustomForm): Record<string, string> {
  return { ...f, noWords: f.noWords ? 'yes' : '' };
}
```

Run: `npx vitest run src/data/custom.test.ts` → all passed.

- [ ] **Step 3: Write the failing message tests** — in `src/lib/order.test.ts`, change `import { EMPTY_CUSTOM } from '../data/custom';` to `import { CUSTOMISED, EMPTY_CUSTOM } from '../data/custom';` and replace the whole `describe('customCakeMessage', …)` block with:

```ts
describe('customCakeMessage', () => {
  const form = { ...EMPTY_CUSTOM, occasion: 'birthday', serves: '6in', look: 'flowers', flavour: 'pistachio', words: 'Happy 60th, Dad', date: '2026-10-03' };

  it('lists every answer and the from-price', () => {
    const text = customCakeMessage(form);
    expect(text.split('\n')[0]).toBe("Hi Berry Brown, I'd like a custom cake.");
    expect(text).toContain('Occasion: Birthday');
    expect(text).toContain('People: 6–8 people · 6 inch');
    expect(text).toContain('Look: Fresh flowers');
    expect(text).toContain('Flavour: Pistachio & kunafa');
    expect(text).toContain('Words on the cake: "Happy 60th, Dad"');
    expect(text).toContain('Date: Sat 3 Oct');
    expect(text).toContain('From AED 300 on the site');
    expect(text).not.toContain('Inspiration:');
  });

  it('prints the Customised text and the custom flavour add-on', () => {
    const text = customCakeMessage({ ...form, occasion: CUSTOMISED, occasionOther: 'Graduation', serves: CUSTOMISED, servesOther: 'About 40 people', look: CUSTOMISED, lookOther: 'Gold leaf and white roses', flavour: CUSTOMISED, flavourOther: 'Lemon and thyme' });
    expect(text).toContain('Occasion: Graduation');
    expect(text).toContain('People: About 40 people');
    expect(text).toContain('Look: Gold leaf and white roses');
    expect(text).toContain('Flavour: Lemon and thyme (+AED 60)');
    expect(text).toContain('From AED 360 on the site');
  });

  it('never repeats Customised text after a normal pick', () => {
    expect(customCakeMessage({ ...form, occasionOther: 'Old idea' })).not.toContain('Old idea');
  });

  it('says so when there are no words', () => {
    expect(customCakeMessage({ ...form, words: '', noWords: true })).toContain('Words on the cake: none');
  });

  it('adds inspiration links, or asks to send photos in WhatsApp', () => {
    expect(customCakeMessage(form, ['https://x/1.jpg', 'https://x/2.jpg']).match(/Inspiration: https:/g)).toHaveLength(2);
    expect(customCakeMessage(form, [], 3)).toContain("I'll send my inspiration photos here.");
  });
});
```

Run: `npx vitest run src/lib/order.test.ts` → FAIL (old message format).

- [ ] **Step 4: Rewrite `customCakeMessage` in `src/lib/order.ts`**

Change the custom import to `import { CUSTOMISED, CUSTOM_FLAVOUR_ADD, customFromPrice, customSummary, type CustomForm } from '../data/custom';` and replace the function with:

```ts
/**
 * The message for a custom cake. `photoUrls` are links from the inspiration upload; `unsentPhotos` > 0 means
 * the upload failed and the customer will attach the photos in WhatsApp instead.
 */
export function customCakeMessage(f: CustomForm, photoUrls: string[] = [], unsentPhotos = 0): string {
  const rows = customSummary(f);
  const value = (label: string) => rows.find((r) => r.label === label)?.value ?? '';
  const words = f.words.trim();
  return tidy([
    `${GREETING} I'd like a custom cake.`,
    '',
    `Occasion: ${value('Occasion')}`,
    `People: ${value('People')}`,
    `Look: ${value('Look')}`,
    `Flavour: ${value('Flavour')}${f.flavour === CUSTOMISED ? ` (+AED ${CUSTOM_FLAVOUR_ADD})` : ''}`,
    f.noWords || !words ? 'Words on the cake: none' : `Words on the cake: "${words}"`,
    `Date: ${f.date ? prettyDate(f.date) : ''}`,
    `From ${aed(customFromPrice(f))} on the site`,
    '',
    ...photoUrls.map((u) => `Inspiration: ${u}`),
    unsentPhotos > 0 ? "I'll send my inspiration photos here." : '',
  ]);
}
```

Remove the now-unused `serveOption` import. Run: `npx vitest run src/lib/order.test.ts` → all passed.

- [ ] **Step 5: Write the failing Worker test** — `worker/enquiries.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { enquiryRow } from './enquiries';

const prefix = 'https://x.supabase.co/storage/v1/';
const row = (body: unknown) => {
  const r = enquiryRow(body, prefix);
  if ('error' in r) throw new Error(r.error);
  return r.row;
};

describe('enquiry rows', () => {
  it('rejects unknown kinds, empty messages and non-objects', () => {
    expect(enquiryRow({ kind: 'spam', message: 'hi' }, prefix)).toEqual({ error: 'Unknown enquiry' });
    expect(enquiryRow({ kind: 'custom', message: '  ' }, prefix)).toEqual({ error: 'Empty message' });
    expect(enquiryRow(null, prefix)).toEqual({ error: 'Invalid request' });
  });

  it('keeps only known custom answers and our own photo links', () => {
    const r = row({
      kind: 'custom',
      message: 'Hi',
      fromPrice: 360,
      answers: { occasion: 'customised', occasionOther: 'Graduation', lookOther: 'Gold', noWords: 'yes', evil: 'x' },
      photos: [`${prefix}object/sign/a.jpg`, 'https://evil.example/b.jpg'],
    });
    expect(r.answers).toMatchObject({ occasion: 'customised', occasionOther: 'Graduation', lookOther: 'Gold', noWords: 'yes' });
    expect((r.answers as Record<string, string>).evil).toBeUndefined();
    expect(r.photos).toEqual([`${prefix}object/sign/a.jpg`]);
    expect(r.from_price).toBe(360);
  });

  it('accepts event quotes and stores their answers', () => {
    const r = row({ kind: 'company', about: 'event', message: 'Hi', answers: { format: 'table', qty: '45', area: 'DIFC', name: 'Omar', extra: 'x' } });
    expect(r.about).toBe('event');
    expect(r.answers).toMatchObject({ format: 'table', qty: '45', area: 'DIFC', name: 'Omar' });
    expect((r.answers as Record<string, string>).extra).toBeUndefined();
  });

  it('drops an unknown company topic', () => {
    expect(row({ kind: 'company', about: 'party', message: 'Hi' }).about).toBeNull();
  });
});
```

Run: `npx vitest run worker/enquiries.test.ts` → FAIL (`enquiryRow` not exported).

- [ ] **Step 6: Rewrite `worker/enquiries.ts`**

```ts
import { json, sameOrigin, type Env } from './checkout';
import { supabaseFrom } from './supabase';

const ABOUT = ['box', 'workshop', 'table', 'event'];
const CUSTOM_KEYS = ['occasion', 'occasionOther', 'serves', 'servesOther', 'look', 'lookOther', 'flavour', 'flavourOther', 'words', 'noWords', 'date'];
const COMPANY_KEYS = ['qty', 'boxSize', 'logo', 'where', 'format', 'date', 'area', 'company', 'name'];

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const pick = (value: unknown, keys: string[]) => {
  const o = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(keys.map((k) => [k, str(o[k], 200)]));
};

/** Validates a POST body and shapes the `enquiries` row. Photo links must start with `storagePrefix`. */
export function enquiryRow(body: unknown, storagePrefix: string): { row: Record<string, unknown> } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' };
  const b = body as Record<string, unknown>;
  const kind = str(b.kind, 10);
  if (kind !== 'custom' && kind !== 'company') return { error: 'Unknown enquiry' };
  const message = str(b.message, 4000);
  if (!message) return { error: 'Empty message' };

  const row: Record<string, unknown> = { kind, message };
  if (kind === 'company') {
    const about = str(b.about, 10);
    row.about = ABOUT.includes(about) ? about : null;
    row.answers = pick(b.answers, COMPANY_KEYS);
  } else {
    row.answers = pick(b.answers, CUSTOM_KEYS);
    const from = Number(b.fromPrice);
    row.from_price = Number.isFinite(from) && from > 0 && from < 100000 ? Math.round(from) : null;
    const photos = Array.isArray(b.photos) ? b.photos : [];
    row.photos = photos.filter((p): p is string => typeof p === 'string' && p.startsWith(storagePrefix)).slice(0, 3);
  }
  return { row };
}

/** POST /api/enquiries — saves a custom-cake send or a company quote request. */
export async function handleEnquiries(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!sameOrigin(request)) return json({ error: 'Forbidden' }, 403);
  const db = supabaseFrom(env);
  if (!db) return json({ error: 'Enquiry log is not set up' }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  const shaped = enquiryRow(body, `${db.url}/storage/v1/`);
  if ('error' in shaped) return json({ error: shaped.error }, 400);

  try {
    await db.insert('enquiries', shaped.row);
  } catch (e) {
    console.error('enquiries insert', String(e));
    return json({ error: 'Could not save the enquiry' }, 502);
  }
  return json({ ok: true }, 201);
}
```

Run: `npx vitest run worker/enquiries.test.ts` → 4 passed.

- [ ] **Step 7: Create the stepper parts**

`src/components/sections/custom/Options.tsx`:

```tsx
import { CUSTOMISED, type Option } from '../../../data/custom';
import { cn } from '../../../lib/cn';
import { Photo } from '../../ui/Photo';

export type OtherInput = { value: string; onChange(v: string): void; placeholder: string; max: number };

/** Three choices and "Customised" as a 2 × 2 grid of pressable cards. Customised opens a text box. */
export function Options({ label, options, value, onPick, other, withImages = false }: { label: string; options: Option[]; value: string; onPick(id: string): void; other: OtherInput; withImages?: boolean }) {
  return (
    <div>
      <div role="group" aria-label={label} className="grid grid-cols-2 gap-sm">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(o.id)}
              className={cn('flex min-h-[64px] flex-col items-start justify-end gap-2xs rounded border p-sm text-left transition-colors duration-200', on ? 'border-cocoa bg-cocoa text-butter' : 'border-cocoa-15 bg-butter text-cocoa hover:border-cocoa-70')}
            >
              {withImages && o.image && <Photo media={o.image} ratio="4 / 3" sizes="(min-width: 1024px) 220px, 42vw" className="mb-xs w-full" />}
              <span className="t-heading">{o.label}</span>
              {o.sub && <span className={cn('t-price-sm', on ? 'text-butter-60' : 'text-cocoa-70')}>{o.sub}</span>}
            </button>
          );
        })}
      </div>
      {value === CUSTOMISED && (
        <input autoFocus className="field mt-md" maxLength={other.max} value={other.value} onChange={(e) => other.onChange(e.target.value)} placeholder={other.placeholder} aria-label={other.placeholder} autoComplete="off" />
      )}
    </div>
  );
}
```

`src/components/sections/custom/Upload.tsx`:

```tsx
import { useRef } from 'react';
import { MAX_PHOTOS, MAX_PHOTO_BYTES } from '../../../data/custom';
import { ACCEPTED_INPUT } from '../../../lib/image';

export type Shot = { id: string; file: File; preview: string | null };

const PREVIEWABLE = ['image/jpeg', 'image/png', 'image/webp'];

/** Adds files to the list (max 3, images only, 10 MB each) and says why anything was refused. */
export function addShots(current: Shot[], files: File[]): { shots: Shot[]; error: string } {
  const next: Shot[] = [];
  let error = '';
  for (const file of files) {
    if (current.length + next.length >= MAX_PHOTOS) {
      error = `Up to ${MAX_PHOTOS} photos.`;
      break;
    }
    const name = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || name.endsWith('.heic') || name.endsWith('.heif');
    if (!isImage) {
      error = 'JPG, PNG or HEIC photos only.';
      continue;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      error = 'Each photo must be under 10 MB.';
      continue;
    }
    next.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file, preview: PREVIEWABLE.includes(file.type) ? URL.createObjectURL(file) : null });
  }
  return { shots: [...current, ...next].slice(0, MAX_PHOTOS), error };
}

export function Upload({ shots, error, onAdd, onRemove }: { shots: Shot[]; error: string; onAdd(files: File[]): void; onRemove(id: string): void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      className="mt-lg rounded border border-dashed border-cocoa-15 p-md"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onAdd(Array.from(e.dataTransfer.files));
      }}
    >
      <p className="t-label text-cocoa-70">Add up to {MAX_PHOTOS} inspiration photos</p>
      <div className="mt-sm flex flex-wrap items-center gap-sm">
        {shots.map((s) => (
          <div key={s.id} className="relative size-[88px] overflow-hidden rounded bg-rose">
            {s.preview ? <img src={s.preview} alt="" className="size-full object-cover" /> : <span className="t-label absolute inset-0 grid place-items-center text-cocoa">HEIC</span>}
            <button type="button" onClick={() => onRemove(s.id)} className="t-price absolute right-2xs top-2xs grid size-[28px] place-items-center rounded bg-butter text-cocoa" aria-label="Remove photo">
              ×
            </button>
          </div>
        ))}
        {shots.length < MAX_PHOTOS && (
          <button type="button" onClick={() => input.current?.click()} className="chip">
            Add photos
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept={ACCEPTED_INPUT}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Add photos"
          onChange={(e) => {
            if (e.target.files) onAdd(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
      </div>
      <p className="t-caption mt-xs text-cocoa-70">Or drop them here. JPG, PNG or HEIC, up to 10 MB each.</p>
      {error && (
        <p role="alert" className="t-caption mt-xs text-cocoa">
          {error}
        </p>
      )}
    </div>
  );
}
```

`src/components/sections/custom/Progress.tsx`:

```tsx
import { CUSTOM_STEPS, isStepDone, type CustomForm } from '../../../data/custom';
import { cn } from '../../../lib/cn';

/** Six segments: done = Cocoa, current = Cocoa 70, to do = hairline. Each jumps to its step. */
export function Progress({ step, form, earliest, onJump }: { step: number; form: CustomForm; earliest: string; onJump(i: number): void }) {
  return (
    <div className="flex items-center gap-md">
      <ol className="flex flex-1 gap-2xs" aria-label="Your progress">
        {CUSTOM_STEPS.map((s, i) => {
          const done = i !== step && isStepDone(s.id, form, earliest) && (s.id !== 'words' || i < step);
          return (
            <li key={s.id} className="flex-1">
              <button type="button" onClick={() => onJump(i)} className="block w-full py-sm" aria-label={`Step ${i + 1}: ${s.question}`} aria-current={i === step ? 'step' : undefined}>
                <span className={cn('block h-[3px] rounded-full transition-colors duration-300', i === step ? 'bg-cocoa-70' : done ? 'bg-cocoa' : 'bg-cocoa-15')} />
              </button>
            </li>
          );
        })}
      </ol>
      <span className="t-label shrink-0 text-cocoa-70">
        {step + 1} of {CUSTOM_STEPS.length}
      </span>
    </div>
  );
}
```

`src/components/sections/custom/Ticket.tsx`:

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { CONTACT } from '../../../data/content';
import { customSummary, ticketImage, type CustomForm, type StepId } from '../../../data/custom';
import { aed, prettyDate } from '../../../lib/format';
import { Button } from '../../ui/Button';
import { Photo } from '../../ui/Photo';

type Props = { form: CustomForm; price: number; left: number; busy: boolean; note: string; emailHref: string; onSend(): void; onEdit(step: StepId): void };

/** "Your cake": the look's photo, the answers (each jumps back to its step), the from-price and the Claret send. */
export function Ticket({ form, price, left, busy, note, emailHref, onSend, onEdit }: Props) {
  const image = ticketImage(form);
  return (
    <div className="rounded border border-cocoa-15 bg-butter p-md">
      <div className="relative overflow-hidden rounded">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={image.src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <Photo media={image} ratio="4 / 3" sizes="440px" />
          </motion.div>
        </AnimatePresence>
      </div>
      <h3 className="t-title3 mt-md">Your cake</h3>
      <ul className="mt-sm border-t border-cocoa-15">
        {customSummary(form).map((r) => (
          <li key={r.step} className="border-b border-cocoa-15">
            <button type="button" onClick={() => onEdit(r.step)} className="flex w-full items-baseline justify-between gap-md py-xs text-left transition-colors hover:bg-cocoa/4">
              <span className="t-label text-cocoa-70">
                <span className="sr-only">Change </span>
                {r.label}
              </span>
              <span className="t-callout min-w-0 truncate text-right">{r.step === 'date' && r.value ? prettyDate(r.value) : r.value || '—'}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="t-price mt-md text-[1.2rem]">From {aed(price)}</p>
      <p className="t-caption mt-2xs text-cocoa-70">Final price on WhatsApp. A 50% deposit books your date.</p>
      <Button variant="claret" className="mt-md w-full" onClick={onSend} disabled={busy || left > 0}>
        {busy ? 'Uploading photos…' : left > 0 ? `Answer ${left} more` : 'Send on WhatsApp'}
      </Button>
      <a href={emailHref} className="t-callout link mt-sm block text-center">
        or email {CONTACT.email}
      </a>
      {note && (
        <p className="t-caption mt-sm text-cocoa-70" aria-live="polite">
          {note}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Create `src/components/sections/custom/CustomCake.tsx`**

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CUSTOMISED,
  CUSTOM_STEPS,
  EMPTY_CUSTOM,
  FLAVOURS,
  IDEA_MAX,
  LOOKS,
  OCCASIONS,
  OTHER_MAX,
  SIZES,
  WORDS_MAX,
  customAnswers,
  customFromPrice,
  customSummary,
  earliestCustomDate,
  isStepDone,
  remaining,
  validateCustom,
  type CustomForm,
  type StepId,
} from '../../../data/custom';
import { recordEnquiry, uploadInspiration } from '../../../lib/api';
import { cn } from '../../../lib/cn';
import { aed, prettyDate } from '../../../lib/format';
import { ease } from '../../../lib/motion';
import { customCakeMessage, mailtoLink, whatsappLink } from '../../../lib/order';
import { useCart } from '../../../store/cart';
import { Button } from '../../ui/Button';
import { Heading } from '../../ui/Heading';
import { Options } from './Options';
import { Progress } from './Progress';
import { Ticket } from './Ticket';
import { Upload, addShots, type Shot } from './Upload';

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -24 }),
};

type PickKey = 'occasion' | 'serves' | 'look' | 'flavour';
type OtherKey = 'occasionOther' | 'servesOther' | 'lookOther' | 'flavourOther';

export function CustomCake() {
  const { count } = useCart();
  const [form, setForm] = useState<CustomForm>(EMPTY_CUSTOM);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [shots, setShots] = useState<Shot[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const earliest = useMemo(() => earliestCustomDate(), []);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const timer = useRef(0);
  const shotsRef = useRef(shots);
  shotsRef.current = shots;

  const current = CUSTOM_STEPS[step];
  const left = remaining(form, earliest);
  const price = customFromPrice(form);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      shotsRef.current.forEach((s) => s.preview && URL.revokeObjectURL(s.preview));
    },
    [],
  );
  useEffect(() => {
    if (moved.current) heading.current?.focus({ preventScroll: true });
  }, [step]);

  const set = <K extends keyof CustomForm>(k: K, v: CustomForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setNote('');
  };

  const go = (to: number) => {
    if (to < 0 || to >= CUSTOM_STEPS.length || to === step) return;
    window.clearTimeout(timer.current);
    setDir(to > step ? 1 : -1);
    moved.current = true;
    setStep(to);
  };

  const pick = (k: PickKey, id: string) => {
    set(k, id);
    window.clearTimeout(timer.current);
    if (id !== CUSTOMISED) timer.current = window.setTimeout(() => go(step + 1), 250);
  };

  const other = (k: OtherKey, placeholder: string, max = OTHER_MAX) => ({ value: form[k], onChange: (v: string) => set(k, v), placeholder, max });

  const onAdd = (files: File[]) => {
    const r = addShots(shots, files);
    setShots(r.shots);
    setPhotoError(r.error);
  };
  const onRemove = (id: string) => {
    setShots((list) => {
      const gone = list.find((s) => s.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return list.filter((s) => s.id !== id);
    });
    setPhotoError('');
  };

  const send = async () => {
    if (Object.keys(validateCustom(form, earliest)).length) {
      const first = CUSTOM_STEPS.findIndex((s) => !isStepDone(s.id, form, earliest));
      if (first >= 0) go(first);
      setNote('One answer is missing. We took you to it.');
      return;
    }
    // Open the tab inside the click, fill it after the upload — Safari blocks window.open after an await.
    let popup: Window | null = null;
    if (shots.length) {
      popup = window.open('', '_blank');
      if (popup) popup.opener = null;
      setBusy(true);
    }
    let urls: string[] = [];
    let unsent = 0;
    if (shots.length) {
      try {
        urls = await uploadInspiration(shots.map((s) => s.file));
      } catch {
        unsent = shots.length;
      }
    }
    const message = customCakeMessage(form, urls, unsent);
    const link = whatsappLink(message);
    recordEnquiry({ kind: 'custom', answers: customAnswers(form), fromPrice: price, photos: urls, message });
    if (popup) popup.location.href = link;
    else if (shots.length) window.location.assign(link);
    else window.open(link, '_blank', 'noopener,noreferrer');
    setBusy(false);
    setNote(unsent ? 'The photos did not upload. Please attach them in WhatsApp.' : 'Your message is ready in WhatsApp.');
  };

  const body = () => {
    switch (current.id) {
      case 'occasion':
        return <Options label={current.question} options={OCCASIONS} value={form.occasion} onPick={(id) => pick('occasion', id)} other={other('occasionOther', 'Tell us the occasion')} />;
      case 'serves':
        return <Options label={current.question} options={SIZES} value={form.serves} onPick={(id) => pick('serves', id)} other={other('servesOther', 'Tell us how many people')} />;
      case 'look':
        return (
          <>
            <Options label={current.question} options={LOOKS} value={form.look} onPick={(id) => pick('look', id)} other={other('lookOther', 'Describe your idea', IDEA_MAX)} withImages />
            <Upload shots={shots} error={photoError} onAdd={onAdd} onRemove={onRemove} />
          </>
        );
      case 'flavour':
        return (
          <>
            <Options label={current.question} options={FLAVOURS} value={form.flavour} onPick={(id) => pick('flavour', id)} other={other('flavourOther', 'Tell us the flavour')} />
            <p className="t-caption mt-sm text-cocoa-70">A custom flavour adds AED 60.</p>
          </>
        );
      case 'words':
        return (
          <div>
            <input className="field" maxLength={WORDS_MAX} value={form.words} disabled={form.noWords} onChange={(e) => set('words', e.target.value)} placeholder="For example: Happy 60th, Dad" aria-label="Words on the cake" autoComplete="off" />
            <div className="mt-sm flex items-center justify-between gap-md">
              <button
                type="button"
                aria-pressed={form.noWords}
                onClick={() => {
                  const on = !form.noWords;
                  set('noWords', on);
                  if (on) set('words', '');
                }}
                className={cn('chip', form.noWords && 'chip-on')}
              >
                No words
              </button>
              <span className="t-price-sm text-cocoa-70" aria-live="polite">
                {form.words.length}/{WORDS_MAX}
              </span>
            </div>
          </div>
        );
      case 'date':
        return (
          <div>
            <input type="date" className="field max-w-[18rem]" min={earliest} value={form.date} onChange={(e) => set('date', e.target.value)} aria-label="Date of the celebration" />
            <p className="t-caption mt-sm text-cocoa-70">We need a week for custom cakes. We make only two a week, so book early.</p>
            {form.date !== '' && form.date < earliest && (
              <p role="alert" className="t-caption mt-xs text-cocoa">
                The earliest date is {prettyDate(earliest)}.
              </p>
            )}
          </div>
        );
    }
  };

  const strip = [`From ${aed(price)}`, customSummary(form)[0].value, SIZES.find((s) => s.id === form.serves)?.size].filter(Boolean).join(' · ');
  const edit = (s: StepId) => go(CUSTOM_STEPS.findIndex((x) => x.id === s));

  return (
    <section id="custom" className="section-more bg-rose" aria-labelledby="custom-title">
      <div className="container-x">
        <Heading id="custom-title" tone="rose" label="Custom cakes" title="Design your cake." oneliner="Six quick questions. We reply on WhatsApp with the price." />

        <div className="mt-xl grid gap-xl lg:grid-cols-12 lg:gap-2xl">
          <div className="rounded border border-cocoa-15 bg-butter p-md md:p-xl lg:col-span-7">
            <Progress step={step} form={form} earliest={earliest} onJump={go} />
            <p className="sr-only" aria-live="polite">
              Step {step + 1} of {CUSTOM_STEPS.length}
            </p>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={current.id} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: ease.out }}>
                <h3 ref={heading} tabIndex={-1} className="t-title2 mt-lg outline-none">
                  {current.question}
                </h3>
                <div className="mt-lg">{body()}</div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-xl flex items-center justify-between gap-md border-t border-cocoa-15 pt-md">
              <button type="button" onClick={() => go(step - 1)} className={cn('t-label link py-sm', step === 0 && 'invisible')}>
                ← Back
              </button>
              {step < CUSTOM_STEPS.length - 1 ? (
                <Button variant="cocoa" onClick={() => go(step + 1)} disabled={!isStepDone(current.id, form, earliest)}>
                  Next
                </Button>
              ) : (
                <span className="t-label text-cocoa-70">{left > 0 ? `${left} left to answer` : 'All answered'}</span>
              )}
            </div>
          </div>

          <aside className="hidden lg:col-span-5 lg:block" aria-label="Your cake">
            <div className="sticky top-[calc(76px+var(--spacing-lg))]">
              <Ticket form={form} price={price} left={left} busy={busy} note={note} emailHref={mailtoLink('Custom cake', customCakeMessage(form))} onSend={send} onEdit={edit} />
            </div>
          </aside>
        </div>

        {/* Below 1024 px the ticket becomes a bar pinned to the bottom of the section. */}
        <div className={cn('sticky z-30 -mx-md mt-xl border-t border-cocoa-15 bg-butter/95 px-md pt-sm pb-safe backdrop-blur-[8px] lg:hidden', count > 0 ? 'bottom-[72px] md:bottom-0' : 'bottom-0')}>
          <div className="flex items-center gap-md">
            <p className="t-price min-w-0 flex-1 truncate">{left > 0 ? `Step ${step + 1} of ${CUSTOM_STEPS.length} · From ${aed(price)}` : strip}</p>
            <Button variant="claret" className="shrink-0" onClick={send} disabled={busy || left > 0}>
              {busy ? 'Uploading…' : 'Send'}
            </Button>
          </div>
          {note && (
            <p className="t-caption mt-xs text-cocoa-70" aria-live="polite">
              {note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Swap the section** — delete `src/components/sections/CustomCake.tsx`; in `src/App.tsx` change the import to `import { CustomCake } from './components/sections/custom/CustomCake';`.

- [ ] **Step 10: Verify**

Run: `npm test && npm run build` → all pass.
In the dev server at 1440 px: pick Birthday → the step slides to "How many people?" after a beat; pick Customised → a text box opens with focus; type "About 40 people" → Next enables; the ticket rows fill and the price updates; on "Pick a look" the four cards show photos; the ticket photo crossfades when a look is picked. At 390 px the bottom bar shows "Step 1 of 6 · From AED 300" and a disabled Send. Keyboard only: Tab reaches each option card, Enter picks, focus lands on the next question.

- [ ] **Step 11: Commit**

```bash
git add -A src/data/custom.ts src/data/custom.test.ts src/lib/order.ts src/lib/order.test.ts worker/enquiries.ts worker/enquiries.test.ts src/components/sections src/App.tsx
git commit -m "feat: custom cake stepper — three choices plus Customised, live ticket, one week notice

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: How it works

**Files:**
- Modify: `src/data/content.ts` (add `STEPS`)
- Create: `src/components/sections/HowItWorks.tsx`
- Modify: `src/App.tsx` (render after `<CustomCake />`)

**Interfaces:**
- Consumes: `media.how` (Task 3); `Heading`, `Frame`, `Photo`, `Rise` (Task 6); `useIsWide` (Task 6).
- Produces: `STEPS: { n: string; title: string; text: string; image: Media }[]`.

- [ ] **Step 1: Add the steps** — in `src/data/content.ts` change the media import to `import { LOG_MEDIA, media, type Media } from './media';` and add:

```ts
export type Step = { n: string; title: string; text: string; image: Media };

export const STEPS: Step[] = [
  { n: '01', title: 'Pick your cake', text: 'Choose one of the Six, or design your own.', image: media.how[0] },
  { n: '02', title: 'Choose a day', text: 'We bake to order. The Six need 24 hours, custom cakes a week.', image: media.how[1] },
  { n: '03', title: 'We bring it chilled', text: 'In an insulated box, anywhere in Dubai. Or collect it from us.', image: media.how[2] },
];
```

- [ ] **Step 2: Create `src/components/sections/HowItWorks.tsx`**

```tsx
import { motion } from 'motion/react';
import { STEPS } from '../../data/content';
import { useIsWide } from '../../lib/hooks';
import { ease } from '../../lib/motion';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Photo } from '../ui/Photo';
import { Rise } from '../ui/Rise';

const TILTS = [-2, 1.5, -1];

/** A hand-drawn arrow that draws itself once it scrolls into view. */
function Arrow() {
  return (
    <svg viewBox="0 0 120 40" className="h-[32px] w-[96px] text-cocoa-70" fill="none" aria-hidden>
      <motion.path
        d="M4 28 C 30 6, 70 6, 104 20 M 94 10 L 106 21 L 92 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.4, ease: ease.smooth }}
      />
    </svg>
  );
}

export function HowItWorks() {
  const wide = useIsWide();
  return (
    <section id="how" className="section-more" aria-labelledby="how-title">
      <div className="container-x">
        <Heading id="how-title" label="How it works" title="How ordering works." align="center" />
        {wide ? (
          <ol className="mt-2xl grid grid-cols-3 gap-xl">
            {STEPS.map((s, i) => (
              <Rise as="li" key={s.n} delay={i * 0.15} className="relative">
                <Frame caption={`Step ${i + 1}`} tilt={TILTS[i]}>
                  <Photo media={s.image} ratio="4 / 3" sizes="380px" />
                </Frame>
                <div className="mt-lg flex items-baseline gap-sm">
                  <span className="font-label text-[2.618rem] leading-none text-claret">{s.n}</span>
                  <h3 className="t-title3">{s.title}</h3>
                </div>
                <p className="t-callout mt-xs text-cocoa-70">{s.text}</p>
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-xl top-1/3 z-10">
                    <Arrow />
                  </div>
                )}
              </Rise>
            ))}
          </ol>
        ) : (
          <ol className="mt-xl">
            {STEPS.map((s, i) => (
              <li key={s.n} className="sticky pb-md" style={{ top: `${72 + i * 18}px` }}>
                <motion.div
                  className="overflow-hidden rounded border border-cocoa-15 bg-butter shadow-frame"
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.7, ease: ease.out }}
                >
                  <Photo media={s.image} ratio="16 / 10" className="rounded-none!" sizes="100vw" />
                  <div className="flex items-start gap-md p-md">
                    <span className="font-label text-[2.058rem] leading-none text-claret">{s.n}</span>
                    <div>
                      <h3 className="t-heading">{s.title}</h3>
                      <p className="t-callout mt-2xs text-cocoa-70">{s.text}</p>
                    </div>
                  </div>
                </motion.div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Render it** — in `src/App.tsx`, import `HowItWorks` and add `<HowItWorks />` after `<CustomCake />`.

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build` → pass. Screenshots: three tilted framed photos with Claret numbers and arrows on desktop; stacked sticky cards on the phone.

```bash
git add src/data/content.ts src/components/sections/HowItWorks.tsx src/App.tsx
git commit -m "feat: How it works — three framed steps with drawn arrows, sticky stack on phones

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Gift boxes, workshops, company events, Udora and the quote sheet

**Files:**
- Create: `src/components/sections/GiftBoxes.tsx`, `Workshops.tsx`, `CompanyEvents.tsx`, `Udora.tsx`, `src/components/shop/QuoteSheet.tsx`
- Create: `supabase/migrations/20260927140000_enquiries_event.sql`
- Modify: `src/store/ui.tsx`, `src/lib/api.ts`, `src/components/shop/Overlays.tsx`, `src/App.tsx`
- Modify: `src/data/content.ts`, `src/data/content.test.ts`, `src/lib/order.ts`, `src/lib/order.test.ts`
- Delete: `src/components/sections/Companies.tsx`

**Interfaces:**
- Consumes: `BOX`, `WORKSHOP`, `EVENTS`, `QUOTE_INFO`, `isQuoteAbout`, `upcomingDeadlines`, `deadlineLine` (Task 5); `EMPTY_QUOTE`, `validateQuote`, `earliestQuoteDate`, `quoteAnswers` (Task 5); `quoteMessage`, `mailtoLink`, `whatsappLink` (Tasks 2, 5); `TextField`, `ChoiceField`, `Heading`, `Parallax`, `Frame`, `Rise` (Task 6).
- Produces: overlay `{ kind: 'quote'; about: QuoteAbout; format?: 'session' | 'table' }`; `<QuoteSheet />`; `useQuoteFromUrl()`; `EnquiryBody` company variant `{ kind: 'company'; about: string | null; answers?: Record<string, string>; message: string }`.

- [ ] **Step 1: Widen the overlay and enquiry types**

`src/store/ui.tsx`: add `import type { QuoteAbout } from '../data/companies';` and add this member to the `Overlay` union:

```ts
  | { kind: 'quote'; about: QuoteAbout; format?: 'session' | 'table' }
```

`src/lib/api.ts`: change the company variant of `EnquiryBody` to:

```ts
  | { kind: 'company'; about: string | null; answers?: Record<string, string>; message: string };
```

- [ ] **Step 2: Create `src/components/shop/QuoteSheet.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { BOX, EVENTS, QUOTE_INFO, WORKSHOP, isQuoteAbout, type QuoteAbout } from '../../data/companies';
import { EMPTY_QUOTE, earliestQuoteDate, quoteAnswers, validateQuote, type QuoteErrors, type QuoteForm } from '../../data/quote';
import { recordEnquiry } from '../../lib/api';
import { mailtoLink, quoteMessage, whatsappLink } from '../../lib/order';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { ChoiceField, TextField } from '../ui/Field';
import { Sheet } from '../ui/Sheet';

type Format = QuoteForm['format'];

function QuoteBody({ about, format }: { about: QuoteAbout; format?: Format }) {
  const [form, setForm] = useState<QuoteForm>({ ...EMPTY_QUOTE, format: format ?? '' });
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [note, setNote] = useState('');
  const info = QUOTE_INFO[about];

  const set = <K extends keyof QuoteForm>(k: K, v: QuoteForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setNote('');
  };

  const submit = (via: 'whatsapp' | 'email') => {
    const e = validateQuote(about, form);
    setErrors(e);
    if (Object.keys(e).length) {
      setNote('Please check the marked answers.');
      return;
    }
    const message = quoteMessage(about, form);
    recordEnquiry({ kind: 'company', about, answers: quoteAnswers(form), message });
    if (via === 'whatsapp') {
      window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
      setNote('Your message is ready in WhatsApp.');
    } else {
      window.location.href = mailtoLink(`${info.subject} quote`, message);
      setNote('Your email is ready to send.');
    }
  };

  return (
    <div className="px-md py-lg md:px-lg">
      <p className="t-price">{info.price}</p>
      <p className="t-label mt-xs text-cocoa-70">{info.facts.join(' · ')}</p>
      <div className="mt-xl space-y-lg">
        {about === 'event' && (
          <ChoiceField label="Which one?" value={form.format} options={EVENTS.formats.map((f) => ({ id: f.id, label: f.title }))} onChange={(v) => set('format', v as Format)} error={errors.format} />
        )}
        {about === 'box' && (
          <ChoiceField label="Box size" value={form.boxSize} options={BOX.sizes.map((s) => ({ id: s.id, label: `${s.pieces} pieces · AED ${s.price}` }))} onChange={(v) => set('boxSize', v)} error={errors.boxSize} />
        )}
        {about === 'box' && (
          <ChoiceField
            label="Your logo on the sleeve?"
            value={form.logo}
            options={[
              { id: 'yes', label: `Yes · ${BOX.minBranded}+ boxes` },
              { id: 'no', label: 'No' },
            ]}
            onChange={(v) => set('logo', v as QuoteForm['logo'])}
            error={errors.logo}
          />
        )}
        {about === 'workshop' && (
          <ChoiceField label="Where?" value={form.where} options={WORKSHOP.places.map((p) => ({ id: p.id, label: p.label }))} onChange={(v) => set('where', v as QuoteForm['where'])} error={errors.where} />
        )}
        <TextField label={about === 'box' ? 'How many boxes?' : 'How many people?'} inputMode="numeric" value={form.qty} onChange={(e) => set('qty', e.target.value)} error={errors.qty} autoComplete="off" />
        <TextField label={about === 'box' ? 'Deliver by' : 'Date'} type="date" min={earliestQuoteDate(about, form)} value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} />
        {about === 'event' && <TextField label="Office area" placeholder="For example: DIFC" value={form.area} onChange={(e) => set('area', e.target.value)} error={errors.area} autoComplete="off" />}
        <TextField label={about === 'workshop' ? 'Group name (optional)' : 'Company (optional)'} value={form.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" />
        <TextField label="Your name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoComplete="name" />
      </div>
      <div className="mt-xl flex flex-col gap-sm">
        <Button variant="claret" onClick={() => submit('whatsapp')}>
          Send on WhatsApp
        </Button>
        <Button variant="ghost" onClick={() => submit('email')}>
          Email instead
        </Button>
        {note && (
          <p className="t-caption text-cocoa-70" aria-live="polite">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

export function QuoteSheet() {
  const { overlay, close } = useUI();
  const q = overlay?.kind === 'quote' ? overlay : null;
  return (
    <Sheet open={q !== null} onClose={close} title={q ? `${QUOTE_INFO[q.about].name} · get a quote` : 'Get a quote'}>
      {q && <QuoteBody key={`${q.about}-${q.format ?? ''}`} about={q.about} format={q.format} />}
    </Sheet>
  );
}

/** `?about=box|workshop|event|table` opens the matching quote sheet — Instagram bio links use it. */
export function useQuoteFromUrl() {
  const { open } = useUI();
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('about');
    if (!v) return;
    const t = window.setTimeout(() => {
      if (v === 'table') open({ kind: 'quote', about: 'event', format: 'table' });
      else if (isQuoteAbout(v)) open({ kind: 'quote', about: v });
    }, 400);
    return () => window.clearTimeout(t);
  }, [open]);
}
```

In `src/components/shop/Overlays.tsx`, import `{ QuoteSheet, useQuoteFromUrl }` from `./QuoteSheet`, call `useQuoteFromUrl();` after `useStripeReturn();`, and render `<QuoteSheet />` after `<SuccessOverlay />`.

- [ ] **Step 3: Create the four sections**

`src/components/sections/GiftBoxes.tsx`:

```tsx
import { BOX, deadlineLine, upcomingDeadlines } from '../../data/companies';
import { CONTACT } from '../../data/content';
import { media } from '../../data/media';
import { mailtoLink } from '../../lib/order';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Parallax } from '../ui/Parallax';
import { Photo } from '../ui/Photo';

/** The Box, on Cocoa. No Claret here: never Claret on Cocoa. */
export function GiftBoxes() {
  const { open } = useUI();
  const deadlines = upcomingDeadlines();
  return (
    <section id="gift-boxes" className="section-more relative overflow-clip bg-cocoa text-butter" aria-labelledby="box-title">
      <span id="companies" className="absolute top-0" aria-hidden />
      <div className="container-x grid items-center gap-2xl lg:grid-cols-12">
        <div className="relative pb-xl lg:col-span-5 lg:pb-0">
          <Parallax offset={24}>
            <Photo media={media.box.open} sizes="(min-width: 1024px) 480px, 90vw" />
          </Parallax>
          <Parallax offset={70} rotate={3} className="absolute -bottom-md -right-sm w-[46%] max-w-[240px] lg:-right-xl">
            <Frame>
              <Photo media={media.box.stack} sizes="240px" />
            </Frame>
          </Parallax>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Heading id="box-title" tone="cocoa" label="For companies · 1 of 3" title="The Box." oneliner="Gift boxes for your team and your clients." />
          <p className="t-body mt-lg max-w-[52ch]">Brownies and cookies, packed by hand in our box with a sleeve and a hand-written card. Add your logo to the sleeve from 50 boxes.</p>
          <ul className="mt-lg border-t border-butter/15">
            {BOX.sizes.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between border-b border-butter/15 py-sm">
                <span className="t-label">{s.pieces} pieces</span>
                <span className="t-price">AED {s.price}</span>
              </li>
            ))}
          </ul>
          <p className="t-label mt-md text-butter-60">{BOX.facts.join(' · ')}</p>
          {deadlines.length > 0 && (
            <div className="mt-lg">
              <p className="t-label text-butter-60">Order by</p>
              <ul className="mt-xs space-y-2xs">
                {deadlines.map((d) => (
                  <li key={d.label} className="t-callout">
                    {deadlineLine(d)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-xl flex flex-wrap items-center gap-md">
            <Button variant="butter" onClick={() => open({ kind: 'quote', about: 'box' })}>
              Get a quote
            </Button>
            <a href={mailtoLink('Gift boxes quote')} className="t-body link text-butter">
              or email {CONTACT.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

`src/components/sections/Workshops.tsx`:

```tsx
import { WORKSHOP } from '../../data/companies';
import { media } from '../../data/media';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Parallax } from '../ui/Parallax';
import { Photo } from '../ui/Photo';

export function Workshops() {
  const { open } = useUI();
  return (
    <section id="workshops" className="section-more overflow-clip" aria-labelledby="workshops-title">
      <div className="container-x grid items-center gap-2xl lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Heading id="workshops-title" label="For groups · 2 of 3" title="Make one with us." oneliner="A 90-minute cake decorating workshop for your group." />
          <p className="t-body mt-lg max-w-[52ch]">We bring the cakes, the tools and the know-how. Everyone decorates their own cake and takes it home. For clubs, community groups, co-working spaces and parties.</p>
          <ul className="mt-lg border-t border-cocoa-15">
            {WORKSHOP.places.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-md border-b border-cocoa-15 py-sm">
                <span className="t-label">{p.label}</span>
                <span className="t-price">From AED {p.from} a seat</span>
              </li>
            ))}
          </ul>
          <p className="t-label mt-md text-cocoa-70">{WORKSHOP.facts.join(' · ')}</p>
          <Button variant="claret" className="mt-xl" onClick={() => open({ kind: 'quote', about: 'workshop' })}>
            Get a quote
          </Button>
        </div>
        <div className="relative pb-xl lg:col-span-5 lg:col-start-8 lg:pb-0">
          <Parallax offset={24} rotate={2}>
            <Frame>
              <Photo media={media.workshop.table} sizes="(min-width: 1024px) 440px, 90vw" />
            </Frame>
          </Parallax>
          <Parallax offset={70} rotate={-4} className="absolute -bottom-md -left-sm w-[44%] max-w-[220px]">
            <Frame>
              <Photo media={media.workshop.piping} sizes="220px" />
            </Frame>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
```

`src/components/sections/CompanyEvents.tsx`:

```tsx
import { EVENTS } from '../../data/companies';
import { CONTACT } from '../../data/content';
import { mailtoLink } from '../../lib/order';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';
import { Photo } from '../ui/Photo';
import { Rise } from '../ui/Rise';

export function CompanyEvents() {
  const { open } = useUI();
  return (
    <section id="events" className="section-more bg-rose" aria-labelledby="events-title">
      <div className="container-x">
        <Heading id="events-title" tone="rose" label="For companies · 3 of 3" title="Team events and dessert tables." oneliner="In your office, on your date. Invoiced." />
        <ul className="mt-xl grid gap-lg md:grid-cols-2">
          {EVENTS.formats.map((f, i) => (
            <Rise as="li" key={f.id} delay={i * 0.1}>
              <article className="flex h-full flex-col overflow-hidden rounded border border-cocoa-15 bg-butter">
                <Photo media={f.image} ratio="3 / 2" zoom className="rounded-none!" sizes="(min-width: 768px) 45vw, 92vw" />
                <div className="flex flex-1 flex-col p-lg">
                  <h3 className="t-title3">{f.title}</h3>
                  <p className="t-body mt-sm text-cocoa-70">{f.text}</p>
                  <p className="t-price mt-auto pt-md">{f.price}</p>
                </div>
              </article>
            </Rise>
          ))}
        </ul>
        <p className="t-label mt-lg text-cocoa">{EVENTS.facts.join(' · ')}</p>
        <div className="mt-xl flex flex-wrap items-center gap-md">
          <Button variant="claret" onClick={() => open({ kind: 'quote', about: 'event' })}>
            Get a quote
          </Button>
          <a href={mailtoLink('Company event quote')} className="t-body link">
            or email {CONTACT.email}
          </a>
        </div>
      </div>
    </section>
  );
}
```

`src/components/sections/Udora.tsx`:

```tsx
import { CONTACT } from '../../data/content';
import { ButtonLink } from '../ui/Button';

/** Gift buyers can also find us on Udora. "Coming soon" until CONTACT.udora has the shop link. */
export function Udora() {
  return (
    <section id="udora" className="section-default" aria-label="Udora">
      <div className="container-x">
        <div className="flex flex-col items-start gap-md border-y border-cocoa-15 py-lg md:flex-row md:items-center md:gap-lg">
          <img src="/brand/berrybrown-circle-rose.svg" alt="" width={200} height={200} className="size-[48px] shrink-0" />
          <p className="t-body flex-1">Sending a cake as a gift? Our bento cakes and 5-inch cakes are also on Udora.</p>
          {CONTACT.udora ? (
            <ButtonLink variant="ghost" href={CONTACT.udora} target="_blank" rel="noopener noreferrer">
              Shop on Udora
            </ButtonLink>
          ) : (
            <span className="t-label text-cocoa-70">Coming soon to Udora</span>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Swap the page parts** — delete `src/components/sections/Companies.tsx`. In `src/App.tsx` replace `<Companies />` and its import with `<GiftBoxes />`, `<Workshops />`, `<CompanyEvents />`, `<Udora />` (in that order, after `<HowItWorks />`).

- [ ] **Step 5: Remove the old company data**

- `src/data/content.ts`: delete `OfferId`, `Offer`, `OFFERS`, `isOfferId`, `Deadline`, `DEADLINES`, `localIso`, `upcomingDeadlines`, `shortDate`.
- `src/data/content.test.ts`: delete the test `hides deadlines that have passed` and remove `upcomingDeadlines` from the import.
- `src/lib/order.ts`: delete `enquiryMessage` and the `OFFERS, type OfferId` import (keep `CONTACT`).
- `src/lib/order.test.ts`: delete the `describe('enquiryMessage', …)` block and remove `enquiryMessage` from the import.

- [ ] **Step 6: Write and apply the migration** — `supabase/migrations/20260927140000_enquiries_event.sql`

```sql
-- Company quotes gain 'event' (office decorating sessions and The Table).
-- 'table' stays valid for rows saved before 27 Sep 2026.
alter table public.enquiries drop constraint if exists enquiries_about_check;
alter table public.enquiries add constraint enquiries_about_check check (about in ('box', 'workshop', 'table', 'event'));
```

Apply it with the Supabase MCP tool `apply_migration` (project `ylrqmwfnelwqbychdpfb`, name `enquiries_event`, query = the file's SQL). Then confirm with `execute_sql`:

```sql
select pg_get_constraintdef(oid) from pg_constraint where conname = 'enquiries_about_check';
```

Expected: `CHECK ((about = ANY (ARRAY['box'::text, 'workshop'::text, 'table'::text, 'event'::text])))`.

- [ ] **Step 7: Verify**

Run: `npm test && npm run build` → all pass.
In the dev server: "Get a quote" in each section opens the side sheet with the right fields; sending with empty fields shows each error under its field; a valid gift-box form opens WhatsApp with "Hi Berry Brown, I'd like a quote for gift boxes."; `http://localhost:5173/?about=table` opens the event sheet with "The Table" picked; the `For companies ▾` menu links land on each section. Screenshots: Cocoa gift-box section with no Claret; Rose events section.

- [ ] **Step 8: Commit**

```bash
git add -A src supabase
git commit -m "feat: gift boxes, workshops, company events and Udora sections with a quote sheet for each

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Our studio, From our kitchen and the lightbox

**Files:**
- Modify: `src/data/content.ts` (`STATS` numbers, `GALLERY`)
- Create: `src/components/sections/Studio.tsx`, `src/components/sections/Kitchen.tsx`, `src/components/shop/Lightbox.tsx`
- Modify: `src/components/shop/Overlays.tsx`, `src/App.tsx`
- Delete: `src/components/sections/Safa.tsx`

**Interfaces:**
- Consumes: `media.studio`, `media.kitchen`, `media.six` (Task 3); `Heading`, `Parallax`, `Frame`, `Rise`, `CountUp`, `Photo` (Task 6); overlay `{ kind: 'lightbox'; index }` (existing).
- Produces: `type Stat = { value: number; suffix: string; label: string; sample: boolean }`; `STATS: Stat[]`; `type GalleryItem = { image: Media; caption: string; tall: boolean }`; `GALLERY: GalleryItem[]` (6); `<Lightbox />`.

- [ ] **Step 1: Update the data** — in `src/data/content.ts` replace `STATS` with:

```ts
export type Stat = { value: number; suffix: string; label: string; sample: boolean };

/** SAMPLE stats — they count up once in view. Saad swaps in the real ones. */
export const STATS: Stat[] = [
  { value: 12, suffix: '', label: 'years', sample: true },
  { value: 3400, suffix: '+', label: 'cakes', sample: true },
  { value: 100, suffix: '%', label: 'from scratch', sample: true },
];
```

and add:

```ts
export type GalleryItem = { image: Media; caption: string; tall: boolean };

export const GALLERY: GalleryItem[] = [
  { image: media.kitchen.layers, caption: 'Berry layers', tall: true },
  { image: media.kitchen.crumb, caption: 'The crumb', tall: false },
  { image: media.kitchen.cocoa, caption: 'Cocoa', tall: true },
  { image: media.six[1], caption: 'Pistachio kunafa', tall: true },
  { image: media.kitchen.packing, caption: 'Packed by hand', tall: false },
  { image: media.kitchen.flowers, caption: 'Fresh flowers', tall: true },
];
```

- [ ] **Step 2: Create `src/components/sections/Studio.tsx`**

```tsx
import { STATS } from '../../data/content';
import { media } from '../../data/media';
import { CountUp } from '../ui/CountUp';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Parallax } from '../ui/Parallax';
import { Photo } from '../ui/Photo';

export function Studio() {
  return (
    <section id="studio" className="section-more overflow-clip" aria-labelledby="studio-title">
      <div className="container-x grid items-center gap-2xl md:grid-cols-2">
        <div className="relative mx-auto w-full max-w-md pb-xl md:max-w-none">
          <Parallax offset={40} rotate={-2} className="relative z-10 w-[82%]">
            <Frame caption={media.studio.hands.label}>
              <Photo media={media.studio.hands} sizes="(min-width: 768px) 40vw, 80vw" />
            </Frame>
          </Parallax>
          <Parallax offset={90} rotate={3} className="absolute bottom-0 right-0 z-20 w-[44%]">
            <Frame>
              <Photo media={media.studio.berries} sizes="(min-width: 768px) 20vw, 40vw" />
            </Frame>
          </Parallax>
        </div>
        <div>
          <Heading id="studio-title" label="Our studio" title="We bake the cakes we would want at our own table." accent={['own', 'table.']} accentClassName="italic text-claret" />
          <p className="t-body mt-lg max-w-[52ch] text-cocoa-70">
            Our pastry team trained in hotel kitchens. We bake in small batches, from scratch, and finish every cake by hand. We do not make fondant characters. We do not take same-day orders. We only sell cakes we have made many times.
          </p>
          <dl className="mt-xl grid grid-cols-3 gap-md border-t border-cocoa-15 pt-lg">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="t-label mt-sm text-cocoa-70">{s.label}</dt>
                <dd className="font-label text-[2.058rem] leading-none md:text-[2.618rem]">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/sections/Kitchen.tsx`**

```tsx
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { GALLERY } from '../../data/content';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { useUI } from '../../store/ui';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Photo } from '../ui/Photo';
import { Rise } from '../ui/Rise';

export function Kitchen() {
  const { open } = useUI();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const colA = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const colB = useTransform(scrollYProgress, [0, 1], [-30, 50]);
  const tiles = GALLERY.map((g, index) => ({ ...g, index }));
  const columns = [tiles.filter((_, i) => i % 2 === 0), tiles.filter((_, i) => i % 2 === 1)];

  return (
    <section id="kitchen" ref={ref} className="section-more overflow-clip" aria-labelledby="kitchen-title">
      <div className="container-x grid gap-2xl lg:grid-cols-[360px_1fr] lg:gap-3xl">
        <div className="lg:sticky lg:top-[120px] lg:self-start">
          <Heading id="kitchen-title" label="From our kitchen" title="Real butter, real fruit, nothing rushed." />
          <Rise delay={0.2} className="mt-xl hidden lg:block">
            <Frame caption={media.kitchen.piping.label}>
              <Photo media={media.kitchen.piping} sizes="340px" />
            </Frame>
          </Rise>
        </div>
        <div className="grid grid-cols-2 gap-sm md:gap-lg">
          {columns.map((col, ci) => (
            <motion.div key={ci} className={cn('flex flex-col gap-sm md:gap-lg', ci === 1 && 'pt-xl md:pt-2xl')} style={reduce ? undefined : { y: ci === 0 ? colA : colB }}>
              {col.map((t) => (
                <Rise key={t.caption} delay={t.index * 0.05}>
                  <button type="button" onClick={() => open({ kind: 'lightbox', index: t.index })} className="group relative block w-full overflow-hidden rounded" aria-label={`Open photo: ${t.caption}`}>
                    <Photo media={t.image} ratio={t.tall ? '3 / 4' : '4 / 3'} zoom sizes="(min-width: 1024px) 400px, 45vw" />
                    <span className="t-label absolute bottom-sm left-sm translate-y-2 rounded bg-butter px-sm py-xs text-cocoa opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      {t.caption}
                    </span>
                  </button>
                </Rise>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/components/shop/Lightbox.tsx`**

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GALLERY } from '../../data/content';
import { lockScroll, unlockScroll } from '../../lib/scroll';
import { useUI } from '../../store/ui';
import { Photo } from '../ui/Photo';

/** The kitchen photos, one at a time: arrow keys, swipe, Esc; focus returns to the photo you opened. */
export function Lightbox() {
  const { overlay, close, open } = useUI();
  const index = overlay?.kind === 'lightbox' ? overlay.index : null;
  const [dir, setDir] = useState(1);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    lockScroll();
    const t = window.setTimeout(() => closeBtn.current?.focus(), 50);
    return () => {
      window.clearTimeout(t);
      unlockScroll();
      prev?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  const go = (d: 1 | -1) => {
    if (index === null) return;
    setDir(d);
    open({ kind: 'lightbox', index: (index + d + GALLERY.length) % GALLERY.length });
  };

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const item = index !== null ? GALLERY[index] : null;
  const w = item?.tall ? 3 : 4;
  const h = item?.tall ? 4 : 3;

  return createPortal(
    <AnimatePresence>
      {item && index !== null && (
        <motion.div className="fixed inset-0 z-[75] flex items-center justify-center bg-cocoa/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={item.caption} onClick={close}>
          <button ref={closeBtn} type="button" onClick={close} className="absolute right-md top-md z-10 grid size-[44px] place-items-center rounded bg-butter/10 text-butter hover:bg-butter/20" aria-label="Close">
            <X className="size-[18px]" aria-hidden />
          </button>
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.figure
              key={index}
              custom={dir}
              className="flex flex-col items-center"
              variants={{ enter: (d: number) => ({ opacity: 0, x: d * 80 }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: d * -80 }) }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) go(1);
                else if (info.offset.x > 80) go(-1);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: `min(92vw, calc(78dvh * ${w} / ${h}))` }}>
                <Photo media={item.image} ratio={`${w} / ${h}`} sizes="92vw" />
              </div>
              <figcaption className="t-label mt-sm text-butter">
                {item.caption} · {index + 1} / {GALLERY.length}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-sm top-1/2 hidden size-[48px] -translate-y-1/2 place-items-center rounded bg-butter/10 text-butter hover:bg-butter/20 md:grid"
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-[20px]" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-sm top-1/2 hidden size-[48px] -translate-y-1/2 place-items-center rounded bg-butter/10 text-butter hover:bg-butter/20 md:grid"
            aria-label="Next photo"
          >
            <ChevronRight className="size-[20px]" aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
```

In `src/components/shop/Overlays.tsx` import `Lightbox` and render `<Lightbox />` after `<QuoteSheet />`.

- [ ] **Step 5: Swap the page parts** — delete `src/components/sections/Safa.tsx`; in `src/App.tsx` replace `<Safa />` and its import with `<Studio />` and `<Kitchen />`.

- [ ] **Step 6: Verify and commit**

Run: `npm test && npm run build` → pass. Screenshots: tilted framed photos and the team headline with Claret "own table."; stats count up; two photo columns drift at different speeds; clicking a photo opens the lightbox, arrows and Esc work, focus returns.

```bash
git add -A src
git commit -m "feat: Our studio in the team voice with count-up stats; kitchen photo wall with lightbox

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Kind words and Little questions

**Files:**
- Rewrite: `src/components/sections/Reviews.tsx`, `src/components/sections/Faq.tsx`

**Interfaces:**
- Consumes: `useReviews` (existing `src/lib/live.ts`), `RATING`, `FAQS`, `media.faq`; `DriftRow`, `Heading`, `Frame`, `Photo` (Task 6); `spring`, `ease` (Task 1).

- [ ] **Step 1: Rewrite `src/components/sections/Reviews.tsx`**

```tsx
import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { RATING, type Review } from '../../data/content';
import { cn } from '../../lib/cn';
import { useReviews } from '../../lib/live';
import { DriftRow } from '../ui/DriftRow';
import { Heading } from '../ui/Heading';
import { StarIcon } from '../ui/Icons';

type Tone = 'rose' | 'butter' | 'cocoa';
const TONES: Tone[] = ['rose', 'butter', 'cocoa', 'rose'];
const BUBBLE: Record<Tone, string> = { rose: 'bg-rose text-cocoa', butter: 'border border-cocoa-15 bg-butter text-cocoa', cocoa: 'bg-cocoa text-butter' };
const MUTED: Record<Tone, string> = { rose: 'text-cocoa', butter: 'text-cocoa-70', cocoa: 'text-butter-60' };

function Bubble({ r, i }: { r: Review; i: number }) {
  const tone = TONES[i % TONES.length];
  return (
    <figure className={cn('bubble-tail relative mx-sm mb-md w-[300px] shrink-0 rounded p-lg md:w-[380px]', BUBBLE[tone])}>
      <div className="flex gap-2xs" role="img" aria-label="5 stars">
        {Array.from({ length: 5 }, (_, k) => (
          <StarIcon key={k} className="size-[14px]" />
        ))}
      </div>
      <blockquote className="t-body mt-md">“{r.text}”</blockquote>
      <figcaption className="mt-lg flex items-center gap-sm">
        <span className={cn('t-price grid size-[40px] shrink-0 place-items-center rounded-full', tone === 'cocoa' ? 'bg-butter text-cocoa' : 'bg-cocoa text-butter')}>{r.name[0]}</span>
        <span>
          <span className="t-price block">{r.name}</span>
          <span className={cn('t-caption', MUTED[tone])}>
            {r.area} · {r.cake}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Reviews() {
  const reviews = useReviews();
  const [offset] = useState(() => Math.floor(Math.random() * 5));
  const [paused, setPaused] = useState(false);
  const start = offset % reviews.length;
  const rotated = [...reviews.slice(start), ...reviews.slice(0, start)];

  return (
    <section id="reviews" className="section-more overflow-clip" aria-labelledby="reviews-title">
      <div className="container-x flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
        <Heading id="reviews-title" label="Kind words" title="Straight from the table." />
        <div className="flex items-center gap-md">
          <p className="t-callout text-cocoa-70">
            <span className="font-label text-[2.058rem] leading-none text-claret">{RATING.score}</span> from {RATING.count}+ reviews
          </p>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="grid size-[44px] place-items-center rounded border border-cocoa-15 transition-colors hover:bg-cocoa/6 motion-reduce:hidden"
            aria-label={paused ? 'Play the moving reviews' : 'Pause the moving reviews'}
            aria-pressed={paused}
          >
            {paused ? <Play className="size-[16px]" aria-hidden /> : <Pause className="size-[16px]" aria-hidden />}
          </button>
        </div>
      </div>
      <div className="mt-xl space-y-md [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <DriftRow duration={60} paused={paused}>
          {rotated.map((r, i) => (
            <Bubble key={`a-${i}`} r={r} i={i} />
          ))}
        </DriftRow>
        <div aria-hidden>
          <DriftRow duration={70} reverse paused={paused} className="hidden md:flex">
            {[...rotated].reverse().map((r, i) => (
              <Bubble key={`b-${i}`} r={r} i={i + 2} />
            ))}
          </DriftRow>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Rewrite `src/components/sections/Faq.tsx`**

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { FAQS } from '../../data/content';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { ease, spring } from '../../lib/motion';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Photo } from '../ui/Photo';

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" className="section-more" aria-labelledby="faq-title">
      <div className="container-x grid gap-2xl md:grid-cols-[0.8fr_1.2fr] md:gap-3xl">
        <div>
          <Heading id="faq-title" label="Good to know" title="Little questions." />
          <Frame caption={media.faq.label} tilt={-3} className="mt-xl hidden w-[16rem] md:block">
            <Photo media={media.faq} sizes="260px" />
          </Frame>
        </div>
        <ul className="border-y border-cocoa-15">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <li key={f.q} className="border-b border-cocoa-15 last:border-b-0">
                <h3>
                  <button
                    type="button"
                    id={`${base}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${base}-a${i}`}
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="group flex min-h-[56px] w-full items-center justify-between gap-lg py-md text-left"
                  >
                    <span className={cn('t-title3 transition-colors', isOpen ? 'text-claret' : 'group-hover:text-cocoa-70')}>{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={spring.snappy}
                      className={cn('grid size-[40px] shrink-0 place-items-center rounded-full border transition-colors', isOpen ? 'border-cocoa bg-cocoa text-butter' : 'border-cocoa-15')}
                    >
                      <Plus className="size-[16px]" aria-hidden />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${base}-a${i}`}
                      role="region"
                      aria-labelledby={`${base}-q${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: ease.out }}
                      className="overflow-hidden"
                    >
                      <p className="t-body max-w-[60ch] pb-lg pr-2xl text-cocoa-70">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm test && npm run build` → pass. In the dev server: two rows of bubbles drift in opposite directions (one row on phones); hovering stops a row; the pause button stops both; with the OS "reduce motion" setting (or `qa-shots.mjs --reduced`) the rows stand still and scroll by hand. FAQ: first question open in Claret, + turns into ×, answers slide open.

```bash
git add src/components/sections/Reviews.tsx src/components/sections/Faq.tsx
git commit -m "feat: the old drifting review bubbles and the old FAQ, in the new brand

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Closing, the folded cake log and the old footer

**Files:**
- Rewrite: `src/components/sections/Closing.tsx`, `src/components/layout/Footer.tsx`
- Create: `src/components/sections/CakeLog.tsx`
- Delete: `src/components/sections/TheLog.tsx`
- Rewrite: `src/App.tsx` (final order)

**Interfaces:**
- Consumes: `useLog` (existing), `cakeNumber`, `CONTACT`, `PHOTO_NOTE`, `media`; `SplitWords`, `Magnetic`, `Frame`, `Photo` (Task 6); `GENERAL_MESSAGE`, `whatsappLink`; `InstagramIcon`, `HeartIcon`.

- [ ] **Step 1: Rewrite `src/components/sections/Closing.tsx`**

```tsx
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { media, type Media } from '../../data/media';
import { cn } from '../../lib/cn';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Frame } from '../ui/Frame';
import { Magnetic } from '../ui/Magnetic';
import { Photo } from '../ui/Photo';
import { SplitWords } from '../ui/SplitWords';

type Card = { m: Media; cls: string; r: number; speed: number };

const CARDS: Card[] = [
  { m: media.six[0], cls: 'left-[2%] top-[4%] w-[26%] md:w-[15%]', r: -8, speed: 80 },
  { m: media.six[1], cls: 'right-[3%] top-[2%] w-[24%] md:w-[13%]', r: 7, speed: 140 },
  { m: media.six[2], cls: 'left-[7%] bottom-[4%] hidden md:block md:w-[12%]', r: 5, speed: 40 },
  { m: media.six[4], cls: 'right-[8%] bottom-[6%] hidden md:block md:w-[14%]', r: -5, speed: 110 },
];

function Floating({ card, progress }: { card: Card; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [card.speed, -card.speed]);
  return (
    <motion.div className={cn('absolute', card.cls)} style={reduce ? { rotate: card.r } : { y, rotate: card.r }} aria-hidden>
      <Frame>
        <Photo media={card.m} ratio="1 / 1" sizes="220px" />
      </Frame>
    </motion.div>
  );
}

export function Closing() {
  const { open } = useUI();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  return (
    <section ref={ref} className="section-most relative overflow-clip" aria-labelledby="closing-title">
      {CARDS.map((c) => (
        <Floating key={c.m.src} card={c} progress={scrollYProgress} />
      ))}
      <div className="container-x relative flex flex-col items-center pt-2xl text-center md:pt-0">
        <p className="t-label text-cocoa-70">Your next celebration starts here</p>
        <h2 id="closing-title" className="t-display1 mt-md max-w-[14ch]">
          <SplitWords text="Let's bake something lovely." accent={['lovely.']} />
        </h2>
        <Magnetic className="mt-xl inline-block">
          <Button variant="claret" onClick={() => open({ kind: 'menu' })}>
            Order a cake
          </Button>
        </Magnetic>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/sections/CakeLog.tsx`**

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cakeNumber } from '../../data/content';
import { cn } from '../../lib/cn';
import { useLog } from '../../lib/live';
import { ease } from '../../lib/motion';
import { Photo } from '../ui/Photo';

/** The cake log, folded shut above the footer. One tap opens the newest numbered cakes. */
export function CakeLog() {
  const log = useLog();
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section id="log" className="pb-2xl" aria-labelledby={`${id}-t`}>
      <div className="container-x">
        <div className="border-y border-cocoa-15">
          <div className="flex flex-col gap-sm py-lg md:flex-row md:items-center md:gap-lg">
            <h2 id={`${id}-t`} className="t-label shrink-0 text-cocoa-70">
              The cake log
            </h2>
            <p className="t-body flex-1">
              Every cake we make gets a number. The latest is <span className="font-label text-claret">{cakeNumber(log[0].n)}</span>.
            </p>
            <button type="button" aria-expanded={open} aria-controls={`${id}-p`} onClick={() => setOpen((v) => !v)} className="btn btn-ghost self-start md:self-auto">
              {open ? 'Close the log' : 'Open the log'}
              <ChevronDown className={cn('size-[14px] transition-transform duration-300', open && 'rotate-180')} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div id={`${id}-p`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: ease.out }} className="overflow-hidden">
                <ul className="grid gap-lg pb-xl sm:grid-cols-3">
                  {log.slice(0, 3).map((l) => (
                    <li key={l.n}>
                      <figure>
                        <Photo media={l.image} sizes="(min-width: 640px) 30vw, 90vw" />
                        <figcaption className="mt-sm flex items-baseline gap-sm">
                          <span className="t-price text-claret">{cakeNumber(l.n)}</span>
                          <span className="t-caption text-cocoa-70">
                            {l.for} · {l.flavour}, {l.size}
                          </span>
                        </figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Rewrite `src/components/layout/Footer.tsx`**

```tsx
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { CONTACT, PHOTO_NOTE } from '../../data/content';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { ease } from '../../lib/motion';
import { GENERAL_MESSAGE, whatsappLink } from '../../lib/order';
import { HeartIcon, InstagramIcon } from '../ui/Icons';
import { Photo } from '../ui/Photo';

const LINE1 = ['Made', 'with', 'heart,'];
const LINE2 = ['not', 'haste.'];
const TILES = [media.kitchen.layers, media.six[0], media.kitchen.crumb, media.six[2], media.kitchen.flowers, media.six[4]];

/** True while the footer is no taller than the window — only then can it sit under the page and be uncovered. */
function useFits(ref: RefObject<HTMLElement | null>) {
  const [fits, setFits] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setFits(el.offsetHeight <= window.innerHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener('resize', check);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [ref]);
  return fits;
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="t-label text-butter-60">{title}</p>
      <div className="mt-sm flex flex-col gap-xs">{children}</div>
    </div>
  );
}

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const fits = useFits(ref);
  const reduce = useReducedMotion();
  const ig = CONTACT.instagram;

  return (
    <footer ref={ref} className={cn('relative z-0 bg-cocoa pt-3xl text-butter', fits && 'md:sticky md:bottom-0')}>
      <div className="container-x pb-[max(var(--spacing-xl),env(safe-area-inset-bottom))]">
        <h2 className="t-giant">
          <span className="block">
            {LINE1.map((w, i) => (
              <motion.span key={w} className="mr-[0.22em] inline-block" initial={reduce ? false : { y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: '-5%' }} transition={{ type: 'spring', stiffness: 120, damping: 16, delay: i * 0.08 }}>
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block italic text-rose">
            {LINE2.map((w, i) => (
              <motion.span key={w} className="mr-[0.22em] inline-block" initial={reduce ? false : { opacity: 0, filter: 'blur(10px)' }} whileInView={{ opacity: 1, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-5%' }} transition={{ duration: 0.9, delay: 0.35 + i * 0.12, ease: ease.out }}>
                {w}
              </motion.span>
            ))}
            <motion.span className="inline-block" initial={reduce ? false : { opacity: 0.6 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: 'easeOut' }} aria-hidden>
              <HeartIcon className="size-[0.5em] -translate-y-[0.1em]" />
            </motion.span>
          </span>
        </h2>

        <div className="mt-2xl grid gap-2xl lg:mt-3xl lg:grid-cols-[1.2fr_1fr]">
          <div>
            <img src="/brand/berrybrown-logo-on-dark.svg" alt="Berry Brown" width={396} height={329} className="w-[200px]" />
            {ig ? (
              <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="t-label link mt-xl inline-flex items-center gap-xs text-butter-60 hover:text-butter">
                <InstagramIcon className="size-[16px]" /> @{ig} →
              </a>
            ) : (
              <p className="t-label mt-xl text-butter-60">From the studio</p>
            )}
            <div className="mt-md grid grid-cols-3 gap-xs sm:grid-cols-6">
              {TILES.map((m, i) =>
                ig ? (
                  <a key={m.src} href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded" aria-label={`Instagram post ${i + 1}`}>
                    <Photo media={m} ratio="1 / 1" zoom sizes="120px" />
                  </a>
                ) : (
                  <div key={m.src} className="overflow-hidden rounded" aria-hidden>
                    <Photo media={m} ratio="1 / 1" zoom sizes="120px" />
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-xl sm:grid-cols-3">
            <Column title="Say hello">
              <a href={whatsappLink(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="t-callout link">
                WhatsApp {CONTACT.phoneDisplay}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="t-callout link break-all">
                {CONTACT.email}
              </a>
            </Column>
            <Column title="Find us">
              <span className="t-callout">{CONTACT.location}</span>
              <span className="t-callout">{CONTACT.hours}</span>
            </Column>
            <Column title="For companies">
              <a href="#gift-boxes" className="t-callout link">
                Gift boxes
              </a>
              <a href="#workshops" className="t-callout link">
                Workshops
              </a>
              <a href="#events" className="t-callout link">
                Company events
              </a>
            </Column>
          </div>
        </div>

        <div className="mt-2xl flex flex-col gap-xs border-t border-butter/15 pt-lg">
          <p className="t-caption text-butter-60">
            © {new Date().getFullYear()} · {CONTACT.legal}
          </p>
          <p className="t-caption text-butter-60">{PHOTO_NOTE}</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Final page order** — delete `src/components/sections/TheLog.tsx` and rewrite `src/App.tsx`:

```tsx
import { MotionConfig } from 'motion/react';
import { lazy, Suspense } from 'react';
import { DeadlineStrip } from './components/layout/DeadlineStrip';
import { Footer } from './components/layout/Footer';
import { MobileBagBar } from './components/layout/MobileBagBar';
import { Navbar } from './components/layout/Navbar';
import { ToastLayer } from './components/layout/ToastLayer';
import { WhatsAppFab } from './components/layout/WhatsAppFab';
import { CakeLog } from './components/sections/CakeLog';
import { Closing } from './components/sections/Closing';
import { CompanyEvents } from './components/sections/CompanyEvents';
import { CustomCake } from './components/sections/custom/CustomCake';
import { Faq } from './components/sections/Faq';
import { GiftBoxes } from './components/sections/GiftBoxes';
import { Hero } from './components/sections/Hero';
import { HowItWorks } from './components/sections/HowItWorks';
import { Kitchen } from './components/sections/Kitchen';
import { Reviews } from './components/sections/Reviews';
import { Studio } from './components/sections/Studio';
import { TheSix } from './components/sections/TheSix';
import { Udora } from './components/sections/Udora';
import { Workshops } from './components/sections/Workshops';
import { SprigDefs } from './components/ui/Sprig';
import { CartProvider } from './store/cart';
import { UIProvider } from './store/ui';

const Overlays = lazy(() => import('./components/shop/Overlays'));

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <UIProvider>
        <CartProvider>
          <SprigDefs />
          <a href="#main" className="btn btn-cocoa sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-md focus:z-[90]">
            Skip to content
          </a>
          <DeadlineStrip />
          <Navbar />
          <main id="main" className="relative z-10 bg-butter shadow-page">
            <Hero />
            <TheSix />
            <CustomCake />
            <HowItWorks />
            <GiftBoxes />
            <Workshops />
            <CompanyEvents />
            <Udora />
            <Studio />
            <Kitchen />
            <Reviews />
            <Faq />
            <Closing />
            <CakeLog />
            <div aria-hidden className="lace-edge absolute inset-x-0 top-full" />
          </main>
          <Footer />
          <MobileBagBar />
          <WhatsAppFab />
          <ToastLayer />
          <Suspense fallback={null}>
            <Overlays />
          </Suspense>
          <div className="grain" aria-hidden />
        </CartProvider>
      </UIProvider>
    </MotionConfig>
  );
}
```

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run build` → pass. In the dev server at 1440 × 900: scrolling to the end lifts the page off the Cocoa footer with the lace scallops along the edge; "Made with heart, not haste." springs in; the log row sits above the footer, shut, and opens with one click; closing section cards drift. At 1440 × 760 the footer is taller than the window, so it scrolls normally and its first line is visible.

```bash
git add -A src
git commit -m "feat: closing with floating photos, folded cake log, the old footer with lace edge and page lift

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Clean-up, rules and docs

**Files:**
- Delete: `src/components/ui/Reveal.tsx`, `src/components/ui/SectionHeading.tsx`
- Modify: `src/index.css` (remove the `reveal` utility and its reduced-motion line), any file still mentioning "Safa"
- Modify: `CLAUDE.md`, `AGENTS.md`, `README.md`

- [ ] **Step 1: Remove dead code**

Run: `grep -rn "Reveal\b\|SectionHeading\|mat\b" src --include=*.tsx`
Expected: no imports of `Reveal` or `SectionHeading` remain. Delete both files. In `src/index.css` delete the `@utility reveal { … }` block and the `.reveal { opacity: 1; transform: none; }` line inside the reduced-motion block. If `grep -rn "\bmat\b" src` finds no users, delete `@utility mat`.

- [ ] **Step 2: No "Safa" anywhere in the site**

Run: `grep -rn "Safa" src worker index.html`
For each hit, reword to the team or the studio (for example `products.ts`: "Names are provisional until the studio confirms the real Six."; `worker/orders.ts`: "…until the studio confirms it in Supabase."; `src/lib/checkoutRequest.ts`: "…plus what the studio needs to see in the dashboard."; `src/components/sections/custom/CustomCake.tsx` "Safari" stays — it is the browser). Re-run: only `Safari` may match.

- [ ] **Step 3: Update the rules** — in both `CLAUDE.md` and `AGENTS.md`:

Replace the "Read these before any design, CSS or copy change" list with:

```markdown
1. `docs/superpowers/specs/2026-09-27-berrybrown-lively-redesign-design.md` — the current design: page order, sections, motion, photos.
2. `docs/brand/Berry_Brown_Brand_Guidelines.md` — colours, fonts, logo rules, voice.
3. `docs/Berry_Brown_Website_Brief_v2.md` §5 — the LiftKit spacing and type maths.
```

Replace these rule lines:

```markdown
- Motion happens only on scroll, pointer or tap. One exception: the review rows drift, with a pause button. No smooth-scroll library, no marquee strip, no video, no preloader. `prefers-reduced-motion` stops all of it.
- Copy: short sentences, no exclamation marks, no "indulge / delight / treat yourself". "We", "us", "our team" — never "I", never "Chef Safa" or "Safa" on the site. Never "homemade".
- Photos are AI-made in the palette until real ones exist (`ai: true` in `src/data/media.ts`, files from `scripts/grade-photos.py`). Replace them one by one. The Rose placeholder is only the fallback for a missing file.
```

(These replace, respectively, the "Nothing moves on its own…" line, the "Copy:" line and the "Max 12 photos…" line.) Add a row to the "Where things live" table: `| Photos, prompts, grading | public/images/ai/, scripts/photo-slots.json, scripts/grade-photos.py |` and `| Company channels, deadlines, quotes | src/data/companies.ts, src/data/quote.ts |`.

- [ ] **Step 4: Update `README.md`**

- Replace every old number and email (`+971 50 947 8943`, `971509478943`, `saad@berrybrown.me`) with `+971 54 794 4882`, `971547944882`, `connect@berrybrown.me`.
- In "Editing content", add rows: company channels and deadlines → `src/data/companies.ts`; quote rules → `src/data/quote.ts`; photos → `src/data/media.ts` + `scripts/grade-photos.py`.
- In the Supabase section, add: "`enquiries.about` accepts `box`, `workshop`, `table` (old rows) and `event` since migration `20260927140000_enquiries_event.sql`; company quotes store their answers in `answers`."
- Add a section "Photos": the 31 slots, how they were made (Canva, `scripts/photo-slots.json` prompts, `grade-photos.py`), and how to replace one with a real photo (`python3 scripts/grade-photos.py <folder> --real`, then set `ai: false`).
- In "⚠️ Before launch", replace the "Twelve photo slots" row with "31 AI photos | `src/data/media.ts` (`ai: true`) | Replace with real photos from the shot list; until then the site says 'Photos show the style.'" and add rows "Udora shop link | `CONTACT.udora` | Blank shows 'Coming soon to Udora'" and "Workshop price 150 vs 100 (YAP Club) | `src/data/companies.ts` | Saad decides".

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run build` → pass. `grep -rn "Safa" src worker index.html` → only "Safari".

```bash
git add -A
git commit -m "chore: drop dead components, team voice everywhere, rules and README for the lively redesign

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: QA pass

**Files:** fixes only, wherever the checks point.

- [ ] **Step 1: Tests and build**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 2: Screenshots at three widths, normal and reduced motion**

Run `npm run dev` in the background, then:

```bash
node scripts/qa-shots.mjs http://localhost:5173/ qa-shots
node scripts/qa-shots.mjs http://localhost:5173/ qa-shots --reduced
node scripts/qa-shots.mjs http://localhost:5173/ qa-shots/short --height=760
```

Expected console for every run: `horizontal overflow 0px`; fonts `Alegreya, Jost` only.
Open the shots in order and check against spec §4 and §5: every section present and in order, photos in every slot, one Claret element per section, Cocoa section has no Claret, big logo in hero, 56 px logo in the bar, reduced-motion shots show every section fully (no half-faded content), review rows still in reduced mode, footer's first line visible in the 760 px run.

- [ ] **Step 3: Colour and copy checks**

```bash
grep -rhoE "#[0-9A-Fa-f]{6}\b" src | sort -u
grep -rn "Safa" src worker index.html
grep -rnE "wa\.me/[0-9]+" src | grep -v 971547944882
grep -rn "!" src/data/content.ts src/data/companies.ts src/data/custom.ts
```

Expected: hex list is only `#F6EEDF #3E2A21 #E7CFC6 #7A2A3A #726156 #D9D0C8` (plus `#000` in hover mixes); "Safa" only as "Safari"; no other WhatsApp number; no exclamation marks in copy.

- [ ] **Step 4: Key flows in a real browser**

With the dev server running, use Playwright (or by hand) at 1440 and 390 px:
- Custom stepper with keyboard only: Tab to an option, Enter, focus lands on the next question; Customised opens a text box; Back works; the ticket rows jump to their steps; Send opens WhatsApp with the full message (stub `window.open` in Playwright and read the URL).
- Each "Get a quote": empty submit shows errors; a valid form opens WhatsApp with the right first line; `?about=table` opens the event sheet with The Table picked.
- Top bar: hides on scroll down, returns on scroll up; `For companies ▾` opens with Enter and ArrowDown, closes with Esc and returns focus; the phone menu opens, links jump to sections.
- Cake log opens and closes with Enter; the lightbox opens, arrow keys move, Esc closes, focus returns.
- The Six: "+" adds to the bag, the bag count bumps, the bottom bag bar appears on phones and the WhatsApp button moves above it.

- [ ] **Step 5: Lighthouse (mobile)**

```bash
npm run build && (npx vite preview --port 4173 &) && sleep 2
npx -y lighthouse@12 http://localhost:4173/ --only-categories=performance,accessibility --form-factor=mobile --screenEmulation.mobile --chrome-flags="--headless=new" --output=json --output-path=qa-shots/lighthouse.json --quiet
node -e "const r=require('./qa-shots/lighthouse.json');for(const c of Object.values(r.categories))console.log(c.title, Math.round(c.score*100));console.log('CLS', r.audits['cumulative-layout-shift'].displayValue)"
```

Expected: Performance ≥ 85, Accessibility ≥ 95, CLS < 0.1. Fix what the report names (image sizes, contrast, labels), then re-run.

- [ ] **Step 6: Fix, re-check, commit**

Fix every issue found in Steps 2–5, re-run the affected checks, then:

```bash
git add -A
git commit -m "fix: QA pass — layout, contrast and motion fixes from screenshots, flows and Lighthouse

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Whole-branch review**

Request a fresh review of `main..redesign/lively` (superpowers:requesting-code-review) against the spec and this plan; fix confirmed findings; commit. Do not merge or push to `main` — report to Saad and wait for "go live".

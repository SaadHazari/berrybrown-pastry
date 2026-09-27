# Berry Brown

The website for Berry Brown, a cake studio in Dubai led by Chef Safa. *Made with heart, not haste.*

One page, eleven parts: nav · hero · design your cake · the Six · for companies and events · Chef Safa · the log · kind words · little questions · closing line · footer. The shop opens as overlays on top of it: the Six, a product sheet, the bag and a 3-step checkout. Customers **pay online with Stripe** or **send the order on WhatsApp**. Custom cakes, boxes, workshops and events always go to WhatsApp.

The design brief is `docs/Berry_Brown_Website_Brief_v2.md`. The brand rules are in `docs/brand/`. If they disagree, the brand book wins.

## Stack

- React 19, TypeScript and Vite
- Tailwind CSS v4 — all tokens live in `src/index.css` (four colours, two fonts, seven spacing steps, one radius). Numeric spacing utilities are switched off on purpose: use `p-md`, `gap-lg`, `mt-xl`… or an arbitrary value like `size-[44px]`.
- No animation library. One CSS fade on section entry (`Reveal`), one CSS slide for the sheets. Nothing else moves.
- Cloudflare Workers with static assets (`wrangler.jsonc`). The Worker (`worker/`) handles the API: `/api/checkout` (Stripe), `/api/stripe/webhook`, `/api/orders`, `/api/enquiries`, `/api/inspiration`.
- Supabase (Postgres + Storage) as the backend: orders, enquiries, the cake log, reviews, inspiration photos. Schema in `supabase/migrations/`. The Worker writes with the secret key; the page reads published cakes and reviews with the publishable key.
- Vitest for tests

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # pricing, cart, checkout, custom form, WhatsApp messages, upload helpers
npm run build     # type-checks the app and the Worker, then builds to dist/
```

`npm run dev` does not run the Worker, so **Pay online** falls back to WhatsApp, photo upload falls back to "I'll send my photos here", and nothing is saved to Supabase. To test the full site with the API, copy `.dev.vars.example` to `.dev.vars` (git-ignored), fill in the keys, then run:

```bash
npm run build
npx wrangler dev
```

## Deploying (Cloudflare Workers)

The `berrybrown-pastry` Worker is connected to this GitHub repo through Cloudflare Workers Builds:

- Pushing to **`main`** runs `npm run build` and then `npx wrangler deploy`, which publishes to **https://berrybrown.me**.
- Pushing to any other branch uploads a preview version.

### One-time setup (three secrets, one Stripe webhook)

Secrets go in with `npx wrangler login` + `npx wrangler secret put NAME`, or in the Cloudflare dashboard under Workers → berrybrown-pastry → Settings → Variables and Secrets. Until a secret is set, its feature degrades quietly: no Stripe key means checkout switches to WhatsApp; no Supabase key means nothing is saved and photo upload falls back to "I'll send my photos here".

1. **`SUPABASE_SECRET_KEY`** — Supabase dashboard → Project Settings → API keys → the `sb_secret_…` key. The project URL is already in `wrangler.jsonc`.
2. **`STRIPE_SECRET_KEY`** — `sk_test_…` first, `sk_live_…` when ready.
3. **`STRIPE_WEBHOOK_SECRET`** — in Stripe → Developers → Webhooks, add an endpoint for `https://berrybrown.me/api/stripe/webhook` with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`. Copy its signing secret (`whsec_…`). This is what marks orders **paid** in Supabase.
4. **Redirect.** Add a Cloudflare redirect rule from `barrybrown.me` to `berrybrown.me`.

### Supabase

Project `ylrqmwfnelwqbychdpfb` (region Tokyo, free plan). Free projects pause after a week without traffic; upgrade before launch or accept that the first visitor after a quiet week gets the sample content and no order log. To move to a closer region (Mumbai or Frankfurt): create the new project, run `supabase/migrations/20260927110000_init_berrybrown.sql` in its SQL editor, then change the URL and publishable key in `src/data/supabase.ts` and `wrangler.jsonc`, and re-set `SUPABASE_SECRET_KEY`.

| Table | What lands there | Who writes |
| --- | --- | --- |
| `orders` | Every order of the Six. Stripe orders arrive `pending` and become `paid` through the webhook. WhatsApp orders arrive `pending` when the customer taps send; mark them `confirmed` by hand. | Worker |
| `enquiries` | Custom-cake sends (answers, from-price, photo links, the WhatsApp text) and company enquiries | Worker |
| `uploads` | One row per inspiration photo, for the 10-per-IP-per-hour limit | Worker |
| `cakes` | **The log.** A row per cake is created automatically when an order turns `paid`. Add a photo to the `cakes` bucket, put its path in `photo_path`, tick `published`, and it appears on the site (newest three). | Trigger + Safa |
| `reviews` | Kind words. Tick `published` (with permission) and the site shows them instead of the samples. | Safa |

Storage: `inspiration` (private; links are signed for 30 days) and `cakes` (public; log photos, keep them 4:5 and under 10 MB). Row Level Security is on everywhere; the publishable key can only read published cakes and reviews.

Photo upload limits: 3 files per send, 10 MB each, JPG/PNG/WebP/HEIC (checked by file bytes), 10 photos per IP per hour.

### How online payment works

1. The browser posts the bag, delivery details and an order reference to `/api/checkout`.
2. The Worker **re-prices everything from `src/data/products.ts`**, so prices sent from the browser are never trusted. It checks the date, phone number and so on, and creates a Stripe Checkout session in AED. Delivery (AED 20, free over AED 300) is its own line item. Order details are saved in the session and payment metadata, so they appear in the Stripe dashboard.
3. The Worker also saves the order in Supabase as `pending`. When Stripe confirms payment it calls `/api/stripe/webhook`, which marks the order `paid`; the database then gives every cake in it a number in the log.
4. After paying, the customer returns to `/?order=success&ref=…`, the bag clears, and a button sends the full order to Safa on WhatsApp.
5. If the customer cancels, they return to `/?order=cancelled` and checkout reopens with the bag still there.

## Editing content

| What | Where |
| --- | --- |
| The Six: names, one-liners, flavours, allergens | `src/data/products.ts` |
| The price ladder (5" 150 · 6" 200 · 8" 280) | `PRICE_LADDER` in `src/data/products.ts` |
| Delivery fee, free-delivery threshold, time slots | `src/data/zones.ts` |
| Contact details, rating, stats, FAQ, company offers, deadlines | `src/data/content.ts` |
| The log and reviews (live) | Supabase tables `cakes` and `reviews`; samples in `src/data/content.ts` show until real rows are published |
| Supabase URL and publishable key | `src/data/supabase.ts` (page) and `wrangler.jsonc` (Worker) |
| Custom-form options and from-prices | `src/data/custom.ts` |
| **Every photo slot** (twelve, and that is the budget) | `src/data/media.ts` |
| WhatsApp message wording | `src/lib/order.ts` |
| Colours, type scale, spacing | `src/index.css` |

### Adding a real photo

Every slot in `src/data/media.ts` renders the Rose placeholder until `placeholder` is `false`. Put the file in `public/images/` with the name the slot expects (for example `bb-the-six-01.jpg`), keep it 4:5 and about 1400 px on the long edge, then set `placeholder: false`. Rules from the brand book: phone camera, window light, same plate and angle for all six, hands in frame, no retouching.

## ⚠️ Before launch — everything marked `sample: true`

| Item | File | What to do |
| --- | --- | --- |
| Names of the Six | `src/data/products.ts` (`sample: true` on each cake) | Safa confirms the six; rename, then remove the flags |
| The flat ladder 150 / 200 / 280 | `PRICE_LADDER` in `src/data/products.ts` | Saad confirms (it is a cut from the old 195/295/420) |
| Rating 4.9 · 260+ | `RATING` in `src/data/content.ts` | Replace with the real figure |
| Stats (12 years · 3,400+ cakes · 100% from scratch) | `STATS` in `src/data/content.ts` | Replace with real figures |
| Five reviews | `REVIEWS` in `src/data/content.ts` | Publish real reviews in Supabase `reviews`; the samples disappear on their own |
| The log (#041, #040, #039) | `LOG` in `src/data/content.ts` | Publish real cakes with photos in Supabase `cakes`; the samples disappear on their own |
| Instagram handle | `CONTACT.instagram` in `src/data/content.ts` | Blank hides the Follow column; fill it in |
| Studio / pickup wording | `CONTACT.location` in `src/data/content.ts` | "Dubai" is a placeholder |
| Twelve photo slots | `src/data/media.ts` | All `placeholder: true` until Safa's photos exist |
| Share image | `public/og.png` | Generated from the logo; replace with a real photo when one exists |
| "Written on" +50 | `WRITTEN_ON` in `src/data/products.ts` | Shown as a line under the Six; not yet an add-on in checkout |

## Project layout

```
worker/                     Cloudflare Worker: checkout, Stripe webhook, orders, enquiries, inspiration upload; static assets otherwise
supabase/migrations/        the database schema (tables, RLS, trigger, buckets)
wrangler.jsonc              Worker + assets config, public Supabase URL
public/brand/               logo SVGs (never type the name as a logo)
public/fonts/               Alegreya and Jost, self-hosted
src/
  index.css                 the design system: colours, type scale, spacing, controls
  App.tsx                   page order, providers, overlays
  data/                     products, zones, content, custom-form options, media slots
  lib/                      pricing, orders + WhatsApp messages, checkout validation, order rows, Stripe signature, live reads
  store/                    cart (localStorage) and UI overlay state
  components/ui/            Button, Chip, Placeholder, Photo, Reveal, Sheet, Sprig…
  components/layout/        Navbar, Footer, MobileBagBar, ToastLayer
  components/sections/      Hero, CustomCake, TheSix, Companies, Safa, TheLog, Reviews, Faq, Closing
  components/shop/          MenuOverlay, ProductCard, ProductSheet, CartDrawer, Checkout, SuccessOverlay
```

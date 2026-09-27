# Berry Brown

The website for Berry Brown, a cake studio in Dubai. *Made with heart, not haste.*

One page, sixteen parts: deadline strip and top bar · hero · the Six · design your cake · how it works · gift boxes · workshops · company events · Udora · our studio · from our kitchen · kind words · little questions · closing · the cake log (folded) · footer. The design is in `docs/superpowers/specs/2026-09-27-berrybrown-lively-redesign-design.md`. The shop opens as overlays on top of it: the Six, a product sheet, the bag and a 3-step checkout. Customers **pay online with Stripe** or **send the order on WhatsApp** (+971 54 794 4882). Custom cakes go to WhatsApp through the stepper; gift boxes, workshops and events go to WhatsApp or email (connect@berrybrown.me) through their quote sheets.

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
node scripts/qa-shots.mjs http://localhost:5173/ qa-shots   # scroll-through screenshots at 390 / 768 / 1440 px (add --reduced for reduced motion)
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

### One-time setup (secrets and one Stripe webhook)

Every Berry Brown variable is `BB_`-prefixed so a Dormers key can never be picked up by accident. Secrets go in with `npx wrangler login` + `npx wrangler secret put NAME`, or in the Cloudflare dashboard under Workers → berrybrown-pastry → Settings → Variables and Secrets. Until a secret is set, its feature degrades quietly: no Stripe key means checkout switches to WhatsApp; no Supabase key means nothing is saved and photo upload falls back to "I'll send my photos here".

1. **`BB_SUPABASE_SECRET_KEY`** — Supabase dashboard → Project Settings → API keys → the `sb_secret_…` key. The project URL is already in `wrangler.jsonc` as `BB_SUPABASE_URL`.
2. **`BB_STRIPE_SECRET_KEY`** — the **Dormers** Stripe account key (`dormers.ae`). `sk_test_…` first, `sk_live_…` when ready.
3. **`BB_STRIPE_WEBHOOK_SECRET`** — in Stripe → Developers → Webhooks, add an endpoint for `https://berrybrown.me/api/stripe/webhook`, description "Berry Brown (berrybrown.me)", with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`. Copy its signing secret (`whsec_…`). This is the only thing that marks orders **paid**.
4. **`BB_STRIPE_DESCRIPTOR_SUFFIX`** (optional) — the text added after the Dormers card-statement prefix, e.g. `BERRY BROWN`. Check the prefix first in Stripe → Settings → Public details: prefix + suffix must fit 22 characters, or leave this unset.
5. **Redirect.** Add a Cloudflare redirect rule from `barrybrown.me` to `berrybrown.me`.

### Stripe: one Dormers account, a separate Berry Brown namespace

Dormers is the legal merchant; Berry Brown is a brand (per the Dormers | Berry Brown multi-brand implementation spec, 27 Sep 2026). There is one Stripe account and no second one. The code keeps the brands apart:

| Where | What Berry Brown sets |
| --- | --- |
| Checkout Session | `client_reference_id` = the order ref (`BB-YYMMDD-XXXX`); metadata `brand=berry_brown`, `application=berry_brown_web`, `order_id` (Supabase uuid), `order_ref`, `customer_id` |
| PaymentIntent | the same metadata, description `Berry Brown order BB-…`, receipt to the customer's email, optional statement suffix |
| Products | inline, named `BB \| Cake \| Size` (and `BB \| Delivery \| Dubai`), product metadata `brand=berry_brown` |
| Hosted page | `branding_settings`: display name "Berry Brown", Butter background, Claret button, rounded corners, Lora (the closest serif Stripe offers to Alegreya), the sprig icon. The account's legal name still appears in the terms and receipts, as it must |
| Webhook | verifies the signature, then ignores anything without `brand=berry_brown` (Dormers events get a 200 and no action). Refunds must also match a Berry Brown order by PaymentIntent |
| Supabase | the order is created `pending` **before** the Stripe session; `payments` gets one row per Stripe event (idempotent on the event id); refunds are negative rows |

In the Stripe dashboard, filter Berry Brown payments with the search `metadata["brand"]:"berry_brown"` or by product names starting with `BB |`.

⚠️ **The Dormers side must ignore Berry Brown events too.** On 27 Sep 2026 the Dormers account had two other live webhooks listening to `checkout.session.completed`: the Dormers app (`https://dormers.ae/api/webhook`) and a Make scenario ("Stripe Checkout Fullfillment"). Both will receive every Berry Brown payment. Before Berry Brown takes live payments, each of them must skip events whose object has `metadata.brand = "berry_brown"` (or whose `client_reference_id` starts with `BB-`), and answer 200 so Stripe does not retry.

**Dashboard checks before launch (account-level, shared with Dormers):** receipt emails (Settings → Emails) show the account's public business name and support details; card statements show the account prefix. Keep the legal merchant accurate, and make sure the support email and phone on receipts are ones that can answer a Berry Brown customer.

### Supabase

Project `ylrqmwfnelwqbychdpfb` (region Tokyo, free plan). Free projects pause after a week without traffic; upgrade before launch or accept that the first visitor after a quiet week gets the sample content and no order log. To move to a closer region (Mumbai or Frankfurt): create the new project, run the three files in `supabase/migrations/` in order in its SQL editor, then change the URL and publishable key in `src/data/supabase.ts` and `BB_SUPABASE_URL` in `wrangler.jsonc`, and re-set `BB_SUPABASE_SECRET_KEY`.

| Table | What lands there | Who writes |
| --- | --- | --- |
| `customers` | One row per customer, keyed by UAE mobile. Berry Brown customers only. | Worker |
| `orders` | Every order of the Six. Stripe orders arrive `pending` and become `paid` through the webhook. WhatsApp orders arrive `pending` when the customer taps send; mark them `confirmed` by hand. Keeps `stripe_checkout_session_id` and `stripe_payment_intent_id` for reconciliation. | Worker |
| `payments` | One row per Stripe payment event: `succeeded`, or `refunded` with a negative amount. Reconcile: order total → payments → Stripe payout. | Webhook |
| `enquiries` | Custom-cake sends (answers, from-price, photo links, the WhatsApp text) and company quotes (`about` = `box`, `workshop`, `event`; `table` on rows before 27 Sep; answers in `answers`, since migration `20260927140000_enquiries_event.sql`) | Worker |
| `uploads` | One row per inspiration photo, for the 10-per-IP-per-hour limit | Worker |
| `cakes` | **The log.** A row per cake is created automatically when an order turns `paid`. Add a photo to the `cakes` bucket, put its path in `photo_path`, tick `published`, and it appears on the site (newest three). | Trigger + the studio |
| `reviews` | Kind words. Tick `published` (with permission) and the site shows them instead of the samples. | The studio |

Storage: `inspiration` (private; links are signed for 30 days) and `cakes` (public; log photos, keep them 4:5 and under 10 MB). Row Level Security is on everywhere; the publishable key can only read published cakes and reviews.

Photo upload limits: 3 files per send, 10 MB each, JPG/PNG/WebP/HEIC (checked by file bytes), 10 photos per IP per hour.

### How online payment works

1. The browser posts the bag, delivery details and an order reference to `/api/checkout`.
2. The Worker **re-prices everything from `src/data/products.ts`**, so prices sent from the browser are never trusted. It checks the date, phone number and so on, and creates a Stripe Checkout session in AED. Delivery (AED 20, free over AED 300) is its own line item. Order details are saved in the session and payment metadata, so they appear in the Stripe dashboard.
3. Before creating the session, the Worker saves the customer and the order in Supabase as `pending`, so every Stripe object can carry the order id. When Stripe confirms payment it calls `/api/stripe/webhook`, which marks the order `paid` and adds a `payments` row; the database then gives every cake in it a number in the log. The success page never marks anything paid.
4. After paying, the customer returns to `/?order=success&ref=…`, the bag clears, and a button sends the full order to our team on WhatsApp.
5. If the customer cancels, they return to `/?order=cancelled` and checkout reopens with the bag still there.

## Editing content

| What | Where |
| --- | --- |
| The Six: names, one-liners, flavours, allergens | `src/data/products.ts` |
| The price ladder (5" 150 · 6" 200 · 8" 280) | `PRICE_LADDER` in `src/data/products.ts` |
| Delivery fee, free-delivery threshold, time slots | `src/data/zones.ts` |
| Contact details (WhatsApp, email, Instagram, Udora link), rating, stats, FAQ, how-it-works steps, kitchen photos | `src/data/content.ts` |
| Gift boxes, workshops, company events, order-by dates | `src/data/companies.ts` |
| Quote form rules (minimums, lead days) | `src/data/quote.ts` |
| The log and reviews (live) | Supabase tables `cakes` and `reviews`; samples in `src/data/content.ts` show until real rows are published |
| Supabase URL and publishable key | `src/data/supabase.ts` (page) and `wrangler.jsonc` (Worker) |
| Custom-cake stepper: options, from-prices, one-week notice | `src/data/custom.ts` |
| **Every photo slot** (31 AI photos) | `src/data/media.ts` |
| WhatsApp message wording | `src/lib/order.ts` |
| Colours, type scale, spacing | `src/index.css` |

### Photos

The 31 photos are AI-made stand-ins in the brand palette (`ai: true` in `src/data/media.ts`). They were generated in Canva from the prompts in `scripts/photo-slots.json`, placed in the Canva design "Berry Brown — website photos", exported at full size, then graded into one set by `scripts/grade-photos.py` (warm split-tone toward Cocoa and Butter, WebP at 640 and 1200 px in `public/images/ai/`). The script also rewrites `src/data/photos.generated.ts`; a slot without files shows the Rose placeholder. AI photos are never sent to Stripe (`stripeImage` in `src/lib/checkoutRequest.ts`), and the page says "Photos show the style."

**Replacing one with a real photo:** name the file after its slot (for example `six-pistachio-kunafa.jpg`) in a folder, run `python3 scripts/grade-photos.py <folder> --real` (crops and resizes without the colour grade), then set `ai: false` for that slot in `src/data/media.ts`. Rules from the brand book: phone camera, window light, same plate and angle for all six, hands in frame, no retouching.

## ⚠️ Before launch — everything marked `sample: true`

| Item | File | What to do |
| --- | --- | --- |
| Names of the Six | `src/data/products.ts` (`sample: true` on each cake) | The studio confirms the six; rename, then remove the flags |
| The flat ladder 150 / 200 / 280 | `PRICE_LADDER` in `src/data/products.ts` | Saad confirms (it is a cut from the old 195/295/420) |
| Rating 4.9 · 260+ | `RATING` in `src/data/content.ts` | Replace with the real figure |
| Stats (12 years · 3,400+ cakes · 100% from scratch) | `STATS` in `src/data/content.ts` | Replace with real figures |
| Five reviews | `REVIEWS` in `src/data/content.ts` | Publish real reviews in Supabase `reviews`; the samples disappear on their own |
| The log (#041, #040, #039) | `LOG` in `src/data/content.ts` | Publish real cakes with photos in Supabase `cakes`; the samples disappear on their own |
| Instagram handle | `CONTACT.instagram` in `src/data/content.ts` | Blank shows "From the studio" under the footer photos; fill it in to link them |
| Udora shop link | `CONTACT.udora` in `src/data/content.ts` | Blank shows "Coming soon to Udora" |
| Workshop price 150 vs 100 (YAP Club) | `WORKSHOP` in `src/data/companies.ts` | Saad decides |
| Studio / pickup wording | `CONTACT.location` in `src/data/content.ts` | "Dubai" is a placeholder |
| 31 AI photos | `src/data/media.ts` (`ai: true`) | Replace with real photos from the shot list; until then the site says "Photos show the style." |
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
  components/ui/            Button, Chip, Field, Frame, Heading, Photo, Placeholder, Rise, SplitWords, Parallax, Magnetic, CountUp, DriftRow, Sheet, Sprig…
  components/layout/        DeadlineStrip, Navbar, WhatsAppFab, Footer, MobileBagBar, ToastLayer
  components/sections/      Hero, TheSix, custom/ (the stepper), HowItWorks, GiftBoxes, Workshops, CompanyEvents, Udora, Studio, Kitchen, Reviews, Faq, Closing, CakeLog
  components/shop/          MenuOverlay, ProductCard, ProductSheet, CartDrawer, Checkout, SuccessOverlay, QuoteSheet, Lightbox
```

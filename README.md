# Berry Brown

The website for Berry Brown, a cake studio in Dubai led by Chef Safa. *Made with heart, not haste.*

One page, eleven parts: nav · hero · design your cake · the Six · for companies and events · Chef Safa · the log · kind words · little questions · closing line · footer. The shop opens as overlays on top of it: the Six, a product sheet, the bag and a 3-step checkout. Customers **pay online with Stripe** or **send the order on WhatsApp**. Custom cakes, boxes, workshops and events always go to WhatsApp.

The design brief is `docs/Berry_Brown_Website_Brief_v2.md`. The brand rules are in `docs/brand/`. If they disagree, the brand book wins.

## Stack

- React 19, TypeScript and Vite
- Tailwind CSS v4 — all tokens live in `src/index.css` (four colours, two fonts, seven spacing steps, one radius). Numeric spacing utilities are switched off on purpose: use `p-md`, `gap-lg`, `mt-xl`… or an arbitrary value like `size-[44px]`.
- No animation library. One CSS fade on section entry (`Reveal`), one CSS slide for the sheets. Nothing else moves.
- Cloudflare Workers with static assets (`wrangler.jsonc`). The Worker (`worker/`) handles `/api/checkout` (Stripe) and `/api/inspiration` (photo upload to R2).
- Vitest for tests

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # pricing, cart, checkout, custom form, WhatsApp messages, upload helpers
npm run build     # type-checks the app and the Worker, then builds to dist/
```

`npm run dev` does not run the Worker, so **Pay online** falls back to WhatsApp and photo upload falls back to "I'll send my photos here". To test the full site with the API, put `STRIPE_SECRET_KEY=sk_test_...` in a `.dev.vars` file (git-ignored), then run:

```bash
npm run build
npx wrangler dev
```

## Deploying (Cloudflare Workers)

The `berrybrown-pastry` Worker is connected to this GitHub repo through Cloudflare Workers Builds:

- Pushing to **`main`** runs `npm run build` and then `npx wrangler deploy`, which publishes to **https://berrybrown.me**.
- Pushing to any other branch uploads a preview version.

### One-time setup

1. **Inspiration photos (R2).** The custom-cake form uploads up to three photos to an R2 bucket and puts the links in the WhatsApp message. The bucket must exist before the first deploy of this version, or the deploy fails:

   ```bash
   npx wrangler login
   npx wrangler r2 bucket create berrybrown-inspiration
   npx wrangler r2 bucket lifecycle add berrybrown-inspiration expire-30d --expire-days 30 -y
   ```

   Photos are served back through the Worker at `/api/inspiration/<key>`, so the bucket stays private. Limits: 3 files per request, 10 MB each, JPG/PNG/WebP/HEIC only (checked by file bytes), 10 photos per IP per hour.

2. **Stripe.** Set the secret once (use a test key first):

   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   ```

   Until it is set, checkout tells customers online payment is unavailable and switches them to WhatsApp.

3. **Redirect.** Add a Cloudflare redirect rule from `barrybrown.me` to `berrybrown.me`.

### How online payment works

1. The browser posts the bag, delivery details and an order reference to `/api/checkout`.
2. The Worker **re-prices everything from `src/data/products.ts`**, so prices sent from the browser are never trusted. It checks the date, phone number and so on, and creates a Stripe Checkout session in AED. Delivery (AED 20, free over AED 300) is its own line item. Order details are saved in the session and payment metadata, so they appear in the Stripe dashboard.
3. After paying, the customer returns to `/?order=success&ref=…`, the bag clears, and a button sends the full order to Safa on WhatsApp.
4. If the customer cancels, they return to `/?order=cancelled` and checkout reopens with the bag still there.

## Editing content

| What | Where |
| --- | --- |
| The Six: names, one-liners, flavours, allergens | `src/data/products.ts` |
| The price ladder (5" 150 · 6" 200 · 8" 280) | `PRICE_LADDER` in `src/data/products.ts` |
| Delivery fee, free-delivery threshold, time slots | `src/data/zones.ts` |
| Contact details, rating, stats, reviews, FAQ, the log, company offers, deadlines | `src/data/content.ts` |
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
| Five reviews | `REVIEWS` in `src/data/content.ts` | Replace with real reviews, with permission |
| The log (#041, #040, #039) | `LOG` in `src/data/content.ts` | Replace with real numbered cakes and their photos |
| Instagram handle | `CONTACT.instagram` in `src/data/content.ts` | Blank hides the Follow column; fill it in |
| Studio / pickup wording | `CONTACT.location` in `src/data/content.ts` | "Dubai" is a placeholder |
| Twelve photo slots | `src/data/media.ts` | All `placeholder: true` until Safa's photos exist |
| Share image | `public/og.png` | Generated from the logo; replace with a real photo when one exists |
| "Written on" +50 | `WRITTEN_ON` in `src/data/products.ts` | Shown as a line under the Six; not yet an add-on in checkout |

## Project layout

```
worker/                     Cloudflare Worker: /api/checkout (Stripe), /api/inspiration (R2); everything else is static assets
wrangler.jsonc              Worker + assets + R2 config
public/brand/               logo SVGs (never type the name as a logo)
public/fonts/               Alegreya and Jost, self-hosted
src/
  index.css                 the design system: colours, type scale, spacing, controls
  App.tsx                   page order, providers, overlays
  data/                     products, zones, content, custom-form options, media slots
  lib/                      pricing, orders + WhatsApp messages, checkout validation, upload helpers
  store/                    cart (localStorage) and UI overlay state
  components/ui/            Button, Chip, Placeholder, Photo, Reveal, Sheet, Sprig…
  components/layout/        Navbar, Footer, MobileBagBar, ToastLayer
  components/sections/      Hero, CustomCake, TheSix, Companies, Safa, TheLog, Reviews, Faq, Closing
  components/shop/          MenuOverlay, ProductCard, ProductSheet, CartDrawer, Checkout, SuccessOverlay
```

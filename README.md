# Berry Brown

The website for Berry Brown, Chef Safa's home bakery in Dubai: *"Made with heart, not haste."*

It is a single marketing page (hero video, favourite cakes, kitchen gallery, story, custom cake builder, reviews and FAQ). The shop opens as overlays on top of it: menu, product details, bag and a 3-step checkout. Customers can **pay online with Stripe** or **send the order on WhatsApp**.

## Stack

- React 19, TypeScript and Vite
- Tailwind CSS v4 (design tokens in `src/index.css`)
- `motion` (Framer Motion) for animation and `lenis` for smooth scrolling
- Cloudflare Workers with static assets for hosting (`wrangler.jsonc`). A small Worker (`worker/`) handles `/api/checkout` and creates Stripe Checkout sessions.
- Vitest for tests

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # pricing, cart, checkout validation and Stripe payload tests
npm run build     # type-checks the app and the Worker, then builds to dist/
```

`npm run dev` does not run the Worker, so **Pay online** falls back to WhatsApp locally. To test the full site with the API, put `STRIPE_SECRET_KEY=sk_test_...` in a `.dev.vars` file (it is git-ignored), then run:

```bash
npm run build
npx wrangler dev
```

## Deploying (Cloudflare Workers)

The `berrybrown-pastry` Worker is connected to this GitHub repo through Cloudflare Workers Builds:

- Pushing to **`main`** runs `npm run build` and then `npx wrangler deploy`, which publishes to **https://berrybrown.me**.
- Pushing to any other branch uploads a preview version.

To turn on online payments, set the Stripe key once. Use a test key first.

```bash
npx wrangler secret put STRIPE_SECRET_KEY
```

You can also add it in the Cloudflare dashboard under Workers → berrybrown-pastry → Settings → Variables and Secrets. Until the key is set, checkout tells customers that online payment is unavailable and switches them to WhatsApp.

### How online payment works

1. The browser posts the bag, delivery details and an order reference to `/api/checkout`.
2. The Worker **re-prices everything from `src/data/products.ts`**, so prices sent from the browser are never trusted. It then checks the date, area, phone number and so on, and creates a Stripe Checkout session in AED. Delivery is added as its own line item. All order details are saved in the session and payment metadata, so they appear in the Stripe dashboard.
3. After paying, the customer returns to `/?order=success&ref=…`. The site shows a confirmation with confetti, clears the bag, and offers a button that sends the full order details to Safa on WhatsApp.
4. If the customer cancels, they return to `/?order=cancelled` and checkout reopens with their bag still there.

> Tip: turn on Stripe's email receipts, and add a webhook later if you want paid orders to reach Safa automatically.

## Editing content

| What | Where |
| --- | --- |
| Cakes, sizes, prices, flavours | `src/data/products.ts` |
| Delivery areas, fees, free-delivery thresholds, time slots | `src/data/zones.ts` |
| Contact details, reviews, FAQs, stats, marquee text, "oven notes" | `src/data/content.ts` |
| Custom cake builder options and prices | `src/data/builder.ts` |
| **Every photo and video** | `src/data/media.ts` |

### ⚠️ Before launch

- **Photos and videos:** anything marked `placeholder: true` in `src/data/media.ts` is free stock media (Unsplash and Mixkit licences) or an AI-generated image. Replace them with Safa's real photos: put the files in `public/images` or `public/videos`, update `src` and set `placeholder: false`. Use WebP images about 1400px on the long edge, and MP4 (H.264) videos at 720p under 6 MB.
- **Reviews, rating and stats in `content.ts` are samples.** Replace them with real ones (and get customers' permission) before going live.
- **Contact details:** check the WhatsApp number, email, Instagram handle and opening hours in `CONTACT`.

## Project layout

```
worker/                     Cloudflare Worker: /api/checkout (Stripe); everything else is static assets
wrangler.jsonc              Worker + assets config
public/                     images, videos, favicon, _headers (cache rules)
src/
  App.tsx                   page layout, smooth scroll, overlays
  data/                     catalogue, zones, content, builder, media registry
  lib/                      pricing, orders, checkout validation, motion tokens, helpers
  store/                    cart (localStorage) and UI (overlays, toasts) state
  components/
    ui/                     Button, Sheet, Reveal, SplitWords, TiltCard, Marquee, …
    layout/                 Navbar, Preloader, Footer, mobile bag bar, WhatsApp button
    sections/               Hero, Favourites, Gallery, HowItWorks, Story, Builder, Reviews, Faq
    shop/                   Menu, ProductSheet, CartDrawer, Checkout, SuccessOverlay, Lightbox
docs/superpowers/           design spec and implementation plan
```

## Accessibility and motion

- Every animation respects **reduced motion**: videos are replaced by still images, scrolling text stops, and smooth scrolling is turned off.
- Overlays trap keyboard focus, close with Esc, return focus to where it was, and make the page behind them `inert`.
- The hero video and the scrolling reviews each have a pause button.

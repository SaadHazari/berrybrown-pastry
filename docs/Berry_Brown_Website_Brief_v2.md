# Berry Brown — Website Brief v2

**Date:** 27 Sep 2026 · **Owner:** Saad · **For:** the coder · **Replaces:** the 10-section brief in `Berry_Brown_Brand_Positioning_and_Scenarios.md` §6
**Codebase:** `~/1Projects/BerryBrown Codebase` (React 19 · Vite · Tailwind v4 · Cloudflare Workers) · **Live:** https://berrybrown.me
**Brand rules:** `Berry Brown Brand Book.pdf` (Edition 1) and `Berry_Brown_Brand_Guidelines.md`. If this brief and the brand book disagree on colour, type or logo, the brand book wins.

---

## 0. Read this first

**The goal in one line:** same site, same stack, half the noise. It should look expensive without saying so — through space, order and restraint, not through gold or big words.

**What changed since the 21 Sep brief (Saad's decisions, 27 Sep):**

| Topic | 21 Sep brief said | Now |
|---|---|---|
| Voice | "One baker, homemade" | A **cake studio** led by Chef Safa. "We", not "I". Never "homemade" or "home kitchen" on the site |
| Position | "Not luxury, not cheap" | **Quiet luxury.** Shown in colour, spacing, hierarchy — never in copy |
| Custom cakes | Low on the page | **Section 3**, right under the hero. They pay best |
| Rating, stats, reviews | Remove samples | **Keep.** Real reviews replace samples when Saad sends them. Keep the `sample: true` flags in code so nothing is forgotten |
| Shop / checkout | No cart | Keep the working Stripe + WhatsApp checkout for the Six (see §4.5 decision) |
| Motion | — | **Kill** smooth scroll, hero video, marquee, grain, preloader, tilt, magnetic, split-words, count-up, fly-to-cart, confetti |
| Photos | — | Palette-coloured placeholders now. Max 12 photos on the whole page (today: 39) |
| Spacing | — | **LiftKit** golden-ratio scale (§5) |

**Two things the brand book must be updated for** (Saad, one line each, not the coder): the "We are not: luxury" line on page 2, and "Homemade cakes by Chef Safa" on pages 7, 13 and 14. Until then, the site follows this brief.

---

## 1. What we already have

The current build is good code on the wrong design. Keep the engine, change the body.

| Part | File(s) | Verdict |
|---|---|---|
| Stack, hosting, deploy | `vite.config.ts`, `wrangler.jsonc`, `worker/` | **Keep** |
| Stripe checkout + re-pricing on the Worker | `worker/`, `src/lib/checkoutRequest.ts`, `src/components/shop/Checkout.tsx` | **Keep** |
| WhatsApp order message builder | `src/lib/order.ts` | **Keep**, reuse for the custom form and the events section |
| Cart state, tests | `src/store/`, `src/lib/*.test.ts` | **Keep** |
| Overlays: focus trap, Esc, inert | `src/components/ui/Sheet.tsx`, `src/components/shop/Overlays.tsx` | **Keep** |
| FAQ | `src/components/sections/Faq.tsx` | **Keep** structure. Restyle to tokens. Add 2 questions (§4.9) |
| Footer | `src/components/layout/Footer.tsx` | **Keep** structure. Swap logo file, fix contact + legal line (§4.11) |
| Reviews | `src/components/sections/Reviews.tsx` | **Keep** content. Change motion (§4.8) |
| Custom cake builder | `src/components/sections/Builder.tsx`, `src/data/builder.ts` | **Rebuild** to §4.3 spec, move up the page |
| Product data | `src/data/products.ts` | **Cut** to six cakes, flat price ladder (§4.4) |
| Hero video, Lenis, grain, marquee, preloader, WhatsApp bubble | `Hero.tsx`, `App.tsx`, `index.css`, `TrustMarquee.tsx`, `Preloader.tsx`, `WhatsAppFab.tsx` | **Delete** |
| Motion helpers: `Magnetic`, `TiltCard`, `SplitWords`, `CountUp`, `AnimatedNumber`, `Squiggle`, `Marquee`, `FlyLayer` | `src/components/ui/`, `src/components/layout/FlyLayer.tsx` | **Delete** (keep `Reveal.tsx`, simplified — §6) |
| Gallery (8-image masonry) | `Gallery.tsx` | **Replace** with a 3-image "log" row (§4.7) |
| Fonts Fraunces / Caveat / Inter | `index.css` | **Replace** with Alegreya / Jost. No handwriting font anywhere |
| Old cake-slice logo | `public/images/berrybrown_logo.webp`, `logo-mark.webp` | **Replace** with the sprig logo files from the brand kit `01 Logo/` |

---

## 2. The business the site has to sell

Six revenue channels. The site today shows one and a half of them.

| # | Channel | Q4 share (Average case) | What the site must do | Where on the page |
|---|---|---|---|---|
| 1 | Signature cakes (the Six) | ~26% | Show six cakes, three sizes, clear prices, order in under a minute | §4.4 |
| 2 | Custom / celebration cakes | ~15% | A short form with photo upload that lands in Safa's WhatsApp | §4.3 |
| 3 | Workshops ("Make one with Safa") | ~15% | One card, one line, one price, "Enquire" | §4.6 |
| 4 | Udora marketplace | ~4% | Nothing on-site. Footer link only if listing goes live | §4.11 |
| 5 | Corporate events ("The Table") | ~11% | One card, one line, one price, "Enquire" | §4.6 |
| 6 | Corporate gift boxes ("The Box") | ~30% | One card with box sizes and MOQ, "Enquire" | §4.6 |

Channels 3, 5 and 6 are **56% of the target** and are not on the site today. Section 4.6 fixes that with one section, not three.

---

## 3. Page order

One page. Eleven parts. Each part has **one job** and **one call to action**.

| # | Section | Job | The one Claret thing |
|---|---|---|---|
| 1 | Nav | Get to Order | — (Cocoa button) |
| 2 | Hero | Say what this is in 3 seconds | "Design your cake" button |
| 3 | Design your cake | Take a custom order | "Send to Safa" button |
| 4 | The Six | Sell the signature cakes | Price numbers |
| 5 | For companies & events | Open the B2B channels | "Enquire" button |
| 6 | Chef Safa | Trust: who makes it | One word in the headline |
| 7 | The log | Proof: numbered real cakes | The cake number |
| 8 | Kind words (reviews) | Proof: what customers say | The rating number |
| 9 | Little questions (FAQ) | Remove doubt | Open-item icon |
| 10 | Closing line | Last push | "Order" button |
| 11 | Footer | Contact, legal | — |

Anchors for the nav: `#custom`, `#the-six`, `#companies`, `#faq`. Section IDs stay stable; Instagram bio links use them.

---

## 4. Section by section

### 4.1 Nav

- Left: **horizontal logo file** (`berrybrown-logo-horizontal.svg`), height 28 px desktop / 24 px mobile. Never the name typed.
- Centre (desktop): 4 links in Jost label style — The Six · Custom · Companies · FAQ.
- Right: one button **ORDER** (Cocoa background, Butter text). Opens the menu overlay. Bag icon appears **only** when the bag has items, as a small Jost count next to ORDER.
- Bar: Butter at 92% with `backdrop-filter: blur(8px)`, one Cocoa-15% hairline underneath. No pill, no shadow, no rounded floating bar.
- Mobile: logo left, ORDER right, hamburger last. Menu opens as a full Butter sheet with the 4 links stacked in `title3`.

### 4.2 Hero

No video. No overlay. No polaroid. No avatars.

```
[Butter background]
 left column (7/12)                     right column (5/12)
 CAKE STUDIO · DUBAI          (label)   [image panel 4:5]
 Cakes made with heart,       (title1)  Rose panel + one cake photo
 not haste.                             or the placeholder (see §7)
 Six signature cakes. Made to order.    Caption under it (caption):
 Custom cakes for the days               "Cake #041 · for Ayesha's dad, 60th"
 that matter.                (body)
 [DESIGN YOUR CAKE] (Claret)  See the Six → (text link)
 ★ 4.9 · 260+ reviews        (label, Cocoa 70%)
```

- Headline stays. Italic only on "not haste" — this is the **only** italic headline word on the page.
- The rating line sits under the buttons, small and quiet. Data from `RATING` in `content.ts`.
- Mobile: single column, image **after** the text, height 4:5 at full width.

### 4.3 Design your cake (`#custom`) — moved up

Replace the current 5-step "builder with estimate" with a **6-field form**. Two columns on desktop (form left 7/12, summary card right 5/12), stacked on mobile with a sticky bottom button.

| # | Field | Type | Options | Rules |
|---|---|---|---|---|
| 1 | What's the occasion? | Chips, single pick | Birthday · Wedding · Baby shower · **Something else** | "Something else" reveals a one-line text box (max 60 chars), required if chosen |
| 2 | How many people? | Chips, single pick | Up to 6 (5") · 6–8 (6") · 10–14 (8") · **More** (two tiers) | Maps to the size ladder. "More" adds note "quoted separately" |
| 3 | Pick a look | Chips, single pick **+ upload** | Soft buttercream · Fresh flowers · Drip & berries · **Something else** | Under the chips: "Add up to 3 inspiration photos" — drop zone, JPG/PNG/HEIC, ≤10 MB each, thumbnails with remove ✕ |
| 4 | Flavour | Chips, single pick | The Six (names from `products.ts`) · **Something else** | "Something else" reveals a text box; label under it: "Custom flavours are +60" |
| 5 | Words on the cake | Text | optional, 35 chars, counter | Same limit as the plaque FAQ |
| 6 | When is it? | Date input | keep the current control | Min = today + 48 h. Help text: "48 hours for custom. A week for two tiers." |

**Summary card (right):** title "Your cake", the six answers as a list, a **from-price** line — not a calculated range:

| Pick | Shows |
|---|---|
| Up to 6 | From AED 300 |
| 6–8 | From AED 300 |
| 10–14 | From AED 420 |
| More | From AED 850 |

Under the price: caption "Final price from Safa on WhatsApp. 50% deposit confirms the slot."
Button: **SEND TO SAFA** (Claret). Opens WhatsApp with the message built by `src/lib/order.ts` — add a `customCakeMessage(form)` function there.

**Photo upload — how it works technically.** A `wa.me` link cannot carry images. Two routes; do route A, keep B as the fallback:

- **A (build this):** new Worker endpoint `POST /api/inspiration` → stores files in a Cloudflare **R2** bucket `berrybrown-inspiration` → returns public URLs → the URLs go into the WhatsApp text as lines `Inspiration: https://…`. Add a 30-day lifecycle rule on the bucket. Reject anything over 10 MB or not an image. Rate-limit by IP (10/hour).
- **B (fallback when A fails):** the message ends with "I'll send my inspiration photos here." and the customer attaches them in WhatsApp.

Delete: emoji on chips, the guest-count tier prices, the `estimate()` function and its range.

### 4.4 The Six (`#the-six`)

Section title: **The Six** (title3). One-liner: "Six signature cakes. Three sizes. Made to order." (Alegreya Medium Italic).

- A 3 × 2 grid on desktop, 2 × 3 on mobile. Cards: image 4:5 on top, name (heading), one-line description (callout), then the **price ladder in Jost**: `5" 150 · 6" 200 · 8" 280`.
- No badges over the photos. No handwritten asides. No "+" buttons on the image. Card corners 4 px, hairline border, no shadow.
- Tap the card → existing `ProductSheet` (size, flavour, message, add to bag). Keep it; restyle to tokens.
- Below the grid, one line: "Written on — any of the Six with a hand-piped message and one decoration, +50." Label style, Cocoa 70%.

**Data change in `src/data/products.ts`:**

| Keep (six) | Remove |
|---|---|
| Berry Chocolate Drip · Pistachio Kunafa · Berry Cream Sponge · Salted Caramel Chocolate · Blueberry Cheesecake · Vanilla Berry Charlotte | Floral Celebration Cake (→ custom form) · Mango Passion Tart · Citrus Almond Tart |

- Sizes for all six become **the same flat ladder**: `5"` serves 4–6 **150** · `6"` serves 6–8 **200** · `8"` serves 10–14 **280**. (This is a price cut vs today's 195/295/420 for some cakes — it is the ladder agreed on 21 Sep. Saad to confirm before merge.)
- Add `sample: true` to the cake names until Safa confirms the real Six.
- Remove `category` and the menu-overlay tabs (Signature / Celebrations / Tarts). The menu overlay shows the Six and nothing else.
- Delivery in `src/data/zones.ts`: one Dubai zone, **fee 20, free over 300**, plus pickup. Never show "free delivery" as a headline; show it only as a line in checkout.

### 4.5 Decision: keep online checkout for the Six?

| Option | For | Against |
|---|---|---|
| **A. Keep Stripe + WhatsApp (recommended)** | Built, tested, re-priced on the server. A luxury buyer expects to pay by card without a chat | Two order paths to support |
| B. WhatsApp only | Matches the 21 Sep brief; one path | Throws away working code; adds a chat step to every simple order |

Go with A. Custom cakes, boxes, workshops and events always go to WhatsApp — no card checkout for those.

### 4.6 For companies & events (`#companies`) — new

Rose background panel, full width, `section__morePadding`. Title: **For companies and events** (title3). One-liner: "Gift boxes, workshops and dessert tables. Invoiced, delivered, on time."

Three cards in a row (stack on mobile). Hairline borders, no images — a sprig colour-circle icon each (from `04 Existing brand assets/`).

| Card | Line | Price line (Jost) | Button |
|---|---|---|---|
| **The Box** | Brownies and cookies in a branded sleeve with a hand-written card. Your logo on the sleeve from 50 boxes. | 6 pc 65 · 8 pc 90 · 10 pc 120 · min 20 | ENQUIRE |
| **Make one with Safa** | A 90-minute decorating workshop at your venue. Twelve seats, one cake each. | From 150 per seat · 12 seats | ENQUIRE |
| **The Table** | Minis of the Six for 40–60 guests. Set up, served, cleared. | From 35 per head | ENQUIRE |

ENQUIRE = one Claret button per card? No — **one Claret button for the section**: a single "ENQUIRE ON WHATSAPP" under the three cards, plus a text link "or email saad@berrybrown.me". Card titles are the click target and pre-fill which product the message is about (`?about=box|workshop|table`).

Under the cards, one label line: "Diwali boxes close 20 Oct · National Day 10 Nov · Year-end 27 Nov." Dates from a `DEADLINES` array in `content.ts`; hide any that have passed.

### 4.7 Chef Safa and The log

**Chef Safa** — two columns. Left: one portrait, 4:5, on a Rose panel, straight (not tilted, no tape, no magnifier circle). Right:

- label: CHEF SAFA
- title3: "Trained in pastry. Years in hotel kitchens. Every cake, her hands."
- body (≤ 80 words, third person, "we" for the studio): who she is, what she doesn't do (no fondant characters, no same-day, nothing she hasn't made five times).
- The three stats under it as **static Jost numbers** on a hairline row: `12 years` · `3,400+ cakes` · `100% from scratch`. No count-up. Keep `sample: true` on `STATS` until real.

**The log** — replaces the 8-image gallery. Title: **The log** (title3). One-liner: "Every cake gets a number." Three cards, 4:5 images, each with a Jost cake number and an Alegreya caption: `#041` / *for Ayesha's dad, 60th*. Data: a new `LOG` array in `content.ts` (`{ n, for, flavour, size, image }`). Three items max on the page, newest first. Placeholder panels until real cakes exist.

### 4.8 Kind words (reviews)

- Keep the 5 reviews (samples flagged). Title: **Kind words** (title3). Rating on the right: `4.9 · 260+ reviews` in Jost.
- **No auto-scroll.** Static grid: 3 cards on desktop, 1 card + swipe on mobile (CSS `scroll-snap`, native scrolling). Prev/next arrows on desktop, dots on mobile.
- Cards: Butter or Rose backgrounds only (drop the sage and latte tints), 4 px corners, hairline border. Stars in Cocoa, not Claret. Name in Jost, area and cake in caption.
- Remove the pause button — nothing moves.

### 4.9 Little questions (FAQ)

Keep as built. Restyle to tokens: hairlines, Alegreya questions, Jost +/× icon. Remove the coffee polaroid on the left; put the section title and the one-liner there instead.

Add two questions to `FAQS` in `content.ts`:

| Q | A |
|---|---|
| Do you do corporate orders? | Yes. Gift boxes from 20, workshops for up to 12, and dessert tables for 40–60. Send the date and headcount and we reply with a quote and an invoice. |
| How do deposits work? | Custom cakes, boxes and events are confirmed with a 50% deposit. The rest is due on delivery. |

### 4.10 Closing line

Keep the headline "Let's bake something lovely." (title2) and the one **ORDER** button (Claret). **Remove the four tilted polaroids.** The section is text on Butter with `section__mostPadding`. That is the luxury: nothing else in the frame.

### 4.11 Footer

Keep the structure Saad likes (the "Made with heart, not haste" line and the heart mark). Changes:

- Logo: stacked logo file on Cocoa (`berrybrown-logo-on-dark.svg`). Heart glow stays if it is subtle (one 2 s ease, opacity 0.6→1.0, no colour change).
- Columns: Order (WhatsApp +971 50 947 8943 · saad@berrybrown.me) · Follow (Instagram — handle to be confirmed by Saad) · Studio (Dubai · hours).
- Legal line, caption size, Butter at 60%: "Berry Brown is a trading name of Dormers Restaurant L.L.C., Dubai. Trade licence 1433956. Not registered for VAT."
- Remove the green WhatsApp bubble everywhere. On mobile, the bottom bar (`MobileBagBar.tsx`) shows only when the bag has items.

---

## 5. Design system: brand book × LiftKit

LiftKit is a spacing and sizing system built on the golden ratio (φ = 1.618). Every gap, font size and padding is the base size multiplied or divided by 1.618 and its roots. That is why things look "right" without anyone tuning them. We take LiftKit's **maths** and the brand book's **colours, fonts and rules**. We do **not** install LiftKit's React components — only the CSS variables.

Source: `@chainlift/liftkit-css` → `css/globals.css` and `css/typography.css`.

### 5.1 The four steps

```css
--wholestep:   1.618;  /* φ            */
--halfstep:    1.272;  /* √φ           */
--quarterstep: 1.128;  /* √√φ          */
--eighthstep:  1.061;  /* √√√φ         */
```

### 5.2 Base and spacing (`src/index.css`)

Base is **18 px** on desktop (brand body size), **17 px** under 768 px.

```css
:root { font-size: 18px; }
@media (max-width: 767px) { :root { font-size: 17px; } }

@theme {
  --spacing-2xs: calc(1rem / 1.618 / 1.618 / 1.618); /*  4.2 px */
  --spacing-xs:  calc(1rem / 1.618 / 1.618);         /*  6.9 px */
  --spacing-sm:  calc(1rem / 1.618);                 /* 11.1 px */
  --spacing-md:  1rem;                               /* 18   px */
  --spacing-lg:  calc(1rem * 1.618);                 /* 29.1 px */
  --spacing-xl:  calc(1rem * 1.618 * 1.618);         /* 47.1 px */
  --spacing-2xl: calc(1rem * 1.618 * 1.618 * 1.618); /* 76.2 px */
  --spacing-3xl: calc(1rem * 1.618 * 1.618 * 1.618 * 1.618); /* 123 px */
}
```

Use **only these seven values** for padding, gaps and margins. If a gap is not on the list, pick the nearest one.

**Section padding** (from LiftKit `sections.css`):

| Class | Desktop | Mobile (<992 px) | Use for |
|---|---|---|---|
| `section-default` | 4.235rem all round | 1.618rem | Nav, footer columns |
| `section-more` | 6.852rem top/bottom · 4.235rem sides | 4.235rem · 1.618rem | Every content section |
| `section-most` | 11.087rem top/bottom | 6.852rem · 1.618rem | Hero, closing line |

**Container:** max-width **1257 px** (LiftKit `container__sm`), centred, side padding `--spacing-md` on mobile.

### 5.3 Type scale — LiftKit sizes, brand book fonts

Every size is 18 px × a power of the four steps. Brand book sizes are in brackets; they match within a pixel.

| Token | Font | Size @18 | Line-height | Tracking | Brand job |
|---|---|---|---|---|---|
| `display` | Alegreya SemiBold | 47.1 px (φ²) | 1.272 | −0.022em | Hero headline only (brand: 32–44 — we go one step up on desktop, use `title1` on mobile) |
| `title1` | Alegreya SemiBold | 37.0 px (φ·√φ) | 1.272 | −0.022em | Section headline (brand 32–44) |
| `title3` | Alegreya SemiBold | 22.9 px (√φ) | 1.272 | −0.017em | Section title (brand 22–24) |
| `heading` | Alegreya SemiBold | 20.3 px (⁴√φ) | 1.272 | −0.014em | Card titles, FAQ questions |
| `oneliner` | Alegreya Medium Italic | 19 px | 1.4 | 0 | One line under a title (brand 19) |
| `body` | Alegreya Medium | 18 px | 1.618 | −0.011em | Paragraphs (brand 18, line 1.55) |
| `callout` | Alegreya Medium | 17 px (÷⁸√φ) | 1.272 | −0.009em | Card descriptions |
| `caption` | Alegreya Medium Italic | 14.2 px (÷√φ) | 1.272 | −0.007em | Photo captions, legal (brand 14) |
| `price` | **Jost** Medium, tabular | 15 px (÷⁴√φ÷⁸√φ) | 1.272 | 0 | Prices and numbers (brand 14–16) |
| `button` | **Jost** Medium, caps | 12.5 px (÷√φ÷⁴√φ) | 1 | +0.16em | Buttons (brand 12–13) |
| `label` | **Jost** Medium, caps | 11.1 px (÷φ) | 1.272 | +0.20em | Eyebrows, nav, small labels (brand 11–12) |

Rules that stay from the brand book: `font-variant-numeric: lining-nums` on every Alegreya element (the CSS `font` shorthand resets it — use longhand). Never Alegreya in capitals. Never a sentence in Jost. Nothing readable under 16 px except captions and labels.

Fonts: self-host from brand kit `03 Fonts/` (Alegreya Medium, Medium Italic, SemiBold; Jost Medium) as WOFF2 in `public/fonts/`. Preload the two body files. Remove the Google Fonts `<link>` for Fraunces/Caveat/Inter.

### 5.4 Colour tokens (`src/index.css`)

Replace the current `@theme` colours entirely.

```css
@theme {
  --color-butter:   #F6EEDF;  /* page background          */
  --color-cocoa:    #3E2A21;  /* ink, buttons, footer     */
  --color-rose:     #E7CFC6;  /* panels, image mats       */
  --color-claret:   #7A2A3A;  /* ONE accent per section   */
  --color-cocoa-70: #726156;  /* second-level text        */
  --color-cocoa-15: #D9D0C8;  /* hairlines only           */
  --color-butter-60: rgb(246 238 223 / 0.6); /* text on Cocoa, secondary */
}
```

Mix on any screen: Butter 60 · Cocoa 25 · Rose 10 · Claret 5. Delete `sage`, `sage-soft`, `blush`, `latte`, `oat`, `paper`, `milk`, `berry`, `berry-deep`. Never Claret text on Cocoa.

### 5.5 Shape

| Thing | Value |
|---|---|
| Corners | **4 px** everywhere (brand: soft corners, never pill, never sharp). Delete `--radius-card: 28px`, `--radius-blob: 48px`, all `rounded-full` on buttons and chips |
| Buttons | Rectangle, 4 px corners, padding `--spacing-sm` × `--spacing-lg`, min-height 44 px |
| Chips (form) | Same as buttons; selected = Cocoa fill + Butter text; unselected = Butter fill + hairline |
| Hairlines | 1 px, Cocoa 15%. Use lines, not boxes, to separate |
| Shadows | None. (One exception: the open overlay sheet may have `0 24px 48px -16px rgb(62 42 33 / 0.25)`) |
| Image mats | Rose panel with `--spacing-sm` padding around any photo that sits on Butter; photos never bleed to the edge except the hero on mobile |

---

## 6. Composition rules ("quiet luxury")

These are the rules that make it look expensive. Each one removes something.

1. **A third of every section is empty.** If a section feels full, cut an element — don't shrink the gaps.
2. **One Claret thing per section**, besides the berry in the logo (§3 lists which). Everything else is Cocoa on Butter.
3. **One typeface job per element.** Sentences in Alegreya, labels and numbers in Jost, name only as the logo file.
4. **Left-align anything people read. Centre only signature pieces** (logo, closing line, the sprig).
5. **No decoration on photos:** no badges, no tape, no tilt, no handwriting captions, no "+" buttons. A caption sits *under* the photo in `caption` style.
6. **Max photos per viewport:** desktop 3, mobile 1. Max 12 on the whole page.
7. **One italic phrase on the page** — "not haste" in the hero. No italics in other headlines.
8. **No emoji, no exclamation marks, no "indulge / treat yourself / delight".** Short sentences.
9. **Numbers are the ornament.** `#041`, `5" 150`, `3 of 8` in Jost do the work that stickers did.
10. **Motion is a whisper.** Allowed: one fade-and-rise (opacity 0→1, translateY 12→0, 400 ms, ease-out, once) on section entry via `Reveal.tsx`; hover on links = underline; hover on buttons = 6% darker. Nothing else moves. `prefers-reduced-motion` turns even that off. Native browser scrolling only — delete Lenis and `registerLenis`.

---

## 7. Imagery

### 7.1 Now (before real photos)

Every image slot uses a **palette placeholder**, not stock photos. Build one component `<Placeholder ratio="4/5" label="THE SIX · 1 OF 6" />`:

- Rose (`#E7CFC6`) panel, 4 px corners.
- The sprig SVG centred at 40% of the panel width, Claret at 30% opacity (exactly like brand book page 8).
- A Jost label in the bottom-left corner in Cocoa 70%.

Slots and their fixed ratios:

| Slot | Ratio | Count | Label |
|---|---|---|---|
| Hero | 4:5 | 1 | THE SIX · CLASSIC CHOCOLATE |
| The Six cards | 4:5 | 6 | THE SIX · n OF 6 |
| Chef Safa | 4:5 | 1 | HANDS |
| The log | 4:5 | 3 | #041 etc. |
| Custom form summary | 4:5 | 1 | THE ONE WE MAKE FOR YOU |

Total: **12**. This is the page's photo budget forever.

Delete every `placeholder: true` stock/AI file from `public/images/` and `public/videos/` once the component is in.

### 7.2 Later (real photos)

`src/data/media.ts` keeps one entry per slot. When a real photo arrives: same file name, same ratio, set `placeholder: false`. Rules from the brand book: phone camera, window light, same plate and 45° angle for all six, hands in frame, no retouching, no studio backdrops. One lighting style for the whole page — mixed lighting is what made the old site feel muddled.

---

## 8. Mobile

Phones are half the customers. Design the phone first, then widen.

| Rule | Detail |
|---|---|
| Breakpoints | 0–767 phone · 768–1023 tablet · 1024+ desktop |
| Base | 17 px; `title1` becomes the hero size; `display` unused |
| Nav | 56 px tall: logo · ORDER · menu. Full-screen menu sheet |
| Hero | Text first, image after, image full-width 4:5 with 16 px side gutter |
| Custom form | Chips wrap 2 per row, 44 px tall. Summary card collapses to a 1-line "From AED 300 · Birthday · 6–8" strip pinned at the bottom with the SEND TO SAFA button. Upload drop-zone becomes a "Add photos" button that opens the camera roll |
| The Six | 2 columns, 4:5 images, price ladder wraps to one line under the name |
| Companies | Cards stack; one ENQUIRE button at the end |
| Reviews | One card per view, `scroll-snap-type: x mandatory`, dots below |
| FAQ | Full width, 56 px tap rows |
| Bottom bar | Only when the bag has items: "3 items · AED 450 · VIEW BAG" in Cocoa |
| Tap targets | ≥ 44 × 44 px everywhere |
| Test on | iPhone 13/15 (390 px), Pixel 7 (412 px), iPad (768 px), 1280 and 1440 desktop |

---

## 9. Content and data fixes (do these first, today)

| # | File | Change |
|---|---|---|
| 1 | `src/data/content.ts` → `CONTACT.whatsapp` | `'971501234567'` → `'971509478943'`. **Every WhatsApp link on the live site goes to a stranger right now.** Update `src/lib/order.test.ts` line 30 to match |
| 2 | `CONTACT.phoneDisplay` | `'+971 50 947 8943'` |
| 3 | `CONTACT.email` | `'saad@berrybrown.me'` (the `.ae` domain is not ours) |
| 4 | `CONTACT.instagram` | Saad to confirm the handle; blank until then |
| 5 | `CONTACT.location` | Saad to confirm pickup/studio wording; "Al Quoz" is a placeholder |
| 6 | `index.html` `<title>` and meta description | "Berry Brown · Cake studio, Dubai — six signature cakes and custom cakes by Chef Safa" |
| 7 | `index.html` no-JS fallback | Same number fix |
| 8 | `src/data/zones.ts` | One Dubai zone, fee 20, free over 300; pickup row kept |
| 9 | `REVIEWS`, `STATS`, `RATING` | Add `sample: true`; Saad swaps in real ones later |
| 10 | Redirect | `barrybrown.me` → `berrybrown.me` (Cloudflare rule) |

---

## 10. Order of work

| Phase | What | Done when |
|---|---|---|
| **0 · Today (≈2 h)** | §9 fixes. Delete Lenis, hero video, grain, marquee, preloader, WhatsApp bubble, polaroids. Deploy | Live site has the right number and nothing auto-moves |
| **1 · Tokens (½ day)** | §5 into `index.css`; fonts self-hosted; `Placeholder` component; new logo files | A test page shows every type token and spacing token next to its name |
| **2 · Frame (1 day)** | Nav, hero, closing line, footer | Page top and bottom match §4.1, 4.2, 4.10, 4.11 on phone and desktop |
| **3 · Custom form (1–1½ days)** | §4.3 form, R2 upload endpoint, WhatsApp message | A test order with 3 photos arrives in Saad's WhatsApp with 3 working links |
| **4 · The Six + companies (1 day)** | Data cut to six, flat ladder, grid, menu overlay without tabs; companies section | Six cards, one price ladder; three company cards, one ENQUIRE |
| **5 · Proof (½ day)** | Safa, log, reviews static, FAQ +2 | Nothing auto-scrolls; 12 image slots total |
| **6 · Mobile pass (½ day)** | §8 on the five test sizes | Checklist below passes |

About 5 working days. Phases 1–2 can start while Saad confirms the Six's names and the flat ladder.

---

## 11. Acceptance checklist

- [ ] WhatsApp number on every link = +971 50 947 8943
- [ ] Fonts on the page: Alegreya, Jost — nothing else (`document.fonts` check)
- [ ] Colours used: the four brand colours + the two Cocoa tints — nothing else (grep `index.css`)
- [ ] Exactly one Claret element per section (walk the page with §3)
- [ ] `<img>` count ≤ 12 (excluding logo and icons)
- [ ] No element moves without user input (except the one entry fade)
- [ ] No `border-radius` above 4 px except the overlay sheet
- [ ] Page height under 7,000 px on desktop at 1440 (today: 9,865)
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95
- [ ] Custom form: 3-photo test order lands in WhatsApp with working links
- [ ] Keyboard: Tab reaches every control; Esc closes every sheet; focus returns
- [ ] `prefers-reduced-motion`: nothing animates
- [ ] Every `sample: true` item is visibly listed in `README.md` "Before launch"

---

## 12. Open items for Saad (not the coder)

| Item | Needed for |
|---|---|
| Names of the Six (Safa) | §4.4 cards, §4.3 flavour chips |
| Confirm flat ladder 150 / 200 / 280 on the site | §4.4 |
| Instagram handle | Footer, nav |
| Pickup/studio location wording | Footer, checkout |
| Real reviews + permission | §4.8 |
| Real stats (years, cakes) | §4.7 |
| Brand book edits: "not luxury" line; "Homemade cakes" tagline | Consistency |
| Photos, when they exist: the Six, hands, three log cakes | §7 |

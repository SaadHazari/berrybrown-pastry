# Berry Brown — Lively redesign (v3) · Design spec

**Date:** 27 Sep 2026 · **Owner:** Saad · **Branch:** `redesign/lively` · **Status:** approved in chat, 27 Sep
**Replaces:** the look and page order of `docs/Berry_Brown_Website_Brief_v2.md` (§3, §4, §6, §7). Brief v2 §5 (LiftKit maths, colour and type tokens) still applies.
**Business source:** `Berry Brown — Revenue Channels Implementation Brief.md` (repo root, 27 Sep).

---

## 1. Why

The brief-v2 build (live since 27 Sep, `main` d502078) reads as empty and static: small type, twelve identical Rose placeholder panels, one fade per section. The 17 Sep build (`52c5f65`) had the energy Saad wants: photos, big type, colour blocks, motion on scroll, the drifting reviews and the big footer. It also had the wrong palette, a handwriting font, a video hero, a smooth-scroll library and a marquee strip.

**Goal:** the old page's life, dressed in the new brand, plus a section for every revenue channel.

**Success looks like:**

- A visitor sees photos, big type and colour on every screen. Nothing looks unfinished.
- The logo (sprig icon + name lettering) is large: about 440 px wide in the hero on desktop, and twice today's height in the top bar.
- All six revenue channels have a place on the page. Gift boxes, workshops and company events each take a quote.
- The new custom cake form feels simple: one question at a time, three choices plus "Customised" each.
- Every word says "we", "us" or "our team". "Chef Safa" and "Safa" are gone from the site.
- WhatsApp **+971 54 794 4882** and **connect@berrybrown.me** are the only contact details anywhere.

## 2. Decisions (Saad, 27 Sep)

| Topic | Decision |
|---|---|
| Base | Bring back the 17 Sep page parts (layout, motion patterns), rebuilt on today's tokens, data layer, shop and Worker (approach A) |
| Keep from today | LiftKit spacing and type maths, logo files, the four colours, Alegreya + Jost, Stripe checkout, WhatsApp orders, Supabase, inspiration upload |
| Kill from the old site | Lenis smooth scroll, hero video, the old colours and cake-slice logo, the old custom builder, the marquee strip under the hero, the preloader |
| Photos | AI-made photos in the brand palette, about 30. They stand in until real photos exist. This overrides the brand book's "no AI-made cakes" line for now |
| Motion | Only on scroll, pointer or tap. The review rows are the one thing that moves on its own, with a pause button |
| Voice | "We / us / our team". No "I", no "Chef Safa" |
| Custom cakes | 1 week notice (revenue brief house terms). Sizes 6" from 300, 8" from 420, two tiers from 850 |
| Udora | Removed on 28 Sep (Saad). It was a small strip showing "Coming soon to Udora" |
| Cake log | Last section before the footer, folded shut |
| Delivery | Work on `redesign/lively`. Live site unchanged until Saad says "go live" |

## 3. Rule changes (CLAUDE.md and AGENTS.md)

The two files are identical; edit both the same way.

| Rule today | New rule |
|---|---|
| Nothing moves on its own … one fade-in per section is the limit | Motion happens only on scroll, pointer or tap. One exception: the review rows drift, with a pause button. No smooth-scroll library, no marquee strip, no video, no preloader. `prefers-reduced-motion` stops all of it |
| Max 12 photos. Rose placeholders until real photos exist | Photos are AI-made in the palette until real ones exist. Each has `ai: true` in `src/data/media.ts`; replace them one by one. Rose placeholder only as a fallback |
| "We", not "I" | "We", "us", "our team". Never "I", never "Chef Safa" or "Safa" on the site |
| Read brief v2 first | Read this spec first; brief v2 §5 for tokens |

28 Sep: the motion rule gained a second exception, the hero intro (§5.2).

Unchanged: logo is always a file; Alegreya for sentences, Jost for labels/buttons/prices/numbers; four colours plus Cocoa 70 and Cocoa 15; one Claret element per section; 4 px corners on cards, buttons and chips (circles allowed for icon-only buttons, avatars and dots); no exclamation marks, no "indulge / delight / treat yourself", never "homemade"; golden-ratio spacing tokens only.

## 4. Page map

| # | Section | `id` | Background | The one Claret thing |
|---|---|---|---|---|
| 1 | Deadline strip + top bar | — | Cocoa strip, Butter bar | Active-link dot |
| 2 | Hero | `top` | Butter, Rose block behind photos | "Order a cake" button |
| 3 | The Six | `the-six` | Butter | Carousel progress bar |
| 4 | Design your cake | `custom` | Rose | "Send on WhatsApp" button |
| 5 | How it works | `how` | Butter | Step numbers |
| 6 | Gift boxes (The Box) | `gift-boxes` | Cocoa | None (never Claret on Cocoa) |
| 7 | Workshops | `workshops` | Butter | "Get a quote" button |
| 8 | Company events | `events` | Rose | "Get a quote" button |
| 9 | Udora strip — removed 28 Sep | — | — | — |
| 10 | Our studio | `studio` | Butter | Two words in the headline |
| 11 | From our kitchen | `kitchen` | Butter | None |
| 12 | Kind words | `reviews` | Butter | Rating number |
| 13 | Little questions | `faq` | Butter | The open question |
| 14 | Closing | — | Butter | "Order a cake" button |
| 15 | The cake log (folded) | `log` | Butter, hairlines | Cake numbers |
| 16 | Footer | — | Cocoa | None |

Stable anchors kept: `#custom`, `#the-six`, `#faq`. `#companies` becomes an alias that lands on `#gift-boxes` (Instagram bio links use it). `?about=box|workshop|table|event` in the URL opens the matching quote sheet on load (`table` opens the event sheet with The Table picked).

## 5. Sections

Headline pattern for every content section (the old `SectionHeading`, restyled): a Jost **label** (caps, Cocoa 70), a **display2** headline in Alegreya that rises in word by word, an optional **one-liner** in Alegreya Medium Italic.

### 5.1 Deadline strip and top bar

**Deadline strip.** Full width, Cocoa, 36 px, Jost label in Butter: `DIWALI GIFT BOXES · ORDER BY 20 OCT` and a link `GET A QUOTE →` to `#gift-boxes`. It shows the next deadline that has not passed and disappears when none is left. A close button hides it for the session (`sessionStorage`, wrapped in try/catch). It sits in the normal page flow, so it scrolls away.

**Top bar.** `position: sticky; top: 0`. Butter at 92% with 8 px blur, Cocoa 15 hairline underneath.

- Height 76 px at the top of the page, 60 px after 80 px of scroll (animated). Logo `berrybrown-logo-horizontal.svg`: 56 px tall at the top, 42 px condensed; 44 px on phones.
- Hides when the user scrolls down past 400 px; comes back on any scroll up. Never hides while a dropdown or overlay is open.
- Desktop links (≥ 1024 px), Jost label style: **The Six · Custom cakes · For companies ▾ · Our studio · FAQ**. The link for the section in view gets a small Claret dot under it; the dot slides between links (scroll spy).
- **For companies ▾** opens a panel under the bar with three rows, each with a brand colour circle icon, a name and a Jost price line: Gift boxes — from AED 65 a box; Workshops — from AED 150 a seat; Company events — from AED 35 a guest. Opens on click, Enter, Space or ArrowDown; closes on Esc, outside click or choosing a row; focus returns to the trigger.
- Right side: WhatsApp icon button (desktop), bag button with a Jost count (always on desktop; on phones only when the bag has items), **Order** button in Cocoa (opens the menu overlay). The bag gives one small bump when the count goes up.
- Phones: logo · bag · Order · menu button. The menu is a full-screen Butter sheet: links in title2 with Jost numbers `01`–`07` (The Six, Custom cakes, Gift boxes, Workshops, Company events, Our studio, FAQ), then WhatsApp and email, then an **Order a cake** button, with the sprig at the foot. Links rise in with a short stagger when the sheet opens.

### 5.2 Hero (`#top`)

Desktop, 12 columns, a short top padding, so both buttons and the main photo fit the first screen from about 650 px tall (changed 28 Sep: the stacked logo pushed them off screen):

- **Left (6/12).** The `<h1>` is the tagline on two lines in Alegreya display, "Made with heart," then "not haste." in italic Cocoa 70, with the screen-reader text "Berry Brown — made with heart, not haste." It uses `t-display1`, and from 1024 px `min(5.2vw, 4.236rem)`, so each line stays on one line. Under it:
  - title3: "A cake studio in Dubai."
  - body, max 40ch: "Six signature cakes, custom cakes for the days that matter, and gift boxes and workshops for your team. All made to order."
  - Buttons: **Order a cake** (Claret, opens the menu overlay, gentle magnetic pull on desktop) and **Design your cake** (ghost, to `#custom`).
  - Rating row: three 32 px round photo avatars, a Cocoa star, `4.9 · 260+ reviews` in Jost (`RATING`, sample).
- **Right (6/12).** Photo stack on a Rose block (a Rose rectangle offset behind the photos):
  - Main photo 4:5, about 460 px wide (smaller on short laptop windows, so it fits the first screen), Butter frame, Jost caption `THE SIX · BERRY CHOCOLATE DRIP`.
  - Small photo 1:1, about 220 px, overlapping bottom-left (a slice).
  - Small photo 4:5, about 180 px, overlapping top-right (hands piping).
  - Each drifts at its own rate while the page scrolls (±40–60 px).
- **Intro (Saad, 28 Sep), once per visit.** The wide logo (`berrybrown-logo-horizontal.svg`) sits big over the tagline's place for 0.45 s, then glides and shrinks onto the top bar's logo in 0.75 s (same artwork, so it lands exactly). The tagline types in from 0.95 s, 55 ms a letter with a 250 ms pause between the lines, and a caret that goes 0.6 s after the last letter: about 2.6 s in all. Text, buttons and photos show from the first frame; the photos slide up 24 px. Any scroll, key or tap ends the intro at once. It does not play with reduced motion, on a return in the same visit, in a background tab, or when the page opens at an anchor.
- Phones: the tagline on top, text left-aligned, buttons full width and stacked, then the main photo full width with one small photo overlapping; the photo starts on the first screen. No scroll cue.

### 5.3 The Six (`#the-six`)

The old "Our favourites" carousel.

- Header row: label `THE SIX`, headline "Our signature cakes.", one-liner "Six cakes. Three sizes. 24 hours' notice." Right side: prev/next square arrow buttons (desktop) and **See the full menu** (Cocoa, opens the menu overlay).
- Row: horizontal scroll-snap, drag with the mouse, swipe on touch. Card width 360 px desktop, 78vw phone. Native scrolling only; `scrollBy` with `behavior: smooth` for the arrows is fine.
- Card: 4:5 photo, 4 px corners, hover zoom 1.05 over 700 ms; on hover a Butter chip `CHOOSE SIZE & FLAVOUR` rises in bottom-left; a 44 px Cocoa square **+** button bottom-right adds the chosen size (or the 6", which it then marks as chosen) with the first flavour, and shows the existing toast with "View bag". Jost `1 OF 6` top-left on a Butter chip. Under the photo: name (heading), one line (callout, Cocoa 70), then the three sizes as `Chip`s (`5" · 150`, `6" · 200`, `8" · 280`), each with a Jost caption and a people icon under it (`4–6`, `6–8`, `10–14`, from `serves` in `PRICE_LADDER`). No size is chosen at first; choosing one shows `SERVES 10–14` top-right on the photo, in the same Butter chip and `sm` inset as `1 OF 6` (Saad, 28 Sep). The photo opens the existing `ProductSheet` on the chosen size.
- Under the row: a hairline track with a Claret fill that follows the scroll position.
- One caption line under it: "Photos show the style. Each cake is made by hand, so yours will look a little different." (The "Written on … +50" line was removed on 28 Sep: the team talks about writing on WhatsApp.)

### 5.4 Design your cake (`#custom`)

Full-width Rose section. Label `CUSTOM CAKES`, headline "Design your cake.", one-liner "Six quick questions. We reply on WhatsApp with the price."

**Layout.** Desktop: one ticket (Saad, 28 Sep) — a single Butter card split by a dashed hairline like a tear-off stub, the stepper on the left (7/12) and "Your cake" on the right (5/12). Both halves share their top and bottom edges; nothing is sticky. Back/Next and Send sit on one bottom line under the same hairline. It replaced two separate cards whose heights never matched (the pinned ticket slid against the stepper and pushed Send below a 720 px screen). Phones: stepper full width; the ticket becomes a bar pinned to the bottom of the section.

**Stepper.** Butter card, hairline border.

- Top: six hairline segments (done = Cocoa, current = Cocoa 70, to do = Cocoa 15) and `2 OF 6` in Jost.
- The question in title2. Options in a 2 × 2 grid of option cards (44 px minimum, 4 px corners). Selected = Cocoa fill, Butter text.
- Picking a normal option moves to the next step after 250 ms. Picking **Customised** opens a one-line text box inside the step and waits for **Next**.
- **Back** (text link) and **Next** (Cocoa button, disabled until the step is answered) at the bottom.
- Step change: the new question slides in 24 px and fades; focus moves to the question heading; a polite live region reads "Step 3 of 6".

| # | Question | Options (3 + Customised) | Customised asks | Notes |
|---|---|---|---|---|
| 1 | What are we celebrating? | Birthday · Wedding · Baby shower | "Tell us the occasion" (≤ 60) | — |
| 2 | How many people? | 6–8 people · 6 inch · from AED 300 — 10–14 people · 8 inch · from AED 420 — 20–30 people · two tiers · from AED 850 | "Tell us how many people" (≤ 60) | Customised size shows "Quoted by our team" and keeps the from-price at 300 |
| 3 | Pick a look. | Soft buttercream · Fresh flowers · Drip & berries — each option card shows a small AI photo | "Describe your idea" (≤ 120) | Under the options: "Add up to 3 inspiration photos" (existing upload: JPG/PNG/HEIC, ≤ 10 MB, thumbnails with remove) |
| 4 | Pick a flavour. | Chocolate & berry · Pistachio & kunafa · Vanilla & berries | "Tell us the flavour" (≤ 60) | "A custom flavour adds AED 60" |
| 5 | Any words on the cake? | Text box (≤ 35, counter) or the **No words** option | — | Optional; Next is always enabled |
| 6 | When is it? | Date input, min today + 7 days | — | "We need a week for custom cakes. We make only two a week, so book early." |

**Ticket ("Your cake").** The right half: a 123 px (`3xl`) square photo of the chosen look (crossfades on change; the brand sprig on Rose before a look is picked) beside "Your cake" and "It fills in as you answer.", then six compact rows — Occasion, People, Look, Flavour, Words, Date — each a button that jumps back to its step and glows Rose for a moment when its answer changes. At the bottom: the from-price in large Jost (`From AED 300`; +60 with a custom flavour), the caption "Final price on WhatsApp. A 50% deposit books your date.", the link "or email connect@berrybrown.me", and **Send on WhatsApp** — a quiet outline, disabled, until steps 1–4 and 6 are answered, then Claret. The half fits a 1280 × 720 window with the card at the top.

**Phone bar.** `From AED 300 · Birthday · 6"` in Jost and the Send button once complete; before that, `STEP 2 OF 6`.

**Send.** Same flow as today: upload photos (open the tab first for Safari), build the message, `recordEnquiry({ kind: 'custom', … })`, open WhatsApp. Message starts "Hi Berry Brown, I'd like a custom cake." and lists every answer; custom answers print their text; photo links follow as `Inspiration: <url>`; if the upload fails, the last line is "I'll send my inspiration photos here."

### 5.5 How it works (`#how`)

The old three steps. Label `HOW IT WORKS`, headline "How ordering works."

| Step | Title | Text |
|---|---|---|
| 01 | Pick your cake | Choose one of the Six, or design your own. |
| 02 | Choose a day | We bake to order. The Six need 24 hours, custom cakes a week. |
| 03 | We bring it chilled | In an insulated box, anywhere in Dubai. Or collect it from us. |

Desktop: three columns. Each step has a photo in a Butter frame with a Jost caption `STEP 1`, turned −2°, 1.5° and −1°. The step number is large Jost in Claret, then the title (heading) and text (callout). A hand-drawn Cocoa 70 arrow between steps draws itself when it scrolls into view. Phones: the old sticky stack — each step card sticks under the top bar and the next one slides over it.

### 5.6 Gift boxes — The Box (`#gift-boxes`, alias `#companies`)

Cocoa section, Butter text, Butter 60 for second-level text. Label `FOR COMPANIES · 1 OF 3`, headline "The Box.", one-liner "Gift boxes for your team and your clients."

- Left: main photo 4:5 (open box, brownies and cookies, sleeve, hand-written card) with a small 1:1 photo overlapping (stack of sleeved boxes). Both drift a little on scroll.
- Right:
  - Body: "Brownies and cookies, packed by hand in our box with a sleeve and a hand-written card. Add your logo to the sleeve from 50 boxes."
  - Size rows (Jost, Butter 15 hairlines): `6 PIECES — AED 65` · `8 PIECES — AED 90` · `10 PIECES — AED 120`.
  - Facts line (label): `MIN 20 BOXES · YOUR LOGO FROM 50 · READY IN 3–5 DAYS · 2–3 WEEKS WITH YOUR LOGO · WE INVOICE YOUR COMPANY`.
  - **Order by** list (hide dates that have passed): Diwali — 20 Oct with your logo, 28 Oct plain · National Day — 10 Nov · Year-end — 27 Nov with your logo, 3 Dec plain.
  - **Get a quote** — Butter button with Cocoa text (no Claret on Cocoa). Opens the quote sheet for `box`. Text link "or email connect@berrybrown.me".

### 5.7 Workshops (`#workshops`)

Butter section, mirrored layout (text left, photos right). Label `FOR GROUPS · 2 OF 3`, headline "Make one with us.", one-liner "A 90-minute cake decorating workshop for your group."

- Body: "We bring the cakes, the tools and the know-how. Everyone decorates their own cake and takes it home. For clubs, community groups, co-working spaces and parties."
- Price rows: `AT YOUR VENUE — FROM AED 150 A SEAT` · `AT A KITCHEN WE BOOK — FROM AED 200 A SEAT`.
- Facts: `12 SEATS MINIMUM · ONE CAKE EACH · 90 MINUTES · PAID IN FULL TO BOOK`.
- **Get a quote** (Claret) → quote sheet for `workshop`.
- Photos: hands decorating small cakes on turntables at a long table (4:5); piping bags and bowls of berries (1:1).

### 5.8 Company events (`#events`)

Rose section. Label `FOR COMPANIES · 3 OF 3`, headline "Team events and dessert tables.", one-liner "In your office, on your date. Invoiced."

Two cards side by side (stacked on phones), Butter, hairline, 3:2 photo on top:

| Card | Text | Price line |
|---|---|---|
| The decorating session | 90 minutes in your office. Each person decorates a cake and takes it home. | AED 175–250 a person · 12–20 people |
| The Table | Minis of the Six for 40–60 guests. We set up, serve and clear. | AED 35–70 a guest · 40–60 guests |

Facts: `PAID IN ADVANCE · FINAL HEADCOUNT 72 HOURS BEFORE · YOU PAY FOR THE NUMBER BOOKED`. One **Get a quote** (Claret) → quote sheet for `event`.

### 5.9 Udora strip — removed (Saad, 28 Sep)

Company events now runs straight into Our studio.

### 5.10 Our studio (`#studio`)

The old story section in the team's voice.

- Left: photo composition — hands smoothing buttercream (4:5, Butter frame, turned −2°) and a small photo of fresh berries (1:1) overlapping bottom-right. Both drift on scroll.
- Right: label `OUR STUDIO`; headline "We bake the cakes we would want at our **own table**." ("own table" italic Claret); body: "Our pastry team trained in hotel kitchens. We bake in small batches, from scratch, and finish every cake by hand. We do not make fondant characters. We do not take same-day orders. We only sell cakes we have made many times."
- Stats on a hairline row, counting up once when they scroll into view: `12` years · `3,400+` cakes · `100%` from scratch (`STATS`, sample).

### 5.11 From our kitchen (`#kitchen`)

The old gallery.

- Left column, sticky on desktop: label `FROM OUR KITCHEN`, headline "Real butter, real fruit, nothing rushed.", and one tall photo (`kitchen-piping`).
- Right: two columns of six photos — the other five kitchen slots and `six-pistachio-kunafa` (mixed 3:4 and 4:3). Column A drifts up, column B drifts down while scrolling. Hover: zoom 1.05 and a Jost caption on a Butter chip. Click: the lightbox (old `Lightbox`, restyled: Cocoa 90% backdrop, 4 px corners, Jost caption `BERRY LAYERS · 1 / 6`, arrow keys, swipe, Esc, focus return).

### 5.12 Kind words (`#reviews`)

The old reviews.

- Header: label `KIND WORDS`, headline "Straight from the table.", on the right `4.9` (Claret, Jost) `from 260+ reviews` and a pause/play button.
- Two rows of review bubbles drifting in opposite directions (60 s and 70 s loops, CSS keyframes, duplicated content with `aria-hidden` on the copy). They pause on hover, on keyboard focus inside, and with the button. Reduced motion: no animation; each row becomes a native horizontal scroller. The second row is hidden on phones.
- Bubble: 4 px corners with a small tail at bottom-left; backgrounds rotate Rose → Butter (with hairline) → Cocoa (Butter text) → Rose. Five stars (Cocoa; Butter on Cocoa), the quote (body), a 40 px circle with the initial in Jost, name (Jost), `area · cake` (caption).
- Data: `useReviews()` (Supabase first, samples until real ones exist). Sample text edited: "Safa made our wedding cake…" → "They made our wedding cake…".

### 5.13 Little questions (`#faq`)

The old FAQ. Left: label `GOOD TO KNOW`, headline "Little questions.", and one AI photo in a Butter frame turned −3°, caption `ASK US ANYTHING`. Right: accordion — Alegreya question; the open question turns Claret; a round + icon turns 45° into ×; the answer opens with a height animation.

| Q | A |
|---|---|
| How early should I order? | The Six need 24 hours. Custom cakes need a week. Gift boxes need 3–5 days, or 2–3 weeks with your logo. |
| How do cakes survive the Dubai heat? | Every cake travels with ice packs in an insulated box. Keep it in the fridge until about 15 minutes before serving. |
| Is everything Halal? | Yes. We never use gelatin. Creams are set with fruit pectin or agar instead. |
| Can I add a message? | Yes. Every cake can carry a hand-piped message of up to 35 characters. |
| How do I pay? | Pay online by card or Apple Pay, or send your order on WhatsApp and pay by bank transfer or cash on delivery. |
| Do you deliver? | Yes, anywhere in Dubai for AED 20. Orders over AED 300 travel free. You can also collect from us. |
| Do you do corporate orders? | Yes. Gift boxes from 20, workshops from 12 people, and events for up to 60 guests. Tap Get a quote and we reply with a price and an invoice. |
| How do deposits work? | Custom cakes and gift boxes are confirmed with a 50% deposit. The rest is due before delivery. Workshops and events are paid in full to book. |
| Can I cancel? | Yes, with 48 hours' notice. After that we keep the deposit. |

### 5.14 Closing

The old closing. Centred: label `YOUR NEXT CELEBRATION STARTS HERE`, display1 headline "Let's bake something *lovely*." (italic, Cocoa) rising in word by word, **Order a cake** (Claret, magnetic on desktop, opens the menu overlay). Four photo cards in Butter frames float around the text, each turned a few degrees and drifting at its own speed while scrolling. Two cards on phones. `section-most` padding.

### 5.15 The cake log, folded (`#log`)

A single row between hairlines, directly above the footer: label `THE CAKE LOG`, the line "Every cake we make gets a number. The latest is #041." (number from the newest entry, Jost Claret), and a button **Open the log ▾** (`aria-expanded`, `aria-controls`). Open: the row grows (height animation) to show the three newest entries — 4:5 photo, Claret Jost number, caption `for Ayesha's dad, 60th · Classic chocolate, 8"`. Button becomes **Close the log ▴**. Data: `useLog()` (Supabase first, samples until real cakes exist).

### 5.16 Footer

The old footer, new brand.

- **Reveal.** `main` sits above the footer (`z-10`, Butter, soft shadow) and ends in a **lace edge**: a row of small Butter scallops over the Cocoa footer (the brand's lace detail, inline SVG). The footer is `sticky; bottom: 0` behind it on desktop, so scrolling to the end lifts the page off the footer. Phones: normal flow.
- **Big line.** "Made with heart," / "*not haste.*" in the giant size; line two italic in Rose; words spring up once when they enter the view; a Rose heart after "haste." brightens once (opacity 0.6 → 1, 2 s).
- **Middle.** `berrybrown-logo-on-dark.svg` at 200 px. Six square photo tiles (hover zoom); label `@handle →` linking to Instagram when `CONTACT.instagram` is set, otherwise label `FROM THE STUDIO` and no links.
- **Columns** (Jost labels in Butter 60): `SAY HELLO` — WhatsApp +971 54 794 4882 · connect@berrybrown.me; `FIND US` — location · hours; `FOR COMPANIES` — Gift boxes · Workshops · Company events.
- **Bottom row** (caption, Butter 60, hairline above): `© 2026` and the legal line "Berry Brown is a trading name of Dormers Restaurant L.L.C., Dubai. Trade licence 1433956. Not registered for VAT." Then "Photos show the style. Each cake is made by hand."

### 5.17 Floating WhatsApp button

56 px circle, Cocoa with a Butter WhatsApp glyph, bottom-right with safe-area inset. Appears after the hero leaves the view; hidden while an overlay is open; lifts above the phone bag bar when the bag has items. Hover (desktop): a Jost label `CHAT WITH OUR TEAM` slides out to the left. Prefilled text: "Hi Berry Brown, I have a question about a cake." No ping or pulse.

## 6. Quote sheet (gift boxes, workshops, events)

One component, `QuoteSheet`, on the existing `Sheet` (from the right on desktop, from the bottom on phones; focus trap, Esc, inert page). Opened with `open({ kind: 'quote', about })`.

| `about` | Fields | Rules |
|---|---|---|
| `box` | How many boxes (number) · Box size (6 / 8 / 10 pieces) · Your logo on the sleeve? (Yes / No) · Deliver by (date) · Company · Your name | Min 20 boxes; logo needs ≥ 50; date ≥ today + 5 days plain, + 21 days with logo |
| `workshop` | Date · Where (Your venue / A kitchen you book) · How many people (number) · Group name · Your name | Min 12 people; date ≥ today + 7 days |
| `event` | Which (Decorating session / The Table) · Date · How many people (number) · Office area · Company · Your name | Session 12–20 people; Table 40–60 guests; date ≥ today + 7 days |

- Header: the channel name, its price line, and the facts line from its section.
- Buttons: **Send on WhatsApp** (Claret) and **Email instead** (ghost, `mailto:` with the same text as the body).
- On send: validate, `recordEnquiry({ kind: 'company', about, answers, message })`, open WhatsApp. Message starts "Hi Berry Brown, I'd like a quote for gift boxes." (or "…for a workshop." / "…for a company event.") and lists every answer.
- Errors under each field, in Cocoa, with `role="alert"`.

## 7. Photos

**Tool.** Canva `generate-image` (MCP). The files land in Saad's Canva uploads. Download each result, then run `scripts/grade-photos.py`. If Canva cannot deliver files, stop and ask Saad before trying a paid tool (Figma Weave spends credits).

**Recipe.** Every prompt ends with the same style block:

> Editorial food photograph taken on a phone, soft natural window light from the left, warm butter-cream linen and plaster backdrop (#F6EEDF), dusty rose props (#E7CFC6), deep claret berries (#7A2A3A), dark cocoa chocolate (#3E2A21), shallow depth of field, real handmade imperfections, no text, no logos, no faces.

The Six share one set-up: the same plate, a 45° angle from the left, the same backdrop.

**Grade.** `scripts/grade-photos.py` (Pillow) makes the set look like one shoot: warm white balance, split-tone at about 25% (shadows toward Cocoa, highlights toward Butter), slight lift of the blacks, exact crop to the slot ratio, WebP at two widths (large slots 800/1600 px, small slots 480/960 px), quality 80. Output: `public/images/ai/<slot>-<width>.webp`. Originals stay out of the repo.

**Slots (31 files).**

| Group | Slots (ratio) |
|---|---|
| Hero | `hero-cake` 4:5 · `hero-slice` 1:1 · `hero-hands` 4:5 |
| The Six | `six-berry-chocolate-drip`, `six-pistachio-kunafa`, `six-berry-cream-sponge`, `six-salted-caramel-chocolate`, `six-blueberry-cheesecake`, `six-vanilla-berry-charlotte` — all 4:5 |
| Custom looks | `look-buttercream`, `look-flowers`, `look-drip`, `look-custom` (sketchbook, swatches, a pencil) — all 4:5 |
| How it works | `how-pick`, `how-bake`, `how-deliver` — 4:3 |
| Gift boxes | `box-open` 4:5 · `box-stack` 1:1 |
| Workshops | `workshop-table` 4:5 · `workshop-piping` 1:1 |
| Events | `event-session` 3:2 · `event-table` 3:2 |
| Studio | `studio-hands` 4:5 · `studio-berries` 1:1 |
| Kitchen | `kitchen-layers` 3:4 · `kitchen-crumb` 4:3 · `kitchen-cocoa` 3:4 · `kitchen-piping` 3:4 · `kitchen-packing` 4:3 · `kitchen-flowers` 3:4 |
| FAQ | `faq-coffee` 1:1 |

Reused, not new: closing cards (four of the Six), footer tiles (six of the kitchen and Six photos), log samples (three looks), hero avatars (three of the Six).

**Data.** `src/data/media.ts`: `{ src, srcSet, width, height, alt, label, ai: true }`. `Photo` renders `<img>` with `srcset`, `sizes`, explicit `width`/`height`, `loading="lazy"` and `decoding="async"`, except the hero main photo (`eager`, `fetchpriority="high"`, preloaded in `index.html`). A slot without a file falls back to the Rose `Placeholder`.

## 8. Motion

Library: `motion` (the old site's `motion/react`), wrapped in `<MotionConfig reducedMotion="user">`. Shared easings in `src/lib/motion.ts` (`ease.out = [0.16, 1, 0.3, 1]`).

| Allowed | Where |
|---|---|
| Headline words rise from a mask (0.9 s, 70 ms stagger, once in view) | Section headlines, closing, footer |
| Rise-in with stagger (opacity + 24 px, once) | Cards, rows, steps |
| Parallax, ±80 px max | Hero photos, gift-box photos, studio photos, kitchen columns, closing cards |
| Hover zoom 1.04–1.05, card lift, button 6% darker | Photos, cards, buttons |
| Magnetic pull (fine pointer only) | Hero and closing "Order a cake" |
| Top bar hide/show, condense, sliding active dot | Top bar |
| Height, rotate and slide transitions on user action | FAQ, cake log, stepper, dropdown, sheets |
| Count-up once in view (1.6 s) | Studio stats |
| Arrow draws in once in view | How it works |
| Sticky stacked cards | How it works, phones |
| Page lifts off the footer | Footer, desktop |
| Review rows drift, with pause | Kind words |
| Hero intro: the logo glides into the top bar while the tagline types (once per visit, about 2.5 s) | Hero, top bar |

Not allowed: smooth-scroll libraries, the marquee strip, video or GIF, a preloader, infinite pulses or pings, confetti, anything else that loops. With `prefers-reduced-motion: reduce`, every item above renders in its final state and the review rows stop.

## 9. Type and layout additions (`src/index.css`)

Brief v2 §5 stays. Add three display sizes on the same golden-ratio steps, Alegreya Medium (500), line-height 1.05, tracking −0.02em, lining figures:

| Token | Size | Use |
|---|---|---|
| `t-display2` | `clamp(2.058rem, 1.2rem + 3.6vw, 3.33rem)` (37 → 60 px) | Section headlines |
| `t-display1` | `clamp(2.618rem, 1.4rem + 5vw, 4.236rem)` (47 → 76 px) | Closing headline |
| `t-giant` | `clamp(3.33rem, 1rem + 10vw, 6.854rem)` (60 → 123 px) | Footer line |

Also add: `frame` utility (Butter padding `--spacing-xs`, hairline, 4 px corners — the photo frame), `lace-edge` (scalloped bottom edge), and a fixed paper-grain overlay (SVG noise tinted Cocoa, opacity 0.05, `pointer-events: none`). Spacing stays on the seven tokens (`2xs`…`3xl`).

## 10. Data, API and database

| File | Change |
|---|---|
| `src/data/content.ts` | `CONTACT`: `whatsapp: '971547944882'`, `phoneDisplay: '+971 54 794 4882'`, `email: 'connect@berrybrown.me'` (a `udora` link was added on 27 Sep and removed on 28 Sep). `STATS` become numbers for count-up (`{ value: 12, suffix: '', label: 'years' }` …, `sample: true`). `REVIEWS` edits. `FAQS` per §5.13. `STEPS` for How it works. `GALLERY` for the kitchen. Remove `OFFERS` |
| `src/data/companies.ts` (new) | Gift box sizes and facts, workshop prices and facts, the two event formats, `DEADLINES` with `{ label, branded?, plain?, date? }`, `upcomingDeadlines()`, `nextDeadline()` |
| `src/data/custom.ts` | Rewrite for §5.4: `CUSTOMISED = 'customised'`, four option lists, `CUSTOM_LEAD_DAYS = 7`, from-prices 300/420/850, `CUSTOM_FLAVOUR_ADD = 60`, `validateCustom`, `customSummary`, `customFromPrice`, step order and `isStepDone(step, form)` |
| `src/data/quote.ts` (new) | Field definitions, `validateQuote(about, form, today)`, `quoteMessage(about, form)` |
| `src/data/media.ts` | AI photo slots per §7 |
| `src/data/products.ts` | Point each cake at its `six-*` photo. Prices unchanged |
| `src/lib/order.ts` | Every message opens "Hi Berry Brown,". New `customCakeMessage` for §5.4. `enquiryMessage` replaced by `quoteMessage` |
| `src/lib/api.ts` | `EnquiryBody` company variant gains `answers` |
| `src/store/ui.tsx` | Overlay union gains `{ kind: 'quote'; about: QuoteAbout }`; `lightbox` stays |
| `worker/enquiries.ts` | Accept `about` in `box`, `workshop`, `table`, `event`; store whitelisted `answers` for company enquiries; custom answer keys add `servesOther`, `lookOther` |
| `supabase/migrations/20260927140000_enquiries_event.sql` (new) | Replace the `about` check with `('box', 'workshop', 'table', 'event')`. Apply with the Supabase MCP `apply_migration`; it only widens the check, so the live site is safe |

Stays as is: checkout, Stripe webhook, orders, zones, pricing, cart, inspiration upload, `live.ts`.

## 11. Copy, contact and SEO

- Replace every "Safa" on the site: button labels, WhatsApp texts, section copy, sample reviews, `index.html`. Search `src/`, `index.html` and `worker/` for `Safa` — none may remain outside code comments about history.
- `index.html`: title "Berry Brown · Cake studio in Dubai — signature cakes, custom cakes, gift boxes and workshops"; description "A cake studio in Dubai. Six signature cakes, custom cakes, gift boxes, workshops and dessert tables. Made to order."; JSON-LD `telephone: +971547944882`, `email: connect@berrybrown.me`, no `founder`, `priceRange: "AED 35 – AED 1,100"`; `<noscript>` with the new number; preload the hero photo.
- `README.md`: new contact details, the `Before launch` table (AI photos, Udora link, Instagram handle), the quote sheet and the migration.

## 12. Removed

`Hero`, `CustomCake`, `TheSix`, `Companies`, `Safa`, `TheLog`, `Reviews`, `Faq`, `Closing`, `Navbar` and `Footer` as they are today (replaced per §5). The placeholder-only look. The 12-photo test in `content.test.ts`.

Not brought back from the old site: Lenis, `Preloader`, `TrustMarquee`, `LoopVideo`, the hero video, `Builder` and `data/builder.ts`, `fly.ts`, confetti, the Caveat and Fraunces fonts, the old colour tokens, the cake-slice logo, the green WhatsApp bubble.

## 13. Accessibility

- Review rows: pause button (WCAG 2.2.2), pause on hover and focus, no motion with reduced motion.
- Stepper: radiogroup per step with arrow-key movement; focus to the question on step change; live region for the step count; every control ≥ 44 × 44 px.
- Dropdown: button with `aria-expanded` and `aria-controls`; Esc closes; focus returns.
- Folded log: `aria-expanded`, `aria-controls`, content `hidden` when shut.
- Lightbox and quote sheet: dialog role, focus trap, Esc, focus return, page `inert`.
- Contrast: body text ≥ 4.5:1. Never Cocoa 70 text on Rose (3.9:1) — use Cocoa. Butter 60 on Cocoa is about 5:1, fine for text.
- Every photo has real alt text. Decorative copies (review duplicates, footer tiles without links) are `aria-hidden`.

## 14. Performance

- Photos: WebP, `srcset`/`sizes`, explicit dimensions, lazy below the fold; hero main photo preloaded.
- `motion` imported from `motion/react`; `Lightbox` and `QuoteSheet` load with the lazy `Overlays` chunk.
- Targets: Lighthouse mobile Performance ≥ 85, Accessibility ≥ 95, CLS < 0.1.

## 15. Testing and acceptance

**Unit (vitest), test first:** `custom.ts` (options, from-prices, 7-day earliest date, validation, summary), `quote.ts` (rules per channel, messages), `order.ts` (new number in links, "Hi Berry Brown", custom and quote messages, no emoji, no "!"), `companies.ts` (deadline filtering, next deadline), `content.ts` (contact details, no "Safa" in sample text), `worker/enquiries.ts` (accepts `event`, whitelists answers).

**Build:** `npm test` and `npm run build` pass.

**Browser checks (Playwright, 390 / 768 / 1440 px):**

- [ ] Every section in §4 renders, in order, with photos
- [ ] Logo 440 px wide in the hero on desktop; top-bar logo 56 px tall at the top
- [ ] Fonts on the page: Alegreya and Jost only
- [ ] Colours: the four brand colours and the two Cocoa tints only (grep `src/`)
- [ ] No text "Safa" on the page; WhatsApp links all go to `wa.me/971547944882`; email is connect@berrybrown.me
- [ ] Custom stepper: keyboard only, all six steps, Customised text boxes, one photo, send opens WhatsApp with the right text
- [ ] Each quote sheet validates and builds the right message
- [ ] Review rows pause on hover, on focus and with the button
- [ ] Reduced motion: nothing moves, review rows stop, everything visible
- [ ] Cake log opens and closes with keyboard
- [ ] Top bar hides on scroll down, returns on scroll up; dropdown works with keyboard; phone menu works
- [ ] No horizontal page scroll at 390 px
- [ ] Lighthouse targets in §14

## 16. Delivery

- Commits on `redesign/lively`, one per phase.
- The migration in §10 is applied to Supabase during the build.
- `main` and the live site do not change until Saad says "go live". Then fast-forward `main` and push; Cloudflare Workers Builds deploys.

## 17. Open items for Saad (not blockers)

| Item | Where it goes |
|---|---|
| Instagram handle | `CONTACT.instagram` |
| Studio / pickup wording | `CONTACT.location` |
| Real rating, stats, reviews | `content.ts` / Supabase `reviews` |
| Real photos (shot list) | Replace `ai: true` slots one by one |
| Workshop price: 100 (YAP Club) or 150 a seat | `companies.ts` — revenue brief open point |
| Invoice issuer after the Dormers licence expires (7 Nov) | Legal line in the footer — revenue brief open point |
| Brand book line "no AI-made cakes" | Update the brand book, or replace the AI photos before print use |

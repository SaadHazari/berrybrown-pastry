# Lively redesign — final review record

Branch `redesign/lively`, 27 Sep 2026. Plan: `docs/superpowers/plans/2026-09-27-berrybrown-lively-redesign.md`. Spec: `docs/superpowers/specs/2026-09-27-berrybrown-lively-redesign-design.md`.

A fresh reviewer read the whole branch (`d502078..ec99eae`) and tested it in Chrome. Verdict: ready with fixes. All fixes below are done. Tests: 104/104. Build: ok.

## Fixed after the review

| What was wrong | Fix | Proof |
|---|---|---|
| **Critical.** On laptop windows 776–896 px tall, the pinned footer showed over the deadline strip and through the top bar. | The footer pins only when the page end is less than one screen away. | `scripts/qa-checks.mjs`: failed on the old code at 1440 × 790 and × 850, passes now. |
| A logo-box order placed on the Diwali deadline (20 Oct) could not ask for delivery before Diwali (8 Nov). | Logo boxes ask for 14 days, the short end of "2–3 weeks". | `src/data/quote.test.ts` |
| With reduced motion, How it works still faded its cards and drew its arrows. | Both now start in their final state. | `scripts/qa-checks.mjs` |
| With only 1–3 real reviews, the drifting review rows showed a gap. | The rows repeat cards to at least 8. | `src/lib/fillRow.test.ts` |
| "1,000" and Arabic digits ("٦٠") were told "The minimum is 20 boxes". Moved up from small. | They are read as numbers. Anything else gets "Type the number of …". | `src/data/quote.test.ts` |
| `grade-photos.py` ignored phone rotation, so real phone photos could come out sideways. Moved up from small. | It reads the EXIF rotation first. | A rotated test photo loads upright. |

## Decisions that wait for Saad (before "go live")

- **Sample content.** The rating, stats, reviews and cake log are samples, but they read as facts. The live site does the same. Replace them with real ones, or hide them.
- **Shadows.** Brief v2 §5.5 says "Shadows: None". The branch has soft shadows on photo frames, the lifted page and the WhatsApp button. They bring back the old site's printed-photo look. Keep them, or remove them (7 uses in 5 files).
- **Lighthouse.** Mobile Performance is 74. The spec asks for 85. The live site scores 75 under the same test. Reaching 85 needs pre-rendering (a follow-up).
- **Brand book.** It says "no AI-made cakes". The site uses AI photos until real ones exist.
- **Missing facts.** The Udora link and the Instagram handle. Also the workshop price: the site says "from AED 150 a seat", but the YAP Club booking was AED 100 a kit. Is 100 a one-off, or the new price?

## Rulings made during the build

Each line: what was decided, and what it costs if it is wrong.

1. Quote messages live in `src/lib/order.ts`, beside every other WhatsApp and email message. If wrong: one import path.
2. Photos export at 640 and 1200 px, because the Canva sources are only about 1100–1400 px wide. If wrong: slightly soft photos on very large screens.
3. Photo frames get a soft shadow. **Premise corrected in the final review:** brief v2 §5.5 does forbid shadows. See the decision above. If wrong: remove two utilities.
4. AI photos are not sent to Stripe Checkout. If wrong: the payment page shows no cake photo, as before.
5. The menu's active dot also watches the hero and the cake log. If wrong: nothing; the dot clears.
6. The hero's small photo sits lower, and the big photo's caption is on the right. If wrong: one class.
7. Split headlines keep the space between words. If wrong: nothing; checked in Chrome.
8. The custom-cake form moves focus to each new question with a callback ref. If wrong: nothing.
9. The custom-cake card does not stretch to the ticket's height. If wrong: one class.
10. The footer was rebuilt closer to the old layout, so it fits a 900 px window (776 px tall). If wrong: the logo sits in the bottom row.
11. The WhatsApp button hides once the page end is on screen. If wrong: no button over the footer (the footer has its own link).
12. Fixed a live-site bug outside the plan: the payment success popup was 29 px wide. A test now bans the Tailwind size names that caused it. If wrong: nothing.
13. Lighthouse 74 is accepted for now. See the decision above. If wrong: slow phones see the logo about 5 s after the first byte, as today.

## Rulings made after the final review

1. "1,000" and Arabic digits moved up from small to must-fix: the biggest orders could not be sent. If wrong: nothing.
2. Sideways phone photos moved up from small to must-fix: the first real photos would go live sideways. If wrong: nothing.
3. Sample content stays on the branch until Saad decides. If wrong: visitors take made-up numbers as facts.
4. Every review shows five stars (the stars value is not used). Every review today has five stars. If wrong: a real 4-star review would show five. Fix this before publishing one.
5. `/api/enquiries` has no rate limit beyond the same-site check. This branch did not change that. If wrong: a bot can fill the enquiries table. Add a Cloudflare rate limit or Turnstile.
6. The same photo added twice shares one id. If wrong: one remove tap removes both copies.
7. A stuck upload has no time limit. A blocked popup sends the tab to WhatsApp. The message still carries every answer. If wrong: "Sending…" can hang, or the visitor leaves the page.
8. Dates use the visitor's time zone, and the earliest date is set when the page loads. If wrong: a date one day too early. The team fixes it in the chat.
9. A double click can save two enquiries. If wrong: one extra row in the log.
10. "Email instead" says the email is ready even without a mail app. The address is on the page. If wrong: nothing opens, and the visitor copies the address.
11. Lighthouse 74 stays until Saad decides. If wrong: as in build ruling 13.
12. The grain overlay's blend mode stays, as the spec asks. It was not measured on slow devices. If wrong: jerky scrolling on old devices. Remove the blend mode.
13. The Supabase change was checked again (read-only): enquiries accept box, workshop, table and event. If wrong: nothing.
14. On phones, the custom-cake bar has no answer summary and no email link, as the spec asks. If wrong: phone visitors scroll to check their answers.
15. Menu cards are taller on phones, as the spec asks. If wrong: more scrolling.
16. The shadows stay until Saad decides. If wrong: remove `shadow-frame` and `shadow-page`.

## Small issues left for later

1. The enquiry log keeps old "Other" text after a preset is picked, and keeps words when "No words" is on (`src/data/custom.ts:155-157`). The WhatsApp and email text is right.
2. The deadline strip does not say when a date is for plain boxes only (from 21 Oct: "order by 28 Oct").
3. The footer headline animates out of sight. It springs up when the footer pins, behind the page.
4. Some Tailwind classes make no CSS: `-space-x-2` (hero avatars), `translate-y-2` (ProductCard, Kitchen), `translate-x-2` (WhatsApp chip). `classNames.test.ts` could ban them.
5. Some drift is more than the spec's ±80 px: Closing speeds 140 and 110, Studio offset 90.
6. The custom-cake options are toggle buttons, not the radio group in spec §13. Update the spec.
7. The look buttons read the photo's alt text before their label (`Options.tsx:22`). The inner photo should have `alt=""`.
8. Some custom-cake controls are smaller than 44 × 44 px: progress segments, Back, ticket rows.
9. The review pause button changes its label and also reports "pressed".
10. The word counter speaks on every key press (`CustomCake.tsx:183`).
11. The stats read "0" until they scroll into view (`CountUp.tsx:9`). Screen readers and search engines can get the zeros.
12. The menu dropdown stays open when you Tab out. Esc from elsewhere moves focus back to it (`Navbar.tsx:77-93`).
13. The footer headline has no real spaces, so find-in-page and copy get "Madewithheart,nothaste.".
14. After a failed quote submit, focus stays on Send (`QuoteSheet.tsx:25-31`). On phones, the errors can be off screen.
15. `?about=` stays in the address after the quote sheet closes, so a reload opens it again.
16. The phone menu does nothing when you tap the section you last jumped to. This bug is older than the redesign (`Navbar.tsx:155-157`).
17. The hero avatars load three 640 px photos (about 91 KB) for 32 px circles (`Hero.tsx:50`).
18. The srcset says 1200w, but the 4:5 and 3:4 "-1200" files are 1126 and 1088 px wide.
19. The README says "set `ai: false`", but `aiPhoto()` always sets `ai: true`. It also says the minimums live in `quote.ts`; they are in `companies.ts`.

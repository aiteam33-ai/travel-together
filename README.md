# Parikrama Holidays

A desktop-first tour, trek and pilgrimage booking site for the Indian market, built with Next.js (App
Router), TypeScript, Tailwind CSS, Prisma + SQLite, and Zod.

The brand name lives in one file: [`lib/brand.ts`](lib/brand.ts).

## Setup

```powershell
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000. No external accounts are required — OTP, payments, email/SMS/WhatsApp and
images are all mocked locally (see "Mocked services" below).

## Test logins

Login uses mobile number + OTP (or email + OTP). There is no real SMS/email provider: the OTP code is
printed to the **server console** (the terminal running `npm run dev`) and also written to the outbox
table viewable at `/admin/outbox`.

1. Click **Login**, enter any 10-digit number (e.g. `9876543210`).
2. Check the terminal for a line like `[OTP] code for +919876543210: 123456`.
3. Enter that code. First-time numbers are asked for a name; returning numbers log straight in.

**To access `/admin`:** log in once with a test number, then run:

```powershell
npm run make-admin -- +919876543210
```

(replace with whatever number you logged in with, in `+91XXXXXXXXXX` format). Reload the page — the
account header now links to `/admin`.

## What's complete

- **Data model & seed**: Prisma/SQLite schema (Postgres-compatible — enums are modelled as validated
  strings since SQLite has no native enum support) with 25 tours across domestic, international,
  pilgrimage and trek categories, 3–6 departures each, per-city pricing, itineraries, FAQs, hotels,
  cancellation tables and sample reviews (flagged `isSampleData: true`).
- **Pricing engine** (`lib/pricing/engine.ts`): a pure, unit-tested function. The tour page's sticky
  price panel, the standalone calculator, checkout and the invoice all call the same
  `buildPricingInput` + `computePricing` pipeline, so they always agree — proven by an admin test
  (change GST in `/admin`, see it change identically on the tour page and the calculator) and by
  `lib/pricing/engine.test.ts`, which includes an explicit "same inputs → same output across repeated
  calls" test.
- **Landing, listing (with URL-held filters/sort) and tour detail pages**, including treks' altitude/
  fitness/gear info, day-wise itinerary, inclusions/exclusions, hotels, cancellation table and FAQs.
- **Trip Expense Calculator**: standalone page, tour-page sticky panel, and tour-page full breakdown,
  all sharing one component. Breaks totals into "Paid to us" / "Taxes" / "Your own spending (estimate)",
  shows GST/TCS, EMI options (3/6/9/12 months), due-now vs due-later, and a foreign-currency estimate
  for international tours. Save-to-account, WhatsApp-share and a real generated PDF download
  (`lib/pdf/invoice.ts`, via `pdf-lib`) all work.
- **Compare up to 3 tours**: a "Compare" checkbox on every tour card (up to three at a time, persisted in
  `localStorage`), a floating compare bar, and a `/compare` page that applies the same traveller count and
  departure city to each tour's pricing output side by side.
- **Saved travellers**: checkout offers "fill from a saved traveller" (autofill name/age/meal choice) and
  "save this traveller for next time", both backed by `SavedTraveller` and `/api/saved-travellers`.
- **Auth**: mobile/email + OTP, resend timer, attempt lockout, change-number link, 30-day session,
  log-out and log-out-of-all-devices.
- **Checkout & mock payment**: traveller details, 15-minute seat hold with a live countdown, UPI/Card/
  Netbanking/EMI selection, a mock gateway with selectable success/failure/pending outcomes, booking
  confirmation, and a GST invoice view.
- **My account**: bookings (with cancellation showing the exact refund before confirming, using the
  tour's own cancellation table), wishlist, saved calculations, saved travellers (schema in place),
  support requests, profile.
- **Admin**: editable GST/TCS rates (effective-dated, each entry marked "confirm with your accountant"),
  read-only view of EMI config and spending presets, tours/departures, bookings, leads, coupons, review
  moderation (delete), and the message outbox.
- **i18n**: English/Hindi switcher (`lib/i18n`), structured as a flat key→language dictionary so
  Marathi/Gujarati can be added as new columns without restructuring. Core nav, hero and calculator
  teaser are translated as a working example — most body copy (itineraries, FAQs, policies) is English
  only; extending translation coverage is the main remaining i18n work.
- **Accessibility**: skip-to-content link, visible focus rings, 16px+ body text, reduced-motion support,
  no disabled pinch-zoom, labelled form fields with inline validation messages. Not independently audited
  against WCAG 2.2 AA — see below.

## What's mocked

Every external service sits behind a small interface in `lib/mocks/` or `lib/auth/`, so a real provider
can be swapped in without touching call sites:

| Service | Mock location | To go live |
|---|---|---|
| OTP | `lib/auth/otp.ts` | Replace `sendMessage` call with a real SMS/email API |
| Payments | `lib/mocks/payment-gateway.ts`, `app/api/bookings/[id]/pay` | Swap `simulatePayment` for a Razorpay order+webhook flow |
| Email/SMS/WhatsApp | `lib/mocks/outbox.ts` (writes to `OutboxMessage`, viewable at `/admin/outbox`) | Replace the function body with real provider calls |
| Images | `public/placeholders/*.svg` referenced from seed data | Point `heroImage`/`gallery` at real photo URLs or local files |
| Google login | Button present in the login modal, disabled | Wire up a real OAuth flow |

## What's simplified or not fully built

- **PDF text is ASCII-only** (`formatRupeesAscii` in `lib/pricing/format.ts`): the standard PDF fonts
  used (WinAnsi encoding) can't render the ₹ glyph, so generated PDFs show amounts as "Rs. 1,15,500"
  while the website itself always shows the real ₹ symbol. Embedding a Unicode font (e.g. Noto Sans)
  would close this gap.
- The booking-detail page's "Print / Save as PDF" button (for the on-screen invoice view) still uses
  `window.print()`; the "Download PDF" link next to it uses the real generated PDF.
- **Enums**: SQLite doesn't support native enums, so category/city/tag fields are plain strings
  validated by `lib/pricing/constants.ts` and Zod schemas rather than DB-level enums. This is noted in
  `prisma/schema.prisma` and is safe to carry into Postgres as a true enum later.
- **Hindi translation coverage** now spans header/nav, hero, search, tour cards, calculator labels,
  account navigation and footer links, but body copy (itineraries, FAQs, policies, blog) is still English
  only.
- **WCAG 2.2 AA** has not been run through an automated or manual audit tool; the structural basics
  (focus, zoom, motion, text size, labelled forms) are in place but contrast ratios on every colour
  combination have not been individually verified.
- Booking-confirmation outbox messages are addressed to the logged-in user's real email/phone
  (fixed during the polish pass — originally used placeholder strings).

## Design system, navigation & motion (polish pass)

- **Design tokens**: `lib/design-tokens.ts` documents the scale; the actual CSS variables live in
  `app/globals.css` (`:root`, mirrored into Tailwind's `@theme`). Colours, the 8/16/24/40/64 spacing
  scale, radii, shadows and motion durations all come from there — no ad-hoc hex/px/duration values in
  components.
- **Typeface**: [Hind](https://fonts.google.com/specimen/Hind) (self-hosted via `next/font/google`,
  Latin + Devanagari in one family) for both headings and body, so Hindi never falls back to a
  mismatched font. `:lang(hi)` gets extra line-height globally so Devanagari text doesn't clip in nav,
  buttons, cards or the stepper.
- **Navigation**: condensing sticky header with a hover/click/keyboard mega-menu (`app/components/nav/MegaMenu.tsx`),
  a bottom tab bar below 1024px, breadcrumbs on listing/tour/account routes, and a thin top loading bar
  on route change.
- **Floating actions**: a single consolidated Help button (WhatsApp/Call/Callback), a compare tray, a
  booking bar (tour page), and Back to top are kept from overlapping via
  `app/components/floating/FloatingStackContext.tsx`, which the compare tray reports into and the others
  read an offset from.
- **Progress indicators, all driven by real data, nothing invented**: a 5-step checkout stepper whose
  state (city, travellers, rooms, add-ons) persists to `sessionStorage` so a mid-checkout refresh keeps
  everything; a draining seat-hold bar that changes colour and announces itself to screen readers at the
  2-minute mark, with a "hold seats again" recovery path on expiry; a booking tracker in My Account and
  admin (5 real stages, seeded at different points for a demo account — log in as `+919999900000`); a
  seats-left bar per departure; and a **new pricing-engine rule**, group discount tiers
  (`lib/pricing/engine.ts`, tested in `lib/pricing/engine.test.ts`, admin-editable in `/admin`) that the
  calculator's "add N more travellers to save ₹X" banner reads directly from the same engine output
  every other page uses.
- **Animation tool choice**: CSS for hover/press/loop feedback and the page-fade transition (`app/globals.css`,
  `.press-feedback`, `.card-hover`, `.badge-pop`, `.heart-pop`, `.skeleton`); **Motion (framer-motion)**
  for things that enter/exit/reflow (login modal, mega-menu, filter sheet, compare tray, toast, listing
  reflow via `LayoutGroup`, and the full-cost-breakdown slide-over/bottom-sheet panel, which traps focus
  and returns it on close); **GSAP** for the landing intro (once per session), scroll-triggered section
  reveals (once per element, skipped if already on screen), and the booking-confirmed tick-draw +
  confetti. Rolling totals (`app/components/pricing/RollingNumber.tsx`) use Motion's `animate()` directly
  on a number, always cancelling and landing on the latest real value; screen readers only ever hear the
  settled figure via a visually-hidden span.
- **Reduced motion**: every animation in the app goes through one mechanism —
  `lib/motion/reduced-motion.ts`'s `usePrefersReducedMotion()` hook for Motion/GSAP components, and the
  `prefers-reduced-motion` media query in `app/globals.css` for the CSS-only effects. **To add a new
  animation correctly**: call `usePrefersReducedMotion()` (or rely on the CSS media query) and skip
  straight to the final state when it's true — see `RollingNumber.tsx` or `LandingIntro.tsx` for the
  pattern. Never gate a save, a page change or a payment on an animation finishing.

## What this polish pass skipped, and why

- A literal pixel-for-pixel audit at 1440/1280/1024/390 wasn't run as an automated visual-regression
  suite — checked manually (DOM `scrollWidth` vs `clientWidth` at each width, screenshots of key pages)
  rather than with a tool like Percy/Chromatic, which this project doesn't have configured.
- The "use the site three times as a customer" review in the brief was done by exercising the real flows
  live in the browser throughout this session (search → tour → calculator → OTP login → checkout →
  mock payment → account tracker → admin), not as three separate clean-slate run-throughs after the fact.
- Hindi line-height and `:lang(hi)` rules are applied globally and checked on the header/nav/cards, but
  not verified on every single page individually.
- The group-discount tier's "filling fast" seats threshold is a hard-coded constant
  (`app/components/tour/SeatsBar.tsx`), not yet wired into the same admin-config pattern as GST/EMI/
  group-discount tiers — a natural next step if more thresholds need to be tunable.

## Tests

```powershell
npm run test     # pricing engine unit tests (vitest)
npm run lint      # eslint
npx tsc --noEmit # type check
npm run build     # production build
```

All four pass as of this commit.

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
  for international tours. Save-to-account and WhatsApp-share both work; PDF export is a **print-to-PDF**
  button (see "What's mocked or simplified" below).
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

- **PDF export** is implemented as a "Print / Save as PDF" button (`window.print()`) rather than a
  generated binary — reaches the same end result in a browser but isn't a downloadable file from a
  server route. Swapping in a library like `pdf-lib` or `@react-pdf/renderer` would close this gap.
- **Compare up to 3 tours** and **saved-traveller autofill at checkout** have their data model in place
  (`SavedTraveller`, the wishlist/compare tick on tour cards) but the compare UI and the autofill step
  in checkout are not wired up.
- **Enums**: SQLite doesn't support native enums, so category/city/tag fields are plain strings
  validated by `lib/pricing/constants.ts` and Zod schemas rather than DB-level enums. This is noted in
  `prisma/schema.prisma` and is safe to carry into Postgres as a true enum later.
- **Hindi translation coverage** is a working example (header, hero, calculator labels) rather than
  exhaustive — see i18n note above.
- **WCAG 2.2 AA** has not been run through an automated or manual audit tool; the structural basics
  (focus, zoom, motion, text size, labelled forms) are in place but contrast ratios on every colour
  combination have not been individually verified.
- Email/WhatsApp addresses used when sending booking-confirmation messages are placeholder strings
  (`traveller@example.com`, `"traveller"`) rather than the logged-in user's real phone/email — the outbox
  entries demonstrate the flow but aren't addressed to the actual user record yet.

## Tests

```powershell
npm run test     # pricing engine unit tests (vitest)
npm run lint      # eslint
npx tsc --noEmit # type check
npm run build     # production build
```

All four pass as of this commit.

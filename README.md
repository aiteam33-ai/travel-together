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

## My Socials (collaborative layer)

Tagline: "Travel, together." A trip is still bookable entirely solo — My Socials is additive, never required.

- **Three separate relationships, modelled as such**: `GroupMember` (planning access), a booking traveller
  (a name in `Booking.travellersJson`), and `ExpenseParticipant` (who shares one cost) are three distinct
  tables/concepts. Joining a group never creates a traveller; a traveller need not be a member.
- **Groups & invitations**: create a group any time (before or after choosing a tour), invite by a
  7-day shareable link (`GroupInviteLink`, revocable) or by name + mobile number. A phone-invited person is
  "invited" until they sign in with that number, which the OTP route (`app/api/auth/verify-otp/route.ts`)
  auto-detects and flips to "joined". Roles are organiser/member; a member who appears in any expense is
  marked "left" rather than deleted.
- **Shared trip space**: `/socials/[id]` with Overview / Plan / Expenses / Members tabs. The feed
  (`GroupFeed.tsx`) polls every 15s and refreshes on window focus, exactly as specified — not live chat.
- **Group cost estimate**: the same `TripCostCalculator`, with a `groupId` prop that pre-fills the
  traveller count from joined members and saves the result to the group via
  `/api/groups/[id]/estimate`, which calls the identical `buildPricingInput` + `computePricing` pipeline
  used everywhere else.
- **Shared expenses & balances**: a pure, unit-tested module (`lib/expenses/engine.ts`, mirroring the
  pricing engine's shape) handles equal/custom splits — leftover paise from an uneven equal split go to
  the payer first, then participants in order — and balance/settlement-suggestion math. Balances are
  always computed live from expenses + settlements, never stored.
- **Booking from a group**: "Book for this group" on the group Overview carries `?groupId=` through the
  tour page into checkout; only the group's organiser may create a booking linked to a group
  (enforced server-side in `app/api/bookings/route.ts`). The checkout traveller step can prefill names from
  joined members. Group members see only booking status and balance-due date — never the invoice, payment
  method or traveller documents, which stay visible only to whoever booked. After payment, "Add this
  booking to group expenses" creates a pre-split expense from the amount paid, editable afterwards like
  any other expense.
- **Privacy & access**: every group/feed/expense API route calls `requireMembership()`
  (`lib/groups/access.ts`), which 404s for non-members rather than revealing the group exists — covered by
  `lib/groups/access.test.ts`, an integration test against the real dev database. Display names are
  visible to the group; mobile numbers are masked (`MembersList.tsx`); invitations are rate-limited
  (20/hour) via a `ProductEvent` count.
- **Admin additions**: an audit log (`/admin/audit-log`) records every GST/TCS and group-discount change
  with who/when/old/new value; a basic analytics page (`/admin/analytics`) reports calculator use, invite
  acceptance rate, share of groups with an expense, and checkout completion, derived from recorded
  `ProductEvent` rows.
- **Entry points**: "My Socials" in the top bar (unread badge) and in place of Wishlist on the mobile tab
  bar (Wishlist moved into Account); "Plan this with your group" (tour page), "Share with a group"
  (calculator), "Create a group for this trip" (booking confirmation); the landing page's hero and a new
  three-step explainer section were repositioned around "Travel, together".
- **Not built**: voting on the shortlist (brief marks this "only if everything above is finished" — it
  wasn't reached, given the size of sections 1–8).

### Demo: two people, two browser windows

Three demo accounts exist after seeding, with a shared "Demo Trip Group" (not the "Goa Weekend" you'll
create live) that has members at every status, two expenses (one equal split, one custom) and one
settlement:

| Phone | Role in Demo Trip Group |
|---|---|
| `+919999900000` | Member ("Demo Traveller") |
| `+919999900001` | Organiser ("Demo Organiser") |
| `+919999900002` | Member ("Demo Member") |

Log in as `+919999900001` in one window and `+919999900000` (or any brand-new number) in another — the
OTP for each prints to the server console as usual. To see a fresh join: as the organiser, open the
group's Members tab → Invite people → Get invite link, then open that `/invite/<token>` link in the
second window and sign in.

### PDF export

`/overview` is a real page in the app (two sections, each one print page) with a dedicated print
stylesheet (`app/overview/overview.css`) that hides all site chrome (header, footer, floating buttons) via
`print:hidden`. It's exported with **Puppeteer** — the simplest reliable option: a real headless Chrome
renders the page exactly as a browser would (same fonts, colours, print CSS) and prints it, rather than
hand-assembling a PDF with a layout engine that doesn't know the site's design tokens.

```powershell
npm run dev                 # in one terminal
npm run export-overview-pdf # in another — writes docs/product-overview.pdf
```

Checked: exactly 2 pages, no clipped text or blank trailing page, three real screenshots (captured live
from the running app) in the "product, as built" section, ₹ renders correctly (it's a screenshot, not
drawn text, so the PDF-font ₹ limitation noted above doesn't apply here).

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

## Welcome / onboarding screen (`/welcome`)

A full-screen, chromeless landing page (no site header/footer — see "Chromeless routes" below): a looping
scenery-montage background video, two quick questions, and a redirect into a pre-filtered `/tours` list.

**Redirect + preference logic**:
- `middleware.ts` is the real no-flash guard: it checks the `welcome_seen` cookie on every request to
  `/welcome` and redirects to `/` *before the page ever renders* if it's already set — a returning visitor
  never sees so much as a flicker of this page. `app/welcome/WelcomeExperience.tsx` (client-side) also
  checks `localStorage.welcome_seen` on mount as a same-tab fallback, in case middleware is ever bypassed
  (e.g. a cached response).
- The flag is set — both the cookie (via `markWelcomeSeen()`, read by middleware) and localStorage (read by
  this page) — only when the visitor actually continues ("Show my tours →") or explicitly skips, not just
  from viewing the page.
- Both chip groups (`ChipGroup`, single-select, full `radiogroup`/`radio` ARIA + roving-tabindex arrow-key
  navigation) write their selection into `localStorage.parikrama_prefs` as `{ tag, city }` on every change,
  so a selection survives even across a "Skip".
- "Show my tours →" builds `/tours?tag=...&city=...`, omitting whichever param wasn't selected (the button
  is never disabled). The homepage's `SearchBar` reads `parikrama_prefs.city` once on mount and pre-selects
  that departure city in its own dropdown.
- A `useRef` guard in the mount effect survives React's dev-only Strict Mode double-invoking effects —
  without it, the second (intentional, dev-only) invocation would read back the flag the first invocation
  had just written and immediately redirect the page away from itself on every fresh visit in `next dev`.

**Chromeless routes**: the root layout (`app/layout.tsx`) always renders the normal site shell
(Header/Footer/nav/floating widgets) — a fully chromeless page like `/welcome` instead covers them with its
own `fixed inset-0` overlay (see `app/welcome/WelcomeExperience.tsx`) and hides the body scrollbar for as
long as it's mounted. This used to be decided per-request in the layout via `headers()` (reading a pathname
header `middleware.ts` forwarded), but calling `headers()`/`cookies()` in the root layout forces the *entire
app* into fully dynamic, no-static-generation rendering — a sitewide performance cost paid on every route
just for one chromeless page. Give any other page the same full-screen treatment by having its own content
cover the shell the same way, rather than adding back a path-based check in the layout.

**Scenery video** (`app/components/welcome/HeroVideo.tsx` + `app/welcome/clips.ts`):
- `clips.ts` exports a `CLIPS` array (`mp4`, optional `webm`, `poster`, `caption`, `durationMs`) —
  `HeroVideo` just loops through whatever's in it, crossfading (1s opacity transition) from one clip to the
  next on a timer, with the *next* clip's `<video>` already mounted underneath (`preload="auto"`) so there's
  no blank frame at the crossfade.
- The caption in the bottom-left fades with the active clip; a pause/play button (bottom-left, labelled via
  `aria-label`) lets a visitor stop the motion; the video also auto-pauses whenever the tab isn't visible
  (`document.visibilitychange`).
- `prefers-reduced-motion`: no `<video>` element is mounted at all — only the active clip's static poster
  image, full-bleed, no motion.
- **Swapping scenery clips**: drop new files in `public/videos/`, add an entry to `CLIPS` in
  `app/welcome/clips.ts` pointing at them (plus a poster image — any photo works, including a remote URL
  via `tourPhotoUrl`), and remove/reorder entries as you like. Recommended specs per clip: **720p, under
  4 MB, 6–8 seconds, mp4 (H.264) required** — a `.webm` source is optional (browsers fall back to mp4 fine
  without it) and can be added later with any video tool if you want marginally smaller file sizes.
- **Current clips are placeholders**: `hero-1/2/3.mp4` are free-license generic nature stock footage
  (mountains / water / dusk architecture — not actually Indian locations), downloaded because there was no
  `ffmpeg` available in this environment to re-encode or generate `.webm`/poster-frame versions from real
  footage. Replace them with real India-location clips (Himalayan trek, Kerala backwaters, a Rajasthan fort,
  Varanasi ghats, a Goa/Andaman coastline — the brief's suggested 5-clip order) for the real version of this
  page; the `CLIPS` config and `HeroVideo` component need no changes to support that, just new files.

**Design system**: `/welcome`'s palette (deep indigo `welcome-primary`, saffron `welcome-accent`, warm
off-white `welcome-text`, and a 55%-opacity overlay base `welcome-overlay`) lives in `tailwind.config.ts`,
merged into the site's existing Tailwind v4 `@theme` (defined in `app/globals.css`) via the `@config`
directive at the top of that file. The `welcome-*` prefix keeps it from ever colliding with or overriding
the site-wide tokens the rest of the app uses. Headings use Fraunces, UI text uses Inter, both loaded via
`next/font/google` directly in `WelcomeExperience.tsx`.

## Tests

```powershell
npm run test     # pricing engine unit tests (vitest)
npm run lint      # eslint
npx tsc --noEmit # type check
npm run build     # production build
```

All four pass as of this commit. The suite includes `lib/pricing/engine.test.ts` (pricing parity),
`lib/expenses/engine.test.ts` (splits, balances, settlement suggestions), and
`lib/groups/access.test.ts` (an integration test against the real dev SQLite database — it creates and
cleans up its own rows, and needs `npm run db:seed` to have been run at least once so a tour exists to
attach a test group to).

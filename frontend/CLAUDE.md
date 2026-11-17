PRODUCT
- AstroGuide: a private AI astrology guide for students and young professionals in India (18-32).
- They face career, relationship, marriage or self-doubt decisions they cannot discuss with family.
- Promise: consistent (same chart + same question = same core reading), private, simple, direct (reasoning from the chart + ONE clear next step).
- Mobile-first website, not an app. Most users arrive from Instagram, WhatsApp and YouTube links, on Android phones, often on slow networks.

USERS' LANGUAGE
- English, Hinglish and Hindi. Every piece of text on screen comes from one translations file, never written directly in a page.

DATA RULES (front end only for now)
- All fake data and fake responses live in ONE folder (lib/mock). Every page gets data through functions in lib/api.js (for example getChart, askQuestion, getDailyUpdate, startSubscription), so the real backend can replace them later without changing any page.
- Fake answers must be deterministic: the same birth details and the same question always return the same answer.
- The front end never calculates planetary positions. Chart data always comes from lib/api.js.

DESIGN RULES
- Phone first (design at 360px wide, then grow). One question per screen during onboarding.
- Buttons at least 48px tall. Body text at least 16px. Strong contrast. Spacing in multiples of 8px.
- Suggested questions shown as tappable chips, so users never face an empty box.
- Every animation respects the "reduce motion" setting and never makes the user wait.

TRUST AND SAFETY RULES
- Readings are guidance, not medical, legal or financial advice. Never predict death, illness or investment outcomes.
- Birth details are personal data under India's DPDP Act: ask for consent before collecting them, explain why, and let users delete everything.
- Never show personal details on a shareable screen.

HOW TO WORK WITH ME
- I am a beginner. Explain in plain words, briefly.
- Change only what I ask. Keep everything that already works.
- When done, tell me what to click to test it.

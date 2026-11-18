// Feature flags for the front end, hand-edited (not user-facing).
export const PAYWALL_ENABLED = false; // flip to true once ready to charge; lets early testers use the app free.
export const WAITLIST_MODE = false; // when true, the landing page button opens a waitlist form instead of onboarding.

export const PRICE_INR = 199; // monthly price shown on Plans + the paywall sheet.
export const DAILY_PRICE_INR = Math.ceil(PRICE_INR / 30); // shown as "that's about ₹X a day".
export const GET_STARTED_MINUTES = 2; // shown in the trust strip under "Get my free reading".

// "Why trust us" proof block on Plans/paywall. Each item is shown only when
// true, and only with real data filled in below — never fabricate numbers,
// counts or quotes.
export const TRUST_PROOF = {
  showFounder: true,
  showResearch: true,
  showTesterResults: false, // flip on once there are >=30 trust-test results.
  showQuotes: false, // flip on once real, permissioned quotes exist below.
};

// Up to 3 real quotes. Only ones with permission: true are ever shown.
export const TESTER_QUOTES = [
  // { text: "...", name: "A.", age: 24, city: "Pune", permission: false },
];

export const TESTER_RESULTS_MIN_SAMPLE = 30; // minimum trust-test results before showing a match rate.

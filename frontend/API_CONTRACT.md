# API Contract — `lib/api.js`

Every page talks to the product only through these functions. Right now each
one is backed by deterministic fake data in `lib/mock/`. A real backend
should replace the body of each function to match this exact signature and
return shape, so no page needs to change.

All functions are `async` (return a Promise) and currently simulate network
latency with a fake delay.

---

## `getChart(birthDetails)`

Computes/fetches the natal chart for a birth profile.

**Receives**
```js
birthDetails = {
  name: string,
  date: string,       // "YYYY-MM-DD"
  time: string,       // "HH:MM", 24h — empty string if unknown
  timeUnknown: boolean,
  roughTime: string,  // "morning" | "afternoon" | "evening" | "night" — only set if timeUnknown
  place: { name: string, state: string, lat: number, lon: number, tz: string },
}
```

**Returns**
```js
{
  ascendant: string,        // sign name, e.g. "Leo"
  moonSign: string,
  sunSign: string,
  runningDasha: string,     // planet name
  runningDashaHouse: number, // 1-12
  transitPlanet: string,    // planet name
  transitHouse: number,     // 1-12
}
```

**Example**
```js
await getChart({
  name: "Priya", date: "1996-03-22", time: "19:30", timeUnknown: false,
  roughTime: "", place: { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, tz: "Asia/Kolkata" },
})
// => { ascendant: "Virgo", moonSign: "Leo", sunSign: "Leo", runningDasha: "Jupiter",
//      runningDashaHouse: 8, transitPlanet: "Jupiter", transitHouse: 5 }
```

---

## `askQuestion(birthDetails, questionText)`

Gets a reading for a free-text question (used by chat and the trust test).
**Must be deterministic**: the same `birthDetails` + same `questionText`
(case-insensitive, same trimmed string) always returns the same reading.

**Receives**
- `birthDetails` — same shape as above.
- `questionText: string` — the user's raw question.

**Returns**
```js
{
  chart: { /* same shape as getChart()'s return value */ },
  chartReason: string,   // 1-2 sentences naming a dasha/transit/house
  whatItMeans: string,   // 1-2 plain-language sentences
  nextStep: string,      // exactly one concrete action
}
```

**Example**
```js
await askQuestion(birthDetails, "Should I take this job offer?")
// => {
//   chart: { ascendant: "Virgo", ... },
//   chartReason: "Your chart shows Jupiter running through your 8th house, while Jupiter transits your 5th house.",
//   whatItMeans: "This is a phase for steady, practical effort rather than big leaps...",
//   nextStep: "Write down one small action you can take this week and do just that one thing.",
// }
```

---

## `getDailyUpdate(birthDetails, openQuestion)`

Gets today's daily update, tied to the user's open question if they have one.

**Receives**
- `birthDetails` — same shape as above.
- `openQuestion: string | null` — the question the user is "following" on Today.

**Returns**
```js
{
  date: string,            // "YYYY-MM-DD", today
  oneLineSummary: string,  // "An active day for you."
  reading: { chartReason, whatItMeans, nextStep, chart },  // same shape as askQuestion()'s return value
  goodTimeFor: string,     // activity name
  carefulWith: string,     // activity name
  luckyColour: string,
}
```

**Example**
```js
await getDailyUpdate(birthDetails, "Should I take this job offer?")
// => { date: "2026-11-18", oneLineSummary: "A steady day for you.", reading: {...},
//      goodTimeFor: "a long journey", carefulWith: "signing a document", luckyColour: "Saffron" }
```

---

## `submitTrustResult(result)`

Logs the outcome of a trust-test (past-event) reading, for the match-rate metric.

**Receives**
```js
{
  event: string,         // user's description of the past event
  monthYear: string,     // "YYYY-MM"
  area: string,          // "areaCareer" | "areaRelationship" | "areaFamily" | "areaMind" | "areaMoney" | "areaMove"
  result: { chartReason, whatItMeans, nextStep, chart },
  feedback: string,       // "matches" | "partly" | "no_match"
  note: string,           // optional free text on what was different
}
```

**Returns** `{ success: true }`

**Example**
```js
await submitTrustResult({
  event: "Why did my career stall in 2023?", monthYear: "2023-06", area: "areaCareer",
  result: {...}, feedback: "matches", note: "",
})
// => { success: true }
```

---

## `startSubscription()`

Starts a paid subscription (UPI payment in production).

**Receives** nothing.

**Returns** `{ success: true }`

**Example**
```js
await startSubscription()
// => { success: true }
```

---

## `submitWaitlist(entry)`

Records a waitlist signup (used only when waitlist mode is on — see `lib/config.js`).

**Receives**
```js
{
  name: string,
  contact: string,        // WhatsApp number or email
  decision: string | null, // "areaCareer" | "areaRelationship" | "areaMarriage" | "areaSelfDoubt" | "other" | null
}
```

**Returns** `{ success: true }`

---

## `readPalm()`

Reads a palm photo (feature-flagged, front-end only for now; the photo
itself is never sent to this function in the current build — see
`lib/config.js`).

**Receives** nothing yet (a real implementation would take the photo file/blob).

**Returns**
```js
{ summary: string }
```

**Example**
```js
await readPalm()
// => { summary: "Your lines suggest a steady, practical streak with one strong creative line." }
```

---

## Not in `lib/api.js` (handled client-side only)

These are **not** part of the backend contract — they run entirely in the
browser and have no server equivalent yet:
- `lib/analytics.js` → `track(eventName, details)` / `getEvents()` — event logging, local only.
- `lib/mock/cities.js` → `searchCities(query)` — place autocomplete; a real
  backend should expose this as `GET /places?q=` per the original spec.
- `lib/mock/safety.js` → `containsDistressSignal(text)` / `matchedBlockedTopic(text)` —
  the safety gate. In production this classification should move server-side.

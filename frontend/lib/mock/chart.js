// Fake chart + reading data. Deterministic, never random, so the same
// birth details + question always give the same answer.

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const HOUSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// Simple deterministic string hash (djb2), stable across sessions.
// Masked to 31 bits so it's always a non-negative value safe to use with
// bitwise shifts (`>>`) elsewhere without flipping sign.
export function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0) & 0x7fffffff;
}

export function fakeChartFor(birthDetails) {
  const key = `${birthDetails?.date || ""}|${birthDetails?.time || ""}|${birthDetails?.place?.name || ""}`;
  const h = hashString(key || "default");
  return {
    ascendant: SIGNS[h % 12],
    moonSign: SIGNS[(h >> 2) % 12],
    sunSign: SIGNS[(h >> 4) % 12],
    runningDasha: PLANETS[(h >> 6) % PLANETS.length],
    runningDashaHouse: HOUSES[(h >> 8) % 12],
    transitPlanet: PLANETS[(h >> 10) % PLANETS.length],
    transitHouse: HOUSES[(h >> 12) % 12],
  };
}

const READING_TEMPLATES = [
  {
    shows: "Your chart shows {dasha} running through your {dashaHouse} house, while {transit} transits your {transitHouse} house.",
    means: "This is a phase for steady, practical effort rather than big leaps. What you build quietly now tends to last.",
    step: "Write down one small action you can take this week and do just that one thing.",
  },
  {
    shows: "With {dasha} active in your {dashaHouse} house and {transit} moving through your {transitHouse} house, there's real movement around this area.",
    means: "Change is already in motion, even if it doesn't feel obvious yet. Patience matters more than force right now.",
    step: "Have one honest conversation with the person most involved in this, this week.",
  },
  {
    shows: "Your {dashaHouse} house, ruled by the {dasha} period, is being lit up by {transit} passing through your {transitHouse} house.",
    means: "This points to a turning point rather than a routine stretch. Decisions made now carry extra weight.",
    step: "Before deciding anything big, sleep on it for three days, then decide.",
  },
  {
    shows: "{dasha}'s period in your {dashaHouse} house, combined with {transit} in your {transitHouse} house, favours clarity over comfort.",
    means: "You may be avoiding a decision that's actually simpler than it feels. The chart favours facing it directly.",
    step: "List the two real options you're choosing between, nothing else.",
  },
  {
    shows: "The {dasha} dasha sitting in your {dashaHouse} house, with {transit} transiting your {transitHouse} house, brings outside attention to this area.",
    means: "Other people's opinions will be loud right now. Your own judgment still matters more.",
    step: "Ask one person you trust for a second opinion, then decide for yourself.",
  },
  {
    shows: "Your {dashaHouse} house is active under {dasha}, and {transit} is currently transiting your {transitHouse} house.",
    means: "This is a slow-build period. Results may lag behind effort for a while, which is normal here.",
    step: "Set a check-in date 30 days from now to review progress, not today.",
  },
  {
    shows: "{dasha} in your {dashaHouse} house, together with {transit} moving through your {transitHouse} house, suggests unfinished business resurfacing.",
    means: "Something from the past connected to this area is likely to come back up. It's asking to be closed, not reopened.",
    step: "Close one small loose end related to this, today.",
  },
  {
    shows: "With {dasha} ruling your {dashaHouse} house and {transit} crossing your {transitHouse} house, this is a period of visible results.",
    means: "What you've been working on quietly is more likely to show up now, for better or worse.",
    step: "Prepare for the outcome you're least ready for, just in case.",
  },
  {
    shows: "Your {dashaHouse} house under {dasha}, plus {transit} transiting your {transitHouse} house, points to a need for boundaries.",
    means: "You may be giving more than you're getting in this area right now. The chart favours a clearer line.",
    step: "Say no to one request related to this, this week.",
  },
  {
    shows: "{dasha}'s influence on your {dashaHouse} house, with {transit} in your {transitHouse} house, favours restarting rather than pushing through.",
    means: "What hasn't worked so far in this area likely won't work by trying harder the same way.",
    step: "Change one specific approach you've been repeating, starting this week.",
  },
];

function ordinal(n) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const rem10 = n % 10;
  if (rem10 === 1) return `${n}st`;
  if (rem10 === 2) return `${n}nd`;
  if (rem10 === 3) return `${n}rd`;
  return `${n}th`;
}

export function pickReading(birthDetails, questionText) {
  const chart = fakeChartFor(birthDetails);
  const key = `${birthDetails?.date || ""}|${birthDetails?.time || ""}|${(questionText || "").trim().toLowerCase()}`;
  const h = hashString(key);
  const template = READING_TEMPLATES[h % READING_TEMPLATES.length];
  const vars = {
    dasha: chart.runningDasha,
    dashaHouse: ordinal(chart.runningDashaHouse),
    transit: chart.transitPlanet,
    transitHouse: ordinal(chart.transitHouse),
  };
  const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
  return {
    chart,
    chartReason: fill(template.shows),
    whatItMeans: fill(template.means),
    nextStep: fill(template.step),
  };
}

export function fakeDailyUpdate(birthDetails, openQuestion) {
  const chart = fakeChartFor(birthDetails);
  const dayKey = new Date().toISOString().slice(0, 10);
  const h = hashString(`${dayKey}|${birthDetails?.date || ""}|${openQuestion || ""}`);
  const activities = ["starting something new", "a difficult conversation", "signing a document", "a long journey", "spending money", "resting"];
  const colours = ["Gold", "Deep blue", "Emerald green", "Maroon", "White", "Saffron"];
  const reading = pickReading(birthDetails, openQuestion || "today");
  const mood = ["steady", "reflective", "active", "quiet", "eventful"][h % 5];
  const article = /^[aeiou]/i.test(mood) ? "An" : "A";
  return {
    date: dayKey,
    oneLineSummary: `${article} ${mood} day for you.`,
    reading,
    goodTimeFor: activities[h % activities.length],
    carefulWith: activities[(h >> 3) % activities.length],
    luckyColour: colours[(h >> 6) % colours.length],
  };
}

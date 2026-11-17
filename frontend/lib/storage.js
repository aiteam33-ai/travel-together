// Thin localStorage wrapper. Safe to call during SSR (no-ops to undefined).
const KEY = "astroguide_state_v1";

const DEFAULT_STATE = {
  language: null, // "english" | "hinglish" | "hindi"
  consentGiven: false,
  ageConfirmed: false,
  birthDetails: null, // { name, date, time, timeUnknown, roughTime, place }
  trustTest: null, // { event, monthYear, area, result, feedback, note }
  chat: [], // [{ id, role, text, reading?, feedback?, isOpenQuestion?, createdAt }]
  openQuestion: null,
  todaySeenDate: null,
  whatsappDailyRequested: false,
  subscribed: false,
  freeReadingUsed: false,
  paywallDisabled: true, // lets first testers use it free; flip to false to enable paywall
};

export function loadState() {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked; fail silently, state still works in memory
  }
}

export function clearState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export { DEFAULT_STATE };

// Minimal event tracking stub. Logs to console and keeps the last 100 events
// in localStorage. Never pass birth details, names or question text here.
const KEY = "astroguide_events_v1";
const MAX_EVENTS = 100;

export function track(eventName, details = {}) {
  const event = { eventName, details, at: new Date().toISOString() };
  console.log("[track]", eventName, details);
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    const events = raw ? JSON.parse(raw) : [];
    events.push(event);
    while (events.length > MAX_EVENTS) events.shift();
    window.localStorage.setItem(KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function getEvents() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

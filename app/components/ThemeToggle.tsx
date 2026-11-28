"use client";

import { useEffect, useState } from "react";

// Mirrors the inline no-flash script in app/layout.tsx: both read/write the
// same 'theme' localStorage key and toggle the same .dark class on <html>.
// Server-rendered markup has no way to know the visitor's saved theme, so
// this always starts at `false` to match SSR, then syncs to the class the
// no-flash script already applied, right after mount (one icon-only repaint,
// never a flash of the wrong theme on the actual page).
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to DOM state the no-flash script set before React mounted, not derived render state
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-base press-feedback"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      suppressHydrationWarning
    >
      <span aria-hidden="true" suppressHydrationWarning>{dark ? "☀" : "☾"}</span>
    </button>
  );
}

import type { Config } from "tailwindcss";

// Scoped to the /welcome page only — a separate, self-contained palette
// namespaced under `welcome-*` so it can never collide with or override the
// site-wide design tokens already defined in app/globals.css's `@theme`
// block. Merged in via the `@config` directive at the top of globals.css
// (Tailwind v4 supports both an inline `@theme` and a referenced JS/TS
// config at once).
const config: Config = {
  theme: {
    extend: {
      colors: {
        "welcome-primary": "#12132B", // deep indigo/charcoal background
        "welcome-accent": "#F5A623", // saffron/marigold
        "welcome-text": "#FAF6EF", // warm off-white
        "welcome-overlay": "rgba(18, 19, 43, 0.55)", // 55% gradient overlay base
      },
    },
  },
};

export default config;

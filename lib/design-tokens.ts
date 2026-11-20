// Single source of truth for design tokens, wired into Tailwind via
// app/globals.css's @theme block. Change values here AND there together —
// Tailwind's @theme can't import TS, so this file documents what each CSS
// variable means and why, and is also imported by any JS that needs a raw
// token value (e.g. GSAP durations).

export const SPACING_SCALE = [8, 16, 24, 40, 64] as const; // px — rule 2 of Stage 1

export const RADII = {
  sm: "12px",
  lg: "16px",
};

export const DURATIONS = {
  micro: 0.15, // hover/press feedback — seconds
  small: 0.3, // toast, badge pop, card lift
  panel: 0.35, // modal/panel/tray enter-exit
  roll: 0.5, // number roll in calculator
};

export const EASINGS = {
  standard: [0.4, 0, 0.2, 1] as const,
  enter: [0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

export const MIN_TAP_TARGET = 44; // px — rule 5 of Stage 1

export const CONTENT_MAX_WIDTH = 1440; // px

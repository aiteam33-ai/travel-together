"use client";

import { useEffect, useState } from "react";

/**
 * The one shared reduced-motion mechanism every animation in this app must
 * go through (CSS, Motion, GSAP alike). To add a new animation:
 * 1. Read this hook (or the `.animate-*` CSS classes, which already key off
 *    `prefers-reduced-motion` via globals.css) before starting any motion.
 * 2. If true, render/jump to the final state immediately — no transform,
 *    no opacity ramp, no GSAP timeline.
 * 3. Never gate interactivity on an animation finishing.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of OS preference on mount
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

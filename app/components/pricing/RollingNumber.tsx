"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { formatRupees } from "@/lib/pricing/format";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Rolls from the previous displayed value to `value` over ~0.5s, always
 * landing exactly on the real engine figure even after rapid changes
 * (animate() cancels any in-flight animation when value changes again).
 * Screen readers only ever hear the final figure — the rolling digits are
 * aria-hidden and a visually-hidden span holds the settled value.
 */
export default function RollingNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- skips the roll entirely when motion is reduced
      setDisplay(value);
      prevValue.current = value;
      return;
    }
    const controls = animate(prevValue.current, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
      onComplete: () => {
        prevValue.current = value;
      },
    });
    return () => controls.stop();
  }, [value, reduced]);

  return (
    <span className={className}>
      <span aria-hidden="true">{formatRupees(display)}</span>
      <span className="sr-only">{formatRupees(value)}</span>
    </span>
  );
}

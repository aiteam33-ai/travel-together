"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Animates a number counting up from 0 when it scrolls into view, once.
 * Falls back to the plain final value when reduced motion is on, or if
 * the element is already visible at load (no surprise count-up on page load).
 */
export default function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // already visible — show final value

    setDisplay(0);
    let trigger: { kill: () => void } | undefined;
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const counter = { n: 0 };
      trigger = gsap.to(counter, {
        n: value,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => setDisplay(Math.round(counter.n)),
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      }).scrollTrigger;
    })();

    return () => trigger?.kill();
  }, [reduced, value]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Scroll-triggered reveal (Stage 6, GSAP ScrollTrigger), once per element.
 * Anything already in the viewport at load is shown immediately (no play).
 * ScrollTrigger instances are cleaned up on unmount (page change).
 */
export default function RevealOnScroll({
  children,
  as: Tag = "div",
  className,
  ...rest
}: {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return; // already visible — show as-is

    let trigger: { kill: () => void } | undefined;
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      gsap.set(el, { opacity: 0, y: 24 });
      trigger = gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      }).scrollTrigger;
    })();

    return () => trigger?.kill();
  }, [reduced]);

  const Component = Tag as React.ElementType;
  return (
    <Component ref={ref} className={className} {...rest}>
      {children}
    </Component>
  );
}

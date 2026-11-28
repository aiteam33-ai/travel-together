"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Like RevealOnScroll, but staggers in its direct children one by one
 * instead of fading the whole block at once — for grids of cards/tiles.
 */
export default function StaggerReveal({
  children,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;

    const items = Array.from(el.children);
    if (items.length === 0) return;

    let trigger: { kill: () => void; refresh: () => void } | undefined;
    let onLoad: (() => void) | undefined;
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      gsap.set(items, { opacity: 0, y: 20 });
      trigger = gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }).scrollTrigger;

      // See RevealOnScroll — images/video loading after this trigger's
      // position was computed can shift layout and leave it stale.
      onLoad = () => trigger?.refresh();
      if (document.readyState === "complete") {
        trigger?.refresh();
      } else {
        window.addEventListener("load", onLoad);
      }
    })();

    return () => {
      trigger?.kill();
      if (onLoad) window.removeEventListener("load", onLoad);
    };
  }, [reduced]);

  const Component = Tag as React.ElementType;
  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}

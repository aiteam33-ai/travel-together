"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Subtle mouse-tracked 3D tilt + shine on an image wrapper, GSAP-driven.
 * Layers on top of the existing CSS card-hover lift/zoom (different
 * elements, different properties) rather than replacing it. Desktop
 * pointer only — untouched on touch devices and with reduced motion.
 */
export default function TiltImage({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    if (window.matchMedia("(hover: none)").matches) return; // touch device

    const el = ref.current;
    let quickX: ((v: number) => void) | undefined;
    let quickY: ((v: number) => void) | undefined;
    let cleanup: (() => void) | undefined;

    (async () => {
      const gsap = (await import("gsap")).default;
      quickX = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2.out" });
      quickY = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2.out" });
      gsap.set(el, { transformPerspective: 600, transformStyle: "preserve-3d" });

      function onMove(e: MouseEvent) {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        quickY?.(px * 10);
        quickX?.(py * -10);
      }
      function onLeave() {
        quickX?.(0);
        quickY?.(0);
      }

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanup = () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    })();

    return () => cleanup?.();
  }, [reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

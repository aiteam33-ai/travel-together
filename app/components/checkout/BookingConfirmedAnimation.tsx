"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

const CONFETTI_COLORS = ["#b23c0a", "#2f6b3a", "#f6ddc9", "#8c2f07"];

/**
 * Booking-confirmed moment (Stage 6, GSAP): a self-drawing tick and a ~2s
 * confetti burst. Dismissible by any click or key. The booking is already
 * saved and the confirmation message already sent before this ever renders
 * (see the payment API route) — this is purely celebratory, never load-bearing.
 */
export default function BookingConfirmedAnimation({ bookingRef }: { bookingRef: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [confettiOffsets] = useState(() => Array.from({ length: 28 }, () => (Math.random() - 0.5) * 20));
  const pathRef = useRef<SVGPathElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (dismissed) return;
    function dismiss() {
      setDismissed(true);
    }
    window.addEventListener("click", dismiss, { once: true });
    window.addEventListener("keydown", dismiss, { once: true });
    const timer = setTimeout(dismiss, 3000);
    return () => {
      window.removeEventListener("click", dismiss);
      window.removeEventListener("keydown", dismiss);
      clearTimeout(timer);
    };
  }, [dismissed]);

  useEffect(() => {
    if (reduced || dismissed) return;
    (async () => {
      const gsap = (await import("gsap")).default;
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(pathRef.current, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" });
      }
      if (confettiRef.current) {
        const pieces = Array.from(confettiRef.current.children);
        gsap.set(pieces, { opacity: 1, y: 0, x: 0, rotate: 0 });
        pieces.forEach((piece, i) => {
          gsap.to(piece, {
            y: 160 + Math.random() * 80,
            x: (Math.random() - 0.5) * 240,
            rotate: Math.random() * 360,
            opacity: 0,
            duration: 1.6 + Math.random() * 0.4,
            delay: i * 0.015,
            ease: "power1.in",
          });
        });
      }
    })();
  }, [reduced, dismissed]);

  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-label={`Booking ${bookingRef} confirmed`}
      className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center overflow-hidden"
    >
      <div ref={confettiRef} className="absolute left-1/2 top-24 -translate-x-1/2">
        {confettiOffsets.map((offset, i) => (
          <span
            key={i}
            className="absolute h-2 w-3 rounded-sm opacity-0"
            style={{ backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length], left: `${offset}px` }}
          />
        ))}
      </div>
      <svg viewBox="0 0 64 64" className="mt-16 h-20 w-20 text-success" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
        <path ref={pathRef} d="M18 33 L27 42 L46 22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

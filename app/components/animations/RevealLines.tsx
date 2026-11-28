"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { EASE_OUT } from "./easing";

/**
 * Splits children into lines (one per array entry) and reveals each by
 * sliding up from behind an overflow-hidden mask, staggered 0.1s apart.
 * Plays once on mount — meant for above-the-fold headlines, not scroll-in.
 */
export default function RevealLines({
  lines,
  as: Tag = "span",
  className,
  lineClassName,
}: {
  lines: React.ReactNode[];
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  lineClassName?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const Component = Tag as React.ElementType;

  if (reduced) {
    return (
      <Component className={className}>
        {lines.map((line, i) => (
          <span key={i} className={lineClassName}>
            {line}
          </span>
        ))}
      </Component>
    );
  }

  return (
    <Component className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`block overflow-hidden ${lineClassName ?? ""}`}>
          <motion.span
            className="block"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}

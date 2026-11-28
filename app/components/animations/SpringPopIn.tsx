"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Wraps a list of cards so they pop in one after another (scale 0.9 -> 1,
 * fade, spring) once the container scrolls into view — used for the
 * "My Socials" phone mockup's stacked feature cards.
 */
export default function SpringPopIn({
  children,
  className,
  staggerSeconds = 0.15,
}: {
  children: React.ReactNode[];
  className?: string;
  staggerSeconds?: number;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerSeconds } } }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

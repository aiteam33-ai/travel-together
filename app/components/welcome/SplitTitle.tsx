"use client";

import { motion } from "framer-motion";

// Letter-by-letter reveal — hand-rolled rather than pulling in SplitType,
// since the title is a static known string and this is a handful of spans.
export default function SplitTitle({
  text,
  className,
  reduced,
}: {
  text: string;
  className?: string;
  reduced: boolean;
}) {
  if (reduced) {
    return (
      <h1 className={className} style={{ textShadow: "0 0 24px rgba(255,255,255,0.25)" }}>
        {text}
      </h1>
    );
  }

  const letters = text.split("");

  return (
    <motion.h1
      className={`${className ?? ""} whitespace-nowrap`}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } } }}
      aria-label={text}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 28, rotateX: -40 },
            visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: "easeOut" } },
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Separate inner span: its own `animate` prop runs independently of
              the outer stagger-in variants (mixing variants + a literal
              animate object on one node would let the literal one win and
              skip the stagger entirely). */}
          <motion.span
            className="inline-block"
            animate={{
              textShadow: [
                "0 0 18px rgba(255,255,255,0.15)",
                "0 0 34px rgba(255,255,255,0.5)",
                "0 0 18px rgba(255,255,255,0.15)",
              ],
            }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 1 + i * 0.05 }}
          >
            {letter}
          </motion.span>
        </motion.span>
      ))}
    </motion.h1>
  );
}

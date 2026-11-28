"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

function Word({ word, progress, index, total }: { word: string; progress: MotionValue<number>; index: number; total: number }) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}

/**
 * Splits `text` into words and fades each one in (opacity 0.2 -> 1) as the
 * paragraph scrolls through the viewport — the "read as you scroll" effect.
 */
export default function ScrollWordHighlight({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = text.split(" ");

  if (reduced) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} word={word} progress={scrollYProgress} index={i} total={words.length} />
      ))}
    </p>
  );
}

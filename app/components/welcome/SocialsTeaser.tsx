"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Floating teaser card, bottom-right, desktop only (hidden below md — on a
 * small screen it would collide with the sticky mobile CTA bar).
 */
export default function SocialsTeaser() {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 16 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="fixed bottom-6 right-6 z-20 hidden max-w-xs rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md md:block"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-welcome-accent">My Socials</p>
      <p className="mt-1 text-sm text-welcome-text">Group chat &middot; Quick polls &middot; Split expenses &middot; Safety &amp; SOS</p>
      <Link href="/my-socials" className="mt-2 inline-block text-sm font-semibold text-welcome-accent underline underline-offset-2 hover:text-welcome-accent/80">
        Discover My Socials
      </Link>
    </motion.div>
  );
}

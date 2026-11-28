"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Compass } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import ParticleField from "../components/welcome/ParticleField";
import SplitTitle from "../components/welcome/SplitTitle";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" });

const SEEN_KEY = "welcome_seen";

// Sets both the localStorage flag (same-tab fallback) and the cookie
// middleware.ts actually checks server-side to skip this page on return
// visits — same pair the previous welcome page used, kept so the
// middleware redirect logic needs no changes.
function markWelcomeSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
  try {
    document.cookie = `${SEEN_KEY}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {}
}

export default function WelcomeExperience() {
  const reduced = usePrefersReducedMotion();
  const [leaving, setLeaving] = useState(false);

  // Subtle cursor-driven parallax on the background video (desktop only,
  // disabled under reduced motion) — a small, capped shift for depth, not a
  // full tilt effect. Heavily damped, low-stiffness spring so it reads as a
  // smoothed/stabilized drift rather than tracking the cursor directly —
  // there's no real per-frame stabilization to apply (no footage-processing
  // tool available here), so this plus the oversized crop below is the
  // honest, purely-visual version: nothing ever snaps or reveals an edge.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 18, damping: 30, mass: 0.6 });
  const springY = useSpring(pointerY, { stiffness: 18, damping: 30, mass: 0.6 });
  const videoX = useTransform(springX, [-1, 1], [-10, 10]);
  const videoY = useTransform(springY, [-1, 1], [-7, 7]);

  function onPointerMove(e: React.PointerEvent) {
    if (reduced || e.pointerType !== "mouse") return;
    const { innerWidth, innerHeight } = window;
    pointerX.set((e.clientX / innerWidth) * 2 - 1);
    pointerY.set((e.clientY / innerHeight) * 2 - 1);
  }

  // This component is `fixed`, covering the normal site chrome (Header,
  // Footer, BottomTabBar) that the root layout now always renders — that's
  // what let the layout drop its headers()-based chromeless check, which
  // was forcing every single page on the site into fully dynamic (no
  // static generation) rendering. Hide the body's own scrollbar while this
  // is mounted so the ordinary page underneath can't be scrolled into view.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // A full navigation (not next/navigation's router.push) — this is a
  // one-time, once-per-visitor click leaving a chromeless page for a
  // completely different layout, so there's nothing soft-navigation buys
  // here, and a plain location change can't silently fail to complete the
  // way a client-side transition occasionally did (reported: the fade-out
  // would finish and leave a stuck black screen instead of reaching "/").
  function enter(e: React.MouseEvent) {
    e.preventDefault();
    markWelcomeSeen();
    if (reduced) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
      return;
    }
    setLeaving(true);
    setTimeout(() => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
    }, 350);
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
      onPointerMove={onPointerMove}
    >
      {/* Cinematic background video — aerial sunrise over mountain clouds.
          Wrapped in an oversized, parallax-shifted container so the small
          cursor-driven shift never reveals an edge. A permanent ~4% crop
          (scale 1.04 base) plus GPU-locked compositing is the "stabilization":
          it swallows the drone footage's own micro-jitter at the frame edges
          and stops sub-pixel transform rounding from reading as a flicker. */}
      <motion.div
        className="absolute -inset-6"
        style={{
          x: reduced ? undefined : videoX,
          y: reduced ? undefined : videoY,
          z: 0,
          willChange: "transform",
        }}
      >
        <motion.video
          className="h-full w-full object-cover"
          src="/videos/welcome.mp4"
          poster="/images/welcome-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ z: 0, willChange: "transform" }}
          initial={{ scale: 1.04 }}
          animate={reduced ? undefined : { scale: 1.1 }}
          transition={reduced ? undefined : { duration: 26, ease: [0.45, 0, 0.55, 1], repeat: Infinity, repeatType: "mirror" }}
        />
      </motion.div>

      {/* Ambient floating dust over the video, under the readability overlay */}
      {!reduced && <ParticleField />}

      {/* Readability overlay — radial vignette, darker at the edges */}
      <div
        className="absolute inset-0 z-[6] bg-black/25"
        style={{ backgroundImage: "radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 100%)" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-10 px-6 text-center">
        <SplitTitle
          text="Parikrama"
          reduced={reduced}
          className={`${playfair.className} text-[clamp(2.75rem,9vw,6.5rem)] font-bold tracking-[0.04em] text-white`}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
        >
          <Link
            href="/"
            onClick={enter}
            aria-label="Enter Parikrama"
            className="group relative flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:bg-white/20 active:scale-95"
          >
            {!reduced && (
              <motion.span
                className="absolute inset-0 rounded-full border border-white/50"
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 2.2, ease: "easeOut", repeat: Infinity }}
                aria-hidden="true"
              />
            )}
            <Compass className="h-7 w-7 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </motion.div>
      </div>

      {/* Fade-out transition before navigating away */}
      {!reduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 1 : 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

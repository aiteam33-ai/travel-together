"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

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
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    // React's dev StrictMode double-invokes effects; this guard keeps the
    // one-time "already seen" check from running (and self-redirecting) twice.
    if (checkedRef.current) return;
    checkedRef.current = true;

    // middleware.ts is the real no-flash guard (redirects server-side before
    // this page ever renders) — this is just a same-tab fallback.
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) router.replace("/");
  }, [router]);

  function enter(e: React.MouseEvent) {
    e.preventDefault();
    markWelcomeSeen();
    if (reduced) {
      router.push("/");
      return;
    }
    setLeaving(true);
    setTimeout(() => router.push("/"), 350);
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Cinematic background video — aerial sunrise over mountain clouds. */}
      <motion.video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/welcome.mp4"
        poster="/images/welcome-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        initial={{ scale: 1 }}
        animate={reduced ? undefined : { scale: 1.08 }}
        transition={reduced ? undefined : { duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Readability overlay — ~35% black */}
      <div className="absolute inset-0 bg-black/35" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-10 px-6 text-center">
        <motion.h1
          className={`${playfair.className} text-[clamp(2.75rem,9vw,6.5rem)] font-bold tracking-[0.04em] text-white`}
          initial={{ opacity: 0, y: 24 }}
          animate={{
            opacity: 1,
            y: 0,
            textShadow: reduced
              ? "0 0 24px rgba(255,255,255,0.25)"
              : ["0 0 18px rgba(255,255,255,0.15)", "0 0 34px rgba(255,255,255,0.5)", "0 0 18px rgba(255,255,255,0.15)"],
          }}
          transition={
            reduced
              ? { duration: 0.8, ease: "easeOut" }
              : {
                  opacity: { duration: 0.8, ease: "easeOut" },
                  y: { duration: 0.8, ease: "easeOut" },
                  textShadow: { duration: 4, ease: "easeInOut", repeat: Infinity, delay: 0.8 },
                }
          }
        >
          Parikrama
        </motion.h1>

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

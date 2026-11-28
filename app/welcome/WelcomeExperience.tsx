"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { motion } from "framer-motion";
import HeroVideo from "../components/welcome/HeroVideo";
import ChipGroup, { type ChipOption } from "../components/welcome/ChipGroup";
import TrustStrip from "../components/welcome/TrustStrip";
import SocialsTeaser from "../components/welcome/SocialsTeaser";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { TRAVELLER_TAGS, DEPARTURE_CITIES, DEPARTURE_CITY_LABELS, type TravellerTag } from "@/lib/pricing/constants";
import { EASE_OUT } from "../components/animations/easing";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const PREFS_KEY = "parikrama_prefs";
const SEEN_KEY = "welcome_seen";

// Built directly from the same arrays /tours' filters use, so these chips
// can never drift out of sync with the real tag/city values.
const TRAVELLER_ICONS: Record<TravellerTag, string> = {
  FAMILY: "👨‍👩‍👧‍👦",
  HONEYMOON: "💞",
  SENIOR_CITIZENS: "🧓",
  WOMEN_ONLY: "💜",
  PILGRIMAGE: "🛕",
  TREK: "⛰️",
};
const TRAVELLER_LABELS: Record<TravellerTag, string> = {
  FAMILY: "Family",
  HONEYMOON: "Honeymoon",
  SENIOR_CITIZENS: "Senior Citizens",
  WOMEN_ONLY: "Women Only",
  PILGRIMAGE: "Pilgrimage",
  TREK: "Trek",
};
const TRAVELLER_OPTIONS: ChipOption[] = TRAVELLER_TAGS.map((tag) => ({ value: tag, label: TRAVELLER_LABELS[tag], icon: TRAVELLER_ICONS[tag] }));

const CITY_OPTIONS: ChipOption[] = DEPARTURE_CITIES.map((c) => ({
  value: c,
  label: DEPARTURE_CITY_LABELS[c],
  icon: c === "JOIN_AT_DESTINATION" ? "✈️" : "📍",
}));

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export default function WelcomeExperience({
  tourCount,
  departureCount,
  travellersServed,
}: {
  tourCount: number;
  departureCount: number;
  travellersServed: number;
}) {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [tag, setTag] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    // React's dev StrictMode double-invokes this effect; without this guard
    // the second invocation would read back the "seen" flag the first
    // invocation just wrote and immediately redirect itself away.
    if (checkedRef.current) return;
    checkedRef.current = true;

    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) {
      router.replace("/");
      return;
    }
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ tag, city }));
    } catch {}
  }, [tag, city, ready]);

  if (!ready) return null;

  function goToTours() {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (city) params.set("city", city);
    router.push(`/tours${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className={`${fraunces.variable} ${inter.variable} relative flex min-h-screen flex-col`} style={{ fontFamily: "var(--font-inter)" }}>
      <HeroVideo />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <span className={fraunces.className + " text-lg font-bold text-[#FAF6EF]"}>Parikrama</span>
        <Link
          href="/"
          onClick={() => {
            try {
              localStorage.setItem(SEEN_KEY, "1");
            } catch {}
          }}
          className="text-sm font-semibold text-[#FAF6EF]/80 underline-offset-2 hover:text-[#FAF6EF] hover:underline"
        >
          Skip →
        </Link>
      </div>

      {/* Hero content */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-10 px-6 pb-32 pt-6 text-center md:pb-16">
        <motion.div
          initial={reduced ? undefined : "hidden"}
          animate={reduced ? undefined : "visible"}
          variants={reduced ? undefined : { visible: { transition: { staggerChildren: 0.12 } } }}
          className="flex flex-col items-center gap-4"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-[0.25em] text-[#F5A623]">
            Travel, together
          </motion.p>
          <motion.h1 variants={fadeUp} className={fraunces.className + " max-w-2xl text-3xl font-bold leading-tight text-[#FAF6EF] md:text-5xl"}>
            Know your whole trip cost, before you call anyone.
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-xl text-base text-[#FAF6EF]/85 md:text-lg">
            Fixed-departure tours, treks and pilgrimages across every region of India, planned with the
            friends and family you&apos;re travelling with.
          </motion.p>
        </motion.div>

        <motion.section
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT }}
          className="w-full"
        >
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#FAF6EF]/70">Who&apos;s travelling?</h2>
          <ChipGroup legend="Who's travelling?" options={TRAVELLER_OPTIONS} value={tag} onChange={setTag} columns={3} />
        </motion.section>

        <motion.section
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT }}
          className="w-full"
        >
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#FAF6EF]/70">Where are you leaving from?</h2>
          <ChipGroup legend="Where are you leaving from?" options={CITY_OPTIONS} value={city} onChange={setCity} variant="pill" />
        </motion.section>

        {/* Desktop CTAs — hidden on mobile, where the sticky bar below takes over */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE_OUT }}
          className="hidden w-full flex-col items-center gap-3 md:flex"
        >
          <button
            type="button"
            onClick={goToTours}
            className="min-h-12 rounded-full bg-[#F5A623] px-8 text-base font-bold text-[#12132B] shadow-lg shadow-black/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Show my tours →
          </button>
          <Link
            href="/trip-cost-calculator"
            className="text-sm font-semibold text-[#FAF6EF]/80 underline-offset-4 hover:text-[#FAF6EF] hover:underline"
          >
            Try the trip cost calculator
          </Link>
        </motion.div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-4"
        >
          <TrustStrip tourCount={tourCount} departureCount={departureCount} travellersServed={travellersServed} />
        </motion.div>
      </main>

      {/* Mobile sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col gap-2 border-t border-white/10 bg-[#12132B]/95 p-4 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={goToTours}
          className="min-h-12 w-full rounded-full bg-[#F5A623] text-base font-bold text-[#12132B]"
        >
          Show my tours →
        </button>
        <Link href="/trip-cost-calculator" className="text-center text-sm font-semibold text-[#FAF6EF]/80 underline-offset-2 hover:underline">
          Try the trip cost calculator
        </Link>
      </div>

      <SocialsTeaser />
    </div>
  );
}

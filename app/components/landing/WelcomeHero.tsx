"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SearchBar from "../SearchBar";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { tourPhotoUrl } from "@/lib/tour-photos";

// A handful of real destination photos already used elsewhere in the
// catalogue (lib/tour-photos.ts) — reused here as a slow-crossfading,
// Ken-Burns-animated background so the welcome hero feels alive without
// shipping an actual video file.
const SLIDES = [
  { url: "https://images.unsplash.com/photo-1621232082074-1a7750ecc557", label: "Kashmir" }, // Kashmir Paradise
  { url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", label: "Goa" }, // Goa Beaches
  { url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2", label: "Ladakh" }, // Ladakh
  { url: "https://images.unsplash.com/photo-1661924326425-c14a6426d989", label: "Rajasthan" }, // Rajasthan Royal Circuit
  { url: "https://images.unsplash.com/photo-1586053226626-febc8817962f", label: "Andaman" }, // Andaman Islands
  { url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944", label: "Kerala" }, // Kerala Backwaters
];

const SLIDE_MS = 6000;

export default function WelcomeHero() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(interval);
  }, [reduced]);

  return (
    <section className="relative -mx-6 -mt-8 overflow-hidden rounded-b-3xl md:rounded-b-[2.5rem]">
      <div className="relative h-[560px] w-full md:h-[640px]">
        {/* Crossfading, slowly-zooming destination photos — the "background video" */}
        {SLIDES.map((slide, i) => (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${i === active ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== active}
          >
            <div className={`h-full w-full ${reduced ? "" : "hero-slide"}`}>
              <Image
                src={tourPhotoUrl(slide.url, 1600, 900)}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}

        {/* Drifting colour orbs for extra depth/creativity over the photo */}
        <div className={`absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl ${reduced ? "" : "hero-orb"}`} aria-hidden="true" />
        <div
          className={`absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-white/20 blur-3xl ${reduced ? "" : "hero-orb"}`}
          style={{ animationDelay: "-7s" }}
          aria-hidden="true"
        />

        {/* Legibility gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" aria-hidden="true" />

        {/* Foreground content */}
        <div className="relative flex h-full flex-col justify-end gap-6 p-6 pb-10 text-white md:justify-center md:p-14">
          <div data-intro="headline">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-white/90">Travel, together</p>
            <h1 className="font-heading mt-3 max-w-2xl text-4xl font-extrabold leading-tight drop-shadow-sm md:text-6xl">
              Plan, book and share the trip with your people.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/90 md:text-lg">
              Fixed-departure tours, treks and pilgrimages across every region of India — with My Socials, plan it
              together with the friends or family you&apos;re travelling with.
            </p>
          </div>

          <div className="flex flex-wrap gap-3" data-intro="cta">
            <Link
              href="/tours"
              className="min-h-11 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-foreground press-feedback hover:bg-white/90"
            >
              Explore tours
            </Link>
            <Link
              href="/my-socials"
              className="min-h-11 rounded-md border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur press-feedback hover:bg-white/20"
            >
              Discover My Socials
            </Link>
          </div>

          <div className="max-w-3xl" data-intro="search">
            <SearchBar />
          </div>
        </div>

        {/* Slide indicator dots */}
        <div className="absolute bottom-3 right-4 z-10 flex gap-1.5 md:bottom-5 md:right-6">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${slide.label} background`}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

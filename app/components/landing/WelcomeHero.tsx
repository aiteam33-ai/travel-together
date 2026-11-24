"use client";

import { useEffect, useRef, useState } from "react";
import SearchBar from "../SearchBar";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { tourPhotoUrl } from "@/lib/tour-photos";

// Real, free-to-use (Mixkit Free License, no attribution required) travel
// scenery clips — muted/looped/playsInline below, with a photo poster as the
// fallback frame while the video loads or if it fails, and reduced-motion
// visitors get the poster only (no autoplay). Kept short (360p, each well
// under 4MB) so this never becomes a performance problem on mobile data.
const SLIDES = [
  {
    video: "https://assets.mixkit.co/videos/2168/2168-360.mp4",
    poster: tourPhotoUrl("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", 1600, 900),
    label: "Beach",
  },
  {
    video: "https://assets.mixkit.co/videos/4132/4132-360.mp4",
    poster: tourPhotoUrl("https://images.unsplash.com/photo-1581793745862-99fde7fa73d2", 1600, 900),
    label: "Mountains",
  },
  {
    video: "https://assets.mixkit.co/videos/41576/41576-360.mp4",
    poster: tourPhotoUrl("https://images.unsplash.com/photo-1661924326425-c14a6426d989", 1600, 900),
    label: "Road trip",
  },
];

export default function WelcomeHero() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;
    const video = videoRefs.current[active];
    video?.play().catch(() => {}); // autoplay can be blocked until the first user gesture on some mobile browsers — fails silently, poster stays visible
  }, [active, reduced]);

  return (
    <section className="relative -mx-6 -mt-8 overflow-hidden rounded-b-3xl md:rounded-b-[2.5rem]">
      <div className="relative min-h-[560px] w-full md:h-[640px]">
        {/* Crossfading background video slides, each with a real-photo poster fallback */}
        {SLIDES.map((slide, i) => (
          <div
            key={slide.video}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${i === active ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== active}
          >
            {reduced ? (
              // eslint-disable-next-line @next/next/no-img-element -- static poster only, no motion, intentional plain <img>
              <img src={slide.poster} alt="" className="h-full w-full object-cover" />
            ) : (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                className="h-full w-full object-cover"
                poster={slide.poster}
                src={slide.video}
                muted
                loop
                playsInline
                autoPlay={i === 0}
                preload={i === 0 ? "auto" : "none"}
                aria-hidden="true"
              />
            )}
          </div>
        ))}

        {/* Drifting colour orbs for extra depth/creativity over the video */}
        <div className={`absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl ${reduced ? "" : "hero-orb"}`} aria-hidden="true" />
        <div
          className={`absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-white/20 blur-3xl ${reduced ? "" : "hero-orb"}`}
          style={{ animationDelay: "-7s" }}
          aria-hidden="true"
        />

        {/* Legibility gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" aria-hidden="true" />

        {/* Foreground content */}
        <div className="relative flex min-h-full flex-col justify-end gap-6 p-6 pb-10 text-white md:h-full md:justify-center md:p-14">
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
              key={slide.video}
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

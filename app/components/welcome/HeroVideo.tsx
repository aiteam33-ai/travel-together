"use client";

import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { tourPhotoUrl } from "@/lib/tour-photos";

const VIDEO = "https://assets.mixkit.co/videos/2168/2168-360.mp4";
const POSTER = tourPhotoUrl("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", 1920, 1080);

/**
 * Full-viewport looping background video with a dark indigo gradient
 * overlay for text contrast. Reduced motion (or if video fails) falls
 * back to the static poster photo only — no autoplay.
 */
export default function HeroVideo() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element -- static poster only, no motion, intentional plain <img>
        <img src={POSTER} alt="" className="h-full w-full object-cover" />
      ) : (
        <video
          className="h-full w-full object-cover"
          poster={POSTER}
          src={VIDEO}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12132B]/55 via-[#12132B]/70 to-black/90" />
    </div>
  );
}

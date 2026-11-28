"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { CLIPS } from "@/app/welcome/clips";

/**
 * Full-viewport looping scenery montage: clips crossfade into each other on
 * a timer (each clip's own `durationMs`), with the *next* clip's <video>
 * preloaded underneath so there's no blank frame at the crossfade. A
 * gradient + bottom vignette keeps foreground text readable, and the
 * current clip's caption fades in/out in the bottom-left.
 *
 * Reduced motion (or if the user pauses): shows only the active clip's
 * static poster, no video element mounted at all.
 */
export default function HeroVideo() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const [hidden, setHidden] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const clip = CLIPS[index];
  const nextIndex = (index + 1) % CLIPS.length;

  // Pause when the tab isn't visible — no point burning battery/bandwidth
  // on an autoplaying video nobody's looking at.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (reduced || !playing || hidden) return;
    const timer = setTimeout(() => setIndex(nextIndex), clip.durationMs);
    return () => clearTimeout(timer);
  }, [index, playing, hidden, reduced, clip.durationMs, nextIndex]);

  useEffect(() => {
    if (reduced) return;
    const video = videoRefs.current[index];
    if (playing && !hidden) video?.play().catch(() => {});
    else video?.pause();
  }, [index, playing, hidden, reduced]);

  if (reduced) {
    return (
      <div className="fixed inset-x-0 top-0 -z-10 h-[100svh] overflow-hidden" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- static poster only, no motion */}
        <img src={clip.poster} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-welcome-overlay via-welcome-overlay to-black/90" />
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 top-0 -z-10 h-[100svh] overflow-hidden">
      {CLIPS.map((c, i) => (
        <div
          key={c.mp4}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className="h-full w-full object-cover"
            poster={c.poster}
            muted
            loop={false}
            playsInline
            autoPlay={i === 0}
            preload={i === index || i === nextIndex ? "auto" : "none"}
          >
            <source src={c.mp4} type="video/mp4" />
            {c.webm && <source src={c.webm} type="video/webm" />}
          </video>
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-welcome-overlay via-welcome-overlay to-black/90" />

      {/* Caption + pause/play, bottom-left */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 md:bottom-10 md:left-10">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause background video" : "Play background video"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-welcome-text backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-welcome-accent"
        >
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
        <AnimatePresence mode="wait">
          <motion.p
            key={clip.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-welcome-text/85"
          >
            {clip.caption}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

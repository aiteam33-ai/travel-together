import { tourPhotoUrl } from "@/lib/tour-photos";

export interface SceneryClip {
  /** Served from /public/videos — self-hosted, not a remote CDN URL. */
  mp4: string;
  /** Optional webm source; omit if you only have an mp4 (browsers fall back fine). */
  webm?: string;
  poster: string;
  caption: string;
  /** How long this clip stays on screen before crossfading to the next one, in ms. */
  durationMs: number;
}

// Swap, reorder, add or remove clips here — HeroVideo just loops through
// whatever's in this array. Only hero-1/2/3.mp4 ship with the repo (generic
// licensed stock footage, downloaded from Mixkit's free library — see the
// README's "Swapping scenery clips" section for real Indian-location footage
// specs to replace them with).
export const CLIPS: SceneryClip[] = [
  {
    mp4: "/videos/hero-1.mp4",
    poster: tourPhotoUrl("https://images.unsplash.com/photo-1544735716-392fe2489ffa", 1920, 1080), // Himalayan peaks
    caption: "Himalayan peaks, at sunrise",
    durationMs: 7000,
  },
  {
    mp4: "/videos/hero-2.mp4",
    poster: tourPhotoUrl("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944", 1920, 1080), // Kerala backwaters
    caption: "Kerala backwaters",
    durationMs: 7000,
  },
  {
    mp4: "/videos/hero-3.mp4",
    poster: tourPhotoUrl("https://images.unsplash.com/photo-1477587458883-47145ed94245", 1920, 1080), // Rajasthan fort
    caption: "Rajasthan, at dusk",
    durationMs: 7000,
  },
];

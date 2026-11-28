"use client";

import { useState } from "react";
import Image from "next/image";

// A short, solid-color blur placeholder (not derived from the real photo —
// we don't have a build-time image pipeline for that yet) so there's no
// blank flash while the image streams in; swapped for the real photo as
// soon as it loads, or for a gradient block if it fails to load at all.
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNkY2VmZTgiLz48L3N2Zz4=";

export default function TourImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 400px",
  aspect = "card",
  imageClassName = "card-hover-image object-cover",
  fill = true,
  containerClassName,
}: {
  src: string;
  /** Descriptive alt text — never "illustrative placeholder photo". */
  alt: string;
  priority?: boolean;
  sizes?: string;
  /** "card": 4:5 on mobile / 16:10 on desktop. "hero": 16:9. "fill": caller controls the aspect ratio via containerClassName (e.g. a fixed-height gallery cell). */
  aspect?: "card" | "hero" | "fill";
  imageClassName?: string;
  /** When false, the image fills whatever size containerClassName gives the wrapper instead of setting its own aspect ratio. */
  fill?: boolean;
  /** Extra classes for the wrapper — required when aspect="fill" to set the size. */
  containerClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const aspectClass = aspect === "card" ? "aspect-[4/5] md:aspect-[16/10]" : aspect === "hero" ? "aspect-[16/9]" : "";

  if (failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-surface-raised ${aspectClass} ${containerClassName ?? ""}`}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm font-medium text-foreground-muted">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectClass} ${containerClassName ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className={imageClassName}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

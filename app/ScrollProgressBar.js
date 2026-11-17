"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setScrollable(scrollable > 0);
      setProgress(scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  if (!scrollable) return null;

  return (
    <div
      className="fixed left-0 top-0 z-50 h-1 bg-accent transition-[width] duration-100"
      style={{ width: `${progress}%` }}
    />
  );
}

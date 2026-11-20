"use client";

import { usePathname } from "next/navigation";

/**
 * CSS-only page-content fade on navigation (Stage 6). Header and floating
 * buttons live outside this wrapper so they stay still. Keyed by pathname so
 * the fade restarts per page; respects reduced motion via globals.css.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-fade-in">
      {children}
    </div>
  );
}

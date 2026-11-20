"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * A thin bar across the top during page changes. Next.js App Router has no
 * built-in navigation-start event, so we approximate: show immediately when
 * the pathname/search changes, then finish shortly after (the new page is
 * already server-rendered by the time this runs on the client).
 */
export default function TopLoadingBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-[3px] w-full overflow-hidden bg-transparent" aria-hidden="true">
      <div className="h-full w-1/3 animate-[loading-bar_0.4s_ease-in-out] bg-accent" />
    </div>
  );
}

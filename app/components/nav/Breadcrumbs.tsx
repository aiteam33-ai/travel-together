"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  tours: "Tours",
  account: "My account",
  bookings: "Bookings",
  wishlist: "Wishlist",
  calculations: "Saved calculations",
  travellers: "Saved travellers",
  support: "Support",
  profile: "Profile",
  checkout: "Checkout",
  compare: "Compare",
};

const SHOWN_ROOTS = ["tours", "account", "checkout", "compare"];

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || !SHOWN_ROOTS.includes(segments[0])) return null;

  const crumbs = segments.reduce<{ href: string; label: string }[]>((acc, seg) => {
    const prevHref = acc.length > 0 ? acc[acc.length - 1].href : "";
    const href = `${prevHref}/${seg}`;
    const label = LABELS[seg] ?? decodeURIComponent(seg).replace(/-/g, " ");
    return [...acc, { href, label }];
  }, []);

  return (
    <nav aria-label="Breadcrumb" className="border-t border-border bg-surface px-6 py-2">
      <ol className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-1 text-xs text-foreground-muted">
        <li>
          <Link href="/" className="hover:text-accent">Home</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1">
            <span aria-hidden="true">/</span>
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-foreground capitalize" aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href} className="capitalize hover:text-accent">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

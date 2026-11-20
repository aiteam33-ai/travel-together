"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calculator, Users, User } from "lucide-react";
import { useSocials } from "../SocialsContext";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/tours", label: "Search", Icon: Search },
  { href: "/trip-cost-calculator", label: "Calculator", Icon: Calculator },
  { href: "/socials", label: "My Socials", Icon: Users },
  { href: "/account", label: "Account", Icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { unreadCount } = useSocials();

  return (
    <nav
      aria-label="Primary (mobile)"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur md:hidden"
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              active ? "text-accent" : "text-foreground-muted"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            {label}
            {label === "My Socials" && unreadCount > 0 && (
              <span className="badge-pop absolute right-5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

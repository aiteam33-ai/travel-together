"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RESTAURANT_NAME } from "../lib/menu";
import { useCart } from "./CartContext";

function NavLink({ href, isActive, children }) {
  return (
    <Link
      href={href}
      className={`min-h-11 flex items-center rounded-lg px-2 text-base font-semibold sm:px-3 sm:text-lg ${
        isActive ? "text-accent" : "text-foreground hover:text-accent"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const { cartCount } = useCart();
  const pathname = usePathname();
  const count = cartCount();

  return (
    <nav className="sticky top-0 z-20 w-full border-b border-border bg-surface px-4 py-2 shadow-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
        <Link
          href="/"
          className="min-h-11 flex shrink-0 items-center truncate font-[family-name:var(--font-heading)] text-lg font-extrabold text-foreground sm:text-xl"
        >
          {RESTAURANT_NAME}
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NavLink href="/" isActive={pathname === "/"}>
            Menu
          </NavLink>
          <NavLink href="/orders" isActive={pathname === "/orders"}>
            Orders
          </NavLink>

          <Link
            href="/cart"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
            className={`relative flex min-h-11 min-w-11 items-center justify-center rounded-lg ${
              pathname === "/cart" ? "text-accent" : "text-foreground hover:text-accent"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

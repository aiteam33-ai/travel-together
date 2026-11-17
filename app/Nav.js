"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function Nav() {
  const { cartCount } = useCart();

  return (
    <nav className="w-full border-b border-border bg-surface px-4 py-4 shadow-sm">
      <div className="mx-auto flex max-w-2xl flex-wrap gap-6 font-[family-name:var(--font-heading)] text-lg font-semibold">
        <Link href="/" className="rounded-lg px-2 py-2 text-foreground hover:text-accent">
          Menu
        </Link>
        <Link href="/cart" className="rounded-lg px-2 py-2 text-foreground hover:text-accent">
          Cart ({cartCount()})
        </Link>
        <Link href="/orders" className="rounded-lg px-2 py-2 text-foreground hover:text-accent">
          Orders
        </Link>
      </div>
    </nav>
  );
}

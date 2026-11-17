"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function Nav() {
  const { cartCount } = useCart();

  return (
    <nav className="w-full border-b border-gray-300 px-4 py-4">
      <div className="mx-auto flex max-w-md flex-wrap gap-5 text-lg">
        <Link href="/" className="underline">
          Menu
        </Link>
        <Link href="/cart" className="underline">
          Cart ({cartCount()})
        </Link>
        <Link href="/orders" className="underline">
          Orders
        </Link>
      </div>
    </nav>
  );
}

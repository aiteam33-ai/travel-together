"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";

export default function CartFab({ bottom }) {
  const { cartCount } = useCart();
  const router = useRouter();
  const count = cartCount();

  if (count === 0) return null;

  return (
    <button
      onClick={() => router.push("/cart")}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      style={{ bottom: `${bottom}px` }}
      className="fixed right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg"
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
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-accent bg-white px-1 text-xs font-bold text-accent">
        {count}
      </span>
    </button>
  );
}

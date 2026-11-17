"use client";

import { useRouter } from "next/navigation";
import { findDish } from "../../lib/menu";
import { useCart } from "../CartContext";

export default function CartPage() {
  const { cart, changeQty, cartTotal, placeOrder } = useCart();
  const router = useRouter();
  const entries = Object.entries(cart);

  function handlePlaceOrder() {
    placeOrder();
    router.push("/orders");
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Cart</h1>
        <p className="text-lg">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Cart</h1>

      <div className="flex flex-col gap-4">
        {entries.map(([name, qty]) => {
          const dish = findDish(name);
          if (!dish) return null;
          return (
            <div
              key={name}
              className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-lg font-semibold">{dish.name}</span>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => changeQty(name, -1)}
                    aria-label={`Decrease ${dish.name} quantity`}
                    className="min-h-12 min-w-12 rounded-full border border-border bg-background text-xl active:bg-accent active:text-white"
                  >
                    -
                  </button>
                  <span className="min-w-6 text-center text-lg">{qty}</span>
                  <button
                    onClick={() => changeQty(name, 1)}
                    aria-label={`Increase ${dish.name} quantity`}
                    className="min-h-12 min-w-12 rounded-full border border-border bg-background text-xl active:bg-accent active:text-white"
                  >
                    +
                  </button>
                </div>
                <span className="text-lg font-semibold">Rs {dish.price * qty}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xl font-bold">Total: Rs {cartTotal()}</div>

      <button
        onClick={handlePlaceOrder}
        className="min-h-12 w-full rounded-xl bg-accent px-6 text-lg font-semibold text-white shadow-sm active:bg-accent-strong"
      >
        Place order
      </button>
    </div>
  );
}

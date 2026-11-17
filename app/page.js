"use client";

import { MENU, RESTAURANT_NAME } from "../lib/menu";
import { useCart } from "./CartContext";

export default function MenuPage() {
  const { addToCart } = useCart();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">{RESTAURANT_NAME}</h1>

      {MENU.map((section) => (
        <section key={section.group} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{section.group}</h2>

          <div className="flex flex-col gap-3">
            {section.items.map((dish) => (
              <div
                key={dish.name}
                className="flex flex-col gap-3 border border-gray-300 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-3 w-3 shrink-0 rounded-full ${
                      dish.veg ? "bg-green-600" : "bg-red-600"
                    }`}
                  />
                  <span className="text-lg">{dish.name}</span>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-lg">Rs {dish.price}</span>
                  <button
                    onClick={() => addToCart(dish.name)}
                    className="min-h-12 border border-black px-5 text-lg"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

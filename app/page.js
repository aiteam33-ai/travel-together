"use client";

import { useEffect, useRef, useState } from "react";
import { MENU, RESTAURANT_NAME } from "../lib/menu";
import { useCart } from "./CartContext";
import CartFab from "./CartFab";
import BackToTop from "./BackToTop";

// Floating-button stacking, bottom-right corner, help button is the base
// layer shared by every page — these sit above it, above each other.
const HELP_BOTTOM = 16;
const HELP_SIZE = 56;
const GAP = 12;
const CART_FAB_BOTTOM = HELP_BOTTOM + HELP_SIZE + GAP; // 84

export default function MenuPage() {
  const { addToCart, cartCount } = useCart();
  const [activeGroup, setActiveGroup] = useState(MENU[0].group);
  const sectionRefs = useRef({});
  const chipRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveGroup(entry.target.dataset.group);
          }
        });
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 }
    );
    const sections = Object.values(sectionRefs.current).filter(Boolean);
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const chip = chipRefs.current[activeGroup];
    if (chip) {
      chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeGroup]);

  function scrollToGroup(group) {
    const el = sectionRefs.current[group];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
  }

  const cartFabVisible = cartCount() > 0;
  const backToTopBottom = cartFabVisible
    ? CART_FAB_BOTTOM + HELP_SIZE + GAP
    : CART_FAB_BOTTOM;

  return (
    <div className="flex flex-col gap-8 pb-40">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold">
        {RESTAURANT_NAME}
      </h1>

      <div className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto border-b border-border bg-background px-4 py-2">
        {MENU.map((section) => (
          <button
            key={section.group}
            ref={(el) => {
              chipRefs.current[section.group] = el;
            }}
            onClick={() => scrollToGroup(section.group)}
            className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
              activeGroup === section.group
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-foreground"
            }`}
          >
            {section.group}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        {MENU.map((section) => (
          <section
            key={section.group}
            data-group={section.group}
            ref={(el) => {
              sectionRefs.current[section.group] = el;
            }}
            className="flex flex-col gap-4"
          >
            <h2 className="pt-2 font-[family-name:var(--font-heading)] text-2xl font-bold">
              {section.group}
            </h2>

            <div className="flex flex-col">
              {section.items.map((dish, i) => (
                <div
                  key={dish.name}
                  className={`flex items-center justify-between gap-4 py-4 ${
                    i !== section.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex flex-col gap-2 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full ${
                          dish.veg ? "bg-green-600" : "bg-red-600"
                        }`}
                      />
                      <span className="text-lg font-semibold">{dish.name}</span>
                    </div>
                    <p className="text-sm text-foreground-muted">{dish.description}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="font-semibold">Rs {dish.price}</span>
                    <button
                      onClick={() => addToCart(dish.name)}
                      className="min-h-11 rounded-full bg-accent px-6 font-semibold text-white active:bg-accent-strong"
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

      <CartFab bottom={CART_FAB_BOTTOM} />
      <BackToTop bottom={backToTopBottom} />
    </div>
  );
}

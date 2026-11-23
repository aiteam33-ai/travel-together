"use client";

import { Check } from "lucide-react";

export const CHECKOUT_STEPS = ["Travellers", "Rooms", "Add-ons", "Review", "Pay"] as const;
export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export default function CheckoutStepper({
  currentStep,
  onStepClick,
}: {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
}) {
  const currentIndex = CHECKOUT_STEPS.indexOf(currentStep);

  return (
    <ol aria-label="Checkout progress" className="mb-8 flex items-center">
      {CHECKOUT_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const clickable = done && onStepClick;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(step)}
              aria-current={active ? "step" : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-medium ${
                clickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done ? "bg-success text-white" : active ? "bg-accent text-white" : "border border-border text-foreground-muted"
                }`}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              <span className={active ? "text-foreground" : done ? "text-success" : "text-foreground-muted"}>{step}</span>
            </button>
            {i < CHECKOUT_STEPS.length - 1 && (
              <span className="mx-2 h-0.5 flex-1 rounded-full bg-border" aria-hidden="true">
                <span className={`block h-full rounded-full bg-success transition-[width] duration-300`} style={{ width: done ? "100%" : "0%" }} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

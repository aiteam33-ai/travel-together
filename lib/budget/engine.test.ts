import { describe, it, expect } from "vitest";
import { computeBudgetSummary, compareEstimateVsActual, allocateBudget } from "./engine";

describe("computeBudgetSummary", () => {
  it("matches the Goa worked example", () => {
    const summary = computeBudgetSummary(
      {
        transportPaise: 800000,
        accommodationPaise: 1200000,
        foodPaise: 600000,
        activitiesPaise: 400000,
        shoppingPaise: 200000,
        otherPaise: 0,
      },
      4
    );
    expect(summary.totalPaise).toBe(3200000); // Rs. 32,000
    expect(summary.perPersonPaise).toBe(800000); // Rs. 8,000
    const transport = summary.breakdown.find((b) => b.key === "transportPaise")!;
    expect(transport.percent).toBe(25);
  });

  it("flags over-budget when a limit is set", () => {
    const summary = computeBudgetSummary(
      { transportPaise: 100000, accommodationPaise: 0, foodPaise: 0, activitiesPaise: 0, shoppingPaise: 0, otherPaise: 0 },
      2,
      50000
    );
    expect(summary.remainingPaise).toBe(-50000);
    expect(summary.overBudget).toBe(true);
  });

  it("handles zero travellers without dividing by zero", () => {
    const summary = computeBudgetSummary(
      { transportPaise: 1000, accommodationPaise: 0, foodPaise: 0, activitiesPaise: 0, shoppingPaise: 0, otherPaise: 0 },
      0
    );
    expect(summary.perPersonPaise).toBe(1000);
  });
});

describe("allocateBudget", () => {
  it("splits by BUDGET_SPLIT_PERCENTS and sums back to the exact total", () => {
    const result = allocateBudget(10000000); // Rs. 1,00,000
    const sum = Object.values(result).reduce((s, v) => s + v, 0);
    expect(sum).toBe(10000000);
    expect(result.accommodationPaise).toBe(3500000); // 35%
    expect(result.transportPaise).toBe(2500000); // 25%
  });

  it("never loses or invents paise on an amount that doesn't divide evenly", () => {
    const result = allocateBudget(999997);
    const sum = Object.values(result).reduce((s, v) => s + v, 0);
    expect(sum).toBe(999997);
  });

  it("handles a zero budget", () => {
    const result = allocateBudget(0);
    expect(Object.values(result).every((v) => v === 0)).toBe(true);
  });
});

describe("compareEstimateVsActual", () => {
  it("computes difference and percent of estimate", () => {
    const result = compareEstimateVsActual(3200000, 3500000);
    expect(result.differencePaise).toBe(300000);
    expect(result.percentOfEstimate).toBeCloseTo(109.4, 1);
  });
});

import { describe, it, expect } from "vitest";
import { computePricing } from "./engine";
import type { PricingEngineInput } from "./types";

function baseInput(overrides: Partial<PricingEngineInput> = {}): PricingEngineInput {
  return {
    tourId: "t1",
    departureId: "d1",
    isInternational: false,
    departureCityPricePerPerson: 2500000, // ₹25,000
    singleSupplementPerRoom: 500000,
    travellers: { adults: 2, childrenWithBed: 0, childrenWithoutBed: 0, infants: 0, rooms: 1, singleOccupancyRooms: 0 },
    joiningTravel: { joiningAtDestination: false },
    addOns: {
      travelInsurance: false,
      visaFees: false,
      excursionIds: [],
      excursionsTotal: 0,
      roomUpgrade: false,
      roomUpgradePricePerRoom: 0,
      homeCityAirportTransfer: false,
    },
    personalSpending: { preset: "COMFORT", perDayPerPerson: 100000, days: 5 },
    gstRatePercent: 5,
    tcsRatePercent: 0,
    emiMonthsOptions: [
      { months: 3, annualInterestRate: 0 },
      { months: 6, annualInterestRate: 13 },
      { months: 9, annualInterestRate: 13 },
      { months: 12, annualInterestRate: 13 },
    ],
    amountDuePercentNow: 25,
    ...overrides,
  };
}

describe("computePricing", () => {
  it("computes package cost for 2 adults", () => {
    const out = computePricing(baseInput());
    expect(out.paidToUsSubtotal).toBe(5000000);
  });

  it("applies GST on domestic package", () => {
    const out = computePricing(baseInput());
    expect(out.taxesSubtotal).toBe(250000); // 5% of 5000000
  });

  it("applies TCS only for international", () => {
    const domestic = computePricing(baseInput());
    const intl = computePricing(baseInput({ isInternational: true, tcsRatePercent: 2 }));
    expect(domestic.taxes.find((t) => t.label.includes("TCS"))).toBeUndefined();
    expect(intl.taxes.find((t) => t.label.includes("TCS"))?.amount).toBe(100000); // 2% of 5000000
  });

  it("keeps own spending separate from grand total", () => {
    const out = computePricing(baseInput());
    expect(out.grandTotal).toBe(out.paidToUsSubtotal + out.taxesSubtotal);
    expect(out.grandTotalWithOwnSpending).toBe(out.grandTotal + out.ownSpendingSubtotal);
    expect(out.ownSpendingSubtotal).toBeGreaterThan(0);
  });

  it("applies coupon discount before tax", () => {
    const out = computePricing(baseInput({ couponDiscountPercent: 10 }));
    expect(out.paidToUsSubtotal).toBe(4500000); // 5000000 - 10%
    expect(out.taxesSubtotal).toBe(225000); // 5% of discounted amount
  });

  it("computes EMI options with and without interest", () => {
    const out = computePricing(baseInput());
    const emi3 = out.emiOptions.find((e) => e.months === 3)!;
    expect(emi3.totalInterest).toBe(0);
    const emi12 = out.emiOptions.find((e) => e.months === 12)!;
    expect(emi12.totalInterest).toBeGreaterThan(0);
  });

  it("is deterministic: identical inputs across repeated calls yield identical output", () => {
    // Simulates tour page, calculator, checkout and invoice all calling the same engine.
    const input = baseInput({ isInternational: true, tcsRatePercent: 2, couponDiscountFlat: 100000 });
    const callSite1 = computePricing(input);
    const callSite2 = computePricing(input);
    const callSite3 = computePricing(JSON.parse(JSON.stringify(input)));
    expect(callSite1).toEqual(callSite2);
    expect(callSite1).toEqual(callSite3);
  });

  it("includes single occupancy supplement", () => {
    const out = computePricing(baseInput({ travellers: { adults: 1, childrenWithBed: 0, childrenWithoutBed: 0, infants: 0, rooms: 1, singleOccupancyRooms: 1 } }));
    const line = out.paidToUs.find((l) => l.label.includes("Single occupancy"));
    expect(line?.amount).toBe(500000);
  });

  it("converts to foreign currency equivalent when configured", () => {
    const out = computePricing(baseInput({ foreignCurrency: { code: "USD", rateToInr: 83 } }));
    expect(out.foreignCurrencyEquivalent?.code).toBe("USD");
    expect(out.foreignCurrencyEquivalent?.amount).toBeGreaterThan(0);
  });
});

// Mock payment gateway, shaped so a real provider (e.g. Razorpay) can be
// dropped in later: create an "order", then simulate a webhook-style result.
export type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "EMI";
export type PaymentResult = "SUCCESS" | "FAILED" | "PENDING";

export function simulatePayment(method: PaymentMethod, outcome: PaymentResult | "RANDOM" = "RANDOM"): PaymentResult {
  if (outcome !== "RANDOM") return outcome;
  const roll = Math.random();
  if (roll < 0.8) return "SUCCESS";
  if (roll < 0.95) return "FAILED";
  return "PENDING";
}

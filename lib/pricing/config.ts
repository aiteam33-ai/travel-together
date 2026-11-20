import { prisma } from "../db/client";

export async function getTaxRate(key: "GST_RATE" | "TCS_RATE_INTL" | "TCS_RATE_DOMESTIC"): Promise<number> {
  const row = await prisma.taxConfig.findFirst({ where: { key }, orderBy: { effectiveFrom: "desc" } });
  return row?.value ?? 0;
}

export async function getPricingConfig(key: string): Promise<number> {
  const row = await prisma.pricingConfig.findFirst({ where: { key }, orderBy: { effectiveFrom: "desc" } });
  return row?.value ?? 0;
}

export async function getEmiOptions() {
  const rows = await prisma.emiConfig.findMany({ orderBy: { months: "asc" } });
  return rows.map((r) => ({ months: r.months, annualInterestRate: r.annualInterestRate }));
}

export async function getActiveCoupon(code: string) {
  const row = await prisma.coupon.findFirst({ where: { code: code.toUpperCase(), active: true } });
  if (!row) return null;
  const now = new Date();
  if (row.validFrom > now || row.validTo < now) return null;
  return row;
}

export const SPEND_PRESET_KEYS: Record<string, string> = {
  BUDGET: "SPEND_BUDGET_PER_DAY",
  COMFORT: "SPEND_COMFORT_PER_DAY",
  PREMIUM: "SPEND_PREMIUM_PER_DAY",
};

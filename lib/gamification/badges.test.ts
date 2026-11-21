import { describe, it, expect } from "vitest";
import { computeBadges } from "./badges";

const base = {
  tripsCompleted: 0,
  hasTrekBooking: false,
  reachedSummit: false,
  groupsOrganised: 0,
  budgetsUnderLimit: 0,
  shareStats: { pending: 0, settled: 0 },
};

describe("computeBadges", () => {
  it("earns nothing with no activity", () => {
    const badges = computeBadges(base);
    expect(badges.every((b) => !b.earned)).toBe(true);
    expect(badges).toHaveLength(5);
  });

  it("earns First Trek and Summit Reached together for a high-altitude trek", () => {
    const badges = computeBadges({ ...base, hasTrekBooking: true, reachedSummit: true });
    expect(badges.find((b) => b.id === "first-trek")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "summit-reached")?.earned).toBe(true);
  });

  it("requires 2+ organised groups for Master Planner", () => {
    expect(computeBadges({ ...base, groupsOrganised: 1 }).find((b) => b.id === "master-planner")?.earned).toBe(false);
    expect(computeBadges({ ...base, groupsOrganised: 2 }).find((b) => b.id === "master-planner")?.earned).toBe(true);
  });

  it("Always Paid On Time requires at least one settled share and zero pending", () => {
    expect(computeBadges({ ...base, shareStats: { pending: 0, settled: 0 } }).find((b) => b.id === "always-paid-on-time")?.earned).toBe(false);
    expect(computeBadges({ ...base, shareStats: { pending: 1, settled: 3 } }).find((b) => b.id === "always-paid-on-time")?.earned).toBe(false);
    expect(computeBadges({ ...base, shareStats: { pending: 0, settled: 3 } }).find((b) => b.id === "always-paid-on-time")?.earned).toBe(true);
  });
});

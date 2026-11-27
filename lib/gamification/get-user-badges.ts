import { prisma } from "../db/client";
import { computeBadges, type Badge } from "./badges";

const SUMMIT_ALTITUDE_METERS = 4000;

export async function getUserBadges(userId: string): Promise<{ tripsCompleted: number; badges: Badge[] }> {
  const [bookings, groupsOrganised, myMemberships] = await Promise.all([
    prisma.booking.findMany({ where: { userId }, include: { tour: true } }),
    prisma.group.count({ where: { organiserUserId: userId } }),
    prisma.groupMember.findMany({ where: { userId }, select: { id: true } }),
  ]);

  const tripsCompleted = bookings.filter((b) => b.trackerStage === "TRIP_COMPLETED").length;
  const settledOrConfirmed = (b: (typeof bookings)[number]) => b.status === "CONFIRMED" || b.trackerStage === "TRIP_COMPLETED";

  const trekBookings = bookings.filter((b) => settledOrConfirmed(b) && b.tour.category === "TREK");
  const hasTrekBooking = trekBookings.length > 0;
  const reachedSummit = trekBookings.some((b) => (b.tour.altitudeMeters ?? 0) >= SUMMIT_ALTITUDE_METERS);

  const memberIds = myMemberships.map((m) => m.id);
  const [budgets, shares] = await Promise.all([
    prisma.tripBudget.findMany({ where: { updatedByMemberId: { in: memberIds } } }),
    prisma.bookingShare.findMany({ where: { memberId: { in: memberIds } } }),
  ]);

  const budgetsUnderLimit = budgets.filter((b) => {
    if (b.budgetLimitPaise == null) return false;
    const total = b.transportPaise + b.accommodationPaise + b.foodPaise + b.activitiesPaise + b.shoppingPaise + b.otherPaise;
    return total <= b.budgetLimitPaise;
  }).length;

  const shareStats = {
    pending: shares.filter((s) => s.status === "PENDING").length,
    settled: shares.filter((s) => s.status !== "PENDING").length,
  };

  const badges = computeBadges({
    tripsCompleted,
    hasTrekBooking,
    reachedSummit,
    groupsOrganised,
    budgetsUnderLimit,
    shareStats,
  });

  return { tripsCompleted, badges };
}

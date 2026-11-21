// Pure badge-criteria engine — no I/O. Badges are always computed fresh
// from existing data (bookings, groups, budgets, booking shares) rather
// than stored/awarded, so they can never drift out of sync with reality.

export interface BadgeCriteriaInput {
  tripsCompleted: number; // bookings with trackerStage TRIP_COMPLETED
  hasTrekBooking: boolean; // any CONFIRMED/TRIP_COMPLETED booking on a TREK tour
  reachedSummit: boolean; // trek booking on a tour with altitudeMeters >= 4000
  groupsOrganised: number; // groups this user organised
  budgetsUnderLimit: number; // saved TripBudgets (with a limit set) that came in under it
  shareStats: { pending: number; settled: number }; // this user's BookingShare rows across all groups
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

const SUMMIT_ALTITUDE_METERS = 4000;

export function computeBadges(input: BadgeCriteriaInput): Badge[] {
  return [
    {
      id: "first-trek",
      label: "First Trek",
      description: "Completed or confirmed your first trek booking.",
      earned: input.hasTrekBooking,
    },
    {
      id: "summit-reached",
      label: "Summit Reached",
      description: `Booked a trek above ${SUMMIT_ALTITUDE_METERS.toLocaleString("en-IN")}m altitude.`,
      earned: input.reachedSummit,
    },
    {
      id: "master-planner",
      label: "Master Planner",
      description: "Organised 2 or more trip groups.",
      earned: input.groupsOrganised >= 2,
    },
    {
      id: "budget-boss",
      label: "Budget Boss",
      description: "Saved a trip budget and came in under the limit.",
      earned: input.budgetsUnderLimit >= 1,
    },
    {
      id: "always-paid-on-time",
      label: "Always Paid On Time",
      description: "Never left a group payment share pending.",
      earned: input.shareStats.settled > 0 && input.shareStats.pending === 0,
    },
  ];
}

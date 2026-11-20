import { z } from "zod";

export const travellerCountsSchema = z.object({
  adults: z.number().int().min(1).max(20),
  childrenWithBed: z.number().int().min(0).max(10),
  childrenWithoutBed: z.number().int().min(0).max(10),
  infants: z.number().int().min(0).max(5),
  rooms: z.number().int().min(1).max(10),
  singleOccupancyRooms: z.number().int().min(0).max(10),
});

export const calculatorRequestSchema = z.object({
  departureId: z.string().min(1),
  departureCity: z.string().min(1),
  travellers: travellerCountsSchema,
  joiningMode: z.string().optional(),
  joiningFareOverride: z.number().int().min(0).optional(),
  addOns: z
    .object({
      travelInsurance: z.boolean().optional(),
      visaFees: z.boolean().optional(),
      excursionIds: z.array(z.string()).optional(),
      excursionsTotal: z.number().int().min(0).optional(),
      roomUpgrade: z.boolean().optional(),
      roomUpgradePricePerRoom: z.number().int().min(0).optional(),
      homeCityAirportTransfer: z.boolean().optional(),
    })
    .default({}),
  spendPreset: z.enum(["BUDGET", "COMFORT", "PREMIUM"]).default("COMFORT"),
  spendPerDayOverride: z.number().int().min(0).optional(),
  couponCode: z.string().optional(),
  amountDuePercentNow: z.number().min(1).max(100).default(25),
});

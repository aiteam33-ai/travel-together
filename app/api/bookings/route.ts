import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { buildPricingInput } from "@/lib/pricing/build-input";
import { computePricing } from "@/lib/pricing/engine";
import { travellerCountsSchema } from "@/lib/validation/calculator";
import { requireMembership, logEvent } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

const travellerDetailSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0).max(120),
  mealChoice: z.enum(["VEG", "JAIN", "NON_VEG"]),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
});

const schema = z.object({
  departureId: z.string(),
  departureCity: z.string(),
  travellers: travellerCountsSchema,
  travellerDetails: z.array(travellerDetailSchema).default([]),
  joiningMode: z.string().optional(),
  addOns: z.record(z.string(), z.any()).default({}),
  spendPreset: z.enum(["BUDGET", "COMFORT", "PREMIUM"]).default("COMFORT"),
  couponCode: z.string().optional(),
  amountDuePercentNow: z.number().min(1).max(100).default(25),
  groupId: z.string().optional(),
});

const HOLD_MINUTES = 15;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;

  // Only the organiser books for the group — members never pay us individually in this release.
  if (body.groupId) {
    const ctx = await requireMembership(body.groupId, user.id);
    if (!ctx || ctx.membership.role !== "ORGANISER") {
      return NextResponse.json({ error: "Only the group's organiser can book for the group." }, { status: 403 });
    }
  }

  const departure = await prisma.departure.findUniqueOrThrow({ where: { id: body.departureId } });
  const seatsNeeded = body.travellers.adults + body.travellers.childrenWithBed + body.travellers.childrenWithoutBed;
  if (departure.seatsBooked + seatsNeeded > departure.totalSeats) {
    return NextResponse.json({ error: "Not enough seats left on this departure." }, { status: 400 });
  }

  const input = await buildPricingInput(body);
  const output = computePricing(input);

  const bookingRef = `PH${Date.now().toString(36).toUpperCase()}`;
  const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

  const booking = await prisma.$transaction(async (tx) => {
    await tx.departure.update({ where: { id: departure.id }, data: { seatsBooked: { increment: seatsNeeded } } });
    return tx.booking.create({
      data: {
        bookingRef,
        userId: user.id,
        tourId: input.tourId,
        departureId: departure.id,
        status: "HELD",
        travellersJson: JSON.stringify({ counts: body.travellers, details: body.travellerDetails }),
        addOnsJson: JSON.stringify(body.addOns),
        pricingSnapshotJson: JSON.stringify({ input, output }),
        amountDue: output.grandTotal,
        holdExpiresAt,
        groupId: body.groupId,
      },
    });
  });

  if (body.groupId) {
    await addSystemFeedEntry(body.groupId, `A booking was started for this trip (ref ${bookingRef}).`);
  }
  await logEvent("CHECKOUT_STARTED", user.id, { bookingId: booking.id, groupId: body.groupId });

  return NextResponse.json({ ok: true, bookingId: booking.id, bookingRef, holdExpiresAt });
}

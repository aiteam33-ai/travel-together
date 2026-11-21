import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(1000),
  photoUrls: z.array(z.string().url()).max(6).default([]),
});

// A review for the group's own tour, posted from the post-trip Memories
// view. verifiedBooking reflects whether this group actually booked (and
// paid for) the trip, not just planned it.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!ctx.group.tourId) return NextResponse.json({ error: "This group has no tour selected" }, { status: 400 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });

  const confirmedBooking = await prisma.booking.findFirst({ where: { groupId: id, status: "CONFIRMED" } });

  const review = await prisma.review.create({
    data: {
      tourId: ctx.group.tourId,
      name: user.name ?? ctx.membership.name,
      rating: parsed.data.rating,
      text: parsed.data.text,
      travelDate: new Date(),
      verifiedBooking: !!confirmedBooking,
      isSampleData: false,
      photos: parsed.data.photoUrls.length ? JSON.stringify(parsed.data.photoUrls) : null,
    },
  });

  return NextResponse.json({ ok: true, review });
}

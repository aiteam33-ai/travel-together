import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";
import { splitExpense } from "@/lib/expenses/engine";

const schema = z.object({ bookingId: z.string() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const booking = await prisma.booking.findFirst({ where: { id: parsed.data.bookingId, groupId: id } });
  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: "Only the person who paid can add this booking to expenses." }, { status: 403 });
  }
  if (booking.amountPaid <= 0) return NextResponse.json({ error: "Nothing paid yet." }, { status: 400 });

  const { details } = JSON.parse(booking.travellersJson) as { details: { name: string }[] };
  const joinedMembers = await prisma.groupMember.findMany({ where: { groupId: id, status: "JOINED" } });

  // Best-effort match of traveller names to members; fall back to all joined members if nothing matches.
  const matched = joinedMembers.filter((m) => details.some((d) => d.name.trim().toLowerCase() === m.name.trim().toLowerCase()));
  const participantMemberIds = (matched.length > 0 ? matched : joinedMembers).map((m) => m.id);
  if (participantMemberIds.length === 0) return NextResponse.json({ error: "No group members to split with." }, { status: 400 });
  if (!participantMemberIds.includes(ctx.membership.id)) participantMemberIds.push(ctx.membership.id);

  const shares = splitExpense({
    amountPaise: booking.amountPaid,
    paidByMemberId: ctx.membership.id,
    participantMemberIds,
    splitType: "EQUAL",
  });

  const expense = await prisma.expense.create({
    data: {
      groupId: id,
      description: `Booking payment (${booking.bookingRef})`,
      amountPaise: booking.amountPaid,
      date: new Date(),
      paidByMemberId: ctx.membership.id,
      splitType: "EQUAL",
      createdByMemberId: ctx.membership.id,
      fromBooking: true,
      participants: { create: shares.map((s) => ({ memberId: s.memberId, shareAmountPaise: s.shareAmountPaise })) },
    },
  });

  await addSystemFeedEntry(id, `${ctx.membership.name} added the booking payment to group expenses.`);
  return NextResponse.json({ ok: true, expenseId: expense.id });
}

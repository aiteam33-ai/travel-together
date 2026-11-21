import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [members, preferences, readinessRows, latestBooking] = await Promise.all([
    prisma.groupMember.findMany({ where: { groupId: id, status: "JOINED" } }),
    prisma.memberPreference.findMany({ where: { member: { groupId: id, status: "JOINED" } } }),
    prisma.memberReadiness.findMany({ where: { member: { groupId: id, status: "JOINED" } } }),
    prisma.booking.findFirst({ where: { groupId: id }, orderBy: { createdAt: "desc" }, include: { shares: true } }),
  ]);

  const preferenceMemberIds = new Set(preferences.map((p) => p.memberId));
  const readinessByMember = new Map(readinessRows.map((r) => [r.memberId, r]));
  const shareByMember = new Map((latestBooking?.shares ?? []).map((s) => [s.memberId, s]));

  const perMember = members.map((m) => {
    const share = shareByMember.get(m.id);
    const paymentDone = latestBooking ? share?.status !== "PENDING" : true; // nothing to pay yet
    return {
      memberId: m.id,
      name: m.name,
      paymentDone,
      preferencesFilled: preferenceMemberIds.has(m.id),
      idDocumentUploaded: readinessByMember.get(m.id)?.idDocumentUploaded ?? false,
      packingDone: readinessByMember.get(m.id)?.packingDone ?? false,
    };
  });

  const totalChecks = perMember.length * 4;
  const doneChecks = perMember.reduce(
    (sum, m) => sum + Number(m.paymentDone) + Number(m.preferencesFilled) + Number(m.idDocumentUploaded) + Number(m.packingDone),
    0
  );

  // Departure countdown target: the booked departure if there is one, else the group's selected tour's next upcoming departure.
  let departureDate: Date | null = null;
  if (latestBooking) {
    const departure = await prisma.departure.findUnique({ where: { id: latestBooking.departureId } });
    departureDate = departure?.startDate ?? null;
  } else {
    const group = await prisma.group.findUnique({ where: { id }, select: { tourId: true } });
    if (group?.tourId) {
      const nextDeparture = await prisma.departure.findFirst({
        where: { tourId: group.tourId, startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
      });
      departureDate = nextDeparture?.startDate ?? null;
    }
  }

  return NextResponse.json({
    perMember,
    readinessPercent: totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0,
    departureDate,
    myMemberId: ctx.membership.id,
  });
}

const schema = z.object({ idDocumentUploaded: z.boolean().optional(), packingDone: z.boolean().optional() });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });

  await prisma.memberReadiness.upsert({
    where: { memberId: ctx.membership.id },
    create: { memberId: ctx.membership.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

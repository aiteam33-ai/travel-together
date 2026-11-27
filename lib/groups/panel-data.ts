// Shared read-logic behind the My Socials overview panels' API routes.
// Extracted so the overview page can fetch each panel's initial data
// server-side (one DB round trip, parallel with the others) instead of
// every panel re-deriving it itself after a client-side fetch on mount.
import { prisma } from "../db/client";
import { defaultChecklistItems } from "../trek/essentials";
import type { GroupAccessContext } from "./access";

export async function getReadinessData(groupId: string, ctx: GroupAccessContext) {
  const [members, preferences, readinessRows, latestBooking] = await Promise.all([
    prisma.groupMember.findMany({ where: { groupId, status: "JOINED" } }),
    prisma.memberPreference.findMany({ where: { member: { groupId, status: "JOINED" } } }),
    prisma.memberReadiness.findMany({ where: { member: { groupId, status: "JOINED" } } }),
    prisma.booking.findFirst({ where: { groupId }, orderBy: { createdAt: "desc" }, include: { shares: true } }),
  ]);

  const preferenceMemberIds = new Set(preferences.map((p) => p.memberId));
  const readinessByMember = new Map(readinessRows.map((r) => [r.memberId, r]));
  const shareByMember = new Map((latestBooking?.shares ?? []).map((s) => [s.memberId, s]));

  const perMember = members.map((m) => {
    const share = shareByMember.get(m.id);
    const paymentDone = latestBooking ? share?.status !== "PENDING" : true;
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

  let departureDate: Date | null = null;
  if (latestBooking) {
    const departure = await prisma.departure.findUnique({ where: { id: latestBooking.departureId } });
    departureDate = departure?.startDate ?? null;
  } else {
    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { tourId: true } });
    if (group?.tourId) {
      const nextDeparture = await prisma.departure.findFirst({
        where: { tourId: group.tourId, startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
      });
      departureDate = nextDeparture?.startDate ?? null;
    }
  }

  return {
    perMember,
    readinessPercent: totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0,
    departureDate,
    myMemberId: ctx.membership.id,
  };
}

export async function getFeedData(groupId: string) {
  const items = await prisma.groupFeedItem.findMany({
    where: { groupId, deletedAt: null },
    include: {
      author: true,
      attachmentTour: true,
      votes: true,
      poll: { include: { options: { include: { votes: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return { items };
}

export async function getChecklistData(groupId: string, ctx: GroupAccessContext) {
  let items = await prisma.tripChecklistItem.findMany({ where: { groupId }, include: { claimedBy: true } });

  if (items.length === 0 && ctx.group.tourId) {
    const tour = await prisma.tour.findUnique({ where: { id: ctx.group.tourId } });
    if (tour) {
      const defaults = defaultChecklistItems(tour);
      if (defaults.length > 0) {
        await prisma.tripChecklistItem.createMany({
          data: defaults.map((d) => ({ groupId, category: d.category, label: d.label, mode: d.mode })),
        });
        items = await prisma.tripChecklistItem.findMany({ where: { groupId }, include: { claimedBy: true } });
      }
    }
  }

  return { items, myMemberId: ctx.membership.id };
}

export async function getSafetyData(groupId: string, ctx: GroupAccessContext) {
  const [members, safetyRows] = await Promise.all([
    prisma.groupMember.findMany({ where: { groupId, status: "JOINED" } }),
    prisma.memberSafetyInfo.findMany({ where: { member: { groupId, status: "JOINED" } } }),
  ]);

  const isOrganiser = ctx.membership.role === "ORGANISER";
  const byMember = new Map(safetyRows.map((r) => [r.memberId, r]));

  const contacts = members.map((m) => {
    const row = byMember.get(m.id);
    const includeMedical = m.id === ctx.membership.id || (isOrganiser && row?.medicalNotesConsent);
    return {
      memberId: m.id,
      name: m.name,
      isOrganiser: m.role === "ORGANISER",
      emergencyContactName: row?.emergencyContactName ?? null,
      emergencyContactPhone: row?.emergencyContactPhone ?? null,
      medicalNotes: includeMedical ? row?.medicalNotes ?? null : undefined,
      medicalNotesConsent: row?.medicalNotesConsent ?? false,
    };
  });

  const organiser = members.find((m) => m.role === "ORGANISER");

  return { contacts, myMemberId: ctx.membership.id, tripLeader: organiser ? { name: organiser.name, phone: organiser.phone } : null };
}

export async function getSosData(groupId: string) {
  const alerts = await prisma.sosAlert.findMany({
    where: { groupId },
    include: { member: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return { alerts };
}

export async function getFitnessRating(ctx: GroupAccessContext): Promise<number | null> {
  const mine = await prisma.memberPreference.findUnique({ where: { memberId: ctx.membership.id } });
  return mine?.fitnessSelfRating ?? null;
}

export async function getSharesData(bookingId: string, ctx: GroupAccessContext) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;
  const shares = await prisma.bookingShare.findMany({ where: { bookingId }, include: { member: true } });
  return { booking, shares, myMemberId: ctx.membership.id, isOrganiser: ctx.membership.role === "ORGANISER" };
}

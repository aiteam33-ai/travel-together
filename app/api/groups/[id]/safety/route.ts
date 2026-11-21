import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";

// Emergency contacts are visible to the whole group. Medical notes are
// PRIVATE: only ever included for the caller's own record, or for the trip
// leader (organiser) when that member has set medicalNotesConsent — and
// even then, never alongside anyone else's.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [members, safetyRows] = await Promise.all([
    prisma.groupMember.findMany({ where: { groupId: id, status: "JOINED" } }),
    prisma.memberSafetyInfo.findMany({ where: { member: { groupId: id, status: "JOINED" } } }),
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

  return NextResponse.json({ contacts, myMemberId: ctx.membership.id, tripLeader: organiser ? { name: organiser.name, phone: organiser.phone } : null });
}

const schema = z.object({
  emergencyContactName: z.string().trim().max(80).optional(),
  emergencyContactPhone: z.string().trim().max(20).optional(),
  medicalNotes: z.string().trim().max(1000).optional(),
  medicalNotesConsent: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid safety info" }, { status: 400 });

  await prisma.memberSafetyInfo.upsert({
    where: { memberId: ctx.membership.id },
    create: { memberId: ctx.membership.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

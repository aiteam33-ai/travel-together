import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { logEvent } from "@/lib/groups/access";

// Reuses this group's JOINED members in a brand-new group with no tour
// selected yet — the same people, a fresh plan. Organiser-only.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ctx.membership.role !== "ORGANISER") {
    return NextResponse.json({ error: "Only the organiser can start the next trip." }, { status: 403 });
  }

  const members = await prisma.groupMember.findMany({ where: { groupId: id, status: "JOINED" } });

  const newGroup = await prisma.group.create({
    data: {
      name: `${ctx.group.name} — next trip`,
      organiserUserId: ctx.group.organiserUserId,
      members: {
        create: members.map((m) => ({
          userId: m.userId,
          name: m.name,
          phone: m.phone,
          role: m.role,
          status: "JOINED",
          consentAt: new Date(),
        })),
      },
    },
  });

  await logEvent("GROUP_PLAN_NEXT", user.id, { fromGroupId: id, newGroupId: newGroup.id });

  return NextResponse.json({ ok: true, groupId: newGroup.id });
}

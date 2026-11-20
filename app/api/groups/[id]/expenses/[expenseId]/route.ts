import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";
import { splitExpense } from "@/lib/expenses/engine";

async function canEdit(groupId: string, expenseId: string, memberId: string, role: string) {
  const expense = await prisma.expense.findFirst({ where: { id: expenseId, groupId } });
  if (!expense) return null;
  if (expense.createdByMemberId !== memberId && role !== "ORGANISER") return null;
  return expense;
}

const patchSchema = z.object({
  description: z.string().min(1).max(120).optional(),
  amountPaise: z.number().int().positive().optional(),
  date: z.string().optional(),
  paidByMemberId: z.string().optional(),
  participantMemberIds: z.array(z.string()).min(1).optional(),
  splitType: z.enum(["EQUAL", "CUSTOM"]).optional(),
  customShares: z.record(z.string(), z.number().int().min(0)).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; expenseId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, expenseId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await canEdit(id, expenseId, ctx.membership.id, ctx.membership.role);
  if (!existing) return NextResponse.json({ error: "Not found or not allowed" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const data = parsed.data;

  const amountPaise = data.amountPaise ?? existing.amountPaise;
  const paidByMemberId = data.paidByMemberId ?? existing.paidByMemberId;
  const splitType = data.splitType ?? existing.splitType;
  let participantMemberIds = data.participantMemberIds;
  if (!participantMemberIds) {
    const current = await prisma.expenseParticipant.findMany({ where: { expenseId } });
    participantMemberIds = current.map((p) => p.memberId);
  }

  let shares;
  try {
    shares = splitExpense({ amountPaise, paidByMemberId, participantMemberIds, splitType: splitType as "EQUAL" | "CUSTOM", customShares: data.customShares });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid split" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.expenseParticipant.deleteMany({ where: { expenseId } }),
    prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: data.description ?? existing.description,
        amountPaise,
        date: data.date ? new Date(data.date) : existing.date,
        paidByMemberId,
        splitType,
        participants: { create: shares.map((s) => ({ memberId: s.memberId, shareAmountPaise: s.shareAmountPaise })) },
      },
    }),
  ]);

  await addSystemFeedEntry(id, `${ctx.membership.name} edited the expense "${data.description ?? existing.description}".`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; expenseId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, expenseId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await canEdit(id, expenseId, ctx.membership.id, ctx.membership.role);
  if (!existing) return NextResponse.json({ error: "Not found or not allowed" }, { status: 403 });

  await prisma.expense.update({ where: { id: expenseId }, data: { deletedAt: new Date() } });
  await addSystemFeedEntry(id, `${ctx.membership.name} deleted the expense "${existing.description}".`);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership, logEvent } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";
import { splitExpense } from "@/lib/expenses/engine";

const schema = z.object({
  description: z.string().min(1).max(120),
  amountPaise: z.number().int().positive(),
  date: z.string(),
  paidByMemberId: z.string(),
  participantMemberIds: z.array(z.string()).min(1),
  splitType: z.enum(["EQUAL", "CUSTOM"]),
  customShares: z.record(z.string(), z.number().int().min(0)).optional(),
  fromBooking: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [expenses, settlements, members] = await Promise.all([
    prisma.expense.findMany({ where: { groupId: id, deletedAt: null }, include: { participants: true, paidBy: true, createdBy: true }, orderBy: { date: "desc" } }),
    prisma.settlement.findMany({ where: { groupId: id }, include: { fromMember: true, toMember: true }, orderBy: { createdAt: "desc" } }),
    prisma.groupMember.findMany({ where: { groupId: id } }),
  ]);

  return NextResponse.json({ expenses, settlements, members });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  let shares;
  try {
    shares = splitExpense({
      amountPaise: data.amountPaise,
      paidByMemberId: data.paidByMemberId,
      participantMemberIds: data.participantMemberIds,
      splitType: data.splitType,
      customShares: data.customShares,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid split" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      groupId: id,
      description: data.description,
      amountPaise: data.amountPaise,
      date: new Date(data.date),
      paidByMemberId: data.paidByMemberId,
      splitType: data.splitType,
      createdByMemberId: ctx.membership.id,
      fromBooking: data.fromBooking ?? false,
      participants: { create: shares.map((s) => ({ memberId: s.memberId, shareAmountPaise: s.shareAmountPaise })) },
    },
  });

  await addSystemFeedEntry(id, `${ctx.membership.name} added an expense: "${data.description}" (₹${(data.amountPaise / 100).toLocaleString("en-IN")}).`);
  await logEvent("EXPENSE_ADDED", user.id, { groupId: id });

  return NextResponse.json({ ok: true, expenseId: expense.id });
}

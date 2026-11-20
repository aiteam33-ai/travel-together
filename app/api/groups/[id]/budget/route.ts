import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const budget = await prisma.tripBudget.findUnique({ where: { groupId: id } });

  const actualAgg = await prisma.expense.aggregate({
    where: { groupId: id, deletedAt: null },
    _sum: { amountPaise: true },
  });

  return NextResponse.json({ budget, actualTotalPaise: actualAgg._sum.amountPaise ?? 0 });
}

const schema = z.object({
  destination: z.string().trim().min(1).max(120),
  travellers: z.number().int().min(1).max(100),
  days: z.number().int().min(1).max(60),
  transportPaise: z.number().int().min(0),
  accommodationPaise: z.number().int().min(0),
  foodPaise: z.number().int().min(0),
  activitiesPaise: z.number().int().min(0),
  shoppingPaise: z.number().int().min(0),
  otherPaise: z.number().int().min(0),
  budgetLimitPaise: z.number().int().min(0).nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid budget" }, { status: 400 });

  const budget = await prisma.tripBudget.upsert({
    where: { groupId: id },
    create: { groupId: id, updatedByMemberId: ctx.membership.id, ...parsed.data },
    update: { updatedByMemberId: ctx.membership.id, ...parsed.data },
  });

  await addSystemFeedEntry(id, `${user.name} updated the trip budget for ${parsed.data.destination}`);

  return NextResponse.json({ ok: true, budget });
}

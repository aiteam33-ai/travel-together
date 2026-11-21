import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { computeBalances } from "@/lib/expenses/engine";
import { generateGroupExpenseSummaryPdf } from "@/lib/pdf/invoice";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [group, members, expenses, settlements] = await Promise.all([
    prisma.group.findUnique({ where: { id }, include: { tour: true } }),
    prisma.groupMember.findMany({ where: { groupId: id, status: "JOINED" } }),
    prisma.expense.findMany({ where: { groupId: id, deletedAt: null }, include: { participants: true } }),
    prisma.settlement.findMany({ where: { groupId: id }, include: { fromMember: true, toMember: true } }),
  ]);
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nameOf = (memberId: string) => members.find((m) => m.id === memberId)?.name ?? "Someone";

  const balances = computeBalances(
    expenses.map((e) => ({
      id: e.id,
      amountPaise: e.amountPaise,
      paidByMemberId: e.paidByMemberId,
      participantMemberIds: e.participants.map((p) => p.memberId),
      splitType: e.splitType as "EQUAL" | "CUSTOM",
      customShares: e.splitType === "CUSTOM" ? Object.fromEntries(e.participants.map((p) => [p.memberId, p.shareAmountPaise])) : undefined,
    })),
    settlements.map((s) => ({ fromMemberId: s.fromMemberId, toMemberId: s.toMemberId, amountPaise: s.amountPaise }))
  );

  const totalExpensesPaise = expenses.reduce((sum, e) => sum + e.amountPaise, 0);

  const pdfBytes = await generateGroupExpenseSummaryPdf({
    groupName: group.name,
    tourTitle: group.tour?.title ?? null,
    totalExpensesPaise,
    memberBalances: balances.map((b) => ({ name: nameOf(b.memberId), netPaise: b.netPaise })),
    settlements: settlements.map((s) => ({ fromName: s.fromMember.name, toName: s.toMember.name, amountPaise: s.amountPaise })),
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="group-expense-summary-${id}.pdf"`,
    },
  });
}

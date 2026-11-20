import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";
import { buildPricingInput } from "@/lib/pricing/build-input";
import { computePricing } from "@/lib/pricing/engine";
import { calculatorRequestSchema } from "@/lib/validation/calculator";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = calculatorRequestSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Same buildPricingInput + computePricing pipeline as the tour page, the
  // standalone calculator, checkout and the invoice — so the figure always agrees.
  const input = await buildPricingInput(parsed.data);
  const output = computePricing(input);

  await prisma.group.update({ where: { id }, data: { estimateSnapshotJson: JSON.stringify(output) } });
  await addSystemFeedEntry(id, `${ctx.membership.name} saved a cost estimate for the group: ₹${(output.grandTotal / 100).toLocaleString("en-IN")}.`);

  return NextResponse.json({ ok: true, output });
}

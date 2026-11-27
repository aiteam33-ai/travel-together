import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { getSharesData } from "@/lib/groups/panel-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || !booking.groupId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ctx = await requireMembership(booking.groupId, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await getSharesData(id, ctx);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

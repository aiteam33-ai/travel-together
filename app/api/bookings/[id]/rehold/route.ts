import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const HOLD_MINUTES = 15;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const booking = await prisma.booking.findFirst({ where: { id, userId: user.id } });
  if (!booking || booking.status !== "HELD") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
  await prisma.booking.update({ where: { id: booking.id }, data: { holdExpiresAt } });
  return NextResponse.json({ ok: true, holdExpiresAt });
}

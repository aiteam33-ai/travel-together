import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await params;
  await prisma.groupDiscountTier.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}

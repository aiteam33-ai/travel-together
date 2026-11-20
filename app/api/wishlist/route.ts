import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { tourId } = await req.json();
  await prisma.wishlistItem.upsert({
    where: { userId_tourId: { userId: user.id, tourId } },
    update: {},
    create: { userId: user.id, tourId },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { tourId } = await req.json();
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, tourId } });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const items = await prisma.wishlistItem.findMany({ where: { userId: user.id }, include: { tour: true } });
  return NextResponse.json({ items });
}

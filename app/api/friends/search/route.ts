import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ users: [] });

  const matches = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      OR: [{ name: { contains: q } }, { phone: { contains: q } }],
    },
    select: { id: true, name: true, phone: true },
    take: 10,
  });

  return NextResponse.json({ users: matches });
}

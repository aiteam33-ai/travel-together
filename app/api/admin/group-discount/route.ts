import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const schema = z.object({ minTravellers: z.number().int().min(2), discountPerPersonPaise: z.number().int().min(0) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  await prisma.groupDiscountTier.create({ data: { ...parsed.data, effectiveFrom: new Date() } });
  return NextResponse.json({ ok: true });
}

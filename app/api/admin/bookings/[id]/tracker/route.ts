import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const schema = z.object({ trackerStage: z.enum(["BOOKED", "DOCUMENTS_RECEIVED", "BALANCE_PAID", "VOUCHERS_ISSUED", "TRIP_COMPLETED"]) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  await prisma.booking.update({ where: { id }, data: { trackerStage: parsed.data.trackerStage } });
  return NextResponse.json({ ok: true });
}

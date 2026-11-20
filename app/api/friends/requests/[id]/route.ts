import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const schema = z.object({ action: z.enum(["ACCEPT", "REJECT"]) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const request = await prisma.friendRequest.findFirst({ where: { id, toUserId: user.id, status: "PENDING" } });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.friendRequest.update({
    where: { id },
    data: { status: parsed.data.action === "ACCEPT" ? "ACCEPTED" : "REJECTED", respondedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

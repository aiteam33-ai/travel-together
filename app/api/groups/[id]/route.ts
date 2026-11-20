import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      tour: { include: { departures: true } },
      members: { orderBy: { createdAt: "asc" } },
    },
  });
  return NextResponse.json({ group, myMembership: ctx.membership });
}

const patchSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  tourId: z.string().optional(),
  departureId: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ctx.membership.role !== "ORGANISER") return NextResponse.json({ error: "Organiser only" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await prisma.group.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

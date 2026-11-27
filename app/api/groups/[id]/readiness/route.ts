import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { getReadinessData } from "@/lib/groups/panel-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(await getReadinessData(id, ctx));
}

const schema = z.object({ idDocumentUploaded: z.boolean().optional(), packingDone: z.boolean().optional() });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });

  await prisma.memberReadiness.upsert({
    where: { memberId: ctx.membership.id },
    create: { memberId: ctx.membership.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

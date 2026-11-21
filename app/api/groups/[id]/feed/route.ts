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

  const items = await prisma.groupFeedItem.findMany({
    where: { groupId: id, deletedAt: null },
    include: { author: true, attachmentTour: true, votes: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items });
}

const schema = z.object({
  text: z.string().min(1).max(1000),
  parentId: z.string().optional(),
  messageKind: z.enum(["TEXT", "IMAGE", "LINK", "PACKAGE"]).default("TEXT"),
  attachmentUrl: z.string().url().optional(),
  attachmentTourId: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid post" }, { status: 400 });

  const item = await prisma.groupFeedItem.create({
    data: {
      groupId: id,
      type: parsed.data.parentId ? "COMMENT" : "POST",
      authorMemberId: ctx.membership.id,
      text: parsed.data.text,
      parentId: parsed.data.parentId,
      messageKind: parsed.data.messageKind,
      attachmentUrl: parsed.data.attachmentUrl,
      attachmentTourId: parsed.data.attachmentTourId,
    },
    include: { attachmentTour: true },
  });
  return NextResponse.json({ ok: true, item });
}

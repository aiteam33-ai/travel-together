import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";

const schema = z.object({
  question: z.string().trim().min(1).max(200),
  options: z.array(z.string().trim().min(1).max(60)).min(2).max(8),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid poll" }, { status: 400 });

  const item = await prisma.groupFeedItem.create({
    data: {
      groupId: id,
      type: "POST",
      authorMemberId: ctx.membership.id,
      text: parsed.data.question,
      messageKind: "POLL",
      poll: {
        create: {
          question: parsed.data.question,
          options: { create: parsed.data.options.map((label) => ({ label })) },
        },
      },
    },
    include: {
      author: true,
      attachmentTour: true,
      votes: true,
      poll: { include: { options: { include: { votes: true } } } },
    },
  });

  return NextResponse.json({ ok: true, item });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const alerts = await prisma.sosAlert.findMany({
    where: { groupId: id },
    include: { member: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ alerts });
}

const schema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  message: z.string().trim().max(200).optional(),
});

// One-off location share, not live tracking — see the model's own note.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid SOS" }, { status: 400 });

  const alert = await prisma.sosAlert.create({
    data: { groupId: id, memberId: ctx.membership.id, ...parsed.data },
  });

  const locationNote = parsed.data.latitude != null ? " — location shared with the group" : " (location unavailable)";
  await addSystemFeedEntry(id, `🚨 SOS from ${user.name}${locationNote}.`);

  return NextResponse.json({ ok: true, alert });
}

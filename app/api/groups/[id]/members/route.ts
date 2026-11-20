import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership, checkInviteRateLimit, logEvent } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";
import { sendMessage } from "@/lib/mocks/outbox";
import { BRAND } from "@/lib/brand";

const schema = z.object({ name: z.string().min(1), phone: z.string().min(6) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = await checkInviteRateLimit(user.id);
  if (!allowed) return NextResponse.json({ error: "Too many invitations sent recently. Please try again later." }, { status: 429 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid member details" }, { status: 400 });
  const normalizedPhone = parsed.data.phone.startsWith("+") ? parsed.data.phone : `+91${parsed.data.phone.replace(/\D/g, "")}`;

  const existing = await prisma.groupMember.findFirst({ where: { groupId: id, phone: normalizedPhone } });
  if (existing) return NextResponse.json({ error: "Already invited to this group" }, { status: 400 });

  const matchingUser = await prisma.user.findUnique({ where: { phone: normalizedPhone } });

  const member = await prisma.groupMember.create({
    data: {
      groupId: id,
      name: parsed.data.name,
      phone: normalizedPhone,
      role: "MEMBER",
      status: matchingUser ? "JOINED" : "INVITED",
      userId: matchingUser?.id,
      consentAt: matchingUser ? new Date() : null,
    },
  });

  await addSystemFeedEntry(id, `${parsed.data.name} was invited${matchingUser ? " and joined" : ""}.`);
  await sendMessage("WHATSAPP", normalizedPhone, `You've been invited to plan a trip on ${BRAND.name}. Open the app and sign in with this number to join.`);
  await logEvent("INVITE_SENT", user.id, { groupId: id });
  if (matchingUser) await logEvent("INVITE_ACCEPTED", matchingUser.id, { groupId: id });

  return NextResponse.json({ ok: true, memberId: member.id });
}

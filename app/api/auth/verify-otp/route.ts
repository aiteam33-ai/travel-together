import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { addSystemFeedEntry } from "@/lib/groups/feed";

const schema = z.object({
  identifier: z.string().min(5),
  code: z.string().length(6),
  name: z.string().optional(),
  isEmail: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { identifier, code, name, isEmail } = parsed.data;

  const result = await verifyOtp(identifier, code);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });

  let user = isEmail
    ? await prisma.user.findUnique({ where: { email: identifier } })
    : await prisma.user.findUnique({ where: { phone: identifier } });

  const isNewUser = !user;
  if (!user) {
    user = await prisma.user.create({
      data: isEmail ? { email: identifier, name: name ?? null } : { phone: identifier, name: name ?? null },
    });
  } else if (name && !user.name) {
    user = await prisma.user.update({ where: { id: user.id }, data: { name } });
  }

  await createSession(user.id);

  // Someone invited by phone becomes "joined" the moment they sign in with that number.
  if (!isEmail) {
    const invitedMemberships = await prisma.groupMember.findMany({
      where: { phone: identifier, userId: null, status: "INVITED" },
    });
    for (const membership of invitedMemberships) {
      await prisma.groupMember.update({
        where: { id: membership.id },
        data: { userId: user.id, status: "JOINED", consentAt: new Date(), name: user.name ?? membership.name },
      });
      await addSystemFeedEntry(membership.groupId, `${user.name ?? membership.name} joined.`);
    }
  }

  return NextResponse.json({ ok: true, isNewUser, user: { id: user.id, name: user.name } });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { logEvent } from "@/lib/groups/access";

const schema = z.object({ name: z.string().min(1).max(60) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ groups: [] });
  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, status: "JOINED" },
    include: { group: { include: { tour: true, members: true } } },
  });
  return NextResponse.json({ groups: memberships.map((m) => m.group) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid group name" }, { status: 400 });

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      organiserUserId: user.id,
      members: {
        create: {
          userId: user.id,
          name: user.name ?? "Organiser",
          phone: user.phone,
          role: "ORGANISER",
          status: "JOINED",
          consentAt: new Date(),
        },
      },
    },
  });
  await logEvent("GROUP_CREATED", user.id, { groupId: group.id });
  return NextResponse.json({ ok: true, groupId: group.id });
}

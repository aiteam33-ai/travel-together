import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const schema = z.object({ toUserId: z.string() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (parsed.data.toUserId === user.id) return NextResponse.json({ error: "Can't friend yourself" }, { status: 400 });

  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromUserId: user.id, toUserId: parsed.data.toUserId },
        { fromUserId: parsed.data.toUserId, toUserId: user.id },
      ],
    },
  });
  if (existing) return NextResponse.json({ error: "A request already exists between you two" }, { status: 400 });

  const request = await prisma.friendRequest.create({
    data: { fromUserId: user.id, toUserId: parsed.data.toUserId },
  });
  return NextResponse.json({ ok: true, requestId: request.id });
}

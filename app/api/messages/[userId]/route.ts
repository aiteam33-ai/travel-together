import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { areFriends } from "@/lib/friends/access";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { userId } = await params;
  if (!(await areFriends(user.id, userId))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { fromUserId: user.id, toUserId: userId },
        { fromUserId: userId, toUserId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.directMessage.updateMany({
    where: { fromUserId: userId, toUserId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  const other = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, phone: true } });

  return NextResponse.json({ messages, other });
}

const schema = z.object({ text: z.string().trim().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { userId } = await params;
  if (!(await areFriends(user.id, userId))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });

  const message = await prisma.directMessage.create({
    data: { fromUserId: user.id, toUserId: userId, text: parsed.data.text },
  });

  return NextResponse.json({ message });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

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
  return NextResponse.json({ ok: true, isNewUser, user: { id: user.id, name: user.name } });
}

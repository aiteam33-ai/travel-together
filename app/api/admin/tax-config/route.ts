import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

const schema = z.object({ key: z.string(), value: z.number() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const previous = await prisma.taxConfig.findFirst({ where: { key: parsed.data.key }, orderBy: { effectiveFrom: "desc" } });

  await prisma.taxConfig.create({
    data: { key: parsed.data.key, value: parsed.data.value, effectiveFrom: new Date(), note: "Confirm with your accountant" },
  });
  await prisma.auditLog.create({
    data: {
      adminUserId: user.id,
      entity: "TaxConfig",
      key: parsed.data.key,
      oldValue: previous ? String(previous.value) : null,
      newValue: String(parsed.data.value),
    },
  });
  return NextResponse.json({ ok: true });
}

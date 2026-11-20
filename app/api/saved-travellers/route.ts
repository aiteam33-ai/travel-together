import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ travellers: [] });
  const travellers = await prisma.savedTraveller.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
  return NextResponse.json({ travellers });
}

const schema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0).max(120),
  gender: z.string().default("UNSPECIFIED"),
  mealChoice: z.enum(["VEG", "JAIN", "NON_VEG"]),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid traveller" }, { status: 400 });
  const saved = await prisma.savedTraveller.create({ data: { userId: user.id, ...parsed.data } });
  return NextResponse.json({ ok: true, id: saved.id });
}

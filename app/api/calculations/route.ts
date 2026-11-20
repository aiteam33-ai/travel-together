import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json();
  if (!body.tourId || !body.departureId) return NextResponse.json({ error: "Missing tour or departure" }, { status: 400 });
  const saved = await prisma.savedCalculation.create({
    data: {
      userId: user.id,
      tourId: body.tourId,
      inputJson: JSON.stringify(body.input ?? {}),
      outputJson: JSON.stringify(body.output ?? {}),
    },
  });
  return NextResponse.json({ ok: true, id: saved.id, shareToken: saved.shareToken });
}

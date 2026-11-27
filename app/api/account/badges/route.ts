import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserBadges } from "@/lib/gamification/get-user-badges";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const result = await getUserBadges(user.id);
  return NextResponse.json(result);
}

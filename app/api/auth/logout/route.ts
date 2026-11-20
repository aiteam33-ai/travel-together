import { NextResponse } from "next/server";
import { destroySession, destroyAllSessionsForUser, getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  const all = new URL(req.url).searchParams.get("all");
  if (all === "true") {
    const user = await getCurrentUser();
    if (user) await destroyAllSessionsForUser(user.id);
  } else {
    await destroySession();
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { createSession } from "@/lib/auth/session";

// "Continue with Google (mock)" — this project has no real Google OAuth app
// registered, so this stands in for it: it signs the visitor into a single
// fixed demo account rather than leaving the button dead. Swap for real
// Google OAuth later without changing the call site in LoginModal.
const MOCK_GOOGLE_EMAIL = "google-demo@parikramaholidays.example";

export async function POST() {
  let user = await prisma.user.findUnique({ where: { email: MOCK_GOOGLE_EMAIL } });
  const isNewUser = !user;
  if (!user) {
    user = await prisma.user.create({ data: { email: MOCK_GOOGLE_EMAIL, name: "Demo Google User" } });
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true, isNewUser, user: { id: user.id, name: user.name } });
}

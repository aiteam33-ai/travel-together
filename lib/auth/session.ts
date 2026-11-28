import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../db/client";
import { randomBytes } from "crypto";

const SESSION_COOKIE = "parikrama_session";
const SESSION_DAYS = 30;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, token, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  return token;
}

// Called from ~90 places across the app, often more than once per request
// (a group's layout and its page both call it, for example) — cache() dedupes
// those into a single DB round trip per request instead of one each.
export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
});

// A parent layout's own redirect-if-no-user check does NOT re-run on a
// client-side navigation between sibling pages under it (Next.js keeps the
// layout mounted) — so a session that expires or is logged out elsewhere
// while someone is already browsing, e.g., /account/*, can reach a subpage
// with no guard having run at all. Every page that needs a logged-in user
// should call this instead of asserting getCurrentUser()! non-null.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessionsForUser(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export { SESSION_COOKIE };

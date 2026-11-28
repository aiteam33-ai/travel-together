import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// /welcome is always directly reachable (bookmarked, shared, or just typed
// in) regardless of the cookie — only the homepage redirect below is gated
// on "first visit", so visiting /welcome itself never bounces away.
export function middleware(request: NextRequest) {
  const seenWelcome = request.cookies.get("welcome_seen")?.value === "1";

  // A first-time visitor landing on the homepage is sent to /welcome first
  // instead — the cookie is what makes this a one-time thing.
  if (request.nextUrl.pathname === "/" && !seenWelcome) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

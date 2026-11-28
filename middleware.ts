import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Forwards the current pathname as a request header so Server Components
// (which have no direct equivalent of next/navigation's usePathname) can
// read it — used by the root layout to decide whether to render the
// normal site chrome (Header/Footer/nav) or a chromeless full-screen route.
export function middleware(request: NextRequest) {
  const seenWelcome = request.cookies.get("welcome_seen")?.value === "1";

  // /welcome is always directly reachable (bookmarked, shared, or just typed
  // in) regardless of the cookie — only the homepage redirect below is
  // gated on "first visit", so visiting /welcome itself never bounces away.

  // A first-time visitor landing on the homepage is sent to /welcome first
  // instead — the cookie is what makes this a one-time thing.
  if (request.nextUrl.pathname === "/" && !seenWelcome) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

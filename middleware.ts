import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Forwards the current pathname as a request header so Server Components
// (which have no direct equivalent of next/navigation's usePathname) can
// read it — used by the root layout to decide whether to render the
// normal site chrome (Header/Footer/nav) or a chromeless full-screen route.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

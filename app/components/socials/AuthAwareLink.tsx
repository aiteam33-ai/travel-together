"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthContext";

/**
 * A Link into a specific /socials section (e.g. "/socials#plan"). The target
 * page gates on login server-side, but a server redirect can never see a URL
 * hash — fragments aren't sent in the request at all — so a logged-out visitor
 * would always land back on the generic /socials top (or the homepage) after
 * signing in, no matter which card they clicked. This intercepts the click
 * while logged out and builds the login redirect client-side instead, so the
 * hash survives and they land on the exact section they asked for.
 */
export default function AuthAwareLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  function onClick(e: React.MouseEvent) {
    if (loading || user) return;
    e.preventDefault();
    router.push(`/?login=1&next=${encodeURIComponent(href)}`);
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

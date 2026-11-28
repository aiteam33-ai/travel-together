"use client";

import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * A button/link whose label rolls up and is replaced by a duplicate copy of
 * itself on hover — the classic Framer text-roll. Reusable for any primary
 * CTA; pass `href` for a link, omit it for a plain button.
 */
export default function RollButton({
  href,
  onClick,
  type = "button",
  className = "",
  children,
}: {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();

  const content = reduced ? (
    children
  ) : (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-300 ease-out group-hover/roll:-translate-y-full">{children}</span>
      <span aria-hidden="true" className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-out group-hover/roll:translate-y-0">
        {children}
      </span>
    </span>
  );

  const sharedClassName = `group/roll ${className}`;

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={sharedClassName}>
      {content}
    </button>
  );
}

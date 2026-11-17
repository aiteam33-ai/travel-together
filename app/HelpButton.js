"use client";

import { useEffect, useRef, useState } from "react";

// Change the phone number and search text here.
const PHONE_FOR_LINKS = "919876543210";
const PHONE_DISPLAY = "98765 43210";
const MAP_SEARCH = "Masala Lane restaurant";

const ACTIONS = [
  {
    label: "Call",
    href: `tel:${PHONE_DISPLAY.replace(/\s/g, "")}`,
    external: false,
    icon: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${PHONE_FOR_LINKS}`,
    external: true,
    icon: (
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.2-3.2-2.8-.2-.4.2-.3.6-1.1.1-.2 0-.3 0-.5C10.9 10 10.4 8.7 10.2 8.1c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.5-.3zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2z" />
    ),
  },
  {
    label: "Directions",
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_SEARCH)}`,
    external: true,
    icon: (
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    ),
  },
];

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col items-end gap-3">
          {ACTIONS.map((action) => (
            <a
              key={action.label}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
            >
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-semibold text-foreground shadow-md">
                {action.label}
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-md">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  {action.icon}
                </svg>
              </span>
            </a>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close help menu" : "Open help menu"}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white shadow-lg"
      >
        {open ? "×" : "?"}
      </button>
    </div>
  );
}

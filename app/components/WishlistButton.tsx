"use client";

import { useState } from "react";
import { useAuth } from "./auth/AuthContext";

export default function WishlistButton({ tourId }: { tourId: string }) {
  const { user } = useAuth();
  const [added, setAdded] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function toggle() {
    if (!user) {
      setMsg("Please log in to save this to your wishlist.");
      return;
    }
    const res = await fetch("/api/wishlist", {
      method: added ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId }),
    });
    if (res.ok) setAdded(!added);
  }

  return (
    <span>
      <button type="button" onClick={toggle} className="rounded-full border border-border px-3 py-1 text-sm">
        {added ? "♥ In wishlist" : "♡ Add to wishlist"}
      </button>
      {msg && <span className="ml-2 text-xs text-foreground-muted">{msg}</span>}
    </span>
  );
}

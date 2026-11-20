"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthContext";
import { useWishlist } from "./WishlistContext";
import { useToast } from "./ToastContext";
import LoginModal from "./auth/LoginModal";

export default function WishlistButton({ tourId, initiallyAdded = false }: { tourId: string; initiallyAdded?: boolean }) {
  const { user } = useAuth();
  const { refresh } = useWishlist();
  const { showToast } = useToast();
  const [added, setAdded] = useState(initiallyAdded);
  const [popping, setPopping] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  async function save() {
    const res = await fetch("/api/wishlist", {
      method: added ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId }),
    });
    if (res.ok) {
      setAdded((v) => !v);
      setPopping(true);
      refresh();
      showToast(added ? "Removed from wishlist" : "Added to wishlist");
    }
  }

  function toggle() {
    if (!user) {
      setPendingSave(true);
      setShowLogin(true);
      return;
    }
    save();
  }

  useEffect(() => {
    if (user && pendingSave) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- completes a save the user started while logged out
      setPendingSave(false);
      save();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingSave]);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        onAnimationEnd={() => setPopping(false)}
        className={`flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-sm press-feedback ${popping ? "heart-pop" : ""}`}
        aria-pressed={added}
      >
        <span aria-hidden="true">{added ? "♥" : "♡"}</span>
        {added ? "In wishlist" : "Add to wishlist"}
      </button>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}

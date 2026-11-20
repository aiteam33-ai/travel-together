"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth/AuthContext";

interface WishlistContextValue {
  count: number;
  refresh: () => void;
}

const WishlistContext = createContext<WishlistContextValue>({ count: 0, refresh: () => {} });

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) {
      setCount(0);
      return;
    }
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setCount(data.items?.length ?? 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch of wishlist count on mount/auth change
    refresh();
  }, [refresh]);

  return <WishlistContext.Provider value={{ count, refresh }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}

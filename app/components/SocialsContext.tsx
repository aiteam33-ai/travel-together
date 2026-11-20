"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth/AuthContext";

interface SocialsContextValue {
  unreadCount: number;
  refresh: () => void;
  markSeen: () => void;
}

const SocialsContext = createContext<SocialsContextValue>({ unreadCount: 0, refresh: () => {}, markSeen: () => {} });

export function SocialsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    fetch("/api/socials/unread")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.count ?? 0))
      .catch(() => {});
  }, [user]);

  const markSeen = useCallback(() => {
    fetch("/api/socials/unread", { method: "POST" }).then(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial unread-count fetch on mount/auth change
    refresh();
    const interval = setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return <SocialsContext.Provider value={{ unreadCount, refresh, markSeen }}>{children}</SocialsContext.Provider>;
}

export function useSocials() {
  return useContext(SocialsContext);
}

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface AuthUser {
  id: string;
  name: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: (all?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function logout(all = false) {
    await fetch(`/api/auth/logout?all=${all}`, { method: "POST" });
    setUser(null);
  }

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

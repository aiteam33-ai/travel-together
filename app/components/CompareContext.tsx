"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "compareTourIds";
const MAX_COMPARE = 3;

interface CompareContextValue {
  ids: string[];
  toggle: (id: string) => void;
  isSelected: (id: string) => boolean;
  clear: () => void;
  atLimit: boolean;
}

const CompareContext = createContext<CompareContextValue>({
  ids: [],
  toggle: () => {},
  isSelected: () => false,
  clear: () => {},
  atLimit: false,
});

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of persisted selection on mount
      if (saved) setIds(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  function toggle(id: string) {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_COMPARE ? [...prev, id] : prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function clear() {
    persist([]);
  }

  return (
    <CompareContext.Provider value={{ ids, toggle, isSelected: (id) => ids.includes(id), clear, atLimit: ids.length >= MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}

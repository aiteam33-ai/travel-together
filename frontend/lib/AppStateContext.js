"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { clearState, DEFAULT_STATE, loadState, saveState } from "./storage";
import { t } from "./mock/translations";

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage (an external system) on mount, so
    // server and first client render match before hydrating real data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  function update(patch) {
    setState((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
  }

  function resetAll() {
    clearState();
    setState({ ...DEFAULT_STATE });
  }

  return (
    <AppStateContext.Provider value={{ state, update, resetAll, hydrated }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useT() {
  const { state } = useAppState();
  const lang = state.language || "english";
  return (key, vars) => t(key, lang, vars);
}

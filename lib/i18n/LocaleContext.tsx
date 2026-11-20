"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Locale, t as translate } from "./dictionary";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (saved === "en" || saved === "hi") setLocaleState(saved);
    } catch {}
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
    } catch {}
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: (key) => translate(key, locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

interface ToastState {
  id: number;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);
  const reduced = usePrefersReducedMotion();

  const showToast = useCallback((message: string) => {
    counter.current += 1;
    setToast({ id: counter.current, message });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" role="status" className="fixed bottom-[88px] left-1/2 z-40 -translate-x-1/2 md:bottom-6">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onAnimationComplete={() => {
                setTimeout(() => setToast((t) => (t?.id === toast.id ? null : t)), 2200);
              }}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-[var(--shadow-raised)]"
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

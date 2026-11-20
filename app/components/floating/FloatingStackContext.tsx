"use client";

import { createContext, useContext, useState } from "react";

/**
 * Fixed stacking order for floating elements (Stage 3), bottom to top:
 * BottomTabBar (mobile only, 56px) -> CompareTray (when open) -> HelpButton
 * / BackToTop. Each later element adds the earlier ones' height + a 16px
 * gap to its own `bottom` offset, so nothing ever overlaps, at any width,
 * including the bottom of a long page.
 */
interface FloatingStackValue {
  compareTrayOpen: boolean;
  setCompareTrayOpen: (open: boolean) => void;
}

const FloatingStackContext = createContext<FloatingStackValue>({ compareTrayOpen: false, setCompareTrayOpen: () => {} });

export function FloatingStackProvider({ children }: { children: React.ReactNode }) {
  const [compareTrayOpen, setCompareTrayOpen] = useState(false);
  return <FloatingStackContext.Provider value={{ compareTrayOpen, setCompareTrayOpen }}>{children}</FloatingStackContext.Provider>;
}

export function useFloatingStack() {
  return useContext(FloatingStackContext);
}

export const TAB_BAR_HEIGHT = 56;
export const COMPARE_TRAY_HEIGHT = 72;
export const FLOATING_GAP = 16;

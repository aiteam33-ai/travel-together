"use client";

import { useEffect } from "react";
import { useSocials } from "../SocialsContext";

export default function MarkSocialsSeen() {
  const { markSeen } = useSocials();
  useEffect(() => {
    markSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

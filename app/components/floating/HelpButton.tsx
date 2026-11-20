"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, PhoneCall, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { useToast } from "../ToastContext";
import { useFloatingStack, COMPARE_TRAY_HEIGHT, FLOATING_GAP } from "./FloatingStackContext";

/**
 * The single floating help button (Stage 3.1) — replaces the old separate
 * WhatsApp/callback widgets. Fixed stacking order: z-40, sits above the
 * mobile tab bar (z-40 too but tab bar is pinned to the very bottom edge;
 * this button sits 16px above it) and never overlaps CompareTray (which
 * takes the bottom-centre slot) or BackToTop (bottom-left).
 */
export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const reduced = usePrefersReducedMotion();
  const { showToast } = useToast();
  const { compareTrayOpen } = useFloatingStack();
  const containerRef = useRef<HTMLDivElement>(null);
  const extraOffset = compareTrayOpen ? COMPARE_TRAY_HEIGHT + FLOATING_GAP : 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  async function submitCallback(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, source: "CALLBACK_REQUEST" }),
    });
    setSent(true);
    showToast("Callback requested");
  }

  async function onWhatsAppClick() {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "WhatsApp click", phone: "unknown", source: "WHATSAPP_BUTTON" }),
    });
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[88px] right-4 z-40 flex flex-col items-end gap-3 transition-transform duration-200 md:bottom-6 md:right-6"
      style={{ transform: `translateY(-${extraOffset}px)` }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-72 rounded-lg border border-border bg-surface-raised p-3 shadow-[var(--shadow-raised)]"
          >
            {showCallbackForm ? (
              sent ? (
                <p className="p-2 text-sm">Thanks! Our team will call you back shortly.</p>
              ) : (
                <form onSubmit={submitCallback} className="space-y-2 p-1">
                  <h2 className="font-semibold">Request a callback</h2>
                  <label className="block text-sm">
                    Name
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
                  </label>
                  <label className="block text-sm">
                    Mobile number
                    <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
                  </label>
                  <button type="submit" className="min-h-11 w-full rounded-md bg-accent text-sm font-semibold text-white press-feedback">
                    Request callback
                  </button>
                </form>
              )
            ) : (
              <div className="flex flex-col gap-1">
                <a
                  href={`https://wa.me/${BRAND.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onWhatsAppClick}
                  className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-accent-soft"
                >
                  <MessageCircle size={18} className="text-success" /> WhatsApp us
                </a>
                <a href={`tel:${BRAND.supportPhone.replace(/\s/g, "")}`} className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-accent-soft">
                  <Phone size={18} className="text-accent" /> Call {BRAND.supportPhone}
                </a>
                <button
                  type="button"
                  onClick={() => setShowCallbackForm(true)}
                  className="flex min-h-11 items-center gap-2 rounded-md px-2 text-left text-sm font-medium hover:bg-accent-soft"
                >
                  <PhoneCall size={18} className="text-accent" /> Request a callback
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (open) {
            setShowCallbackForm(false);
            setSent(false);
          }
        }}
        aria-expanded={open}
        aria-label={open ? "Close help menu" : "Open help menu"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-raised)] press-feedback"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthContext";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

type Step = "identifier" | "otp" | "name";

const RESEND_SECONDS = 30;

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("identifier");
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function normalizedIdentifier() {
    if (mode === "phone") {
      const digits = identifier.replace(/\D/g, "");
      return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
    }
    return identifier.trim();
  }

  async function sendOtp() {
    setError(null);
    const idf = normalizedIdentifier();
    if (mode === "phone" && !/^\+91[6-9]\d{9}$/.test(idf)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (mode === "email" && !/^\S+@\S+\.\S+$/.test(idf)) {
      setError("Enter a valid email address.");
      return;
    }
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: idf, channel: mode === "phone" ? "SMS" : "EMAIL" }),
    });
    if (!res.ok) {
      setError("Could not send OTP. Please try again.");
      return;
    }
    setIdentifier(idf);
    setStep("otp");
    setResendIn(RESEND_SECONDS);
  }

  async function verify() {
    setError(null);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, code, isEmail: mode === "email" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not verify code.");
      return;
    }
    if (data.isNewUser) {
      setIsNewUser(true);
      setStep("name");
    } else {
      await refresh();
      onClose();
    }
  }

  async function saveName() {
    const res = await fetch("/api/auth/update-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      await refresh();
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        initial={reduced ? false : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="login-title" className="font-heading text-lg font-bold">
            {step === "identifier" && "Log in or sign up"}
            {step === "otp" && "Enter the OTP"}
            {step === "name" && "Welcome! What's your name?"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-2xl leading-none">
            ×
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {step === "identifier" && (
          <div className="space-y-3">
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setMode("phone")}
                className={`rounded-md px-3 py-1 ${mode === "phone" ? "bg-accent text-white" : "border border-border"}`}
              >
                Mobile + OTP
              </button>
              <button
                type="button"
                onClick={() => setMode("email")}
                className={`rounded-md px-3 py-1 ${mode === "email" ? "bg-accent text-white" : "border border-border"}`}
              >
                Email + OTP
              </button>
            </div>
            <label className="block text-sm font-medium">
              {mode === "phone" ? "Mobile number" : "Email address"}
              <input
                type={mode === "phone" ? "tel" : "email"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={mode === "phone" ? "98765 43210" : "you@example.com"}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <button type="button" onClick={sendOtp} className="w-full rounded-md bg-accent py-2 font-semibold text-white hover:bg-accent-strong">
              Send OTP
            </button>
            <button type="button" className="w-full rounded-md border border-border py-2 text-sm" disabled>
              Continue with Google (mock)
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-3">
            <p className="text-sm text-foreground-muted">
              We sent a 6-digit code to <strong>{identifier}</strong>. Check the server console for the demo OTP.
            </p>
            <label className="block text-sm font-medium">
              Enter OTP
              <input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 tracking-[0.5em]"
              />
            </label>
            <button type="button" onClick={verify} className="w-full rounded-md bg-accent py-2 font-semibold text-white hover:bg-accent-strong">
              Verify & continue
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setStep("identifier")} className="underline">
                Change number
              </button>
              <button
                type="button"
                disabled={resendIn > 0}
                onClick={sendOtp}
                className="underline disabled:text-foreground-muted disabled:no-underline"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        {step === "name" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <button type="button" onClick={saveName} className="w-full rounded-md bg-accent py-2 font-semibold text-white hover:bg-accent-strong">
              Continue
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

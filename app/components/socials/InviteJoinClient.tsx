"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthContext";
import LoginModal from "../auth/LoginModal";

export default function InviteJoinClient({ token, groupName }: { token: string; groupName: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [consented, setConsented] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- opens login as soon as we know the visitor is signed out
    if (!loading && !user) setShowLogin(true);
  }, [loading, user]);

  async function join() {
    setJoining(true);
    setError(null);
    const res = await fetch(`/api/groups/join/${token}`, { method: "POST" });
    const data = await res.json();
    setJoining(false);
    if (!res.ok) {
      setError(data.error ?? "Could not join this group.");
      return;
    }
    router.push(`/socials/${data.groupId}`);
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold">You&apos;re invited to &ldquo;{groupName}&rdquo;</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        Joining lets other members see your display name. Your mobile number stays masked, and personal
        booking details (age, passport, PAN) are never shown to the group.
      </p>
      {user && (
        <label className="mt-4 flex items-start gap-2 text-left text-sm">
          <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} className="mt-1" />
          I understand what other members of this group will see.
        </label>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
      {user && (
        <button
          type="button"
          onClick={join}
          disabled={!consented || joining}
          className="mt-4 min-h-11 w-full rounded-md bg-accent px-4 font-semibold text-white press-feedback disabled:opacity-60"
        >
          {joining ? "Joining…" : "Join this group"}
        </button>
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}

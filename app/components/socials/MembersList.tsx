"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
  phone: string | null;
  role: string;
  status: string;
}

function maskPhone(phone: string | null) {
  if (!phone) return "—";
  return phone.replace(/(\+91)(\d{4})(\d+)(\d{2})/, (_m, cc, a, _mid, d) => `${cc}${a}••••${d}`);
}

export default function MembersList({
  groupId,
  members,
  isOrganiser,
  currentMemberId,
}: {
  groupId: string;
  members: Member[];
  isOrganiser: boolean;
  currentMemberId: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function removeMember(memberId: string) {
    setBusyId(memberId);
    await fetch(`/api/groups/${groupId}/members/${memberId}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  async function makeOrganiser(memberId: string) {
    setBusyId(memberId);
    await fetch(`/api/groups/${groupId}/members/${memberId}/make-organiser`, { method: "POST" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-md border border-border bg-surface p-3 text-sm">
          <div>
            <p className="font-semibold">
              {m.name} {m.role === "ORGANISER" && <span className="ml-1 text-xs text-foreground-muted">Organiser</span>}
            </p>
            <p className="text-xs text-foreground-muted">
              {maskPhone(m.phone)} · {m.status === "INVITED" ? "Invited" : m.status === "LEFT" ? "Left" : "Joined"}
            </p>
          </div>
          {isOrganiser && m.id !== currentMemberId && m.status !== "LEFT" && (
            <div className="flex gap-2">
              {m.status === "JOINED" && m.role !== "ORGANISER" && (
                <button type="button" disabled={busyId === m.id} onClick={() => makeOrganiser(m.id)} className="min-h-11 rounded-md border border-border px-2 text-xs font-semibold">
                  Make organiser
                </button>
              )}
              <button type="button" disabled={busyId === m.id} onClick={() => removeMember(m.id)} className="min-h-11 rounded-md border border-danger px-2 text-xs font-semibold text-danger">
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

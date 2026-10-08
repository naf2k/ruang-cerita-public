"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startSession } from "@/lib/actions/counseling";

export function StartChatButton({
  counselorUserId,
  label,
  className = "btn btn-primary full",
  pendingLabel = "Membuka sesi…",
}: {
  counselorUserId?: string;
  label: string;
  className?: string;
  pendingLabel?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function open() {
    if (!counselorUserId) {
      router.push("/counseling/new");
      return;
    }
    setBusy(true);
    setErr("");
    let requestId: string | undefined;
    try {
      requestId = localStorage.getItem("rc-request-id") ?? undefined;
    } catch {}
    const res = await startSession({ requestId, counselorUserId });
    if (res.ok) {
      try {
        localStorage.removeItem("rc-request-id");
      } catch {}
      router.push(`/counseling/${res.sessionId}`);
    } else {
      setErr(res.message);
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={open} disabled={busy}>
        <span>{busy ? pendingLabel : label}</span>
      </button>
      {err ? (
        <p className="tiny mt10" role="alert">
          {err}
        </p>
      ) : null}
    </>
  );
}

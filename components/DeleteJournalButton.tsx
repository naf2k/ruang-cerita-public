"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJournal } from "@/lib/actions/journal";

export function DeleteJournalButton({ id }: { id: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  function remove() {
    if (!confirm("Hapus cerita ini secara permanen?")) return;
    start(async () => {
      const res = await deleteJournal(id);
      if (res.ok) router.push("/journal");
      else setMsg(res.message);
    });
  }

  return (
    <>
      <button type="button" className="btn btn-ghost" onClick={remove} disabled={pending}>
        <span>{pending ? "Menghapus…" : "Hapus Cerita Ini"}</span>
      </button>
      {msg ? (
        <p className="tiny" role="alert">
          {msg}
        </p>
      ) : null}
    </>
  );
}

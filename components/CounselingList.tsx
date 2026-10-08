"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelSession } from "@/lib/actions/counseling";

export interface CounselingItem {
  id: string;
  name: string;
  badge: string;
  badgeCls: string;
  meta: string;
  status: "aktif" | "menunggu" | "selesai";
  rawStatus: string;
  cta: string;
  primary: boolean;
  avatarCls: string;
  initial: string;
  unread: number;
}

export function CounselingList({ items }: { items: CounselingItem[] }) {
  const router = useRouter();
  const [f, setF] = useState("all");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const shown = items.filter((s) => f === "all" || s.status === f);

  function cancel(id: string) {
    if (!confirm("Batalkan sesi ini? Kamu bisa mulai cerita baru kapan aja.")) return;
    start(async () => {
      const res = await cancelSession(id);
      if (res.ok) router.refresh();
      else setMsg(res.message);
    });
  }

  return (
    <>
      <div className="toolbar" role="group" aria-label="Saring sesi">
        {[
          { v: "all", label: "Semua" },
          { v: "aktif", label: "Aktif" },
          { v: "menunggu", label: "Menunggu" },
          { v: "selesai", label: "Selesai" },
        ].map((c) => (
          <button key={c.v} type="button" className={`chip${f === c.v ? " picked" : ""}`} aria-pressed={f === c.v} onClick={() => setF(c.v)}>
            {c.label}
          </button>
        ))}
      </div>
      <p className="tiny muted" aria-live="polite">
        Menampilkan {shown.length} dari {items.length} sesi. {msg}
      </p>
      <div className="session-cards">
        {shown.map((s) => (
          <article key={s.id} className="session-card">
            <span className={s.avatarCls} aria-hidden="true">
              {s.initial}
            </span>
            <div className="grow">
              <h3>
                {s.name} <span className={`badge ${s.badgeCls}`}>{s.badge}</span>
                {s.unread > 0 ? (
                  <span className="badge green" aria-label={`${s.unread} pesan belum dibaca`}>
                    {s.unread} baru
                  </span>
                ) : null}
              </h3>
              <p className="meta">{s.meta}</p>
            </div>
            <Link href={`/counseling/${s.id}`} className={`btn ${s.primary ? "btn-primary" : "btn-secondary"}`}>
              <span>{s.cta}</span>
            </Link>
            {s.rawStatus === "pending" || s.rawStatus === "waiting" ? (
              <button type="button" className="btn btn-ghost btn-sm" disabled={pending} onClick={() => cancel(s.id)}>
                Batalkan
              </button>
            ) : null}
          </article>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="empty">
          <h2>Belum ada sesi counseling. 🫂</h2>
          <p className="muted">Kalau kamu ingin cerita, kami ada di sini.</p>
          <p>
            <Link className="btn btn-primary" href="/counseling/new">
              <span>Mulai Cerita</span>
              <span className="btn-icon" aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      ) : null}
    </>
  );
}

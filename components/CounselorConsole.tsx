"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  setAvailability,
  upsertSessionNote,
  getSessionNote,
  type CounselorSessionRow,
} from "@/lib/actions/counselors";
import { completeSession, getSessionDetail } from "@/lib/actions/counseling";

type Avail = "available" | "busy" | "offline";
const AVAIL_LABEL: Record<Avail, string> = { available: "🟢 Tersedia", busy: "🟡 Sibuk", offline: "⚪ Offline" };

interface IntakeView {
  topics: string[];
  story: string;
  support: string;
  mood: string | null;
}

export function CounselorConsole({
  displayName,
  initialAvail,
  stats,
  sessions,
}: {
  displayName: string;
  initialAvail: Avail;
  stats: { active: number; waiting: number; upcoming: number };
  sessions: CounselorSessionRow[];
}) {
  const router = useRouter();
  const [avail, setAvail] = useState<Avail>(initialAvail);
  const [availMsg, setAvailMsg] = useState(`Status saat ini: ${AVAIL_LABEL[initialAvail]}`);
  const [selected, setSelected] = useState<string | null>(sessions.find((s) => s.status === "active")?.id ?? sessions[0]?.id ?? null);
  const [intake, setIntake] = useState<IntakeView | null>(null);
  const [note, setNote] = useState("");
  const [live, setLive] = useState("");
  const [pending, start] = useTransition();

  const current = sessions.find((s) => s.id === selected) ?? null;

  async function pick(id: string) {
    setSelected(id);
    setIntake(null);
    setNote("");
    setLive("");
    start(async () => {
      const d = await getSessionDetail(id);
      if (d?.request) {
        setIntake({
          topics: d.request.topic ?? [],
          story: d.request.description ?? "",
          support: d.request.support_type ?? "",
          mood: d.request.mood,
        });
      }
      setNote((await getSessionNote(id).catch(() => ({ notes: "", actionPoints: [] as string[] }))).notes);
    });
  }

  function changeAvail(v: Avail) {
    start(async () => {
      const res = await setAvailability(v);
      if (res.ok) {
        setAvail(v);
        setAvailMsg(`Status saat ini: ${AVAIL_LABEL[v]}`);
      } else {
        setAvailMsg(res.message);
      }
    });
  }

  function saveNote() {
    if (!selected) return;
    start(async () => {
      const res = await upsertSessionNote({ sessionId: selected, notes: note });
      setLive(res.ok ? "Catatan privat tersimpan 🔒 Hanya kamu yang bisa baca." : res.message);
    });
  }

  function finish() {
    if (!selected) return;
    start(async () => {
      const res = await completeSession(selected);
      setLive(res.ok ? "Sesi selesai 🫶 Terima kasih sudah menemani." : res.message);
      if (res.ok) router.refresh();
    });
  }

  return (
    <>
      <section className="panel" aria-labelledby="status-title">
        <h2 id="status-title" className="sec-title">Status ketersediaan</h2>
        <p className="muted">Ubah statusmu supaya klien tahu kapan kamu bisa menemani.</p>
        <div className="toolbar" role="group" aria-label="Ubah status ketersediaan">
          {(Object.keys(AVAIL_LABEL) as Avail[]).map((v) => (
            <button key={v} type="button" className="btn btn-secondary btn-sm" aria-pressed={avail === v} onClick={() => changeAvail(v)} disabled={pending}>
              {AVAIL_LABEL[v]}
            </button>
          ))}
        </div>
        <p className="tiny muted" role="status">{availMsg}</p>
      </section>

      <section aria-labelledby="today-title">
        <h2 id="today-title" className="sec-title">Hari Ini 📅</h2>
        <div className="dash-grid">
          <div className="stat"><strong>{stats.active}</strong><span>🟢 Sesi Aktif</span></div>
          <div className="stat"><strong>{stats.waiting}</strong><span>⏳ Menunggu</span></div>
          <div className="stat"><strong>{stats.upcoming}</strong><span>📅 Mendatang</span></div>
        </div>
      </section>

      <section className="panel" aria-labelledby="sesi-title">
        <h2 id="sesi-title" className="sec-title">Sesi — {displayName}</h2>
        {sessions.length === 0 ? (
          <p className="muted">Belum ada sesi yang ditugaskan padamu. 🌱</p>
        ) : (
          <div className="toolbar" role="group" aria-label="Pilih sesi">
            {sessions.map((s) => (
              <button key={s.id} type="button" className={`chip${selected === s.id ? " picked" : ""}`} aria-pressed={selected === s.id} onClick={() => pick(s.id)}>
                {s.clientLabel} • {s.topic}
              </button>
            ))}
          </div>
        )}
        {current ? (
          <>
            <h3>Ringkasan intake 📋</h3>
            {intake ? (
              <>
                <p><strong>{current.clientLabel}</strong> — Topik: {intake.topics.join(", ") || "-"} · Butuh: {intake.support} · Mood awal: {intake.mood || "-"}</p>
                <p className="muted">“{intake.story || "Belum ada cerita tertulis."}”</p>
              </>
            ) : (
              <p className="muted">Memuat ringkasan…</p>
            )}
            {current.lastMessage ? <p className="tiny muted">Terakhir: “{current.lastMessage.slice(0, 100)}”</p> : null}
            <p><Link className="btn btn-primary btn-sm" href={`/counseling/${current.id}`}>Buka Chat →</Link></p>

            <h3>Catatan privat 🔒</h3>
            <p className="tiny muted">Hanya kamu yang bisa baca — tidak terlihat klien.</p>
            <textarea rows={3} placeholder="Tulis observasi atau rencana tindak lanjut…" value={note} onChange={(e) => setNote(e.target.value)} />
            <p><button className="btn btn-secondary" type="button" onClick={saveNote} disabled={pending}>💾 Simpan Catatan</button></p>

            <p><button className="btn btn-primary" type="button" onClick={finish} disabled={pending}>🫶 Selesaikan Sesi</button></p>
            <p className="tiny muted" role="status">{live}</p>
          </>
        ) : null}
      </section>
    </>
  );
}

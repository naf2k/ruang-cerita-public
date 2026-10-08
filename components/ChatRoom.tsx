"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessage,
  completeSession,
  saveReflection,
  acceptSession,
} from "@/lib/actions/counseling";
import { upsertSessionNote } from "@/lib/actions/counselors";
import { uploadChatAttachment } from "@/lib/actions/profile";
import { createReport } from "@/lib/actions/reports";
import { REPORT_REASONS as REASONS } from "@/lib/constants";

export interface ChatMsg {
  id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  created_at: string;
}

export interface ChatSidebarItem {
  id: string;
  name: string;
  sub: string;
  unread?: number;
}

export interface ChatInitial {
  sessionId: string;
  meId: string;
  isClient: boolean;
  peerName: string;
  peerAvatar: string;
  peerStatus: string;
  topic: string;
  status: string;
  statusMeta: string;
  messages: ChatMsg[];
  reflection: { mood_after: string | null; reflection: string | null } | null;
  sessions: ChatSidebarItem[];
  intake?: { topics: string[]; story: string; support: string; mood: string | null } | null;
  counselorNote?: { notes: string; actionPoints: string[] };
}

const REFLECT = [
  { emoji: "😌", label: "Lebih lega" },
  { emoji: "🙂", label: "Lumayan" },
  { emoji: "😐", label: "Biasa saja" },
  { emoji: "😔", label: "Masih berat" },
];

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ChatRoom({ initial }: { initial: ChatInitial }) {
  const router = useRouter();
  const [msgs, setMsgs] = useState<ChatMsg[]>(initial.messages);
  const [field, setField] = useState("");
  const [sendErr, setSendErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [reflectMood, setReflectMood] = useState(-1);
  const [reflectNote, setReflectNote] = useState(initial.reflection?.reflection ?? "");
  const [reflectMsg, setReflectMsg] = useState(
    initial.reflection ? "Refleksimu sudah tersimpan 🫶" : ""
  );
  const [note, setNote] = useState(initial.counselorNote?.notes ?? "");
  const [points, setPoints] = useState<string[]>(initial.counselorNote?.actionPoints ?? []);
  const [pointDraft, setPointDraft] = useState("");
  const [noteMsg, setNoteMsg] = useState("");
  const [doneMsg, setDoneMsg] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);
  const [repReason, setRepReason] = useState<string>(REASONS[0]);
  const [repDesc, setRepDesc] = useState("");
  const [repMsg, setRepMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs.length]);

  // Realtime: pesan baru di sesi ini (pola Context7: server fetch + client subscribe)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`session:${initial.sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `session_id=eq.${initial.sessionId}` },
        (payload) => {
          const m = payload.new as ChatMsg;
          setMsgs((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev;
            // ganti bubble optimistik dengan pesan asli
            const idx = prev.findIndex((x) => x.id.startsWith("tmp-") && x.sender_id === m.sender_id && x.message === m.message);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = m;
              return next;
            }
            return [...prev, m];
          });
          if (m.sender_id !== initial.meId && document.hidden) {
            try {
              const pref = JSON.parse(localStorage.getItem("rc-settings") || "{}");
              if (pref.browser && Notification.permission === "granted") {
                new Notification("Pesan baru 💬", { body: m.message.slice(0, 100) });
              }
            } catch {}
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [initial.sessionId, initial.meId]);

  // Typing indicator via broadcast (ephemeral, tanpa DB — PRD §8.4)
  useEffect(() => {
    const supabase = createClient();
    const chan = supabase.channel(`typing:${initial.sessionId}`, { config: { broadcast: { self: false } } });
    chan
      .on("broadcast", { event: "typing" }, (payload) => {
        if ((payload.payload as { user?: string })?.user === initial.meId) return;
        setPeerTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setPeerTyping(false), 3000);
      })
      .subscribe();
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      supabase.removeChannel(chan);
    };
  }, [initial.sessionId, initial.meId]);

  function notifyTyping() {
    const now = Date.now();
    if (now - lastTypingSent.current < 3000) return;
    lastTypingSent.current = now;
    const supabase = createClient();
    const chan = supabase.channel(`typing:${initial.sessionId}`, { config: { broadcast: { self: false } } });
    chan.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        chan.send({ type: "broadcast", event: "typing", payload: { user: initial.meId } });
        setTimeout(() => supabase.removeChannel(chan), 1500);
      }
    });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = field.trim();
    if (!text) return;
    setSendErr("");
    const tmp: ChatMsg = {
      id: `tmp-${Date.now()}`,
      sender_id: initial.meId,
      message: text,
      attachment_url: null,
      created_at: new Date().toISOString(),
    };
    setMsgs((prev) => [...prev, tmp]);
    setField("");
    const res = await sendMessage({ sessionId: initial.sessionId, text });
    if (!res.ok) {
      setMsgs((prev) => prev.filter((x) => x.id !== tmp.id));
      setSendErr(res.message);
    }
  }

  async function attach(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("sessionId", initial.sessionId);
    fd.append("file", file);
    const up = await uploadChatAttachment(fd);
    if (!up.ok || !up.url) {
      setSendErr(up.ok ? "Berkas belum terunggah." : up.message);
      setUploading(false);
      return;
    }
    const res = await sendMessage({ sessionId: initial.sessionId, text: "", attachmentUrl: up.url });
    if (!res.ok) setSendErr(res.message);
    setUploading(false);
  }

  async function sendReport(e: React.FormEvent) {
    e.preventDefault();
    const res = await createReport({ targetType: "session", targetId: initial.sessionId, reason: repReason, description: repDesc });
    if (res.ok) {
      setRepDesc("");
      setRepMsg("Laporan terkirim. Admin akan meninjau dengan empati. Terima kasih sudah memberi tahu. 🚩");
    } else {
      setRepMsg(res.message);
    }
  }
  async function finish() {
    const res = await completeSession(initial.sessionId);
    if (!res.ok) {
      setDoneMsg(res.message);
      return;
    }
    setDoneMsg("Sesi kamu sudah selesai. 🫶");
    router.refresh();
  }

  async function saveReflect() {
    if (reflectMood < 0) {
      setReflectMsg("Pilih perasaanmu dulu ya.");
      return;
    }
    const res = await saveReflection({
      sessionId: initial.sessionId,
      moodAfter: `${REFLECT[reflectMood].emoji} ${REFLECT[reflectMood].label}`,
      reflection: reflectNote,
    });
    setReflectMsg(res.ok ? "Sesi kamu sudah selesai 🫶 Terima kasih sudah berani cerita." : res.message);
  }

  async function saveNote() {
    const res = await upsertSessionNote({ sessionId: initial.sessionId, notes: note, actionPoints: points });
    setNoteMsg(res.ok ? "Catatan privat tersimpan 🔒 Hanya kamu yang bisa baca." : res.message);
  }

  async function accept() {
    const res = await acceptSession(initial.sessionId);
    if (!res.ok) {
      setNoteMsg(res.message);
      setDoneMsg(res.message);
      return;
    }
    setDoneMsg("Sesi diterima 🟢 Silakan sapa klienmu.");
    router.refresh();
  }

  return (
    <div className="chat-layout">
      <aside className="session-list" aria-label="Daftar sesi">
        <h2>Sesi kamu</h2>
        {initial.sessions.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`session-item${s.id === initial.sessionId ? " active" : ""}`}
            aria-pressed={s.id === initial.sessionId}
            onClick={() => s.id !== initial.sessionId && router.push(`/counseling/${s.id}`)}
          >
            <span className="avatar avatar-pink" aria-hidden="true">
              {(s.name.replace(/^[^\p{L}]+/u, "").charAt(0) || "K").toUpperCase()}
            </span>
            <span>
              <strong>{s.name}</strong>
              <br />
              <small className="muted">{s.sub}</small>
            </span>
            {s.unread ? (
              <span className="unread" aria-label={`${s.unread} pesan belum dibaca`}>
                {s.unread > 99 ? "99+" : s.unread}
              </span>
            ) : null}
          </button>
        ))}
      </aside>

      <div>
        <section className="chat-panel" aria-labelledby="chat-name">
          <div className="chat-headbar">
            <span className="avatar avatar-pink" aria-hidden="true">
              {initial.peerAvatar}
            </span>
            <div className="chat-flex">
              <strong id="chat-name">{initial.peerName}</strong>
              <small>{initial.peerStatus}</small>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => document.getElementById("reflection")?.scrollIntoView({ behavior: "smooth" })}>
              Akhiri Sesi
            </button>
          </div>
          <div className="chat-scroll" ref={scrollRef} role="log" aria-live="polite" aria-label="Percakapan">
            {msgs.map((m) => (
              <div key={m.id} className={`msg ${m.sender_id === initial.meId ? "me" : "them"}`}>
                <p>
                  {m.message}
                  {m.attachment_url ? (
                    <>
                      <br />
                      <a href={m.attachment_url} target="_blank" rel="noreferrer">
                        📎 Lihat lampiran →
                      </a>
                    </>
                  ) : null}
                </p>
                <time>{fmtTime(m.created_at)}</time>
              </div>
            ))}
          </div>
          {sendErr ? (
            <p className="tiny mt10" role="alert" style={{ padding: "0 18px" }}>
              {sendErr}
            </p>
          ) : null}
          {peerTyping ? (
            <p className="tiny muted" style={{ padding: "0 18px" }} aria-live="polite">
              <span className="typing" aria-hidden="true"><span></span><span></span><span></span></span> sedang mengetik…
            </p>
          ) : null}
          <form className="chat-input" onSubmit={send}>
            <label className="btn btn-secondary btn-sm" aria-label="Lampirkan berkas">
              📎
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) attach(f);
                  e.target.value = "";
                }}
              />
            </label>
            <input
              value={field}
              onChange={(e) => {
                setField(e.target.value);
                notifyTyping();
              }}
              type="text"
              placeholder={uploading ? "Mengunggah…" : "Tulis pesan…"}
              autoComplete="off"
              maxLength={2000}
              aria-label="Tulis pesan untuk counselor"
              disabled={uploading}
            />
            <button type="submit" className="btn btn-primary">
              Kirim
            </button>
          </form>
          <div className="session-meta" aria-label="Info sesi">
            <span>
              Topik: <strong>{initial.topic}</strong>
            </span>
            <span>
              Status: <strong>{initial.statusMeta}</strong>
            </span>
          </div>
          <details className="crisis-details" style={{ margin: "0 18px 14px" }}>
            <summary>Laporkan masalah di sesi ini 🚩</summary>
            <form onSubmit={sendReport} className="form-grid">
              <label htmlFor="rep-reason">Alasan</label>
              <select id="rep-reason" value={repReason} onChange={(e) => setRepReason(e.target.value)}>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <label htmlFor="rep-desc">Ceritakan sedikit <span className="muted">(opsional)</span></label>
              <textarea id="rep-desc" rows={2} maxLength={1000} value={repDesc} onChange={(e) => setRepDesc(e.target.value)} placeholder="Contoh: pesannya membuatku tidak nyaman…" />
              <p><button type="submit" className="btn btn-secondary btn-sm">Kirim Laporan</button></p>
              {repMsg ? <p className="tiny" role="status">{repMsg}</p> : null}
            </form>
          </details>
        </section>

        {!initial.isClient && initial.intake ? (
          <section className="panel mt14" aria-labelledby="intake-title">
            <h2 id="intake-title">Ringkasan intake 📋</h2>
            <p>
              <strong>{initial.peerName}</strong> — Topik: {initial.intake.topics.join(", ") || "-"} · Mood awal: {initial.intake.mood || "-"}
            </p>
            <p className="muted">“{initial.intake.story || "Belum ada cerita tertulis."}”</p>
          </section>
        ) : null}

        {!initial.isClient ? (
          <section className="panel mt14" aria-labelledby="note-title">
            <h2 id="note-title">Catatan privat 🔒</h2>
            <p className="tiny muted">Hanya kamu yang bisa baca — tidak terlihat klien.</p>
            <textarea rows={3} placeholder="Tulis observasi atau rencana tindak lanjut…" value={note} onChange={(e) => setNote(e.target.value)} />
            <p className="mt12">
              <button type="button" className="btn btn-secondary" onClick={saveNote}>
                💾 Simpan Catatan
              </button>
            </p>
            <p className="tiny muted" role="status">
              {noteMsg}
            </p>
            <h3>Langkah berikutnya ✅</h3>
            <p className="tiny muted">Saran kecil untuk sesi berikutnya — hanya terlihat olehmu.</p>
            <ul className="list-clean">
              {points.map((p, i) => (
                <li key={i} className="row-line">
                  <span>{p}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label={`Hapus langkah: ${p}`}
                    onClick={() => setPoints((prev) => prev.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="chat-input"
              style={{ paddingLeft: 0, paddingRight: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                const v = pointDraft.trim();
                if (v) {
                  setPoints((prev) => [...prev, v].slice(0, 20));
                  setPointDraft("");
                }
              }}
            >
              <input value={pointDraft} onChange={(e) => setPointDraft(e.target.value)} maxLength={200} placeholder="Tambah langkah kecil…" aria-label="Tambah action point" />
              <button type="submit" className="btn btn-secondary btn-sm">＋</button>
            </form>
            <div className="flex-wrap mt12">
              {(initial.status === "waiting" || initial.status === "pending") && (
                <button type="button" className="btn btn-primary" onClick={accept}>
                  ✅ Terima Sesi
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={finish}>
                🫶 Selesaikan Sesi
              </button>
            </div>
            <p className="tiny muted" role="status">
              {doneMsg}
            </p>
          </section>
        ) : null}

        {initial.isClient ? (
          <section className="reflect-card" id="reflection" aria-labelledby="reflect-title" tabIndex={-1}>
            <h2 id="reflect-title">Sebelum kamu pergi… 🫶</h2>
            <p className="muted">Satu langkah kecil: gimana perasaanmu setelah sesi ini?</p>
            <div className="mood-picker" role="group" aria-label="Perasaan setelah sesi">
              {REFLECT.map((r, i) => (
                <button key={r.label} type="button" aria-pressed={i === reflectMood} className={i === reflectMood ? "picked" : ""} onClick={() => setReflectMood(i)}>
                  <span aria-hidden="true">{r.emoji}</span>
                  <small>{r.label}</small>
                </button>
              ))}
            </div>
            <label htmlFor="reflect-note">
              <strong>Ada yang mau disimpan dari sesi ini?</strong> <span className="muted">(opsional)</span>
            </label>
            <textarea id="reflect-note" rows={3} maxLength={500} placeholder="Contoh: aku jadi sadar aku butuh istirahat…" value={reflectNote} onChange={(e) => setReflectNote(e.target.value)} />
            <p className="tiny muted">
              <span>{reflectNote.length}</span>/500
            </p>
            <div className="flex-wrap">
              <button type="button" className="btn btn-primary" onClick={saveReflect}>
                Selesai &amp; Simpan
              </button>
              <button type="button" className="btn btn-secondary" onClick={finish}>
                Akhiri Sesi
              </button>
            </div>
            <p className="tiny mt10" aria-live="polite">
              {reflectMsg} {doneMsg}
            </p>
            <p className="tiny muted">
              Lihat sesi sebelumnya di <Link href="/profile">Riwayat →</Link>
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

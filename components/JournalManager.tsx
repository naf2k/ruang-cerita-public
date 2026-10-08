"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createJournal, deleteJournal } from "@/lib/actions/journal";

const MOODS = [
  { emoji: "😄", label: "Senang" },
  { emoji: "🙂", label: "Baik" },
  { emoji: "😐", label: "Biasa" },
  { emoji: "😔", label: "Kurang baik" },
  { emoji: "😭", label: "Berat" },
];

export interface JournalEntryView {
  id?: string;
  title: string;
  body: string;
  mood: string;
  date: string;
}

const SEED: JournalEntryView[] = [
  {
    title: "Hari yang melelahkan tapi lega 🌱",
    body: "“Hari ini akhirnya aku berani cerita tentang masalahku. Ternyata nggak semenakutkan yang aku kira.”",
    mood: "🙂 Baik",
    date: "20 September",
  },
  {
    title: "Belajar bilang tidak",
    body: "“Aku nolak ajakan nongkrong karena capek. Rasanya bersalah, tapi badanku butuh istirahat.”",
    mood: "😐 Biasa",
    date: "18 September",
  },
];

function todayLong() {
  try {
    return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  } catch {
    return "Hari ini";
  }
}

export function JournalManager({ initial, loggedIn }: { initial: JournalEntryView[]; loggedIn: boolean }) {
  const [mood, setMood] = useState(1);
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<JournalEntryView[]>(loggedIn ? initial : SEED);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      setEntries(initial);
      return;
    }
    try {
      const extra = JSON.parse(localStorage.getItem("rc-journal") || "[]");
      if (Array.isArray(extra) && extra.length) setEntries([...extra, ...SEED]);
    } catch {}
  }, [loggedIn, initial]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setMsg("Tulis satu kalimat dulu yuk 🌱 Baru bisa disimpan.");
      return;
    }
    const moodLabel = `${MOODS[mood].emoji} ${MOODS[mood].label}`;
    if (!loggedIn) {
      const entry: JournalEntryView = {
        title: text.split("\n")[0].slice(0, 60) || "Catatan harian",
        body: text,
        mood: moodLabel,
        date: todayLong(),
      };
      setEntries((prev) => [entry, ...prev]);
      try {
        const prev = JSON.parse(localStorage.getItem("rc-journal") || "[]");
        localStorage.setItem("rc-journal", JSON.stringify([entry, ...prev]));
      } catch {}
      setText("");
      setMsg("Journal tersimpan 🌱 Hanya kamu yang bisa baca. Masuk untuk menyimpan permanen di akunmu.");
      return;
    }
    setSaving(true);
    const res = await createJournal({ content: text, mood: moodLabel });
    setSaving(false);
    if (!res.ok) {
      setMsg(res.message);
      return;
    }
    setEntries((prev) => [
      { id: res.id, title: text.split("\n")[0].slice(0, 60) || "Catatan harian", body: text, mood: moodLabel, date: todayLong() },
      ...prev,
    ]);
    setText("");
    setMsg("Journal tersimpan 🌱 Hanya kamu yang bisa baca.");
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm("Hapus cerita ini secara permanen?")) return;
    const res = await deleteJournal(id);
    if (res.ok) setEntries((prev) => prev.filter((e) => e.id !== id));
    else setMsg(res.message);
  }

  return (
    <>
      <section className="journal-editor" aria-labelledby="editor-title">
        <h2 id="editor-title">Apa yang ada di pikiranmu?</h2>
        <form onSubmit={save}>
          <label htmlFor="journal-text"><strong>Tulis dengan bebas</strong> — nggak harus rapi 💛</label>
          <textarea id="journal-text" rows={5} maxLength={5000} placeholder="Contoh: Hari ini akhirnya aku berani cerita tentang masalahku…" value={text} onChange={(e) => setText(e.target.value)} />
          <p className="tiny muted"><span>{text.length}</span>/5000</p>
          <fieldset className="intake-field">
            <legend className="tiny"><strong>Mood saat menulis</strong> (pilih satu)</legend>
            <div className="mood-picker" role="group" aria-label="Mood saat menulis">
              {MOODS.map((m, i) => (
                <button key={m.label} type="button" aria-pressed={i === mood} className={i === mood ? "picked" : ""} onClick={() => setMood(i)}>
                  <span aria-hidden="true">{m.emoji}</span>
                  <small>{m.label}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan Journal"}
          </button>
          <p className="tiny mt10" aria-live="polite">{msg}</p>
        </form>
      </section>

      <section aria-labelledby="entries-title">
        <h2 id="entries-title">Tulisanmu</h2>
        <div className="journal-entries">
          {entries.map((e, i) => (
            <article key={e.id ?? i} className="journal-entry">
              <h3>{e.title}</h3>
              <p className="meta">{e.date} • {e.mood}</p>
              <p>{e.body}</p>
              <p className="flex-wrap">
                <Link href={e.id ? `/journal/${e.id}` : "/journal/contoh"}>Buka cerita →</Link>
                {e.id && loggedIn ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(e.id)}>
                    Hapus
                  </button>
                ) : null}
              </p>
            </article>
          ))}
        </div>
        {entries.length === 0 ? (
          <div className="empty">
            <h2>Belum ada tulisan di sini 🌱</h2>
            <p className="muted">Mulai kapan aja — satu kalimat pun cukup. Hanya kamu yang bisa baca.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}

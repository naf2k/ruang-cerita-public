"use client";

import { useState } from "react";
import Link from "next/link";
import { createMood } from "@/lib/actions/mood";

const MOODS = [
  { emoji: "😄", label: "Senang" },
  { emoji: "🙂", label: "Baik" },
  { emoji: "😐", label: "Biasa" },
  { emoji: "😔", label: "Kurang baik" },
  { emoji: "😭", label: "Berat" },
];

export interface MoodRow {
  date: string;
  mood: string;
}

const SEED: MoodRow[] = [
  { date: "20 Sep", mood: "😔 Kurang baik" },
  { date: "19 Sep", mood: "🙂 Baik" },
  { date: "18 Sep", mood: "😐 Biasa" },
  { date: "17 Sep", mood: "😔 Kurang baik" },
];

function todayShort() {
  try {
    return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "Hari ini";
  }
}

export function MoodTracker({ initial, loggedIn }: { initial: MoodRow[]; loggedIn: boolean }) {
  const [picked, setPicked] = useState(1);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<MoodRow[]>(initial.length > 0 || loggedIn ? initial : SEED);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const moodLabel = `${MOODS[picked].emoji} ${MOODS[picked].label}`;
    if (!loggedIn) {
      try {
        const prev = JSON.parse(localStorage.getItem("rc-mood") || "[]");
        localStorage.setItem("rc-mood", JSON.stringify([{ mood: moodLabel, note: note.trim(), date: todayShort() }, ...prev]));
      } catch {}
      setHistory((h) => [{ date: todayShort(), mood: moodLabel }, ...h]);
      setNote("");
      setMsg("Mood hari ini tersimpan 🌤️ Masuk untuk menyimpan permanen di akunmu.");
      return;
    }
    setSaving(true);
    const res = await createMood({ mood: moodLabel, note });
    setSaving(false);
    if (!res.ok) {
      setMsg(res.message);
      return;
    }
    setHistory((h) => [{ date: todayShort(), mood: moodLabel }, ...h]);
    setNote("");
    setMsg("Mood hari ini tersimpan 🌤️ Makasih sudah jujur sama perasaanmu.");
  }

  return (
    <div className="container mood-grid">
      <div>
        <form onSubmit={save}>
          <fieldset className="intake-field">
            <legend><strong>Pilih mood hari ini</strong> (pilih satu)</legend>
            <div className="mood-picker" role="group" aria-label="Mood hari ini — pilih satu">
              {MOODS.map((m, i) => (
                <button key={m.label} type="button" aria-pressed={i === picked} className={i === picked ? "picked" : ""} onClick={() => setPicked(i)}>
                  <span aria-hidden="true">{m.emoji}</span>
                  <small>{m.label}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="mood-note"><strong>Mau cerita sedikit?</strong> <span className="muted">(opsional)</span></label>
          <textarea id="mood-note" rows={3} maxLength={500} placeholder="Contoh: hari ini capek tapi lega…" value={note} onChange={(e) => setNote(e.target.value)} />
          <p className="tiny muted"><span>{note.length}</span>/500</p>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan Mood"}
          </button>
          <p className="tiny mt10" aria-live="polite">{msg}</p>
        </form>
        <p className="tiny muted mt14">
          Mau tulis lebih panjang? <Link href="/journal">Buka journal →</Link> • Butuh didengarkan manusia?{" "}
          <Link href="/counseling/new">Aku Mau Cerita →</Link>
        </p>
      </div>
      <aside className="mood-history" aria-label="Riwayat mood">
        <h3>Terakhir</h3>
        <ul>
          {history.map((h, i) => (
            <li key={i}><span>{h.date}</span><span>{h.mood}</span></li>
          ))}
        </ul>
        {history.length === 0 ? <p className="tiny muted">Belum ada catatan mood 🌱</p> : null}
        <p className="tiny muted mt10">Tanpa skor, tanpa diagnosis — cuma jejak kecil perasaanmu 🌱</p>
      </aside>
    </div>
  );
}

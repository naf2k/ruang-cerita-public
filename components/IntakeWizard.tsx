"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createIntake } from "@/lib/actions/counseling";

const TOPICS = ["❤️ Percintaan", "🏠 Keluarga", "🫂 Pertemanan", "🎓 Sekolah / Kuliah", "🌱 Diri Sendiri", "🌧️ Emosi", "🧭 Masa Depan", "🤷 Nggak tahu"];
const TOPIC_VALUES = ["Percintaan", "Keluarga", "Pertemanan", "Sekolah / Kuliah", "Diri Sendiri", "Emosi", "Masa Depan", "Nggak tahu"];
const NEEDS = ["🫂 Aku ingin didengarkan", "💡 Aku ingin mencari solusi", "🤝 Aku ingin keduanya"];
const NEED_VALUES = ["listened", "solution", "both"];
const MOODS = ["😄", "🙂", "😐", "😔", "😭", "😡", "😰"];
const MOOD_LABEL = ["Senang", "Lumayan baik", "Biasa saja", "Sedang tidak baik", "Sangat berat", "Marah", "Cemas"];

export function IntakeWizard({ statusId = "intake-status" }: { statusId?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [topics, setTopics] = useState<number[]>([]);
  const [story, setStory] = useState("");
  const [need, setNeed] = useState(0);
  const [mood, setMood] = useState(1);
  const [status, setStatus] = useState("Langkah 1 dari 5: pilih topik dulu 💛");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("ruang-cerita") || "{}");
      if (Array.isArray(s.topics)) setTopics(s.topics);
      if (typeof s.story === "string") setStory(s.story);
      if (typeof s.need === "number") setNeed(s.need);
      if (typeof s.mood === "number") setMood(s.mood);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem("ruang-cerita") || "{}");
      localStorage.setItem("ruang-cerita", JSON.stringify({ ...prev, topics, story, need, mood }));
    } catch {}
  }, [topics, story, need, mood]);

  function toggleTopic(i: number) {
    setTopics((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      setStatus(next.length ? `${next.length} topik dipilih 🌱 Lanjut ke langkah 2 ya.` : "Langkah 1 dari 5: pilih topik dulu 💛");
      return next;
    });
  }

  function finish() {
    setErr("");
    start(async () => {
      const res = await createIntake({
        topics: topics.map((i) => TOPIC_VALUES[i]),
        story,
        supportType: NEED_VALUES[need],
        mood: MOODS[mood],
      });
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      try {
        if (res.requestId) localStorage.setItem("rc-request-id", res.requestId);
      } catch {}
      router.push("/counselors");
    });
  }

  return (
    <>
      <p className="tiny muted" aria-live="polite" id={statusId}>
        {status}
      </p>
      <ol className="intake-steps" style={{ marginTop: 12 }}>
        <li className="intake-step">
          <span className="step-num" aria-hidden="true">1</span>
          <fieldset className="intake-field">
            <legend>Kamu mau cerita tentang apa?</legend>
            <div className="chip-row" role="group" aria-label="Pilih topik, boleh lebih dari satu">
              {TOPICS.map((t, i) => {
                const on = topics.includes(i);
                return (
                  <button key={t} type="button" className={`chip${on ? " picked" : ""}`} aria-pressed={on} onClick={() => toggleTopic(i)}>
                    {t}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </li>
        <li className="intake-step">
          <span className="step-num" aria-hidden="true">2</span>
          <div className="intake-field">
            <label htmlFor="story"><strong>Ceritakan sedikit apa yang terjadi.</strong></label>
            <textarea id="story" rows={4} maxLength={1000} placeholder="Nggak perlu rapi atau lengkap. Cerita aja seperti kamu sedang ngobrol." value={story} onChange={(e) => setStory(e.target.value)} />
            <p className="tiny muted"><span>{story.length}</span>/1000 — tersimpan otomatis di perangkatmu.</p>
          </div>
        </li>
        <li className="intake-step">
          <span className="step-num" aria-hidden="true">3</span>
          <fieldset className="intake-field">
            <legend><strong>Kamu butuh apa saat ini?</strong></legend>
            <div className="need-picks" role="group" aria-label="Kamu butuh apa?">
              {NEEDS.map((n, i) => (
                <button key={n} type="button" className={`need${i === need ? " active" : ""}`} aria-pressed={i === need}
                  onClick={() => { setNeed(i); setStatus("Langkah 3 tersimpan 🌱 Lanjut ke langkah 4 ya."); }}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
        </li>
        <li className="intake-step">
          <span className="step-num" aria-hidden="true">4</span>
          <fieldset className="intake-field">
            <legend><strong>Sekarang kamu merasa bagaimana?</strong> <small className="muted">(opsional — boleh dilewati)</small></legend>
            <div className="moods" role="group" aria-label="Mood kamu sekarang, opsional">
              {MOODS.map((m, i) => (
                <button key={m + i} type="button" aria-label={MOOD_LABEL[i]} aria-pressed={i === mood} className={i === mood ? "picked" : ""}
                  onClick={() => { setMood(i); setStatus("Mood tersimpan 💛 Cerita kamu sudah siap — lihat counselor yuk."); }}>
                  {m}
                </button>
              ))}
            </div>
          </fieldset>
        </li>
        <li className="intake-step intake-confirm">
          <span className="step-num" aria-hidden="true">5</span>
          <div className="intake-field">
            <p><strong>Cerita kamu sudah siap 🌱</strong></p>
            <p className="muted">Kami bantu carikan counselor yang sesuai dengan topik dan maumu.</p>
            {err ? (
              <p className="tiny" role="alert">
                {err}
              </p>
            ) : null}
            <button type="button" className="btn btn-primary btn-lg" onClick={finish} disabled={pending}>
              <span>{pending ? "Menyimpan…" : "Lihat Counselor"}</span>
              <span className="btn-icon" aria-hidden="true">→</span>
            </button>
            <p className="tiny muted mt10">
              Belum masuk? <Link href="/login">Masuk dulu</Link> biar ceritamu tersimpan di akunmu — atau lanjut sebagai tamu.
            </p>
          </div>
        </li>
      </ol>
    </>
  );
}

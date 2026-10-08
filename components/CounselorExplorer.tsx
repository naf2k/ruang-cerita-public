"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CounselorCard, type CounselorView } from "./CounselorCard";

export function CounselorExplorer({ items }: { items: CounselorView[] }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("semua");
  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return items.filter((c) => {
      const hay = `${c.name} ${c.topics}`.toLowerCase();
      const okQ = !key || hay.includes(key);
      const okT = topic === "semua" || c.topics.toLowerCase().includes(topic);
      return okQ && okT;
    });
  }, [q, topic, items]);

  return (
    <>
      <form className="toolbar" role="search" aria-label="Cari dan filter counselor" onSubmit={(e) => e.preventDefault()}>
        <label className="tiny muted self-center" htmlFor="cari">
          Cari
        </label>
        <input
          type="search"
          id="cari"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama atau topik… mis. Naya, Family"
          autoComplete="off"
        />
        <label className="tiny muted self-center" htmlFor="filter-topik">
          Topik
        </label>
        <select id="filter-topik" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="semua">Semua topik</option>
          <option value="relationship">❤️ Relationship</option>
          <option value="family">🏠 Family</option>
          <option value="friendship">🫂 Friendship</option>
          <option value="student">🎓 Student</option>
          <option value="self">🌱 Self Growth</option>
          <option value="emosi">🌧️ Emosi</option>
          <option value="future">🧭 Future</option>
        </select>
      </form>
      <p className="tiny muted" role="status">
        {filtered.length} counselor cocok buat kamu.
      </p>
      <div className="counselor-grid" style={{ marginTop: 16 }}>
        {filtered.map((c) => (
          <CounselorCard key={c.userId ?? c.name} c={c} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty">
          <h2>Hmm, belum ketemu yang cocok 🔍</h2>
          <p className="muted">Coba kata kunci lain, atau mulai aja — nanti kami carikan yang pas.</p>
          <Link href="/counseling/new" className="btn btn-primary">
            <span>Aku Mau Cerita</span>
            <span className="btn-icon" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      ) : null}
    </>
  );
}

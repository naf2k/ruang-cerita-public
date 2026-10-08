"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface ArticleView {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  minutes: number;
  emoji: string;
  coverClass: string;
  excerpt: string;
}

const CATS = [
  { v: "semua", label: "Semua" },
  { v: "relationship", label: "❤️ Relationship" },
  { v: "family", label: "🏠 Family" },
  { v: "student", label: "🎓 Student" },
  { v: "self", label: "🌱 Self" },
];

const COVERS = ["a-cover c1", "a-cover c2", "a-cover c3"];

export function ResourceExplorer({ items }: { items: ArticleView[] }) {
  const [cat, setCat] = useState("semua");
  const filtered = useMemo(() => (cat === "semua" ? items : items.filter((a) => a.category === cat)), [cat, items]);
  const featured = cat === "semua" ? filtered[0] : undefined;
  const list = featured ? filtered.slice(1) : filtered;

  return (
    <>
      <div className="chip-row" role="group" aria-label="Kategori artikel">
        {CATS.map((c) => (
          <button key={c.v} type="button" className={`chip${cat === c.v ? " picked" : ""}`} aria-pressed={cat === c.v} onClick={() => setCat(c.v)}>
            {c.label}
          </button>
        ))}
      </div>
      <p className="tiny muted" role="status" style={{ marginTop: 10 }}>
        Menampilkan {filtered.length} bacaan.
      </p>
      {featured ? (
        <Link href={`/resources/${featured.slug}`} className="article featured" aria-label={`Baca unggulan: ${featured.title}, ${featured.minutes} menit`}>
          <span className={`${featured.coverClass} big-glyph`} aria-hidden="true">{featured.emoji}</span>
          <span>
            <small className="tiny muted tag-bold">⭐ Unggulan • {featured.categoryLabel} • {featured.minutes} mnt baca</small>
            <strong className="lead-title">{featured.title}</strong>
            <small>{featured.excerpt} →</small>
          </span>
        </Link>
      ) : null}
      <div className="article-list">
        {list.map((a, i) => (
          <Link key={a.slug} href={`/resources/${a.slug}`} className="article" aria-label={`Baca: ${a.title}, ${a.minutes} menit`}>
            <span className={a.coverClass || COVERS[i % COVERS.length]} aria-hidden="true">{a.emoji}</span>
            <span>
              <strong>{a.title}</strong>
              <small>{a.categoryLabel} • {a.minutes} mnt baca</small>
            </span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty">
          <h2>Belum ada bacaan di sini 📭</h2>
          <p className="muted">Coba kategori lain, atau cerita aja langsung.</p>
        </div>
      ) : null}
    </>
  );
}

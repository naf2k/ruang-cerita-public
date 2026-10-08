import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, listPublishedArticles } from "@/lib/actions/articles";
import { minutesOf, CATEGORY_LABEL as LABEL, COVER_CLASS as COVERS } from "@/lib/reading";

export const revalidate = 60;

export async function generateStaticParams() {
  const rows = await listPublishedArticles().catch(() => []);
  return rows.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug).catch(() => null);
  if (!a) return { title: "Artikel" };
  return { title: a.title, description: a.excerpt || undefined };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug).catch(() => null);
  if (!a) notFound();

  const minutes = minutesOf(a.content ?? "");
  const paras = (a.content ?? "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const related = (await listPublishedArticles(a.category).catch(() => [])).filter((r) => r.slug !== a.slug).slice(0, 3);

  return (
    <div className="container">
      <p className="crumbs mt24"><Link href="/">Beranda</Link> / <Link href="/resources">Ruang Baca</Link> / {a.title}</p>
      <div className="article-hero">
        <span className="pill-badge">
          {a.cover_emoji} {LABEL[a.category] ?? a.category} • {minutes} mnt baca
        </span>
        <h1>{a.title}</h1>
        <p className="muted m0">Ditulis dengan hangat oleh tim Ruang Cerita</p>
      </div>

      <article className="article-body" aria-label="Isi artikel">
        {a.excerpt ? (
          <p><strong>{a.excerpt}</strong></p>
        ) : null}
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <details className="crisis-details">
          <summary>Mau latihan dulu sebelum ngomong beneran?</summary>
          <p className="mt8">Tulis uneg-unegmu di <Link href="/journal">private journal →</Link> (cuma kamu yang bisa baca), atau latihan bareng <Link href="/counselors">counselor →</Link>.</p>
        </details>
        <div className="reflect-card">
          <strong>Renungan 1 menit 📝</strong>
          <p className="muted mt4">Tutup artikel ini, lalu jawab dalam hati: <em>satu hal kecil apa yang paling membebanimu minggu ini?</em></p>
        </div>
        <p className="tiny muted">Artikel ini buat nemenin, bukan diagnosis atau saran medis. Kalau kamu merasa tidak aman, <Link href="/help-now">cari bantuan segera →</Link></p>
      </article>

      <div className="help-banner mt28">
        <div><h2 className="mb3">Mau dibantu ngurai ini? 💬</h2>
        <p className="m0">Counselor siap dengerin ceritamu — gratis, boleh anonim.</p></div>
        <div className="help-actions">
          <Link href="/counselors" className="btn btn-dark">Ketemu Counselor</Link>
          <Link href="/counseling/new" className="btn btn-light">Aku Mau Cerita →</Link>
        </div>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-title">
          <h2 id="related-title">Lanjut baca yang nyambung 🌱</h2>
          <div className="related">
            {related.map((r, i) => (
              <Link key={r.slug} href={`/resources/${r.slug}`} className="article">
                <span className={COVERS[i % COVERS.length]} aria-hidden="true">{r.cover_emoji}</span>
                <span><strong>{r.title}</strong><small>{LABEL[r.category] ?? r.category} • {minutesOf(r.content ?? "")} mnt baca</small></span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ResourceExplorer, type ArticleView } from "@/components/ResourceExplorer";
import { listPublishedArticles } from "@/lib/actions/articles";
import { minutesOf, CATEGORY_LABEL, COVER_CLASS } from "@/lib/reading";

export const metadata: Metadata = { title: "Ruang Baca", description: "Bacaan pendek yang menenangkan: hubungan, keluarga, sekolah, diri sendiri." };
export const revalidate = 60;

export default async function ResourcesPage() {
  const rows = await listPublishedArticles().catch(() => []);
  const items: ArticleView[] = rows.map((a, i) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    categoryLabel: CATEGORY_LABEL[a.category] ?? a.category,
    minutes: minutesOf(a.content ?? ""),
    emoji: a.cover_emoji || "🌱",
    coverClass: COVER_CLASS[i % COVER_CLASS.length],
    excerpt: a.excerpt || "",
  }));

  return (
    <>
      <section className="page-hero" aria-labelledby="baca-title">
        <div className="container">
          <p className="crumbs"><Link href="/">Beranda</Link> / Ruang Baca</p>
          <span className="pill-badge">🌱 Bacaan pendek yang menenangkan</span>
          <h1 id="baca-title">Ruang Baca 📚</h1>
          <p className="lede">Bukan ceramah, bukan teori berat. Bacaan 3–5 menit buat nemenin harimu — pilih yang paling nyambung.</p>
          <div className="toolbar">
            <ResourceExplorer items={items} />
          </div>
        </div>
      </section>
      <section className="section pt-tight" aria-label="Ajakan konseling">
        <div className="container">
          <div className="reflect-card hero-split">
            <div><strong>Masih berat setelah baca? 💬</strong><p className="muted mt-small">Bacaan cuma nemenin. Kalau butuh didengerin beneran, counselor siap.</p></div>
            <Link href="/counselors" className="btn btn-primary"><span>Ketemu Counselor</span><span className="btn-icon" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}

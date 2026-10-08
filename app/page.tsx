import type { Metadata } from "next";
import Link from "next/link";
import { counselors as mockCounselors, topics } from "@/lib/data";
import { CounselorCard, type CounselorView } from "@/components/CounselorCard";
import { HeroChatMock } from "@/components/HeroChatMock";
import { IntakeWizard } from "@/components/IntakeWizard";
import { Reveal } from "@/components/Reveal";
import { listVerifiedCounselors } from "@/lib/actions/counselors";
import { listPublishedArticles } from "@/lib/actions/articles";
import { minutesOf, CATEGORY_LABEL, COVER_CLASS } from "@/lib/reading";

export const metadata: Metadata = {
  title: "Ruang Cerita — Tempat kecil untuk cerita 🌱",
  description: "Platform counseling gratis. Kamu nggak harus menghadapi semuanya sendirian.",
};
export const revalidate = 60;

const AVATAR_CLASS = ["avatar avatar-pink xl", "avatar avatar-sky xl", "avatar avatar-mint xl"];
const STATUS_LABEL = { available: "Tersedia", busy: "Sibuk", offline: "Offline" } as const;

export default async function Home() {
  const [dbCounselors, dbArticles] = await Promise.all([
    listVerifiedCounselors().catch(() => []),
    listPublishedArticles().catch(() => []),
  ]);
  const rank = { available: 0, busy: 1, offline: 2 } as const;
  const featured: CounselorView[] =
    dbCounselors.length > 0
      ? [...dbCounselors].sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 3).map((c, i) => ({
          userId: c.userId,
          name: c.name,
          initial: c.initial,
          avatarClass: AVATAR_CLASS[i % AVATAR_CLASS.length],
          avatarEmoji: c.avatarEmoji,
          status: c.status,
          statusLabel: STATUS_LABEL[c.status],
          tags: c.tags,
          topics: c.topics,
          quote: c.quote,
          lang: c.lang,
        }))
      : mockCounselors.slice(0, 3).map((c, i) => ({
          name: c.name,
          initial: c.initial,
          avatarClass: AVATAR_CLASS[i % AVATAR_CLASS.length],
          status: c.status,
          statusLabel: c.statusLabel,
          tags: c.tags,
          topics: c.topics,
          quote: c.quote,
          lang: c.lang,
        }));
  const teaser =
    dbArticles.length > 0
      ? dbArticles.slice(0, 3).map((a, i) => ({
          slug: a.slug,
          title: a.title,
          sub: `${CATEGORY_LABEL[a.category] ?? a.category} • ${minutesOf(a.content ?? "")} mnt baca`,
          emoji: a.cover_emoji || "🌱",
          cover: COVER_CLASS[i % COVER_CLASS.length],
        }))
      : [
          { slug: "ketika-hubungan-terasa-melelahkan", title: "Ketika hubungan terasa melelahkan", sub: "Relationship • 3 mnt baca", emoji: "💛", cover: "a-cover c1" },
          { slug: "ketika-sulit-bicara-dengan-orang-tua", title: "Ketika sulit bicara dengan orang tua", sub: "Family • 4 mnt baca", emoji: "🏠", cover: "a-cover c2" },
          { slug: "ketika-tugas-terasa-terlalu-banyak", title: "Ketika tugas terasa terlalu banyak", sub: "Student • 3 mnt baca", emoji: "🎓", cover: "a-cover c3" },
        ];
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="pill-badge">🌷 Safe space • Gratis • Tanpa dihakimi</span>
            <h1 id="hero-title">
              Ada yang lagi
              <br />
              berat di pikiran? 💭
            </h1>
            <p className="lede">Kamu nggak harus menghadapi semuanya sendirian. Ceritakan apa yang sedang kamu rasakan.</p>
            <div className="hero-cta">
              <Link href="/counseling/new" className="btn btn-primary btn-lg">
                <span>Aku Mau Cerita</span>
                <span className="btn-icon" aria-hidden="true">→</span>
              </Link>
              <Link href="/#cara-kerja" className="btn btn-secondary btn-lg">
                Cari Tahu Dulu
              </Link>
            </div>
            <ul className="hero-trust" aria-label="Kenapa aman">
              <li><span aria-hidden="true">🔒</span> Privasi dijaga</li>
              <li><span aria-hidden="true">🫂</span> Counselor manusia</li>
              <li><span aria-hidden="true">🌱</span> Bisa anonim</li>
            </ul>
          </div>

          <div className="hero-visual">
            <div className="visual-shell">
              <div className="visual-core">
                <div className="chat-mock" aria-hidden="true">
                  <div className="chat-head">
                    <span className="avatar avatar-pink" aria-hidden="true">N</span>
                    <div><strong>🌷 Kak Naya</strong><small><span aria-hidden="true">🟢</span> Tersedia • Counselor</small></div>
                  </div>
                  <HeroChatMock />
                </div>
                <div className="float-card mood-float" aria-hidden="true">
                  <strong>Gimana hari ini? 🌤️</strong>
                  <div className="mini-moods"><span>😄</span><span className="picked">🙂</span><span>😐</span><span>😔</span></div>
                </div>
                <div className="float-card safe-float" aria-hidden="true">🔒 Ceritamu aman di sini</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="topik" aria-labelledby="topik-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="topik-title">Kamu mau cerita tentang apa?</h2>
              <p>Pilih satu atau lebih. Nggak tahu masalahnya apa pun nggak apa-apa.</p>
            </div>
          </Reveal>
          <div className="topic-groups">
            <fieldset className="topic-group">
              <legend>Hubungan dengan orang lain</legend>
              <div className="topic-row">
                {topics.slice(0, 3).map((t) => (
                  <Link key={t.label} href="/counseling/new" className={`topic ${t.cls}`}>
                    <span className="t-emoji" aria-hidden="true">{t.emoji}</span>
                    <span><strong>{t.label}</strong><small>{t.desc}</small></span>
                  </Link>
                ))}
              </div>
            </fieldset>
            <fieldset className="topic-group">
              <legend>Tentang diriku</legend>
              <div className="topic-row">
                {topics.slice(3).map((t) => (
                  <Link key={t.label} href="/counseling/new" className={`topic ${t.cls}`}>
                    <span className="t-emoji" aria-hidden="true">{t.emoji}</span>
                    <span><strong>{t.label}</strong><small>{t.desc}</small></span>
                  </Link>
                ))}
              </div>
            </fieldset>
            <Link href="/counseling/new" className="topic t-idk t-wide">
              <span className="t-emoji" aria-hidden="true">🤷</span>
              <span><strong>Aku Nggak Tahu</strong><small>Nggak harus tahu dulu — mulai aja 💛</small></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-tint" id="cara-kerja" aria-labelledby="cara-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="cara-title">Mulai cerita dalam 3 langkah</h2>
              <p>Sesederhana ngobrol. Tanpa tutorial panjang.</p>
            </div>
          </Reveal>
          <ol className="steps">
            <li className="step"><span className="step-num">1</span><div><strong>Ceritakan sedikit</strong><p>Nggak perlu rapi atau lengkap. Cerita aja seperti kamu sedang ngobrol.</p></div></li>
            <li className="step"><span className="step-num">2</span><div><strong>Pilih maumu</strong><p>🫂 Ingin didengarkan • 💡 Cari solusi • 🤝 Keduanya</p></div></li>
            <li className="step"><span className="step-num">3</span><div><strong>Chat dengan counselor</strong><p>Pilih counselor yang cocok, langsung mulai chat realtime.</p></div></li>
          </ol>
          <div className="center">
            <Link href="/counseling/new" className="btn btn-primary"><span>Aku Mau Cerita</span><span className="btn-icon" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="section" id="intake" aria-labelledby="intake-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="intake-title">Ceritakan sedikit, langkah demi langkah 🌱</h2>
              <p className="muted">Contoh alur intake — 30 detik, tanpa akun. Pilihanmu tersimpan otomatis di perangkat ini.</p>
            </div>
          </Reveal>
          <IntakeWizard />
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="mood-title">
        <div className="container mood-grid">
          <div>
            <h2 id="mood-title">Gimana keadaanmu hari ini? 🌤️</h2>
            <p>Pilih yang paling dekat. Nggak ada skor, nggak ada diagnosis.</p>
            <p className="muted">
              Catat di <Link href="/mood">Mood Saya →</Link>
            </p>
          </div>
          <aside className="mood-history" aria-label="Contoh riwayat mood">
            <h3>September</h3>
            <ul>
              <li><span>20 Sep</span><span>😔</span></li>
              <li><span>19 Sep</span><span>🙂</span></li>
              <li><span>18 Sep</span><span>😐</span></li>
              <li><span>17 Sep</span><span>😔</span></li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section" id="counselor" aria-labelledby="counselor-title">
        <div className="container">
          <div className="section-head split">
            <div><h2 id="counselor-title">Kenalan sama counselor 🤍</h2><p>Manusia beneran yang siap dengerin, bukan AI.</p></div>
            <Link href="/counselors" className="btn btn-secondary">Lihat Semua Counselor</Link>
          </div>
          <Reveal>
            <div className="counselor-grid">
              {featured.map((c) => (
                <CounselorCard key={c.userId ?? c.name} c={c} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="journal-title">
        <div className="container duo">
          <div className="journal-card">
            <h2 id="journal-title">Private journal 📝</h2>
            <p>Ruang pribadi untuk refleksi. Hanya kamu yang bisa baca — counselor pun tidak.</p>
            <div className="journal-preview"><p>“Hari ini akhirnya aku berani cerita tentang masalahku…”</p><small>20 September • 🙂</small></div>
            <Link href="/journal" className="btn btn-secondary"><span>Tulis Journal</span></Link>
            <p className="tiny muted">🔒 Private by default. Belum ada cerita di sini 🌱 — mulai kapan aja.</p>
          </div>
          <div aria-labelledby="ruangbaca-title">
            <h2 id="ruangbaca-title">Ruang Baca 🌱</h2>
            <p>Bacaan pendek yang menenangkan, bukan ceramah.</p>
            <div className="article-list">
              {teaser.map((a) => (
                <Link key={a.slug} href={`/resources/${a.slug}`} className="article"><span className={a.cover} aria-hidden="true">{a.emoji}</span><span><strong>{a.title}</strong><small>{a.sub}</small></span></Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="help-now" aria-labelledby="help-title">
        <div className="container">
          <Reveal>
            <div className="help-banner">
            <div>
              <h2 id="help-title">🆘 Butuh bantuan sekarang?</h2>
              <p>Kalau kamu merasa tidak aman atau butuh bantuan segera, kamu nggak sendirian. Chat biasa bukan pengganti bantuan darurat.</p>
            </div>
            <div className="help-actions">
              <a href="tel:119" className="btn btn-dark">📞 Layanan Darurat 119</a>
              <Link href="/help-now" className="btn btn-light">Info Lengkap →</Link>
            </div>
          </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

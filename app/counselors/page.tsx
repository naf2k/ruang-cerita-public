import type { Metadata } from "next";
import Link from "next/link";
import { CounselorExplorer } from "@/components/CounselorExplorer";
import type { CounselorView } from "@/components/CounselorCard";
import { listVerifiedCounselors } from "@/lib/actions/counselors";
import { counselors as mockCounselors } from "@/lib/data";

export const metadata: Metadata = { title: "Counselor", description: "Kenalan sama counselor manusia Ruang Cerita yang terverifikasi." };
export const revalidate = 60;

const STATUS_LABEL = { available: "Tersedia", busy: "Sibuk", offline: "Offline" } as const;
const AVATAR_CLASS = ["avatar avatar-pink xl", "avatar avatar-sky xl", "avatar avatar-mint xl"];

export default async function CounselorsPage() {
  const db = await listVerifiedCounselors();
  const items: CounselorView[] =
    db.length > 0
      ? db.map((c, i) => ({
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
          queueNote: c.status === "busy" ? "Lagi sesi. Kamu masuk antrian dan bisa mulai pelan-pelan." : undefined,
        }))
      : mockCounselors.map((c, i) => ({
          name: c.name,
          initial: c.initial,
          avatarClass: AVATAR_CLASS[i % AVATAR_CLASS.length],
          status: c.status,
          statusLabel: c.statusLabel,
          tags: c.tags,
          topics: c.topics,
          quote: c.quote,
          lang: c.lang,
          queueNote: c.queueNote,
        }));

  return (
    <>
      <section className="page-hero" aria-labelledby="counselor-title">
        <div className="container">
          <p className="crumbs"><Link href="/">Beranda</Link> / Counselor</p>
          <span className="pill-badge">🧑‍🤝‍🧑 Manusia beneran, bukan AI</span>
          <h1 id="counselor-title">Kenalan sama counselor 🤍</h1>
          <p className="lede">Semua terverifikasi dan siap dengerin. Pilih yang topiknya paling nyambung sama ceritamu — nggak cocok pun boleh ganti.</p>
          <CounselorExplorer items={items} />
        </div>
      </section>
      <section className="section pt0" aria-label="Belum yakin pilih siapa">
        <div className="container">
          <Link className="topic t-wide plain-link" href="/counseling/new">
            <span className="t-emoji" aria-hidden="true">🤷</span>
            <span><strong>Belum yakin pilih siapa? Mulai aja dulu 💛</strong><small>Ceritakan sedikit — kami sambungkan ke counselor yang pas buat topikmu.</small></span>
          </Link>
          <p className="tiny muted mt12t">Semua counselor terverifikasi • Gratis • Boleh anonim • Butuh bantuan segera? <Link href="/help-now">Klik di sini →</Link></p>
        </div>
      </section>
    </>
  );
}

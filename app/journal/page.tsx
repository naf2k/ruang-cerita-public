import type { Metadata } from "next";
import Link from "next/link";
import { JournalManager, type JournalEntryView } from "@/components/JournalManager";
import { listJournals } from "@/lib/actions/journal";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Journal", description: "Ruang pribadi untuk refleksi. Hanya kamu yang bisa baca." };

function fmtLong(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  } catch {
    return "";
  }
}

export default async function JournalPage() {
  const me = await getCurrentUser();
  let initial: JournalEntryView[] = [];
  if (me) {
    const rows = await listJournals();
    initial = rows.map((r) => ({ id: r.id, title: r.title ?? "Catatan harian", body: r.content, mood: r.mood ?? "", date: fmtLong(r.created_at) }));
  }
  return (
    <>
      <section className="page-hero" aria-labelledby="journal-title">
        <div className="container">
          <p className="crumbs"><Link href="/">Beranda</Link> / Journal</p>
          <h1 id="journal-title">Private journal 📝</h1>
          <p className="lede">Ruang pribadi untuk refleksi. Tulis bebas — nggak harus rapi.</p>
          <div className="auth-note" role="note">🔒 <strong>Hanya kamu yang bisa baca</strong> — counselor pun tidak bisa lihat.</div>
        </div>
      </section>
      <div className="container">
        <JournalManager initial={initial} loggedIn={!!me} />
        <p className="tiny muted">Mau cek perasaan harian? <Link href="/mood">Catat mood →</Link> • Butuh didengarkan manusia? <Link href="/counseling/new">Aku Mau Cerita →</Link></p>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { listMySessions } from "@/lib/actions/counseling";
import { listJournals } from "@/lib/actions/journal";
import { listMoods } from "@/lib/actions/mood";
import { listPublishedArticles } from "@/lib/actions/articles";
import { minutesOf, CATEGORY_LABEL, COVER_CLASS } from "@/lib/reading";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard", description: "Ruang pribadimu: sesi, journal, mood minggu ini, dan bacaan." };

const DAY_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function DashboardPage() {
  const me = await requireUser(["client"]);
  const [sessions, journals, moods, articles] = await Promise.all([
    listMySessions(),
    listJournals(20),
    listMoods(30),
    listPublishedArticles().catch(() => []),
  ]);

  const active = sessions.find((s) => s.status === "active");
  const doneCount = sessions.filter((s) => s.status === "completed").length;
  const weekAgo = Date.now() - 7 * 864e5;
  const journalsWeek = journals.filter((j) => new Date(j.created_at).getTime() >= weekAgo);

  // mood 7 hari terakhir
  const days: { label: string; mood: string | null }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    const key = startOfDay(d).getTime();
    const found = moods.find((m) => {
      const t = new Date(m.created_at);
      return startOfDay(t).getTime() === key;
    });
    days.push({ label: i === 0 ? "Hari ini" : DAY_ID[d.getDay()], mood: found ? found.mood : null });
  }
  const todayMood = days[6].mood;

  // streak: hari beruntun (mundur dari hari ini/kemarin) dengan mood tercatat
  let streak = 0;
  const daySet = new Set(moods.map((m) => startOfDay(new Date(m.created_at)).getTime()));
  let cursor = startOfDay(new Date()).getTime();
  if (!daySet.has(cursor)) cursor -= 864e5;
  while (daySet.has(cursor)) {
    streak++;
    cursor -= 864e5;
  }

  const latestJournal = journals[0];

  return (
    <>
      <section className="page-hero" aria-labelledby="dash-title">
        <div className="container">
          <p className="crumbs"><Link href="/">Beranda</Link> / Dashboard</p>
          <h1 id="dash-title">Halo, {me.profile.display_name ?? "teman"} 🌤️</h1>
          <p className="lede">Pelan-pelan aja. Ini ruangmu — semua tersimpan rapi dan privat.</p>
        </div>
      </section>
      <section className="section pt-tight" aria-label="Ringkasan ruangmu">
        <div className="container">
          <div className="dash-grid" role="list" aria-label="Statistik minggu ini">
            <div className="stat" role="listitem"><strong>{doneCount}</strong><span>Sesi selesai 💬</span></div>
            <div className="stat" role="listitem"><strong>{journalsWeek.length}</strong><span>Jurnal minggu ini 📝</span></div>
            <div className="stat" role="listitem"><strong>{streak} hari 🔥</strong><span>Hari beruntun mampir</span></div>
          </div>

          {active ? (
            <div className="panel panel-peach" aria-labelledby="next-title">
              <div className="chat-headbar bare">
                <span className="avatar avatar-pink xl" aria-hidden="true">{active.counselorAvatar}</span>
                <div><strong id="next-title">Sesi Berikutnya — {active.counselorName}</strong><small>Counselor terverifikasi ✓</small></div>
              </div>
              <p className="muted m0-14">Topik: {active.topic}. {active.lastMessage ? `Terakhir: “${active.lastMessage.slice(0, 80)}”` : "Mulai ngobrol kapan aja."}</p>
              <div className="flex-wrap">
                <Link href={`/counseling/${active.id}`} className="btn btn-primary"><span>Lanjut Chat</span><span className="btn-icon" aria-hidden="true">→</span></Link>
                <Link href="/counselors" className="btn btn-secondary">Pilih Counselor Lain</Link>
              </div>
            </div>
          ) : (
            <div className="panel panel-peach">
              <strong>Belum ada sesi aktif 🌱</strong>
              <p className="muted m0-14">Kalau butuh cerita, counselor siap dengerin.</p>
              <Link href="/counseling/new" className="btn btn-primary"><span>Aku Mau Cerita</span><span className="btn-icon" aria-hidden="true">→</span></Link>
            </div>
          )}

          <div className="duo mt14">
            <div className="panel mb0" aria-labelledby="mood-title">
              <h2 id="mood-title">Mood minggu ini 🌤️</h2>
              <ul className="list-clean">
                {days.map((d, i) => (
                  <li key={i} className={i === 6 ? "row-plain" : "row-line"}>
                    <span>{d.label}</span>
                    {d.mood ? <span>{d.mood}</span> : <span>🌤️ belum diisi — <Link href="/mood">isi yuk</Link></span>}
                  </li>
                ))}
              </ul>
              {!todayMood ? null : null}
            </div>

            <div>
              <div className="panel" aria-labelledby="journal-title">
                <h2 id="journal-title">Journal terakhir 📝</h2>
                {latestJournal ? (
                  <div className="journal-preview"><p>“{latestJournal.content.slice(0, 120)}”</p><small>{latestJournal.mood ?? ""}</small></div>
                ) : (
                  <p className="muted">Belum ada tulisan di sini 🌱</p>
                )}
                <Link href="/journal" className="btn btn-secondary">Buka Journal →</Link>
                <p className="tiny muted m10-0">🔒 Hanya kamu yang bisa baca.</p>
              </div>
              <div className="panel" aria-labelledby="baca-title">
                <h2 id="baca-title">Buat dibaca santai 🌱</h2>
                <div className="article-list">
                  {articles.slice(0, 2).map((a, i) => (
                    <Link key={a.slug} href={`/resources/${a.slug}`} className="article"><span className={COVER_CLASS[i % COVER_CLASS.length]} aria-hidden="true">{a.cover_emoji}</span><span><strong>{a.title}</strong><small>{CATEGORY_LABEL[a.category] ?? a.category} • {minutesOf(a.content ?? "")} mnt baca</small></span></Link>
                  ))}
                </div>
                <p className="mt12"><Link href="/resources">Lihat semua bacaan →</Link></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

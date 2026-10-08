import type { Metadata } from "next";
import Link from "next/link";
import { CounselorConsole } from "@/components/CounselorConsole";
import { getCounselorSessions, getCounselorStats, getMyCounselorProfile } from "@/lib/actions/counselors";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard Counselor", description: "Dashboard sederhana untuk counselor: status, klien, detail sesi." };

export default async function CounselorPage() {
  await requireUser(["counselor"]);
  const [profile, stats, sessions] = await Promise.all([getMyCounselorProfile(), getCounselorStats(), getCounselorSessions()]);
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / Counselor</p>
        <h1>Halo, {profile?.display_name ?? "Kak"} 🌷</h1>
        <p className="lede">Ringkasan sederhana harimu — tidak ada yang ribet di sini. Pelan-pelan saja. 🫶</p>
      </div>
      <div className="stack">
        <CounselorConsole
          displayName={profile?.display_name ?? "Kak"}
          initialAvail={(profile?.availability_status ?? "offline") as "available" | "busy" | "offline"}
          stats={stats}
          sessions={sessions}
        />
        <section className="panel" aria-labelledby="klien-title">
          <h2 id="klien-title" className="sec-title">Klienmu 🫂</h2>
          <p className="muted">Identitas disamarkan demi privasi — yang kamu lihat hanya inisial anonim.</p>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th scope="col">Klien</th><th scope="col">Topik</th><th scope="col">Status</th><th scope="col">Aksi</th></tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.clientLabel}</strong></td><td>{s.topic}</td>
                    <td><span className={`badge ${s.status === "active" ? "green" : s.status === "completed" ? "grey" : "yellow"}`}>{s.status}</span></td>
                    <td><Link href={`/counseling/${s.id}`}>Buka chat →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sessions.length === 0 ? <p className="muted">Belum ada klien. 🌱</p> : null}
        </section>
      </div>
    </div>
  );
}

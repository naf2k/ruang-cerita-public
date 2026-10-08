import Link from "next/link";
import { getCounselorSessions } from "@/lib/actions/counselors";
import { requireUser } from "@/lib/auth";

export default async function CounselorSessionsPage() {
  await requireUser(["counselor"]);
  const sessions = await getCounselorSessions();
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/counselor">Counselor</Link> / Sesi</p>
        <h1>Sesi kamu 💬</h1>
        <p className="lede">Semua sesi yang kamu tangani — aktif, menunggu, selesai.</p>
      </div>
      <div className="session-cards">
        {sessions.map((s) => (
          <article key={s.id} className="session-card">
            <span className="avatar avatar-pink xl" aria-hidden="true">{s.clientLabel.charAt(0)}</span>
            <div className="grow">
              <h3>{s.clientLabel} <span className={`badge ${s.status === "active" ? "green" : s.status === "completed" ? "grey" : "yellow"}`}>{s.status}</span></h3>
              <p className="meta">{s.topic}{s.lastMessage ? ` • ${s.lastMessage.slice(0, 60)}` : ""}</p>
            </div>
            <Link href={`/counseling/${s.id}`} className="btn btn-primary"><span>Buka Chat</span></Link>
          </article>
        ))}
      </div>
      {sessions.length === 0 ? <div className="empty"><h2>Belum ada sesi 🌱</h2></div> : null}
    </div>
  );
}

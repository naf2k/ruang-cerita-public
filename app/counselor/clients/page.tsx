import Link from "next/link";
import { getCounselorSessions } from "@/lib/actions/counselors";
import { requireUser } from "@/lib/auth";

export default async function CounselorClientsPage() {
  await requireUser(["counselor"]);
  const sessions = await getCounselorSessions();
  const byClient = new Map<string, { topic: string; status: string }>();
  for (const s of sessions) {
    if (!byClient.has(s.clientLabel)) byClient.set(s.clientLabel, { topic: s.topic, status: s.status });
  }
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/counselor">Counselor</Link> / Klien</p>
        <h1>Klienmu 🫂</h1>
        <p className="lede">Identitas disamarkan demi privasi.</p>
      </div>
      <div className="panel"><div className="table-wrap"><table className="data"><thead><tr><th>Klien</th><th>Topik</th><th>Status</th></tr></thead><tbody>
        {[...byClient].map(([label, v]) => (
          <tr key={label}><td>{label}</td><td>{v.topic}</td><td><span className="badge green">{v.status}</span></td></tr>
        ))}
      </tbody></table></div>
      {byClient.size === 0 ? <p className="muted">Belum ada klien. 🌱</p> : null}</div>
    </div>
  );
}

import Link from "next/link";
import { getMyCounselorProfile } from "@/lib/actions/counselors";
import { requireUser } from "@/lib/auth";

export default async function CounselorProfilePage() {
  await requireUser(["counselor"]);
  const p = await getMyCounselorProfile();
  if (!p) return <div className="container"><p className="muted">Profil counselor belum tersedia.</p></div>;
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/counselor">Counselor</Link> / Profil</p>
        <h1>Profil counselor 🌷</h1>
        <p className="lede">Kelola intro, spesialisasi, dan bahasa konselingmu lewat admin.</p>
      </div>
      <section className="panel">
        <h2>{p.display_name} {p.is_verified ? "✓" : ""}</h2>
        <p className="muted">Status: {p.availability_status} • Bahasa: {(p.languages ?? []).join(" / ")}</p>
        <p>“{p.bio}”</p>
        <div className="tags">{(p.specialties ?? []).map((t) => <span key={t}>{t}</span>)}</div>
      </section>
    </div>
  );
}

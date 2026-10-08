import type { Metadata } from "next";
import Link from "next/link";
import { ProfileEditor, LogoutButton } from "@/components/AccountPanels";
import { listMySessions } from "@/lib/actions/counseling";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Profilku", description: "Kelola profil, lihat riwayat konseling, dan atur akunmu." };

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

const STATUS_BADGE: Record<string, [string, string]> = {
  active: ["Aktif 🟢", "green"],
  pending: ["Menunggu ⏳", "yellow"],
  waiting: ["Menunggu 🟡", "yellow"],
  completed: ["✅ Selesai", "green"],
  cancelled: ["Dibatalkan", "grey"],
};

export default async function ProfilePage() {
  const me = await requireUser(["client"]);
  const sessions = await listMySessions();
  const ongoing = sessions.some((s) => s.status === "active" || s.status === "pending" || s.status === "waiting");

  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / Profil</p>
        <h1>Ruang kamu 👤</h1>
        <p className="lede">Semua ceritamu tersimpan rapi dan privat. Lanjutkan kapan aja tanpa mengulang dari awal. 🫶</p>
      </div>
      <div className="stack">
        <ProfileEditor
          displayName={me.profile.display_name ?? ""}
          email={me.profile.email ?? me.email ?? ""}
          lang={me.profile.preferred_language ?? "id"}
          avatarUrl={me.profile.avatar_url}
        />

        <section className="panel" aria-labelledby="riwayat-title">
          <h2 id="riwayat-title">Konseling Saya 💬</h2>
          <p className="muted">Riwayat sesi konselingmu. Isi percakapan tetap privat antara kamu dan counselor.</p>
          {sessions.length > 0 ? (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr><th scope="col">Tanggal</th><th scope="col">Counselor</th><th scope="col">Topik</th><th scope="col">Status</th><th scope="col">Aksi</th></tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 5).map((s) => {
                    const [label, cls] = STATUS_BADGE[s.status] ?? [s.status, "grey"];
                    return (
                      <tr key={s.id}>
                        <td>{fmtDate(s.created_at)}</td><td>{s.counselorName}</td><td>{s.topic}</td>
                        <td><span className={`badge ${cls}`}>{label}</span></td>
                        <td><Link href={`/counseling/${s.id}`}>Lihat →</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
          {!ongoing ? (
            <div className="empty">
              <h2>Tidak ada sesi yang sedang berjalan 🌱</h2>
              <p className="muted">Kalau butuh cerita lagi, kami ada di sini. 🫂</p>
              <p><Link className="btn btn-primary" href="/counseling/new"><span>Mulai Cerita</span><span className="btn-icon" aria-hidden="true">→</span></Link></p>
            </div>
          ) : null}
        </section>

        <section className="panel" aria-labelledby="akun-title">
          <h2 id="akun-title">Menu Akun ⚙️</h2>
          <nav className="profile-links" aria-label="Menu akun">
            <Link href="/counseling">💬 <span><strong>Konseling Saya</strong><small>Lihat semua sesi</small></span> →</Link>
            <Link href="/journal">📝 <span><strong>Journal</strong><small>Hanya kamu yang bisa baca</small></span> →</Link>
            <Link href="/mood">🌤️ <span><strong>Mood Saya</strong><small>Cek perasaan harian</small></span> →</Link>
            <Link href="/settings">⚙️ <span><strong>Pengaturan</strong><small>Notifikasi, bahasa, akun</small></span> →</Link>
            <Link href="/privacy">🔒 <span><strong>Privasi</strong><small>Bagaimana datamu dijaga</small></span> →</Link>
            <Link href="/help-now">🆘 <span><strong>Bantuan</strong><small>Butuh bantuan sekarang?</small></span> →</Link>
            <LogoutButton />
          </nav>
        </section>
      </div>
    </div>
  );
}

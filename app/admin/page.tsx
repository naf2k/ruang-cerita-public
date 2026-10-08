import type { Metadata } from "next";
import Link from "next/link";
import { AdminConsole } from "@/components/AdminConsole";
import { getAdminStats, listUsers, listCounselorAdmins, listSessionsAdmin } from "@/lib/actions/admin";
import { listAllArticles } from "@/lib/actions/articles";
import { listReports } from "@/lib/actions/reports";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", description: "Dashboard admin: pengguna, counselor, sesi, konten, laporan." };

export default async function AdminPage() {
  await requireUser(["admin"]);
  const [stats, users, counselors, sessions, articles, reports] = await Promise.all([
    getAdminStats(),
    listUsers(),
    listCounselorAdmins(),
    listSessionsAdmin(),
    listAllArticles(),
    listReports(),
  ]);
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / Admin</p>
        <h1>Admin 🛠️</h1>
        <p className="lede">Kelola pengguna, counselor, sesi, konten, dan laporan — semuanya dari satu tempat.</p>
      </div>
      <div className="stack">
        <AdminConsole stats={stats} users={users} counselors={counselors} sessions={sessions} articles={articles} reports={reports} />
      </div>
    </div>
  );
}

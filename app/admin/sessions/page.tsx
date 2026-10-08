import Link from "next/link";
import { AdminConsole } from "@/components/AdminConsole";
import { getAdminStats, listSessionsAdmin } from "@/lib/actions/admin";
import { requireUser } from "@/lib/auth";

export default async function AdminSessionsPage() {
  await requireUser(["admin"]);
  const [stats, sessions] = await Promise.all([getAdminStats(), listSessionsAdmin()]);
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/admin">Admin</Link> / Sesi</p>
        <h1>Sesi 💬</h1>
      </div>
      <div className="stack">
        <AdminConsole stats={stats} users={[]} counselors={[]} sessions={sessions} articles={[]} reports={[]} focus="sessions" />
      </div>
    </div>
  );
}

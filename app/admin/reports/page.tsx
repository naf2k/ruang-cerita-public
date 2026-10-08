import Link from "next/link";
import { AdminConsole } from "@/components/AdminConsole";
import { getAdminStats } from "@/lib/actions/admin";
import { listReports } from "@/lib/actions/reports";
import { requireUser } from "@/lib/auth";

export default async function AdminReportsPage() {
  await requireUser(["admin"]);
  const [stats, reports] = await Promise.all([getAdminStats(), listReports()]);
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/admin">Admin</Link> / Laporan</p>
        <h1>Laporan 🚩</h1>
      </div>
      <div className="stack">
        <AdminConsole stats={stats} users={[]} counselors={[]} sessions={[]} articles={[]} reports={reports} focus="reports" />
      </div>
    </div>
  );
}

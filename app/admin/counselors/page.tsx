import Link from "next/link";
import { AdminConsole } from "@/components/AdminConsole";
import { getAdminStats, listCounselorAdmins } from "@/lib/actions/admin";
import { requireUser } from "@/lib/auth";

export default async function AdminCounselorsPage() {
  await requireUser(["admin"]);
  const [stats, counselors] = await Promise.all([getAdminStats(), listCounselorAdmins()]);
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/admin">Admin</Link> / Counselor</p>
        <h1>Counselor 🌷</h1>
      </div>
      <div className="stack">
        <AdminConsole stats={stats} users={[]} counselors={counselors} sessions={[]} articles={[]} reports={[]} focus="counselors" />
      </div>
    </div>
  );
}

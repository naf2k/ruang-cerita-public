import Link from "next/link";
import { AdminConsole } from "@/components/AdminConsole";
import { getAdminStats, listUsers, listSessionsAdmin } from "@/lib/actions/admin";
import { requireUser } from "@/lib/auth";

export default async function AdminUsersPage() {
  await requireUser(["admin"]);
  const [stats, users, sessions] = await Promise.all([getAdminStats(), listUsers(), listSessionsAdmin()]);
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/admin">Admin</Link> / Pengguna</p>
        <h1>Pengguna 👥</h1>
      </div>
      <div className="stack">
        <AdminConsole stats={stats} users={users} counselors={[]} sessions={sessions} articles={[]} reports={[]} focus="users" />
      </div>
    </div>
  );
}

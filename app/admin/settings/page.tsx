import Link from "next/link";
import { AdminConsole } from "@/components/AdminConsole";
import { getAdminStats } from "@/lib/actions/admin";
import { requireUser } from "@/lib/auth";

export default async function AdminSettingsPage() {
  await requireUser(["admin"]);
  const stats = await getAdminStats();
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/admin">Admin</Link> / Pengaturan</p>
        <h1>Pengaturan ⚙️</h1>
      </div>
      <div className="stack">
        <AdminConsole stats={stats} users={[]} counselors={[]} sessions={[]} articles={[]} reports={[]} focus="settings" />
      </div>
    </div>
  );
}

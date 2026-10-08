import Link from "next/link";
import { AdminConsole } from "@/components/AdminConsole";
import { getAdminStats } from "@/lib/actions/admin";
import { listAllArticles } from "@/lib/actions/articles";
import { requireUser } from "@/lib/auth";

export default async function AdminContentPage() {
  await requireUser(["admin"]);
  const [stats, articles] = await Promise.all([getAdminStats(), listAllArticles()]);
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/admin">Admin</Link> / Konten</p>
        <h1>Konten 🌱</h1>
      </div>
      <div className="stack">
        <AdminConsole stats={stats} users={[]} counselors={[]} sessions={[]} articles={articles} reports={[]} focus="content" />
      </div>
    </div>
  );
}

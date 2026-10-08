import type { Metadata } from "next";
import Link from "next/link";
import { CounselingList, type CounselingItem } from "@/components/CounselingList";
import { listMySessions } from "@/lib/actions/counseling";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Konseling Saya", description: "Lihat semua sesi konselingmu: aktif, menunggu, selesai." };

const AVATARS = ["avatar avatar-pink xl", "avatar avatar-sky xl", "avatar avatar-mint xl"];

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default async function CounselingPage() {
  await requireUser(["client"]);
  const sessions = await listMySessions();
  const items: CounselingItem[] = sessions.map((s, i) => {
    const st = s.status === "active" ? "aktif" : s.status === "completed" || s.status === "cancelled" ? "selesai" : "menunggu";
    return {
      id: s.id,
      name: s.counselorName,
      badge: st === "aktif" ? "Aktif" : st === "menunggu" ? "Menunggu" : s.status === "cancelled" ? "Dibatalkan" : "Selesai",
      badgeCls: st === "aktif" ? "green" : st === "menunggu" ? "yellow" : "grey",
      meta: `${fmtDate(s.created_at)} • ${s.topic}${s.lastMessage ? ` • ${s.lastMessage.slice(0, 60)}` : ""}`,
      status: st,
      rawStatus: s.status,
      cta: st === "aktif" ? "Lanjut Chat" : st === "menunggu" ? "Lihat Sesi" : "Lihat Riwayat",
      primary: st === "aktif",
      avatarCls: AVATARS[i % AVATARS.length],
      initial: s.counselorInitial,
      unread: s.unread,
    };
  });

  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/profile">Profil</Link> / Konseling Saya</p>
        <h1>Konseling saya 💬</h1>
        <p className="lede">Semua sesimu di satu tempat. Lanjutkan kapan aja tanpa mengulang cerita dari awal.</p>
      </div>
      <CounselingList items={items} />
      <div className="center mb64">
        <Link href="/counseling/new" className="btn btn-secondary"><span>Cerita Baru</span><span className="btn-icon" aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}

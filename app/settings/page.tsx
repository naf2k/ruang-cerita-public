import type { Metadata } from "next";
import Link from "next/link";
import { SettingsManager } from "@/components/AccountPanels";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Pengaturan", description: "Atur notifikasi, bahasa, dan akun Ruang Ceritamu." };

export default async function SettingsPage() {
  const me = await requireUser();
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/profile">Profil</Link> / Pengaturan</p>
        <h1>Pengaturan ⚙️</h1>
        <p className="lede">Atur caramu menerima kabar dan bahasa yang paling nyaman.</p>
      </div>
      <div className="stack">
        <SettingsManager initialLang={me.profile.preferred_language ?? "id"} />
      </div>
    </div>
  );
}

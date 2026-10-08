import type { Metadata } from "next";
import Link from "next/link";
import { MoodTracker, type MoodRow } from "@/components/MoodTracker";
import { listMoods } from "@/lib/actions/mood";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Mood Saya", description: "Catat perasaan harianmu. Nggak ada skor, nggak ada diagnosis." };

function fmtShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export default async function MoodPage() {
  const me = await getCurrentUser();
  let initial: MoodRow[] = [];
  if (me) {
    const rows = await listMoods();
    initial = rows.map((r) => ({ date: fmtShort(r.created_at), mood: r.mood }));
  }
  return (
    <>
      <section className="page-hero" aria-labelledby="mood-title">
        <div className="container">
          <p className="crumbs"><Link href="/">Beranda</Link> / Mood Saya</p>
          <h1 id="mood-title">Gimana keadaanmu hari ini? 🌤️</h1>
          <p className="lede">Pilih yang paling dekat. Nggak ada skor, nggak ada diagnosis.</p>
        </div>
      </section>
      <section className="section pt-tight" aria-label="Catat mood">
        <MoodTracker initial={initial} loggedIn={!!me} />
      </section>
    </>
  );
}

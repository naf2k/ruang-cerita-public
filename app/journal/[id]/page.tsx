import type { Metadata } from "next";
import Link from "next/link";
import { DeleteJournalButton } from "@/components/DeleteJournalButton";
import { getJournal } from "@/lib/actions/journal";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Journal", description: "Salah satu cerita journal pribadimu." };

const EXAMPLE = {
  title: "Hari yang melelahkan tapi lega 🌱",
  meta: "20 September • 🙂 Baik — hanya kamu yang bisa membaca ini. 🔒",
  body: [
    "“Hari ini akhirnya aku berani cerita tentang masalahku. Awalnya deg-degan banget, tapi Kak Naya dengerin tanpa menghakimi. Rasanya kayak ada beban yang sedikit terangkat.”",
    "“PR-nya: nulis satu hal yang bikin bersyukur tiap malam. Kedengarannya sepele, tapi aku mau coba seminggu.”",
  ],
};

function fmtLong(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  } catch {
    return "";
  }
}

export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  const entry = me && id !== "contoh" ? await getJournal(id).catch(() => null) : null;

  const title = entry?.title ?? EXAMPLE.title;
  const meta = entry ? `${fmtLong(entry.created_at)}${entry.mood ? ` • ${entry.mood}` : ""} — hanya kamu yang bisa membaca ini. 🔒` : EXAMPLE.meta;
  const body = entry ? [entry.content] : EXAMPLE.body;

  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / <Link href="/journal">Journal</Link> / Cerita</p>
        <h1>{title}</h1>
        <p className="lede">{meta}</p>
      </div>
      <div className="stack narrow">
        <article className="journal-entry" aria-label={`Isi journal ${title}`}>
          {body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
        <div className="toolbar" role="group" aria-label="Aksi journal">
          <Link href="/journal" className="btn btn-secondary"><span>Kembali ke Journal</span></Link>
          {entry ? <DeleteJournalButton id={entry.id} /> : null}
        </div>
      </div>
    </div>
  );
}

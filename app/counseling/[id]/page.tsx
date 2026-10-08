import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatRoom, type ChatInitial } from "@/components/ChatRoom";
import { getSessionDetail, listMySessions } from "@/lib/actions/counseling";
import { getCounselorSessions, getSessionNote } from "@/lib/actions/counselors";

export const metadata: Metadata = { title: "Chat", description: "Chat realtime dengan counselor manusia. Aman, hangat, tanpa dihakimi." };

const STATUS_META: Record<string, string> = {
  active: "Aktif 🟢",
  pending: "Menunggu ⏳",
  waiting: "Menunggu 🟡",
  completed: "Selesai ✓",
  cancelled: "Dibatalkan",
};

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getSessionDetail(id);
  if (!detail) notFound();

  const topics = detail.request?.topic ?? [];
  const initial: ChatInitial = {
    sessionId: detail.session.id,
    meId: detail.isClient ? detail.session.client_id : (detail.session.counselor_id ?? ""),
    isClient: detail.isClient,
    peerName: detail.isClient ? detail.counselorName : detail.clientLabel,
    peerAvatar: detail.isClient ? detail.counselorAvatar : detail.clientLabel.trim().charAt(0).toUpperCase(),
    peerStatus: detail.isClient
      ? `${detail.counselorStatus === "available" ? "🟢 Tersedia" : detail.counselorStatus === "busy" ? "🟡 Sibuk" : "⚪ Offline"} • Counselor`
      : `${STATUS_META[detail.session.status] ?? detail.session.status} • Anonim`,
    topic: topics.join(", ") || "-",
    status: detail.session.status,
    statusMeta: STATUS_META[detail.session.status] ?? detail.session.status,
    messages: (detail.messages ?? []).map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      message: m.message,
      attachment_url: m.attachment_url,
      created_at: m.created_at,
    })),
    reflection: detail.reflection
      ? { mood_after: detail.reflection.mood_after, reflection: detail.reflection.reflection }
      : null,
    sessions: [],
    intake: detail.request
      ? {
          topics,
          story: detail.request.description ?? "",
          support: detail.request.support_type ?? "",
          mood: detail.request.mood,
        }
      : null,
    counselorNote: detail.isClient ? undefined : await getSessionNote(detail.session.id).catch(() => ({ notes: "" as string, actionPoints: [] as string[] })),
  };

  if (detail.isClient) {
    const mine = await listMySessions();
    initial.sessions = mine.map((s) => ({ id: s.id, name: s.counselorName, sub: STATUS_META[s.status] ?? s.status, unread: s.unread }));
  } else {
    const rows = await getCounselorSessions().catch(() => []);
    initial.sessions = rows.map((s) => ({ id: s.id, name: s.clientLabel, sub: `${s.topic} • ${STATUS_META[s.status] ?? s.status}`, unread: s.unread }));
  }

  return (
    <>
      <section className="page-hero" aria-labelledby="chat-title">
        <div className="container">
          <p className="crumbs"><Link href="/">Beranda</Link> / Chat</p>
          <h1 id="chat-title">Chat dengan counselor 💬</h1>
          <p className="lede">Manusia beneran yang siap dengerin. Pilih sesi di kiri, ngobrol di kanan.</p>
        </div>
      </section>
      <div className="container">
        <ChatRoom initial={initial} />
      </div>
    </>
  );
}

import { StartChatButton } from "./StartChatButton";

export interface CounselorView {
  userId?: string;
  name: string;
  initial: string;
  avatarClass: string;
  avatarEmoji?: string;
  status: "available" | "busy" | "offline";
  statusLabel: string;
  tags: string[];
  topics: string;
  quote: string;
  lang: string;
  queueNote?: string;
}

function statusEmoji(s: CounselorView["status"]) {
  return s === "available" ? "🟢" : s === "busy" ? "🟡" : "⚪";
}

export function CounselorCard({ c }: { c: CounselorView }) {
  const available = c.status === "available";
  const busy = c.status === "busy";
  return (
    <article className="c-card" id={`c-${c.name}`}>
      <div className="c-top">
        <span className={c.avatarClass} aria-hidden="true">
          {c.avatarEmoji ?? c.initial}
        </span>
        <span className={`status ${c.status === "available" ? "online" : c.status === "busy" ? "busy" : ""}`}>
          <span aria-hidden="true">{statusEmoji(c.status)}</span> {c.statusLabel}
        </span>
      </div>
      <h3>{c.name}</h3>
      <p className="role">Counselor • Terverifikasi ✓</p>
      <div className="tags">
        {c.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      {c.quote ? <p className="quote">{c.quote}</p> : null}
      <p className="lang">{c.lang}</p>
      {available ? (
        <StartChatButton counselorUserId={c.userId} label="Mulai Chat" />
      ) : busy ? (
        <>
          <StartChatButton counselorUserId={c.userId} label="Gabung Antrian" className="btn btn-secondary full" pendingLabel="Menyimpan…" />
          {c.queueNote ? <p className="tiny muted">{c.queueNote}</p> : null}
        </>
      ) : (
        <button type="button" className="btn btn-secondary full is-disabled" disabled aria-label={`${c.name} sedang offline, segera kembali`}>
          <span>Segera kembali</span>
        </button>
      )}
    </article>
  );
}

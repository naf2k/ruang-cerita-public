"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import type { getAdminStats, listUsers, listCounselorAdmins, listSessionsAdmin } from "@/lib/actions/admin";
import type { listAllArticles } from "@/lib/actions/articles";
import type { listReports } from "@/lib/actions/reports";
import { setUserStatus, setCounselorVerified, adminCreateCounselor, adminUpdateCounselor } from "@/lib/actions/admin";
import { setArticleStatus, createArticle, updateArticle, deleteArticle } from "@/lib/actions/articles";
import { resolveReport } from "@/lib/actions/reports";

type Stats = Awaited<ReturnType<typeof getAdminStats>>;
type User = Awaited<ReturnType<typeof listUsers>>[number];
type Couns = Awaited<ReturnType<typeof listCounselorAdmins>>[number];
type Sess = Awaited<ReturnType<typeof listSessionsAdmin>>[number];
type Art = Awaited<ReturnType<typeof listAllArticles>>[number];
type Rep = Awaited<ReturnType<typeof listReports>>[number];

export type AdminFocus = "all" | "users" | "counselors" | "sessions" | "content" | "reports" | "settings";

const CATS = ["relationship", "family", "student", "self"];

export function AdminConsole({
  stats,
  users: initialUsers,
  counselors: initialCounselors,
  sessions,
  articles: initialArticles,
  reports: initialReports,
  focus = "all",
}: {
  stats: Stats;
  users: User[];
  counselors: Couns[];
  sessions: Sess[];
  articles: Art[];
  reports: Rep[];
  focus?: AdminFocus;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [counselors, setCounselors] = useState(initialCounselors);
  const [articles, setArticles] = useState(initialArticles);
  const [reports, setReports] = useState(initialReports);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [live, setLive] = useState("");
  const [userQ, setUserQ] = useState("");
  const [sessF, setSessF] = useState("all");
  const [form, setForm] = useState({ title: "", category: "relationship", excerpt: "", content: "", coverEmoji: "🌱" });
  const [newC, setNewC] = useState({ email: "", password: "", name: "", bio: "", specs: "", lang: "id", avail: "available" });
  const [editC, setEditC] = useState<string | null>(null);
  const [editCForm, setEditCForm] = useState({ name: "", bio: "", specs: "", lang: "id", avail: "available" });
  const [editA, setEditA] = useState<string | null>(null);
  const [editAForm, setEditAForm] = useState({ title: "", category: "relationship", excerpt: "", content: "" });

  const show = (s: AdminFocus) => focus === "all" || focus === s;
  const shownUsers = users.filter((u) => `${u.display_name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(userQ.toLowerCase()));
  const shownSess = sessions.filter((s) => sessF === "all" || s.status === sessF);
  const pendingReports = reports.filter((r) => r.status === "pending").length;

  // Optimistic toggle: UI langsung berubah, server menyusul; gagal → kembalikan.
  async function toggleUser(u: User) {
    const next = u.status === "active" ? "suspended" : "active";
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: next } : x)));
    setBusyKey(`user:${u.id}`);
    const res = await setUserStatus(u.id, next as "active" | "suspended");
    setBusyKey(null);
    if (res.ok) {
      setLive(`Status ${u.display_name} diubah menjadi ${next === "active" ? "Aktif" : "Ditangguhkan"}.`);
    } else {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: u.status } : x)));
      setLive(res.message);
    }
  }

  async function toggleVerify(c: Couns) {
    setCounselors((prev) => prev.map((x) => (x.user_id === c.user_id ? { ...x, is_verified: !x.is_verified } : x)));
    setBusyKey(`couns:${c.user_id}`);
    const res = await setCounselorVerified(c.user_id, !c.is_verified);
    setBusyKey(null);
    if (res.ok) {
      setLive(c.is_verified ? `${c.display_name} dinonaktifkan.` : `${c.display_name} diverifikasi ✓`);
    } else {
      setCounselors((prev) => prev.map((x) => (x.user_id === c.user_id ? { ...x, is_verified: c.is_verified } : x)));
      setLive(res.message);
    }
  }

  async function toggleArticle(a: Art) {
    const next = a.status === "published" ? "draft" : "published";
    setArticles((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
    setBusyKey(`art:${a.id}`);
    const res = await setArticleStatus(a.id, next as "draft" | "published");
    setBusyKey(null);
    if (res.ok) setLive(`Artikel diubah menjadi ${next === "published" ? "Terbit" : "Draf"}.`);
    else {
      setArticles((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)));
      setLive(res.message);
    }
  }

  async function resolveRep(r: Rep) {
    setReports((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: "resolved" } : x)));
    setBusyKey(`rep:${r.id}`);
    const res = await resolveReport(r.id);
    setBusyKey(null);
    if (res.ok) setLive("Laporan ditandai selesai.");
    else {
      setReports((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: r.status } : x)));
      setLive(res.message);
    }
  }

  async function removeArticle(a: Art) {
    if (!confirm("Hapus artikel ini permanen?")) return;
    setArticles((prev) => prev.filter((x) => x.id !== a.id));
    setBusyKey(`artdel:${a.id}`);
    const res = await deleteArticle(a.id);
    setBusyKey(null);
    if (res.ok) {
      setLive("Artikel dihapus.");
      router.refresh();
    } else {
      setArticles((prev) => [a, ...prev]);
      setLive(res.message);
    }
  }

  return (
    <>
      <p className="tiny muted" role="status" aria-live="polite">
        {live || `Menunggu ${pendingReports} laporan • Sistem normal 🟢`}
      </p>

      {show("all") ? (
        <section aria-labelledby="over-title">
          <h2 id="over-title" className="sec-title">Ringkasan 📊</h2>
          <div className="dash-grid">
            <div className="stat"><strong>{stats.totalUsers}</strong><span>👥 Total Pengguna</span></div>
            <div className="stat"><strong>{stats.activeCounselors}</strong><span>🌷 Counselor Aktif</span></div>
            <div className="stat"><strong>{stats.activeSessions}</strong><span>🟢 Sesi Aktif</span></div>
            <div className="stat"><strong>{stats.completedSessions}</strong><span>✅ Sesi Selesai</span></div>
            <div className="stat"><strong>{stats.pendingReports}</strong><span>🚩 Laporan Menunggu</span></div>
            <div className="stat"><strong>🟢 Normal</strong><span>⚙️ Status Sistem</span></div>
          </div>
        </section>
      ) : null}

      {show("users") ? (
        <section className="panel" aria-labelledby="users-title">
          <h2 id="users-title" className="sec-title">Pengguna 👥</h2>
          <div className="toolbar">
            <label className="tiny muted lbl-inline" htmlFor="userSearch">Cari user</label>
            <input id="userSearch" type="search" placeholder="Ketik nama atau email…" autoComplete="off" value={userQ} onChange={(e) => setUserQ(e.target.value)} />
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">Nama</th><th scope="col">Email</th><th scope="col">Peran</th><th scope="col">Sesi</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead>
              <tbody>
                {shownUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.display_name}</td><td>{u.email}</td><td>{u.role}</td>
                    <td>{sessions.length ? sessions.filter((s) => s.client_id === u.id).length : "—"}</td>
                    <td><span className={`badge ${u.status === "active" ? "green" : "grey"}`}>{u.status === "active" ? "Aktif" : u.status === "suspended" ? "Ditangguhkan" : "Nonaktif"}</span></td>
                    <td>
                      <button type="button" className="btn btn-secondary btn-sm" disabled={busyKey === `user:${u.id}`} onClick={() => toggleUser(u)}>
                        {busyKey === `user:${u.id}` ? "…" : u.status === "active" ? "Tangguhkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {show("counselors") ? (
        <section className="panel" aria-labelledby="couns-title">
          <h2 id="couns-title" className="sec-title">Counselor 🌷</h2>
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusyKey("couns:new");
              const res = await adminCreateCounselor({
                email: newC.email,
                password: newC.password,
                displayName: newC.name,
                bio: newC.bio,
                specialties: newC.specs.split(","),
                languages: newC.lang === "both" ? ["id", "en"] : [newC.lang],
                availability: newC.avail,
              });
              setBusyKey(null);
              if (res.ok) {
                setNewC({ email: "", password: "", name: "", bio: "", specs: "", lang: "id", avail: "available" });
                setLive("Akun counselor dibuat + terverifikasi ✓");
                router.refresh();
              } else setLive(res.message);
            }}
          >
            <div className="toolbar" style={{ margin: 0 }}>
              <input value={newC.email} onChange={(e) => setNewC({ ...newC, email: e.target.value })} placeholder="Email counselor" type="email" aria-label="Email counselor" />
              <input value={newC.password} onChange={(e) => setNewC({ ...newC, password: e.target.value })} placeholder="Kata sandi (min 8)" type="password" aria-label="Kata sandi counselor" />
              <input value={newC.name} onChange={(e) => setNewC({ ...newC, name: e.target.value })} placeholder="Nama, mis. 🌷 Kak Baru" aria-label="Nama counselor" />
            </div>
            <input value={newC.bio} onChange={(e) => setNewC({ ...newC, bio: e.target.value })} placeholder="Intro singkat…" aria-label="Intro counselor" />
            <div className="toolbar" style={{ margin: 0 }}>
              <input value={newC.specs} onChange={(e) => setNewC({ ...newC, specs: e.target.value })} placeholder="Spesialisasi koma, mis. ❤️ Relationship, 🏠 Family" aria-label="Spesialisasi" />
              <select value={newC.lang} onChange={(e) => setNewC({ ...newC, lang: e.target.value })} aria-label="Bahasa">
                <option value="id">🇮🇩 Indonesia</option>
                <option value="en">🇬🇧 Inggris</option>
                <option value="both">🇮🇩🇬🇧 Keduanya</option>
              </select>
              <select value={newC.avail} onChange={(e) => setNewC({ ...newC, avail: e.target.value })} aria-label="Availability">
                <option value="available">🟢 Tersedia</option>
                <option value="busy">🟡 Sibuk</option>
                <option value="offline">⚪ Offline</option>
              </select>
            </div>
            <p><button type="submit" className="btn btn-primary btn-sm" disabled={busyKey === "couns:new"}>{busyKey === "couns:new" ? "Menyimpan…" : "＋ Counselor Baru"}</button></p>
          </form>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">Nama</th><th scope="col">Spesialisasi</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead>
              <tbody>
                {counselors.map((c) => (
                  <Fragment key={c.id}>
                    <tr>
                      <td>{c.display_name}</td><td>{(c.specialties ?? []).join(" · ")}</td>
                      <td><span className={`badge ${c.is_verified ? "green" : "yellow"}`}>{c.is_verified ? "Terverifikasi ✓" : "⏳ Menunggu verifikasi"}</span></td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-secondary btn-sm" disabled={busyKey === `couns:${c.user_id}`} onClick={() => toggleVerify(c)}>
                            {busyKey === `couns:${c.user_id}` ? "…" : c.is_verified ? "Nonaktifkan" : "Verifikasi"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              if (editC === c.user_id) setEditC(null);
                              else {
                                setEditC(c.user_id);
                                setEditCForm({ name: c.display_name, bio: "", specs: (c.specialties ?? []).join(", "), lang: "id", avail: "available" });
                              }
                            }}
                          >
                            Ubah
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editC === c.user_id ? (
                      <tr>
                        <td colSpan={4}>
                          <form
                            className="form-grid"
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setBusyKey(`counsedit:${c.user_id}`);
                              const res = await adminUpdateCounselor({
                                userId: c.user_id,
                                displayName: editCForm.name,
                                bio: editCForm.bio || undefined,
                                specialties: editCForm.specs.split(","),
                                languages: editCForm.lang === "both" ? ["id", "en"] : [editCForm.lang],
                                availability: editCForm.avail,
                              });
                              setBusyKey(null);
                              if (res.ok) {
                                setCounselors((prev) =>
                                  prev.map((x) =>
                                    x.user_id === c.user_id
                                      ? {
                                          ...x,
                                          display_name: editCForm.name,
                                          specialties: editCForm.specs.split(",").map((s) => s.trim()).filter(Boolean),
                                        }
                                      : x
                                  )
                                );
                                setEditC(null);
                                setLive("Profil counselor diperbarui.");
                              } else setLive(res.message);
                            }}
                          >
                            <div className="toolbar" style={{ margin: 0 }}>
                              <input value={editCForm.name} onChange={(e) => setEditCForm({ ...editCForm, name: e.target.value })} aria-label="Nama" />
                              <input value={editCForm.specs} onChange={(e) => setEditCForm({ ...editCForm, specs: e.target.value })} aria-label="Spesialisasi koma" />
                              <select value={editCForm.lang} onChange={(e) => setEditCForm({ ...editCForm, lang: e.target.value })} aria-label="Bahasa">
                                <option value="id">🇮🇩 Indonesia</option>
                                <option value="en">🇬🇧 Inggris</option>
                                <option value="both">🇮🇩🇬🇧 Keduanya</option>
                              </select>
                              <select value={editCForm.avail} onChange={(e) => setEditCForm({ ...editCForm, avail: e.target.value })} aria-label="Availability">
                                <option value="available">🟢 Tersedia</option>
                                <option value="busy">🟡 Sibuk</option>
                                <option value="offline">⚪ Offline</option>
                              </select>
                            </div>
                            <input value={editCForm.bio} onChange={(e) => setEditCForm({ ...editCForm, bio: e.target.value })} placeholder="Intro baru (kosongkan bila tak diubah)…" aria-label="Intro" />
                            <p><button type="submit" className="btn btn-primary btn-sm" disabled={busyKey === `counsedit:${c.user_id}`}>Simpan</button></p>
                          </form>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {show("sessions") ? (
        <section className="panel" aria-labelledby="sess-title">
          <h2 id="sess-title" className="sec-title">Sesi 💬</h2>
          <div className="toolbar" role="group" aria-label="Filter status sesi">
            {["all", "active", "pending", "waiting", "completed", "cancelled"].map((f) => (
              <button key={f} type="button" className={`chip${sessF === f ? " picked" : ""}`} aria-pressed={sessF === f} onClick={() => setSessF(f)}>
                {f === "all" ? "Semua" : f}
              </button>
            ))}
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">ID Sesi</th><th scope="col">Klien</th><th scope="col">Counselor</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {shownSess.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id.slice(0, 8)}…</td><td>{s.clientName}</td><td>{s.counselorName}</td>
                    <td><span className={`badge ${s.status === "active" ? "green" : s.status === "pending" || s.status === "waiting" ? "yellow" : "grey"}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {show("content") ? (
        <section className="panel" aria-labelledby="konten-title">
          <h2 id="konten-title" className="sec-title">Konten Ruang Baca 🌱</h2>
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusyKey("art:new");
              const res = await createArticle(form);
              setBusyKey(null);
              if (res.ok) {
                setForm({ title: "", category: "relationship", excerpt: "", content: "", coverEmoji: "🌱" });
                setLive("Artikel draf baru ditambahkan.");
                router.refresh();
              } else setLive(res.message);
            }}
          >
            <label htmlFor="art-title">Judul</label>
            <input id="art-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul artikel…" />
            <label htmlFor="art-cat">Kategori</label>
            <select id="art-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label htmlFor="art-ex">Ringkasan</label>
            <input id="art-ex" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Satu kalimat hangat…" />
            <label htmlFor="art-content">Isi</label>
            <textarea id="art-content" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Tulis dengan hangat, tanpa diagnosis…" />
            <p><button type="submit" className="btn btn-primary btn-sm" disabled={busyKey === "art:new"}>＋ Artikel Baru (draf)</button></p>
          </form>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">Judul</th><th scope="col">Kategori</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead>
              <tbody>
                {articles.map((a) => (
                  <Fragment key={a.id}>
                    <tr>
                      <td>{a.title}</td><td>{a.category}</td>
                      <td><span className={`badge ${a.status === "published" ? "green" : "yellow"}`}>{a.status === "published" ? "Terbit" : "Draf"}</span></td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-secondary btn-sm" disabled={busyKey === `art:${a.id}`} onClick={() => toggleArticle(a)}>
                            {busyKey === `art:${a.id}` ? "…" : a.status === "published" ? "Jadikan Draf" : "Terbitkan"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              if (editA === a.id) setEditA(null);
                              else {
                                setEditA(a.id);
                                setEditAForm({ title: a.title, category: a.category, excerpt: a.excerpt ?? "", content: a.content ?? "" });
                              }
                            }}
                          >
                            Ubah
                          </button>
                          <button type="button" className="btn btn-ghost btn-sm" disabled={busyKey === `artdel:${a.id}`} onClick={() => removeArticle(a)}>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editA === a.id ? (
                      <tr>
                        <td colSpan={4}>
                          <form
                            className="form-grid"
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setBusyKey(`artedit:${a.id}`);
                              const res = await updateArticle({ id: a.id, ...editAForm });
                              setBusyKey(null);
                              if (res.ok) {
                                setArticles((prev) => prev.map((x) => (x.id === a.id ? { ...x, ...editAForm } : x)));
                                setEditA(null);
                                setLive("Artikel diperbarui.");
                              } else setLive(res.message);
                            }}
                          >
                            <div className="toolbar" style={{ margin: 0 }}>
                              <input value={editAForm.title} onChange={(e) => setEditAForm({ ...editAForm, title: e.target.value })} aria-label="Judul" />
                              <select value={editAForm.category} onChange={(e) => setEditAForm({ ...editAForm, category: e.target.value })} aria-label="Kategori">
                                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <input value={editAForm.excerpt} onChange={(e) => setEditAForm({ ...editAForm, excerpt: e.target.value })} aria-label="Ringkasan" />
                            <textarea rows={4} value={editAForm.content} onChange={(e) => setEditAForm({ ...editAForm, content: e.target.value })} aria-label="Isi artikel" />
                            <p><button type="submit" className="btn btn-primary btn-sm" disabled={busyKey === `artedit:${a.id}`}>Simpan</button></p>
                          </form>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {show("reports") ? (
        <section className="panel" aria-labelledby="lap-title">
          <h2 id="lap-title" className="sec-title">Laporan 🚩</h2>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th scope="col">Alasan</th><th scope="col">Target</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.reason}{r.description ? ` — ${r.description.slice(0, 80)}` : ""}</td>
                    <td>{r.target_type}{r.target_id ? ` • ${r.target_id.slice(0, 12)}` : ""}</td>
                    <td><span className={`badge ${r.status === "resolved" ? "green" : "yellow"}`}>{r.status === "resolved" ? "✅ Selesai" : "⏳ Menunggu"}</span></td>
                    <td>
                      <button type="button" className="btn btn-secondary btn-sm" disabled={busyKey === `rep:${r.id}` || r.status === "resolved"} onClick={() => resolveRep(r)}>
                        {busyKey === `rep:${r.id}` ? "…" : r.status === "resolved" ? "Selesai ✓" : "Tandai selesai"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reports.length === 0 ? <p className="muted">Belum ada laporan. 🌱</p> : null}
        </section>
      ) : null}

      {show("settings") ? (
        <section className="panel" aria-labelledby="cfg-title">
          <h2 id="cfg-title" className="sec-title">Konfigurasi ⚙️</h2>
          <p className="muted">Platform berjalan di Next.js + Supabase (Auth, Postgres + RLS, Realtime, Storage). Kunci rahasia hanya tersimpan di environment server.</p>
          <ul>
            <li>Auth: email/password (magic link & Google OAuth opsional, aktifkan di dashboard Supabase).</li>
            <li>Realtime: channel per sesi untuk chat.</li>
            <li>Storage: avatars (publik), chat-attachments (privat per sesi), article-covers (publik).</li>
          </ul>
        </section>
      ) : null}
    </>
  );
}

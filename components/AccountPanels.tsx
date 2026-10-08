"use client";

import { useState, useTransition } from "react";
import { updateMyProfile, uploadAvatar, signOut, deactivateMyAccount } from "@/lib/actions/profile";

export function ProfileEditor({
  displayName,
  email,
  lang,
  avatarUrl,
}: {
  displayName: string;
  email: string;
  lang: string;
  avatarUrl: string | null;
}) {
  const [nick, setNick] = useState(displayName);
  const [language, setLanguage] = useState(lang);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateMyProfile({ displayName: nick, preferredLanguage: language });
      setMsg(res.ok ? "Tersimpan ✓ Profilmu sudah diperbarui." : res.message);
    });
  }

  async function onAvatar(file: File) {
    const fd = new FormData();
    fd.append("avatar", file);
    start(async () => {
      const res = await uploadAvatar(fd);
      setMsg(res.ok ? "Foto profil diperbarui ✓" : res.message);
    });
  }

  return (
    <section className="panel" aria-labelledby="kartu-title">
      <h2 id="kartu-title">Profilku 🌷</h2>
      <div className="profile-card">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Foto profil" width={52} height={52} style={{ borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <span className="avatar avatar-pink xl" aria-hidden="true">
            {(nick.trim().charAt(0) || "A").toUpperCase()}
          </span>
        )}
        <div className="who">
          <strong>{nick}</strong>
          <span>{email}</span>
          <span>{language === "id" ? "🇮🇩 Bahasa Indonesia" : "🇬🇧 English"}</span>
        </div>
      </div>
      <form className="form-grid" onSubmit={save}>
        <label htmlFor="nickInput">Nama panggilan</label>
        <input id="nickInput" type="text" value={nick} maxLength={40} autoComplete="nickname" onChange={(e) => setNick(e.target.value)} />
        <label htmlFor="langSelect">Bahasa</label>
        <select id="langSelect" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="id">🇮🇩 Bahasa Indonesia</option>
          <option value="en">🇬🇧 English</option>
        </select>
        <label htmlFor="avatarInput">Foto profil <span className="muted">(opsional, maks 2 MB)</span></label>
        <input
          id="avatarInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onAvatar(f);
            e.target.value = "";
          }}
        />
        <p><button className="btn btn-primary" type="submit" disabled={pending}>💾 Simpan</button></p>
      </form>
      <p className="tiny muted" role="status">{msg}</p>
    </section>
  );
}

export function SettingsManager({ initialLang }: { initialLang: string }) {
  const [s, setS] = useState({ msg: true, req: true, done: true, browser: false, lang: initialLang });
  const [saved, setSaved] = useState("");
  const [notif, setNotif] = useState("");
  const [del, setDel] = useState("");
  const [pending, start] = useTransition();

  function saveLang() {
    start(async () => {
      const res = await updateMyProfile({ displayName: "", preferredLanguage: s.lang });
      try {
        localStorage.setItem("rc-settings", JSON.stringify(s));
      } catch {}
      setSaved(res.ok ? "Pengaturan tersimpan. 🌱" : res.message);
    });
  }

  function deactivate() {
    if (!confirm("Nonaktifkan akun dan hentikan aksesmu secara permanen? Tindakan ini tidak bisa dibatalkan sendiri.")) {
      setDel("Batal menonaktifkan. Akunmu aman. 💛");
      return;
    }
    start(async () => {
      await deactivateMyAccount();
    });
  }

  return (
    <>
      <section className="panel" aria-labelledby="notif-title">
        <h2 id="notif-title">Notifikasi 🔔</h2>
        <p className="muted">Pilih kabar yang ingin kamu terima. Email menyusul di tahap berikutnya.</p>
        <div className="form-grid">
          {(
            [
              ["msg", "Pesan konseling baru"],
              ["req", "Update permintaan konseling"],
              ["done", "Sesi selesai"],
              ["browser", "Notifikasi browser (jika diizinkan)"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="check-row">
              <input
                type="checkbox"
                checked={!!s[k]}
                onChange={async (e) => {
                  const v = e.target.checked;
                  if (k === "browser" && v && typeof Notification !== "undefined" && Notification.permission === "default") {
                    try {
                      await Notification.requestPermission();
                    } catch {}
                  }
                  setS((prev) => ({ ...prev, [k]: v }));
                  try {
                    localStorage.setItem("rc-settings", JSON.stringify({ ...s, [k]: v }));
                  } catch {}
                  setNotif("Pilihan notifikasi diperbarui otomatis.");
                }}
              />{" "}
              {label}
            </label>
          ))}
        </div>
        <p className="tiny muted" role="status" aria-live="polite">{notif}</p>
      </section>

      <section className="panel" aria-labelledby="lang-title">
        <h2 id="lang-title">Bahasa 🌐</h2>
        <div className="form-grid">
          <label htmlFor="lang">Bahasa utama</label>
          <select id="lang" value={s.lang} onChange={(e) => setS((v) => ({ ...v, lang: e.target.value }))}>
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
        <p className="mt16">
          <button type="button" className="btn btn-primary" onClick={saveLang} disabled={pending}>
            <span>{pending ? "Menyimpan…" : "Simpan Pengaturan"}</span>
          </button>
        </p>
        <p className="tiny muted" role="status" aria-live="polite">{saved}</p>
      </section>

      <section className="danger-zone" id="hapus" aria-labelledby="hapus-title">
        <h2 id="hapus-title">Nonaktifkan akun 🗑️</h2>
        <p>Menonaktifkan akun akan menghentikan aksesmu ke profil, sesi, journal, dan mood. Hubungi bantuan bila ingin menghapus data permanen.</p>
        <p><button type="button" className="btn btn-secondary" onClick={deactivate} disabled={pending}><span>Nonaktifkan Akunku</span></button></p>
        <p className="tiny" role="status" aria-live="polite">{del}</p>
      </section>
    </>
  );
}

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="plain-link"
      style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer", textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: 12, minHeight: 60 }}
      disabled={pending}
      onClick={() => start(async () => await signOut())}
    >
      👋 <span><strong>Keluar</strong><small style={{ display: "block" }} className="muted">Sampai jumpa lagi, jaga dirimu baik-baik</small></span> <span style={{ marginLeft: "auto" }}>→</span>
    </button>
  );
}

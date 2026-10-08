"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SUSPENDED_MSG =
  "Akunmu sedang ditangguhkan atau dinonaktifkan. Kalau kamu merasa ini keliru, hubungi bantuan ya — kami siap membantu. 💛";

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}

function LoginFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("suspended") === "1") setErr(SUSPENDED_MSG);
    // Sesi basi (mis. akun ditangguhkan saat sedang login): rapikan tanpa loop.
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;
        const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", data.session.user.id).single();
        if (!profile || profile.status !== "active") {
          await supabase.auth.signOut();
          setErr(SUSPENDED_MSG);
          router.refresh();
        }
      } catch {}
    })();
  }, [params, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const password = String(fd.get("password") || "");
    if (!email) return setErr("Isi email kamu dulu.");
    if (!password) return setErr("Kata sandinya belum diisi.");
    if (password.length < 8) return setErr("Kata sandi minimal 8 karakter.");
    setLoading(true);
    try {
      // Coba Supabase Auth bila env tersedia; fallback ke demo bila belum dikonfigurasi.
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Arahkan langsung ke dasbor sesuai peran (middleware juga menegakkan ini).
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", data.user.id).single();
          if (!profile || profile.status !== "active") {
            await supabase.auth.signOut();
            setErr(SUSPENDED_MSG);
            return;
          }
          if (profile?.role === "admin") {
            router.push("/admin");
            return;
          }
          if (profile?.role === "counselor") {
            router.push("/counselor");
            return;
          }
        }
      }
      router.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? `Belum bisa masuk: ${e.message}` : "Belum bisa masuk. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" autoComplete="email" placeholder="kamu@contoh.id" required aria-describedby="email-hint" />
        <p className="hint" id="email-hint">
          Pakai email yang kamu daftarkan.
        </p>
      </div>
      <div className="field">
        <label htmlFor="password">Kata sandi</label>
        <div className="pw-row">
          <input type={show ? "text" : "password"} id="password" name="password" autoComplete="current-password" placeholder="Kata sandimu" required minLength={8} />
          <button type="button" className="btn btn-secondary btn-sm pw-toggle" aria-pressed={show} onClick={() => setShow((v) => !v)}>
            {show ? "Sembunyi" : "Lihat"}
          </button>
        </div>
        <p className="hint">Minimal 8 karakter.</p>
      </div>
      {err ? (
        <p className="form-error" role="alert">
          {err}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg full" disabled={loading}>
        {loading ? "Masuk…" : "Masuk"}
      </button>
      <p className="auth-alt muted">
        Lupa kata sandi? <Link href="mailto:halo@ruangcerita.id?subject=Reset%20kata%20sandi">Minta reset via email</Link>
      </p>
      <p className="auth-alt">
        Belum punya ruang? <Link href="/register">Daftar dulu</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setInfo("");
    const fd = new FormData(e.currentTarget);
    const nama = String(fd.get("nama") || "").trim();
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const pw = String(fd.get("password") || "");
    const pw2 = String(fd.get("password2") || "");
    const setuju = fd.get("setuju") === "on";
    if (!nama) return setErr("Isi nama panggilanmu dulu.");
    if (!email) return setErr("Isi email kamu dulu.");
    if (pw.length < 8) return setErr("Kata sandi minimal 8 karakter.");
    if (pw2 !== pw) return setErr("Ulangi kata sandi belum sama. Coba lagi pelan-pelan.");
    if (!setuju) return setErr("Centang persetujuan dulu sebelum lanjut.");
    setLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { data: { display_name: nama } },
        });
        if (error) throw error;
        if (!data.session) {
          // Proyek mewajibkan verifikasi email: arahkan ke login setelah konfirmasi.
          setInfo("Akunmu dibuat 🌱 Cek email untuk konfirmasi, lalu masuk di sini ya.");
          return;
        }
      }
      try {
        localStorage.setItem("rc-profile", JSON.stringify({ nick: nama, lang: "id" }));
      } catch {}
      router.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? `Belum bisa daftar: ${e.message}` : "Belum bisa daftar. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="nama">Nama panggilan</label>
        <input type="text" id="nama" name="nama" autoComplete="nickname" placeholder="Panggil aku…" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" autoComplete="email" placeholder="kamu@contoh.id" required />
      </div>
      <div className="field">
        <label htmlFor="password">Kata sandi</label>
        <input type="password" id="password" name="password" autoComplete="new-password" placeholder="Minimal 8 karakter" required minLength={8} />
        <p className="hint">Minimal 8 karakter. Jangan pakai tanggal lahirmu.</p>
      </div>
      <div className="field">
        <label htmlFor="password2">Ulangi kata sandi</label>
        <input type="password" id="password2" name="password2" autoComplete="new-password" placeholder="Tulis ulang kata sandimu" required minLength={8} />
      </div>
      <div className="check-row">
        <input type="checkbox" id="setuju" name="setuju" />
        <label htmlFor="setuju">Aku mengerti ini ruang bercerita, bukan pengganti psikolog.</label>
      </div>
      {err ? (
        <p className="form-error" role="alert">
          {err}
        </p>
      ) : null}
      {info ? (
        <p className="auth-note" role="status">
          {info}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg full" disabled={loading}>
        {loading ? "Mendaftar…" : "Daftar"}
      </button>
    </form>
  );
}

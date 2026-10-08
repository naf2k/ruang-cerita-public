import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Daftar", description: "Bikin ruang ceritamu di Ruang Cerita. Gratis, boleh anonim." };

export default function RegisterPage() {
  return (
    <div className="container">
      <p className="crumbs"><Link href="/">Beranda</Link> / Daftar</p>
      <div className="auth-split">
        <aside className="auth-side" aria-label="Cara mulai">
          <h1>Bikin ruang ceritamu.</h1>
          <p className="lead">Gratis, boleh pakai nama panggilan. Tidak harus rapi — yang penting mulai.</p>
          <ol className="steps-mini">
            <li><span className="step-num" aria-hidden="true">1</span><div><strong>Daftar akun</strong><p>30 detik, tanpa kartu, tanpa biaya.</p></div></li>
            <li><span className="step-num" aria-hidden="true">2</span><div><strong>Ceritakan sedikit</strong><p>Pilih topik, tulis sebebasnya.</p></div></li>
            <li><span className="step-num" aria-hidden="true">3</span><div><strong>Ngobrol dengan counselor</strong><p>Chat realtime yang aman.</p></div></li>
          </ol>
          <p className="tiny muted mt0">Datamu terenkripsi. Journal hanya bisa dibaca olehmu.</p>
        </aside>
        <div className="auth-form" role="region" aria-labelledby="form-title">
          <h2 id="form-title">Daftar akun baru</h2>
          <p className="muted mt0">Sudah punya ruang? <Link href="/login">Masuk di sini</Link></p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

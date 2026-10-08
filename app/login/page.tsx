import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Masuk", description: "Masuk ke Ruang Cerita untuk melanjutkan ceritamu." };

export default function LoginPage() {
  return (
    <div className="container">
      <p className="crumbs"><Link href="/">Beranda</Link> / Masuk</p>
      <div className="auth-split">
        <aside className="auth-side" aria-label="Kenapa aman cerita di sini">
          <h1>Selamat datang kembali.</h1>
          <p className="lead">Senang kamu mampir lagi. Ceritamu kemarin masih tersimpan rapi.</p>
          <div className="quote-card">
            <p>Terima kasih sudah mau cerita. Kamu boleh mulai dari mana saja, tidak harus runtut.</p>
            <cite>Kak Naya — Counselor</cite>
          </div>
          <ul className="check-list">
            <li>Privasi dijaga, boleh anonim</li>
            <li>Counselor manusia, bukan bot</li>
            <li>Gratis, tanpa dihakimi</li>
          </ul>
          <p className="tiny muted mt0">Butuh bantuan cepat? <Link href="/help-now">Pusat bantuan</Link></p>
        </aside>
        <div className="auth-form" role="region" aria-labelledby="form-title">
          <h2 id="form-title">Masuk ke ruangmu</h2>
          <p className="muted mt0">Hanya kamu yang bisa membaca ceritamu.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

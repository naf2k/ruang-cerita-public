import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privasi", description: "Bagaimana Ruang Cerita mengumpulkan, memakai, menyimpan, dan menghapus datamu." };

export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="page-hero">
        <p className="crumbs"><Link href="/">Beranda</Link> / Privasi</p>
        <h1>Privasi itu janji kami 🔒</h1>
        <p className="lede">Informasi konseling itu sensitif. Ini penjelasan jujur soal datamu — tanpa bahasa hukum yang memusingkan.</p>
      </div>
      <div className="prose">
        <h2>Data yang dikumpulkan</h2>
        <ul>
          <li>Nama panggilan dan email — supaya kamu bisa masuk dan kami bisa menghubungimu.</li>
          <li>Cerita intake, pesan konseling, dan refleksi — supaya counselor bisa menemanimu tanpa kamu harus mengulang cerita dari awal.</li>
          <li>Mood dan journal — supaya kamu punya ruang pribadi untuk refleksi.</li>
        </ul>
        <h2>Alasan data dipakai</h2>
        <p>Satu alasan saja: menjalankan layanan konseling. Tidak untuk iklan, tidak untuk dijual, tidak untuk skor kesehatan mental.</p>
        <h2>Siapa yang bisa mengakses</h2>
        <ul>
          <li>Kamu — semua datamu sendiri.</li>
          <li>Counselor yang menangani sesimu — hanya sesi yang ditugaskan kepadanya.</li>
          <li>Admin — hanya untuk keamanan dan operasional, dengan izin terbatas.</li>
          <li>Journal privatmu — <strong>tidak bisa dilihat counselor</strong>, kecuali kamu sendiri yang membagikannya.</li>
        </ul>
        <h2>Bagaimana data disimpan</h2>
        <p>Data tersimpan di database aman dengan akses berlapis (Row Level Security). File privat tidak ditaruh di bucket publik. Koneksi selalu terenkripsi (HTTPS).</p>
        <h2>Menghapus akun</h2>
        <p>Kamu bisa meminta penghapusan akun dan seluruh datamu kapan saja dari <Link href="/settings#hapus">Pengaturan → Hapus akun</Link>. Setelah dihapus, data tidak bisa dikembalikan.</p>
        <p><Link className="btn btn-secondary" href="/settings"><span>Buka Pengaturan</span><span className="btn-icon" aria-hidden="true">→</span></Link></p>
      </div>
    </div>
  );
}

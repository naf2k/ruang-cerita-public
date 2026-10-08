import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Butuh Bantuan Sekarang?", description: "Kamu nggak sendirian. Pilihan bantuan cepat yang jelas dan tanpa menghakimi." };

export default function HelpNowPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="help-title">
        <div className="container">
          <p className="crumbs"><Link href="/">Beranda</Link> / Bantuan Sekarang</p>
          <h1 id="help-title">Kamu nggak sendirian 🫶</h1>
          <p className="lede">Nggak apa-apa merasa berat. Halaman ini cuma berisi pilihan yang jelas — pelan-pelan aja, nggak ada yang menilai.</p>
        </div>
      </section>
      <section className="section pt-tight" aria-label="Bantuan darurat">
        <div className="container">
          <div className="help-banner">
            <div>
              <h2 className="mb4">Butuh didampingi sekarang?</h2>
              <p className="m0">Kalau kamu merasa tidak aman, langsung hubungi bantuan darurat. Gratis, 24 jam.</p>
            </div>
            <div className="help-actions">
              <a href="tel:119" className="btn btn-dark btn-lg">📞 Layanan Darurat 119</a>
              <Link href="/counseling/new" className="btn btn-light">Ceritakan ke Counselor →</Link>
            </div>
          </div>
          <details className="crisis-details">
            <summary>Kapan harus cari bantuan segera?</summary>
            <ul>
              <li>Kamu merasa tidak aman terhadap dirimu sendiri atau orang lain.</li>
              <li>Kamu butuh didampingi saat ini juga — hubungi orang terpercaya di dekatmu.</li>
              <li>Di Indonesia, layanan darurat: <a href="tel:119">119</a>. Puskesmas atau RS terdekat juga bisa membantu.</li>
            </ul>
          </details>
          <div className="section-head mt32">
            <h2>Pilih yang paling mudah buatmu</h2>
            <p>Semua pilihan di bawah ini sama baiknya. Ambil yang terasa paling dekat.</p>
          </div>
          <ol className="steps">
            <li className="step"><span className="step-num" aria-hidden="true">🫂</span><div><strong>Ajak orang terpercaya</strong><p>Teman, keluarga, atau siapa pun yang bikin kamu merasa aman. Cukup bilang “temenin aku sebentar”.</p></div></li>
            <li className="step"><span className="step-num" aria-hidden="true">🏥</span><div><strong>Ke puskesmas / RS terdekat</strong><p>Datang langsung atau minta diantar. Ceritakan kalau kamu butuh bantuan segera.</p></div></li>
            <li className="step"><span className="step-num" aria-hidden="true">📞</span><div><strong>Hubungi layanan krisis</strong><p>Telepon <a href="tel:119">119</a> — gratis dan siaga 24 jam di Indonesia.</p></div></li>
          </ol>
          <p className="muted mt20">Catatan pelan-pelan: chat biasa di Ruang Cerita itu tempat bercerita, <strong>bukan pengganti bantuan darurat</strong>. Kalau situasinya mendesak, pilihan di atas lebih tepat. 💛</p>
          <div className="center">
            <Link href="/counseling/new" className="btn btn-primary btn-lg"><span>Aku mau cerita pelan-pelan</span><span className="btn-icon" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}

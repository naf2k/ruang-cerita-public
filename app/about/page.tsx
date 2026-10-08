import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Tentang", description: "Ruang Cerita adalah tempat kecil untuk cerita: konseling gratis, aman, tanpa dihakimi." };

export default function AboutPage() {
  return (
    <>
      <section className="hero" aria-labelledby="about-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="crumbs"><Link href="/">Beranda</Link> / Tentang</p>
            <span className="pill-badge">🌱 Tentang Ruang Cerita</span>
            <h1 id="about-title">Tempat kecil<br />untuk cerita.</h1>
            <p className="lede">Nggak perlu rapi, nggak perlu lengkap. Ruang Cerita adalah tempat kamu bisa jadi diri sendiri dan didengarkan sampai tuntas.</p>
            <div className="hero-cta">
              <Link href="/counseling/new" className="btn btn-primary btn-lg"><span>Aku Mau Cerita</span><span className="btn-icon" aria-hidden="true">→</span></Link>
              <Link href="/counselors" className="btn btn-secondary btn-lg">Kenalan sama Counselor</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-shell">
              <div className="visual-core">
                <div className="chat-mock" role="region" aria-label="Contoh sapaan hangat counselor">
                  <div className="chat-head">
                    <span className="avatar avatar-pink" aria-hidden="true">R</span>
                    <div><strong>🌱 Ruang Cerita</strong><small><span aria-hidden="true">🟢</span> Selalu ada buat kamu</small></div>
                  </div>
                  <div className="bubble-row left"><p className="bubble incoming">Hai 👋 Di sini kamu nggak harus kuat terus. Cerita aja, pelan-pelan juga boleh.</p></div>
                  <div className="bubble-row right"><p className="bubble outgoing">Aku cerita berantakan nggak apa-apa?</p></div>
                  <div className="bubble-row left"><p className="bubble incoming">Nggak apa-apa banget. Justru itu gunanya tempat ini 🫶</p></div>
                </div>
                <div className="float-card safe-float" aria-hidden="true">🔒 Ceritamu aman di sini</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section pt8" aria-labelledby="misi-title">
        <div className="container">
          <div className="help-banner">
            <div>
              <h2 id="misi-title">Misi kami sederhana 💛</h2>
              <p className="m0">Biar nggak ada lagi yang merasa harus menghadapi semuanya sendirian. Satu cerita yang didengarkan bisa bikin hari terasa lebih ringan — dan itu cukup sebagai awal.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section pt0" aria-labelledby="prinsip-title">
        <div className="container">
          <div className="section-head">
            <h2 id="prinsip-title">Lima hal yang kami pegang 🤝</h2>
            <p>Ini janji kami setiap kali kamu cerita.</p>
          </div>
          <ol className="intake-steps">
            <li className="intake-step"><span className="step-num" aria-hidden="true">1</span><div className="intake-field"><p className="m0"><strong>🌱 Simple — mulai aja.</strong></p><p className="muted mt-small">Nggak ada formulir ribet. Cerita 30 detik, langsung disambungkan ke counselor.</p></div></li>
            <li className="intake-step"><span className="step-num" aria-hidden="true">2</span><div className="intake-field"><p className="m0"><strong>🫂 Friendly — kayak ngobrol.</strong></p><p className="muted mt-small">Bahasa santai, hangat, tanpa ceramah. Kamu ngobrol sama manusia, bukan mesin.</p></div></li>
            <li className="intake-step"><span className="step-num" aria-hidden="true">3</span><div className="intake-field"><p className="m0"><strong>🤍 Non-judgmental — tanpa dihakimi.</strong></p><p className="muted mt-small">Cerita apa pun tetap diterima. Kami dengerin dulu, bukan nge-judge dulu.</p></div></li>
            <li className="intake-step"><span className="step-num" aria-hidden="true">4</span><div className="intake-field"><p className="m0"><strong>🔒 Privacy — ceritamu milikmu.</strong></p><p className="muted mt-small">Boleh anonim. Journal privat hanya bisa dibaca kamu — counselor pun tidak.</p></div></li>
            <li className="intake-step"><span className="step-num" aria-hidden="true">5</span><div className="intake-field"><p className="m0"><strong>🧑‍🤝‍🧑 Human — manusia beneran.</strong></p><p className="muted mt-small">Di balik layar ada counselor terverifikasi yang siap nemenin, bukan AI therapy.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="batas-title">
        <div className="container">
          <div className="section-head">
            <h2 id="batas-title">Jujur soal batas kami 🙏</h2>
            <p>Biar kamu tahu apa yang bisa — dan tidak bisa — kami bantu.</p>
          </div>
          <div className="duo">
            <div className="panel">
              <h3>Yang TIDAK kami lakukan 🙅</h3>
              <ul>
                <li>Tidak memberi <strong>diagnosis</strong> kesehatan mental.</li>
                <li>Tidak memberi <strong>resep atau obat</strong>.</li>
                <li>Kami <strong>bukan AI therapy</strong> — yang mendengarkanmu manusia beneran.</li>
                <li>Bukan pengganti <strong>psikolog, psikiater, atau layanan darurat</strong>.</li>
              </ul>
            </div>
            <div className="panel">
              <h3>Yang KAMI lakukan 🫶</h3>
              <ul>
                <li><strong>Mendengarkan</strong> sampai tuntas, tanpa motong.</li>
                <li><strong>Nemenin</strong> kamu mengurai perasaan pelan-pelan.</li>
                <li>Bantu mikir <strong>langkah kecil</strong> yang realistis buat harimu.</li>
                <li>Nemani lewat <strong>chat, journal, dan bacaan</strong> yang menenangkan.</li>
              </ul>
              <p className="mb0"><Link href="/resources">Intip Ruang Baca dulu →</Link></p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

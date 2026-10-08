import type { Metadata } from "next";
import Link from "next/link";
import { IntakeWizard } from "@/components/IntakeWizard";

export const metadata: Metadata = { title: "Aku Mau Cerita", description: "Ceritakan sedikit langkah demi langkah. 30 detik, tanpa akun." };

export default function IntakePage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="intake-title">
        <div className="container">
          <p className="crumbs"><Link href="/">Beranda</Link> / Aku Mau Cerita</p>
          <h1 id="intake-title">Ceritakan sedikit, langkah demi langkah 🌱</h1>
          <p className="lede">30 detik, tanpa akun. Satu langkah satu keputusan — pilihanmu tersimpan otomatis di perangkat ini.</p>
          <IntakeWizard />
          <p className="tiny muted mt14">Sudah pernah cerita? <Link href="/counseling">Lanjut ke chat →</Link> • Lagi butuh bantuan cepat? <Link href="/help-now">Bantuan sekarang 🆘</Link> • Cek perasaan harian di <Link href="/mood">Mood Saya 🌤️</Link></p>
        </div>
      </section>
    </>
  );
}

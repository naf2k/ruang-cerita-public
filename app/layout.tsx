import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles.css";
import "../pages.css";
import { Navbar, Footer, BottomNav } from "@/components/SiteChrome";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ruang Cerita — Tempat kecil untuk cerita 🌱",
    template: "%s — Ruang Cerita 🌱",
  },
  description:
    "Platform counseling gratis. Kamu nggak harus menghadapi semuanya sendirian. Ceritakan apa yang sedang kamu rasakan.",
  openGraph: {
    title: "Ruang Cerita — Tempat kecil untuk cerita",
    description:
      "Tempat kecil untuk cerita. Mulai cerita dengan mudah, aman, dan tanpa dihakimi.",
    type: "website",
    locale: "id_ID",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌱</text></svg>",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body id="top">
        <a className="skip-link" href="#main">
          Lewati ke konten utama
        </a>
        <Navbar />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}

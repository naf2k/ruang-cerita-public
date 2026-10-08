"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Beranda", match: (p: string) => p === "/" },
  { href: "/counselors", label: "Counselor", match: (p: string) => p.startsWith("/counselor") },
  { href: "/resources", label: "Ruang Baca", match: (p: string) => p.startsWith("/resources") },
  { href: "/journal", label: "Journal", match: (p: string) => p.startsWith("/journal") },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Navigasi utama">
        <Link href="/" className="brand" aria-label="Ruang Cerita - ke beranda">
          <span className="brand-mark" aria-hidden="true">
            🌱
          </span>
          <span className="brand-text">Ruang Cerita</span>
        </Link>
        <div className={`nav-links${open ? " open" : ""}`} id="navLinks">
          {NAV.map((item) => {
            const active = item.match(pathname ?? "");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/help-now" className="mobile-only" onClick={() => setOpen(false)}>
            <span aria-hidden="true">🆘</span> Bantuan Sekarang
          </Link>
        </div>
        <div className="nav-actions">
          <Link href="/help-now" className="btn btn-ghost btn-sm">
            <span aria-hidden="true">🆘</span> Bantuan
          </Link>
          <Link href="/counseling/new" className="btn btn-primary btn-sm">
            <span className="cta-full">Aku Mau Cerita</span>
            <span className="cta-short">Mulai Cerita</span>
            <span className="btn-icon" aria-hidden="true">
              →
            </span>
          </Link>
          <button
            className={`hamburger${open ? " x" : ""}`}
            aria-expanded={open}
            aria-controls="navLinks"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <strong>🌱 Ruang Cerita</strong>
          <p className="muted">
            Tempat kecil untuk cerita — a little place to feel heard. Dibuat dengan hangat di
            Indonesia. 💛
          </p>
        </div>
        <nav aria-label="Footer">
          <Link href="/about">Tentang</Link>
          <Link href="/counselors">Counselor</Link>
          <Link href="/resources">Ruang Baca</Link>
          <Link href="/help-now">Bantuan Sekarang</Link>
          <Link href="/privacy">Privasi</Link>
        </nav>
        <p className="tiny muted">
          Ruang Cerita adalah tempat bercerita, bukan pengganti psikolog atau psikiater. Kami
          tidak memberi diagnosis atau resep — tapi kami selalu siap mendengarkan. 🫶
        </p>
      </div>
    </footer>
  );
}

export function BottomNav() {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/";
  const isChat = pathname.startsWith("/counseling") || pathname.startsWith("/chat");
  const isJournal = pathname.startsWith("/journal");
  const isProfile =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings");
  return (
    <nav className="bottomnav" aria-label="Navigasi mobile">
      <Link href="/" className={isHome ? "active" : ""} aria-current={isHome ? "page" : undefined}>
        <span aria-hidden="true">🏠</span>
        <small>Beranda</small>
      </Link>
      <Link
        href="/counseling"
        className={isChat ? "active" : ""}
        aria-current={isChat ? "page" : undefined}
      >
        <span aria-hidden="true">💬</span>
        <small>Chat</small>
      </Link>
      <Link
        href="/journal"
        className={isJournal ? "active" : ""}
        aria-current={isJournal ? "page" : undefined}
      >
        <span aria-hidden="true">📝</span>
        <small>Journal</small>
      </Link>
      <Link
        href="/profile"
        className={isProfile ? "active" : ""}
        aria-current={isProfile ? "page" : undefined}
      >
        <span aria-hidden="true">👤</span>
        <small>Profil</small>
      </Link>
    </nav>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  from: "them" | "me";
  text: string;
}

// Naskah loop hero — voice Ruang Cerita: hangat, pendek, non-menghakimi.
const SCRIPT: Msg[] = [
  { from: "them", text: "Hai 👋 Terima kasih sudah mau cerita. Kamu boleh mulai dari mana aja. Nggak harus runtut." },
  { from: "me", text: "Akhir-akhir ini aku gampang capek sama hubunganku…" },
  { from: "them", text: "Iya, wajar banget ngerasa gitu. Mau cerita pelan-pelan? 🫶" },
  { from: "me", text: "Boleh… rasanya kayak apa-apa yang aku lakuin selalu salah 😔" },
  { from: "them", text: "Makasih sudah jujur. Perasaanmu valid kok 🤍" },
  { from: "them", text: "Pelan-pelan aja, aku temenin 🌱" },
];

const TYPING_MS = [700, 550, 800, 600, 750, 650];
const READ_MS = [900, 1000, 850, 1100, 950, 1400];
const END_PAUSE_MS = 2200;

export function HeroChatMock() {
  const [count, setCount] = useState(SCRIPT.length); // SSR: tampil penuh, tanpa shift
  const [typing, setTyping] = useState(false);
  const [playing, setPlaying] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  // Mulai loop saat hero terlihat; hormati prefers-reduced-motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = windowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-scroll ke pesan terbaru seperti aplikasi chat beneran.
  useEffect(() => {
    windowRef.current?.scrollTo({ top: windowRef.current.scrollHeight, behavior: "smooth" });
  }, [count, typing]);

  // Mesin loop: typing → bubble → jeda baca → jeda akhir → ulang.
  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const ids: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        const id = window.setTimeout(res, ms);
        ids.push(id);
      });
    const waitVisible = async () => {
      while (!cancelled && document.hidden) await wait(800);
    };
    (async () => {
      // Mulai dari awal agar loop terlihat seperti obrolan baru.
      setCount(0);
      while (!cancelled) {
        for (let i = 0; i < SCRIPT.length && !cancelled; i++) {
          await waitVisible();
          if (cancelled) return;
          setTyping(true);
          await wait(TYPING_MS[i]);
          if (cancelled) return;
          setTyping(false);
          setCount(i + 1);
          await wait(READ_MS[i]);
        }
        if (cancelled) return;
        await wait(END_PAUSE_MS);
      }
    })();
    return () => {
      cancelled = true;
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [playing]);

  return (
    <div ref={windowRef} className="hero-chat-window" aria-hidden="true">
      {SCRIPT.slice(0, count).map((m, i) => (
        <div key={`${i}-${m.text.slice(0, 12)}`} className={`bubble-row ${m.from === "them" ? "left" : "right"}`}>
          <p className={`bubble ${m.from === "them" ? "incoming" : "outgoing"}${playing ? " bubble-enter" : ""}`}>{m.text}</p>
        </div>
      ))}
      {typing ? (
        <div className="bubble-row left">
          <div className="typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

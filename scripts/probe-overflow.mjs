// Radar overflow responsif (dev-only): laporkan elemen yang melebarkan viewport.
// Usage: node scripts/probe-overflow.mjs [baseUrl]
// Memakai chromium cache milik Playwright TestSprite + playwright-core via npx.
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://127.0.0.1:3107";
const WIDTHS = [390, 375, 360, 320];
const PAGES = [
  "/",
  "/counselors",
  "/resources",
  "/resources/ketika-hubungan-terasa-melelahkan",
  "/counseling/new",
  "/login",
  "/register",
  "/help-now",
  "/about",
  "/privacy",
  "/mood",
  "/journal",
];
const EXE =
  process.env.HOME +
  "/Library/Caches/ms-playwright/chromium-1243/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const browser = await chromium.launch({ executablePath: EXE });
let bad = 0;
for (const w of WIDTHS) {
  for (const p of PAGES) {
    const page = await browser.newPage({ viewport: { width: w, height: 844 } });
    // Halaman privat redirect ke /login bila belum login — tetap ukur halaman hasilnya.
    await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    const rep = await page.evaluate(() => {
      const out = [];
      const docOver = document.documentElement.scrollWidth - window.innerWidth;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let n = walker.currentNode;
      const seen = new Set();
      while (n) {
        const el = n;
        if (el instanceof HTMLElement && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) {
          const cls = (el.className?.baseVal ?? el.className ?? "").toString().split(" ").filter(Boolean).slice(0, 2).join(".");
          const key = `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}`;
          if (!seen.has(key)) {
            seen.add(key);
            const r = el.getBoundingClientRect();
            out.push(`${key} client=${el.clientWidth} scroll=${el.scrollWidth} x=${Math.round(r.x)} w=${Math.round(r.width)} "${(el.innerText ?? "").slice(0, 40).replace(/\n/g, " ")}"`);
          }
        }
        n = walker.nextNode();
      }
      return { url: location.pathname, innerWidth: window.innerWidth, docOver, offenders: out.slice(0, 8) };
    });
    const flag = rep.docOver > 1 ? "OVERFLOW" : "ok";
    if (rep.docOver > 1) bad++;
    console.log(`[${flag}] ${w}px ${rep.url} docOver=${rep.docOver}`);
    for (const o of rep.offenders) console.log(`    - ${o}`);
    await page.close();
  }
}
await browser.close();
console.log(bad === 0 ? "BERSIH: tidak ada overflow" : `TEMUAN: ${bad} halaman overflow`);
process.exit(bad === 0 ? 0 : 2);

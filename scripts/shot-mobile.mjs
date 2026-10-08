// Screenshot HP 390px untuk review visual (dev-only).
// Usage: node scripts/shot-mobile.mjs [baseUrl] [outDir]
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "https://ruang-cerita-app.vercel.app";
const OUT = process.argv[3] ?? "/tmp/shots";
const EXE =
  process.env.HOME +
  "/Library/Caches/ms-playwright/chromium-1243/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const { mkdirSync } = await import("node:fs");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE });
const shots = [];
async function shot(name, path, actions) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  if (actions) await actions(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  shots.push(`${OUT}/${name}.png`);
  await page.close();
}

await shot("01-home", "/");
await shot("02-counselors", "/counselors");
await shot("03-login", "/login");
await shot("04-intake", "/counseling/new");
await shot("05-resources", "/resources");
await shot("06-help", "/help-now");

const email = process.env.SHOT_EMAIL;
const pw = process.env.SHOT_PASSWORD;
if (email && pw) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.fill("#email", email);
  await page.fill("#password", pw);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/07-dashboard.png` });
  shots.push(`${OUT}/07-dashboard.png`);
  await page.goto(BASE + "/counseling", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/08-counseling.png` });
  shots.push(`${OUT}/08-counseling.png`);
  // Buka sesi pertama bila ada
  const first = page.locator('.session-card a.btn').first();
  if ((await first.count()) > 0) {
    await first.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/09-chat.png` });
    shots.push(`${OUT}/09-chat.png`);
  }
  await page.goto(BASE + "/journal", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/10-journal.png` });
  shots.push(`${OUT}/10-journal.png`);
  await page.goto(BASE + "/mood", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/11-mood.png` });
  shots.push(`${OUT}/11-mood.png`);
  await page.close();
}
await browser.close();
console.log(shots.join("\n"));

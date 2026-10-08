// Rotasi akun: hapus 10 akun demo/uji, buat client@ + admin@ baru.
// Usage: CLIENT_PW=... ADMIN_PW=... node scripts/rotate-accounts.mjs
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n").map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SR = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" };
const CLIENT_PW = process.env.CLIENT_PW;
const ADMIN_PW = process.env.ADMIN_PW;
if (!CLIENT_PW || !ADMIN_PW) throw new Error("CLIENT_PW / ADMIN_PW wajib di-set");

const j = async (r) => { const t = await r.text(); try { return [r.status, JSON.parse(t)]; } catch { return [r.status, t]; } };
const api = (m, p, b) => fetch(BASE + p, { method: m, headers: b ? { ...H, Prefer: "return=representation" } : H, body: b ? JSON.stringify(b) : undefined }).then(j);

async function profileId(email) {
  const [, rows] = await api("GET", `/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`);
  return rows?.[0]?.id ?? null;
}

// 1) Hapus akun demo/uji (cascade: profiles, counselor_profiles, sesi, dst.)
for (const email of [
  "naya@ruangcerita.id", "bimo@ruangcerita.id", "sasa@ruangcerita.id",
  "rara@ruangcerita.id", "dimas@ruangcerita.id", "lulu@ruangcerita.id",
  "testcounselor@ruangcerita.id", "testclient@ruangcerita.id",
  "testclient2@ruangcerita.id", "admin@ruangcerita.id",
]) {
  const id = await profileId(email);
  if (!id) { console.log("tak ada:", email); continue; }
  const [s] = await api("DELETE", `/auth/v1/admin/users/${id}`);
  console.log(s === 200 || s === 204 ? "hapus ok:" : "hapus GAGAL:", email, s);
}

// 2) Buat akun baru
async function createUser(email, password, displayName, role) {
  const [s, u] = await api("POST", "/auth/v1/admin/users", {
    email, password, email_confirm: true, user_metadata: { display_name: displayName },
  });
  if (!u?.id) throw new Error(`gagal buat ${email}: ${JSON.stringify(u).slice(0, 150)}`);
  const [s2] = await api("PATCH", `/rest/v1/profiles?id=eq.${u.id}`, { role, display_name: displayName, email });
  console.log("buat ok:", email, role, s2);
  return u.id;
}
await createUser("client@ruangcerita.id", CLIENT_PW, "Klien", "client");
await createUser("admin@ruangcerita.id", ADMIN_PW, "Admin", "admin");
console.log("SELESAI");

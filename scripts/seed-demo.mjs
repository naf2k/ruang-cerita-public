// Seed akun demo Ruang Cerita (DEV ONLY — hapus sebelum production).
// Usage: node scripts/seed-demo.mjs
// Membaca URL + service_role key dari .env.local (tidak di-hardcode).
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SR = env.SUPABASE_SERVICE_ROLE_KEY;
if (!BASE || !SR) throw new Error(".env.local belum berisi URL / service key");

const PASSWORD = "RuangCerita123";

const COUNSELORS = [
  { email: "naya@ruangcerita.id", name: "🌷 Kak Naya", emoji: "🌷", status: "available", tags: ["❤️ Relationship", "🏠 Family", "🌱 Self Growth"], langs: ["id"], bio: "Aku percaya setiap orang punya cerita yang layak didengarkan." },
  { email: "bimo@ruangcerita.id", name: "🍃 Kak Bimo", emoji: "🍃", status: "busy", tags: ["🎓 Student", "🧭 Future", "🌱 Self Growth"], langs: ["id", "en"], bio: "Bingung itu wajar. Kita urai pelan-pelan bareng." },
  { email: "sasa@ruangcerita.id", name: "🌻 Kak Sasa", emoji: "🌻", status: "available", tags: ["🌧️ Emosi", "🫂 Friendship", "🏠 Family"], langs: ["id"], bio: "Nggak apa-apa nangis dulu. Aku temenin." },
  { email: "rara@ruangcerita.id", name: "🌸 Kak Rara", emoji: "🌸", status: "available", tags: ["❤️ Relationship", "🫂 Friendship", "🌧️ Emosi"], langs: ["id", "en"], bio: "Ceritamu penting, meski kamu ngerasa itu hal kecil." },
  { email: "dimas@ruangcerita.id", name: "🌊 Kak Dimas", emoji: "🌊", status: "busy", tags: ["🎓 Student", "🧭 Future", "🏠 Family"], langs: ["id"], bio: "Tekanan itu berat. Kita cari langkah kecil yang realistis." },
  { email: "lulu@ruangcerita.id", name: "🌙 Kak Lulu", emoji: "🌙", status: "offline", tags: ["🌱 Self Growth", "🌧️ Emosi", "🧭 Future"], langs: ["id"], bio: "Menerima diri itu proses. Pelan-pelan, aku temenin." },
];

const H = { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" };

async function userIdByEmail(email) {
  // 1) coba buat
  const r = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ email, password: PASSWORD, email_confirm: true, user_metadata: { display_name: email } }),
  });
  const j = await r.json();
  if (r.ok && j.id) return j.id;
  // 2) sudah ada → ambil id dari profiles
  const q = await fetch(`${BASE}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`, { headers: H });
  const rows = await q.json();
  if (rows?.[0]?.id) return rows[0].id;
  throw new Error(`gagal seed ${email}: ${JSON.stringify(j).slice(0, 200)}`);
}

async function patchProfile(id, body) {
  const r = await fetch(`${BASE}/rest/v1/profiles?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...H, Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`patch profile gagal: ${await r.text()}`);
}

async function upsertCounselor(c, userId) {
  const r = await fetch(`${BASE}/rest/v1/counselor_profiles?on_conflict=user_id`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id: userId,
      display_name: c.name,
      bio: c.bio,
      specialties: c.tags,
      languages: c.langs,
      avatar_emoji: c.emoji,
      is_verified: true,
      availability_status: c.status,
    }),
  });
  if (!r.ok) throw new Error(`upsert counselor gagal: ${await r.text()}`);
}

for (const c of COUNSELORS) {
  const id = await userIdByEmail(c.email);
  await patchProfile(id, { role: "counselor", display_name: c.name, email: c.email });
  await upsertCounselor(c, id);
  console.log("counselor ok:", c.email);
}

const adminId = await userIdByEmail("admin@ruangcerita.id");
await patchProfile(adminId, { role: "admin", display_name: "Admin", email: "admin@ruangcerita.id" });
console.log("admin ok: admin@ruangcerita.id");
console.log(`\nSemua akun demo memakai password: ${PASSWORD}`);

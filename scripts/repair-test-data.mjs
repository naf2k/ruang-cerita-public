// Perbaiki + siapkan data uji E2E (idempoten, aman dijalankan ulang).
// Usage: node scripts/repair-test-data.mjs
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n").map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SR = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" };
const j = async (r) => { const t = await r.text(); try { return [r.status, JSON.parse(t)]; } catch { return [r.status, t]; } };
const api = (m, p, b) => fetch(BASE + p, { method: m, headers: b ? { ...H, Prefer: "return=representation" } : H, body: b ? JSON.stringify(b) : undefined }).then(j);

async function profileId(email) {
  const [s, rows] = await api("GET", `/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`);
  return rows?.[0]?.id ?? null;
}
async function deleteUserByEmail(email) {
  const id = await profileId(email);
  if (!id) { console.log("skip (tak ada):", email); return; }
  const [s] = await api("DELETE", `/auth/v1/admin/users/${id}`);
  console.log("hapus", email, s);
}

// 1) Pulihkan akun uji utama
for (const [email, role, extra] of [
  ["testclient@ruangcerita.id", "client", {}],
  ["testclient2@ruangcerita.id", "client", {}],
]) {
  const id = await profileId(email);
  if (id) { const [s] = await api("PATCH", `/rest/v1/profiles?id=eq.${id}`, { status: "active", role, ...extra }); console.log("pulihkan", email, s); }
}
{
  const id = await profileId("naya@ruangcerita.id");
  if (id) {
    console.log("pulihkan naya profil", (await api("PATCH", `/rest/v1/profiles?id=eq.${id}`, { status: "active", role: "counselor" }))[0]);
    console.log("pulihkan naya verified", (await api("PATCH", `/rest/v1/counselor_profiles?user_id=eq.${id}`, { is_verified: true }))[0]);
  }
}

// 2) Bersihkan akun sampah dari run sebelumnya
for (const email of [
  "testclient.autotest.20260921@ruangcerita.id",
  "autocounselor.autotest.20260921@ruangcerita.id",
  "autotest.counselor.20260921@ruangcerita.id",
]) await deleteUserByEmail(email);
{
  const [s, rows] = await api("GET", "/rest/v1/counselor_profiles?display_name=like.*AutoTest*&select=user_id,display_name");
  for (const r of rows ?? []) {
    const [ss, prof] = await api("GET", `/rest/v1/profiles?id=eq.${r.user_id}&select=email`);
    const email = prof?.[0]?.email ?? "";
    if (email.includes("autotest") || email.includes("autocounselor")) {
      const [d] = await api("DELETE", `/auth/v1/admin/users/${r.user_id}`);
      console.log("hapus counselor sampah", r.display_name, email, d);
    } else console.log("pertahankan", r.display_name, email);
  }
}

// 3) Seed sesi untuk testclient (aktif + menunggu + selesai dengan pesan)
const clientId = await profileId("testclient@ruangcerita.id");
const [ss, cps] = await api("GET", "/rest/v1/counselor_profiles?select=user_id&is_verified=eq.true&limit=1");
const counselorId = cps?.[0]?.user_id;
const [sq, existing] = await api("GET", `/rest/v1/counseling_sessions?client_id=eq.${clientId}&select=id&limit=1`);
if (existing?.length) console.log("sesi testclient sudah ada, lewati seed sesi");
else {
  const mk = async (status, topic, desc, withMsg) => {
    const [, rq] = await api("POST", "/rest/v1/counseling_requests", { client_id: clientId, topic: [topic], description: desc, support_type: "both", status });
    const [, se] = await api("POST", "/rest/v1/counseling_sessions", { request_id: rq?.[0]?.id ?? null, client_id: clientId, counselor_id: counselorId, status, started_at: new Date().toISOString() });
    const sid = se?.[0]?.id;
    if (sid && withMsg) {
      await api("POST", "/rest/v1/messages", { session_id: sid, sender_id: counselorId, message: "Hai 👋 Terima kasih sudah mau cerita. Kamu boleh mulai dari mana aja. Nggak harus runtut." });
      await api("POST", "/rest/v1/messages", { session_id: sid, sender_id: clientId, message: "Halo kak, aku mau cerita sedikit (data uji)." });
    }
    return sid;
  };
  console.log("seed sesi aktif", await mk("active", "Percintaan", "Cerita uji sesi aktif.", true));
  console.log("seed sesi menunggu", await mk("waiting", "Keluarga", "Cerita uji sesi menunggu.", false));
  const doneId = await mk("completed", "Pertemanan", "Cerita uji sesi selesai.", true);
  if (doneId) await api("POST", "/rest/v1/session_reflections?on_conflict=session_id", { session_id: doneId, client_id: clientId, mood_after: "🙂 Lumayan", reflection: "Refleksi uji." });
}

// 4) Seed satu laporan pending untuk TC029
{
  const [, reps] = await api("GET", "/rest/v1/reports?status=eq.pending&select=id&limit=1");
  if (reps?.length) console.log("laporan pending sudah ada");
  else console.log("seed laporan", (await api("POST", "/rest/v1/reports", { reporter_id: clientId, target_type: "other", reason: "Konten tidak aman", description: "Laporan uji otomatis.", status: "pending" }))[0]);
}
console.log("SELESAI");

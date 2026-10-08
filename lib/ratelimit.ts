// Rate limiter in-memory per instance (V1, PRD §33).
// Catatan: di deployment multi-instance (Vercel), batas dihitung per instance.
// Untuk batas global gunakan Supabase/Auth rate limit atau Redis di iterasi berikut.
const buckets = new Map<string, number[]>();
const MAX_KEYS = 10000;

export function checkRate(key: string, limit: number, windowMs = 60_000): boolean {
  if (buckets.size > MAX_KEYS) buckets.clear();
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    buckets.set(key, arr);
    return false;
  }
  arr.push(now);
  buckets.set(key, arr);
  return true;
}

export const RATE_MSG = "Pelan-pelan ya 🌱 Coba lagi sebentar lagi.";

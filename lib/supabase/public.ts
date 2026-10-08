import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Klien publik TANPA cookies — untuk bacaan Server Component di halaman publik.
// Penting: memakai server client berbasis cookie di route prerender-statis
// (SSG + generateStaticParams + revalidate) memicu error Next.js
// "changed from static to dynamic at runtime" saat ISR revalidasi.
// RLS tetap berlaku (peran anon): hanya data publik yang terbaca.
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function createPublicClient() {
  if (!cached) {
    cached = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cached;
}

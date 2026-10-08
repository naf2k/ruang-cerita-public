"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { checkRate, RATE_MSG } from "@/lib/ratelimit";

function fail(message: string) {
  return { ok: false as const, message };
}

export async function listMoods(limit = 30) {
  const me = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", me.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function createMood(input: { mood: string; note?: string }) {
  const me = await requireUser();
  if (!checkRate(`mood:${me.id}`, 30)) return fail(RATE_MSG);
  const mood = (input.mood ?? "").trim().slice(0, 40);
  if (!mood) return fail("Pilih mood-mu dulu ya.");
  const note = (input.note ?? "").trim().slice(0, 500);
  const supabase = await createClient();
  const { error } = await supabase.from("mood_entries").insert({ user_id: me.id, mood, note: note || null });
  if (error) return fail("Mood belum tersimpan. Coba lagi ya.");
  revalidatePath("/mood");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

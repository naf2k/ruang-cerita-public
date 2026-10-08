"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { checkRate, RATE_MSG } from "@/lib/ratelimit";

function fail(message: string) {
  return { ok: false as const, message };
}

export async function listJournals(limit = 50) {
  const me = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", me.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function createJournal(input: { title?: string; content: string; mood?: string }) {
  const me = await requireUser();
  if (!checkRate(`journal:${me.id}`, 20)) return fail(RATE_MSG);
  const content = (input.content ?? "").trim();
  if (!content) return fail("Tulis satu kalimat dulu yuk 🌱 Baru bisa disimpan.");
  if (content.length > 5000) return fail("Tulisanmu kepanjangan. Bagi jadi dua bagian ya.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: me.id,
      title: (input.title ?? "").trim().slice(0, 120) || content.split("\n")[0].slice(0, 60) || "Catatan harian",
      content,
      mood: input.mood?.slice(0, 40) ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return fail("Journal belum tersimpan. Coba lagi ya.");
  revalidatePath("/journal");
  return { ok: true as const, id: data.id };
}

export async function getJournal(id: string) {
  const me = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("journal_entries").select("*").eq("id", id).eq("user_id", me.id).single();
  return data;
}

export async function deleteJournal(id: string) {
  const me = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", me.id);
  if (error) return fail("Cerita belum terhapus.");
  revalidatePath("/journal");
  return { ok: true as const };
}

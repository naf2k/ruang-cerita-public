"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

function fail(message: string) {
  return { ok: false as const, message };
}

export async function getMyProfile() {
  const me = await requireUser();
  return me.profile;
}

export async function updateMyProfile(input: { displayName: string; preferredLanguage: string }) {
  const me = await requireUser();
  const displayName = (input.displayName ?? "").trim().slice(0, 40) || "Teman Cerita";
  const preferredLanguage = input.preferredLanguage === "en" ? "en" : "id";
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, preferred_language: preferredLanguage })
    .eq("id", me.id);
  if (error) return fail("Profil belum tersimpan.");
  revalidatePath("/profile");
  return { ok: true as const };
}

const ALLOWED_AVATAR = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR = 2 * 1024 * 1024;

export async function uploadAvatar(formData: FormData) {
  const me = await requireUser();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return fail("Pilih foto dulu ya.");
  if (!ALLOWED_AVATAR.includes(file.type)) return fail("Foto harus JPG, PNG, atau WebP.");
  if (file.size > MAX_AVATAR) return fail("Ukuran foto maksimal 2 MB.");
  const supabase = await createClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${me.id}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: true });
  if (upErr) return fail("Foto belum terunggah.");
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", me.id);
  revalidatePath("/profile");
  return { ok: true as const, url: data.publicUrl };
}

const ALLOWED_ATTACH = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_ATTACH = 5 * 1024 * 1024;

export async function uploadChatAttachment(formData: FormData) {
  const me = await requireUser();
  const sessionId = String(formData.get("sessionId") ?? "");
  const file = formData.get("file");
  if (!sessionId) return fail("Sesi tidak ditemukan.");
  if (!(file instanceof File) || file.size === 0) return fail("Pilih berkas dulu ya.");
  if (!ALLOWED_ATTACH.includes(file.type)) return fail("Berkas harus gambar (JPG/PNG/WebP) atau PDF.");
  if (file.size > MAX_ATTACH) return fail("Ukuran berkas maksimal 5 MB.");
  const supabase = await createClient();
  const { data: session } = await supabase.from("counseling_sessions").select("client_id, counselor_id").eq("id", sessionId).single();
  if (!session || (session.client_id !== me.id && session.counselor_id !== me.id && me.profile.role !== "admin")) {
    return fail("Kamu tidak punya akses ke sesi ini.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase().slice(0, 8) || "bin";
  const path = `${sessionId}/${me.id}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("chat-attachments").upload(path, file, { contentType: file.type });
  if (upErr) return fail("Berkas belum terunggah.");
  const { data } = await supabase.storage.from("chat-attachments").createSignedUrl(path, 60 * 60 * 24 * 7);
  return { ok: true as const, url: data?.signedUrl ?? null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deactivateMyAccount() {
  const me = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ status: "deactivated" }).eq("id", me.id);
  await supabase.auth.signOut();
  redirect("/login");
}

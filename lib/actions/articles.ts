"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { requireUser } from "@/lib/auth";

const CATEGORIES = ["relationship", "family", "student", "self"] as const;

function fail(message: string) {
  return { ok: false as const, message };
}

export async function listPublishedArticles(category?: string) {
  const supabase = createPublicClient();
  let q = supabase
    .from("articles")
    .select("id, title, slug, category, excerpt, content, cover_emoji, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);
  if (category && (CATEGORIES as readonly string[]).includes(category)) q = q.eq("category", category);
  const { data } = await q;
  return data ?? [];
}

export async function getArticleBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.from("articles").select("*").eq("slug", slug).eq("status", "published").single();
  return data;
}

export async function listAllArticles() {
  await requireUser(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").order("updated_at", { ascending: false }).limit(100);
  return data ?? [];
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || `artikel-${Date.now()}`
  );
}

export async function createArticle(input: { title: string; category: string; excerpt: string; content: string; coverEmoji?: string }) {
  await requireUser(["admin"]);
  const title = (input.title ?? "").trim().slice(0, 160);
  if (!title) return fail("Judul belum diisi.");
  if (!(CATEGORIES as readonly string[]).includes(input.category)) return fail("Kategori belum tepat.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .insert({
      title,
      slug: slugify(title),
      category: input.category,
      excerpt: (input.excerpt ?? "").trim().slice(0, 300),
      content: (input.content ?? "").trim().slice(0, 20000),
      cover_emoji: input.coverEmoji?.slice(0, 8) || "🌱",
      status: "draft",
    })
    .select("id, slug")
    .single();
  if (error || !data) return fail("Artikel belum tersimpan.");
  revalidatePath("/resources");
  return { ok: true as const, id: data.id, slug: data.slug };
}

export async function setArticleStatus(id: string, status: "draft" | "published") {
  await requireUser(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("articles").update({ status }).eq("id", id);
  if (error) return fail("Status artikel belum berubah.");
  revalidatePath("/resources");
  return { ok: true as const };
}

export async function deleteArticle(id: string) {
  await requireUser(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return fail("Artikel belum terhapus.");
  revalidatePath("/resources");
  return { ok: true as const };
}

export async function updateArticle(input: {
  id: string;
  title?: string;
  category?: string;
  excerpt?: string;
  content?: string;
  coverEmoji?: string;
}) {
  await requireUser(["admin"]);
  const patch: { title?: string; category?: string; excerpt?: string; content?: string; cover_emoji?: string } = {};
  if (input.title !== undefined) {
    const v = input.title.trim().slice(0, 160);
    if (!v) return fail("Judul belum diisi.");
    patch.title = v;
  }
  if (input.category !== undefined) {
    if (!(CATEGORIES as readonly string[]).includes(input.category)) return fail("Kategori belum tepat.");
    patch.category = input.category;
  }
  if (input.excerpt !== undefined) patch.excerpt = input.excerpt.trim().slice(0, 300);
  if (input.content !== undefined) {
    const v = input.content.trim().slice(0, 20000);
    if (!v) return fail("Isi artikel belum diisi.");
    patch.content = v;
  }
  if (input.coverEmoji !== undefined) patch.cover_emoji = input.coverEmoji.slice(0, 8) || "🌱";
  if (Object.keys(patch).length === 0) return { ok: true as const };
  const supabase = await createClient();
  const { error } = await supabase.from("articles").update(patch).eq("id", input.id);
  if (error) return fail("Artikel belum tersimpan.");
  revalidatePath("/resources");
  return { ok: true as const };
}

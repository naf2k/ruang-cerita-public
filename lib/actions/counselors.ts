"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { requireUser } from "@/lib/auth";

export interface PublicCounselor {
  userId: string;
  name: string;
  initial: string;
  avatarEmoji: string;
  status: "available" | "busy" | "offline";
  tags: string[];
  topics: string;
  quote: string;
  lang: string;
}

const EMOJI_BY_INDEX = ["🌷", "🍃", "🌻", "🌸", "🌊", "🌙"];

export async function listVerifiedCounselors(): Promise<PublicCounselor[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("counselor_profiles")
    .select("user_id, display_name, bio, specialties, languages, avatar_emoji, availability_status")
    .eq("is_verified", true)
    .order("display_name");
  if (!data) return [];
  return data.map((c, i) => {
    const langs = (c.languages ?? []).includes("en") ? "🇮🇩 🇬🇧 Indonesia / Inggris" : "🇮🇩 Bahasa Indonesia";
    const statusNote =
      c.availability_status === "available" ? "Daring" : c.availability_status === "busy" ? "Sedang sesi" : "Segera kembali";
    return {
      userId: c.user_id,
      name: c.display_name,
      initial: (c.display_name.replace(/^[^\p{L}]+/u, "").charAt(0) || "K").toUpperCase(),
      avatarEmoji: c.avatar_emoji || EMOJI_BY_INDEX[i % EMOJI_BY_INDEX.length],
      status: (c.availability_status ?? "offline") as PublicCounselor["status"],
      tags: c.specialties ?? [],
      topics: (c.specialties ?? []).join(" ").toLowerCase(),
      quote: c.bio ? `“${c.bio}”` : "",
      lang: `${langs} • ${statusNote}`,
    };
  });
}

export async function getMyCounselorProfile() {
  const me = await requireUser(["counselor", "admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("counselor_profiles").select("*").eq("user_id", me.id).single();
  return data;
}

export async function setAvailability(status: "available" | "busy" | "offline") {
  const me = await requireUser(["counselor"]);
  if (!["available", "busy", "offline"].includes(status)) {
    return { ok: false as const, message: "Status tidak dikenal." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("counselor_profiles").update({ availability_status: status }).eq("user_id", me.id);
  if (error) return { ok: false as const, message: "Status belum tersimpan." };
  revalidatePath("/counselor");
  revalidatePath("/counselors");
  return { ok: true as const };
}

export async function upsertSessionNote(input: { sessionId: string; notes?: string; actionPoints?: string[] }) {
  const me = await requireUser(["counselor"]);
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("counseling_sessions")
    .select("id")
    .eq("id", input.sessionId)
    .eq("counselor_id", me.id)
    .single();
  if (!session) return { ok: false as const, message: "Sesi tidak ditemukan." };
  const patch: { notes?: string; action_points?: string[] } = {};
  if (input.notes !== undefined) patch.notes = input.notes.trim().slice(0, 5000);
  if (input.actionPoints !== undefined) {
    patch.action_points = input.actionPoints.map((p) => p.trim()).filter(Boolean).slice(0, 20);
  }
  if (Object.keys(patch).length === 0) return { ok: true as const };
  const { error } = await supabase
    .from("counselor_notes")
    .upsert({ session_id: input.sessionId, counselor_id: me.id, ...patch }, { onConflict: "session_id,counselor_id" });
  if (error) return { ok: false as const, message: "Catatan belum tersimpan." };
  return { ok: true as const };
}

export async function getSessionNote(sessionId: string): Promise<{ notes: string; actionPoints: string[] }> {
  const me = await requireUser(["counselor"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("counselor_notes")
    .select("notes, action_points")
    .eq("session_id", sessionId)
    .eq("counselor_id", me.id)
    .single();
  return { notes: data?.notes ?? "", actionPoints: data?.action_points ?? [] };
}

export interface CounselorSessionRow {
  id: string;
  status: string;
  created_at: string;
  clientLabel: string;
  topic: string;
  lastMessage: string | null;
  lastAt: string | null;
  unread: number;
}

export async function getCounselorSessions(): Promise<CounselorSessionRow[]> {
  const me = await requireUser(["counselor"]);
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("counseling_sessions")
    .select("id, status, created_at, client_id, request_id")
    .eq("counselor_id", me.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (!sessions?.length) return [];
  const clientIds = [...new Set(sessions.map((s) => s.client_id))];
  const requestIds = [...new Set(sessions.map((s) => s.request_id).filter(Boolean))] as string[];
  const [{ data: clients }, { data: reqs }, { data: msgs }, { data: reads }] = await Promise.all([
    supabase.from("profiles").select("id, display_name").in("id", clientIds),
    requestIds.length
      ? supabase.from("counseling_requests").select("id, topic").in("id", requestIds)
      : Promise.resolve({ data: [] as { id: string; topic: string[] }[] }),
    supabase
      .from("messages")
      .select("session_id, sender_id, message, created_at")
      .in("session_id", sessions.map((s) => s.id))
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from("session_reads").select("session_id, last_read_at").eq("user_id", me.id).in("session_id", sessions.map((s) => s.id)),
  ]);
  const lastBySession = new Map<string, { message: string; created_at: string }>();
  for (const m of msgs ?? []) {
    if (!lastBySession.has(m.session_id)) lastBySession.set(m.session_id, { message: m.message, created_at: m.created_at });
  }
  const readMap = new Map((reads ?? []).map((r) => [r.session_id, new Date(r.last_read_at).getTime()]));
  const unreadBySession = new Map<string, number>();
  for (const m of msgs ?? []) {
    if (m.sender_id === me.id) continue;
    const last = readMap.get(m.session_id);
    if (last === undefined || new Date(m.created_at).getTime() > last) {
      unreadBySession.set(m.session_id, (unreadBySession.get(m.session_id) ?? 0) + 1);
    }
  }
  return sessions.map((s) => {
    const c = (clients ?? []).find((x) => x.id === s.client_id);
    const last = lastBySession.get(s.id);
    return {
      id: s.id,
      status: s.status,
      created_at: s.created_at,
      clientLabel: c?.display_name ? `${c.display_name.trim().charAt(0).toUpperCase()} •••` : "Klien •••",
      topic: (reqs ?? []).find((r) => r.id === s.request_id)?.topic?.[0] ?? "-",
      lastMessage: last?.message ?? null,
      lastAt: last?.created_at ?? null,
      unread: unreadBySession.get(s.id) ?? 0,
    };
  });
}

export async function getCounselorStats() {
  const me = await requireUser(["counselor"]);
  const supabase = await createClient();
  const { data } = await supabase.from("counseling_sessions").select("status").eq("counselor_id", me.id);
  const rows = data ?? [];
  return {
    active: rows.filter((r) => r.status === "active").length,
    waiting: rows.filter((r) => r.status === "pending" || r.status === "waiting").length,
    upcoming: rows.filter((r) => r.status === "pending").length,
  };
}

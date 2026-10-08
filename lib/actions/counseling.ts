"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { checkRate, RATE_MSG } from "@/lib/ratelimit";

const SUPPORT_TYPES = ["listened", "solution", "both"] as const;

function fail(message: string) {
  return { ok: false as const, message };
}

export async function createIntake(input: {
  topics: string[];
  story: string;
  supportType: string;
  mood?: string | null;
}) {
  // Best-effort: tamu (belum login) tetap bisa lanjut lihat counselor tanpa menyimpan.
  const me = await getCurrentUser();
  if (!me || me.profile.role !== "client") {
    return { ok: true as const, requestId: null as string | null, guest: true as const };
  }
  if (!checkRate(`intake:${me.id}`, 10)) {
    return fail(RATE_MSG);
  }
  const topics = (input.topics ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 8);
  const story = (input.story ?? "").trim().slice(0, 1000);
  if (!SUPPORT_TYPES.includes(input.supportType as (typeof SUPPORT_TYPES)[number])) {
    return fail("Pilihan kebutuhan belum tepat. Coba lagi ya.");
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("counseling_requests")
    .insert({
      client_id: me.id,
      topic: topics,
      description: story,
      support_type: input.supportType,
      mood: input.mood?.slice(0, 20) ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !data) return fail("Belum bisa menyimpan ceritamu. Coba lagi ya.");
  revalidatePath("/counseling");
  return { ok: true as const, requestId: data.id };
}

export async function startSession(input: { requestId?: string; counselorUserId: string }) {
  const me = await requireUser(["client"]);
  const supabase = await createClient();

  const { data: counselor } = await supabase
    .from("counselor_profiles")
    .select("user_id, display_name, is_verified, availability_status")
    .eq("user_id", input.counselorUserId)
    .eq("is_verified", true)
    .single();
  if (!counselor) return fail("Counselor tidak tersedia saat ini.");

  let requestId: string | null = null;
  if (input.requestId) {
    const { data: req } = await supabase
      .from("counseling_requests")
      .select("id, client_id")
      .eq("id", input.requestId)
      .single();
    if (!req || req.client_id !== me.id) return fail("Data ceritamu tidak ditemukan.");
    requestId = req.id;
  }

  const active = counselor.availability_status === "available";
  const { data: session, error } = await supabase
    .from("counseling_requests")
    .select("id")
    .limit(0)
    .then(async () => {
      // pisahkan: buat sesi di tabel counseling_sessions
      return await supabase
        .from("counseling_sessions")
        .insert({
          request_id: requestId,
          client_id: me.id,
          counselor_id: counselor.user_id,
          status: active ? "active" : "waiting",
          started_at: active ? new Date().toISOString() : null,
        })
        .select("id")
        .single();
    });
  if (error || !session) return fail("Belum bisa memulai sesi. Coba lagi ya.");

  // Pesan pembuka sesuai template PRD §8.4
  await supabase.from("messages").insert({
    session_id: session.id,
    sender_id: counselor.user_id,
    message: "Hai 👋 Terima kasih sudah mau cerita. Kamu boleh mulai dari mana aja. Nggak harus runtut.",
  });
  if (requestId) {
    await supabase
      .from("counseling_requests")
      .update({ status: active ? "active" : "waiting" })
      .eq("id", requestId);
  }
  revalidatePath("/counseling");
  return { ok: true as const, sessionId: session.id };
}

export interface SessionSummary {
  id: string;
  status: string;
  created_at: string;
  counselorName: string;
  counselorInitial: string;
  counselorAvatar: string;
  counselorStatus: string;
  topic: string;
  lastMessage: string | null;
  unread: number;
}

export async function listMySessions(): Promise<SessionSummary[]> {
  const me = await requireUser(["client"]);
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("counseling_sessions")
    .select("id, status, created_at, counselor_id, request_id")
    .eq("client_id", me.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (!sessions?.length) return [];

  const counselorIds = [...new Set(sessions.map((s) => s.counselor_id).filter(Boolean))] as string[];
  const requestIds = [...new Set(sessions.map((s) => s.request_id).filter(Boolean))] as string[];
  const [{ data: profiles }, { data: cps }, { data: reqs }, { data: msgs }, { data: reads }] = await Promise.all([
    counselorIds.length
      ? supabase.from("profiles").select("id, display_name, avatar_url").in("id", counselorIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string | null; avatar_url: string | null }[] }),
    counselorIds.length
      ? supabase.from("counselor_profiles").select("user_id, display_name, avatar_emoji, availability_status").in("user_id", counselorIds)
      : Promise.resolve({ data: [] as { user_id: string; display_name: string; avatar_emoji: string; availability_status: string }[] }),
    requestIds.length
      ? supabase.from("counseling_requests").select("id, topic").in("id", requestIds)
      : Promise.resolve({ data: [] as { id: string; topic: string[] }[] }),
    supabase
      .from("messages")
      .select("session_id, sender_id, message, created_at")
      .in("session_id", sessions.map((s) => s.id))
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("session_reads").select("session_id, last_read_at").eq("user_id", me.id).in("session_id", sessions.map((s) => s.id)),
  ]);
  const lastBySession = new Map<string, string>();
  for (const m of msgs ?? []) {
    if (!lastBySession.has(m.session_id)) lastBySession.set(m.session_id, m.message);
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
    const cp = (cps ?? []).find((c) => c.user_id === s.counselor_id);
    const prof = (profiles ?? []).find((p) => p.id === s.counselor_id);
    const req = (reqs ?? []).find((r) => r.id === s.request_id);
    const name = cp?.display_name ?? prof?.display_name ?? "Counselor";
    return {
      id: s.id,
      status: s.status,
      created_at: s.created_at,
      counselorName: name,
      counselorInitial: (name.replace(/^[^\p{L}]+/u, "").charAt(0) || "K").toUpperCase(),
      counselorAvatar: cp?.avatar_emoji ?? "🌷",
      counselorStatus: cp?.availability_status ?? "offline",
      topic: req?.topic?.[0] ?? "-",
      lastMessage: lastBySession.get(s.id) ?? null,
      unread: unreadBySession.get(s.id) ?? 0,
    };
  });
}

export async function getSessionDetail(sessionId: string) {
  const me = await requireUser();
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("counseling_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (!session) return null;
  const isClient = session.client_id === me.id;
  const isCounselor = session.counselor_id === me.id;
  const isAdmin = me.profile.role === "admin";
  if (!isClient && !isCounselor && !isAdmin) return null;

  // Tandai sudah dibaca (read receipt untuk badge unread)
  await supabase.from("session_reads").upsert(
    { session_id: sessionId, user_id: me.id, last_read_at: new Date().toISOString() },
    { onConflict: "session_id,user_id" }
  );

  const otherId = isClient ? session.counselor_id : session.client_id;
  const [{ data: other }, { data: cp }, { data: messages }, { data: request }, { data: reflection }] =
    await Promise.all([
      otherId
        ? supabase.from("profiles").select("id, display_name, avatar_url").eq("id", otherId).single()
        : Promise.resolve({ data: null as { id: string; display_name: string | null; avatar_url: string | null } | null }),
      session.counselor_id
        ? supabase
            .from("counselor_profiles")
            .select("display_name, avatar_emoji, availability_status, specialties")
            .eq("user_id", session.counselor_id)
            .single()
        : Promise.resolve({ data: null }),
      supabase.from("messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true }).limit(500),
      session.request_id
        ? supabase.from("counseling_requests").select("*").eq("id", session.request_id).single()
        : Promise.resolve({ data: null }),
      supabase.from("session_reflections").select("*").eq("session_id", sessionId).single(),
    ]);

  // Samarkan identitas klien untuk counselor (PRD §10)
  const clientLabel =
    !isClient && other?.display_name
      ? `${other.display_name.trim().charAt(0).toUpperCase()} •••`
      : (other?.display_name ?? "Teman Cerita");

  return {
    session,
    isClient,
    counselorName: cp?.display_name ?? other?.display_name ?? "Counselor",
    counselorAvatar: cp?.avatar_emoji ?? "🌷",
    counselorStatus: cp?.availability_status ?? "offline",
    clientLabel,
    messages: messages ?? [],
    request,
    reflection: reflection ?? null,
  };
}

export async function sendMessage(input: { sessionId: string; text: string; attachmentUrl?: string }) {
  const me = await requireUser();
  if (!checkRate(`msg:${me.id}`, 30)) return fail(RATE_MSG);
  const text = (input.text ?? "").trim().slice(0, 2000);
  if (!text && !input.attachmentUrl) return fail("Tulis pesan dulu ya.");
  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    session_id: input.sessionId,
    sender_id: me.id,
    message: text || "(lampiran)",
    attachment_url: input.attachmentUrl ?? null,
  });
  if (error) return fail("Pesan belum terkirim. Coba lagi ya.");
  revalidatePath(`/counseling/${input.sessionId}`);
  return { ok: true as const };
}

export async function completeSession(sessionId: string) {
  const me = await requireUser();
  const supabase = await createClient();
  const { data: session } = await supabase.from("counseling_sessions").select("client_id, counselor_id, status").eq("id", sessionId).single();
  if (!session || (session.client_id !== me.id && session.counselor_id !== me.id && me.profile.role !== "admin")) {
    return fail("Sesi tidak ditemukan.");
  }
  const { error } = await supabase
    .from("counseling_sessions")
    .update({ status: "completed", ended_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) return fail("Belum bisa menyelesaikan sesi.");
  if (session.client_id === me.id) {
    const { data: req } = await supabase.from("counseling_sessions").select("request_id").eq("id", sessionId).single();
    if (req?.request_id) {
      await supabase.from("counseling_requests").update({ status: "completed" }).eq("id", req.request_id);
    }
  }
  revalidatePath("/counseling");
  revalidatePath(`/counseling/${sessionId}`);
  return { ok: true as const };
}

export async function saveReflection(input: { sessionId: string; moodAfter: string; reflection?: string }) {
  const me = await requireUser(["client"]);
  const moodAfter = (input.moodAfter ?? "").slice(0, 40);
  const reflection = (input.reflection ?? "").trim().slice(0, 500);
  if (!moodAfter) return fail("Pilih perasaanmu dulu ya.");
  const supabase = await createClient();
  const { error } = await supabase.from("session_reflections").upsert(
    { session_id: input.sessionId, client_id: me.id, mood_after: moodAfter, reflection: reflection || null },
    { onConflict: "session_id" }
  );
  if (error) return fail("Refleksi belum tersimpan.");
  revalidatePath(`/counseling/${input.sessionId}`);
  return { ok: true as const };
}

export async function acceptSession(sessionId: string) {
  const me = await requireUser();
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("counseling_sessions")
    .select("id, counselor_id, request_id, status")
    .eq("id", sessionId)
    .single();
  if (!session || (session.counselor_id !== me.id && me.profile.role !== "admin")) {
    return fail("Sesi tidak ditemukan.");
  }
  if (session.status !== "pending" && session.status !== "waiting") {
    return fail("Sesi ini sudah berjalan.");
  }
  const { error } = await supabase
    .from("counseling_sessions")
    .update({ status: "active", started_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) return fail("Belum bisa menerima sesi.");
  if (session.request_id) {
    await supabase.from("counseling_requests").update({ status: "active" }).eq("id", session.request_id);
  }
  revalidatePath("/counselor");
  revalidatePath(`/counseling/${sessionId}`);
  return { ok: true as const };
}

export async function cancelSession(sessionId: string) {
  const me = await requireUser();
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("counseling_sessions")
    .select("id, client_id, counselor_id, status, request_id")
    .eq("id", sessionId)
    .single();
  if (!session || (session.client_id !== me.id && session.counselor_id !== me.id && me.profile.role !== "admin")) {
    return fail("Sesi tidak ditemukan.");
  }
  if (session.status !== "pending" && session.status !== "waiting" && session.status !== "active") {
    return fail("Sesi ini sudah selesai.");
  }
  const { error } = await supabase
    .from("counseling_sessions")
    .update({ status: "cancelled", ended_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) return fail("Sesi belum dibatalkan.");
  if (session.request_id) {
    await supabase.from("counseling_requests").update({ status: "cancelled" }).eq("id", session.request_id);
  }
  revalidatePath("/counseling");
  revalidatePath(`/counseling/${sessionId}`);
  return { ok: true as const };
}

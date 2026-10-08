"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";

function fail(message: string) {
  return { ok: false as const, message };
}

export async function getAdminStats() {
  await requireUser(["admin"]);
  const supabase = await createClient();
  const [users, counselors, activeSessions, completedSessions, pendingReports] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("counselor_profiles").select("id", { count: "exact", head: true }).eq("is_verified", true),
    supabase.from("counseling_sessions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("counseling_sessions").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    totalUsers: users.count ?? 0,
    activeCounselors: counselors.count ?? 0,
    activeSessions: activeSessions.count ?? 0,
    completedSessions: completedSessions.count ?? 0,
    pendingReports: pendingReports.count ?? 0,
  };
}

export async function listUsers(search?: string) {
  await requireUser(["admin"]);
  const supabase = await createClient();
  let q = supabase.from("profiles").select("id, email, display_name, role, status, created_at").order("created_at", { ascending: false }).limit(100);
  if (search?.trim()) q = q.or(`display_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
  const { data } = await q;
  return data ?? [];
}

export async function setUserStatus(id: string, status: "active" | "suspended" | "deactivated") {
  const me = await requireUser(["admin"]);
  if (id === me.id) return fail("Kamu tidak bisa menangguhkan akunmu sendiri.");
  if (!["active", "suspended", "deactivated"].includes(status)) return fail("Status tidak dikenal.");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
  if (error) return fail("Status user belum berubah.");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function listCounselorAdmins() {
  await requireUser(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("counselor_profiles")
    .select("id, user_id, display_name, specialties, is_verified, availability_status")
    .order("display_name");
  return data ?? [];
}

export async function setCounselorVerified(userId: string, verified: boolean) {
  await requireUser(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("counselor_profiles").update({ is_verified: verified }).eq("user_id", userId);
  if (error) return fail("Status verifikasi belum berubah.");
  revalidatePath("/admin");
  revalidatePath("/counselors");
  return { ok: true as const };
}

const AVAIL = ["available", "busy", "offline"] as const;

export async function adminCreateCounselor(input: {
  email: string;
  password: string;
  displayName: string;
  bio: string;
  specialties: string[];
  languages: string[];
  availability: string;
}) {
  await requireUser(["admin"]);
  const email = (input.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Format email belum tepat.");
  if ((input.password ?? "").length < 8) return fail("Kata sandi counselor minimal 8 karakter.");
  const displayName = (input.displayName ?? "").trim().slice(0, 80) || "Counselor Baru";
  const specialties = (input.specialties ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 8);
  const languages = (input.languages ?? []).filter((l) => ["id", "en"].includes(l));
  if (!AVAIL.includes(input.availability as (typeof AVAIL)[number])) return fail("Status tidak dikenal.");

  const admin = createAdminClient();
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (cErr || !created.user) {
    const msg = cErr?.message ?? "";
    if (/already|exists|registered/i.test(msg)) return fail("Email ini sudah terdaftar.");
    return fail("Akun counselor belum dibuat. Coba lagi ya.");
  }
  const uid = created.user.id;
  await admin.from("profiles").update({ role: "counselor", display_name: displayName, email }).eq("id", uid);
  const { error: pErr } = await admin.from("counselor_profiles").upsert(
    {
      user_id: uid,
      display_name: displayName,
      bio: (input.bio ?? "").trim().slice(0, 1000),
      specialties,
      languages: languages.length ? languages : ["id"],
      avatar_emoji: "🌷",
      is_verified: true,
      availability_status: input.availability,
    },
    { onConflict: "user_id" }
  );
  if (pErr) return fail("Profil counselor belum tersimpan.");
  revalidatePath("/admin");
  revalidatePath("/counselors");
  return { ok: true as const };
}

export async function adminUpdateCounselor(input: {
  userId: string;
  displayName?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  availability?: string;
}) {
  await requireUser(["admin"]);
  const patch: {
    display_name?: string;
    bio?: string;
    specialties?: string[];
    languages?: string[];
    availability_status?: string;
  } = {};
  if (input.displayName !== undefined) {
    const v = input.displayName.trim().slice(0, 80);
    if (!v) return fail("Nama belum diisi.");
    patch.display_name = v;
  }
  if (input.bio !== undefined) patch.bio = input.bio.trim().slice(0, 1000);
  if (input.specialties !== undefined) {
    patch.specialties = input.specialties.map((s) => s.trim()).filter(Boolean).slice(0, 8);
  }
  if (input.languages !== undefined) {
    const langs = input.languages.filter((l) => ["id", "en"].includes(l));
    patch.languages = langs.length ? langs : ["id"];
  }
  if (input.availability !== undefined) {
    if (!AVAIL.includes(input.availability as (typeof AVAIL)[number])) return fail("Status tidak dikenal.");
    patch.availability_status = input.availability;
  }
  if (Object.keys(patch).length === 0) return { ok: true as const };
  const supabase = await createClient();
  const { error } = await supabase.from("counselor_profiles").update(patch).eq("user_id", input.userId);
  if (error) return fail("Profil counselor belum tersimpan.");
  revalidatePath("/admin");
  revalidatePath("/counselors");
  return { ok: true as const };
}

export async function listSessionsAdmin(status?: string) {
  await requireUser(["admin"]);
  const supabase = await createClient();
  let q = supabase.from("counseling_sessions").select("id, status, created_at, client_id, counselor_id").order("created_at", { ascending: false }).limit(200);
  if (status && status !== "all") q = q.eq("status", status);
  const { data: sessions } = await q;
  if (!sessions?.length) return [];
  const ids = [...new Set(sessions.flatMap((s) => [s.client_id, s.counselor_id]).filter(Boolean))] as string[];
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, display_name").in("id", ids)
    : { data: [] as { id: string; display_name: string | null }[] };
  const name = (id: string | null) => (profiles ?? []).find((p) => p.id === id)?.display_name ?? "—";
  return sessions.map((s) => ({ ...s, clientName: name(s.client_id), counselorName: name(s.counselor_id) }));
}

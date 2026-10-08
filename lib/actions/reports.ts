"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { checkRate, RATE_MSG } from "@/lib/ratelimit";
import { REPORT_TARGETS, REPORT_REASONS } from "@/lib/constants";

const TARGETS = REPORT_TARGETS;
const REASONS = REPORT_REASONS;

function fail(message: string) {
  return { ok: false as const, message };
}

export async function createReport(input: { targetType: string; targetId?: string; reason: string; description?: string }) {
  const me = await requireUser();
  if (!checkRate(`report:${me.id}`, 10)) return fail(RATE_MSG);
  if (!(TARGETS as readonly string[]).includes(input.targetType)) return fail("Jenis laporan belum tepat.");
  const reason = (input.reason ?? "").trim().slice(0, 120);
  if (!reason) return fail("Ceritakan alasan laporanmu ya.");
  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: me.id,
    target_type: input.targetType,
    target_id: input.targetId?.slice(0, 120) ?? null,
    reason,
    description: (input.description ?? "").trim().slice(0, 1000) || null,
    status: "pending",
  });
  if (error) return fail("Laporan belum terkirim. Coba lagi ya.");
  return { ok: true as const };
}

export async function listReports() {
  await requireUser(["admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(200);
  return data ?? [];
}

export async function resolveReport(id: string) {
  await requireUser(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return fail("Laporan belum ditandai selesai.");
  revalidatePath("/admin");
  return { ok: true as const };
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type Role = "client" | "counselor" | "admin";
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AuthedUser {
  id: string;
  email: string | undefined;
  profile: Profile;
}

export async function getCurrentUser(): Promise<AuthedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile || profile.status !== "active") return null;
  return { id: user.id, email: user.email ?? undefined, profile };
}

export async function requireUser(roles?: Role[]): Promise<AuthedUser> {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (roles && !roles.includes(me.profile.role as Role)) {
    if (me.profile.role === "admin") redirect("/admin");
    if (me.profile.role === "counselor") redirect("/counselor");
    redirect("/dashboard");
  }
  return me;
}

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

const ROLE_HOME: Record<string, string> = { client: "/dashboard", counselor: "/counselor", admin: "/admin" };

function redirectWithCookies(request: NextRequest, response: NextResponse, to: string) {
  const url = request.nextUrl.clone();
  url.pathname = to;
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value, c));
  return redirect;
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Segment-aware: "/counselors" (publik) tidak boleh cocok dengan area "/counselor".
  // Detail sesi (/counseling/[id]) boleh dibuka client/counselor/admin yang terlibat
  // (otorisasi partisipasi ditegakkan di page) agar counselor bisa chat.
  const seg = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  const isCounselingList = pathname === "/counseling";
  const needsAuth =
    seg("/dashboard") ||
    isCounselingList ||
    (seg("/counseling") && pathname !== "/counseling/new" && pathname !== "/counseling") ||
    seg("/journal") ||
    seg("/mood") ||
    seg("/profile") ||
    seg("/settings") ||
    seg("/counselor") ||
    seg("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!needsAuth && !isAuthPage) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.cookies.toString());
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (needsAuth) return redirectWithCookies(request, response, "/login");
    return response;
  }

  const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", user.id).single();
  const role = profile?.role ?? "client";
  if (!profile || profile.status !== "active") {
    // Akun ditangguhkan/dinonaktifkan: JANGAN pantulkan (itu menyebabkan redirect loop).
    // Tetap tampilkan /login dengan pesan ramah; halaman proteksi dialihkan sekali saja.
    if (pathname === "/login") return response;
    if (needsAuth || isAuthPage) return redirectWithCookies(request, response, "/login?suspended=1");
    return response;
  }

  if (isAuthPage) return redirectWithCookies(request, response, ROLE_HOME[role] ?? "/dashboard");
  if (seg("/admin") && role !== "admin") {
    return redirectWithCookies(request, response, ROLE_HOME[role] ?? "/dashboard");
  }
  if (seg("/counselor") && role !== "counselor" && role !== "admin") {
    return redirectWithCookies(request, response, ROLE_HOME[role] ?? "/dashboard");
  }
  // Area client hanya untuk client: daftar konseling & area pribadi.
  // Detail sesi dibuka untuk peran apa pun yang login (partisipasi dicek di page).
  const clientArea =
    seg("/dashboard") ||
    isCounselingList ||
    seg("/journal") ||
    seg("/mood") ||
    seg("/profile") ||
    seg("/settings");
  if (clientArea && role !== "client") {
    return redirectWithCookies(request, response, ROLE_HOME[role] ?? "/dashboard");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

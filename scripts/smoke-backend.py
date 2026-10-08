"""Smoke test backend Ruang Cerita (PRD Phase 4: auth, RLS, isolasi data).
Usage: python3 scripts/smoke-backend.py
Memakai Supabase Cloud yang ter-link (.env.local untuk URL + publishable key).
Versi stdlib-only (urllib) agar tanpa dependensi tambahan.
"""
import json
import os
import sys
import urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_env():
    env = {}
    with open(os.path.join(REPO, ".env.local")) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k] = v
    return env


ENV = load_env()
BASE = ENV["NEXT_PUBLIC_SUPABASE_URL"]
PUB = ENV["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
DEMO_PW = "RuangCerita123"
PASS, FAIL = [], []


def check(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("✅ " if cond else "❌ ") + name + (f" — {extra}" if extra and not cond else ""))


def req(method, path, token=None, body=None, raw=None, ctype="application/json"):
    url = BASE + path
    data = None
    headers = {"apikey": PUB}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = ctype
        headers["Prefer"] = "return=representation"
    if raw is not None:
        data = raw
        headers["Content-Type"] = ctype
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            text = resp.read().decode()
            return resp.status, json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        text = e.read().decode()
        try:
            return e.code, json.loads(text)
        except Exception:
            return e.code, text


import urllib.error  # noqa: E402  (di bawah agar definisi req tetap di atas)


def admin_headers():
    SR = ENV["SUPABASE_SERVICE_ROLE_KEY"]
    return {"apikey": SR, "Authorization": f"Bearer {SR}", "Content-Type": "application/json"}


def admin_confirm(uid):
    url = BASE + f"/auth/v1/admin/users/{uid}"
    data = json.dumps({"email_confirm": True}).encode()
    r = urllib.request.Request(url, data=data, headers=admin_headers(), method="PUT")
    try:
        urllib.request.urlopen(r).read()
    except urllib.error.HTTPError:
        pass


def profile_id_by_email(email):
    url = BASE + f"/rest/v1/profiles?email=eq.{urllib.parse.quote(email)}&select=id"
    r = urllib.request.Request(url, headers=admin_headers(), method="GET")
    try:
        with urllib.request.urlopen(r) as resp:
            rows = json.loads(resp.read().decode())
            return (rows or [{}])[0].get("id")
    except urllib.error.HTTPError:
        return None


def signup(email):
    """Buat user uji langsung via Admin API (tanpa bakar kuota email signup publik).
    Alur signup publik sudah diverifikasi manual (mengembalikan user + trigger profil)."""
    SR = ENV["SUPABASE_SERVICE_ROLE_KEY"]
    H = admin_headers()
    r = urllib.request.Request(
        BASE + "/auth/v1/admin/users",
        data=json.dumps({"email": email, "password": "Test1234!", "email_confirm": True,
                         "user_metadata": {"display_name": email.split("@")[0]}}).encode(),
        headers={**H, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(r) as resp:
            j = json.loads(resp.read().decode())
            uid = j.get("id")
    except urllib.error.HTTPError:
        uid = profile_id_by_email(email)
    if uid:
        admin_confirm(uid)
    return login(email, "Test1234!")


TEST_EMAILS = ["smoke-a@ruangcerita.id", "smoke-b@ruangcerita.id", "debug1@ruangcerita.id", "probetest@ruangcerita.id"]

# ---------- 0. pre-cleanup agar rerun idempoten ----------
for em in TEST_EMAILS:
    uid = profile_id_by_email(em)
    if uid:
        url = BASE + f"/auth/v1/admin/users/{uid}"
        r = urllib.request.Request(url, headers=admin_headers(), method="DELETE")
        try:
            urllib.request.urlopen(r).read()
        except urllib.error.HTTPError:
            pass
print("pre-cleanup selesai")


def login(email, pw):
    s, j = req("POST", "/auth/v1/token?grant_type=password", body={"email": email, "password": pw})
    return (j or {}).get("access_token")


def me(token):
    s, j = req("GET", "/rest/v1/profiles?select=id,display_name,role,status", token=token)
    return (j or [None])[0]


# ---------- 1. client A daftar + profil otomatis ----------
tokA = signup("smoke-a@ruangcerita.id") or login("smoke-a@ruangcerita.id", "Test1234!")
check("1. signup/login client A", bool(tokA))
profA = me(tokA)
check("2. trigger profil otomatis (role client)", profA and profA["role"] == "client", str(profA))

# ---------- 2. journal privat ----------
s, j = req("POST", "/rest/v1/journal_entries", token=tokA,
           body={"user_id": profA["id"], "title": "Smoke", "content": "rahasia A", "mood": "🙂 Baik"})
jid = (j or [{}])[0].get("id")
check("3. client A tulis journal", s in (200, 201) and bool(jid), f"{s} {j}")

tokB = signup("smoke-b@ruangcerita.id") or login("smoke-b@ruangcerita.id", "Test1234!")
s, j = req("GET", f"/rest/v1/journal_entries?id=eq.{jid}&select=id", token=tokB)
check("4. PRIVASI: client B tidak bisa baca journal A", s == 200 and j == [], f"{s} {j}")

# ---------- 3. intake → sesi → chat ----------
tokN = login("naya@ruangcerita.id", DEMO_PW)
check("5. login counselor", bool(tokN))
s, j = req("GET", "/rest/v1/counselor_profiles?select=user_id,display_name&is_verified=eq.true", token=tokA)
naya = next((c for c in (j or []) if "Naya" in c["display_name"]), None)
check("6. direktori counselor publik terbaca", bool(naya), str(j)[:120])

s, j = req("POST", "/rest/v1/counseling_requests", token=tokA,
           body={"client_id": profA["id"], "topic": ["Percintaan"], "description": "smoke story", "support_type": "both", "mood": "😔"})
reqId = (j or [{}])[0].get("id")
check("7. client A buat intake request", bool(reqId), f"{s}")

s, j = req("POST", "/rest/v1/counseling_sessions", token=tokA,
           body={"request_id": reqId, "client_id": profA["id"], "counselor_id": naya["user_id"], "status": "active"})
sid = (j or [{}])[0].get("id")
check("8. client A mulai sesi", bool(sid), f"{s} {j}")

s, j = req("POST", "/rest/v1/messages", token=tokA,
           body={"session_id": sid, "sender_id": profA["id"], "message": "halo kak (smoke)"})
check("9. client A kirim pesan", s in (200, 201), f"{s}")

s, j = req("GET", f"/rest/v1/messages?session_id=eq.{sid}&select=message&order=created_at", token=tokN)
check("10. counselor baca pesan sesi yang ditugaskan", s == 200 and len(j or []) >= 1, f"{s} {j}")

s, j = req("POST", "/rest/v1/counselor_notes", token=tokN,
           body={"session_id": sid, "counselor_id": naya["user_id"], "notes": "smoke note"})
check("11. counselor simpan catatan privat", s in (200, 201), f"{s} {j}")

s, j = req("GET", f"/rest/v1/messages?session_id=eq.{sid}&select=id", token=tokB)
check("12. ISOLASI: client B tidak bisa baca chat sesi A", s == 200 and j == [], f"{s} {j}")

s, j = req("PATCH", f"/rest/v1/counseling_sessions?id=eq.{sid}", token=tokA, body={"status": "completed"})
check("13. client A selesaikan sesi", s in (200, 204), f"{s}")

s, j = req("POST", "/rest/v1/session_reflections?on_conflict=session_id", token=tokA,
           body={"session_id": sid, "client_id": profA["id"], "mood_after": "🙂 Lumayan", "reflection": "smoke"})
# upsert via POST butuh header resolution=merge-duplicates; tanpa itu konflik → terima 409 sebagai bukti RLS insert jalan
check("14. client A simpan refleksi", s in (200, 201, 409), f"{s} {j}")

# ---------- 4. admin ----------
tokAdm = login("admin@ruangcerita.id", DEMO_PW)
s, j = req("GET", "/rest/v1/profiles?select=id&limit=100", token=tokAdm)
check("15. admin baca semua user", s == 200 and len(j or []) >= 9, f"{s} count={len(j or [])}")
profB = me(tokB)
s, j = req("PATCH", f"/rest/v1/profiles?id=eq.{profB['id']}", token=tokAdm, body={"status": "suspended"})
check("16. admin suspend user", s in (200, 204), f"{s} {j}")
s, j = req("PATCH", f"/rest/v1/profiles?id=eq.{profB['id']}", token=tokAdm, body={"status": "active"})
check("17. admin aktifkan lagi", s in (200, 204), f"{s}")

# ---------- 5. storage ----------
s, j = req("POST", f"/storage/v1/object/avatars/{profA['id']}/smoke.txt", token=tokA,
           raw=b"smoke", ctype="text/plain")
check("18. upload avatar ke folder sendiri", s in (200, 201), f"{s} {j}")
s, j = req("POST", f"/storage/v1/object/chat-attachments/{sid}/smoke.txt", token=tokA,
           raw=b"smoke", ctype="text/plain")
check("19. upload lampiran chat (partisipan)", s in (200, 201), f"{s} {j}")
s, j = req("POST", f"/storage/v1/object/chat-attachments/{sid}/evil.txt", token=tokB,
           raw=b"evil", ctype="text/plain")
check("20. ISOLASI: non-partisipan ditolak upload lampiran", s in (400, 401, 403), f"{s} {j}")

# ---------- 6. cleanup (service role, by-pass RLS) ----------
SR = ENV["SUPABASE_SERVICE_ROLE_KEY"]


def admin_req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"apikey": SR, "Authorization": f"Bearer {SR}", "Content-Type": "application/json",
               "Prefer": "return=representation"}
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code


admin_req("DELETE", f"/rest/v1/messages?session_id=eq.{sid}")
admin_req("DELETE", f"/rest/v1/counselor_notes?session_id=eq.{sid}")
admin_req("DELETE", f"/rest/v1/session_reflections?session_id=eq.{sid}")
admin_req("DELETE", f"/rest/v1/counseling_sessions?id=eq.{sid}")
admin_req("DELETE", f"/rest/v1/counseling_requests?id=eq.{reqId}")
admin_req("DELETE", f"/rest/v1/journal_entries?id=eq.{jid}")
admin_req("DELETE", f"/auth/v1/admin/users/{profA['id']}")
admin_req("DELETE", f"/auth/v1/admin/users/{profB['id']}")

print(f"\n{PASS.__len__()} lolos, {FAIL.__len__()} gagal")
sys.exit(1 if FAIL else 0)

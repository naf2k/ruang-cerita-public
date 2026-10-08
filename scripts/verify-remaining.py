"""Verifikasi penutup: anti-eskalasi + sisa fitur PRD (TC012/TC017/TC023/TC027/TC030).
Usage: python3 scripts/verify-remaining.py — exit 0 bila semua lolos."""
import json
import sys
import urllib.request
import urllib.error

REPO = "/Users/haimac/orca/projects/Layanan BK"
env = {}
with open(f"{REPO}/.env.local") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k] = v
BASE, PUB, SR = env["NEXT_PUBLIC_SUPABASE_URL"], env["NEXT_PUBLIC_SUPABASE_ANON_KEY"], env["SUPABASE_SERVICE_ROLE_KEY"]
PASS, FAIL = [], []


def check(name, cond, extra=""):
    (PASS if cond else FAIL).append(name)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f" — {extra}"))


def call(method, path, token=None, body=None, key=None, prefer=True):
    k = key or PUB
    h = {"apikey": k, "Authorization": f"Bearer {token or k}", "Content-Type": "application/json"}
    if prefer:
        h["Prefer"] = "return=representation"
    r = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None, headers=h, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            t = resp.read().decode()
            return resp.status, json.loads(t) if t else None
    except urllib.error.HTTPError as e:
        t = e.read().decode()
        try:
            return e.code, json.loads(t)
        except Exception:
            return e.code, t


def admin_create(email):
    r = urllib.request.Request(BASE + "/auth/v1/admin/users", method="POST",
        data=json.dumps({"email": email, "password": "Test1234!", "email_confirm": True}).encode(),
        headers={"apikey": SR, "Authorization": f"Bearer {SR}", "Content-Type": "application/json"})
    try:
        return json.loads(urllib.request.urlopen(r).read().decode())["id"]
    except urllib.error.HTTPError:
        r2 = urllib.request.Request(BASE + f"/rest/v1/profiles?email=eq.{email}&select=id",
            headers={"apikey": SR, "Authorization": f"Bearer {SR}"})
        return json.loads(urllib.request.urlopen(r2).read().decode())[0]["id"]


def login(email, pw="Test1234!"):
    s, j = call("POST", "/auth/v1/token?grant_type=password", body={"email": email, "password": pw})
    return (j or {}).get("access_token")


def profile_id(email):
    r = urllib.request.Request(BASE + f"/rest/v1/profiles?email=eq.{email}&select=id",
        headers={"apikey": SR, "Authorization": f"Bearer {SR}"})
    return json.loads(urllib.request.urlopen(r).read().decode())[0]["id"]


# ---- A. anti-eskalasi (DoD #14) ----
tmp = admin_create("verify-temp@ruangcerita.id")
tokT = login("verify-temp@ruangcerita.id")
s, j = call("PATCH", f"/rest/v1/profiles?id=eq.{tmp}", token=tokT, body={"role": "admin"})
check("A1. client tidak bisa angkat diri jadi admin", s not in (200, 201, 204), f"{s} {str(j)[:120]}")
s, j = call("PATCH", f"/rest/v1/profiles?id=eq.{tmp}", token=tokT, body={"display_name": "Temp OK"})
check("A2. update nama sendiri tetap boleh", s in (200, 204), f"{s}")
s, j = call("PATCH", f"/rest/v1/profiles?id=eq.{tmp}", token=tokT, body={"status": "suspended"})
check("A3. client tidak bisa suspend diri", s not in (200, 201, 204), f"{s}")
s, j = call("PATCH", f"/rest/v1/profiles?id=eq.{tmp}", token=tokT, body={"status": "deactivated"})
check("A4. nonaktif-mandiri tetap boleh", s in (200, 204), f"{s} {str(j)[:120]}")
call("DELETE", f"/auth/v1/admin/users/{tmp}", key=SR)

# ---- B. TC012 availability toggle ----
tokN = login("naya@ruangcerita.id", "RuangCerita123")
naya = profile_id("naya@ruangcerita.id")
s, j = call("PATCH", "/rest/v1/counselor_profiles?user_id=eq." + naya, token=tokN, body={"availability_status": "busy"})
check("B1. counselor ubah availability", s in (200, 204), f"{s}")
s, j = call("GET", "/rest/v1/counselor_profiles?user_id=eq." + naya + "&select=availability_status", token=tokN)
check("B2. availability terbaca busy", (j or [{}])[0].get("availability_status") == "busy", f"{j}")
call("PATCH", "/rest/v1/counselor_profiles?user_id=eq." + naya, token=tokN, body={"availability_status": "available"})

# ---- C. TC017 intake data ----
s, j = call("GET", "/rest/v1/counseling_sessions?counselor_id=eq." + naya + "&select=id,request_id&limit=5", token=tokN)
with_req = [x for x in (j or []) if x.get("request_id")]
ok17 = False
if with_req:
    s2, j2 = call("GET", "/rest/v1/counseling_requests?id=eq." + with_req[0]["request_id"] + "&select=topic,description,support_type,mood", token=tokN)
    ok17 = bool(j2 and j2[0].get("description") is not None)
check("C1. counselor baca ringkasan intake sesi", ok17, f"{j2 if with_req else 'no-session-with-request'}")

# ---- D. TC023 cancel waiting ----
tokC = login("testclient@ruangcerita.id", "TestRuangCerita123")
cli = profile_id("testclient@ruangcerita.id")
s, j = call("POST", "/rest/v1/counseling_requests", token=tokC,
            body={"client_id": cli, "topic": ["Keluarga"], "description": "uji cancel", "support_type": "both", "status": "waiting"})
rid = (j or [{}])[0].get("id")
s, j = call("POST", "/rest/v1/counseling_sessions", token=tokC,
            body={"request_id": rid, "client_id": cli, "counselor_id": naya, "status": "waiting"})
sid = (j or [{}])[0].get("id")
s, j = call("PATCH", f"/rest/v1/counseling_sessions?id=eq.{sid}", token=tokC, body={"status": "cancelled"})
check("D1. client batalkan sesi menunggu", s in (200, 204), f"{s}")
s, j = call("GET", f"/rest/v1/counseling_sessions?id=eq.{sid}&select=status", token=tokC)
check("D2. status sesi = cancelled", (j or [{}])[0].get("status") == "cancelled", f"{j}")
call("DELETE", f"/rest/v1/counseling_sessions?id=eq.{sid}", key=SR)
call("DELETE", f"/rest/v1/counseling_requests?id=eq.{rid}", key=SR)

# ---- E. TC030 notes + points ----
s, j = call("GET", "/rest/v1/counseling_sessions?counselor_id=eq." + naya + "&select=id&limit=1", token=tokN)
esid = (j or [{}])[0].get("id")
s, j = call("POST", "/rest/v1/counselor_notes?on_conflict=session_id,counselor_id", token=tokN,
            body={"session_id": esid, "counselor_id": naya, "notes": "uji", "action_points": ["Langkah uji 1"]})
if s == 409:
    s, j = call("PATCH", f"/rest/v1/counselor_notes?session_id=eq.{esid}&counselor_id=eq.{naya}", token=tokN,
                body={"notes": "uji", "action_points": ["Langkah uji 1"]})
check("E1. counselor simpan notes + action points", s in (200, 201, 204), f"{s} {str(j)[:120]}")
s, j = call("GET", f"/rest/v1/counselor_notes?session_id=eq.{esid}&counselor_id=eq.{naya}&select=notes,action_points", token=tokN)
check("E2. notes + points terbaca kembali", bool(j and j[0].get("action_points") == ["Langkah uji 1"]), f"{j}")

print(f"\n{len(PASS)} lolos, {len(FAIL)} gagal")
sys.exit(1 if FAIL else 0)

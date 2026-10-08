-- Ruang Cerita — admin & isolasi lintas-peran (PRD §11, §14, §33)
-- 1. Status akun untuk suspend/deactivate (admin user management)
-- 2. Helper is_admin() + kebijakan admin (read/manage semua domain operasional)
-- 3. Counselor baca klien yang ditugaskan; client baca counselor yang menangani sesinya

-- ============ STATUS AKUN ============
alter table public.profiles
  add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended', 'deactivated'));

-- ============ HELPER ADMIN ============
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ============ PROFILES ============
-- Admin: baca semua user + ubah status/peran
create policy "Admins read all profiles" on public.profiles
  for select using (public.is_admin());
create policy "Admins update any profile" on public.profiles
  for update using (public.is_admin());

-- Counselor: baca profil klien yang ditugaskan padanya (identitas anonim untuk dashboard)
create policy "Counselors read assigned clients" on public.profiles
  for select using (
    exists (
      select 1 from public.counseling_sessions s
      where s.counselor_id = (select auth.uid())
        and s.client_id = profiles.id
    )
  );

-- Client: baca profil counselor yang menangani sesinya (nama untuk header chat)
create policy "Clients read assigned counselors" on public.profiles
  for select using (
    exists (
      select 1 from public.counseling_sessions s
      where s.client_id = (select auth.uid())
        and s.counselor_id = profiles.id
    )
  );

-- ============ COUNSELOR PROFILES ============
-- Admin: verifikasi / nonaktifkan counselor
create policy "Admins manage counselor profiles" on public.counselor_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ============ COUNSELING REQUESTS ============
-- Admin: baca semua request (assignment & moderation)
create policy "Admins read all requests" on public.counseling_requests
  for select using (public.is_admin());

-- Counselor: baca intake yang terhubung ke sesinya (PRD §10 session detail)
create policy "Counselors read linked intakes" on public.counseling_requests
  for select using (
    exists (
      select 1 from public.counseling_sessions s
      where s.counselor_id = (select auth.uid())
        and s.request_id = counseling_requests.id
    )
  );

-- ============ COUNSELING SESSIONS ============
-- Admin: kelola semua sesi
create policy "Admins read all sessions" on public.counseling_sessions
  for select using (public.is_admin());
create policy "Admins update any session" on public.counseling_sessions
  for update using (public.is_admin());

-- ============ MESSAGES ============
-- Admin: baca pesan untuk moderation laporan (tanpa akses journal/notes privat)
create policy "Admins read all messages" on public.messages
  for select using (public.is_admin());

-- ============ ARTICLES ============
-- Admin: kelola konten Ruang Baca (PRD §11 content management)
create policy "Admins manage articles" on public.articles
  for all using (public.is_admin()) with check (public.is_admin());

-- ============ REPORTS ============
-- Admin: review & resolve semua laporan
create policy "Admins manage reports" on public.reports
  for all using (public.is_admin()) with check (public.is_admin());

-- Ruang Cerita — engagement: action points + read receipts (PRD §8.4, §10)
-- 1. Action points counselor per sesi (langkah berikutnya yang disarankan)
-- 2. session_reads untuk badge pesan belum dibaca

alter table public.counselor_notes
  add column if not exists action_points text[] not null default '{}';

create table if not exists public.session_reads (
  session_id uuid not null references public.counseling_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

alter table public.session_reads enable row level security;

drop policy if exists "Users manage own read state" on public.session_reads;
create policy "Users manage own read state" on public.session_reads
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.session_reads to authenticated;

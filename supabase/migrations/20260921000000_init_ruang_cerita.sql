-- Ruang Cerita — initial schema (PRD §15 + §13 RLS + §16 realtime + §17 storage)
-- Dijalankan via Supabase CLI: supabase db reset / supabase migration up

-- ============ EXTENSIONS ============
create extension if not exists "pgcrypto";

-- ============ PROFILES (users) ============
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text not null default 'client' check (role in ('client', 'counselor', 'admin')),
  preferred_language text not null default 'id',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile saat signup (Supabase Auth)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ COUNSELOR PROFILES ============
create table public.counselor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  display_name text not null,
  bio text not null default '',
  specialties text[] not null default '{}',
  languages text[] not null default array['id'],
  avatar_emoji text not null default '🌷',
  is_verified boolean not null default false,
  availability_status text not null default 'offline'
    check (availability_status in ('available', 'busy', 'offline')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ COUNSELING REQUESTS (intake) ============
create table public.counseling_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  topic text[] not null default '{}',
  description text not null default '',
  support_type text not null default 'both'
    check (support_type in ('listened', 'solution', 'both')),
  mood text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'waiting', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index counseling_requests_client_idx on public.counseling_requests (client_id, created_at desc);

-- ============ COUNSELING SESSIONS ============
create table public.counseling_sessions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.counseling_requests (id) on delete set null,
  client_id uuid not null references public.profiles (id) on delete cascade,
  counselor_id uuid references public.profiles (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'waiting', 'completed', 'cancelled')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index counseling_sessions_client_idx on public.counseling_sessions (client_id, created_at desc);
create index counseling_sessions_counselor_idx on public.counseling_sessions (counselor_id, created_at desc);

-- ============ MESSAGES (realtime chat) ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.counseling_sessions (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  message text not null check (char_length(message) between 1 and 2000),
  attachment_url text,
  created_at timestamptz not null default now()
);
create index messages_session_idx on public.messages (session_id, created_at);

-- ============ COUNSELOR NOTES (privat) ============
create table public.counselor_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.counseling_sessions (id) on delete cascade,
  counselor_id uuid not null references public.profiles (id) on delete cascade,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, counselor_id)
);

-- ============ SESSION REFLECTIONS ============
create table public.session_reflections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.counseling_sessions (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  mood_after text,
  reflection text,
  created_at timestamptz not null default now(),
  unique (session_id)
);

-- ============ MOOD ENTRIES ============
create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mood text not null,
  note text,
  created_at timestamptz not null default now()
);
create index mood_entries_user_idx on public.mood_entries (user_id, created_at desc);

-- ============ JOURNAL ENTRIES (privat) ============
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  content text not null,
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index journal_entries_user_idx on public.journal_entries (user_id, created_at desc);

-- ============ ARTICLES (Ruang Baca) ============
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null check (category in ('relationship', 'family', 'student', 'self')),
  excerpt text not null default '',
  content text not null default '',
  cover_emoji text not null default '🌱',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_status_idx on public.articles (status, category);

-- ============ REPORTS ============
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type text not null check (target_type in ('user', 'counselor', 'session', 'message', 'article', 'other')),
  target_id text,
  reason text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ============ UPDATED_AT TRIGGER ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_counselor_touch on public.counselor_profiles;
create trigger trg_counselor_touch before update on public.counselor_profiles
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_requests_touch on public.counseling_requests;
create trigger trg_requests_touch before update on public.counseling_requests
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_sessions_touch on public.counseling_sessions;
create trigger trg_sessions_touch before update on public.counseling_sessions
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_notes_touch on public.counselor_notes;
create trigger trg_notes_touch before update on public.counselor_notes
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_journal_touch on public.journal_entries;
create trigger trg_journal_touch before update on public.journal_entries
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_articles_touch on public.articles;
create trigger trg_articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.counselor_profiles enable row level security;
alter table public.counseling_requests enable row level security;
alter table public.counseling_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.counselor_notes enable row level security;
alter table public.session_reflections enable row level security;
alter table public.mood_entries enable row level security;
alter table public.journal_entries enable row level security;
alter table public.articles enable row level security;
alter table public.reports enable row level security;

-- profiles: user kelola miliknya sendiri; counselor terverifikasi terbaca publik terautentikasi
create policy "Users read own profile" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "Users insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles
  for update using ((select auth.uid()) = id);

-- counselor_profiles: yang terverifikasi bisa dibaca semua orang (direktori publik)
create policy "Verified counselors are publicly readable" on public.counselor_profiles
  for select using (is_verified = true);
create policy "Counselors manage own profile" on public.counselor_profiles
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- counseling_requests: client kelola miliknya; counselor baca request pending (untuk assignment via service_role di server)
create policy "Clients manage own requests" on public.counseling_requests
  for all using ((select auth.uid()) = client_id) with check ((select auth.uid()) = client_id);

-- counseling_sessions: client baca miliknya; counselor baca sesi yang ditugaskan
create policy "Clients read own sessions" on public.counseling_sessions
  for select using ((select auth.uid()) = client_id);
create policy "Clients insert own sessions" on public.counseling_sessions
  for insert with check ((select auth.uid()) = client_id);
create policy "Counselors read assigned sessions" on public.counseling_sessions
  for select using ((select auth.uid()) = counselor_id);
create policy "Participants update session status" on public.counseling_sessions
  for update using ((select auth.uid()) = client_id or (select auth.uid()) = counselor_id);

-- messages: hanya partisipan sesi (client / counselor yang ditugaskan)
create policy "Participants read session messages" on public.messages
  for select using (
    exists (
      select 1 from public.counseling_sessions s
      where s.id = session_id
        and ((select auth.uid()) = s.client_id or (select auth.uid()) = s.counselor_id)
    )
  );
create policy "Participants send session messages" on public.messages
  for insert with check (
    (select auth.uid()) = sender_id and
    exists (
      select 1 from public.counseling_sessions s
      where s.id = session_id
        and ((select auth.uid()) = s.client_id or (select auth.uid()) = s.counselor_id)
    )
  );

-- counselor_notes: hanya counselor pemilik (privat, tak terlihat klien — PRD §10)
create policy "Counselors manage own notes" on public.counselor_notes
  for all using ((select auth.uid()) = counselor_id) with check ((select auth.uid()) = counselor_id);

-- session_reflections: client kelola refleksinya sendiri
create policy "Clients manage own reflections" on public.session_reflections
  for all using ((select auth.uid()) = client_id) with check ((select auth.uid()) = client_id);

-- mood_entries: milik user sendiri
create policy "Users manage own moods" on public.mood_entries
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- journal_entries: privat milik user (counselor TIDAK bisa baca — PRD §8.7)
create policy "Users manage own journal" on public.journal_entries
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- articles: published terbaca publik; tulis via service_role (admin)
create policy "Published articles are publicly readable" on public.articles
  for select using (status = 'published');

-- reports: pelapor kelola laporannya sendiri
create policy "Reporters manage own reports" on public.reports
  for all using ((select auth.uid()) = reporter_id) with check ((select auth.uid()) = reporter_id);

-- ============ REALTIME (chat) ============
-- Daftarkan tabel chat ke publikasi realtime (idempotent)
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.counseling_sessions;

-- ============ STORAGE ============
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
       ('article-covers', 'article-covers', true),
       ('chat-attachments', 'chat-attachments', false)
on conflict (id) do nothing;

-- avatars: publik bisa baca; user terautentikasi bisa upload ke foldernya sendiri
create policy "Avatar images are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Users upload own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- article-covers: publik baca (upload via service_role/admin)
create policy "Article covers are publicly readable" on storage.objects
  for select using (bucket_id = 'article-covers');

-- chat-attachments: hanya partisipan sesi (path: <session_id>/...)
create policy "Participants read chat attachments" on storage.objects
  for select using (
    bucket_id = 'chat-attachments' and
    exists (
      select 1 from public.counseling_sessions s
      where s.id::text = (storage.foldername(name))[1]
        and ((select auth.uid()) = s.client_id or (select auth.uid()) = s.counselor_id)
    )
  );
create policy "Participants upload chat attachments" on storage.objects
  for insert with check (
    bucket_id = 'chat-attachments' and
    exists (
      select 1 from public.counseling_sessions s
      where s.id::text = (storage.foldername(name))[1]
        and ((select auth.uid()) = s.client_id or (select auth.uid()) = s.counselor_id)
    )
  );

-- ============ SEED: artik el Ruang Baca (9 artikel, sesuai prototipe) ============
insert into public.articles (title, slug, category, excerpt, content, cover_emoji, status) values
  ('Ketika hubungan terasa melelahkan', 'ketika-hubungan-terasa-melelahkan', 'relationship', 'Capek sama hubungan bukan berarti kamu gagal. Yuk pahami pelan-pelan.', 'Capek sama hubungan bukan berarti kamu gagal. Kadang rasa sayang masih ada, tapi tenaga buat ngejalaninnya tinggal dikit. Kalau kamu lagi di fase itu, sini duduk dulu — kita bahas pelan-pelan.', '💛', 'published'),
  ('Ngomong baik-baik saat lagi marah', 'ngomong-baik-baik-saat-lagi-marah', 'relationship', 'Obrolan paling susah biasanya paling perlu.', 'Obrolan paling susah biasanya paling perlu. Mulai dengan kalimat yang lembut, jeda kalau panas, lanjut kalau sudah tenang.', '💬', 'published'),
  ('Setelah putus: pelan-pelan ya', 'setelah-putus-pelan-pelan-ya', 'relationship', 'Nggak harus pulih hari ini.', 'Nggak harus pulih hari ini. Satu langkah kecil tiap hari cukup. Minta ditemani bukan tanda lemah.', '🌧️', 'published'),
  ('Ketika sulit bicara dengan orang tua', 'ketika-sulit-bicara-dengan-orang-tua', 'family', 'Susah ngomong di rumah itu wajar.', 'Susah ngomong di rumah itu wajar. Cari waktu yang aman, mulai dari hal kecil, dan jaga batasanmu.', '🏠', 'published'),
  ('Bilang “nggak” tanpa rasa bersalah', 'bilang-nggak-tanpa-rasa-bersalah', 'self', 'Batasan kecil menjaga tenagamu.', 'Batasan bukan berarti nggak sayang. Satu kalimat berani bisa menjaga harimu tetap ringan.', '🧱', 'published'),
  ('Ketika tugas terasa terlalu banyak', 'ketika-tugas-terasa-terlalu-banyak', 'student', 'Urai jadi potongan kecil.', 'Urai jadi potongan kecil. Satu tugas selesai lebih baik daripada semua dipikirin sekaligus.', '🎓', 'published'),
  ('Tekanan nilai dan ekspektasi', 'tekanan-nilai-dan-ekspektasi', 'student', 'Nilaimu bukan seluruh ceritamu.', 'Nilaimu bukan seluruh ceritamu. Pisahkan usaha dan hasil, rayakan progres kecil.', '📚', 'published'),
  ('Kehilangan motivasi belajar', 'kehilangan-motivasi-belajar', 'student', 'Motivasi naik turun itu normal.', 'Motivasi naik turun itu normal. Cari pemantik kecil yang realistis dan mulai 10 menit saja.', '🔋', 'published'),
  ('Menerima diri pelan-pelan', 'menerima-diri-pelan-pelan', 'self', 'Menerima diri itu proses.', 'Menerima diri itu proses. Pelan-pelan, satu hal baik tiap hari, dan minta ditemani kalau berat.', '🌱', 'published')
on conflict (slug) do nothing;

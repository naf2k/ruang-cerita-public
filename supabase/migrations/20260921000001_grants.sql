-- Ruang Cerita — grants untuk PostgREST (anon/authenticated).
-- RLS policies (migrasi 20260921000000) memfilter baris; grants ini membuka akses peran.

-- profiles: user terautentikasi kelola profilnya sendiri
grant select, insert, update, delete on public.profiles to authenticated;

-- counselor_profiles: direktori publik terbaca anon + authenticated
grant select on public.counselor_profiles to anon, authenticated;
grant insert, update, delete on public.counselor_profiles to authenticated;

-- intake & sesi: client/counselor terautentikasi
grant select, insert, update, delete on public.counseling_requests to authenticated;
grant select, insert, update, delete on public.counseling_sessions to authenticated;

-- chat realtime
grant select, insert, update, delete on public.messages to authenticated;

-- catatan, refleksi, mood, journal privat
grant select, insert, update, delete on public.counselor_notes to authenticated;
grant select, insert, update, delete on public.session_reflections to authenticated;
grant select, insert, update, delete on public.mood_entries to authenticated;
grant select, insert, update, delete on public.journal_entries to authenticated;

-- artikel: publik baca yang terbit
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;

-- laporan
grant select, insert, update, delete on public.reports to authenticated;

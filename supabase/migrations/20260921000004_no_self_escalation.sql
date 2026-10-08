-- Ruang Cerita — cegah eskalasi hak via update profil sendiri (PRD §33, DoD #14)
-- Temuan audit: kebijakan "Users update own profile" tidak membatasi kolom,
-- sehingga client teknis bisa PATCH role='admin'. Trigger ini menutupnya.
-- Pengecualian sah: service_role (server-side), admin, dan nonaktif-mandiri.

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  jwt_role text := coalesce((select auth.jwt() ->> 'role'), '');
  acting_admin boolean := public.is_admin();
begin
  -- service_role hanya ada di server (tidak pernah di client) → selalu boleh
  if jwt_role = 'service_role' then
    return NEW;
  end if;

  if (NEW.role is distinct from OLD.role) then
    if not acting_admin then
      raise exception 'role changes require admin';
    end if;
  end if;

  if (NEW.status is distinct from OLD.status) then
    if acting_admin then
      -- admin bebas menangguhkan / mengaktifkan / menonaktifkan
      null;
    elsif (
      OLD.status = 'active'
      and NEW.status = 'deactivated'
      and NEW.id = (select auth.uid())
      and NEW.role is not distinct from OLD.role
    ) then
      -- nonaktif-mandiri dari pengaturan akun: boleh
      null;
    else
      raise exception 'status changes require admin';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_profiles_no_escalation on public.profiles;
create trigger trg_profiles_no_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

-- Kencangkan insert profil: hanya role client + status active untuk milik sendiri
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id and role = 'client' and status = 'active');

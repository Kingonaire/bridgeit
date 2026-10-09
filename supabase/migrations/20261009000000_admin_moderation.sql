create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
  on public.admin_users for select to authenticated
  using (public.is_admin());

insert into public.admin_users (user_id, email)
select id, email from auth.users
where lower(email) = lower('kingonaire@gmail.com')
on conflict (user_id) do update set email = excluded.email;

alter table public.community_videos enable row level security;

drop policy if exists "Admins can update community videos" on public.community_videos;
create policy "Admins can update community videos"
  on public.community_videos for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete community videos" on public.community_videos;
create policy "Admins can delete community videos"
  on public.community_videos for delete to authenticated
  using (public.is_admin());

create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid null references public.companies(id) on delete restrict,
  full_name text null,
  email text not null,
  role text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('super_admin', 'company_admin', 'company_user')),
  constraint profiles_company_role_check check (
    (role = 'super_admin' and company_id is null)
    or
    (role in ('company_admin', 'company_user') and company_id is not null)
  )
);

create index if not exists companies_slug_idx on public.companies(slug);
create index if not exists profiles_company_id_idx on public.profiles(company_id);
create index if not exists profiles_email_idx on public.profiles(lower(email));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true
  limit 1
$$;

create or replace function public.current_company_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id
  from public.profiles
  where id = auth.uid()
    and is_active = true
  limit 1
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_app_role() = 'super_admin', false)
$$;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_super_admin() then
    return new;
  end if;

  if old.role is distinct from new.role
    or old.company_id is distinct from new.company_id
    or old.email is distinct from new.email then
    raise exception 'Only super_admin can change profile role, company_id or email';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
before update on public.profiles
for each row execute function public.protect_profile_privileged_fields();

alter table public.companies enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "companies_select_by_role" on public.companies;
create policy "companies_select_by_role"
on public.companies
for select
to authenticated
using (
  public.is_super_admin()
  or (
    id = public.current_company_id()
    and is_active = true
  )
);

drop policy if exists "companies_insert_super_admin" on public.companies;
create policy "companies_insert_super_admin"
on public.companies
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "companies_update_super_admin" on public.companies;
create policy "companies_update_super_admin"
on public.companies
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "companies_delete_super_admin" on public.companies;
create policy "companies_delete_super_admin"
on public.companies
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "profiles_select_by_role" on public.profiles;
create policy "profiles_select_by_role"
on public.profiles
for select
to authenticated
using (
  public.is_super_admin()
  or id = auth.uid()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
);

drop policy if exists "profiles_insert_by_role" on public.profiles;
create policy "profiles_insert_by_role"
on public.profiles
for insert
to authenticated
with check (
  public.is_super_admin()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
    and role = 'company_user'
  )
);

drop policy if exists "profiles_update_by_role" on public.profiles;
create policy "profiles_update_by_role"
on public.profiles
for update
to authenticated
using (
  public.is_super_admin()
  or id = auth.uid()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
)
with check (
  public.is_super_admin()
  or id = auth.uid()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
);

drop policy if exists "profiles_delete_super_admin" on public.profiles;
create policy "profiles_delete_super_admin"
on public.profiles
for delete
to authenticated
using (public.is_super_admin());

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.current_company_id() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

do $$
begin
  if to_regclass('public.app_roles') is null then
    if to_regclass('public.companies') is not null then
      execute $sql$
        create table public.app_roles (
          id uuid primary key default gen_random_uuid(),
          company_id uuid null references public.companies(id) on delete cascade,
          name text not null,
          slug text not null,
          description text null,
          permissions text[] not null default '{}',
          is_system boolean not null default false,
          is_active boolean not null default true,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      $sql$;
    else
      execute $sql$
        create table public.app_roles (
          id uuid primary key default gen_random_uuid(),
          company_id uuid null,
          name text not null,
          slug text not null,
          description text null,
          permissions text[] not null default '{}',
          is_system boolean not null default false,
          is_active boolean not null default true,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      $sql$;
    end if;
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create unique index if not exists app_roles_global_slug_uidx
on public.app_roles(slug)
where company_id is null;

create unique index if not exists app_roles_company_slug_uidx
on public.app_roles(company_id, slug)
where company_id is not null;

drop trigger if exists set_app_roles_updated_at on public.app_roles;
create trigger set_app_roles_updated_at
before update on public.app_roles
for each row execute function public.set_updated_at();

insert into public.app_roles (company_id, name, slug, description, permissions, is_system, is_active)
values
  (
    null,
    'Super Admin',
    'super_admin',
    'Acceso total a la plataforma',
    array[
      'platform.access',
      'platform.manage',
      'companies.read',
      'companies.manage',
      'users.read.global',
      'users.manage.global',
      'roles.read.global',
      'roles.manage.global',
      'company.access',
      'company.users.read',
      'company.users.manage',
      'company.roles.read',
      'company.roles.manage'
    ]::text[],
    true,
    true
  ),
  (
    null,
    'Company Admin',
    'company_admin',
    'Administrador de empresa',
    array[
      'company.access',
      'company.users.read',
      'company.users.manage'
    ]::text[],
    true,
    true
  ),
  (
    null,
    'Company User',
    'company_user',
    'Usuario base de empresa',
    array[
      'company.access'
    ]::text[],
    true,
    true
  )
on conflict do nothing;

alter table public.profiles
  add column if not exists role_id uuid null references public.app_roles(id) on delete restrict;

update public.profiles p
set role_id = r.id
from public.app_roles r
where p.role = r.slug
  and r.company_id is null
  and p.role_id is null;

create or replace function public.sync_profile_role_from_role_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role public.app_roles%rowtype;
begin
  select *
  into target_role
  from public.app_roles
  where id = new.role_id;

  if not found then
    raise exception 'Role not found for role_id %', new.role_id;
  end if;

  new.role = target_role.slug;

  if target_role.slug = 'super_admin' then
    new.company_id = null;
  elsif new.company_id is null then
    raise exception 'Non super_admin profiles must have company_id';
  end if;

  return new;
end;
$$;

drop trigger if exists sync_profile_role_from_role_id on public.profiles;
create trigger sync_profile_role_from_role_id
before insert or update of role_id on public.profiles
for each row execute function public.sync_profile_role_from_role_id();

create or replace function public.sync_profiles_role_slug_from_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.slug is distinct from new.slug then
    update public.profiles
    set role = new.slug
    where role_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_profiles_role_slug_from_role on public.app_roles;
create trigger sync_profiles_role_slug_from_role
after update of slug on public.app_roles
for each row execute function public.sync_profiles_role_slug_from_role();

create or replace function public.current_role_permissions()
returns text[]
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(r.permissions, '{}'::text[])
  from public.profiles p
  join public.app_roles r on r.id = p.role_id
  where p.id = auth.uid()
    and p.is_active = true
  limit 1
$$;

create or replace function public.has_permission(permission text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select permission = any(public.current_role_permissions())
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.has_permission('platform.manage'), false)
$$;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_company_role_check;

drop policy if exists "profiles_select_by_role" on public.profiles;
create policy "profiles_select_by_role"
on public.profiles
for select
to authenticated
using (
  public.is_super_admin()
  or id = auth.uid()
  or (
    public.has_permission('company.users.read')
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
    public.has_permission('company.users.manage')
    and company_id = public.current_company_id()
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
    public.has_permission('company.users.manage')
    and company_id = public.current_company_id()
  )
)
with check (
  public.is_super_admin()
  or id = auth.uid()
  or (
    public.has_permission('company.users.manage')
    and company_id = public.current_company_id()
  )
);

grant select, insert, update, delete on public.app_roles to authenticated;
grant execute on function public.current_role_permissions() to authenticated;
grant execute on function public.has_permission(text) to authenticated;

create or replace function public.ensure_profile_for_auth_user(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_company_id uuid default null,
  p_role_id uuid default null,
  p_bootstrap_super_admin boolean default false,
  p_is_active boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role public.app_roles%rowtype;
  resolved_role_id uuid := p_role_id;
  resolved_company_id uuid := p_company_id;
  resolved_role_slug text;
  profile_row public.profiles%rowtype;
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  if p_email is null or btrim(p_email) = '' then
    raise exception 'email is required';
  end if;

  if p_bootstrap_super_admin then
    select *
    into target_role
    from public.app_roles
    where slug = 'super_admin'
      and company_id is null
      and is_active = true
    limit 1;

    if not found then
      raise exception 'super_admin role not found';
    end if;

    resolved_role_id := target_role.id;
    resolved_company_id := null;
    resolved_role_slug := target_role.slug;
  else
    if resolved_role_id is null then
      raise exception 'role_id is required for managed profile bootstrap';
    end if;

    select *
    into target_role
    from public.app_roles
    where id = resolved_role_id
      and is_active = true
    limit 1;

    if not found then
      raise exception 'role not found for profile bootstrap';
    end if;

    resolved_role_slug := target_role.slug;

    if target_role.slug = 'super_admin' then
      resolved_company_id := null;
    elsif resolved_company_id is null then
      raise exception 'company_id is required for non-super_admin profiles';
    end if;

    if target_role.company_id is not null
      and resolved_company_id is not null
      and target_role.company_id <> resolved_company_id then
      raise exception 'role does not belong to the provided company';
    end if;
  end if;

  insert into public.profiles (
    id,
    company_id,
    role_id,
    full_name,
    email,
    role,
    is_active
  )
  values (
    p_user_id,
    resolved_company_id,
    resolved_role_id,
    nullif(btrim(p_full_name), ''),
    lower(btrim(p_email)),
    resolved_role_slug,
    coalesce(p_is_active, true)
  )
  on conflict (id) do update set
    company_id = excluded.company_id,
    role_id = excluded.role_id,
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    is_active = excluded.is_active
  returning * into profile_row;

  return profile_row.id;
end;
$$;

drop trigger if exists handle_auth_user_created on auth.users;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  app_meta jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  user_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  auto_create_profile boolean := coalesce((app_meta ->> 'auto_create_profile')::boolean, false);
  bootstrap_super_admin boolean := coalesce((app_meta ->> 'bootstrap_super_admin')::boolean, false);
  role_id uuid := null;
  company_id uuid := null;
begin
  if not auto_create_profile and not bootstrap_super_admin then
    return new;
  end if;

  if app_meta ? 'role_id' and nullif(app_meta ->> 'role_id', '') is not null then
    role_id := (app_meta ->> 'role_id')::uuid;
  end if;

  if app_meta ? 'company_id' and nullif(app_meta ->> 'company_id', '') is not null then
    company_id := (app_meta ->> 'company_id')::uuid;
  end if;

  perform public.ensure_profile_for_auth_user(
    new.id,
    new.email,
    nullif(user_meta ->> 'full_name', ''),
    company_id,
    role_id,
    bootstrap_super_admin,
    true
  );

  return new;
end;
$$;

create trigger handle_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

grant execute on function public.ensure_profile_for_auth_user(
  uuid,
  text,
  text,
  uuid,
  uuid,
  boolean,
  boolean
) to service_role;

create extension if not exists pgcrypto;

create or replace function public.generate_tdp_profile_code()
returns text
language sql
stable
as $$
  select lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
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

create table if not exists public.tdp_profile_configs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_code text not null default public.generate_tdp_profile_code(),
  full_name text not null default '',
  description text not null default '',
  background_1 text not null default '#0A0A0A',
  use_second_background boolean not null default true,
  background_2 text not null default '#1F2937',
  text_color text not null default '#E0E0E0',
  main_button_color text not null default '#3B82F6',
  icon_color text not null default '#60A5FA',
  widget_button_bg text not null default '#1A1A1A',
  widget_button_text text not null default '#FFFFFF',
  widget_button_hover text not null default '#2A2A2A',
  show_save_contact boolean not null default true,
  contact_title text not null default '',
  widget_ids text[] not null default '{}'::text[],
  widget_configs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tdp_profile_configs
add column if not exists profile_code text;

update public.tdp_profile_configs
set profile_code = coalesce(profile_code, public.generate_tdp_profile_code())
where profile_code is null or profile_code = '';

alter table public.tdp_profile_configs
alter column profile_code set default public.generate_tdp_profile_code();

alter table public.tdp_profile_configs
alter column profile_code set not null;

drop index if exists tdp_profile_configs_profile_code_key;
create unique index if not exists tdp_profile_configs_profile_code_key
on public.tdp_profile_configs (profile_code);

drop trigger if exists set_tdp_profile_configs_updated_at on public.tdp_profile_configs;
create trigger set_tdp_profile_configs_updated_at
before update on public.tdp_profile_configs
for each row execute function public.set_updated_at();

alter table public.tdp_profile_configs enable row level security;

drop policy if exists "tdp_profile_configs_select_own" on public.tdp_profile_configs;
create policy "tdp_profile_configs_select_own"
on public.tdp_profile_configs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "tdp_profile_configs_insert_own" on public.tdp_profile_configs;
create policy "tdp_profile_configs_insert_own"
on public.tdp_profile_configs
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "tdp_profile_configs_update_own" on public.tdp_profile_configs;
create policy "tdp_profile_configs_update_own"
on public.tdp_profile_configs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "tdp_profile_configs_delete_own" on public.tdp_profile_configs;
create policy "tdp_profile_configs_delete_own"
on public.tdp_profile_configs
for delete
to authenticated
using (user_id = auth.uid());

grant select, insert, update, delete on public.tdp_profile_configs to authenticated;

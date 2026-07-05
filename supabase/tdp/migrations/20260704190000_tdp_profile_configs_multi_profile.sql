create extension if not exists pgcrypto;

alter table public.tdp_profile_configs
add column if not exists id uuid;

update public.tdp_profile_configs
set id = coalesce(id, gen_random_uuid())
where id is null;

alter table public.tdp_profile_configs
alter column id set default gen_random_uuid();

alter table public.tdp_profile_configs
alter column id set not null;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'tdp_profile_configs'
      and constraint_type = 'PRIMARY KEY'
      and constraint_name = 'tdp_profile_configs_pkey'
  ) then
    alter table public.tdp_profile_configs drop constraint tdp_profile_configs_pkey;
  end if;
end $$;

alter table public.tdp_profile_configs
add constraint tdp_profile_configs_pkey primary key (id);

create index if not exists tdp_profile_configs_user_id_idx
on public.tdp_profile_configs (user_id);

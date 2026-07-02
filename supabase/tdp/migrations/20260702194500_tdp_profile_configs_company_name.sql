alter table public.tdp_profile_configs
add column if not exists company_name text not null default '';

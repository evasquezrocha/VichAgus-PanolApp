alter table public.companies
  add column if not exists custom_domain text null;

update public.companies
set custom_domain = null
where custom_domain = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'companies_custom_domain_format'
  ) then
    alter table public.companies
      add constraint companies_custom_domain_format
      check (
        custom_domain is null
        or custom_domain ~ '^[a-z0-9]+([.-][a-z0-9]+)*$'
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'companies_custom_domain_idx'
  ) then
    create unique index companies_custom_domain_idx
      on public.companies (custom_domain)
      where custom_domain is not null;
  end if;
end $$;

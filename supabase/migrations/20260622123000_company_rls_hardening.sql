create or replace function public.protect_company_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_super_admin() then
    return new;
  end if;

  if old.slug is distinct from new.slug
    or old.is_active is distinct from new.is_active then
    raise exception 'Only super_admin can change company slug or active state';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_company_privileged_fields on public.companies;
create trigger protect_company_privileged_fields
before update on public.companies
for each row execute function public.protect_company_privileged_fields();

drop policy if exists "companies_update_by_company_admin" on public.companies;
create policy "companies_update_by_company_admin"
on public.companies
for update
to authenticated
using (
  public.is_super_admin()
  or id = public.current_company_id()
)
with check (
  public.is_super_admin()
  or id = public.current_company_id()
);

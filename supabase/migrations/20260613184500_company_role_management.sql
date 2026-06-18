update public.app_roles
set permissions = array[
  'company.access',
  'company.users.read',
  'company.users.manage',
  'company.roles.read',
  'company.roles.manage'
]::text[]
where company_id is null
  and slug = 'company_admin';

alter table public.app_roles enable row level security;

drop policy if exists "app_roles_select_by_scope" on public.app_roles;
create policy "app_roles_select_by_scope"
on public.app_roles
for select
to authenticated
using (
  public.is_super_admin()
  or company_id is null
  or company_id = public.current_company_id()
);

drop policy if exists "app_roles_insert_by_scope" on public.app_roles;
create policy "app_roles_insert_by_scope"
on public.app_roles
for insert
to authenticated
with check (
  public.is_super_admin()
  or (
    public.has_permission('company.roles.manage')
    and company_id = public.current_company_id()
    and is_system = false
  )
);

drop policy if exists "app_roles_update_by_scope" on public.app_roles;
create policy "app_roles_update_by_scope"
on public.app_roles
for update
to authenticated
using (
  public.is_super_admin()
  or (
    public.has_permission('company.roles.manage')
    and company_id = public.current_company_id()
    and is_system = false
  )
)
with check (
  public.is_super_admin()
  or (
    public.has_permission('company.roles.manage')
    and company_id = public.current_company_id()
    and is_system = false
  )
);

drop policy if exists "app_roles_delete_by_scope" on public.app_roles;
create policy "app_roles_delete_by_scope"
on public.app_roles
for delete
to authenticated
using (
  public.is_super_admin()
  or (
    public.has_permission('company.roles.manage')
    and company_id = public.current_company_id()
    and is_system = false
  )
);

create table if not exists public.employee_companies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  nombre text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_companies_nombre_format check (nombre <> '')
);

create unique index if not exists employee_companies_company_nombre_unique
on public.employee_companies(company_id, lower(nombre));

create index if not exists employee_companies_company_id_idx on public.employee_companies(company_id);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_company_id uuid not null references public.employee_companies(id) on delete restrict,
  rut text not null,
  nombres text not null,
  apellidos text not null,
  email text null,
  telefono text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_rut_format check (rut <> ''),
  constraint employees_nombres_format check (nombres <> ''),
  constraint employees_apellidos_format check (apellidos <> ''),
  constraint employees_company_rut_unique unique (company_id, rut)
);

create index if not exists employees_company_id_idx on public.employees(company_id);
create index if not exists employees_employee_company_id_idx on public.employees(employee_company_id);
create index if not exists employees_active_idx on public.employees(is_active);

drop trigger if exists set_employee_companies_updated_at on public.employee_companies;
create trigger set_employee_companies_updated_at
before update on public.employee_companies
for each row execute function public.set_updated_at();

drop trigger if exists set_employees_updated_at on public.employees;
create trigger set_employees_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

alter table public.employee_companies enable row level security;
alter table public.employees enable row level security;

drop policy if exists "employee_companies_select_by_company" on public.employee_companies;
create policy "employee_companies_select_by_company"
on public.employee_companies
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "employee_companies_modify_by_company_admin" on public.employee_companies;
create policy "employee_companies_modify_by_company_admin"
on public.employee_companies
for all
to authenticated
using (
  public.is_super_admin()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
)
with check (
  public.is_super_admin()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
);

drop policy if exists "employees_select_by_company" on public.employees;
create policy "employees_select_by_company"
on public.employees
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "employees_modify_by_company_admin" on public.employees;
create policy "employees_modify_by_company_admin"
on public.employees
for all
to authenticated
using (
  public.is_super_admin()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
)
with check (
  public.is_super_admin()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
);

grant select, insert, update, delete on public.employee_companies to authenticated;
grant select, insert, update, delete on public.employees to authenticated;

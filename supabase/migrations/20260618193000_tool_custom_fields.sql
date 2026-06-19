create table if not exists public.tool_custom_fields (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  codigo text not null,
  nombre text not null,
  field_type text not null,
  options text[] not null default '{}',
  is_required boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tool_custom_fields_codigo_format check (codigo <> ''),
  constraint tool_custom_fields_nombre_format check (nombre <> ''),
  constraint tool_custom_fields_type_check check (field_type in ('text', 'number', 'select', 'date', 'boolean')),
  constraint tool_custom_fields_company_codigo_unique unique (company_id, codigo)
);

create table if not exists public.tool_custom_field_values (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  custom_field_id uuid not null references public.tool_custom_fields(id) on delete cascade,
  value_text text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tool_custom_field_values_unique unique (tool_id, custom_field_id)
);

create index if not exists tool_custom_fields_company_id_idx on public.tool_custom_fields(company_id);
create index if not exists tool_custom_fields_sort_order_idx on public.tool_custom_fields(sort_order);
create index if not exists tool_custom_field_values_company_id_idx on public.tool_custom_field_values(company_id);
create index if not exists tool_custom_field_values_tool_id_idx on public.tool_custom_field_values(tool_id);
create index if not exists tool_custom_field_values_custom_field_id_idx on public.tool_custom_field_values(custom_field_id);

drop trigger if exists set_tool_custom_fields_updated_at on public.tool_custom_fields;
create trigger set_tool_custom_fields_updated_at
before update on public.tool_custom_fields
for each row execute function public.set_updated_at();

drop trigger if exists set_tool_custom_field_values_updated_at on public.tool_custom_field_values;
create trigger set_tool_custom_field_values_updated_at
before update on public.tool_custom_field_values
for each row execute function public.set_updated_at();

alter table public.tool_custom_fields enable row level security;
alter table public.tool_custom_field_values enable row level security;

drop policy if exists "tool_custom_fields_select_by_company" on public.tool_custom_fields;
create policy "tool_custom_fields_select_by_company"
on public.tool_custom_fields
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "tool_custom_fields_modify_by_company_admin" on public.tool_custom_fields;
create policy "tool_custom_fields_modify_by_company_admin"
on public.tool_custom_fields
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

drop policy if exists "tool_custom_field_values_select_by_company" on public.tool_custom_field_values;
create policy "tool_custom_field_values_select_by_company"
on public.tool_custom_field_values
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "tool_custom_field_values_modify_by_company_admin" on public.tool_custom_field_values;
create policy "tool_custom_field_values_modify_by_company_admin"
on public.tool_custom_field_values
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

grant select, insert, update, delete on public.tool_custom_fields to authenticated;
grant select, insert, update, delete on public.tool_custom_field_values to authenticated;

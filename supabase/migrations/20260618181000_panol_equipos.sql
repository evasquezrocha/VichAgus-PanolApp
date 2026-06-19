create table if not exists public.equipment_groups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  codigo text not null,
  descripcion text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint equipment_groups_codigo_format check (codigo <> ''),
  constraint equipment_groups_company_codigo_unique unique (company_id, codigo)
);

create table if not exists public.equipments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  tool_group_id uuid not null references public.equipment_groups(id) on delete restrict,
  codigo text not null,
  descripcion text not null,
  cantidad integer not null default 0,
  unidad text not null,
  marca text null,
  modelo text null,
  image_url text null,
  image_dropbox_path text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint equipments_codigo_format check (codigo <> ''),
  constraint equipments_company_codigo_unique unique (company_id, codigo)
);

create index if not exists equipment_groups_company_id_idx on public.equipment_groups(company_id);
create index if not exists equipments_company_id_idx on public.equipments(company_id);
create index if not exists equipments_tool_group_id_idx on public.equipments(tool_group_id);

drop trigger if exists set_equipment_groups_updated_at on public.equipment_groups;
create trigger set_equipment_groups_updated_at
before update on public.equipment_groups
for each row execute function public.set_updated_at();

drop trigger if exists set_equipments_updated_at on public.equipments;
create trigger set_equipments_updated_at
before update on public.equipments
for each row execute function public.set_updated_at();

alter table public.equipment_groups enable row level security;
alter table public.equipments enable row level security;

drop policy if exists "equipment_groups_select_by_company" on public.equipment_groups;
create policy "equipment_groups_select_by_company"
on public.equipment_groups
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "equipment_groups_modify_by_company_admin" on public.equipment_groups;
create policy "equipment_groups_modify_by_company_admin"
on public.equipment_groups
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

drop policy if exists "equipments_select_by_company" on public.equipments;
create policy "equipments_select_by_company"
on public.equipments
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "equipments_modify_by_company_admin" on public.equipments;
create policy "equipments_modify_by_company_admin"
on public.equipments
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

grant select, insert, update, delete on public.equipment_groups to authenticated;
grant select, insert, update, delete on public.equipments to authenticated;


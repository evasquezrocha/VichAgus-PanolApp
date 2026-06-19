create table if not exists public.panol_locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  nombre text not null,
  responsible_employee_id uuid null references public.employees(id) on delete set null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint panol_locations_nombre_format check (nombre <> '')
);

create unique index if not exists panol_locations_company_nombre_unique
  on public.panol_locations(company_id, lower(nombre));
create unique index if not exists panol_locations_company_default_unique
  on public.panol_locations(company_id)
  where is_default;
create index if not exists panol_locations_company_id_idx
  on public.panol_locations(company_id);
create index if not exists panol_locations_responsible_employee_id_idx
  on public.panol_locations(responsible_employee_id);

drop trigger if exists set_panol_locations_updated_at on public.panol_locations;
create trigger set_panol_locations_updated_at
before update on public.panol_locations
for each row execute function public.set_updated_at();

create or replace function public.ensure_default_panol_location_for_company()
returns trigger
language plpgsql
as $$
begin
  insert into public.panol_locations (
    company_id,
    nombre,
    responsible_employee_id,
    is_default
  )
  select
    new.id,
    'PAÑOL',
    null,
    true
  where not exists (
    select 1
    from public.panol_locations
    where company_id = new.id
      and lower(nombre) = lower('PAÑOL')
  );

  return new;
end;
$$;

drop trigger if exists create_default_panol_location_on_company_insert on public.companies;
create trigger create_default_panol_location_on_company_insert
after insert on public.companies
for each row execute function public.ensure_default_panol_location_for_company();

insert into public.panol_locations (
  company_id,
  nombre,
  responsible_employee_id,
  is_default
)
select
  c.id,
  'PAÑOL',
  null,
  true
from public.companies c
where not exists (
  select 1
  from public.panol_locations l
  where l.company_id = c.id
    and lower(l.nombre) = lower('PAÑOL')
);

alter table public.equipments
  add column if not exists ubicacion_id uuid;

alter table public.tools
  add column if not exists ubicacion_id uuid;

update public.equipments e
set ubicacion_id = l.id
from public.panol_locations l
where l.company_id = e.company_id
  and l.is_default = true
  and e.ubicacion_id is null;

update public.tools t
set ubicacion_id = l.id
from public.panol_locations l
where l.company_id = t.company_id
  and l.is_default = true
  and t.ubicacion_id is null;

alter table public.equipments
  alter column ubicacion_id set not null;

alter table public.tools
  alter column ubicacion_id set not null;

create or replace function public.sync_equipment_ubicacion_on_insert()
returns trigger
language plpgsql
as $$
declare
  v_default_location_id uuid;
begin
  if new.ubicacion_id is null then
    select id
    into v_default_location_id
    from public.panol_locations
    where company_id = new.company_id
      and is_default = true
    limit 1;

    if v_default_location_id is null then
      raise exception 'No se pudo resolver la ubicación por defecto.';
    end if;

    new.ubicacion_id := v_default_location_id;
  end if;

  return new;
end;
$$;

create or replace function public.sync_tool_ubicacion_on_insert()
returns trigger
language plpgsql
as $$
declare
  v_default_location_id uuid;
begin
  if new.ubicacion_id is null then
    select id
    into v_default_location_id
    from public.panol_locations
    where company_id = new.company_id
      and is_default = true
    limit 1;

    if v_default_location_id is null then
      raise exception 'No se pudo resolver la ubicación por defecto.';
    end if;

    new.ubicacion_id := v_default_location_id;
  end if;

  return new;
end;
$$;

drop trigger if exists equipment_set_default_ubicacion on public.equipments;
create trigger equipment_set_default_ubicacion
before insert on public.equipments
for each row execute function public.sync_equipment_ubicacion_on_insert();

drop trigger if exists tool_set_default_ubicacion on public.tools;
create trigger tool_set_default_ubicacion
before insert on public.tools
for each row execute function public.sync_tool_ubicacion_on_insert();

alter table public.panol_locations enable row level security;

drop policy if exists "panol_locations_select_by_company" on public.panol_locations;
create policy "panol_locations_select_by_company"
on public.panol_locations
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "panol_locations_modify_by_company_admin" on public.panol_locations;
create policy "panol_locations_modify_by_company_admin"
on public.panol_locations
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

grant select, insert, update, delete on public.panol_locations to authenticated;

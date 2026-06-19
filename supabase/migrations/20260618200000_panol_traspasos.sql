create table if not exists public.employee_equipment_assignments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  equipment_id uuid not null references public.equipments(id) on delete cascade,
  employee_id uuid null references public.employees(id) on delete set null,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_equipment_assignments_equipment_unique unique (equipment_id)
);

create table if not exists public.employee_tool_allocations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  employee_id uuid null references public.employees(id) on delete set null,
  quantity integer not null,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_tool_allocations_quantity_check check (quantity > 0)
);

create table if not exists public.employee_transfers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  origin_employee_id uuid not null references public.employees(id) on delete restrict,
  destination_employee_id uuid not null references public.employees(id) on delete restrict,
  transfer_date date not null,
  transfer_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.employee_transfers(id) on delete cascade,
  item_type text not null,
  equipment_id uuid null references public.equipments(id) on delete restrict,
  tool_id uuid null references public.tools(id) on delete restrict,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_transfer_items_item_type_check check (item_type in ('equipment', 'tool')),
  constraint employee_transfer_items_equipment_check check (
    (item_type = 'equipment' and equipment_id is not null and tool_id is null and quantity = 1)
    or (item_type = 'tool' and tool_id is not null and equipment_id is null and quantity > 0)
  )
);

create index if not exists employee_equipment_assignments_company_id_idx
  on public.employee_equipment_assignments(company_id);
create index if not exists employee_equipment_assignments_employee_id_idx
  on public.employee_equipment_assignments(employee_id);
create index if not exists employee_tool_allocations_company_id_idx
  on public.employee_tool_allocations(company_id);
create index if not exists employee_tool_allocations_tool_id_idx
  on public.employee_tool_allocations(tool_id);
create index if not exists employee_tool_allocations_employee_id_idx
  on public.employee_tool_allocations(employee_id);
create unique index if not exists employee_tool_allocations_tool_employee_unique
  on public.employee_tool_allocations(tool_id, employee_id)
  where employee_id is not null;
create unique index if not exists employee_tool_allocations_tool_unassigned_unique
  on public.employee_tool_allocations(tool_id)
  where employee_id is null;
create index if not exists employee_transfers_company_id_idx
  on public.employee_transfers(company_id);
create index if not exists employee_transfers_transfer_date_idx
  on public.employee_transfers(transfer_date, transfer_time);
create index if not exists employee_transfer_items_transfer_id_idx
  on public.employee_transfer_items(transfer_id);
create index if not exists employee_transfer_items_equipment_id_idx
  on public.employee_transfer_items(equipment_id);
create index if not exists employee_transfer_items_tool_id_idx
  on public.employee_transfer_items(tool_id);

drop trigger if exists set_employee_equipment_assignments_updated_at on public.employee_equipment_assignments;
create trigger set_employee_equipment_assignments_updated_at
before update on public.employee_equipment_assignments
for each row execute function public.set_updated_at();

drop trigger if exists set_employee_tool_allocations_updated_at on public.employee_tool_allocations;
create trigger set_employee_tool_allocations_updated_at
before update on public.employee_tool_allocations
for each row execute function public.set_updated_at();

drop trigger if exists set_employee_transfers_updated_at on public.employee_transfers;
create trigger set_employee_transfers_updated_at
before update on public.employee_transfers
for each row execute function public.set_updated_at();

drop trigger if exists set_employee_transfer_items_updated_at on public.employee_transfer_items;
create trigger set_employee_transfer_items_updated_at
before update on public.employee_transfer_items
for each row execute function public.set_updated_at();

create or replace function public.sync_employee_equipment_assignment_on_insert()
returns trigger
language plpgsql
as $$
begin
  insert into public.employee_equipment_assignments (
    company_id,
    equipment_id,
    employee_id
  )
  values (
    new.company_id,
    new.id,
    null
  )
  on conflict (equipment_id) do nothing;

  return new;
end;
$$;

drop trigger if exists equipment_create_unassigned_assignment on public.equipments;
create trigger equipment_create_unassigned_assignment
after insert on public.equipments
for each row execute function public.sync_employee_equipment_assignment_on_insert();

create or replace function public.sync_employee_tool_allocation_on_change()
returns trigger
language plpgsql
as $$
declare
  v_allocated integer := 0;
  v_unassigned_quantity integer := 0;
begin
  select coalesce(sum(quantity), 0)
    into v_allocated
  from public.employee_tool_allocations
  where tool_id = new.id
    and employee_id is not null;

  if new.cantidad < v_allocated then
    raise exception 'No se puede reducir la cantidad por debajo de lo asignado.';
  end if;

  v_unassigned_quantity := new.cantidad - v_allocated;

  if exists (
    select 1
    from public.employee_tool_allocations
    where tool_id = new.id
      and employee_id is null
  ) then
    if v_unassigned_quantity = 0 then
      delete from public.employee_tool_allocations
      where tool_id = new.id
        and employee_id is null;
    else
      update public.employee_tool_allocations
      set quantity = v_unassigned_quantity
      where tool_id = new.id
        and employee_id is null;
    end if;
  elsif v_unassigned_quantity > 0 then
    insert into public.employee_tool_allocations (
      company_id,
      tool_id,
      employee_id,
      quantity
    )
    values (
      new.company_id,
      new.id,
      null,
      v_unassigned_quantity
    );
  end if;

  return new;
end;
$$;

drop trigger if exists tools_sync_unassigned_allocation on public.tools;
create trigger tools_sync_unassigned_allocation
after insert or update on public.tools
for each row execute function public.sync_employee_tool_allocation_on_change();

insert into public.employee_equipment_assignments (company_id, equipment_id, employee_id)
select e.company_id, e.id, null
from public.equipments e
where not exists (
  select 1
  from public.employee_equipment_assignments a
  where a.equipment_id = e.id
);

insert into public.employee_tool_allocations (company_id, tool_id, employee_id, quantity)
select t.company_id, t.id, null, t.cantidad
from public.tools t
where t.cantidad > 0
  and not exists (
    select 1
    from public.employee_tool_allocations a
    where a.tool_id = t.id
      and a.employee_id is null
  );

create or replace function public.create_employee_transfer(
  p_company_id uuid,
  p_origin_employee_id uuid,
  p_destination_employee_id uuid,
  p_transfer_date date,
  p_transfer_time time,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer_id uuid;
  v_item jsonb;
  v_equipment_id uuid;
  v_tool_id uuid;
  v_quantity integer;
  v_equipment_assignment record;
  v_source_tool_allocation record;
  v_destination_tool_allocation record;
begin
  if not exists (
    select 1
    from public.employees
    where id = p_origin_employee_id
      and company_id = p_company_id
  ) then
    raise exception 'Empleado origen inválido.';
  end if;

  if not exists (
    select 1
    from public.employees
    where id = p_destination_employee_id
      and company_id = p_company_id
  ) then
    raise exception 'Empleado destino inválido.';
  end if;

  if p_origin_employee_id = p_destination_employee_id then
    raise exception 'El empleado origen y destino deben ser distintos.';
  end if;

  insert into public.employee_transfers (
    company_id,
    origin_employee_id,
    destination_employee_id,
    transfer_date,
    transfer_time
  )
  values (
    p_company_id,
    p_origin_employee_id,
    p_destination_employee_id,
    p_transfer_date,
    p_transfer_time
  )
  returning id into v_transfer_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    if coalesce(v_item->>'item_type', '') = 'equipment' then
      v_equipment_id := nullif(v_item->>'equipment_id', '')::uuid;

      if v_equipment_id is null then
        raise exception 'Equipo inválido.';
      end if;

      select id, employee_id
      into v_equipment_assignment
      from public.employee_equipment_assignments
      where equipment_id = v_equipment_id
        and company_id = p_company_id;

      if not found then
        insert into public.employee_equipment_assignments (
          company_id,
          equipment_id,
          employee_id
        )
        values (
          p_company_id,
          v_equipment_id,
          p_destination_employee_id
        );
      elsif v_equipment_assignment.employee_id is null or v_equipment_assignment.employee_id = p_origin_employee_id then
        update public.employee_equipment_assignments
        set employee_id = p_destination_employee_id,
            assigned_at = now()
        where id = v_equipment_assignment.id;
      else
        raise exception 'El equipo no pertenece al empleado origen.';
      end if;

      insert into public.employee_transfer_items (
        transfer_id,
        item_type,
        equipment_id,
        tool_id,
        quantity
      )
      values (
        v_transfer_id,
        'equipment',
        v_equipment_id,
        null,
        1
      );
    elsif coalesce(v_item->>'item_type', '') = 'tool' then
      v_tool_id := nullif(v_item->>'tool_id', '')::uuid;
      v_quantity := greatest(coalesce((v_item->>'quantity')::int, 0), 0);

      if v_tool_id is null or v_quantity <= 0 then
        raise exception 'Herramienta inválida.';
      end if;

      select id, quantity, employee_id
      into v_source_tool_allocation
      from public.employee_tool_allocations
      where tool_id = v_tool_id
        and company_id = p_company_id
        and employee_id = p_origin_employee_id
        and quantity >= v_quantity
      order by assigned_at asc
      limit 1;

      if not found then
        select id, quantity, employee_id
        into v_source_tool_allocation
        from public.employee_tool_allocations
        where tool_id = v_tool_id
          and company_id = p_company_id
          and employee_id is null
          and quantity >= v_quantity
        order by assigned_at asc
        limit 1;
      end if;

      if not found then
        raise exception 'No hay cantidad suficiente de la herramienta.';
      end if;

      update public.employee_tool_allocations
      set quantity = quantity - v_quantity
      where id = v_source_tool_allocation.id;

      delete from public.employee_tool_allocations
      where id = v_source_tool_allocation.id
        and quantity <= 0;

      select id, quantity
      into v_destination_tool_allocation
      from public.employee_tool_allocations
      where tool_id = v_tool_id
        and company_id = p_company_id
        and employee_id = p_destination_employee_id
      limit 1;

      if found then
        update public.employee_tool_allocations
        set quantity = quantity + v_quantity,
            assigned_at = now()
        where id = v_destination_tool_allocation.id;
      else
        insert into public.employee_tool_allocations (
          company_id,
          tool_id,
          employee_id,
          quantity
        )
        values (
          p_company_id,
          v_tool_id,
          p_destination_employee_id,
          v_quantity
        );
      end if;

      insert into public.employee_transfer_items (
        transfer_id,
        item_type,
        equipment_id,
        tool_id,
        quantity
      )
      values (
        v_transfer_id,
        'tool',
        null,
        v_tool_id,
        v_quantity
      );
    else
      raise exception 'Tipo de item inválido.';
    end if;
  end loop;

  return v_transfer_id;
end;
$$;

grant execute on function public.create_employee_transfer(
  uuid,
  uuid,
  uuid,
  date,
  time,
  jsonb
) to authenticated;

alter table public.employee_equipment_assignments enable row level security;
alter table public.employee_tool_allocations enable row level security;
alter table public.employee_transfers enable row level security;
alter table public.employee_transfer_items enable row level security;

drop policy if exists "employee_equipment_assignments_select_by_company" on public.employee_equipment_assignments;
create policy "employee_equipment_assignments_select_by_company"
on public.employee_equipment_assignments
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "employee_equipment_assignments_modify_by_company_admin" on public.employee_equipment_assignments;
create policy "employee_equipment_assignments_modify_by_company_admin"
on public.employee_equipment_assignments
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

drop policy if exists "employee_tool_allocations_select_by_company" on public.employee_tool_allocations;
create policy "employee_tool_allocations_select_by_company"
on public.employee_tool_allocations
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "employee_tool_allocations_modify_by_company_admin" on public.employee_tool_allocations;
create policy "employee_tool_allocations_modify_by_company_admin"
on public.employee_tool_allocations
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

drop policy if exists "employee_transfers_select_by_company" on public.employee_transfers;
create policy "employee_transfers_select_by_company"
on public.employee_transfers
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "employee_transfers_modify_by_company_admin" on public.employee_transfers;
create policy "employee_transfers_modify_by_company_admin"
on public.employee_transfers
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

drop policy if exists "employee_transfer_items_select_by_company" on public.employee_transfer_items;
create policy "employee_transfer_items_select_by_company"
on public.employee_transfer_items
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.employee_transfers t
    where t.id = transfer_id
      and t.company_id = public.current_company_id()
  )
);

drop policy if exists "employee_transfer_items_modify_by_company_admin" on public.employee_transfer_items;
create policy "employee_transfer_items_modify_by_company_admin"
on public.employee_transfer_items
for all
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.employee_transfers t
    where t.id = transfer_id
      and t.company_id = public.current_company_id()
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.employee_transfers t
    where t.id = transfer_id
      and t.company_id = public.current_company_id()
  )
);

grant select, insert, update, delete on public.employee_equipment_assignments to authenticated;
grant select, insert, update, delete on public.employee_tool_allocations to authenticated;
grant select, insert, update, delete on public.employee_transfers to authenticated;
grant select, insert, update, delete on public.employee_transfer_items to authenticated;

alter table public.employee_transfers
  add column if not exists origin_type text,
  add column if not exists origin_location_id uuid references public.panol_locations(id) on delete restrict,
  add column if not exists destination_type text,
  add column if not exists destination_location_id uuid references public.panol_locations(id) on delete restrict;

alter table public.employee_transfers
  alter column origin_employee_id drop not null,
  alter column destination_employee_id drop not null;

update public.employee_transfers
set origin_type = coalesce(origin_type, 'employee'),
    destination_type = coalesce(destination_type, 'employee')
where origin_type is null
   or destination_type is null;

update public.employee_transfers
set origin_location_id = null
where origin_type = 'employee';

update public.employee_transfers
set destination_location_id = null
where destination_type = 'employee';

alter table public.employee_transfers
  alter column origin_type set not null,
  alter column destination_type set not null;

alter table public.employee_transfers
  drop constraint if exists employee_transfers_origin_type_check;
alter table public.employee_transfers
  add constraint employee_transfers_origin_type_check
  check (origin_type in ('employee', 'location'));

alter table public.employee_transfers
  drop constraint if exists employee_transfers_destination_type_check;
alter table public.employee_transfers
  add constraint employee_transfers_destination_type_check
  check (destination_type in ('employee', 'location'));

alter table public.employee_transfers
  drop constraint if exists employee_transfers_origin_endpoint_check;
alter table public.employee_transfers
  add constraint employee_transfers_origin_endpoint_check
  check (
    (origin_type = 'employee' and origin_employee_id is not null and origin_location_id is null)
    or (origin_type = 'location' and origin_employee_id is null and origin_location_id is not null)
  );

alter table public.employee_transfers
  drop constraint if exists employee_transfers_destination_endpoint_check;
alter table public.employee_transfers
  add constraint employee_transfers_destination_endpoint_check
  check (
    (destination_type = 'employee' and destination_employee_id is not null and destination_location_id is null)
    or (destination_type = 'location' and destination_employee_id is null and destination_location_id is not null)
  );

create index if not exists employee_transfers_origin_location_id_idx
  on public.employee_transfers(origin_location_id);
create index if not exists employee_transfers_destination_location_id_idx
  on public.employee_transfers(destination_location_id);

drop function if exists public.create_employee_transfer(
  uuid,
  uuid,
  uuid,
  date,
  time,
  jsonb
);

create or replace function public.create_employee_transfer(
  p_company_id uuid,
  p_origin_type text,
  p_origin_employee_id uuid,
  p_origin_location_id uuid,
  p_destination_type text,
  p_destination_employee_id uuid,
  p_destination_location_id uuid,
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
  v_equipment record;
  v_equipment_assignment record;
  v_tool record;
  v_source_tool_allocation record;
  v_destination_tool_allocation record;
begin
  if p_origin_type not in ('employee', 'location') then
    raise exception 'Origen inválido.';
  end if;

  if p_destination_type not in ('employee', 'location') then
    raise exception 'Destino inválido.';
  end if;

  if p_origin_type = 'employee' then
    if p_origin_employee_id is null then
      raise exception 'Empleado origen inválido.';
    end if;

    if not exists (
      select 1
      from public.employees
      where id = p_origin_employee_id
        and company_id = p_company_id
    ) then
      raise exception 'Empleado origen inválido.';
    end if;
  else
    if p_origin_location_id is null then
      raise exception 'Ubicación origen inválida.';
    end if;

    if not exists (
      select 1
      from public.panol_locations
      where id = p_origin_location_id
        and company_id = p_company_id
    ) then
      raise exception 'Ubicación origen inválida.';
    end if;
  end if;

  if p_destination_type = 'employee' then
    if p_destination_employee_id is null then
      raise exception 'Empleado destino inválido.';
    end if;

    if not exists (
      select 1
      from public.employees
      where id = p_destination_employee_id
        and company_id = p_company_id
    ) then
      raise exception 'Empleado destino inválido.';
    end if;
  else
    if p_destination_location_id is null then
      raise exception 'Ubicación destino inválida.';
    end if;

    if not exists (
      select 1
      from public.panol_locations
      where id = p_destination_location_id
        and company_id = p_company_id
    ) then
      raise exception 'Ubicación destino inválida.';
    end if;
  end if;

  if p_origin_type = p_destination_type then
    if p_origin_type = 'employee' and p_origin_employee_id = p_destination_employee_id then
      raise exception 'El origen y el destino deben ser distintos.';
    end if;

    if p_origin_type = 'location' and p_origin_location_id = p_destination_location_id then
      raise exception 'El origen y el destino deben ser distintos.';
    end if;
  end if;

  insert into public.employee_transfers (
    company_id,
    origin_type,
    origin_employee_id,
    origin_location_id,
    destination_type,
    destination_employee_id,
    destination_location_id,
    transfer_date,
    transfer_time
  )
  values (
    p_company_id,
    p_origin_type,
    p_origin_employee_id,
    p_origin_location_id,
    p_destination_type,
    p_destination_employee_id,
    p_destination_location_id,
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

      select e.id, e.ubicacion_id, a.id as assignment_id, a.employee_id
      into v_equipment
      from public.equipments e
      left join public.employee_equipment_assignments a
        on a.equipment_id = e.id
       and a.company_id = p_company_id
      where e.id = v_equipment_id
        and e.company_id = p_company_id;

      if not found then
        raise exception 'Equipo inválido.';
      end if;

      if p_origin_type = 'employee' then
        if v_equipment.assignment_id is null or v_equipment.employee_id is distinct from p_origin_employee_id then
          raise exception 'El equipo no pertenece al empleado origen.';
        end if;
      else
        if v_equipment.employee_id is not null then
          raise exception 'El equipo no se encuentra en una ubicación.';
        end if;

        if v_equipment.ubicacion_id is distinct from p_origin_location_id then
          raise exception 'El equipo no pertenece a la ubicación origen.';
        end if;
      end if;

      if p_destination_type = 'employee' then
        if v_equipment.assignment_id is null then
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
        else
          update public.employee_equipment_assignments
          set employee_id = p_destination_employee_id,
              assigned_at = now()
          where id = v_equipment.assignment_id;
        end if;
      else
        if v_equipment.assignment_id is null then
          insert into public.employee_equipment_assignments (
            company_id,
            equipment_id,
            employee_id
          )
          values (
            p_company_id,
            v_equipment_id,
            null
          );
        else
          update public.employee_equipment_assignments
          set employee_id = null,
              assigned_at = now()
          where id = v_equipment.assignment_id;
        end if;

        update public.equipments
        set ubicacion_id = p_destination_location_id
        where id = v_equipment_id;
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

      select id, ubicacion_id
      into v_tool
      from public.tools
      where id = v_tool_id
        and company_id = p_company_id;

      if not found then
        raise exception 'Herramienta inválida.';
      end if;

      if p_origin_type = 'employee' then
        select id, quantity, employee_id
        into v_source_tool_allocation
        from public.employee_tool_allocations
        where tool_id = v_tool_id
          and company_id = p_company_id
          and employee_id = p_origin_employee_id
        limit 1;
      else
        if v_tool.ubicacion_id is distinct from p_origin_location_id then
          raise exception 'La herramienta no pertenece a la ubicación origen.';
        end if;

        select id, quantity, employee_id
        into v_source_tool_allocation
        from public.employee_tool_allocations
        where tool_id = v_tool_id
          and company_id = p_company_id
          and employee_id is null
        limit 1;
      end if;

      if not found or v_source_tool_allocation.quantity < v_quantity then
        raise exception 'No hay cantidad suficiente de la herramienta.';
      end if;

      update public.employee_tool_allocations
      set quantity = quantity - v_quantity
      where id = v_source_tool_allocation.id;

      delete from public.employee_tool_allocations
      where id = v_source_tool_allocation.id
        and quantity <= 0;

      if p_destination_type = 'employee' then
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
      else
        select id, quantity
        into v_destination_tool_allocation
        from public.employee_tool_allocations
        where tool_id = v_tool_id
          and company_id = p_company_id
          and employee_id is null
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
            null,
            v_quantity
          );
        end if;

        update public.tools
        set ubicacion_id = p_destination_location_id
        where id = v_tool_id;
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
  text,
  uuid,
  uuid,
  text,
  uuid,
  uuid,
  date,
  time,
  jsonb
) to authenticated;

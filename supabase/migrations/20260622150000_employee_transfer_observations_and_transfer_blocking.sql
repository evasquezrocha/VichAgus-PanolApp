alter table public.employee_transfers
  add column if not exists observations text null;

drop function if exists public.create_employee_transfer(
  uuid,
  uuid,
  boolean,
  uuid,
  text,
  uuid,
  uuid,
  text,
  uuid,
  uuid,
  date,
  time,
  text,
  text,
  jsonb
);

create or replace function public.create_employee_transfer(
  p_company_id uuid,
  p_created_by_user_id uuid,
  p_created_by_is_admin boolean,
  p_signed_by_user_id uuid,
  p_origin_type text,
  p_origin_employee_id uuid,
  p_origin_location_id uuid,
  p_destination_type text,
  p_destination_employee_id uuid,
  p_destination_location_id uuid,
  p_transfer_date date,
  p_transfer_time time,
  p_signature_data text,
  p_observations text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer_id uuid;
  v_transfer_number bigint;
  v_item jsonb;
  v_equipment_id uuid;
  v_tool_id uuid;
  v_quantity integer;
  v_equipment_assignment record;
  v_source_tool_allocation record;
  v_destination_tool_allocation record;
  v_equipment_status text;
  v_tool_status text;
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_created_by_user_id
      and company_id = p_company_id
      and is_active = true
  ) then
    raise exception 'Usuario ejecutor invalido.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = p_signed_by_user_id
      and company_id = p_company_id
      and is_active = true
  ) then
    raise exception 'Usuario firmante invalido.';
  end if;

  if coalesce(btrim(p_signature_data), '') = '' then
    raise exception 'La firma es obligatoria.';
  end if;

  if p_destination_type = 'location' then
    if not exists (
      select 1
      from public.panol_locations
      where company_id = p_company_id
        and id = p_destination_location_id
        and responsible_user_id is not null
    ) then
      raise exception 'No se pueden hacer traspasos a ubicaciones sin responsable.';
    end if;
  end if;

  if p_origin_type = p_destination_type
    and coalesce(p_origin_employee_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(p_destination_employee_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and coalesce(p_origin_location_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(p_destination_location_id, '00000000-0000-0000-0000-000000000000'::uuid)
  then
    raise exception 'El origen y destino deben ser distintos.';
  end if;

  if not p_created_by_is_admin then
    if not exists (
      select 1
      from public.panol_locations l
      where l.company_id = p_company_id
        and l.responsible_user_id = p_created_by_user_id
        and (
          (p_origin_type = 'location' and l.id = p_origin_location_id)
          or (p_destination_type = 'location' and l.id = p_destination_location_id)
        )
    ) then
      raise exception 'No tienes permisos para realizar traspasos con estas ubicaciones.';
    end if;
  end if;

  if p_origin_type not in ('employee', 'location') then
    raise exception 'Origen invalido.';
  end if;

  if p_destination_type not in ('employee', 'location') then
    raise exception 'Destino invalido.';
  end if;

  insert into public.employee_transfers (
    company_id,
    origin_type,
    origin_employee_id,
    origin_location_id,
    destination_type,
    destination_employee_id,
    destination_location_id,
    created_by_user_id,
    signed_by_user_id,
    signature_data,
    observations,
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
    p_created_by_user_id,
    p_signed_by_user_id,
    p_signature_data,
    nullif(btrim(p_observations), ''),
    p_transfer_date,
    p_transfer_time
  )
  returning id into v_transfer_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    if coalesce(v_item->>'item_type', '') = 'equipment' then
      v_equipment_id := nullif(v_item->>'equipment_id', '')::uuid;

      if v_equipment_id is null then
        raise exception 'Equipo invalido.';
      end if;

      select e.estado
      into v_equipment_status
      from public.equipments e
      where e.id = v_equipment_id
        and e.company_id = p_company_id;

      if coalesce(v_equipment_status, '') in ('Inactivo', 'Inactive', 'De Baja', 'Baja', 'En Mantencion', 'En Mantenimiento')
        or lower(coalesce(v_equipment_status, '')) in ('inactivo', 'inactive', 'de baja', 'baja', 'en mantencion', 'en mantenimiento')
      then
        raise exception 'No se pueden usar equipos en baja o mantencion en un traspaso.';
      end if;

      select a.id, a.employee_id
      into v_equipment_assignment
      from public.employee_equipment_assignments a
      join public.equipments e on e.id = a.equipment_id
      where a.equipment_id = v_equipment_id
        and a.company_id = p_company_id
        and e.company_id = p_company_id
        and (
          (p_origin_type = 'employee' and a.employee_id = p_origin_employee_id)
          or (
            p_origin_type = 'location'
            and a.employee_id is null
            and e.ubicacion_id = p_origin_location_id
          )
        )
      limit 1;

      if not found then
        raise exception 'El equipo no pertenece al origen seleccionado.';
      end if;

      if p_destination_type = 'employee' then
        update public.employee_equipment_assignments
        set employee_id = p_destination_employee_id,
            assigned_at = now()
        where id = v_equipment_assignment.id;
      else
        update public.employee_equipment_assignments
        set employee_id = null,
            assigned_at = now()
        where id = v_equipment_assignment.id;

        update public.equipments
        set ubicacion_id = p_destination_location_id
        where id = v_equipment_id
          and company_id = p_company_id;
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
        raise exception 'Herramienta invalida.';
      end if;

      select t.estado
      into v_tool_status
      from public.tools t
      where t.id = v_tool_id
        and t.company_id = p_company_id;

      if coalesce(v_tool_status, '') in ('Inactivo', 'Inactive', 'De Baja', 'Baja', 'En Mantencion', 'En Mantenimiento')
        or lower(coalesce(v_tool_status, '')) in ('inactivo', 'inactive', 'de baja', 'baja', 'en mantencion', 'en mantenimiento')
      then
        raise exception 'No se pueden usar herramientas en baja o mantencion en un traspaso.';
      end if;

      if p_origin_type = 'employee' then
        select id, quantity, employee_id
        into v_source_tool_allocation
        from public.employee_tool_allocations
        where tool_id = v_tool_id
          and company_id = p_company_id
          and employee_id = p_origin_employee_id
          and quantity >= v_quantity
        order by assigned_at asc
        limit 1;
      else
        select a.id, a.quantity, a.employee_id
        into v_source_tool_allocation
        from public.employee_tool_allocations a
        join public.tools t on t.id = a.tool_id
        where a.tool_id = v_tool_id
          and a.company_id = p_company_id
          and a.employee_id is null
          and t.company_id = p_company_id
          and t.ubicacion_id = p_origin_location_id
          and a.quantity >= v_quantity
        order by a.assigned_at asc
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
        where id = v_tool_id
          and company_id = p_company_id;
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
      raise exception 'Tipo de item invalido.';
    end if;
  end loop;

  return v_transfer_id;
end;
$$;

grant execute on function public.create_employee_transfer(
  uuid,
  uuid,
  boolean,
  uuid,
  text,
  uuid,
  uuid,
  text,
  uuid,
  uuid,
  date,
  time,
  text,
  text,
  jsonb
) to authenticated;

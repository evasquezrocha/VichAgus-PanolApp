alter table public.panol_locations
  add column if not exists responsible_user_id uuid null references public.profiles(id) on delete set null;

create index if not exists panol_locations_responsible_user_id_idx
  on public.panol_locations(responsible_user_id);

update public.panol_locations l
set responsible_user_id = p.id
from public.employees e,
     public.profiles p
where l.responsible_user_id is null
  and l.responsible_employee_id = e.id
  and e.email is not null
  and lower(p.email) = lower(e.email)
  and p.company_id = l.company_id;

create or replace function public.ensure_default_panol_location_for_company()
returns trigger
language plpgsql
as $$
begin
  insert into public.panol_locations (
    company_id,
    nombre,
    responsible_user_id,
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

update public.panol_locations
set responsible_user_id = null
where lower(nombre) = lower('PAÑOL')
  and responsible_user_id is null;

alter table public.employee_transfers
  add column if not exists created_by_user_id uuid null references public.profiles(id) on delete set null,
  add column if not exists signed_by_user_id uuid null references public.profiles(id) on delete set null,
  add column if not exists signature_data text null;

create index if not exists employee_transfers_created_by_user_id_idx
  on public.employee_transfers(created_by_user_id);
create index if not exists employee_transfers_signed_by_user_id_idx
  on public.employee_transfers(signed_by_user_id);

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
    from public.profiles
    where id = p_created_by_user_id
      and company_id = p_company_id
      and is_active = true
  ) then
    raise exception 'Usuario ejecutor inválido.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = p_signed_by_user_id
      and company_id = p_company_id
      and is_active = true
  ) then
    raise exception 'Usuario firmante inválido.';
  end if;

  if coalesce(btrim(p_signature_data), '') = '' then
    raise exception 'La firma es obligatoria.';
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
    raise exception 'Origen inválido.';
  end if;

  if p_destination_type not in ('employee', 'location') then
    raise exception 'Destino inválido.';
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
        raise exception 'Herramienta inválida.';
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
      raise exception 'Tipo de item inválido.';
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
  jsonb
) to authenticated;

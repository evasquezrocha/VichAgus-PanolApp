create or replace function public.prevent_employee_delete_with_transfers()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.employee_transfers
    where origin_employee_id = old.id
       or destination_employee_id = old.id
  ) then
    raise exception 'No se puede eliminar un empleado que participa en traspasos.';
  end if;

  return old;
end;
$$;

drop trigger if exists employees_prevent_delete_with_transfers on public.employees;
create trigger employees_prevent_delete_with_transfers
before delete on public.employees
for each row execute function public.prevent_employee_delete_with_transfers();

create or replace function public.prevent_equipment_delete_with_transfers()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.employee_transfer_items
    where equipment_id = old.id
  ) then
    raise exception 'No se puede eliminar un equipo que ya participó en un traspaso.';
  end if;

  return old;
end;
$$;

drop trigger if exists equipments_prevent_delete_with_transfers on public.equipments;
create trigger equipments_prevent_delete_with_transfers
before delete on public.equipments
for each row execute function public.prevent_equipment_delete_with_transfers();

create or replace function public.prevent_tool_delete_with_transfers()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.employee_transfer_items
    where tool_id = old.id
  ) then
    raise exception 'No se puede eliminar una herramienta que ya participó en un traspaso.';
  end if;

  return old;
end;
$$;

drop trigger if exists tools_prevent_delete_with_transfers on public.tools;
create trigger tools_prevent_delete_with_transfers
before delete on public.tools
for each row execute function public.prevent_tool_delete_with_transfers();

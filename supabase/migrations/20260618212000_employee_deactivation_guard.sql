create or replace function public.prevent_employee_deactivation_with_assets()
returns trigger
language plpgsql
as $$
declare
  v_assigned_equipment integer := 0;
  v_assigned_tools integer := 0;
begin
  if old.is_active = true and new.is_active = false then
    select count(*)
      into v_assigned_equipment
    from public.employee_equipment_assignments
    where company_id = new.company_id
      and employee_id = new.id;

    select coalesce(sum(quantity), 0)
      into v_assigned_tools
    from public.employee_tool_allocations
    where company_id = new.company_id
      and employee_id = new.id;

    if v_assigned_equipment > 0 or v_assigned_tools > 0 then
      raise exception 'No se puede inactivar un empleado con equipos o herramientas asignadas.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists employees_prevent_deactivation_with_assets on public.employees;
create trigger employees_prevent_deactivation_with_assets
before update on public.employees
for each row execute function public.prevent_employee_deactivation_with_assets();

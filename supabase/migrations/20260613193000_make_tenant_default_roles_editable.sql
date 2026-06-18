update public.app_roles
set is_system = false,
    updated_at = now()
where company_id is not null
  and is_system = true;

update public.app_roles
set permissions = array[
      'company.access',
      'company.users.read',
      'company.users.manage',
      'company.roles.read',
      'company.roles.manage'
    ]::text[],
    updated_at = now()
where company_id is not null
  and slug = 'company_admin';

update public.app_roles
set permissions = array[
      'company.access'
    ]::text[],
    updated_at = now()
where company_id is not null
  and slug = 'company_user';

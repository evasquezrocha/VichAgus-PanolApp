alter table public.equipments
  add column if not exists nro_serie text null,
  add column if not exists estado text null;

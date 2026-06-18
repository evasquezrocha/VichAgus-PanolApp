alter table public.companies
  add column if not exists rut text null,
  add column if not exists logo_url text null,
  add column if not exists sidebar_bg_color text not null default '#2b3a44',
  add column if not exists sidebar_text_color text not null default '#ffffff',
  add column if not exists sidebar_active_bg_color text not null default '#52d6a4',
  add column if not exists sidebar_active_text_color text not null default '#2b3a44',
  add column if not exists platform_background_color text not null default '#f6f3ed';

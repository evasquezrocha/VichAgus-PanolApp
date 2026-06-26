alter table public.companies
  add column if not exists tab_background_color text not null default '#ffffff',
  add column if not exists tab_text_color text not null default '#2b3a44',
  add column if not exists tab_active_background_color text not null default '#2b3a44',
  add column if not exists tab_active_text_color text not null default '#ffffff';

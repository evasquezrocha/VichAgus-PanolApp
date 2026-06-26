alter table public.companies
  add column if not exists button_background_color text not null default '#2b3a44',
  add column if not exists button_text_color text not null default '#ffffff';

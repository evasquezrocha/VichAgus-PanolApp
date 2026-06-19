alter table public.companies
  add column if not exists popup_background_color text not null default '#fffdf8',
  add column if not exists popup_text_color text not null default '#2b3a44';

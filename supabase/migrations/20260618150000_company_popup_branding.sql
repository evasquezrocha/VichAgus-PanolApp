alter table public.companies
  add column if not exists popup_bg_color text not null default '#2b3a44',
  add column if not exists popup_text_color text not null default '#ffffff';

update public.companies
set popup_bg_color = coalesce(popup_bg_color, '#2b3a44'),
    popup_text_color = coalesce(popup_text_color, '#ffffff');

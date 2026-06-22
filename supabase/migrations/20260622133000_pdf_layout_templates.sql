create table if not exists public.pdf_layout_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  template_key text not null,
  name text not null,
  description text null,
  target_path text not null,
  layout_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pdf_layout_templates_template_key_format check (template_key <> ''),
  constraint pdf_layout_templates_name_format check (name <> ''),
  constraint pdf_layout_templates_target_path_format check (target_path <> ''),
  constraint pdf_layout_templates_company_template_unique unique (company_id, template_key)
);

create index if not exists pdf_layout_templates_company_id_idx
  on public.pdf_layout_templates(company_id);

create index if not exists pdf_layout_templates_template_key_idx
  on public.pdf_layout_templates(template_key);

drop trigger if exists set_pdf_layout_templates_updated_at on public.pdf_layout_templates;
create trigger set_pdf_layout_templates_updated_at
before update on public.pdf_layout_templates
for each row execute function public.set_updated_at();

alter table public.pdf_layout_templates enable row level security;

drop policy if exists "pdf_layout_templates_select_by_company" on public.pdf_layout_templates;
create policy "pdf_layout_templates_select_by_company"
on public.pdf_layout_templates
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "pdf_layout_templates_modify_by_company_admin" on public.pdf_layout_templates;
create policy "pdf_layout_templates_modify_by_company_admin"
on public.pdf_layout_templates
for all
to authenticated
using (
  public.is_super_admin()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
)
with check (
  public.is_super_admin()
  or (
    public.current_app_role() = 'company_admin'
    and company_id = public.current_company_id()
  )
);

grant select, insert, update, delete on public.pdf_layout_templates to authenticated;

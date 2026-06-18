create table if not exists public.tool_groups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  codigo text not null,
  descripcion text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tool_groups_codigo_format check (codigo <> ''),
  constraint tool_groups_company_codigo_unique unique (company_id, codigo)
);

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  tool_group_id uuid not null references public.tool_groups(id) on delete restrict,
  codigo text not null,
  descripcion text not null,
  cantidad integer not null default 0,
  unidad text not null,
  marca text null,
  modelo text null,
  image_url text null,
  image_dropbox_path text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tools_codigo_format check (codigo <> ''),
  constraint tools_company_codigo_unique unique (company_id, codigo)
);

create index if not exists tool_groups_company_id_idx on public.tool_groups(company_id);
create index if not exists tools_company_id_idx on public.tools(company_id);
create index if not exists tools_tool_group_id_idx on public.tools(tool_group_id);

drop trigger if exists set_tool_groups_updated_at on public.tool_groups;
create trigger set_tool_groups_updated_at
before update on public.tool_groups
for each row execute function public.set_updated_at();

drop trigger if exists set_tools_updated_at on public.tools;
create trigger set_tools_updated_at
before update on public.tools
for each row execute function public.set_updated_at();

alter table public.tool_groups enable row level security;
alter table public.tools enable row level security;

drop policy if exists "tool_groups_select_by_company" on public.tool_groups;
create policy "tool_groups_select_by_company"
on public.tool_groups
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "tool_groups_modify_by_company_admin" on public.tool_groups;
create policy "tool_groups_modify_by_company_admin"
on public.tool_groups
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

drop policy if exists "tools_select_by_company" on public.tools;
create policy "tools_select_by_company"
on public.tools
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "tools_modify_by_company_admin" on public.tools;
create policy "tools_modify_by_company_admin"
on public.tools
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

grant select, insert, update, delete on public.tool_groups to authenticated;
grant select, insert, update, delete on public.tools to authenticated;

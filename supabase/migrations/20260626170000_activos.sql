create table if not exists public.asset_catalog_options (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  field_key text not null,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asset_catalog_options_field_key_check
    check (field_key in ('tipo', 'marca', 'modelo', 'anio', 'centro_costos')),
  constraint asset_catalog_options_value_format check (btrim(value) <> ''),
  constraint asset_catalog_options_company_field_value_unique unique (company_id, field_key, value)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  af text not null,
  patente text not null,
  tipo text not null,
  marca text not null,
  modelo text not null,
  anio text not null,
  centro_costos text not null,
  id_gps text null,
  horometro numeric(14, 2) null,
  kilometraje numeric(14, 2) null,
  image_url text null,
  image_dropbox_path text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assets_af_format check (btrim(af) <> ''),
  constraint assets_patente_format check (btrim(patente) <> ''),
  constraint assets_tipo_format check (btrim(tipo) <> ''),
  constraint assets_marca_format check (btrim(marca) <> ''),
  constraint assets_modelo_format check (btrim(modelo) <> ''),
  constraint assets_anio_format check (btrim(anio) <> ''),
  constraint assets_centro_costos_format check (btrim(centro_costos) <> ''),
  constraint assets_company_af_unique unique (company_id, af)
);

create index if not exists asset_catalog_options_company_id_idx
  on public.asset_catalog_options(company_id);
create index if not exists asset_catalog_options_company_field_idx
  on public.asset_catalog_options(company_id, field_key);
create index if not exists assets_company_id_idx
  on public.assets(company_id);
create index if not exists assets_company_patente_idx
  on public.assets(company_id, patente);

drop trigger if exists set_asset_catalog_options_updated_at on public.asset_catalog_options;
create trigger set_asset_catalog_options_updated_at
before update on public.asset_catalog_options
for each row execute function public.set_updated_at();

drop trigger if exists set_assets_updated_at on public.assets;
create trigger set_assets_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

alter table public.asset_catalog_options enable row level security;
alter table public.assets enable row level security;

drop policy if exists "asset_catalog_options_select_by_company" on public.asset_catalog_options;
create policy "asset_catalog_options_select_by_company"
on public.asset_catalog_options
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "asset_catalog_options_modify_by_company_admin" on public.asset_catalog_options;
create policy "asset_catalog_options_modify_by_company_admin"
on public.asset_catalog_options
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

drop policy if exists "assets_select_by_company" on public.assets;
create policy "assets_select_by_company"
on public.assets
for select
to authenticated
using (
  public.is_super_admin()
  or company_id = public.current_company_id()
);

drop policy if exists "assets_modify_by_company_admin" on public.assets;
create policy "assets_modify_by_company_admin"
on public.assets
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

revoke all on public.asset_catalog_options from anon, authenticated, public;
revoke all on public.assets from anon, authenticated, public;

grant select, insert, update, delete on public.asset_catalog_options to authenticated;
grant select, insert, update, delete on public.assets to authenticated;

alter table public.asset_catalog_options force row level security;
alter table public.assets force row level security;

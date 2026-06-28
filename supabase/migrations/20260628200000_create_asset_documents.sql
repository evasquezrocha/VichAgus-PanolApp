create table if not exists public.asset_document_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

create table if not exists public.asset_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  document_type_id uuid not null references public.asset_document_types(id) on delete restrict,
  category text not null,
  visible_qr boolean not null default false,
  expiration_date date null,
  notice_days integer not null default 0 check (notice_days >= 0),
  file_url text not null,
  file_storage_path text not null,
  file_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists asset_document_types_company_id_idx
  on public.asset_document_types (company_id);

create index if not exists asset_documents_company_id_idx
  on public.asset_documents (company_id);

create index if not exists asset_documents_asset_id_idx
  on public.asset_documents (asset_id);

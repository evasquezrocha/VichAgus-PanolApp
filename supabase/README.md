# Supabase Environments

This repository has two separate Supabase environments:

- `supabase/migrations/`: APP schema and migrations.
- `supabase/tdp/`: TDP-specific schema and migrations.

Rules:

- Do not apply APP migrations to the TDP project.
- Do not apply TDP migrations to the APP project.
- TDP login uses Supabase Auth only unless a separate TDP schema is introduced later.

Current state:

- APP: existing migrations live in `supabase/migrations/`.
- TDP: use the migrations under `supabase/tdp/migrations/`.

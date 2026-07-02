# TDP Supabase Setup

TDP uses a separate Supabase project from the main APP.

Do not apply the APP migrations to the TDP project.

For TDP:

- Use Supabase Auth only for login.
- Do not create or depend on `public.companies`.
- Do not create or depend on `public.app_roles`.
- Do not create or depend on `public.profiles`.
- Do not run `ensure_profile_for_auth_user`.
- Use `npm run create:tdp-user` if you need to seed a TDP auth user.

The formal split is:

- APP migrations: `supabase/migrations/`
- TDP migrations: `supabase/tdp/migrations/`

TDP login itself only needs Supabase Auth, but the profile editor now persists state in the `tdp_profile_configs` table defined under `supabase/tdp/migrations/`.

If TDP needs more tables later, add them under `supabase/tdp/migrations/` instead of reusing the APP schema.

import { CompanyShell } from "@/components/layout/company-shell";
import { PlatformAdminShell } from "@/components/layout/platform-admin-shell";
import { requireCurrentProfile } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/permissions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireCurrentProfile();

  if (hasPermission(profile, "platform.access")) {
    return (
      <PlatformAdminShell
        profile={profile}
        title="Dashboard plataforma"
        subtitle="Resumen inicial para administrar empresas, usuarios y accesos del SaaS."
      >
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-line bg-white/55 p-5">
            <p className="text-sm font-medium text-muted">Rol activo</p>
            <h3 className="mt-3 text-2xl font-semibold">
              {profile.role_name ?? profile.role}
            </h3>
          </article>
          <article className="rounded-2xl border border-line bg-white/55 p-5">
            <p className="text-sm font-medium text-muted">Alcance</p>
            <h3 className="mt-3 text-2xl font-semibold">Global</h3>
          </article>
          <article className="rounded-2xl border border-line bg-white/55 p-5">
            <p className="text-sm font-medium text-muted">Empresa</p>
            <h3 className="mt-3 text-2xl font-semibold">Plataforma</h3>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-white/55 p-6">
          <h3 className="text-xl font-semibold">Gestion disponible</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-accent-soft p-5">
              <h4 className="font-semibold">Empresas</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Crear tenants y activar o desactivar empresas.
              </p>
            </div>
            <div className="rounded-2xl bg-accent-soft p-5">
              <h4 className="font-semibold">Usuarios</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Crear usuarios por empresa, asignar roles y revisar accesos.
              </p>
            </div>
          </div>
        </section>
      </PlatformAdminShell>
    );
  }

  return (
    <CompanyShell
      profile={profile}
      title="Dashboard empresa"
      subtitle="Resumen inicial de tu empresa y acceso a funciones operativas."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-line bg-white/55 p-5">
          <p className="text-sm font-medium text-muted">Empresa</p>
          <h3 className="mt-3 text-2xl font-semibold">
            {profile.company_name ?? "Sin empresa"}
          </h3>
        </article>
        <article className="rounded-2xl border border-line bg-white/55 p-5">
          <p className="text-sm font-medium text-muted">Rol activo</p>
          <h3 className="mt-3 text-2xl font-semibold">
            {profile.role_name ?? profile.role}
          </h3>
        </article>
        <article className="rounded-2xl border border-line bg-white/55 p-5">
          <p className="text-sm font-medium text-muted">Alcance</p>
          <h3 className="mt-3 text-2xl font-semibold">Empresa</h3>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white/55 p-6">
        <h3 className="text-xl font-semibold">Funciones disponibles</h3>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Esta base ya separa datos por empresa desde Supabase RLS. Los modulos
          operativos se agregaran sobre este menu sin cambiar el backend comun.
        </p>
      </section>
    </CompanyShell>
  );
}

import {
  createCompanyRoleAction,
  updateCompanyRoleAction,
} from "@/actions/roles.actions";
import { RolePermissionGroups } from "@/components/admin/role-permission-groups";
import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requirePermission } from "@/server/auth/guards";
import { listCompanyRoles } from "@/services/roles.service";
import { TENANT_PERMISSION_GROUPS } from "@/types/permission";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CompanyRolesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function CompanyRolesPage({
  searchParams,
}: CompanyRolesPageProps) {
  const profile = await requirePermission("company.roles.read");
  const roles = await listCompanyRoles();
  const flash = await getFlashMessage(searchParams);
  const params = await searchParams;
  const selectedRoleId = getSingleSearchParam(params.role);
  const isCreateMode = getSingleSearchParam(params.create) === "1";
  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;
  const selectedRoleHref = selectedRole
    ? `/company/settings/roles?role=${selectedRole.id}`
    : "/company/settings/roles";

  return (
    <CompanyShell
      profile={profile}
      title="Roles de empresa"
      subtitle="Gestiona los roles propios de tu tenant y revisa sus permisos por modulo."
    >
      <section className="space-y-6">
        <FlashBanner flash={flash} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Roles</h1>
            <p className="mt-2 max-w-3xl text-muted">
              Los roles de esta vista pertenecen solo a{" "}
              <span className="font-medium text-foreground">
                {profile.company_name}
              </span>
              . Selecciona uno para revisar o editar sus permisos por modulo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isCreateMode ? (
              <Link
                className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel"
                href={selectedRoleHref}
              >
                Cancelar
              </Link>
            ) : (
              <Link
                className="rounded-full bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong"
                href={`${selectedRoleHref}${selectedRole ? "&" : "?"}create=1`}
              >
                Crear nuevo rol
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] border border-line bg-white/60 p-4">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Lista de roles
              </p>
            </div>
            <div className="space-y-2">
              {roles.map((role) => {
                const isActive = !isCreateMode && selectedRole?.id === role.id;

                return (
                  <Link
                    key={role.id}
                    className={[
                      "block rounded-2xl border px-4 py-3 transition",
                      isActive
                        ? "border-[#52D6A4] bg-[#52D6A4]/14"
                        : "border-line bg-white hover:border-accent/30 hover:bg-panel",
                    ].join(" ")}
                    href={`/company/settings/roles?role=${role.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {role.name}
                        </p>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                          role.is_system
                            ? "bg-stone-200 text-stone-700"
                            : "bg-accent-soft text-accent",
                        ].join(" ")}
                      >
                        {role.is_system ? "Base" : "Editable"}
                      </span>
                    </div>
                  </Link>
                );
              })}
              {roles.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white px-4 py-6 text-sm text-muted">
                  No hay roles disponibles en esta empresa.
                </div>
              ) : null}
            </div>
          </aside>

          <section
            key={isCreateMode ? "create" : selectedRole?.id ?? "empty"}
            className="rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6"
          >
            {isCreateMode ? (
              <form action={createCompanyRoleAction} className="space-y-6">
                <input
                  name="return_to"
                  type="hidden"
                  value="/company/settings/roles?create=1"
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                    Nuevo rol
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Crear rol del tenant
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted">
                    Define un rol propio para tu empresa. Solo se permiten
                    permisos del dominio empresa.
                  </p>
                </div>

                <div className="grid gap-4">
                  <label className="block">
                    <span className="text-sm font-medium">Nombre</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      name="name"
                      placeholder="Supervisor"
                      required
                    />
                  </label>
                </div>

                <RolePermissionGroups
                  groups={TENANT_PERMISSION_GROUPS}
                  selectedPermissions={[]}
                />

                <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex gap-3 rounded-xl border border-line bg-white px-4 py-3">
                    <input
                      className="mt-1 h-4 w-4 accent-[#2b3a44]"
                      defaultChecked
                      name="is_active"
                      type="checkbox"
                      value="true"
                    />
                    <span className="text-sm font-medium">Rol activo</span>
                  </label>
                  <button className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong">
                    Crear rol
                  </button>
                </div>
              </form>
            ) : selectedRole ? (
              <form action={updateCompanyRoleAction} className="space-y-6">
                <input name="role_id" type="hidden" value={selectedRole.id} />
                <input
                  name="return_to"
                  type="hidden"
                  value={`/company/settings/roles?role=${selectedRole.id}`}
                />

                <div className="flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                      Detalle del rol
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      {selectedRole.name}
                    </h2>
                    {selectedRole.description ? (
                      <p className="mt-3 max-w-2xl text-sm text-muted">
                        {selectedRole.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={[
                        "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                        selectedRole.is_system
                          ? "bg-stone-200 text-stone-700"
                          : "bg-accent-soft text-accent",
                      ].join(" ")}
                    >
                      {selectedRole.is_system ? "Base" : "Editable"}
                    </span>
                    <span
                      className={[
                        "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                        selectedRole.is_active
                          ? "bg-[#52D6A4]/18 text-[#20513f]"
                          : "bg-stone-200 text-stone-700",
                      ].join(" ")}
                    >
                      {selectedRole.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="block">
                    <span className="text-sm font-medium">Nombre</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4 disabled:bg-stone-100 disabled:text-muted"
                      defaultValue={selectedRole.name}
                      disabled={selectedRole.is_system}
                      name="name"
                      required
                    />
                  </label>
                </div>

                <RolePermissionGroups
                  disabled={selectedRole.is_system}
                  groups={TENANT_PERMISSION_GROUPS}
                  selectedPermissions={selectedRole.permissions}
                />

                <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex gap-3 rounded-xl border border-line bg-white px-4 py-3">
                    <input
                      className="mt-1 h-4 w-4 accent-[#2b3a44]"
                      defaultChecked={selectedRole.is_active}
                      disabled={selectedRole.is_system}
                      name="is_active"
                      type="checkbox"
                      value="true"
                    />
                    <span className="text-sm font-medium">Rol activo</span>
                  </label>
                  {!selectedRole.is_system ? (
                    <button className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong">
                      Guardar cambios
                    </button>
                  ) : (
                    <p className="text-sm text-muted">
                      Este rol base ya es visible en el tenant. Si necesitas una
                      variante, crea uno nuevo y asignalo a tus usuarios.
                    </p>
                  )}
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-muted">
                No hay roles para mostrar en esta empresa.
              </div>
            )}
          </section>
        </div>
      </section>
    </CompanyShell>
  );
}

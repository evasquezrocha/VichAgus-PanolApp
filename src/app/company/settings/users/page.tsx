import {
  createManagedCompanyUserAction,
  updateManagedCompanyUserAction,
} from "@/actions/profiles.actions";
import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import { listCompanyProfiles } from "@/services/profiles.service";
import { listCompanyAssignableRoles } from "@/services/roles.service";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CompanyUsersPageProps = {
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

export default async function CompanyUsersPage({
  searchParams,
}: CompanyUsersPageProps) {
  const profile = await requireCompanyAdmin();
  const [users, roles] = await Promise.all([
    listCompanyProfiles(),
    listCompanyAssignableRoles(),
  ]);
  const flash = await getFlashMessage(searchParams);
  const params = await searchParams;
  const selectedUserId = getSingleSearchParam(params.user);
  const isCreateMode = getSingleSearchParam(params.create) === "1";
  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? users[0] ?? null;
  const selectedUserHref = selectedUser
    ? `/company/settings/users?user=${selectedUser.id}`
    : "/company/settings/users";

  return (
    <CompanyShell
      profile={profile}
      title="Usuarios de empresa"
      subtitle="Administra solo los usuarios de tu empresa y asigna roles definidos por la plataforma."
    >
      <section className="space-y-6">
        <FlashBanner flash={flash} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            {isCreateMode ? (
              <Link
                className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel"
                href={selectedUserHref}
              >
                Cancelar
              </Link>
            ) : (
              <Link
                className="rounded-full bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong"
                href={`${selectedUserHref}${selectedUser ? "&" : "?"}create=1`}
              >
                Crear usuario
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] border border-line bg-white/60 p-4">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Lista de usuarios
              </p>
            </div>
            <div className="space-y-2">
              {users.map((user) => {
                const isActive = !isCreateMode && selectedUser?.id === user.id;

                return (
                  <Link
                    key={user.id}
                    className={[
                      "block rounded-2xl border px-4 py-3 transition",
                      isActive
                        ? "border-[#52D6A4] bg-[#52D6A4]/14"
                        : "border-line bg-white hover:border-accent/30 hover:bg-panel",
                    ].join(" ")}
                    href={`/company/settings/users?user=${user.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {user.full_name ?? "-"}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted">
                          {user.email}
                        </p>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                          user.is_active
                            ? "bg-[#52D6A4]/18 text-[#20513f]"
                            : "bg-stone-200 text-stone-700",
                        ].join(" ")}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
                      <span>{user.role_name ?? user.role}</span>
                      <span>{user.company_name}</span>
                    </div>
                  </Link>
                );
              })}
              {users.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white px-4 py-6 text-sm text-muted">
                  No hay usuarios en esta empresa.
                </div>
              ) : null}
            </div>
          </aside>

          <section
            key={isCreateMode ? "create" : selectedUser?.id ?? "empty"}
            className="rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6"
          >
            {isCreateMode ? (
              <form action={createManagedCompanyUserAction} className="space-y-6">
                <input
                  name="return_to"
                  type="hidden"
                  value="/company/settings/users?create=1"
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                      Nuevo usuario
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Crear usuario de empresa
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted">
                      Define nombre, email, rol y estado inicial. El usuario
                      quedara atado a{" "}
                      <span className="font-medium text-foreground">
                        {profile.company_name}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Nombre completo</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      name="full_name"
                      placeholder="Nombre Apellido"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      name="email"
                      placeholder="usuario@empresa.com"
                      type="email"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Rol</span>
                    <select
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      name="role_id"
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Password temporal</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      name="password"
                      type="password"
                      minLength={8}
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex gap-3 rounded-xl border border-line bg-white px-4 py-3">
                    <input
                      className="mt-1 h-4 w-4 accent-[#2b3a44]"
                      name="is_active"
                      type="checkbox"
                      value="true"
                      defaultChecked
                    />
                    <span className="text-sm font-medium">Usuario activo</span>
                  </label>
                  <button
                    className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={roles.length === 0}
                  >
                    Crear usuario
                  </button>
                </div>
              </form>
            ) : selectedUser ? (
              <form action={updateManagedCompanyUserAction} className="space-y-6">
                <input name="user_id" type="hidden" value={selectedUser.id} />
                <input
                  name="return_to"
                  type="hidden"
                  value={`/company/settings/users?user=${selectedUser.id}`}
                />
                {selectedUser.id === profile.id ? (
                  <>
                    <input name="role_id" type="hidden" value={selectedUser.role_id ?? ""} />
                    <input
                      name="is_active"
                      type="hidden"
                      value={selectedUser.is_active ? "true" : "false"}
                    />
                  </>
                ) : null}

                <div className="flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                      Detalle del usuario
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      {selectedUser.full_name ?? "-"}
                    </h2>
                    <p className="mt-2 text-sm text-muted">{selectedUser.email}</p>
                    <p className="mt-1 text-sm text-muted">
                      {selectedUser.company_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={[
                        "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                        selectedUser.is_active
                          ? "bg-[#52D6A4]/18 text-[#20513f]"
                          : "bg-stone-200 text-stone-700",
                      ].join(" ")}
                    >
                      {selectedUser.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Nombre completo</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      defaultValue={selectedUser.full_name ?? ""}
                      name="full_name"
                      placeholder="Nombre Apellido"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      defaultValue={selectedUser.email}
                      name="email"
                      type="email"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Rol</span>
                    <select
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4 disabled:bg-stone-100 disabled:text-muted"
                      defaultValue={selectedUser.role_id ?? ""}
                      disabled={selectedUser.id === profile.id}
                      name="role_id"
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-end gap-3 rounded-xl border border-line bg-white px-4 py-3">
                    <input
                      className="mb-1 h-4 w-4 accent-[#2b3a44]"
                      defaultChecked={selectedUser.is_active}
                      disabled={selectedUser.id === profile.id}
                      name="is_active"
                      type="checkbox"
                      value="true"
                    />
                    <span className="text-sm font-medium">Usuario activo</span>
                  </label>
                </div>

                <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted">
                    {selectedUser.id === profile.id
                      ? "Puedes editar tu nombre y email, pero no tu rol ni estado desde aqui."
                      : "Los cambios afectan solo a usuarios de tu empresa."}
                  </div>
                  <button
                    className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-muted">
                No hay usuarios para mostrar.
              </div>
            )}
          </section>
        </div>
      </section>
    </CompanyShell>
  );
}

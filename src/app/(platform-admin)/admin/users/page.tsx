import {
  createCompanyUserAction,
  updateManagedPlatformUserAction,
  updateUserTemporaryPasswordAction,
} from "@/actions/profiles.actions";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { listCompanies } from "@/services/companies.service";
import { listProfiles } from "@/services/profiles.service";
import { listPlatformAssignableRoles } from "@/services/roles.service";
import Link from "next/link";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
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

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const [profiles, companies, roles] = await Promise.all([
    listProfiles(),
    listCompanies(),
    listPlatformAssignableRoles(),
  ]);
  const flash = await getFlashMessage(searchParams);
  const params = await searchParams;
  const isCreateMode = getSingleSearchParam(params.create) === "1";
  const searchTerm = getSingleSearchParam(params.q) ?? "";
  const normalizedSearch = normalizeSearch(searchTerm);
  const selectedUserId = getSingleSearchParam(params.user);
  const querySuffix = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : "";

  const filteredProfiles = normalizedSearch
    ? profiles.filter((profile) => {
        const haystack = [
          profile.full_name ?? "",
          profile.email,
          profile.company_name ?? "",
          profile.role_name ?? profile.role,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
    : profiles;

  const selectedUser =
    filteredProfiles.find((profile) => profile.id === selectedUserId) ??
    filteredProfiles[0] ??
    null;
  const selectedUserHref = selectedUser
    ? `/admin/users?user=${selectedUser.id}${querySuffix}`
    : `/admin/users${querySuffix}`;

  return (
    <section className="space-y-6">
      <FlashBanner flash={flash} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Usuarios</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Crea usuarios asociados a una empresa. La clave temporal debe ser
            cambiada luego por un flujo formal de recuperacion o invitacion.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <form method="get" className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-[18rem] rounded-full border border-line bg-white px-4 py-3 text-sm outline-none ring-accent/25 transition focus:ring-4"
              defaultValue={searchTerm}
              name="q"
              placeholder="Buscar usuario, email, empresa o rol"
              type="search"
            />
            {isCreateMode ? <input name="create" type="hidden" value="1" /> : null}
            {selectedUserId ? (
              <input name="user" type="hidden" value={selectedUserId} />
            ) : null}
            <button className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel">
              Buscar
            </button>
          </form>

          {isCreateMode ? (
            <Link
              className="rounded-full border border-line bg-white px-5 py-3 text-center font-semibold text-foreground transition hover:bg-panel"
              href={`/admin/users${querySuffix}${selectedUserId ? `&user=${selectedUserId}` : ""}`}
            >
              Cancelar
            </Link>
          ) : (
            <Link
              className="rounded-full bg-accent px-5 py-3 text-center font-semibold text-white transition hover:bg-accent-strong"
              href={`/admin/users?create=1${querySuffix}${selectedUserId ? `&user=${selectedUserId}` : ""}`}
            >
              Crear usuario
            </Link>
          )}
        </div>
      </div>

      {isCreateMode ? (
        <form
          action={createCompanyUserAction}
          className="grid gap-4 rounded-[1.75rem] border border-line bg-white/55 p-5 lg:grid-cols-2"
        >
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
          <label className="block">
            <span className="text-sm font-medium">Empresa</span>
            <select
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              name="company_id"
              required
            >
              <option value="">Selecciona una empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:col-span-2">
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
              disabled={companies.length === 0}
            >
              Crear usuario
            </button>
          </div>
        </form>
      ) : null}

      {companies.length === 0 ? (
        <p className="rounded-xl border border-line bg-white/65 px-4 py-3 text-sm text-muted">
          Primero crea una empresa en /admin/companies para asociar usuarios.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="rounded-[1.75rem] border border-line bg-white/60 p-4">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Lista de usuarios
            </p>
          </div>

          <div className="space-y-2">
            {filteredProfiles.map((profile) => {
              const isActive = !isCreateMode && selectedUser?.id === profile.id;

              return (
                <Link
                  key={profile.id}
                  className={[
                    "block rounded-2xl border px-4 py-3 transition",
                    isActive
                      ? "border-[#52D6A4] bg-[#52D6A4]/14"
                      : "border-line bg-white hover:border-accent/30 hover:bg-panel",
                  ].join(" ")}
                  href={`/admin/users?user=${profile.id}${querySuffix}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {profile.full_name ?? "-"}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">
                        {profile.email}
                      </p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                        profile.is_active
                          ? "bg-[#52D6A4]/18 text-[#20513f]"
                          : "bg-stone-200 text-stone-700",
                      ].join(" ")}
                    >
                      {profile.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
                    <span>{profile.role_name ?? profile.role}</span>
                    <span>{profile.company_name ?? "Plataforma"}</span>
                  </div>
                </Link>
              );
            })}

            {filteredProfiles.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white px-4 py-6 text-sm text-muted">
                {normalizedSearch
                  ? "No hay usuarios que coincidan con la busqueda."
                  : "No hay usuarios visibles."}
              </div>
            ) : null}
          </div>
        </aside>

        <section
          key={isCreateMode ? "create" : selectedUser?.id ?? "empty"}
          className="rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6"
        >
          {isCreateMode ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                  Nuevo usuario
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Crear usuario de plataforma
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  Define nombre, email, empresa, rol y estado inicial.
                </p>
              </div>
              <p className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-muted">
                El formulario de creación se muestra arriba. Completa los datos
                para guardar el nuevo usuario.
              </p>
            </div>
          ) : selectedUser ? (
            <div className="space-y-5">
              <form action={updateManagedPlatformUserAction} className="space-y-6">
                <input name="user_id" type="hidden" value={selectedUser.id} />
                <input name="return_to" type="hidden" value={selectedUserHref} />

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
                      {selectedUser.company_name ?? "Plataforma"}
                    </p>
                  </div>
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

                {selectedUser.role === "super_admin" ? (
                  <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-6 text-sm text-muted">
                    Los usuarios super_admin no se editan desde esta vista.
                  </div>
                ) : (
                  <>
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
                          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                          defaultValue={selectedUser.role_id ?? ""}
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
                          name="is_active"
                          type="checkbox"
                          value="true"
                        />
                        <span className="text-sm font-medium">Usuario activo</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-muted">
                        Edita el usuario seleccionado desde el panel.
                      </div>
                      <button className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong">
                        Guardar cambios
                      </button>
                    </div>
                  </>
                )}
              </form>

              {selectedUser.role !== "super_admin" ? (
                <div className="rounded-[1.5rem] border border-line bg-white/80 p-5">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                      Password temporal
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Cambia la clave temporal sin modificar el resto del perfil.
                    </p>
                  </div>
                  <form
                    action={updateUserTemporaryPasswordAction}
                    className="flex flex-col gap-3 xl:flex-row"
                  >
                    <input name="user_id" type="hidden" value={selectedUser.id} />
                    <input
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none ring-accent/25 transition focus:ring-4"
                      name="password"
                      type="password"
                      minLength={8}
                      placeholder="Nueva password"
                      required
                    />
                    <button className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong">
                      Cambiar
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-muted">
              No hay usuarios para mostrar.
            </div>
          )}
        </section>
      </div>

      <p className="text-sm text-muted">
        {normalizedSearch
          ? `Mostrando ${filteredProfiles.length} de ${profiles.length} usuarios.`
          : `Total: ${profiles.length} usuarios.`}
      </p>
    </section>
  );
}

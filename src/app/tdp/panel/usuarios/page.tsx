import {
  createTdpProfileAction,
  createTdpUserAction,
} from "@/app/tdp/panel/usuarios/actions";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { getTdpPublicProfileBaseUrl } from "@/lib/site";
import { requireTdpAdmin } from "@/server/auth/guards";
import { listTdpAuthUsers } from "@/server/dal/tdp-users.dal";
import { listTdpProfileConfigsByUserId } from "@/server/dal/tdp-profile-configs.dal";
import Link from "next/link";

export const dynamic = "force-dynamic";

type TdpUsersPageProps = {
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

export default async function TdpUsersPage({
  searchParams,
}: TdpUsersPageProps) {
  const profile = await requireTdpAdmin();
  const flash = await getFlashMessage(searchParams);
  const users = await listTdpAuthUsers();
  const params = await searchParams;
  const isCreateMode = getSingleSearchParam(params.create) === "1";
  const selectedUserId = getSingleSearchParam(params.user);
  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? users[0] ?? null;
  const selectedUserProfiles = selectedUser
    ? await listTdpProfileConfigsByUserId(selectedUser.id)
    : [];

  const createHref = `/tdp/panel/usuarios?create=1${
    selectedUserId ? `&user=${encodeURIComponent(selectedUserId)}` : ""
  }`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#4c5566_0%,_#262c3a_38%,_#151821_100%)] px-6 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <FlashBanner flash={flash} />

        <section className="rounded-[2rem] border border-sky-950/50 bg-slate-900/90 px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
                Administracion TDP
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Usuarios TDP
              </h1>
              <p className="mt-2 max-w-2xl text-white/75">
                Crea y revisa cuentas de acceso a la plataforma TDP. Estas cuentas se
                almacenan solo en Supabase Auth y usan `site_variant=tdp`.
              </p>
            </div>

            <Link
              href={createHref}
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Nuevo usuario
            </Link>

            <Link
              href="/tdp/panel"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Volver al panel
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] border border-sky-950/50 bg-slate-900/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                  Usuarios
                </p>
                <p className="mt-2 text-sm text-white/65">
                  {users.length} cuenta{users.length === 1 ? "" : "s"}
                </p>
              </div>

              <Link
                href={createHref}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Nuevo
              </Link>
            </div>

            <nav className="mt-4 space-y-2">
              {users.map((user) => {
                const isActive = !isCreateMode && selectedUser?.id === user.id;

                return (
                  <Link
                    key={user.id}
                    href={`/tdp/panel/usuarios?user=${encodeURIComponent(user.id)}${
                      isCreateMode ? "&create=1" : ""
                    }`}
                  className={[
                    "block rounded-2xl border px-4 py-3 transition",
                    isActive
                      ? "border-emerald-400/50 bg-emerald-400/10"
                      : "border-white/10 bg-white/5 hover:border-blue-400/30 hover:bg-white/10",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.full_name || user.email}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/65">
                        {user.email}
                      </p>
                    </div>

                      <span
                      className={[
                        "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                        user.is_admin
                          ? "bg-fuchsia-400/15 text-fuchsia-200"
                          : "bg-white/10 text-white/70",
                      ].join(" ")}
                    >
                      {user.is_admin ? "Admin" : "Usuario"}
                    </span>
                    </div>
                  </Link>
                );
              })}

            {users.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-white/65">
                  No hay usuarios TDP registrados todavia.
                </div>
              ) : null}
            </nav>
          </aside>

          <main className="space-y-6">
            {isCreateMode ? (
              <form
                action={createTdpUserAction}
                className="grid gap-4 rounded-[1.75rem] border border-sky-950/50 bg-slate-900/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur lg:grid-cols-2"
              >
                <div className="lg:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                    Nuevo usuario
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Crear cuenta TDP
                  </h2>
                  <p className="mt-2 text-sm text-white/65">
                    Completa los campos necesarios para generar acceso a la plataforma.
                  </p>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-white/85">Nombre completo</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-blue-400/25 transition placeholder:text-white/30 focus:ring-4"
                    name="full_name"
                    placeholder="Nombre Apellido"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-white/85">Email</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-blue-400/25 transition placeholder:text-white/30 focus:ring-4"
                    name="email"
                    placeholder="usuario@tdp.cl"
                    type="email"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-white/85">Password temporal</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-blue-400/25 transition placeholder:text-white/30 focus:ring-4"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                  />
                </label>

                <label className="flex items-end gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <input
                    className="mb-1 h-4 w-4 accent-blue-400"
                    name="is_admin"
                    type="checkbox"
                    value="true"
                  />
                  <span className="text-sm font-medium text-white/85">Administrador TDP</span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
                  <p className="text-sm text-white/65">
                    Esta cuenta se guardara en Supabase Auth como usuario de TDP.
                  </p>
                  <button className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong">
                    Guardar usuario
                  </button>
                </div>
              </form>
            ) : (
              <section className="rounded-[1.75rem] border border-sky-950/50 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
                {selectedUser ? (
                  <div className="space-y-5">
                    <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                            Perfiles asociados
                          </p>
                          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                            {selectedUserProfiles.length === 1
                              ? "1 perfil vinculado"
                              : `${selectedUserProfiles.length} perfiles vinculados`}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-semibold text-blue-200">
                            {selectedUserProfiles.length}
                          </span>
                          <form action={createTdpProfileAction}>
                            <input name="user_id" type="hidden" value={selectedUser.id} />
                            <input
                              name="return_to"
                              type="hidden"
                              value={`/tdp/panel/usuarios?user=${encodeURIComponent(selectedUser.id)}`}
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                            >
                              Crear Perfil Publico
                            </button>
                          </form>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {selectedUserProfiles.length > 0 ? (
                          selectedUserProfiles.map((profileConfig) => {
                            const profileUrl = profileConfig.profile_code
                              ? `${getTdpPublicProfileBaseUrl()}/perfil/${profileConfig.profile_code}`
                              : null;

                            return (
                              <article
                                key={profileConfig.profile_code || profileConfig.full_name}
                                className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">
                                      {profileConfig.full_name || "Perfil sin nombre"}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">
                                      {profileConfig.profile_code || "Sin codigo publico"}
                                    </p>
                                    <p className="mt-2 text-sm text-white/65">
                                      {profileConfig.description || "Perfil digital activo"}
                                    </p>
                                  </div>

                              <div className="flex shrink-0 flex-wrap items-start gap-3 md:justify-end">
                                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                                  {profileConfig.widget_ids.length} widgets
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Link
                                    href={`/tdp/panel/perfil?user=${encodeURIComponent(selectedUser.id)}`}
                                    className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                                  >
                                    Editar perfil
                                  </Link>
                                      {profileUrl ? (
                                        <Link
                                          href={profileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                        >
                                          Ver publico
                                        </Link>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </article>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-white/65">
                            Este usuario no tiene perfiles TDP asociados todavia.
                          </div>
                        )}
                      </div>
                    </section>

                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                          Usuario seleccionado
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                          {selectedUser.full_name || selectedUser.email}
                        </h2>
                        <p className="mt-2 break-all text-sm text-white/65">
                          {selectedUser.email}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            selectedUser.is_admin
                              ? "bg-fuchsia-400/15 text-fuchsia-200"
                              : "bg-white/10 text-white/70",
                          ].join(" ")}
                        >
                          {selectedUser.is_admin ? "Admin" : "Usuario"}
                        </span>
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            selectedUser.is_active
                              ? "bg-emerald-400/15 text-emerald-200"
                              : "bg-rose-400/15 text-rose-200",
                          ].join(" ")}
                        >
                          {selectedUser.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>

                    <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Confirmado
                        </dt>
                        <dd className="mt-2 font-medium text-slate-800">
                          {selectedUser.email_confirmed_at ? "Si" : "No"}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Ultimo ingreso
                        </dt>
                        <dd className="mt-2 font-medium text-slate-800">
                          {selectedUser.last_sign_in_at
                            ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                            : "-"}
                        </dd>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Creado
                        </dt>
                        <dd className="mt-2 font-medium text-slate-800">
                          {new Date(selectedUser.created_at).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-white/65">
                    Selecciona un usuario en el menu lateral o crea una nueva cuenta.
                  </div>
                )}
              </section>
            )}
          </main>
        </div>

        <div className="text-sm text-white/65">
          {profile.is_tdp_admin
            ? "Estas navegando como administrador TDP."
            : "Cuenta TDP con permisos limitados."}
        </div>
      </div>
    </main>
  );
}

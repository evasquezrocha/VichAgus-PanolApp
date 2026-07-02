import { signOutAction } from "@/actions/auth.actions";
import { PublicUrlCopyButton } from "@/components/tdp/public-url-copy-button";
import { requireCurrentProfile } from "@/server/auth/guards";
import { getTdpProfileConfig } from "@/server/dal/tdp-profile-configs.dal";
import { getTdpPublicProfileBaseUrl } from "@/lib/site";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TdpPanelPage() {
  const profile = await requireCurrentProfile();
  const profileConfig = await getTdpProfileConfig(profile.id);
  const publicUrl = profileConfig.profile_code
    ? `${getTdpPublicProfileBaseUrl()}/perfil/${profileConfig.profile_code}`
    : null;

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-[2rem] border border-blue-100 bg-white/85 p-6 shadow-[0_18px_50px_rgba(30,58,138,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            Lopva TDP
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Panel TDP
          </h1>
        </header>

        <section className="rounded-[1.5rem] border border-blue-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur">
          <p className="text-sm font-medium text-slate-500">Usuario activo</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {profile.full_name ?? profile.email ?? "Sin sesión"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{profile.email}</p>
        </section>

        <section className="rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                Perfiles asociados
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Tu perfil digital público
              </h2>
            </div>
            <Link
              href="/tdp/panel/perfil"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Administrar perfil
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            {profileConfig.profile_code ? (
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {profileConfig.full_name || profile.full_name || profile.email}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {profileConfig.description || "Perfil digital activo"}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {profileConfig.widget_ids.length} widgets
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">Código público:</span>{" "}
                    <span className="font-mono">{profileConfig.profile_code}</span>
                  </div>
                  {publicUrl ? (
                    <div className="break-all">
                      <span className="font-semibold text-slate-700">URL pública:</span>{" "}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <a
                          className="text-blue-700 underline"
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {publicUrl}
                        </a>
                        <PublicUrlCopyButton url={publicUrl} />
                      </div>
                    </div>
                  ) : null}
                  <div>Usuario: {profile.email}</div>
                </div>
              </article>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
                No tienes un perfil digital público todavía. Usa el botón de arriba para crear el primero.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                Acciones
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Gestiona tu tarjeta de presentación digital
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tdp/panel/perfil"
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Crear un Perfil Digital
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

import { PublicUrlCopyButton } from "@/components/tdp/public-url-copy-button";
import { TdpUserMenu } from "@/components/tdp/tdp-user-menu";
import { getTdpPublicProfileBaseUrl } from "@/lib/site";
import { requireCurrentProfile } from "@/server/auth/guards";
import { getTdpProfileConfig } from "@/server/dal/tdp-profile-configs.dal";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TdpPanelPage() {
  const profile = await requireCurrentProfile();
  const profileConfig = await getTdpProfileConfig(profile.id);
  const publicUrl = profileConfig.profile_code
    ? `${getTdpPublicProfileBaseUrl()}/perfil/${profileConfig.profile_code}`
    : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#4c5566_0%,_#262c3a_38%,_#151821_100%)] px-6 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="relative z-30 rounded-[2rem] border border-sky-950/50 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2">
                <Image
                  alt="Lopva"
                  src="/brand/lopva_logo_symbol.png"
                  width={56}
                  height={56}
                  className="h-11 w-11 object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
                  Lopva TDP
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  Panel TDP
                </h1>
              </div>
            </div>

            <div className="relative z-40 flex flex-wrap items-center gap-3 lg:max-w-md lg:justify-end">
              {profile.is_tdp_admin ? (
                <Link
                  href="/tdp/panel/usuarios"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Usuarios TDP
                </Link>
              ) : null}
              <TdpUserMenu profile={profile} />
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] border border-sky-950/50 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                Perfiles asociados
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {profileConfig.profile_code ? (
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-white">
                      {profileConfig.full_name || profile.full_name || profile.email}
                    </h3>
                    <p className="mt-1 text-sm text-white/65">
                      {profileConfig.description || "Perfil digital activo"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-start gap-3 md:justify-end">
                    <div className="rounded-full bg-blue-400/15 px-3 py-1 text-sm font-semibold text-blue-200">
                      {profileConfig.widget_ids.length} widgets
                    </div>
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/tdp/panel/perfil"
                        className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                      >
                        Editar perfil publico
                      </Link>
                      {publicUrl ? (
                        <Link
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          Ver perfil publico
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-white/70">
                  <div>
                    <span className="font-semibold text-white/85">Codigo publico:</span>{" "}
                    <span className="font-mono">{profileConfig.profile_code}</span>
                  </div>
                  {publicUrl ? (
                    <div className="break-all">
                      <span className="font-semibold text-white/85">URL publica:</span>{" "}
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <a
                          className="text-blue-300 underline"
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
                </div>
              </article>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-white/70">
                No tienes un perfil digital publico todavia. Usa el boton de arriba para crear el primero.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

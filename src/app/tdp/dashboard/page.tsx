import Link from "next/link";

import { requireCurrentProfile } from "@/server/auth/guards";

export const dynamic = "force-dynamic";

export default async function TdpDashboardPage() {
  const profile = await requireCurrentProfile();

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-[2rem] border border-blue-100 bg-white/85 p-6 shadow-[0_18px_50px_rgba(30,58,138,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            Lopva TDP
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Dashboard TDP
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Espacio separado para configurar contenido, marca y accesos de TDP sin
            tocar la plataforma principal.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-blue-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Usuario</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              {profile?.full_name ?? profile?.email ?? "Sin sesión"}
            </h2>
          </article>
          <article className="rounded-[1.5rem] border border-blue-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Estado</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Configuración</h2>
          </article>
          <article className="rounded-[1.5rem] border border-blue-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Rutas</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">/tdp/*</h2>
          </article>
        </section>

        <section className="rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                Próximo paso
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Crea los primeros módulos TDP con prefijo `tdp_`
              </h2>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Cerrar sesión
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

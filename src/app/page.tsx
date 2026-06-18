import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
      <section className="rounded-[2rem] border border-line bg-panel/85 p-8 shadow-2xl shadow-[#2b3a44]/10 backdrop-blur md:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-accent">
          PanolApp SaaS
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          Base web multiempresa preparada para Supabase y app movil futura.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          Arquitectura inicial con tenants por empresa, roles, RLS y capas
          reutilizables para que web y Expo compartan el mismo backend.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-accent px-6 py-3 text-center font-semibold text-white transition hover:bg-accent-strong"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-line px-6 py-3 text-center font-semibold text-foreground transition hover:bg-accent-soft"
          >
            Ir al dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

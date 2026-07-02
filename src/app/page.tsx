import Image from "next/image";
import Link from "next/link";

import { getSiteConfig } from "@/lib/site";

const site = getSiteConfig();

const highlights = [
  "Control operativo en tiempo real",
  "Acceso por empresa, roles y permisos",
  "Datos listos para web y app móvil",
];

const pillars = [
  {
    title: "Inventario y activos",
    description:
      "Seguimiento de herramientas, equipos y activos con una experiencia pensada para trabajo diario.",
  },
  {
    title: "Multiempresa y seguridad",
    description:
      "Cada tenant con su propio alcance, usuarios y reglas para evitar cruces entre organizaciones.",
  },
  {
    title: "Listo para crecer",
    description:
      "Una base limpia para operaciones, paneles internos y nuevas funcionalidades sin rehacer la plataforma.",
  },
];

const metrics = [
  {
    value: "1",
    label: "entrada pública",
    detail: "Una sola vista clara para descubrir la plataforma",
  },
  {
    value: "24/7",
    label: "acceso",
    detail: "Tu equipo entra cuando lo necesita desde cualquier lugar",
  },
  {
    value: "100%",
    label: "web-first",
    detail: "Diseñada para escritorio y móvil desde el inicio",
  },
];

const steps = ["Detecta lo que tienes", "Ordena quién lo usa", "Sigue cada movimiento"];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_80%_18%,_rgba(6,182,212,0.18),_transparent_22%),linear-gradient(135deg,_#ffffff_0%,_#eff6ff_44%,_#f8fbff_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.72),_transparent)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-5 sm:px-8 lg:px-10">
        <header className="animate-fade-up flex items-center justify-between gap-4 rounded-full border border-white/80 bg-white/75 px-4 py-3 shadow-[0_20px_80px_rgba(30,58,138,0.09)] backdrop-blur-md sm:px-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={site.assets.logoHeader}
              alt={site.brandName}
              width={1024}
              height={399}
              priority
              className="h-16 w-auto sm:h-20 lg:h-24"
            />
          </Link>

          <nav className="hidden items-center gap-8 font-[family-name:var(--font-manrope)] text-sm font-medium text-slate-600 md:flex">
            <a href="#plataforma-gestion" className="transition hover:text-accent">
              Plataforma de Gestión
            </a>
            <a href="#tarjeta-presentacion-digital" className="transition hover:text-accent">
              Tarjeta de Presentación Digital
            </a>
            <a href="#plataforma-tdp" className="transition hover:text-accent">
              Plataforma TPD
            </a>
          </nav>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 font-[family-name:var(--font-sora)] text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Acceder
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 pb-10 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:pt-20">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 font-[family-name:var(--font-manrope)] text-xs font-semibold uppercase tracking-[0.3em] text-accent shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              {site.home.badge}
            </div>

            <h1 className="mt-7 max-w-4xl font-[family-name:var(--font-montserrat)] text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              {site.home.headline}
            </h1>

            <p className="mt-6 max-w-2xl font-[family-name:var(--font-inter)] text-lg leading-8 text-slate-600 sm:text-xl">
              {site.home.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((item, index) => (
                <span
                  key={item}
                  className="animate-fade-up rounded-full border border-blue-100 bg-white/85 px-4 py-2 font-[family-name:var(--font-manrope)] text-sm text-slate-700 shadow-sm backdrop-blur"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-center font-[family-name:var(--font-sora)] font-semibold text-white transition hover:bg-accent-strong"
              >
                {site.home.ctaPrimary}
              </Link>
              <a
                href="#plataforma-gestion"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-7 py-3.5 text-center font-[family-name:var(--font-sora)] font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {site.home.ctaSecondary}
              </a>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="animate-fade-up rounded-[1.5rem] border border-blue-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(30,58,138,0.08)] backdrop-blur"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="font-[family-name:var(--font-montserrat)] text-3xl font-semibold tracking-tight text-slate-900">
                    {metric.value}
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-sora)] text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                    {metric.label}
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-6 text-slate-600">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl animate-drift" />
            <div className="absolute -right-4 bottom-12 h-32 w-32 rounded-full bg-blue-600/15 blur-3xl animate-drift" />

            <div
              id="plataforma-tdp"
              className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-slate-900 p-5 text-white shadow-[0_30px_120px_rgba(30,58,138,0.28)] animate-float"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.22),transparent_42%,rgba(6,182,212,0.18))]" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-2 shadow-lg shadow-black/15">
                    <Image
                      src={site.assets.symbol}
                      alt={`${site.brandName} symbol`}
                      width={56}
                      height={56}
                      className="h-14 w-14"
                    />
                  </div>
                  <div>
                    <Image
                      src={site.assets.logoHeader}
                      alt={site.brandName}
                      width={1024}
                      height={399}
                      className="h-16 w-auto sm:h-20 lg:h-24"
                    />
                  </div>
                </div>
                <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-[family-name:var(--font-manrope)] text-xs font-semibold uppercase tracking-[0.25em] text-white/75">
                  Live
                </div>
              </div>

              <p className="relative mt-4 max-w-2xl font-[family-name:var(--font-inter)] text-sm leading-6 text-white/72">
                Soluciones de software para control operativo, accesos por empresa y
                seguimiento de activos.
              </p>

              <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                  <p className="font-[family-name:var(--font-inter)] text-sm font-medium text-white/70">
                    Activos en seguimiento
                  </p>
                  <p className="mt-4 font-[family-name:var(--font-montserrat)] text-4xl font-semibold">
                    128
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-6 text-white/72">
                    Seguimiento ordenado para equipos, herramientas y ubicaciones.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                  <p className="font-[family-name:var(--font-inter)] text-sm font-medium text-white/70">
                    Flujo de trabajo
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="h-2 rounded-full bg-white/12">
                      <div className="h-2 w-4/5 rounded-full bg-cyan-400" />
                    </div>
                    <div className="h-2 rounded-full bg-white/12">
                      <div className="h-2 w-2/3 rounded-full bg-white/55" />
                    </div>
                    <div className="h-2 rounded-full bg-white/12">
                      <div className="h-2 w-3/5 rounded-full bg-blue-400" />
                    </div>
                  </div>
                  <p className="mt-4 font-[family-name:var(--font-inter)] text-sm leading-6 text-white/72">
                    Una interfaz preparada para cargar, revisar y operar sin fricción.
                  </p>
                </div>
              </div>

              <div className="relative mt-4 rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-[family-name:var(--font-inter)] text-sm font-medium text-white/70">
                      Acceso rápido
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-montserrat)] text-lg font-semibold">
                      Acceso directo a la plataforma
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 font-[family-name:var(--font-sora)] text-sm font-semibold text-slate-900 transition hover:bg-cyan-50"
                  >
                    Abrir acceso
                  </Link>
                </div>
              </div>
            </div>

            <div id="capacidades" className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-blue-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(30,58,138,0.08)] backdrop-blur">
                <p className="font-[family-name:var(--font-sora)] text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                  Seguridad
                </p>
                <p className="mt-3 font-[family-name:var(--font-inter)] text-base leading-7 text-slate-700">
                  Accesos por rol y empresa para mantener la operación separada y
                  controlada.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-blue-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(30,58,138,0.08)] backdrop-blur">
                <p className="font-[family-name:var(--font-sora)] text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                  Movilidad
                </p>
                <p className="mt-3 font-[family-name:var(--font-inter)] text-base leading-7 text-slate-700">
                  Diseñado para que el equipo consulte, actualice y trabaje desde
                  campo o escritorio.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="plataforma-gestion"
          className="grid gap-4 border-t border-blue-100 pt-10 md:grid-cols-3"
        >
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="rounded-[1.75rem] border border-blue-100 bg-white/80 p-6 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur"
            >
              <p className="font-[family-name:var(--font-sora)] text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                0{index + 1}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-montserrat)] text-2xl font-semibold tracking-tight text-slate-900">
                {pillar.title}
              </h2>
              <p className="mt-4 font-[family-name:var(--font-inter)] text-base leading-7 text-slate-600">
                {pillar.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-4 rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-[0_18px_50px_rgba(30,58,138,0.06)] backdrop-blur lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="font-[family-name:var(--font-sora)] text-sm font-semibold uppercase tracking-[0.3em] text-accent">
              Flujo
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-montserrat)] text-3xl font-semibold tracking-tight text-slate-900">
              Tres pasos para ordenar la operación
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5"
              >
                <p className="font-[family-name:var(--font-sora)] text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">
                  Paso 0{index + 1}
                </p>
                <p className="mt-4 font-[family-name:var(--font-inter)] text-lg font-medium text-slate-800">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="tarjeta-presentacion-digital"
          className="mt-10 overflow-hidden rounded-[2rem] border border-blue-100 bg-slate-900 text-white shadow-[0_30px_120px_rgba(30,58,138,0.18)]"
        >
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-8 sm:p-10">
              <p className="font-[family-name:var(--font-sora)] text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Tarjeta de Presentación Digital
              </p>
              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-montserrat)] text-3xl font-semibold tracking-tight sm:text-4xl">
                {site.variant === "tdp"
                  ? "Una base visual única para TDP, con acceso y datos separados del producto principal."
                  : "Una forma rápida de presentar Lopva y llevar a cada contacto al login."}
              </h2>
              <p className="mt-5 max-w-xl font-[family-name:var(--font-inter)] text-base leading-7 text-white/76">
                {site.variant === "tdp"
                  ? "El mismo formato visual se mantiene, pero la configuración, las variables y el despliegue son independientes."
                  : "El menú público ahora incluye esta entrada para que la primera vista funcione como una tarjeta digital: marca, propuesta de valor y acceso directo a la plataforma."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-[family-name:var(--font-sora)] text-sm font-semibold text-slate-900 transition hover:bg-cyan-50"
                >
                  {site.home.ctaPrimary}
                </Link>
                <a
                  href="#plataforma-tdp"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 font-[family-name:var(--font-sora)] text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  {site.home.ctaSecondary}
                </a>
              </div>
            </div>
            <div className="border-t border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.3),rgba(6,182,212,0.18))] p-8 sm:p-10 lg:border-l lg:border-t-0">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur">
                <p className="font-[family-name:var(--font-sora)] text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  Acceso
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Image
                    src={site.assets.symbol}
                    alt={`${site.brandName} symbol`}
                    width={64}
                    height={64}
                    className="h-16 w-16"
                  />
                  <Image
                    src={site.assets.logoCompact}
                    alt={site.brandName}
                    width={1024}
                    height={399}
                    className="h-16 w-auto sm:h-20"
                  />
                </div>
                <p className="mt-5 font-[family-name:var(--font-inter)] text-sm leading-6 text-white/70">
                  Menú público, branding oficial y acceso directo a la plataforma en
                  una sola pieza.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

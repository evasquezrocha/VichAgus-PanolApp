import Image from "next/image";
import Link from "next/link";

import { FlashBanner } from "@/components/ui/flash-banner";
import { signInWithPasswordAction } from "@/actions/auth.actions";
import { getFlashMessage } from "@/lib/flash";
import { getDefaultDashboardPath, getSiteConfig } from "@/lib/site";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const site = getSiteConfig();

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const flash = await getFlashMessage(searchParams);
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : getDefaultDashboardPath();

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_28%),radial-gradient(circle_at_85%_20%,_rgba(6,182,212,0.16),_transparent_22%),linear-gradient(135deg,_#ffffff_0%,_#eff6ff_55%,_#f8fbff_100%)]"
      />

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(6,182,212,0.22),_transparent_25%),linear-gradient(135deg,_rgba(30,58,138,0.95),_rgba(15,23,42,0.98))]" />
          <div className="relative flex h-full flex-col justify-between">
            <Image
              src={site.assets.logoCompact}
              alt={site.brandName}
              width={320}
              height={384}
              priority
              className="h-16 w-auto"
            />

            <div className="max-w-xl">
              <p className="font-[family-name:var(--font-sora)] text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                {site.login.helperTitle}
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-montserrat)] text-5xl font-semibold tracking-tight">
                {site.login.title}
              </h1>
              <p className="mt-6 font-[family-name:var(--font-inter)] text-lg leading-8 text-white/78">
                {site.login.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="font-[family-name:var(--font-sora)] text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  Seguridad
                </p>
                <p className="mt-3 font-[family-name:var(--font-inter)] text-base leading-7 text-white/82">
                  {site.login.helperDescription}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="font-[family-name:var(--font-sora)] text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  Enfoque
                </p>
                <p className="mt-3 font-[family-name:var(--font-inter)] text-base leading-7 text-white/82">
                  Flujo rápido, simple y preparado para uso en escritorio o campo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <Image
                  src={site.assets.logoCompact}
                  alt={site.brandName}
                  width={260}
                  height={312}
                  className="h-14 w-auto"
                />
              </Link>
              <Link
                href="/"
                className="font-[family-name:var(--font-sora)] text-sm font-semibold text-accent"
              >
                Volver
              </Link>
            </div>

            <form
              action={signInWithPasswordAction}
              className="rounded-[2rem] border border-blue-100 bg-white/85 p-8 shadow-[0_30px_120px_rgba(30,58,138,0.12)] backdrop-blur md:p-10"
            >
              <input name="next" type="hidden" value={next} />
              <FlashBanner flash={flash} />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-sora)] text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                    Acceso
                  </p>
                  <h1 className="mt-3 font-[family-name:var(--font-montserrat)] text-3xl font-semibold tracking-tight text-slate-900">
                    {site.login.title}
                  </h1>
                </div>
                <Link
                  href="/"
                  className="hidden rounded-full border border-line bg-white px-4 py-2 font-[family-name:var(--font-sora)] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:inline-flex"
                >
                  Volver al inicio
                </Link>
              </div>

              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="font-[family-name:var(--font-manrope)] text-sm font-medium text-slate-700">
                    Email
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3.5 font-[family-name:var(--font-inter)] outline-none ring-accent/20 transition placeholder:text-slate-400 focus:ring-4"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                    required
                  />
                </label>
                <label className="block">
                  <span className="font-[family-name:var(--font-manrope)] text-sm font-medium text-slate-700">
                    Contraseña
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3.5 font-[family-name:var(--font-inter)] outline-none ring-accent/20 transition placeholder:text-slate-400 focus:ring-4"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                  />
                </label>
              </div>

              <button className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3.5 font-[family-name:var(--font-sora)] text-sm font-semibold text-white transition hover:bg-accent-strong">
                Entrar
              </button>

              <p className="mt-5 text-center font-[family-name:var(--font-inter)] text-sm text-slate-500">
                Si necesitas acceso, contacta al administrador de tu empresa.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

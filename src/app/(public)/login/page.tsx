import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const flash = await getFlashMessage(searchParams);
  const next = typeof params.next === "string" && params.next.startsWith("/")
    ? params.next
    : "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <form
        action="/auth/login"
        method="post"
        className="rounded-[1.75rem] border border-line bg-panel/90 p-8 shadow-2xl shadow-[#2b3a44]/10"
      >
        <input name="next" type="hidden" value={next} />
        <FlashBanner flash={flash} />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
          Acceso
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Iniciar sesion
        </h1>
        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
        </div>
        <button className="mt-8 w-full rounded-full bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong">
          Entrar
        </button>
      </form>
    </main>
  );
}

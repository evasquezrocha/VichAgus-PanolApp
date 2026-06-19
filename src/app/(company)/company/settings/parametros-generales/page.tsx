import { updateCompanySettingsAction } from "@/actions/companies.actions";
/* eslint-disable @next/next/no-img-element */
import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";

export const dynamic = "force-dynamic";

type CompanyParametersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompanyGeneralParametersPage({
  searchParams,
}: CompanyParametersPageProps) {
  const profile = await requireCompanyAdmin();
  const flash = await getFlashMessage(searchParams);

  const companyName = profile.company_name ?? "";
  const companyRut = profile.company_rut ?? "";
  const companyLogoUrl = profile.company_logo_url ?? "";
  const popupBg = profile.company_popup_background_color ?? "#fffdf8";
  const popupText = profile.company_popup_text_color ?? "#2b3a44";
  const sidebarBg = profile.company_sidebar_bg_color ?? "#2b3a44";
  const sidebarText = profile.company_sidebar_text_color ?? "#ffffff";
  const sidebarActiveBg = profile.company_sidebar_active_bg_color ?? "#52d6a4";
  const sidebarActiveText = profile.company_sidebar_active_text_color ?? "#2b3a44";
  const platformBg = profile.company_platform_background_color ?? "#f6f3ed";

  return (
    <CompanyShell
      profile={profile}
      title="Parametros Generales"
      subtitle="Edita los datos de tu empresa y la personalizacion visual de la plataforma."
    >
      <section className="space-y-6">
        <FlashBanner flash={flash} />

        <form action={updateCompanySettingsAction} className="grid gap-6 xl:grid-cols-2">
          <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/70 p-5 md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Empresa
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Datos Principales
              </h2>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Nombre de la empresa</span>
              <input
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                defaultValue={companyName}
                name="name"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">RUT</span>
              <input
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                defaultValue={companyRut}
                name="rut"
                placeholder="76.123.456-7"
              />
            </label>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <label className="block">
                <span className="text-sm font-medium">Logo actual o URL</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={companyLogoUrl}
                  name="logo_url"
                  placeholder="https://..."
                  type="url"
                />
                <span className="mt-2 block text-xs text-muted">
                  Si no subes archivo, esta URL se conserva como logo. Si subes un archivo, tiene prioridad.
                </span>
              </label>

              <label className="rounded-2xl border border-line bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  Subir logo
                </p>
                <input
                  className="mt-3 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none ring-accent/25 transition file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:ring-4"
                  accept="image/*"
                  name="logo_file"
                  type="file"
                />
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-panel/60 p-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white">
                    {companyLogoUrl ? (
                      <img
                        alt={companyName || "Logo de empresa"}
                        className="h-full w-full object-contain p-2"
                        src={companyLogoUrl}
                      />
                    ) : (
                      <span className="text-xl font-semibold text-foreground">
                        {companyName
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((word) => word[0]?.toUpperCase() ?? "")
                          .join("") || "E"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-5 text-muted">
                    Formatos recomendados: PNG o SVG con fondo transparente.
                  </p>
                </div>
              </label>
            </div>

            <button className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong">
              Guardar empresa
            </button>
          </section>

          <section className="space-y-6">
            <div className="space-y-5 rounded-[1.75rem] border border-line bg-white/70 p-5 md:p-6">
              <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                  Plataforma
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Personalización Visual
                </h2>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Color de fondo del popup</span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-2 py-1 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={popupBg}
                  name="popup_background_color"
                  type="color"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Color del texto del popup</span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-2 py-1 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={popupText}
                  name="popup_text_color"
                  type="color"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Color de fondo del menu lateral</span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-2 py-1 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={sidebarBg}
                  name="sidebar_bg_color"
                  type="color"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Color del texto del menu lateral</span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-2 py-1 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={sidebarText}
                  name="sidebar_text_color"
                  type="color"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Color de fondo del menu seleccionado</span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-2 py-1 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={sidebarActiveBg}
                  name="sidebar_active_bg_color"
                  type="color"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Color del texto del menu seleccionado</span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-2 py-1 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={sidebarActiveText}
                  name="sidebar_active_text_color"
                  type="color"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Color de fondo de la plataforma</span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-2 py-1 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={platformBg}
                  name="platform_background_color"
                  type="color"
                />
              </label>

              <button className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong">
                Guardar personalización
              </button>
            </div>

            <article className="rounded-[1.75rem] border border-dashed border-line bg-white/50 p-5 md:p-6">
              <p className="text-sm font-medium text-muted">
                Los cambios de branding se aplican al panel de la empresa en cuanto se guarda el formulario.
              </p>
            </article>
          </section>
        </form>
      </section>
    </CompanyShell>
  );
}

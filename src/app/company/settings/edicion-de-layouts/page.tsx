import { updatePdfLayoutTemplateAction } from "@/actions/pdf-layouts.actions";
import { CompanyShell } from "@/components/layout/company-shell";
import { PdfLayoutTemplateEditor } from "@/components/pdf-layouts/pdf-layout-template-editor";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import { listPdfLayoutTemplates } from "@/services/pdf-layouts.service";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CompanyPdfLayoutsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function CompanyPdfLayoutsPage({
  searchParams,
}: CompanyPdfLayoutsPageProps) {
  const profile = await requireCompanyAdmin();
  const [layouts] = await Promise.all([listPdfLayoutTemplates()]);
  const flash = await getFlashMessage(searchParams);
  const params = await searchParams;
  const selectedLayoutKey = getSingleSearchParam(params.layout) ?? layouts[0]?.template_key ?? null;
  const selectedLayout =
    layouts.find((layout) => layout.template_key === selectedLayoutKey) ?? layouts[0] ?? null;

  return (
    <CompanyShell
      profile={profile}
      title="Edicion de Layouts"
      subtitle="Administra las plantillas PDF disponibles en la plataforma."
    >
      <section className="space-y-6">
        <FlashBanner flash={flash} />

        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-4 md:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#52D6A4]">
                Plantillas
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Layouts editables</h1>
              <p className="mt-2 text-sm text-slate-500">
                Selecciona un documento para ajustar su pagina, textos y elementos.
              </p>
            </div>

            <div className="mt-6 space-y-2">
              {layouts.map((layout) => {
                const isActive = layout.template_key === selectedLayout?.template_key;

                return (
                  <Link
                    key={layout.id}
                    className={[
                      "company-tab-link block rounded-2xl border px-4 py-3 transition",
                    ].join(" ")}
                    data-active={isActive ? "true" : "false"}
                    href={`/company/settings/edicion-de-layouts?layout=${layout.template_key}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{layout.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{layout.target_path}</p>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                          layout.is_active
                            ? "bg-[#52D6A4]/18 text-[#20513f]"
                            : "bg-stone-200 text-stone-700",
                        ].join(" ")}
                      >
                        {layout.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {layouts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                  No hay layouts registrados.
                </div>
              ) : null}
            </div>
          </aside>

          <div className="space-y-6">
            {selectedLayout ? (
              <PdfLayoutTemplateEditor
                key={selectedLayout.id}
                action={updatePdfLayoutTemplateAction}
                companyLogoUrl={profile.company_logo_url}
                template={selectedLayout}
              />
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center text-slate-500">
                No hay un layout seleccionado.
              </div>
            )}
          </div>
        </div>
      </section>
    </CompanyShell>
  );
}

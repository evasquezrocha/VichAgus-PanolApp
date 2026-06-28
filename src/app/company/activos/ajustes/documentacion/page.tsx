import {
  createAssetDocumentCategoryAction,
  deleteAssetDocumentCategoryAction,
  updateAssetDocumentCategoryAction,
} from "@/actions/activos.actions";
import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { PendingButton } from "@/components/ui/pending-button";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import { listAssetDocumentCategories } from "@/services/activos.service";
import Link from "next/link";

export const dynamic = "force-dynamic";

type ActivosDocumentacionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type DocumentCategory = Awaited<ReturnType<typeof listAssetDocumentCategories>>[number];

function getCategoryFormDefaults(category: DocumentCategory | null) {
  return {
    name: category?.name ?? "",
  };
}

export default async function ActivosDocumentacionPage({
  searchParams,
}: ActivosDocumentacionPageProps) {
  const profile = await requireCompanyAdmin();
  const [documentCategories] = await Promise.all([listAssetDocumentCategories()]);
  const flash = await getFlashMessage(searchParams);
  const params = await searchParams;
  const activeTab = getSingleSearchParam(params.tab) ?? "documentacion";
  const selectedCategoryId = getSingleSearchParam(params.category);
  const selectedCategory =
    documentCategories.find((category) => category.id === selectedCategoryId) ?? null;
  const categoryDefaults = getCategoryFormDefaults(selectedCategory);
  const categoryIndexById = new Map(
    documentCategories.map((category, index) => [category.id, index]),
  );

  return (
    <CompanyShell profile={profile} title="Activos" subtitle="Ajustes de documentación">
      <section className="space-y-6">
        <FlashBanner flash={flash} />

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/company/activos/ajustes/documentacion?tab=documentacion"
            className="company-tab-link rounded-full border border-line px-5 py-3 text-sm font-semibold transition"
            data-active={activeTab === "documentacion" ? "true" : "false"}
          >
            Documentación
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[28rem_minmax(0,1fr)]">
          <section className="rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Categorías
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {selectedCategory ? "Editar categoría" : "Nueva categoría"}
              </h1>
              <p className="mt-2 text-sm text-muted">
                Las categorías aparecen como sugerencias al cargar documentos de activos y se
                usan para organizar la vista pública por QR.
              </p>
            </div>

            <form
              action={selectedCategory ? updateAssetDocumentCategoryAction : createAssetDocumentCategoryAction}
              className="mt-6 space-y-4"
            >
              {selectedCategory ? (
                <input name="category_id" type="hidden" value={selectedCategory.id} />
              ) : null}
              <label className="block">
                <span className="text-sm font-medium">NOMBRE</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                  name="name"
                  placeholder="Inspección"
                  defaultValue={categoryDefaults.name}
                  required
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <PendingButton
                  className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
                  pendingLabel="Guardando..."
                  type="submit"
                >
                  Guardar categoría
                </PendingButton>
                {selectedCategory ? (
                  <Link
                    className="w-full rounded-full border border-line bg-white px-6 py-3 text-center font-semibold text-foreground transition hover:bg-panel"
                    href="/company/activos/ajustes/documentacion?tab=documentacion"
                  >
                    Cancelar edición
                  </Link>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                  Listado de categorías
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Categorías de documentos
                </h2>
              </div>
              <p className="text-sm text-muted">
                {documentCategories.length} categor{documentCategories.length === 1 ? "ía" : "ías"}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {documentCategories.map((category) => (
                <div key={category.id} className="rounded-2xl border border-line bg-white px-4 py-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{category.name}</p>
                      <p className="mt-2 text-sm text-muted">Usada como sugerencia en documentos.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-panel"
                          href={`/company/activos/ajustes/documentacion?tab=documentacion&category=${category.id}`}
                        >
                          Editar
                        </Link>
                        <form action={deleteAssetDocumentCategoryAction}>
                          <input name="category_id" type="hidden" value={category.id} />
                          <PendingButton
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            pendingLabel="Eliminando..."
                            type="submit"
                          >
                            Eliminar
                          </PendingButton>
                        </form>
                      </div>
                    </div>

                    <p className="text-sm text-muted">
                      #{(categoryIndexById.get(category.id) ?? 0) + 1}
                    </p>
                  </div>
                </div>
              ))}

              {documentCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-muted">
                  Aun no hay categorías creadas.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </CompanyShell>
  );
}

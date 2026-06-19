import {
  createToolCustomFieldAction,
  deleteToolCustomFieldAction,
  reorderToolCustomFieldAction,
  updateToolCustomFieldAction,
} from "@/actions/panol.actions";
import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { PendingButton } from "@/components/ui/pending-button";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import { listToolCustomFields } from "@/services/panol.service";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CompanyCustomFieldsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="rounded-full bg-accent-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
      {type}
    </span>
  );
}

type CustomField = Awaited<ReturnType<typeof listToolCustomFields>>[number];

function getFieldFormDefaults(field: CustomField | null) {
  return {
    codigo: field?.codigo ?? "",
    nombre: field?.nombre ?? "",
    field_type: field?.field_type ?? "text",
    sort_order: field?.sort_order ?? 0,
    options: field?.options.join("\n") ?? "",
    is_active: field?.is_active ?? true,
    is_required: field?.is_required ?? false,
  };
}

export default async function CompanyCustomFieldsPage({
  searchParams,
}: CompanyCustomFieldsPageProps) {
  const profile = await requireCompanyAdmin();
  const [customFields] = await Promise.all([listToolCustomFields()]);
  const flash = await getFlashMessage(searchParams);
  const params = await searchParams;
  const activeTab = getSingleSearchParam(params.tab) ?? "listado-de-herramientas";
  const selectedFieldId = getSingleSearchParam(params.field);
  const selectedField =
    customFields.find((field) => field.id === selectedFieldId) ?? null;
  const fieldDefaults = getFieldFormDefaults(selectedField);
  const fieldIndexById = new Map(
    customFields.map((field, index) => [field.id, index]),
  );

  return (
    <CompanyShell
      profile={profile}
      title="Campos personalizados"
      subtitle="Define columnas adicionales para el listado de herramientas."
    >
      <section className="space-y-6">
        <FlashBanner flash={flash} />

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/company/settings/campos-personalizados?tab=listado-de-herramientas"
            className={[
              "rounded-full px-5 py-3 text-sm font-semibold transition",
              activeTab === "listado-de-herramientas"
                ? "bg-[#2b3a44] text-white"
                : "border border-line bg-white text-foreground hover:bg-panel",
            ].join(" ")}
          >
            Listado de Herramientas
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[28rem_minmax(0,1fr)]">
          <section className="rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                {selectedField ? "Editar campo" : "Nuevo campo"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {selectedField
                  ? "Editar columna personalizada"
                  : "Agregar columna personalizada"}
              </h1>
              <p className="mt-2 text-sm text-muted">
                Estos campos apareceran como columnas extra en el listado de
                herramientas y como inputs en el popup de alta y edicion.
              </p>
            </div>

            <form
              action={
                selectedField
                  ? updateToolCustomFieldAction
                  : createToolCustomFieldAction
              }
              className="mt-6 space-y-4"
            >
              {selectedField ? (
                <input name="field_id" type="hidden" value={selectedField.id} />
              ) : null}
              <label className="block">
                <span className="text-sm font-medium">CODIGO</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 uppercase outline-none ring-accent/25 transition focus:ring-4"
                  name="codigo"
                  placeholder="COLOR"
                  defaultValue={fieldDefaults.codigo}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">DESCRIPCION</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                  name="nombre"
                  placeholder="Color de referencia"
                  defaultValue={fieldDefaults.nombre}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">TIPO DE CAMPO</span>
                <select
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                  name="field_type"
                  defaultValue={fieldDefaults.field_type}
                  required
                >
                  <option value="text">Texto</option>
                  <option value="number">Numero</option>
                  <option value="select">Seleccion</option>
                  <option value="date">Fecha</option>
                  <option value="boolean">Si / No</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">ORDEN</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                  defaultValue={fieldDefaults.sort_order}
                  min={0}
                  name="sort_order"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">OPCIONES</span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                  name="options"
                  placeholder="Una opcion por linea. Solo aplica para campos de seleccion."
                  defaultValue={fieldDefaults.options}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                  <input
                    className="h-4 w-4 accent-[#2b3a44]"
                    defaultChecked={fieldDefaults.is_active}
                    name="is_active"
                    type="checkbox"
                    value="true"
                  />
                  <span className="text-sm font-medium">Activo</span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                  <input
                    className="h-4 w-4 accent-[#2b3a44]"
                    defaultChecked={fieldDefaults.is_required}
                    name="is_required"
                    type="checkbox"
                    value="true"
                  />
                  <span className="text-sm font-medium">Requerido</span>
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <PendingButton
                  className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
                  pendingLabel={selectedField ? "Guardando..." : "Guardando..."}
                  type="submit"
                >
                  {selectedField ? "Guardar cambios" : "Guardar cambios"}
                </PendingButton>
                {selectedField ? (
                  <Link
                    className="w-full rounded-full border border-line bg-white px-6 py-3 text-center font-semibold text-foreground transition hover:bg-panel"
                    href="/company/settings/campos-personalizados?tab=listado-de-herramientas"
                  >
                    Cancelar edicion
                  </Link>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                  Listado de campos
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Campos activos e inactivos
                </h2>
              </div>
              <p className="text-sm text-muted">
                {customFields.length} campo{customFields.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="rounded-2xl border border-line bg-white px-4 py-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {field.codigo} - {field.nombre}
                        </p>
                        <TypeBadge type={field.field_type} />
                        <span
                          className={[
                            "rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                            field.is_active
                              ? "bg-[#52D6A4]/18 text-[#20513f]"
                              : "bg-stone-200 text-stone-700",
                          ].join(" ")}
                        >
                          {field.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        Orden: {field.sort_order}
                        {field.is_required ? " - Requerido" : ""}
                      </p>
                      {field.field_type === "select" ? (
                        <p className="mt-2 text-sm text-muted">
                          Opciones: {field.options.join(", ") || "Sin opciones"}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-panel"
                          href={`/company/settings/campos-personalizados?tab=listado-de-herramientas&field=${field.id}`}
                        >
                          Editar
                        </Link>
                        <form action={reorderToolCustomFieldAction}>
                          <input name="field_id" type="hidden" value={field.id} />
                          <input name="direction" type="hidden" value="up" />
                          <PendingButton
                            className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={(fieldIndexById.get(field.id) ?? 0) === 0}
                            pendingLabel="Subiendo..."
                            type="submit"
                          >
                            Subir
                          </PendingButton>
                        </form>
                        <form action={reorderToolCustomFieldAction}>
                          <input name="field_id" type="hidden" value={field.id} />
                          <input name="direction" type="hidden" value="down" />
                          <PendingButton
                            className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={
                              (fieldIndexById.get(field.id) ?? 0) ===
                              customFields.length - 1
                            }
                            pendingLabel="Bajando..."
                            type="submit"
                          >
                            Bajar
                          </PendingButton>
                        </form>
                      </div>
                    </div>

                    <form action={deleteToolCustomFieldAction}>
                      <input name="field_id" type="hidden" value={field.id} />
                      <PendingButton
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        pendingLabel="Eliminando..."
                        type="submit"
                      >
                        Eliminar
                      </PendingButton>
                    </form>
                  </div>
                </div>
              ))}

              {customFields.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-muted">
                  Aun no hay campos personalizados creados.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </CompanyShell>
  );
}

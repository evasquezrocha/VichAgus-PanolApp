import { createUbicacionAction, updateUbicacionAction } from "@/actions/ubicaciones.actions";
import { PendingButton } from "@/components/ui/pending-button";
import type { CompanyProfileListItem } from "@/types/profile";
import type { PanolLocation } from "@/types/ubicaciones";

type UbicacionesManagerProps = {
  users: CompanyProfileListItem[];
  locations: PanolLocation[];
};

function getUserLabel(user: CompanyProfileListItem | null | undefined) {
  if (!user) {
    return "Sin responsable";
  }

  return user.full_name?.trim() || user.email;
}

function getResponsibleOptions(users: CompanyProfileListItem[]) {
  return users.filter((user) => user.is_active);
}

export function UbicacionesManager({ users, locations }: UbicacionesManagerProps) {
  const userById = new Map(users.map((user) => [user.id, user]));
  const defaultLocation = locations.find((location) => location.is_default);

  return (
    <section className="space-y-6 rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          Pañol
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Ubicaciones</h1>
        <p className="mt-2 text-sm text-muted">
          Crea ubicaciones y asigna un responsable. Los equipos y herramientas usan como
          valor por defecto <span className="font-semibold">PAÑOL</span>.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4">
        <h2 className="text-lg font-semibold tracking-tight">Nueva ubicación</h2>
        <form action={createUbicacionAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              name="nombre"
              placeholder="Bodega Norte"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Responsable</span>
            <select
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              defaultValue=""
              name="responsible_user_id"
            >
              <option value="">Sin responsable</option>
              {getResponsibleOptions(users).map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserLabel(user)}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2 flex justify-end">
            <PendingButton
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
              pendingLabel="Creando..."
              type="submit"
            >
              Crear ubicación
            </PendingButton>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {locations.map((location) => {
          const responsibleUser = location.responsible_user_id
            ? userById.get(location.responsible_user_id)
            : null;

          return (
            <article key={location.id} className="rounded-2xl border border-line bg-white p-4">
              <form action={updateUbicacionAction} className="grid gap-4 md:grid-cols-2">
                <input name="ubicacion_id" type="hidden" value={location.id} />

                <label className="block">
                  <span className="text-sm font-medium">Nombre</span>
                  {location.is_default ? (
                    <>
                      <input name="nombre" type="hidden" value={location.nombre} />
                      <input
                        className="mt-2 w-full rounded-xl border border-line bg-panel px-4 py-3 outline-none"
                        defaultValue={location.nombre}
                        disabled
                      />
                    </>
                  ) : (
                    <input
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      defaultValue={location.nombre}
                      name="nombre"
                      required
                    />
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Responsable</span>
                  <select
                    className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                    defaultValue={location.responsible_user_id ?? ""}
                    name="responsible_user_id"
                  >
                    <option value="">Sin responsable</option>
                    {getResponsibleOptions(users).map((user) => (
                      <option key={user.id} value={user.id}>
                        {getUserLabel(user)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className="font-semibold text-foreground">{location.nombre}</span>
                    {location.is_default ? (
                      <span className="rounded-full bg-[#2b3a44]/10 px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                        PAÑOL
                      </span>
                    ) : null}
                    <span>
                      Responsable:{" "}
                      <span className="font-medium text-foreground">
                        {getUserLabel(responsibleUser)}
                      </span>
                    </span>
                  </div>

                  <PendingButton
                    className="rounded-full border border-line bg-panel px-5 py-2.5 font-semibold transition hover:bg-white"
                    pendingLabel="Guardando..."
                    type="submit"
                  >
                    Guardar
                  </PendingButton>
                </div>
              </form>
            </article>
          );
        })}

        {!defaultLocation && locations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-muted">
            No hay ubicaciones registradas.
          </div>
        ) : null}
      </div>
    </section>
  );
}

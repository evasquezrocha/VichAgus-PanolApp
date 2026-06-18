export const dynamic = "force-dynamic";

export default function GeneralParametersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Parámetros Generales
        </h1>
        <p className="mt-2 max-w-3xl text-muted">
          Ajustes base de la plataforma para definir comportamiento global,
          identidad visual y reglas operativas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-5 rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Identidad
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Datos de plataforma
            </h2>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Nombre visible</span>
            <input
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              defaultValue="PanolApp"
              name="platform_name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Zona horaria</span>
            <select
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              defaultValue="America/Santiago"
              name="timezone"
            >
              <option value="America/Santiago">America/Santiago</option>
              <option value="UTC">UTC</option>
              <option value="America/Bogota">America/Bogota</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Dominio principal</span>
            <input
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              defaultValue="app.panolapp.local"
              name="primary_domain"
            />
          </label>

          <button className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong">
            Guardar parámetros
          </button>
        </form>

        <div className="space-y-4">
          <article className="rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Operación
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Reglas generales
            </h2>
            <div className="mt-5 grid gap-4">
              <label className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                <input
                  className="mt-1 h-4 w-4 accent-[#2b3a44]"
                  defaultChecked
                  name="maintenance_mode"
                  type="checkbox"
                  value="true"
                />
                <span>
                  <span className="block font-medium">Modo mantenimiento</span>
                  <span className="mt-1 block text-sm text-muted">
                    Bloquea el acceso general y deja visible solo el panel de
                    administración.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                <input
                  className="mt-1 h-4 w-4 accent-[#2b3a44]"
                  defaultChecked
                  name="allow_company_signup"
                  type="checkbox"
                  value="true"
                />
                <span>
                  <span className="block font-medium">
                    Permitir creación de empresas
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    Habilita el alta manual de nuevos tenants desde el panel.
                  </span>
                </span>
              </label>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-dashed border-line bg-white/45 p-5 md:p-6">
            <p className="text-sm font-medium text-muted">
              Esta vista queda disponible desde el menú lateral derecho de
              Administración.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

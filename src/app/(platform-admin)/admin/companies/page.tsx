import { createCompanyAction } from "@/actions/companies.actions";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { listCompanies } from "@/services/companies.service";

export const dynamic = "force-dynamic";

type AdminCompaniesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCompaniesPage({
  searchParams,
}: AdminCompaniesPageProps) {
  const companies = await listCompanies();
  const flash = await getFlashMessage(searchParams);

  return (
    <>
      <section>
        <FlashBanner flash={flash} />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Empresas</h1>
            <p className="mt-2 max-w-2xl text-muted">
              Crea tenants. Cada empresa obtiene su propio company_id y las
              politicas RLS aislan sus datos.
            </p>
          </div>
        </div>

        <form
          action={createCompanyAction}
          className="mt-8 grid gap-4 rounded-2xl border border-line bg-white/55 p-5 md:grid-cols-[1fr_auto_auto]"
        >
          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              name="name"
              placeholder="Empresa Demo"
              required
            />
          </label>
          <label className="flex items-end gap-3 rounded-xl border border-line bg-white px-4 py-3">
            <input
              className="mb-1 h-4 w-4 accent-[#2b3a44]"
              name="is_active"
              type="checkbox"
              value="true"
              defaultChecked
            />
            <span className="text-sm font-medium">Activa</span>
          </label>
          <button className="self-end rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong">
            Crear empresa
          </button>
        </form>

        <div className="mt-8 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent text-white">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Activa</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-t border-line">
                  <td className="px-4 py-3">{company.name}</td>
                  <td className="px-4 py-3">
                    {company.is_active ? "Si" : "No"}
                  </td>
                </tr>
              ))}
              {companies.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted" colSpan={2}>
                    No hay empresas creadas todavia.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

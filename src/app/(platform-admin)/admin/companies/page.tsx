import { createCompanyAction } from "@/actions/companies.actions";
import { CompanyAdminCard } from "@/components/admin/company-admin-card";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import {
  getCompanyPublicUrl,
  getCompanyResolutionLabel,
} from "@/lib/tenant";
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
  const activeCompanies = companies.filter((company) => company.is_active);
  const hasCustomDomains = companies.some((company) => company.custom_domain);

  return (
    <section>
      <FlashBanner flash={flash} />

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Empresas</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Crea tenants. Cada empresa obtiene su propio company_id, slug
            canonico y dominio opcional. Las politicas RLS aislan sus datos.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white/60 p-4">
          <p className="text-sm font-medium text-muted">Empresas activas</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {activeCompanies.length}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white/60 p-4">
          <p className="text-sm font-medium text-muted">Empresas totales</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {companies.length}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white/60 p-4">
          <p className="text-sm font-medium text-muted">Resolucion</p>
          <p className="mt-3 text-base font-semibold tracking-tight">
            {hasCustomDomains
              ? "Mixta: subdominio y dominios propios"
              : "Solo subdominios por ahora"}
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

      <div className="mt-8">
        {companies.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {companies.map((company) => (
              <CompanyAdminCard
                key={company.id}
                company={company}
                publicUrl={getCompanyPublicUrl(company)}
                resolutionLabel={getCompanyResolutionLabel(company)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-white/60 p-6 text-sm text-muted">
            No hay empresas creadas todavia.
          </div>
        )}
      </div>
    </section>
  );
}

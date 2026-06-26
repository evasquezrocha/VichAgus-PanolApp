import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { ActivosManager } from "@/components/activos/activos-manager";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import { listAssetCatalogOptions, listAssets } from "@/services/activos.service";

export const dynamic = "force-dynamic";

type ActivosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ActivosPage({ searchParams }: ActivosPageProps) {
  const profile = await requireCompanyAdmin();
  const [assets, catalogOptions] = await Promise.all([
    listAssets(),
    listAssetCatalogOptions(),
  ]);
  const flash = await getFlashMessage(searchParams);

  return (
    <CompanyShell
      profile={profile}
      title="Activos"
      subtitle="Listado, búsqueda y alta de activos con catálogos reutilizables."
    >
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <ActivosManager assets={assets} catalogOptions={catalogOptions} />
      </section>
    </CompanyShell>
  );
}


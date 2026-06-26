import { ActivoFichaContent } from "@/components/activos/activo-ficha-content";
import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import { getAssetById } from "@/services/activos.service";
import { notFound } from "next/navigation";

type AssetDetailPageProps = {
  params: Promise<{ assetId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AssetDetailPage({
  params,
  searchParams,
}: AssetDetailPageProps) {
  const profile = await requireCompanyAdmin();
  const { assetId } = await params;
  const flash = await getFlashMessage(searchParams);
  const asset = await getAssetById(assetId);

  if (!asset) {
    notFound();
  }

  return (
    <CompanyShell
      profile={profile}
      title="Activos"
      subtitle="Ficha detallada del activo seleccionado."
    >
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <ActivoFichaContent asset={asset} backHref="/company/activos/listado-de-activos" />
      </section>
    </CompanyShell>
  );
}

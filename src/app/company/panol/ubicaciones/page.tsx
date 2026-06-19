import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { UbicacionesManager } from "@/components/panol/ubicaciones-manager";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import { listCompanyProfiles } from "@/services/profiles.service";
import { listPanolLocations } from "@/services/ubicaciones.service";

export const dynamic = "force-dynamic";

type UbicacionesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UbicacionesPage({ searchParams }: UbicacionesPageProps) {
  const profile = await requireCompanyAdmin();
  const [users, locations] = await Promise.all([listCompanyProfiles(), listPanolLocations()]);
  const flash = await getFlashMessage(searchParams);

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <UbicacionesManager users={users} locations={locations} />
      </section>
    </CompanyShell>
  );
}

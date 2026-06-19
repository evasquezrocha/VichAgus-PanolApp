import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import {
  getEquipmentDetail,
  listEquipmentCustomFieldValues,
  listEquipmentCustomFields,
  listEquipmentGroups,
  listEquipments,
} from "@/services/equipos.service";
import {
  listPanolLocations,
} from "@/services/ubicaciones.service";
import { EquipmentsManager } from "@/components/panol/equipos-manager";

export const dynamic = "force-dynamic";

type EquiposPageProps = {
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

function getActiveTab(value: string | string[] | undefined) {
  const tab = getSingleSearchParam(value);

  if (tab === "grupos" || tab === "ficha-equipo") {
    return tab;
  }

  return "equipos";
}

export default async function EquiposPage({
  searchParams,
}: EquiposPageProps) {
  const profile = await requireCompanyAdmin();
  const [groups, equipments, customFields, customFieldValues, locations] = await Promise.all([
    listEquipmentGroups(),
    listEquipments(),
    listEquipmentCustomFields(),
    listEquipmentCustomFieldValues(),
    listPanolLocations(),
  ]);
  const params = await searchParams;
  const flash = await getFlashMessage(searchParams);
  const activeTab = getActiveTab(params.tab);
  const selectedEquipmentId = getSingleSearchParam(params.equipmentId);
  const selectedEquipmentDetail =
    activeTab === "ficha-equipo" && selectedEquipmentId
      ? await getEquipmentDetail(selectedEquipmentId)
      : null;
  const defaultLocationId =
    locations.find((location) => location.is_default)?.id ?? locations[0]?.id ?? "";

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <EquipmentsManager
          activeTab={activeTab}
          customFieldValues={customFieldValues}
          customFields={customFields}
          groups={groups}
          selectedEquipmentDetail={selectedEquipmentDetail}
          selectedEquipmentId={selectedEquipmentId}
          equipments={equipments}
          locations={locations}
          defaultLocationId={defaultLocationId}
        />
      </section>
    </CompanyShell>
  );
}


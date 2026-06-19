import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import {
  listToolCustomFieldValues,
  listToolCustomFields,
  listToolGroups,
  listTools,
} from "@/services/panol.service";
import {
  listPanolLocations,
} from "@/services/ubicaciones.service";
import { ToolsManager } from "@/components/panol/tools-manager";

export const dynamic = "force-dynamic";

type HerramientasPageProps = {
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
  return getSingleSearchParam(value) === "grupos" ? "grupos" : "herramientas";
}

export default async function HerramientasPage({
  searchParams,
}: HerramientasPageProps) {
  const profile = await requireCompanyAdmin();
  const [groups, tools, customFields, customFieldValues, locations] = await Promise.all([
    listToolGroups(),
    listTools(),
    listToolCustomFields(),
    listToolCustomFieldValues(),
    listPanolLocations(),
  ]);
  const params = await searchParams;
  const flash = await getFlashMessage(searchParams);
  const activeTab = getActiveTab(params.tab);
  const defaultLocationId =
    locations.find((location) => location.is_default)?.id ?? locations[0]?.id ?? "";

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <ToolsManager
          activeTab={activeTab}
          customFieldValues={customFieldValues}
          customFields={customFields}
          groups={groups}
          tools={tools}
          locations={locations}
          defaultLocationId={defaultLocationId}
        />
      </section>
    </CompanyShell>
  );
}

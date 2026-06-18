import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import { listToolGroups, listTools } from "@/services/panol.service";
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
  const [groups, tools] = await Promise.all([listToolGroups(), listTools()]);
  const params = await searchParams;
  const flash = await getFlashMessage(searchParams);
  const activeTab = getActiveTab(params.tab);

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <ToolsManager
          activeTab={activeTab}
          groups={groups}
          tools={tools}
        />
      </section>
    </CompanyShell>
  );
}

import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { TraspasosManager } from "@/components/panol/traspasos-manager";
import { getFlashMessage } from "@/lib/flash";
import { requireCurrentProfile } from "@/server/auth/guards";
import { listEmployees } from "@/services/empleados.service";
import { listPanolLocations } from "@/services/ubicaciones.service";
import {
  listEmployeeTransfers,
  listTransferEquipments,
  listTransferTools,
} from "@/services/traspasos.service";
import { getDefaultDashboardPath } from "@/lib/site";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type TraspasosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getActiveTab(value: string | string[] | undefined) {
  return getSingleSearchParam(value) === "historial" ? "historial" : "nuevo";
}

function getSearchQuery(value: string | string[] | undefined) {
  return getSingleSearchParam(value) ?? "";
}

function getLocalDateDefaults() {
  const timeZone = "America/Santiago";
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  return { date, time };
}

export default async function TraspasosPage({ searchParams }: TraspasosPageProps) {
  const profile = await requireCurrentProfile();

  if (!profile.company_id) {
    redirect(getDefaultDashboardPath());
  }

  const canTransferAnyLocation =
    profile.permissions.includes("platform.manage") ||
    profile.permissions.includes("company.users.manage");
  const [employees, locations, equipments, tools, transfers] = await Promise.all([
    listEmployees(),
    listPanolLocations(),
    listTransferEquipments(),
    listTransferTools(),
    listEmployeeTransfers(),
  ]);
  const flash = await getFlashMessage(searchParams);
  const params = await searchParams;
  const activeTab = getActiveTab(params.tab);
  const searchQuery = getSearchQuery(params.q);
  const { date, time } = getLocalDateDefaults();
  const transferLocations = canTransferAnyLocation
    ? locations
    : locations.filter((location) => location.responsible_user_id === profile.id);

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <TraspasosManager
          activeTab={activeTab}
          defaultDate={date}
          defaultTime={time}
          employees={employees}
          locations={locations}
          transferLocations={transferLocations}
          equipments={equipments}
          tools={tools}
          transfers={transfers}
          searchQuery={searchQuery}
        />
      </section>
    </CompanyShell>
  );
}

import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import {
  getEmployeeDetail,
  listEmployeeCompanies,
  listEmployees,
} from "@/services/empleados.service";
import { EmployeesManager } from "@/components/panol/empleados-manager";

export const dynamic = "force-dynamic";

type EmpleadosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getActiveTab(value: string | string[] | undefined) {
  const tab = getSingleSearchParam(value);

  if (tab === "ficha-empleado") {
    return tab;
  }

  return "empleados";
}

export default async function EmpleadosPage({ searchParams }: EmpleadosPageProps) {
  const profile = await requireCompanyAdmin();
  const params = await searchParams;
  const [employeeCompanies, employees] = await Promise.all([
    listEmployeeCompanies(),
    listEmployees(),
  ]);
  const flash = await getFlashMessage(searchParams);
  const activeTab = getActiveTab(params.tab);
  const selectedEmployeeId = getSingleSearchParam(params.employeeId);
  const selectedEmployeeDetail =
    activeTab === "ficha-empleado" && selectedEmployeeId
      ? await getEmployeeDetail(selectedEmployeeId)
      : null;

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <EmployeesManager
          activeTab={activeTab}
          employeeCompanies={employeeCompanies}
          employees={employees}
          selectedEmployeeDetail={selectedEmployeeDetail}
          selectedEmployeeId={selectedEmployeeId}
        />
      </section>
    </CompanyShell>
  );
}

import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCompanyAdmin } from "@/server/auth/guards";
import {
  listEmployeeCompanies,
  listEmployees,
} from "@/services/empleados.service";
import { EmployeesManager } from "@/components/panol/empleados-manager";

export const dynamic = "force-dynamic";

type EmpleadosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmpleadosPage({ searchParams }: EmpleadosPageProps) {
  const profile = await requireCompanyAdmin();
  const [employeeCompanies, employees] = await Promise.all([
    listEmployeeCompanies(),
    listEmployees(),
  ]);
  const flash = await getFlashMessage(searchParams);

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />
        <EmployeesManager employeeCompanies={employeeCompanies} employees={employees} />
      </section>
    </CompanyShell>
  );
}

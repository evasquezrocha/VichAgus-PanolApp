import { CompanyShell } from "@/components/layout/company-shell";
import { FlashBanner } from "@/components/ui/flash-banner";
import { getFlashMessage } from "@/lib/flash";
import { requireCurrentProfile } from "@/server/auth/guards";
import { listEmployees } from "@/services/empleados.service";
import { listPanolLocations } from "@/services/ubicaciones.service";
import { getEmployeeTransfer } from "@/services/traspasos.service";
import type { Employee } from "@/types/empleados";
import type { PanolLocation } from "@/types/ubicaciones";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

type TransferDetailPageProps = {
  params: Promise<{ transferId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getEmployeeLabel(employee: Employee | null | undefined) {
  if (!employee) {
    return "Sin asignar";
  }

  return `${employee.nombres} ${employee.apellidos ?? ""}`.trim() || employee.rut || "Empleado";
}

function getLocationLabel(location: PanolLocation | null | undefined) {
  if (!location) {
    return "Sin ubicacion";
  }

  return location.is_default ? "PAÑOL" : location.nombre;
}

function getUserLabel(user: { full_name: string | null; email: string } | null | undefined) {
  if (!user) {
    return "Sin usuario";
  }

  return user.full_name?.trim() || user.email;
}

function getEndpointLabel(
  transfer: NonNullable<Awaited<ReturnType<typeof getEmployeeTransfer>>>,
  side: "origin" | "destination",
  employeesById: Map<string, Employee>,
  locationsById: Map<string, PanolLocation>,
) {
  const type = side === "origin" ? transfer.origin_type : transfer.destination_type;
  const employeeId = side === "origin" ? transfer.origin_employee_id : transfer.destination_employee_id;
  const locationId = side === "origin" ? transfer.origin_location_id : transfer.destination_location_id;

  if (type === "employee") {
    return `Empleado: ${getEmployeeLabel(employeeId ? employeesById.get(employeeId) : null)}`;
  }

  return `Ubicación: ${getLocationLabel(locationId ? locationsById.get(locationId) : null)}`;
}

export default async function TransferDetailPage({
  params,
  searchParams,
}: TransferDetailPageProps) {
  const profile = await requireCurrentProfile();
  const { transferId } = await params;
  const flash = await getFlashMessage(searchParams);
  const [employees, locations, transfer] = await Promise.all([
    listEmployees(),
    listPanolLocations(),
    getEmployeeTransfer(transferId),
  ]);

  if (!transfer) {
    notFound();
  }

  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const equipmentItems = transfer.items.filter((item) => item.item_type === "equipment");
  const toolItems = transfer.items.filter((item) => item.item_type === "tool");

  return (
    <CompanyShell profile={profile}>
      <section className="space-y-6">
        <FlashBanner flash={flash} />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Traspasos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Detalle de traspaso</h1>
          </div>

          <Link
            href="/company/panol/traspasos?tab=historial"
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
          >
            Volver al historial
          </Link>
        </div>

        <section className="space-y-6 rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Origen</p>
              <p className="mt-2 font-semibold text-foreground">
                {getEndpointLabel(transfer, "origin", employeeById, locationById)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Destino</p>
              <p className="mt-2 font-semibold text-foreground">
                {getEndpointLabel(transfer, "destination", employeeById, locationById)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Fecha</p>
              <p className="mt-2 font-semibold text-foreground">
                {transfer.transfer_date} {transfer.transfer_time}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Registrado por</p>
              <p className="mt-2 font-semibold text-foreground">
                {getUserLabel(transfer.created_by_user)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-4">
                <h2 className="text-lg font-semibold tracking-tight">Items del traspaso</h2>
                <div className="mt-4 space-y-3">
                  {transfer.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-line/80 bg-panel/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.item_type === "equipment"
                              ? item.equipment?.codigo ?? "Equipo"
                              : item.tool?.codigo ?? "Herramienta"}
                          </p>
                          <p className="text-sm text-muted">
                            {item.item_type === "equipment"
                              ? item.equipment?.descripcion ?? "Sin descripción"
                              : item.tool?.descripcion ?? "Sin descripción"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#2b3a44]/10 px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                          x{item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-4">
                <h2 className="text-lg font-semibold tracking-tight">Resumen</h2>
                <div className="mt-4 grid gap-2 text-sm text-muted">
                  <div className="flex items-center justify-between">
                    <span>Equipos</span>
                    <span className="font-semibold text-foreground">{equipmentItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Herramientas</span>
                    <span className="font-semibold text-foreground">
                      {toolItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Firmado por</span>
                    <span className="font-semibold text-foreground">
                      {getUserLabel(transfer.signed_by_user)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-4">
                <h2 className="text-lg font-semibold tracking-tight">Firma</h2>
                <p className="mt-1 text-sm text-muted">
                  Firma capturada al registrar el traspaso.
                </p>

                <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-panel/30 p-3">
                  {transfer.signature_data ? (
                    <Image
                      alt="Firma del traspaso"
                      className="h-auto w-full rounded-xl bg-white"
                      height={400}
                      src={transfer.signature_data}
                      unoptimized
                      width={1200}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-line bg-white text-sm text-muted">
                      Sin firma registrada.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-4">
                <h2 className="text-lg font-semibold tracking-tight">Metadatos</h2>
                <div className="mt-4 grid gap-2 text-sm text-muted">
                  <div className="flex items-center justify-between gap-3">
                    <span className="shrink-0">ID</span>
                    <span className="font-mono text-xs text-foreground">{transfer.id}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="shrink-0">Creado por</span>
                    <span className="font-semibold text-foreground">
                      {getUserLabel(transfer.created_by_user)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="shrink-0">Firmado por</span>
                    <span className="font-semibold text-foreground">
                      {getUserLabel(transfer.signed_by_user)}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </section>
    </CompanyShell>
  );
}

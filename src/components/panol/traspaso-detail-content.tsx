import type { Employee } from "@/types/empleados";
import type { EmployeeTransfer } from "@/types/traspasos";
import type { PanolLocation } from "@/types/ubicaciones";
import Image from "next/image";

type TransferDetailContentProps = {
  transfer: EmployeeTransfer;
  employees: Employee[];
  locations: PanolLocation[];
  showHeader?: boolean;
  variant?: "screen" | "pdf";
};

function getEmployeeLabel(employee: Employee | null | undefined) {
  if (!employee) {
    return "Sin asignar";
  }

  return `${employee.nombres} ${employee.apellidos ?? ""}`.trim() || employee.rut || "Empleado";
}

function getLocationLabel(location: PanolLocation | null | undefined) {
  if (!location) {
    return "Sin ubicación";
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
  transfer: EmployeeTransfer,
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

function DetailField({
  label,
  value,
  variant = "screen",
}: {
  label: string;
  value: string;
  variant?: "screen" | "pdf";
}) {
  if (variant === "pdf") {
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4 print:rounded-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function TransferDetailContent({
  transfer,
  employees,
  locations,
  showHeader = true,
  variant = "screen",
}: TransferDetailContentProps) {
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const equipmentItems = transfer.items.filter((item) => item.item_type === "equipment");
  const toolItems = transfer.items.filter((item) => item.item_type === "tool");
  const transferItemsCount = transfer.items.length;

  if (variant === "pdf") {
    return (
      <section className="space-y-5 text-[13px] leading-5 text-foreground print:space-y-4">
        {showHeader ? (
          <header className="border-b border-line pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              Vista imprimible
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Traspaso</h1>
            <p className="mt-1 text-sm text-muted">Formato compacto para guardar o imprimir.</p>
          </header>
        ) : null}

        <section className="rounded-2xl border border-line bg-white p-4 print:rounded-none print:border-0 print:p-0">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField
              label="Origen"
              value={getEndpointLabel(transfer, "origin", employeeById, locationById)}
              variant="pdf"
            />
            <DetailField
              label="Destino"
              value={getEndpointLabel(transfer, "destination", employeeById, locationById)}
              variant="pdf"
            />
            <DetailField
              label="Fecha"
              value={`${transfer.transfer_date} ${transfer.transfer_time}`}
              variant="pdf"
            />
            <DetailField
              label="Registrado por"
              value={getUserLabel(transfer.created_by_user)}
              variant="pdf"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 print:rounded-none print:border-0 print:p-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              Resumen
            </h2>
            <p className="text-xs text-muted">{transferItemsCount} item{transferItemsCount === 1 ? "" : "s"}</p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-line/80 bg-panel/20 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                Equipos
              </p>
              <p className="mt-1 text-lg font-semibold">{equipmentItems.length}</p>
            </div>
            <div className="rounded-xl border border-line/80 bg-panel/20 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                Herramientas
              </p>
              <p className="mt-1 text-lg font-semibold">
                {toolItems.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
            <div className="rounded-xl border border-line/80 bg-panel/20 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                Firmado por
              </p>
              <p className="mt-1 text-sm font-medium">{getUserLabel(transfer.signed_by_user)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 print:rounded-none print:border-0 print:p-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              Detalle de ítems
            </h2>
          </div>

          <div className="mt-3 divide-y divide-line border-y border-line">
            {transfer.items.map((item) => (
              <div key={item.id} className="grid gap-2 py-3 md:grid-cols-[1fr_auto] md:items-start">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
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
                <div className="md:text-right">
                  <span className="inline-flex rounded-full border border-line px-3 py-1 text-xs font-semibold">
                    x{item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-line bg-white p-4 print:rounded-none print:border-0 print:p-0">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Firma</h2>
            <div className="mt-3 rounded-xl border border-line bg-panel/10 p-3">
              {transfer.signature_data ? (
                <Image
                  alt="Firma del traspaso"
                  className="h-auto w-full bg-white object-contain"
                  height={320}
                  src={transfer.signature_data}
                  unoptimized
                  width={1000}
                />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted">
                  Sin firma registrada.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4 print:rounded-none print:border-0 print:p-0">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Metadatos</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-line/70 py-2">
                <span className="text-muted">ID</span>
                <span className="font-mono text-xs text-foreground">{transfer.id}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line/70 py-2">
                <span className="text-muted">Creado por</span>
                <span className="font-medium text-foreground">{getUserLabel(transfer.created_by_user)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <span className="text-muted">Firmado por</span>
                <span className="font-medium text-foreground">{getUserLabel(transfer.signed_by_user)}</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {showHeader ? (
        <div className="flex items-center justify-between gap-4 print:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Traspasos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Detalle de traspaso</h1>
          </div>
        </div>
      ) : null}

      <section className="space-y-6 rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6 print:rounded-none print:border-0 print:bg-transparent print:p-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-2">
          <DetailField
            label="Origen"
            value={getEndpointLabel(transfer, "origin", employeeById, locationById)}
          />
          <DetailField
            label="Destino"
            value={getEndpointLabel(transfer, "destination", employeeById, locationById)}
          />
          <DetailField label="Fecha" value={`${transfer.transfer_date} ${transfer.transfer_time}`} />
          <DetailField label="Registrado por" value={getUserLabel(transfer.created_by_user)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] print:grid-cols-1">
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-4 print:rounded-xl">
              <h2 className="text-lg font-semibold tracking-tight">Items del traspaso</h2>
              <div className="mt-4 space-y-3">
                {transfer.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line/80 bg-panel/40 p-4">
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

            <div className="rounded-2xl border border-line bg-white p-4 print:rounded-xl">
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
            <div className="rounded-2xl border border-line bg-white p-4 print:rounded-xl">
              <h2 className="text-lg font-semibold tracking-tight">Firma</h2>
              <p className="mt-1 text-sm text-muted">Firma capturada al registrar el traspaso.</p>

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

            <div className="rounded-2xl border border-line bg-white p-4 print:rounded-xl">
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
  );
}

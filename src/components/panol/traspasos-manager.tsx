import { TraspasosTransferBuilder } from "@/components/panol/traspasos-transfer-builder";
import type { Employee } from "@/types/empleados";
import type { EmployeeTransfer, TransferEquipmentRow, TransferToolRow } from "@/types/traspasos";
import type { PanolLocation } from "@/types/ubicaciones";
import Link from "next/link";
import type { ReactNode } from "react";

type TraspasosManagerProps = {
  activeTab: "nuevo" | "historial";
  employees: Employee[];
  locations: PanolLocation[];
  transferLocations: PanolLocation[];
  equipments: TransferEquipmentRow[];
  tools: TransferToolRow[];
  transfers: EmployeeTransfer[];
  searchQuery: string;
  defaultDate: string;
  defaultTime: string;
};

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-5 py-3 text-sm font-semibold transition",
        active
          ? "bg-[#2b3a44] text-white"
          : "border border-line bg-white text-foreground hover:bg-panel",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

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

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getTransferEndpointLabel(
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

function getTransferSearchBlob(
  transfer: EmployeeTransfer,
  employeesById: Map<string, Employee>,
  locationsById: Map<string, PanolLocation>,
) {
  const originLabel = getTransferEndpointLabel(transfer, "origin", employeesById, locationsById);
  const destinationLabel = getTransferEndpointLabel(
    transfer,
    "destination",
    employeesById,
    locationsById,
  );
  const itemLabels = transfer.items
    .map((item) =>
      item.item_type === "equipment"
        ? `${item.equipment?.codigo ?? ""} ${item.equipment?.descripcion ?? ""}`
        : `${item.tool?.codigo ?? ""} ${item.tool?.descripcion ?? ""} ${item.quantity}`,
    )
    .join(" ");

  return stripAccents(
    [
      transfer.transfer_date,
      transfer.transfer_time,
      originLabel,
      destinationLabel,
      getUserLabel(transfer.created_by_user),
      getUserLabel(transfer.signed_by_user),
      itemLabels,
      transfer.id,
    ]
      .join(" ")
      .toLowerCase(),
  );
}

export function TraspasosManager({
  activeTab,
  employees,
  locations,
  transferLocations,
  equipments,
  tools,
  transfers,
  searchQuery,
  defaultDate,
  defaultTime,
}: TraspasosManagerProps) {
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const normalizedSearch = stripAccents(searchQuery.trim().toLowerCase());
  const filteredTransfers = normalizedSearch
    ? transfers.filter((transfer) =>
        getTransferSearchBlob(transfer, employeeById, locationById).includes(normalizedSearch),
      )
    : transfers;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <TabLink href="/company/panol/traspasos?tab=nuevo" active={activeTab === "nuevo"}>
          Nuevo Traspaso
        </TabLink>
        <TabLink
          href="/company/panol/traspasos?tab=historial"
          active={activeTab === "historial"}
        >
          Historial Traspasos
        </TabLink>
      </div>

      {activeTab === "nuevo" ? (
        <TraspasosTransferBuilder
          defaultDate={defaultDate}
          defaultTime={defaultTime}
          employees={employees}
          equipments={equipments}
          locations={locations}
          transferLocations={transferLocations}
          tools={tools}
        />
      ) : null}

      {activeTab === "historial" ? (
        <section className="space-y-6 rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Traspasos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Historial de traspasos
            </h1>
            <p className="mt-2 text-sm text-muted">
              Revisa los movimientos realizados entre empleados y ubicaciones.
            </p>
          </div>

          <form className="rounded-2xl border border-line bg-white p-4" method="get">
            <input name="tab" type="hidden" value="historial" />
            <label className="block">
              <span className="text-sm font-medium">Buscar traspaso</span>
              <input
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                defaultValue={searchQuery}
                name="q"
                placeholder="Busca por empleado, ubicación, código, fecha o usuario"
              />
            </label>
          </form>

          <div className="space-y-3">
            {filteredTransfers.map((transfer) => {
              const equipmentItems = transfer.items.filter((item) => item.item_type === "equipment");
              const toolItems = transfer.items.filter((item) => item.item_type === "tool");
              const toolQuantity = toolItems.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <Link
                  key={transfer.id}
                  href={`/company/panol/traspasos/${transfer.id}`}
                  className="block rounded-2xl border border-line bg-white px-4 py-4 transition hover:border-accent/40 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        {getTransferEndpointLabel(transfer, "origin", employeeById, locationById)}
                        {" -> "}
                        {getTransferEndpointLabel(transfer, "destination", employeeById, locationById)}
                      </p>
                      <p className="text-sm text-muted">
                        {transfer.transfer_date} {transfer.transfer_time}
                      </p>
                      <p className="text-sm text-muted">
                        {equipmentItems.length} equipo{equipmentItems.length === 1 ? "" : "s"} y{" "}
                        {toolQuantity} herramienta{toolQuantity === 1 ? "" : "s"}
                      </p>
                      <p className="text-sm text-muted">
                        Registrado por{" "}
                        <span className="font-medium text-foreground">
                          {getUserLabel(transfer.created_by_user)}
                        </span>
                      </p>
                      <p className="text-sm text-muted">
                        Firma:{" "}
                        <span className="font-medium text-foreground">
                          {transfer.signature_data ? "Capturada" : "Sin firma"}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {transfer.items.map((item) => {
                        if (item.item_type === "equipment") {
                          return (
                            <span
                              key={item.id}
                              className="rounded-full bg-[#2b3a44]/10 px-3 py-1 text-xs font-semibold text-[#2b3a44]"
                            >
                              {item.equipment?.codigo ?? "Equipo"} x1
                            </span>
                          );
                        }

                        return (
                          <span
                            key={item.id}
                            className="rounded-full bg-[#2b3a44]/10 px-3 py-1 text-xs font-semibold text-[#2b3a44]"
                          >
                            {item.tool?.codigo ?? "Herramienta"} x{item.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}

            {filteredTransfers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center text-muted">
                {searchQuery.trim()
                  ? "No hay traspasos que coincidan con la búsqueda."
                  : "Aún no hay traspasos registrados."}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

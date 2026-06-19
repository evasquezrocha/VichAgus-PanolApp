"use client";

import { createEmployeeTransferAction } from "@/actions/traspasos.actions";
import { PendingButton } from "@/components/ui/pending-button";
import { SignaturePad } from "@/components/ui/signature-pad";
import type { Employee } from "@/types/empleados";
import type { TransferEquipmentRow, TransferToolRow } from "@/types/traspasos";
import type { PanolLocation } from "@/types/ubicaciones";
import { useMemo, useState } from "react";

type TransferBuilderProps = {
  employees: Employee[];
  locations: PanolLocation[];
  transferLocations: PanolLocation[];
  equipments: TransferEquipmentRow[];
  tools: TransferToolRow[];
  defaultDate: string;
  defaultTime: string;
};

type TransferEndpoint = {
  type: "employee" | "location";
  id: string;
};

function formatEmployeeLabel(employee: Employee | null | undefined) {
  if (!employee) {
    return "Sin asignar";
  }

  return `${employee.nombres} ${employee.apellidos ?? ""}`.trim() || employee.rut || "Empleado";
}

function formatLocationLabel(location: PanolLocation | null | undefined) {
  if (!location) {
    return "Sin ubicacion";
  }

  return location.is_default ? "PAÑOL" : location.nombre;
}

function formatEndpointLabel(
  endpoint: TransferEndpoint,
  employeesById: Map<string, Employee>,
  locationsById: Map<string, PanolLocation>,
) {
  if (endpoint.type === "employee") {
    return `Empleado: ${formatEmployeeLabel(employeesById.get(endpoint.id))}`;
  }

  return `Ubicación: ${formatLocationLabel(locationsById.get(endpoint.id))}`;
}

function endpointToValue(endpoint: TransferEndpoint) {
  return `${endpoint.type}:${endpoint.id}`;
}

function parseEndpointValue(value: string): TransferEndpoint | null {
  const [type, ...rest] = value.split(":");
  const id = rest.join(":").trim();

  if ((type === "employee" || type === "location") && id) {
    return { type, id };
  }

  return null;
}

function buildEndpointOptions(
  employees: Employee[],
  locations: PanolLocation[],
): Array<{ type: TransferEndpoint["type"]; id: string; label: string }> {
  return [
    ...employees.map((employee) => ({
      type: "employee" as const,
      id: employee.id,
      label: formatEmployeeLabel(employee),
    })),
    ...locations.map((location) => ({
      type: "location" as const,
      id: location.id,
      label: formatLocationLabel(location),
    })),
  ];
}

function getInitialValue(
  employees: Employee[],
  locations: PanolLocation[],
  offset = 0,
) {
  const options = buildEndpointOptions(employees, locations);
  return options[offset] ? endpointToValue(options[offset]) : "";
}

function getNextDifferentEndpointValue(
  currentValue: string,
  employees: Employee[],
  locations: PanolLocation[],
) {
  const options = buildEndpointOptions(employees, locations);
  const alternative = options.find((option) => endpointToValue(option) !== currentValue);
  return alternative ? endpointToValue(alternative) : currentValue;
}

function matchesSearch(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

export function TraspasosTransferBuilder({
  employees,
  locations,
  transferLocations,
  equipments,
  tools,
  defaultDate,
  defaultTime,
}: TransferBuilderProps) {
  const employeesById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );
  const locationsById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations],
  );
  const equipmentById = useMemo(
    () => new Map(equipments.map((equipment) => [equipment.id, equipment])),
    [equipments],
  );
  const toolById = useMemo(
    () => new Map(tools.map((tool) => [tool.id, tool])),
    [tools],
  );

  const canCreateTransfers = transferLocations.length > 0;

  const [originValue, setOriginValue] = useState(() =>
    getInitialValue(employees, transferLocations),
  );
  const [destinationValue, setDestinationValue] = useState(() =>
    getInitialValue(employees, transferLocations, 1) || getInitialValue(employees, transferLocations),
  );
  const [search, setSearch] = useState("");
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [selectedToolQuantities, setSelectedToolQuantities] = useState<Record<string, number>>({});
  const [toolDraftQuantities, setToolDraftQuantities] = useState<Record<string, string>>({});

  const origin = useMemo(() => parseEndpointValue(originValue), [originValue]);
  const destination = useMemo(() => parseEndpointValue(destinationValue), [destinationValue]);

  const availability = useMemo(() => {
    const availableEquipmentIds = new Set<string>();
    const availableToolQuantities = new Map<string, number>();

    if (!origin) {
      return { availableEquipmentIds, availableToolQuantities };
    }

    if (origin.type === "employee") {
      for (const equipment of equipments) {
        if (equipment.current_employee_id === origin.id) {
          availableEquipmentIds.add(equipment.id);
        }
      }

      for (const tool of tools) {
        const employeeQuantity =
          tool.allocations.find((allocation) => allocation.employee_id === origin.id)?.quantity ?? 0;
        if (employeeQuantity > 0) {
          availableToolQuantities.set(tool.id, employeeQuantity);
        }
      }
    } else {
      for (const equipment of equipments) {
        if (!equipment.current_employee_id && equipment.ubicacion_id === origin.id) {
          availableEquipmentIds.add(equipment.id);
        }
      }

      for (const tool of tools) {
        if (tool.ubicacion_id !== origin.id) {
          continue;
        }

        const unassignedQuantity =
          tool.allocations.find((allocation) => allocation.employee_id === null)?.quantity ?? 0;
        if (unassignedQuantity > 0) {
          availableToolQuantities.set(tool.id, unassignedQuantity);
        }
      }
    }

    return { availableEquipmentIds, availableToolQuantities };
  }, [origin, equipments, tools]);

  const filteredEquipments = useMemo(() => {
    return equipments.filter((equipment) => {
      if (!availability.availableEquipmentIds.has(equipment.id)) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const locationLabel =
        equipment.ubicacion_nombre ?? locationsById.get(equipment.ubicacion_id)?.nombre ?? "PAÑOL";
      return [
        equipment.codigo,
        equipment.descripcion,
        equipment.marca ?? "",
        equipment.modelo ?? "",
        equipment.nro_serie ?? "",
        locationLabel,
      ].some((value) => matchesSearch(value, search));
    });
  }, [availability.availableEquipmentIds, equipments, locationsById, search]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const availableQuantity = availability.availableToolQuantities.get(tool.id) ?? 0;
      if (availableQuantity <= 0) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const locationLabel = tool.ubicacion_nombre ?? locationsById.get(tool.ubicacion_id)?.nombre ?? "PAÑOL";
      return [
        tool.codigo,
        tool.descripcion,
        tool.marca ?? "",
        tool.modelo ?? "",
        tool.unidad ?? "",
        locationLabel,
      ].some((value) => matchesSearch(value, search));
    });
  }, [availability.availableToolQuantities, locationsById, search, tools]);

  const effectiveSelectedEquipmentIds = useMemo(
    () => selectedEquipmentIds.filter((equipmentId) => availability.availableEquipmentIds.has(equipmentId)),
    [availability.availableEquipmentIds, selectedEquipmentIds],
  );
  const effectiveSelectedToolQuantities = useMemo(() => {
    const next: Record<string, number> = {};

    for (const [toolId, quantity] of Object.entries(selectedToolQuantities)) {
      const maxQuantity = availability.availableToolQuantities.get(toolId) ?? 0;
      if (maxQuantity > 0) {
        next[toolId] = Math.min(quantity, maxQuantity);
      }
    }

    return next;
  }, [availability.availableToolQuantities, selectedToolQuantities]);
  const selectedEquipmentSet = useMemo(
    () => new Set(effectiveSelectedEquipmentIds),
    [effectiveSelectedEquipmentIds],
  );
  const selectedToolIds = useMemo(
    () => Object.keys(effectiveSelectedToolQuantities),
    [effectiveSelectedToolQuantities],
  );
  const selectedEquipmentItems = useMemo(
    () =>
      effectiveSelectedEquipmentIds
        .map((equipmentId) => equipmentById.get(equipmentId))
        .filter(Boolean),
    [effectiveSelectedEquipmentIds, equipmentById],
  );
  const selectedToolItems = useMemo(
    () => selectedToolIds.map((toolId) => toolById.get(toolId)).filter(Boolean),
    [selectedToolIds, toolById],
  );
  const selectedToolTotalQuantity = useMemo(
    () =>
      selectedToolIds.reduce(
        (sum, toolId) => sum + (effectiveSelectedToolQuantities[toolId] ?? 0),
        0,
      ),
    [effectiveSelectedToolQuantities, selectedToolIds],
  );

  function handleOriginChange(value: string) {
    setOriginValue(value);
    if (value === destinationValue) {
      setDestinationValue(
        getNextDifferentEndpointValue(value, employees, transferLocations),
      );
    }
  }

  function handleDestinationChange(value: string) {
    if (value === originValue) {
      setDestinationValue(
        getNextDifferentEndpointValue(value, employees, transferLocations),
      );
      return;
    }

    setDestinationValue(value);
  }

  function handleAddEquipment(equipmentId: string) {
    setSelectedEquipmentIds((current) =>
      current.includes(equipmentId)
        ? current.filter((id) => id !== equipmentId)
        : [...current, equipmentId],
    );
  }

  function handleAddTool(toolId: string) {
    const availableQuantity = availability.availableToolQuantities.get(toolId) ?? 0;
    const draftQuantity = Number.parseInt(toolDraftQuantities[toolId] ?? "1", 10);
    const quantityToAdd = Number.isFinite(draftQuantity) && draftQuantity > 0 ? draftQuantity : 1;

    if (availableQuantity <= 0) {
      return;
    }

    setSelectedToolQuantities((current) => {
      const currentQuantity = current[toolId] ?? 0;
      return {
        ...current,
        [toolId]: Math.min(availableQuantity, currentQuantity + quantityToAdd),
      };
    });

    setToolDraftQuantities((current) => ({
      ...current,
      [toolId]: "1",
    }));
  }

  function handleRemoveTool(toolId: string) {
    setSelectedToolQuantities((current) => {
      const next = { ...current };
      delete next[toolId];
      return next;
    });
  }

  function handleUpdateToolQuantity(toolId: string, value: string) {
    const availableQuantity = availability.availableToolQuantities.get(toolId) ?? 0;
    const parsed = Number.parseInt(value, 10);

    setSelectedToolQuantities((current) => {
      const next = { ...current };

      if (!Number.isFinite(parsed) || parsed <= 0) {
        delete next[toolId];
        return next;
      }

      next[toolId] = Math.min(parsed, availableQuantity);
      return next;
    });
  }

  const availableEquipmentCount = availability.availableEquipmentIds.size;
  const availableToolCount = availability.availableToolQuantities.size;

  if (!canCreateTransfers) {
    return (
      <section className="space-y-6 rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Traspasos
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nuevo traspaso</h1>
          <p className="mt-2 text-sm text-muted">
            No tienes ubicaciones asignadas para realizar traspasos. Debes ser responsable
            de al menos una ubicación o usar una cuenta administradora.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Traspasos</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nuevo traspaso</h1>
        <p className="mt-2 text-sm text-muted">
          Busca equipos y herramientas, agrégalos al carro y revisa lo que quedará en el traspaso
          antes de confirmarlo.
        </p>
      </div>

      <form action={createEmployeeTransferAction} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="text-sm font-medium">ORIGEN</span>
            <select
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              name="origin_endpoint"
              required
              value={originValue}
              onChange={(event) => handleOriginChange(event.target.value)}
            >
              <optgroup label="Empleados">
                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={endpointToValue({ type: "employee", id: employee.id })}
                  >
                    {`Empleado: ${formatEmployeeLabel(employee)}`}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Ubicaciones">
                {transferLocations.map((location) => (
                  <option
                    key={location.id}
                    value={endpointToValue({ type: "location", id: location.id })}
                  >
                    {`Ubicación: ${formatLocationLabel(location)}`}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">DESTINO</span>
            <select
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              name="destination_endpoint"
              required
              value={destinationValue}
              onChange={(event) => handleDestinationChange(event.target.value)}
            >
              <optgroup label="Empleados">
                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={endpointToValue({ type: "employee", id: employee.id })}
                  >
                    {`Empleado: ${formatEmployeeLabel(employee)}`}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Ubicaciones">
                {transferLocations.map((location) => (
                  <option
                    key={location.id}
                    value={endpointToValue({ type: "location", id: location.id })}
                  >
                    {`Ubicación: ${formatLocationLabel(location)}`}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">FECHA</span>
            <input
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              defaultValue={defaultDate}
              name="transfer_date"
              type="date"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">HORA</span>
            <input
              className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
              defaultValue={defaultTime}
              name="transfer_time"
              type="time"
              required
            />
          </label>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Buscar y agregar</h2>
                  <p className="mt-1 text-sm text-muted">
                    Solo se muestran los activos disponibles en el origen seleccionado.
                  </p>
                </div>
                <div className="grid gap-2 text-sm text-muted md:text-right">
                  <span>{availableEquipmentCount} equipos disponibles</span>
                  <span>{availableToolCount} herramientas disponibles</span>
                </div>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-medium">BUSCADOR</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                  placeholder="Buscar por codigo, descripcion, marca o ubicacion"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>

            <section className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Equipos disponibles</h2>
                  <p className="mt-1 text-sm text-muted">
                    Los equipos se agregan de a uno al carro.
                  </p>
                </div>
                <p className="text-sm text-muted">{filteredEquipments.length} resultados</p>
              </div>

              <div className="mt-4 space-y-3">
                {filteredEquipments.map((equipment) => (
                  <article
                    key={equipment.id}
                    className="rounded-2xl border border-line/80 bg-panel/40 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#2b3a44]/10 px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                            {equipment.codigo}
                          </span>
                          <span className="text-sm text-muted">
                            {equipment.ubicacion_nombre ??
                              formatLocationLabel(locationsById.get(equipment.ubicacion_id))}
                          </span>
                        </div>
                        <p className="font-medium text-foreground">{equipment.descripcion}</p>
                        <p className="text-sm text-muted">
                          {equipment.current_employee_name
                            ? `Asignado a ${equipment.current_employee_name}`
                            : "Disponible en ubicacion"}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                        onClick={() => handleAddEquipment(equipment.id)}
                      >
                        {selectedEquipmentSet.has(equipment.id) ? "Quitar del carro" : "Agregar al carro"}
                      </button>
                    </div>
                  </article>
                ))}

                {filteredEquipments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-center text-muted">
                    No hay equipos que coincidan con el origen y la busqueda.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Herramientas disponibles</h2>
                  <p className="mt-1 text-sm text-muted">
                    Ingresa una cantidad y agrégala al carro.
                  </p>
                </div>
                <p className="text-sm text-muted">{filteredTools.length} resultados</p>
              </div>

              <div className="mt-4 space-y-3">
                {filteredTools.map((tool) => {
                  const availableQuantity = availability.availableToolQuantities.get(tool.id) ?? 0;
                  const selectedQuantity = selectedToolQuantities[tool.id] ?? 0;

                  return (
                    <article
                      key={tool.id}
                      className="rounded-2xl border border-line/80 bg-panel/40 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#2b3a44]/10 px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                              {tool.codigo}
                            </span>
                            <span className="text-sm text-muted">
                              {tool.ubicacion_nombre ??
                                formatLocationLabel(locationsById.get(tool.ubicacion_id))}
                            </span>
                          </div>
                          <p className="font-medium text-foreground">{tool.descripcion}</p>
                          <p className="text-sm text-muted">
                            Disponible: {availableQuantity} {tool.unidad}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 md:min-w-[220px]">
                          <input
                            className="w-full rounded-xl border border-line bg-white px-4 py-2 outline-none ring-accent/25 transition focus:ring-4"
                            min={1}
                            max={availableQuantity}
                            type="number"
                            value={toolDraftQuantities[tool.id] ?? "1"}
                            onChange={(event) =>
                              setToolDraftQuantities((current) => ({
                                ...current,
                                [tool.id]: event.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-accent/50"
                            disabled={availableQuantity <= 0}
                            onClick={() => handleAddTool(tool.id)}
                          >
                            {selectedQuantity > 0 ? "Agregar mas" : "Agregar al carro"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {filteredTools.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-center text-muted">
                    No hay herramientas que coincidan con el origen y la busqueda.
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-2xl border border-line bg-white p-4">
              <h2 className="text-xl font-semibold tracking-tight">Carro de traspaso</h2>
              <p className="mt-1 text-sm text-muted">
                Revisa lo que se enviará desde{" "}
                {origin ? formatEndpointLabel(origin, employeesById, locationsById) : "el origen"}.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Equipos</span>
                  <span className="font-semibold">{selectedEquipmentIds.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Herramientas</span>
                  <span className="font-semibold">{selectedToolTotalQuantity}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {selectedEquipmentItems.map((equipment) =>
                  equipment ? (
                    <div
                      key={equipment.id}
                      className="rounded-2xl border border-line/80 bg-panel/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{equipment.codigo}</p>
                          <p className="text-sm text-muted">{equipment.descripcion}</p>
                        </div>
                        <button
                          type="button"
                          className="text-sm font-semibold text-accent"
                          onClick={() => handleAddEquipment(equipment.id)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : null,
                )}

                {selectedToolItems.map((tool) =>
                  tool ? (
                    <div
                      key={tool.id}
                      className="rounded-2xl border border-line/80 bg-panel/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{tool.codigo}</p>
                          <p className="text-sm text-muted">{tool.descripcion}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              className="w-20 rounded-lg border border-line bg-white px-2 py-1 text-sm outline-none ring-accent/25 transition focus:ring-4"
                              min={1}
                              max={availability.availableToolQuantities.get(tool.id) ?? tool.cantidad}
                              type="number"
                              value={selectedToolQuantities[tool.id] ?? 0}
                              onChange={(event) => handleUpdateToolQuantity(tool.id, event.target.value)}
                            />
                            <span className="text-xs text-muted">{tool.unidad}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-sm font-semibold text-accent"
                          onClick={() => handleRemoveTool(tool.id)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : null,
                )}

                {selectedEquipmentIds.length === 0 && selectedToolIds.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
                    El carro está vacío.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="grid gap-3 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>Origen</span>
                  <span className="font-semibold text-foreground">
                    {origin ? formatEndpointLabel(origin, employeesById, locationsById) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Destino</span>
                  <span className="font-semibold text-foreground">
                    {destination ? formatEndpointLabel(destination, employeesById, locationsById) : "-"}
                  </span>
                </div>
              </div>
            </div>

            <SignaturePad
              description="Firma el traspaso con el lápiz digital antes de registrarlo."
              label="Firma del traspaso"
              name="signature_data"
            />

            {effectiveSelectedEquipmentIds.map((equipmentId) => (
              <input key={equipmentId} type="hidden" name={`equipment_selected_${equipmentId}`} value="true" />
            ))}

            {Object.entries(effectiveSelectedToolQuantities).map(([toolId, quantity]) => (
              <input key={toolId} type="hidden" name={`tool_quantity_${toolId}`} value={String(quantity)} />
            ))}

            <div className="rounded-2xl border border-line bg-white p-4">
              <PendingButton
                className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-accent/50"
                pendingLabel="Registrando..."
                type="submit"
                disabled={effectiveSelectedEquipmentIds.length === 0 && selectedToolIds.length === 0}
              >
                Registrar traspaso
              </PendingButton>
            </div>
          </aside>
        </div>
      </form>
    </section>
  );
}

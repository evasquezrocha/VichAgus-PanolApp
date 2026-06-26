"use client";

import {
  createToolAction,
  createToolGroupAction,
  deleteToolAction,
  updateToolAction,
} from "@/actions/panol.actions";
import { PendingButton } from "@/components/ui/pending-button";
import { ToolFichaContent } from "@/components/panol/tool-ficha-content";
import {
  getStatusSelectValue,
  ITEM_STATUS_OPTIONS,
  isKnownItemStatus,
} from "@/lib/item-status";
import type {
  Tool,
  ToolDetail,
  ToolCustomField,
  ToolCustomFieldValue,
  ToolGroup,
} from "@/types/panol";
import type { PanolLocation } from "@/types/ubicaciones";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type ToolsManagerProps = {
  activeTab: "herramientas" | "grupos" | "ficha-herramienta";
  customFields: ToolCustomField[];
  customFieldValues: ToolCustomFieldValue[];
  groups: ToolGroup[];
  selectedToolDetail: ToolDetail | null;
  selectedToolId: string | null;
  tools: Tool[];
  locations: PanolLocation[];
  defaultLocationId: string;
};

type ToolModalState =
  | { mode: "create" }
  | { mode: "edit"; tool: Tool };

type SortKey =
  | "codigo"
  | "descripcion"
  | "group"
  | "ubicacion"
  | "cantidad"
  | "unidad"
  | "estado"
  | "marca"
  | "modelo"
  | `custom:${string}`;

type SortDirection = "asc" | "desc";

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
        "company-tab-link rounded-full border border-line px-5 py-3 text-sm font-semibold transition",
      ].join(" ")}
      data-active={active ? "true" : "false"}
    >
      {children}
    </Link>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <span className="ml-1 inline-flex flex-col leading-none text-[9px] opacity-70">
      <span className={direction === "asc" ? "text-foreground" : ""}>▲</span>
      <span className={direction === "desc" ? "text-foreground" : ""}>▼</span>
    </span>
  );
}

function getFieldValueName(fieldId: string) {
  return `custom_field_${fieldId}`;
}

function formatCustomFieldValue(
  field: ToolCustomField,
  value: string | null | undefined,
) {
  if (!value) {
    return "-";
  }

  if (field.field_type === "boolean") {
    return value === "true" ? "Sí" : "No";
  }

  return value;
}

function getLocationLabel(tool: Tool, locationsById: Map<string, PanolLocation>) {
  if (tool.assigned_employee_id) {
    return "Asignado a Empleado";
  }

  return locationsById.get(tool.ubicacion_id)?.nombre ?? tool.ubicacion_nombre ?? "PAÑOL";
}

function ToolFormFields({
  customFields,
  customFieldValuesById,
  groups,
  tool,
  locations,
  defaultLocationId,
}: {
  customFields: ToolCustomField[];
  customFieldValuesById: Map<string, string | null>;
  groups: ToolGroup[];
  tool?: Tool | null;
  locations: PanolLocation[];
  defaultLocationId: string;
}) {
  const activeFields = customFields.filter((field) => field.is_active);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="text-sm font-medium">GRUPO HERRAMIENTA</span>
        <select
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          name="tool_group_id"
          required
          defaultValue={tool?.tool_group_id ?? ""}
        >
          <option value="">Selecciona un grupo</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.codigo} - {group.descripcion}
            </option>
          ))}
        </select>
      </label>

      <label className="block md:col-span-2">
        <span className="text-sm font-medium">UBICACION</span>
        <select
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          defaultValue={tool?.ubicacion_id ?? defaultLocationId}
          name="ubicacion_id"
          required
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium">CODIGO</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 uppercase outline-none ring-accent/25 transition focus:ring-4"
          name="codigo"
          defaultValue={tool?.codigo ?? ""}
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">CANTIDAD</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          name="cantidad"
          min={0}
          type="number"
          defaultValue={tool?.cantidad ?? 0}
          required
        />
      </label>

      <label className="block md:col-span-2">
        <span className="text-sm font-medium">DESCRIPCION</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          name="descripcion"
          defaultValue={tool?.descripcion ?? ""}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">UNIDAD</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 uppercase outline-none ring-accent/25 transition focus:ring-4"
          name="unidad"
          defaultValue={tool?.unidad ?? ""}
          placeholder="UND"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Estado</span>
        <select
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          name="estado"
          defaultValue={getStatusSelectValue(tool?.estado)}
          required
        >
          {ITEM_STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
          {tool?.estado && !isKnownItemStatus(tool.estado) ? (
            <option value={tool.estado}>{tool.estado}</option>
          ) : null}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium">MARCA</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          name="marca"
          defaultValue={tool?.marca ?? ""}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">MODELO</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          name="modelo"
          defaultValue={tool?.modelo ?? ""}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">IMAGEN</span>
        <input
          accept="image/*"
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-4"
          name="image_file"
          type="file"
        />
      </label>

      {activeFields.length > 0 ? (
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Campos personalizados</p>
            <p className="text-xs text-muted">Se muestran solo los campos activos.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {activeFields.map((field) => {
              const defaultValue = customFieldValuesById.get(field.id) ?? "";

              if (field.field_type === "boolean") {
                return (
                  <label
                    key={field.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 md:col-span-2"
                  >
                    <input
                      name={getFieldValueName(field.id)}
                      type="hidden"
                      value="false"
                    />
                    <input
                      className="h-4 w-4 accent-[#2b3a44]"
                      defaultChecked={defaultValue === "true"}
                      name={getFieldValueName(field.id)}
                      type="checkbox"
                      value="true"
                    />
                    <span className="text-sm font-medium">
                      {field.codigo} - {field.nombre}
                    </span>
                    {field.is_required ? (
                      <span className="ml-auto text-xs font-semibold uppercase tracking-wide text-accent">
                        Requerido
                      </span>
                    ) : null}
                  </label>
                );
              }

              if (field.field_type === "select") {
                return (
                  <label key={field.id} className="block">
                    <span className="text-sm font-medium">
                      {field.codigo} - {field.nombre}
                    </span>
                    <select
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                      defaultValue={defaultValue}
                      name={getFieldValueName(field.id)}
                      required={field.is_required}
                    >
                      <option value="">Selecciona una opcion</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }

              const inputType =
                field.field_type === "number"
                  ? "number"
                  : field.field_type === "date"
                    ? "date"
                    : "text";

              return (
                <label key={field.id} className="block">
                  <span className="text-sm font-medium">
                    {field.codigo} - {field.nombre}
                  </span>
                  <input
                    className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                    defaultValue={defaultValue}
                    name={getFieldValueName(field.id)}
                    required={field.is_required}
                    type={inputType}
                  />
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ToolsManager({
  activeTab,
  customFields,
  customFieldValues,
  groups,
  selectedToolDetail,
  selectedToolId,
  tools,
  locations,
  defaultLocationId,
}: ToolsManagerProps) {
  const router = useRouter();
  const [toolModalState, setToolModalState] = useState<ToolModalState | null>(null);
  const [imagePreviewTool, setImagePreviewTool] = useState<Tool | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("codigo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const imageDialogRef = useRef<HTMLDialogElement | null>(null);

  const groupById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );

  const locationById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations],
  );

  const activeCustomFields = useMemo(
    () => customFields.filter((field) => field.is_active),
    [customFields],
  );

  const customFieldValuesByToolId = useMemo(() => {
    const map = new Map<string, Map<string, string | null>>();

    for (const value of customFieldValues) {
      const toolMap = map.get(value.tool_id) ?? new Map<string, string | null>();
      toolMap.set(value.custom_field_id, value.value_text);
      map.set(value.tool_id, toolMap);
    }

    return map;
  }, [customFieldValues]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (toolModalState && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!toolModalState && dialog.open) {
      dialog.close();
    }
  }, [toolModalState]);

  useEffect(() => {
    const dialog = imageDialogRef.current;

    if (!dialog) {
      return;
    }

    if (imagePreviewTool && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!imagePreviewTool && dialog.open) {
      dialog.close();
    }
  }, [imagePreviewTool]);

  const filteredTools = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return tools;
    }

    return tools.filter((tool) => {
      const group = groupById.get(tool.tool_group_id);
      const customValues = customFieldValuesByToolId.get(tool.id);
      const haystack = [
        tool.codigo,
        tool.descripcion,
        tool.marca ?? "",
        tool.modelo ?? "",
        tool.unidad,
        tool.estado ?? "",
        getLocationLabel(tool, locationById),
        group ? `${group.codigo} ${group.descripcion}` : "",
        ...activeCustomFields.map((field) =>
          formatCustomFieldValue(field, customValues?.get(field.id) ?? null),
        ),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [activeCustomFields, customFieldValuesByToolId, groupById, locationById, search, tools]);

  const sortedTools = useMemo(() => {
    const getComparableValue = (tool: Tool) => {
      const group = groupById.get(tool.tool_group_id);

      if (sortKey.startsWith("custom:")) {
        const fieldId = sortKey.slice("custom:".length);
        return customFieldValuesByToolId.get(tool.id)?.get(fieldId) ?? "";
      }

      switch (sortKey) {
        case "codigo":
          return tool.codigo;
        case "descripcion":
          return tool.descripcion;
        case "group":
          return group ? `${group.codigo} ${group.descripcion}` : "";
        case "ubicacion":
          return getLocationLabel(tool, locationById);
        case "cantidad":
          return tool.cantidad;
        case "unidad":
          return tool.unidad;
        case "estado":
          return tool.estado ?? "";
        case "marca":
          return tool.marca ?? "";
        case "modelo":
          return tool.modelo ?? "";
      }

      return "";
    };

    const sorted = [...filteredTools].sort((left, right) => {
      const a = getComparableValue(left);
      const b = getComparableValue(right);

      if (typeof a === "number" && typeof b === "number") {
        return a - b;
      }

      return String(a).localeCompare(String(b), "es", {
        sensitivity: "base",
        numeric: true,
      });
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [customFieldValuesByToolId, filteredTools, groupById, locationById, sortDirection, sortKey]);

  function toggleSort(nextKey: SortKey) {
    setSortKey((currentKey) => {
      if (currentKey === nextKey) {
        setSortDirection((currentDirection) =>
          currentDirection === "asc" ? "desc" : "asc",
        );
        return currentKey;
      }

      setSortDirection("asc");
      return nextKey;
    });
  }

  function getSortDirectionForKey(nextKey: SortKey) {
    return sortKey === nextKey ? sortDirection : null;
  }

  function openCreateToolModal() {
    setToolModalState({ mode: "create" });
  }

  function openEditToolModal(tool: Tool) {
    setToolModalState({ mode: "edit", tool });
  }

  function closeToolModal() {
    setToolModalState(null);
  }

  function openImagePreview(tool: Tool) {
    setImagePreviewTool(tool);
  }

  function closeImagePreview() {
    setImagePreviewTool(null);
  }

  const dialogTool = toolModalState?.mode === "edit" ? toolModalState.tool : null;
  const isEditing = toolModalState?.mode === "edit";
  const dialogCustomFieldValues = dialogTool
    ? customFieldValuesByToolId.get(dialogTool.id) ?? new Map<string, string | null>()
    : new Map<string, string | null>();
  const tableMinWidth = 1280 + activeCustomFields.length * 180;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <TabLink
          href="/company/panol/herramientas?tab=herramientas"
          active={activeTab === "herramientas"}
        >
          Listado de Herramientas
        </TabLink>
        <TabLink
          href={
            selectedToolId
              ? `/company/panol/herramientas?tab=ficha-herramienta&toolId=${encodeURIComponent(
                  selectedToolId,
                )}`
              : "/company/panol/herramientas?tab=ficha-herramienta"
          }
          active={activeTab === "ficha-herramienta"}
        >
          Ficha Herramienta
        </TabLink>
        <TabLink
          href="/company/panol/herramientas?tab=grupos"
          active={activeTab === "grupos"}
        >
          Grupos de Herramientas
        </TabLink>
      </div>

      {activeTab === "herramientas" ? (
        <section className="w-full rounded-[1.75rem] border border-line bg-white/55 p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Listado de herramientas
              </h2>
              <p className="mt-2 text-sm text-muted">
                {filteredTools.length} herramienta{filteredTools.length === 1 ? "" : "s"} visible{filteredTools.length === 1 ? "" : "s"} de {tools.length}.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="block">
                <span className="sr-only">Buscar herramienta</span>
                <input
                  className="w-full rounded-full border border-line bg-white px-4 py-3 text-sm outline-none ring-accent/25 transition focus:ring-4 sm:w-[20rem]"
                placeholder="Buscar por código, grupo, descripción..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <button
                className="rounded-full bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong"
                onClick={openCreateToolModal}
                type="button"
              >
                Agregar Herramienta
              </button>
            </div>
          </div>

          <div className="mt-5 w-full overflow-x-auto">
            <table
              className="w-full border-collapse text-[12px]"
              style={{ minWidth: `${tableMinWidth}px` }}
            >
              <colgroup>
                <col className="w-24" />
                <col className="w-[21%]" />
                <col className="w-[20%]" />
                <col className="w-32" />
                <col className="w-20" />
                <col className="w-20" />
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-24" />
                {activeCustomFields.map((field) => (
                  <col key={field.id} className="w-40" />
                ))}
                <col className="w-28" />
                <col className="w-24" />
              </colgroup>
              <thead>
                <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.2em] text-muted">
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("codigo")}
                      type="button"
                    >
                      Código
                      <SortIcon direction={getSortDirectionForKey("codigo")} />
                    </button>
                  </th>
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("descripcion")}
                      type="button"
                    >
                      Descripción
                      <SortIcon direction={getSortDirectionForKey("descripcion")} />
                    </button>
                  </th>
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("group")}
                      type="button"
                    >
                      Grupo
                      <SortIcon direction={getSortDirectionForKey("group")} />
                    </button>
                  </th>
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("ubicacion")}
                      type="button"
                    >
                      Ubicación
                      <SortIcon direction={getSortDirectionForKey("ubicacion")} />
                    </button>
                  </th>
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("cantidad")}
                      type="button"
                    >
                      Cant.
                      <SortIcon direction={getSortDirectionForKey("cantidad")} />
                    </button>
                  </th>
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("unidad")}
                      type="button"
                    >
                      Uni.
                      <SortIcon direction={getSortDirectionForKey("unidad")} />
                    </button>
                  </th>
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("estado")}
                      type="button"
                    >
                      Estado
                      <SortIcon direction={getSortDirectionForKey("estado")} />
                    </button>
                  </th>
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("marca")}
                      type="button"
                    >
                      Marca
                      <SortIcon direction={getSortDirectionForKey("marca")} />
                    </button>
                  </th>
                  <th className="pb-2 pr-2 font-semibold">
                    <button
                      className="inline-flex items-center font-semibold"
                      onClick={() => toggleSort("modelo")}
                      type="button"
                    >
                      Modelo
                      <SortIcon direction={getSortDirectionForKey("modelo")} />
                    </button>
                  </th>
                  {activeCustomFields.map((field) => (
                    <th key={field.id} className="pb-2 pr-2 font-semibold">
                      <button
                        className="inline-flex items-center font-semibold"
                        onClick={() => toggleSort(`custom:${field.id}`)}
                        type="button"
                      >
                        {field.codigo}
                        <SortIcon
                          direction={getSortDirectionForKey(`custom:${field.id}`)}
                        />
                      </button>
                    </th>
                  ))}
                  <th className="pb-2 pr-2 font-semibold">Imagen</th>
                  <th className="pb-2 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedTools.map((tool) => {
                  const group = groupById.get(tool.tool_group_id);
                  const toolCustomValues = customFieldValuesByToolId.get(tool.id);
                  const isSelected = selectedToolId === tool.id;

                  return (
                    <tr
                      key={tool.id}
                      className={[
                        "cursor-pointer border-b border-line/60 align-top transition",
                        "hover:bg-panel/40",
                        isSelected ? "bg-accent/5" : "",
                      ].join(" ")}
                      onClick={() => {
                        router.push(
                          `/company/panol/herramientas?tab=ficha-herramienta&toolId=${encodeURIComponent(
                            tool.id,
                          )}`,
                        );
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(
                            `/company/panol/herramientas?tab=ficha-herramienta&toolId=${encodeURIComponent(
                              tool.id,
                            )}`,
                          );
                        }
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      <td className="py-2 pr-2 align-middle font-semibold text-foreground">
                        {tool.codigo}
                      </td>
                      <td className="py-2 pr-2 align-middle text-muted">
                        <div className="max-w-[16rem] break-words">{tool.descripcion}</div>
                      </td>
                      <td className="py-2 pr-2 align-middle text-muted">
                        <div className="max-w-[15rem] break-words">
                          {group ? `${group.codigo} - ${group.descripcion}` : "Sin grupo"}
                        </div>
                      </td>
                      <td className="py-2 pr-2 align-middle text-muted">
                        <div className="max-w-[14rem] break-words">
                          {getLocationLabel(tool, locationById)}
                        </div>
                      </td>
                      <td className="py-2 pr-2 align-middle text-muted">{tool.cantidad}</td>
                      <td className="py-2 pr-2 align-middle text-muted uppercase">
                        {tool.unidad}
                      </td>
                      <td className="py-2 pr-2 align-middle text-muted">
                        {tool.estado ? getStatusSelectValue(tool.estado) : "-"}
                      </td>
                      <td className="py-2 pr-2 align-middle text-muted">
                        {tool.marca ?? "-"}
                      </td>
                      <td className="py-2 pr-2 align-middle text-muted">
                        {tool.modelo ?? "-"}
                      </td>
                      {activeCustomFields.map((field) => (
                        <td key={field.id} className="py-2 pr-2 align-middle text-muted">
                          <div className="max-w-[12rem] break-words">
                            {formatCustomFieldValue(
                              field,
                              toolCustomValues?.get(field.id) ?? null,
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="py-2 pr-2 align-middle text-muted">
                        {tool.image_url ? (
                          <button
                            className="flex items-center gap-2 text-left transition hover:opacity-80"
                            onClick={(event) => {
                              event.stopPropagation();
                              openImagePreview(tool);
                            }}
                            type="button"
                          >
                            <Image
                              alt={tool.descripcion}
                              className="h-8 w-8 rounded-lg border border-line object-cover"
                              height={32}
                              src={tool.image_url}
                              unoptimized
                              width={32}
                            />
                            <span className="whitespace-nowrap text-[11px]">Dropbox</span>
                          </button>
                        ) : (
                          "Pendiente"
                        )}
                      </td>
                      <td
                        className="py-2 align-middle"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-foreground transition hover:bg-panel"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditToolModal(tool);
                            }}
                            title="Editar"
                            type="button"
                          >
                            <EditIcon />
                          </button>
                          <form
                            action={deleteToolAction}
                            onSubmit={(event) => {
                              if (!window.confirm("Eliminar esta herramienta?")) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <input name="tool_id" type="hidden" value={tool.id} />
                            <PendingButton
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                              onClick={(event) => {
                                event.stopPropagation();
                              }}
                              title="Eliminar"
                              pendingLabel=""
                              type="submit"
                            >
                              <TrashIcon />
                            </PendingButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {sortedTools.length === 0 ? (
                  <tr>
                    <td className="py-10 text-center text-muted" colSpan={11 + activeCustomFields.length}>
                      No hay herramientas que coincidan con la busqueda.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <dialog
            ref={dialogRef}
            className="company-popup-surface fixed left-1/2 top-1/2 z-50 m-0 max-h-[calc(100vh-2rem)] w-[min(56rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-line p-0 shadow-2xl shadow-black/25 backdrop:bg-black/50"
            onCancel={closeToolModal}
            onClose={closeToolModal}
          >
            <form
              action={isEditing ? updateToolAction : createToolAction}
              encType="multipart/form-data"
              key={dialogTool?.id ?? "create"}
              className="p-6 md:p-8"
            >
              <input name="tool_id" type="hidden" value={dialogTool?.id ?? ""} />
              <input
                name="current_image_url"
                type="hidden"
                value={dialogTool?.image_url ?? ""}
              />
              <input
                name="current_image_dropbox_path"
                type="hidden"
                value={dialogTool?.image_dropbox_path ?? ""}
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                    Formulario
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    {isEditing ? "Editar Herramienta" : "Agregar Herramienta"}
                  </h3>
                </div>
                <button
                  aria-label="Cerrar formulario"
                  className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-panel"
                  onClick={closeToolModal}
                  type="button"
                >
                  Cerrar
                </button>
              </div>

              {dialogTool?.image_url ? (
                <div className="mt-4 rounded-2xl border border-line bg-panel p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                    Imagen actual
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Image
                      alt={dialogTool.descripcion}
                      className="h-16 w-16 rounded-xl border border-line object-cover"
                      height={64}
                      src={dialogTool.image_url}
                      unoptimized
                      width={64}
                    />
                    <div className="text-sm text-muted">
                      Si subes una nueva imagen, reemplazara la actual.
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6">
                <ToolFormFields
                  customFieldValuesById={dialogCustomFieldValues}
                  customFields={customFields}
                  groups={groups}
                  locations={locations}
                  defaultLocationId={defaultLocationId}
                  tool={dialogTool}
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel"
                  onClick={closeToolModal}
                  type="button"
                >
                  Cancelar
                </button>
                <PendingButton
                  className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
                  pendingLabel="Guardando..."
                  type="submit"
                >
                  {isEditing ? "Guardar cambios" : "Guardar herramienta"}
                </PendingButton>
              </div>
            </form>
          </dialog>

          <dialog
            ref={imageDialogRef}
            className="company-popup-surface fixed left-1/2 top-1/2 z-50 m-0 max-h-[calc(100vh-2rem)] w-[min(42rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-line p-0 shadow-2xl shadow-black/25 backdrop:bg-black/50"
            onCancel={closeImagePreview}
            onClose={closeImagePreview}
          >
            {imagePreviewTool ? (
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                      Imagen de herramienta
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                      {imagePreviewTool.descripcion}
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      {imagePreviewTool.codigo}
                    </p>
                  </div>
                  <button
                    aria-label="Cerrar imagen"
                    className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-panel"
                    onClick={closeImagePreview}
                    type="button"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-line bg-panel">
                  <Image
                    alt={imagePreviewTool.descripcion}
                    className="max-h-[70vh] w-full object-contain"
                    height={1200}
                    src={imagePreviewTool.image_url ?? ""}
                    unoptimized
                    width={1600}
                  />
                </div>
              </div>
            ) : null}
          </dialog>
        </section>
      ) : null}

      {activeTab === "grupos" ? (
        <section className="w-full rounded-[1.75rem] border border-line bg-white/55 p-5 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Grupos de herramientas
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Catalogo de grupos
            </h2>
            <p className="mt-2 text-sm text-muted">
              Estos grupos alimentan el selector del formulario de herramientas.
            </p>
          </div>

          <form action={createToolGroupAction} className="mt-6 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">CODIGO</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 uppercase outline-none ring-accent/25 transition focus:ring-4"
                  name="codigo"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">DESCRIPCION</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                  name="descripcion"
                  required
                />
              </label>
            </div>

            <div className="flex items-center justify-end">
              <PendingButton
                className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel"
                pendingLabel="Agregando..."
                type="submit"
              >
                Agregar Grupo
              </PendingButton>
            </div>
          </form>

          <div className="mt-6 space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="rounded-2xl border border-line bg-white px-4 py-3"
              >
                <p className="font-semibold text-foreground">
                  {group.codigo} - {group.descripcion}
                </p>
              </div>
            ))}
            {groups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
                Aun no hay grupos creados.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab === "ficha-herramienta" ? (
        <ToolFichaContent
          backHref="/company/panol/herramientas?tab=herramientas"
          detail={selectedToolDetail}
        />
      ) : null}
    </div>
  );
}

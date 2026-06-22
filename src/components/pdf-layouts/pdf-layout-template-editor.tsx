"use client";

import type {
  PdfLayoutBoxElement,
  PdfLayoutCanvasElement,
  PdfLayoutConfig,
  PdfLayoutFieldElement,
  PdfLayoutFieldKey,
  PdfLayoutImageElement,
  PdfLayoutItemsListElement,
  PdfLayoutLineElement,
  PdfLayoutSignatureElement,
  PdfLayoutTextElement,
} from "@/types/pdf-layouts";
import { PdfLayoutCanvas } from "@/components/pdf-layouts/pdf-layout-canvas";
import { LayoutSectionsEditor } from "@/components/pdf-layouts/layout-sections-editor";
import Image from "next/image";
import {
  DEFAULT_PDF_LAYOUT_FIELD_LABELS,
  createDefaultPdfLayoutCanvas,
  getPdfLayoutPageDimensions,
  type PdfLayoutRuntimeContext,
} from "@/lib/pdf-layouts";
import { useMemo, useState } from "react";

type PdfLayoutTemplateRecord = {
  id: string;
  template_key: string;
  name: string;
  description: string | null;
  target_path: string;
  is_active: boolean;
  layout_config: PdfLayoutConfig;
};

type PdfLayoutTemplateEditorProps = {
  template: PdfLayoutTemplateRecord;
  action: (formData: FormData) => Promise<void>;
  companyLogoUrl?: string | null;
};

type ElementKind = PdfLayoutCanvasElement["kind"];

type PdfLayoutEditableElementPatch = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  opacity?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: 400 | 500 | 600 | 700 | 800;
  color?: string;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  backgroundColor?: string | null;
  borderColor?: string | null;
  borderWidth?: number;
  radius?: number;
  padding?: number;
  fieldKey?: PdfLayoutFieldKey;
  label?: string | null;
  showLabel?: boolean;
  labelSize?: number;
  valueSize?: number;
  labelColor?: string;
  valueColor?: string;
  orientation?: "horizontal" | "vertical";
  thickness?: number;
  title?: string;
  titleSize?: number;
  titleColor?: string;
  itemSize?: number;
  showQuantity?: boolean;
  showDescription?: boolean;
  showPlaceholder?: boolean;
  source?: "static" | "runtime";
  sourceKey?: "company_logo_url" | null;
  src?: string | null;
  alt?: string;
  fit?: "contain" | "cover" | "fill" | "scale-down";
};

function createClientId(kind: string) {
  return `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function serializeConfig(config: PdfLayoutConfig) {
  return JSON.stringify(config);
}

function getSampleRuntime(companyLogoUrl: string | null): PdfLayoutRuntimeContext {
  return {
    fieldValues: {
      origin: "Bodega Central",
      destination: "Taller Principal",
      date: "22/06/2026 14:30",
      registered_by: "Marina Perez",
      transfer_number: "124",
      transfer_id: "75ebba46-5f66-4c38-b36c-4f3fc5d8ede3",
      items_total: "5",
      equipment_count: "2",
      tool_count: "3",
      signed_by: "Carlos Rojas",
    },
    imageValues: {
      company_logo_url: companyLogoUrl,
    },
    items: [
      { code: "EQ-024", description: "Taladro percutor Bosch", quantity: 1 },
      { code: "TL-118", description: "Juego de llaves Allen", quantity: 2 },
      { code: "TL-201", description: "Cinta aislante industrial", quantity: 2 },
    ],
    signatureData: null,
  };
}

function createDefaultElement(
  kind: ElementKind,
  pageWidthMm: number,
  pageHeightMm: number,
  nextIndex: number,
): PdfLayoutCanvasElement {
  const x = clamp(16 + nextIndex * 4, 8, pageWidthMm - 60);
  const y = clamp(20 + nextIndex * 4, 8, pageHeightMm - 40);

  switch (kind) {
    case "text":
      return {
        id: createClientId(kind),
        kind,
        x,
        y,
        width: 60,
        height: 12,
        zIndex: 20,
        text: "Texto editable",
        fontSize: 14,
        fontWeight: 700,
        color: "#111827",
        align: "left",
        verticalAlign: "top",
        backgroundColor: null,
        borderColor: null,
        borderWidth: 0,
        radius: 0,
        padding: 0,
      } satisfies PdfLayoutTextElement;
    case "field":
      return {
        id: createClientId(kind),
        kind,
        x,
        y,
        width: 70,
        height: 18,
        zIndex: 20,
        fieldKey: "origin",
        label: DEFAULT_PDF_LAYOUT_FIELD_LABELS.origin,
        showLabel: true,
        labelSize: 8,
        valueSize: 11,
        labelColor: "#6b7280",
        valueColor: "#111827",
        align: "left",
        verticalAlign: "top",
        backgroundColor: "#ffffff",
        borderColor: "#d1d5db",
        borderWidth: 0.4,
        radius: 3,
        padding: 2,
      } satisfies PdfLayoutFieldElement;
    case "line":
      return {
        id: createClientId(kind),
        kind,
        x,
        y,
        width: 90,
        height: 0.6,
        zIndex: 18,
        orientation: "horizontal",
        thickness: 0.6,
        color: "#d1d5db",
      } satisfies PdfLayoutLineElement;
    case "box":
      return {
        id: createClientId(kind),
        kind,
        x,
        y,
        width: 70,
        height: 32,
        zIndex: 16,
        borderColor: "#d1d5db",
        borderWidth: 0.4,
        backgroundColor: "#ffffff",
        radius: 3,
      } satisfies PdfLayoutBoxElement;
    case "items-list":
      return {
        id: createClientId(kind),
        kind,
        x,
        y,
        width: 120,
        height: 72,
        zIndex: 14,
        title: "Detalle de items",
        titleSize: 8,
        titleColor: "#111827",
        itemSize: 9,
        borderColor: "#d1d5db",
        borderWidth: 0.4,
        backgroundColor: "#ffffff",
        radius: 3,
        showQuantity: true,
        showDescription: true,
      } satisfies PdfLayoutItemsListElement;
    case "signature":
      return {
        id: createClientId(kind),
        kind,
        x,
        y,
        width: 80,
        height: 60,
        zIndex: 14,
        title: "Firma",
        titleSize: 8,
        titleColor: "#111827",
        borderColor: "#d1d5db",
        borderWidth: 0.4,
        backgroundColor: "#ffffff",
        radius: 3,
        showPlaceholder: true,
      } satisfies PdfLayoutSignatureElement;
    case "image":
      return {
        id: createClientId(kind),
        kind,
        x,
        y,
        width: 70,
        height: 28,
        zIndex: 18,
        source: "runtime",
        sourceKey: "company_logo_url",
        src: null,
        alt: "Logo de la empresa",
        fit: "contain",
        backgroundColor: "#ffffff",
        borderColor: "#d1d5db",
        borderWidth: 0.4,
        radius: 3,
        padding: 2,
      } satisfies PdfLayoutImageElement;
  }
}

function updateElement(
  elements: PdfLayoutCanvasElement[],
  elementId: string,
  patch: PdfLayoutEditableElementPatch,
) {
  return elements.map((element) => (element.id === elementId ? { ...element, ...patch } : element)) as PdfLayoutCanvasElement[];
}

function NumericField({
  label,
  value,
  min,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>
      <input
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
        min={min}
        step={step}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}) {
  const displayValue = value?.trim() || "#ffffff";

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>
      <div className="mt-2 flex gap-2">
        <input
          aria-label={label}
          className="h-10 w-12 rounded-xl border border-slate-200 bg-white p-1"
          type="color"
          value={displayValue}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
          placeholder="#1f2937"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value.trim() ? event.target.value : null)}
        />
      </div>
    </label>
  );
}

export function PdfLayoutTemplateEditor({
  template,
  action,
  companyLogoUrl = null,
}: PdfLayoutTemplateEditorProps) {
  const [config, setConfig] = useState<PdfLayoutConfig>(template.layout_config);
  const [zoom, setZoom] = useState(1);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    template.layout_config.canvas?.elements[0]?.id ?? null,
  );

  const runtime = useMemo(() => getSampleRuntime(companyLogoUrl), [companyLogoUrl]);
  const pageDimensions = getPdfLayoutPageDimensions(config.page_size, config.orientation);
  const elements = config.canvas?.elements ?? [];
  const selectedElement = elements.find((element) => element.id === selectedElementId) ?? null;
  const zoomPercent = Math.round(zoom * 100);

  function updateCanvas(nextElements: PdfLayoutCanvasElement[]) {
    setConfig((current) => ({
      ...current,
      canvas: current.canvas
        ? {
            ...current.canvas,
            elements: nextElements,
          }
        : {
            ...createDefaultPdfLayoutCanvas(current.page_size, current.orientation),
            elements: nextElements,
          },
    }));
  }

  function patchConfig(patch: Partial<PdfLayoutConfig>) {
    setConfig((current) => ({
      ...current,
      ...patch,
      field_labels: {
        ...DEFAULT_PDF_LAYOUT_FIELD_LABELS,
        ...(patch.field_labels ?? current.field_labels ?? {}),
      },
      canvas:
        patch.canvas ??
        current.canvas ??
        createDefaultPdfLayoutCanvas(patch.page_size ?? current.page_size, patch.orientation ?? current.orientation),
    }));
  }

  function addElement(kind: ElementKind) {
    const next = [
      ...elements,
      createDefaultElement(kind, pageDimensions.widthMm, pageDimensions.heightMm, elements.length),
    ];
    updateCanvas(next);
    setSelectedElementId(next[next.length - 1]?.id ?? null);
  }

  function moveElement(elementId: string, nextX: number, nextY: number) {
    updateCanvas(
      updateElement(elements, elementId, {
        x: nextX,
        y: nextY,
      }),
    );
  }

  function patchSelectedElement(patch: PdfLayoutEditableElementPatch) {
    if (!selectedElement) {
      return;
    }

    updateCanvas(updateElement(elements, selectedElement.id, patch));
  }

  function deleteSelectedElement() {
    if (!selectedElement) {
      return;
    }

    const next = elements.filter((element) => element.id !== selectedElement.id);
    updateCanvas(next);
    setSelectedElementId(next[0]?.id ?? null);
  }

  function duplicateSelectedElement() {
    if (!selectedElement) {
      return;
    }

    const copy = {
      ...selectedElement,
      id: createClientId(selectedElement.kind),
      x: clamp(selectedElement.x + 6, 0, pageDimensions.widthMm - selectedElement.width),
      y: clamp(selectedElement.y + 6, 0, pageDimensions.heightMm - selectedElement.height),
      zIndex: selectedElement.zIndex + 1,
    } as PdfLayoutCanvasElement;

    const next = [...elements, copy];
    updateCanvas(next);
    setSelectedElementId(copy.id);
  }

  function bringForward() {
    if (!selectedElement) {
      return;
    }

    patchSelectedElement({ zIndex: selectedElement.zIndex + 1 });
  }

  function sendBackward() {
    if (!selectedElement) {
      return;
    }

    patchSelectedElement({ zIndex: Math.max(0, selectedElement.zIndex - 1) });
  }

  return (
    <form action={action} className="space-y-6">
      <input name="template_id" type="hidden" value={template.id} />
      <input name="template_key" type="hidden" value={template.template_key} />
      <input name="layout_config_json" type="hidden" value={serializeConfig(config)} readOnly />

      <section className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#52D6A4]">
              Documento
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{template.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Edita el PDF como una pagina real. Cada cambio se guarda en el JSON del layout.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <input
              className="h-4 w-4 accent-[#2b3a44]"
              defaultChecked={template.is_active}
              name="is_active"
              type="checkbox"
              value="true"
            />
            <span className="text-sm font-medium">Activo</span>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Nombre del layout</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-[#52D6A4]/25 transition focus:ring-4"
              defaultValue={template.name}
              name="name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Ruta objetivo</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-[#52D6A4]/25 transition focus:ring-4"
              defaultValue={template.target_path}
              name="target_path"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Descripcion</span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-[#52D6A4]/25 transition focus:ring-4"
            defaultValue={template.description ?? ""}
            name="description"
            placeholder="Describe el proposito del layout."
          />
        </label>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#52D6A4]">
            Pagina
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Configuracion del papel</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Titulo visible</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-[#52D6A4]/25 transition focus:ring-4"
              value={config.title}
              onChange={(event) => patchConfig({ title: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Subtitulo</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-[#52D6A4]/25 transition focus:ring-4"
              value={config.subtitle ?? ""}
              onChange={(event) =>
                patchConfig({ subtitle: event.target.value.trim() ? event.target.value : null })
              }
              placeholder="Texto breve de apoyo"
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">Tamano de pagina</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-[#52D6A4]/25 transition focus:ring-4"
              value={config.page_size}
              onChange={(event) =>
                patchConfig({
                  page_size: event.target.value as PdfLayoutConfig["page_size"],
                })
              }
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Orientacion</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-[#52D6A4]/25 transition focus:ring-4"
              value={config.orientation}
              onChange={(event) =>
                patchConfig({
                  orientation: event.target.value as PdfLayoutConfig["orientation"],
                })
              }
            >
              <option value="portrait">Vertical</option>
              <option value="landscape">Horizontal</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <input
              className="h-4 w-4 accent-[#2b3a44]"
              checked={config.show_header}
              type="checkbox"
              onChange={(event) => patchConfig({ show_header: event.target.checked })}
            />
            <span className="text-sm font-medium">Mostrar encabezado del documento</span>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#52D6A4]">
              Lienzo
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Editor visual del PDF</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["text", "field", "line", "box", "items-list", "signature", "image"] as ElementKind[]).map(
              (kind) => (
                <button
                  key={kind}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
                  type="button"
                  onClick={() => addElement(kind)}
                >
                  {kind === "items-list"
                    ? "Lista"
                    : kind === "signature"
                      ? "Firma"
                      : kind === "image"
                        ? "Imagen"
                      : kind === "box"
                        ? "Caja"
                        : kind === "line"
                          ? "Linea"
                          : kind === "field"
                            ? "Campo"
                            : "Texto"}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-slate-50"
              type="button"
              onClick={() => setZoom((current) => clamp(current - 0.1, 0.5, 2.5))}
            >
              -
            </button>
            <span className="min-w-16 text-center text-sm font-semibold text-slate-700">
              {zoomPercent}%
            </span>
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-slate-50"
              type="button"
              onClick={() => setZoom((current) => clamp(current + 0.1, 0.5, 2.5))}
            >
              +
            </button>
          </div>

          <input
            aria-label="Zoom del lienzo"
            className="min-w-56 flex-1 accent-[#2b3a44]"
            max={2.5}
            min={0.5}
            step={0.05}
            type="range"
            value={zoom}
            onChange={(event) => setZoom(clamp(Number(event.target.value), 0.5, 2.5))}
          />

          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
            type="button"
            onClick={() => setZoom(1)}
          >
            100%
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-3">
            <PdfLayoutCanvas
              className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(82,214,164,0.18),rgba(43,58,68,0.08))]"
              editable
              layoutConfig={config}
              onMoveElement={moveElement}
              onSelectElement={setSelectedElementId}
              runtime={runtime}
              zoom={zoom}
              selectedElementId={selectedElementId}
            />
            <p className="text-sm text-slate-500">
              Arrastra un elemento dentro de la pagina o edita su posicion desde el panel lateral.
            </p>
          </div>

          <aside className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#52D6A4]">
                  Inspector
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  {selectedElement ? getTitle(selectedElement) : "Sin seleccion"}
                </h3>
              </div>
              {selectedElement ? (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  {selectedElement.kind}
                </span>
              ) : null}
            </div>

            {selectedElement ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                    type="button"
                    onClick={duplicateSelectedElement}
                  >
                    Duplicar
                  </button>
                  <button
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                    type="button"
                    onClick={bringForward}
                  >
                    Adelante
                  </button>
                  <button
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                    type="button"
                    onClick={sendBackward}
                  >
                    Atrás
                  </button>
                  <button
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                    type="button"
                    onClick={deleteSelectedElement}
                  >
                    Borrar
                  </button>
                </div>

                <div className="grid gap-3">
                  <NumericField
                    label="X (mm)"
                    value={selectedElement.x}
                    min={0}
                    onChange={(value) => patchSelectedElement({ x: value })}
                  />
                  <NumericField
                    label="Y (mm)"
                    value={selectedElement.y}
                    min={0}
                    onChange={(value) => patchSelectedElement({ y: value })}
                  />
                  <NumericField
                    label="Ancho (mm)"
                    value={selectedElement.width}
                    min={1}
                    onChange={(value) => patchSelectedElement({ width: value })}
                  />
                  <NumericField
                    label="Alto (mm)"
                    value={selectedElement.height}
                    min={1}
                    onChange={(value) => patchSelectedElement({ height: value })}
                  />
                  <NumericField
                    label="Capa"
                    value={selectedElement.zIndex}
                    min={0}
                    onChange={(value) => patchSelectedElement({ zIndex: value })}
                  />
                </div>

                {selectedElement.kind === "text" ? (
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Texto
                      </span>
                      <textarea
                        className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.text}
                        onChange={(event) => patchSelectedElement({ text: event.target.value })}
                      />
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <ColorField
                        label="Color texto"
                        value={selectedElement.color}
                        onChange={(value) => patchSelectedElement({ color: value ?? "#111827" })}
                      />
                      <ColorField
                        label="Fondo"
                        value={selectedElement.backgroundColor}
                        onChange={(value) => patchSelectedElement({ backgroundColor: value })}
                      />
                    </div>
                    <ColorField
                      label="Borde"
                      value={selectedElement.borderColor}
                      onChange={(value) => patchSelectedElement({ borderColor: value })}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Alineacion horizontal
                        </span>
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                          value={selectedElement.align}
                          onChange={(event) =>
                            patchSelectedElement({
                              align: event.target.value as "left" | "center" | "right",
                            })
                          }
                        >
                          <option value="left">Izquierda</option>
                          <option value="center">Centro</option>
                          <option value="right">Derecha</option>
                        </select>
                      </label>
                      <NumericField
                        label="Tamaño"
                        value={selectedElement.fontSize}
                        min={6}
                        step={1}
                        onChange={(value) => patchSelectedElement({ fontSize: value })}
                      />
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Peso
                        </span>
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                          value={selectedElement.fontWeight}
                          onChange={(event) =>
                            patchSelectedElement({
                              fontWeight: Number(event.target.value) as
                                | 400
                                | 500
                                | 600
                                | 700
                                | 800,
                            })
                          }
                        >
                          <option value={400}>400</option>
                          <option value={500}>500</option>
                          <option value={600}>600</option>
                          <option value={700}>700</option>
                          <option value={800}>800</option>
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Alineacion vertical
                      </span>
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.verticalAlign}
                        onChange={(event) =>
                          patchSelectedElement({
                            verticalAlign: event.target.value as "top" | "middle" | "bottom",
                          })
                        }
                      >
                        <option value="top">Superior</option>
                        <option value="middle">Centro</option>
                        <option value="bottom">Inferior</option>
                      </select>
                    </label>
                  </div>
                ) : null}

                {selectedElement.kind === "field" ? (
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Campo
                      </span>
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.fieldKey}
                        onChange={(event) =>
                          patchSelectedElement({
                            fieldKey: event.target.value as PdfLayoutFieldKey,
                          })
                        }
                      >
                        <option value="origin">Origen</option>
                        <option value="destination">Destino</option>
                        <option value="date">Fecha</option>
                        <option value="registered_by">Registrado por</option>
                        <option value="transfer_number">Numero</option>
                        <option value="transfer_id">ID</option>
                        <option value="items_total">Items</option>
                        <option value="equipment_count">Equipos</option>
                        <option value="tool_count">Herramientas</option>
                        <option value="signed_by">Firmado por</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Etiqueta
                      </span>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.label ?? ""}
                        onChange={(event) =>
                          patchSelectedElement({
                            label: event.target.value.trim() ? event.target.value : null,
                          })
                        }
                      />
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        checked={selectedElement.showLabel}
                        type="checkbox"
                        onChange={(event) => patchSelectedElement({ showLabel: event.target.checked })}
                      />
                      <span className="text-sm font-medium">Mostrar etiqueta</span>
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <ColorField
                        label="Color etiqueta"
                        value={selectedElement.labelColor}
                        onChange={(value) =>
                          patchSelectedElement({ labelColor: value ?? "#6b7280" })
                        }
                      />
                      <ColorField
                        label="Color valor"
                        value={selectedElement.valueColor}
                        onChange={(value) =>
                          patchSelectedElement({ valueColor: value ?? "#111827" })
                        }
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <NumericField
                        label="Tamano etiqueta"
                        value={selectedElement.labelSize}
                        min={5}
                        step={0.5}
                        onChange={(value) => patchSelectedElement({ labelSize: value })}
                      />
                      <NumericField
                        label="Tamano valor"
                        value={selectedElement.valueSize}
                        min={6}
                        step={0.5}
                        onChange={(value) => patchSelectedElement({ valueSize: value })}
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <ColorField
                        label="Fondo"
                        value={selectedElement.backgroundColor}
                        onChange={(value) => patchSelectedElement({ backgroundColor: value })}
                      />
                      <ColorField
                        label="Borde"
                        value={selectedElement.borderColor}
                        onChange={(value) => patchSelectedElement({ borderColor: value })}
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Alineacion horizontal
                        </span>
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                          value={selectedElement.align}
                          onChange={(event) =>
                            patchSelectedElement({
                              align: event.target.value as "left" | "center" | "right",
                            })
                          }
                        >
                          <option value="left">Izquierda</option>
                          <option value="center">Centro</option>
                          <option value="right">Derecha</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Alineacion vertical
                        </span>
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                          value={selectedElement.verticalAlign}
                          onChange={(event) =>
                            patchSelectedElement({
                              verticalAlign: event.target.value as "top" | "middle" | "bottom",
                            })
                          }
                        >
                          <option value="top">Superior</option>
                          <option value="middle">Centro</option>
                          <option value="bottom">Inferior</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ) : null}

                {selectedElement.kind === "line" ? (
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <ColorField
                      label="Color"
                      value={selectedElement.color}
                      onChange={(value) => patchSelectedElement({ color: value ?? "#1f2937" })}
                    />
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Orientacion
                      </span>
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.orientation}
                        onChange={(event) =>
                          patchSelectedElement(
                            event.target.value === "vertical"
                              ? {
                                  orientation: "vertical",
                                  width: selectedElement.thickness,
                                  height: Math.max(selectedElement.width, selectedElement.height),
                                }
                              : {
                                  orientation: "horizontal",
                                  width: Math.max(selectedElement.width, selectedElement.height),
                                  height: selectedElement.thickness,
                                },
                          )
                        }
                      >
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                      </select>
                    </label>
                    <NumericField
                      label="Grosor"
                      value={selectedElement.thickness}
                      min={0.1}
                      step={0.1}
                      onChange={(value) =>
                        patchSelectedElement(
                          selectedElement.orientation === "vertical"
                            ? { thickness: value, width: value }
                            : { thickness: value, height: value },
                        )
                      }
                    />
                  </div>
                ) : null}

                {selectedElement.kind === "box" ? (
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <ColorField
                      label="Fondo"
                      value={selectedElement.backgroundColor}
                      onChange={(value) => patchSelectedElement({ backgroundColor: value ?? "#ffffff" })}
                    />
                    <ColorField
                      label="Borde"
                      value={selectedElement.borderColor}
                      onChange={(value) => patchSelectedElement({ borderColor: value ?? "#d1d5db" })}
                    />
                    <NumericField
                      label="Radio"
                      value={selectedElement.radius}
                      min={0}
                      step={0.1}
                      onChange={(value) => patchSelectedElement({ radius: value })}
                    />
                    <NumericField
                      label="Grosor borde"
                      value={selectedElement.borderWidth}
                      min={0}
                      step={0.1}
                      onChange={(value) => patchSelectedElement({ borderWidth: value })}
                    />
                  </div>
                ) : null}

                {selectedElement.kind === "items-list" ? (
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Titulo
                      </span>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.title}
                        onChange={(event) => patchSelectedElement({ title: event.target.value })}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <NumericField
                        label="Titulo"
                        value={selectedElement.titleSize}
                        min={6}
                        onChange={(value) => patchSelectedElement({ titleSize: value })}
                      />
                      <NumericField
                        label="Item"
                        value={selectedElement.itemSize}
                        min={6}
                        onChange={(value) => patchSelectedElement({ itemSize: value })}
                      />
                    </div>
                    <ColorField
                      label="Color titulo"
                      value={selectedElement.titleColor}
                      onChange={(value) => patchSelectedElement({ titleColor: value ?? "#111827" })}
                    />
                    <ColorField
                      label="Fondo"
                      value={selectedElement.backgroundColor}
                      onChange={(value) => patchSelectedElement({ backgroundColor: value ?? "#ffffff" })}
                    />
                    <ColorField
                      label="Borde"
                      value={selectedElement.borderColor}
                      onChange={(value) => patchSelectedElement({ borderColor: value ?? "#d1d5db" })}
                    />
                    <label className="flex items-center gap-3">
                      <input
                        checked={selectedElement.showQuantity}
                        type="checkbox"
                        onChange={(event) =>
                          patchSelectedElement({ showQuantity: event.target.checked })
                        }
                      />
                      <span className="text-sm font-medium">Mostrar cantidad</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        checked={selectedElement.showDescription}
                        type="checkbox"
                        onChange={(event) =>
                          patchSelectedElement({ showDescription: event.target.checked })
                        }
                      />
                      <span className="text-sm font-medium">Mostrar descripcion</span>
                    </label>
                  </div>
                ) : null}

                {selectedElement.kind === "signature" ? (
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Titulo
                      </span>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.title}
                        onChange={(event) => patchSelectedElement({ title: event.target.value })}
                      />
                    </label>
                    <ColorField
                      label="Color titulo"
                      value={selectedElement.titleColor}
                      onChange={(value) => patchSelectedElement({ titleColor: value ?? "#111827" })}
                    />
                    <ColorField
                      label="Fondo"
                      value={selectedElement.backgroundColor}
                      onChange={(value) => patchSelectedElement({ backgroundColor: value ?? "#ffffff" })}
                    />
                    <ColorField
                      label="Borde"
                      value={selectedElement.borderColor}
                      onChange={(value) => patchSelectedElement({ borderColor: value ?? "#d1d5db" })}
                    />
                    <label className="flex items-center gap-3">
                      <input
                        checked={selectedElement.showPlaceholder}
                        type="checkbox"
                        onChange={(event) =>
                          patchSelectedElement({ showPlaceholder: event.target.checked })
                        }
                      />
                      <span className="text-sm font-medium">Mostrar placeholder</span>
                    </label>
                  </div>
                ) : null}

                {selectedElement.kind === "image" ? (
                  <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      {selectedElement.source === "runtime" ? (
                        runtime.imageValues?.[selectedElement.sourceKey ?? "company_logo_url"] ? (
                          <Image
                            alt={selectedElement.alt}
                            className="h-24 w-full rounded-xl object-contain"
                            height={240}
                            src={
                              runtime.imageValues?.[selectedElement.sourceKey ?? "company_logo_url"] ??
                              ""
                            }
                            unoptimized
                            width={360}
                          />
                        ) : (
                          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                            Imagen runtime no disponible
                          </div>
                        )
                      ) : selectedElement.src?.trim() ? (
                        <Image
                          alt={selectedElement.alt}
                          className="h-24 w-full rounded-xl object-contain"
                          height={240}
                          src={selectedElement.src}
                          unoptimized
                          width={360}
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                          Define una URL para la imagen
                        </div>
                      )}
                    </div>

                    <ColorField
                      label="Fondo"
                      value={selectedElement.backgroundColor}
                      onChange={(value) => patchSelectedElement({ backgroundColor: value })}
                    />
                    <ColorField
                      label="Borde"
                      value={selectedElement.borderColor}
                      onChange={(value) => patchSelectedElement({ borderColor: value })}
                    />

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Fuente
                      </span>
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.source}
                        onChange={(event) =>
                          patchSelectedElement({
                            source: event.target.value as "static" | "runtime",
                            sourceKey:
                              event.target.value === "runtime"
                                ? "company_logo_url"
                                : null,
                            src:
                              event.target.value === "runtime"
                                ? null
                                : selectedElement.src ?? null,
                          })
                        }
                      >
                        <option value="runtime">Logo de la empresa</option>
                        <option value="static">URL personalizada</option>
                      </select>
                    </label>

                    {selectedElement.source === "runtime" ? (
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Clave runtime
                        </span>
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                          value={selectedElement.sourceKey ?? "company_logo_url"}
                          onChange={(event) =>
                            patchSelectedElement({
                              sourceKey: event.target.value as "company_logo_url",
                            })
                          }
                        >
                          <option value="company_logo_url">company_logo_url</option>
                        </select>
                      </label>
                    ) : (
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          URL de la imagen
                        </span>
                        <input
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                          placeholder="https://..."
                          value={selectedElement.src ?? ""}
                          onChange={(event) =>
                            patchSelectedElement({
                              src: event.target.value.trim() ? event.target.value : null,
                            })
                          }
                        />
                      </label>
                    )}

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Texto alternativo
                      </span>
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.alt}
                        onChange={(event) => patchSelectedElement({ alt: event.target.value })}
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Ajuste
                      </span>
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-[#52D6A4]/25 transition focus:ring-4"
                        value={selectedElement.fit}
                        onChange={(event) =>
                          patchSelectedElement({
                            fit: event.target.value as
                              | "contain"
                              | "cover"
                              | "fill"
                              | "scale-down",
                          })
                        }
                      >
                        <option value="contain">Contain</option>
                        <option value="cover">Cover</option>
                        <option value="fill">Fill</option>
                        <option value="scale-down">Scale down</option>
                      </select>
                    </label>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Selecciona un elemento para editar sus propiedades.
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#52D6A4]">
            Estado
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Vista previa</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Titulo", value: config.title },
            { label: "Pagina", value: `${config.page_size} / ${config.orientation}` },
            { label: "Elementos", value: String(elements.length) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <LayoutSectionsEditor
        initialOrder={config.section_order}
        initialVisibility={config.sections}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          El layout se guarda como un canvas editable, listo para mostrar texto, lineas, cajas y
          campos.
        </p>
        <button
          className="rounded-full bg-[#52D6A4] px-6 py-3 font-semibold text-slate-900 transition hover:bg-[#41c991]"
          type="submit"
        >
          Guardar layout
        </button>
      </div>
    </form>
  );
}

function getTitle(element: PdfLayoutCanvasElement) {
  switch (element.kind) {
    case "text":
      return "Texto";
    case "field":
      return `Campo: ${element.fieldKey}`;
    case "line":
      return "Linea";
    case "box":
      return "Caja";
    case "items-list":
      return "Lista de items";
    case "signature":
      return "Firma";
    case "image":
      return "Imagen";
  }
}

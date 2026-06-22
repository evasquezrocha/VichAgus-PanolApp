"use client";

import type { PdfLayoutSectionKey } from "@/types/pdf-layouts";
import { useState } from "react";

type LayoutSectionDefinition = {
  key: PdfLayoutSectionKey;
  label: string;
  description: string;
};

type LayoutSectionsEditorProps = {
  initialOrder?: PdfLayoutSectionKey[];
  initialVisibility: Record<PdfLayoutSectionKey, boolean>;
};

const SECTION_DEFINITIONS: LayoutSectionDefinition[] = [
  { key: "header", label: "Encabezado", description: "Título y subtítulo del documento." },
  { key: "summary", label: "Resumen", description: "Origen, destino, fecha y usuario." },
  { key: "items", label: "Detalle", description: "Listado de ítems del traspaso." },
  { key: "signature", label: "Firma", description: "Imagen de firma capturada." },
  { key: "metadata", label: "Metadatos", description: "Identificadores y trazabilidad." },
];

export function LayoutSectionsEditor({
  initialOrder,
  initialVisibility,
}: LayoutSectionsEditorProps) {
  const defaultOrder: PdfLayoutSectionKey[] = ["header", "summary", "items", "signature", "metadata"];
  const defaultVisibility: Record<PdfLayoutSectionKey, boolean> = {
    header: true,
    summary: true,
    items: true,
    signature: true,
    metadata: true,
  };
  const [order, setOrder] = useState<PdfLayoutSectionKey[]>(initialOrder ?? defaultOrder);
  const [visibility, setVisibility] = useState<Record<PdfLayoutSectionKey, boolean>>(
    initialVisibility ?? defaultVisibility,
  );
  const [draggedKey, setDraggedKey] = useState<PdfLayoutSectionKey | null>(null);

  function moveSection(from: PdfLayoutSectionKey, to: PdfLayoutSectionKey) {
    if (from === to) {
      return;
    }

    setOrder((current) => {
      const next = current.filter((item) => item !== from);
      const insertIndex = next.indexOf(to);
      next.splice(insertIndex >= 0 ? insertIndex : next.length, 0, from);
      return next;
    });
  }

  function toggleSection(key: PdfLayoutSectionKey) {
    setVisibility((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  const activeSections = order.filter((key) => visibility[key]);

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/70 p-5 md:p-6">
      <input name="section_order" type="hidden" value={order.join(",")} readOnly />
      {order.map((key) => (
        <input
          key={key}
          name={`section_${key}`}
          type="hidden"
          value={visibility[key] ? "true" : "false"}
          readOnly
        />
      ))}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          Estructura visual
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Bloques arrastrables</h2>
        <p className="mt-2 text-sm text-muted">
          Reordena los bloques y apaga los que no quieres que aparezcan en el PDF.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-3xl border border-dashed border-line bg-panel/30 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {order.map((key) => {
              const section = SECTION_DEFINITIONS.find((item) => item.key === key);
              if (!section) {
                return null;
              }

              const enabled = visibility[key];

              return (
                <article
                  key={key}
                  draggable
                  onDragStart={() => setDraggedKey(key)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedKey) {
                      moveSection(draggedKey, key);
                    }
                  }}
                  onDragEnd={() => setDraggedKey(null)}
                  className={[
                    "rounded-2xl border bg-white p-4 shadow-sm transition",
                    enabled ? "border-line" : "border-dashed border-line/70 opacity-60",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{section.label}</p>
                      <p className="mt-1 text-xs text-muted">{section.description}</p>
                    </div>
                    <span className="rounded-full border border-line px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {enabled ? "Visible" : "Oculto"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold transition hover:bg-panel"
                      onClick={() => toggleSection(key)}
                    >
                      {enabled ? "Ocultar" : "Mostrar"}
                    </button>
                    <span className="text-xs text-muted">Arrastra para cambiar el orden</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Vista de salida
          </p>
          <div className="mt-4 space-y-3">
            {activeSections.map((key, index) => {
              const section = SECTION_DEFINITIONS.find((item) => item.key === key);
              if (!section) {
                return null;
              }

              return (
                <div key={key} className="rounded-2xl border border-line bg-panel/20 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                    {index + 1}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{section.label}</p>
                </div>
              );
            })}
            {activeSections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-panel/20 p-4 text-sm text-muted">
                No hay bloques visibles.
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

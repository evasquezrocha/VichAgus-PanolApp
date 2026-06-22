"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
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
import { getPdfLayoutPageDimensions, type PdfLayoutRuntimeContext } from "@/lib/pdf-layouts";

type PdfLayoutCanvasProps = {
  layoutConfig: PdfLayoutConfig;
  runtime: PdfLayoutRuntimeContext;
  editable?: boolean;
  zoom?: number;
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string | null) => void;
  onMoveElement?: (elementId: string, nextX: number, nextY: number) => void;
  className?: string;
};

type DragState = {
  elementId: string;
  pointerId: number;
  originX: number;
  originY: number;
  elementX: number;
  elementY: number;
  scaleX: number;
  scaleY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getFieldValue(fieldKey: PdfLayoutFieldKey, runtime: PdfLayoutRuntimeContext) {
  return runtime.fieldValues[fieldKey] ?? "";
}

function renderFieldValue(fieldKey: PdfLayoutFieldKey, runtime: PdfLayoutRuntimeContext) {
  const value = getFieldValue(fieldKey, runtime);
  return value.trim() ? value : "Sin dato";
}

function getElementLabel(element: PdfLayoutCanvasElement) {
  switch (element.kind) {
    case "text":
      return "Texto";
    case "field":
      return "Campo";
    case "line":
      return "Linea";
    case "box":
      return "Caja";
    case "items-list":
      return "Lista";
    case "signature":
      return "Firma";
    case "image":
      return "Imagen";
  }
}

function getPositionStyle(element: PdfLayoutCanvasElement) {
  return {
    left: `${element.x}mm`,
    top: `${element.y}mm`,
    width: `${element.width}mm`,
    height: `${element.height}mm`,
    zIndex: element.zIndex,
    opacity: element.opacity ?? 1,
  } as const;
}

function CanvasText({ element }: { element: PdfLayoutTextElement }) {
  const justifyContent =
    element.verticalAlign === "middle"
      ? "center"
      : element.verticalAlign === "bottom"
        ? "flex-end"
        : "flex-start";

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{
        backgroundColor: element.backgroundColor ?? "transparent",
        borderColor: element.borderColor ?? "transparent",
        borderWidth: `${element.borderWidth ?? 0}mm`,
        borderStyle: element.borderWidth && element.borderWidth > 0 ? "solid" : "none",
        borderRadius: `${element.radius ?? 0}mm`,
        padding: `${element.padding ?? 0}mm`,
        color: element.color,
        fontSize: `${element.fontSize}pt`,
        fontWeight: element.fontWeight,
        textAlign: element.align,
        justifyContent,
        alignItems:
          element.align === "center"
            ? "center"
            : element.align === "right"
              ? "flex-end"
              : "flex-start",
        whiteSpace: "pre-wrap",
      }}
    >
      <div className="w-full" style={{ textAlign: element.align }}>
        {element.text}
      </div>
    </div>
  );
}

function CanvasField({
  element,
  runtime,
}: {
  element: PdfLayoutFieldElement;
  runtime: PdfLayoutRuntimeContext;
}) {
  const justifyContent =
    element.verticalAlign === "middle"
      ? "center"
      : element.verticalAlign === "bottom"
        ? "flex-end"
        : "flex-start";

  const alignItems =
    element.align === "center" ? "center" : element.align === "right" ? "flex-end" : "flex-start";

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{
        backgroundColor: element.backgroundColor ?? "transparent",
        borderColor: element.borderColor ?? "transparent",
        borderWidth: `${element.borderWidth ?? 0}mm`,
        borderStyle: element.borderWidth && element.borderWidth > 0 ? "solid" : "none",
        borderRadius: `${element.radius ?? 0}mm`,
        padding: `${element.padding ?? 0}mm`,
        justifyContent,
        alignItems,
        textAlign: element.align,
      }}
    >
      {element.showLabel ? (
        <span
          className="block w-full uppercase tracking-[0.18em]"
          style={{
            color: element.labelColor,
            fontSize: `${element.labelSize}pt`,
            lineHeight: 1.15,
          }}
        >
          {element.label ?? element.fieldKey}
        </span>
      ) : null}
      <span
        className="mt-1 block w-full font-medium"
        style={{
          color: element.valueColor,
          fontSize: `${element.valueSize}pt`,
          lineHeight: 1.15,
        }}
      >
        {renderFieldValue(element.fieldKey, runtime)}
      </span>
    </div>
  );
}

function CanvasLine({ element }: { element: PdfLayoutLineElement }) {
  return (
    <div
      className="h-full w-full"
      style={{
        backgroundColor: element.color,
        borderRadius: `${element.thickness / 2}mm`,
      }}
    />
  );
}

function CanvasBox({ element }: { element: PdfLayoutBoxElement }) {
  return (
    <div
      className="h-full w-full"
      style={{
        backgroundColor: element.backgroundColor,
        borderColor: element.borderColor,
        borderWidth: `${element.borderWidth}mm`,
        borderStyle: "solid",
        borderRadius: `${element.radius}mm`,
      }}
    />
  );
}

function CanvasItemsList({
  element,
  runtime,
}: {
  element: PdfLayoutItemsListElement;
  runtime: PdfLayoutRuntimeContext;
}) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{
        backgroundColor: element.backgroundColor,
        borderColor: element.borderColor,
        borderWidth: `${element.borderWidth}mm`,
        borderStyle: "solid",
        borderRadius: `${element.radius}mm`,
      }}
    >
      <div className="border-b border-inherit px-3 py-2">
        <p style={{ color: element.titleColor, fontSize: `${element.titleSize}pt`, fontWeight: 700 }}>
          {element.title}
        </p>
      </div>
      <div className="flex-1 overflow-hidden px-3 py-2">
        {runtime.items.length > 0 ? (
          <div className="space-y-2">
            {runtime.items.map((item, index) => (
              <div
                key={`${item.code}-${index}`}
                className="flex items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-2 last:border-b-0 last:pb-0"
                style={{ fontSize: `${element.itemSize}pt`, lineHeight: 1.2 }}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{item.code}</p>
                  {element.showDescription ? (
                    <p className="mt-0.5 text-slate-600">{item.description}</p>
                  ) : null}
                </div>
                {element.showQuantity ? (
                  <span className="shrink-0 rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold">
                    x{item.quantity}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Sin items para mostrar
          </div>
        )}
      </div>
    </div>
  );
}

function CanvasSignature({
  element,
  runtime,
}: {
  element: PdfLayoutSignatureElement;
  runtime: PdfLayoutRuntimeContext;
}) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{
        backgroundColor: element.backgroundColor,
        borderColor: element.borderColor,
        borderWidth: `${element.borderWidth}mm`,
        borderStyle: "solid",
        borderRadius: `${element.radius}mm`,
      }}
    >
      <div className="border-b border-inherit px-3 py-2">
        <p style={{ color: element.titleColor, fontSize: `${element.titleSize}pt`, fontWeight: 700 }}>
          {element.title}
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden p-3">
        {runtime.signatureData ? (
          <Image
            alt="Firma del traspaso"
            className="h-full w-full object-contain"
            height={480}
            src={runtime.signatureData}
            unoptimized
            width={1200}
          />
        ) : element.showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
            Sin firma registrada
          </div>
        ) : null}
      </div>
    </div>
  );
}

function resolveImageSource(element: PdfLayoutImageElement, runtime: PdfLayoutRuntimeContext) {
  if (element.source === "runtime") {
    if (element.sourceKey) {
      return runtime.imageValues?.[element.sourceKey] ?? null;
    }

    return null;
  }

  return element.src?.trim() ? element.src : null;
}

function CanvasImage({
  element,
  runtime,
}: {
  element: PdfLayoutImageElement;
  runtime: PdfLayoutRuntimeContext;
}) {
  const src = resolveImageSource(element, runtime);

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        backgroundColor: element.backgroundColor ?? "transparent",
        borderColor: element.borderColor ?? "transparent",
        borderWidth: `${element.borderWidth ?? 0}mm`,
        borderStyle: element.borderWidth && element.borderWidth > 0 ? "solid" : "none",
        borderRadius: `${element.radius ?? 0}mm`,
        padding: `${element.padding ?? 0}mm`,
      }}
    >
      {src ? (
        <Image
          alt={element.alt}
          className="h-full w-full"
          height={600}
          src={src}
          style={{ objectFit: element.fit }}
          unoptimized
          width={900}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
          {element.source === "runtime" ? "Imagen no disponible" : "Define una URL para la imagen"}
        </div>
      )}
    </div>
  );
}

export function PdfLayoutCanvas({
  layoutConfig,
  runtime,
  editable = false,
  zoom = 1,
  selectedElementId = null,
  onSelectElement,
  onMoveElement,
  className,
}: PdfLayoutCanvasProps) {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const pageDimensions = useMemo(
    () => getPdfLayoutPageDimensions(layoutConfig.page_size, layoutConfig.orientation),
    [layoutConfig.orientation, layoutConfig.page_size],
  );
  const clampedZoom = clamp(zoom, 0.5, 2.5);
  const scaledWidth = `${pageDimensions.widthMm * clampedZoom}mm`;
  const scaledHeight = `${pageDimensions.heightMm * clampedZoom}mm`;
  const canvas = layoutConfig.canvas;
  const elements = canvas?.elements ?? [];

  function updateElementPosition(elementId: string, nextX: number, nextY: number) {
    if (!onMoveElement) {
      return;
    }

    const element = elements.find((item) => item.id === elementId);
    if (!element) {
      return;
    }

    const maxX = Math.max(0, pageDimensions.widthMm - element.width);
    const maxY = Math.max(0, pageDimensions.heightMm - element.height);
    onMoveElement(elementId, clamp(nextX, 0, maxX), clamp(nextY, 0, maxY));
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>, element: PdfLayoutCanvasElement) {
    if (!editable || !onMoveElement || !pageRef.current || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onSelectElement?.(element.id);

    const rect = pageRef.current.getBoundingClientRect();
    dragStateRef.current = {
      elementId: element.id,
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      elementX: element.x,
      elementY: element.y,
      scaleX: pageDimensions.widthMm / rect.width,
      scaleY: pageDimensions.heightMm / rect.height,
    };
    setDraggingId(element.id);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function finishDrag() {
    dragStateRef.current = null;
    setDraggingId(null);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !onMoveElement) {
      return;
    }

    const deltaX = (event.clientX - dragState.originX) * dragState.scaleX;
    const deltaY = (event.clientY - dragState.originY) * dragState.scaleY;
    updateElementPosition(
      dragState.elementId,
      dragState.elementX + deltaX,
      dragState.elementY + deltaY,
    );
  }

  function renderElement(element: PdfLayoutCanvasElement) {
    const isSelected = selectedElementId === element.id;
    const isDragging = draggingId === element.id;

    const content = (() => {
      switch (element.kind) {
        case "text":
          return <CanvasText element={element} />;
        case "field":
          return <CanvasField element={element} runtime={runtime} />;
        case "line":
          return <CanvasLine element={element} />;
        case "box":
          return <CanvasBox element={element} />;
        case "items-list":
          return <CanvasItemsList element={element} runtime={runtime} />;
        case "signature":
          return <CanvasSignature element={element} runtime={runtime} />;
        case "image":
          return <CanvasImage element={element} runtime={runtime} />;
      }
    })();

    if (element.kind === "line") {
      const lineStyle =
        element.orientation === "vertical"
          ? {
              ...getPositionStyle(element),
              width: `${element.thickness}mm`,
              height: `${element.height}mm`,
            }
          : {
              ...getPositionStyle(element),
              width: `${element.width}mm`,
              height: `${element.thickness}mm`,
            };

      return (
        <div
          key={element.id}
          className={[
            "absolute",
            editable ? "cursor-move" : "pointer-events-none",
            isSelected ? "ring-2 ring-[#52D6A4] ring-offset-2" : "",
            isDragging ? "opacity-80" : "",
          ].join(" ")}
          style={lineStyle}
          onPointerDown={(event) => beginDrag(event, element)}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onClick={(event) => {
            event.stopPropagation();
            onSelectElement?.(element.id);
          }}
        >
          {content}
          {editable ? (
            <span className="pointer-events-none absolute -top-6 left-0 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow">
              {getElementLabel(element)}
            </span>
          ) : null}
        </div>
      );
    }

    return (
      <div
        key={element.id}
        className={[
          "absolute overflow-hidden",
          editable ? "cursor-move" : "pointer-events-none",
          isSelected ? "ring-2 ring-[#52D6A4] ring-offset-2" : "",
          isDragging ? "opacity-80" : "",
        ].join(" ")}
        style={getPositionStyle(element)}
        onPointerDown={(event) => beginDrag(event, element)}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClick={(event) => {
          event.stopPropagation();
          onSelectElement?.(element.id);
        }}
      >
        {content}
        {editable ? (
          <span className="pointer-events-none absolute -top-6 left-0 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow">
            {getElementLabel(element)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-auto print:overflow-visible">
        <div className="flex min-h-full justify-center p-4 print:block print:p-0">
          <div className="relative print:block" style={{ width: scaledWidth, height: scaledHeight }}>
        {canvas?.showGrid ? (
          <div
            className="pointer-events-none absolute inset-0 rounded-[2rem] print:hidden"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
              backgroundSize: `${canvas.gridSizeMm}mm ${canvas.gridSizeMm}mm`,
            }}
          />
        ) : null}

        <div
          ref={pageRef}
          className="relative origin-top-left overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none"
          onPointerDown={() => onSelectElement?.(null)}
          style={{
            width: `${pageDimensions.widthMm}mm`,
            height: `${pageDimensions.heightMm}mm`,
            backgroundColor: canvas?.backgroundColor ?? "#ffffff",
            transform: `scale(${clampedZoom})`,
          }}
        >
          {elements.map((element) => renderElement(element))}

          {editable && elements.length === 0 ? (
            <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
              No hay elementos en este layout.
            </div>
          ) : null}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

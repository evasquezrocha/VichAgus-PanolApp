"use client";

import {
  createAssetDocumentAction,
  deleteAssetDocumentAction,
  updateAssetAction,
  updateAssetDocumentAction,
} from "@/actions/activos.actions";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toQR } from "toqr";

import { buildAssetYearSuggestions, formatAssetNumericValue } from "@/lib/activos";
import type {
  Asset,
  AssetCatalogFieldKey,
  AssetDocumentFilter,
  AssetDocumentCategory,
  AssetDocument,
  AssetDocumentType,
} from "@/types/activos";
import type { InputHTMLAttributes } from "react";

type ActivoFichaContentProps = {
  asset: Asset | null;
  backHref: string;
  catalogOptions: Record<AssetCatalogFieldKey, string[]>;
  documentCategories: AssetDocumentCategory[];
  documentTypes: AssetDocumentType[];
  documents: AssetDocument[];
  initialTab?: AssetTabKey;
};

type AssetTabKey = "informacion" | "documentacion";
type AssetModalState = { mode: "edit" } | null;
type DocumentModalState = { mode: "create" } | { mode: "edit"; document: AssetDocument } | null;

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        "rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition",
        active ? "bg-accent text-white shadow-sm" : "bg-panel/40 text-foreground hover:bg-panel",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
    </svg>
  );
}

function getDaysUntil(dateString: string | null) {
  if (!dateString) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = new Date(`${dateString}T00:00:00`);
  return Math.round((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function buildQrSvg(targetUrl: string) {
  const matrix = toQR(targetUrl);
  const size = Math.sqrt(matrix.length);
  const margin = 4;
  const viewBoxSize = size + margin * 2;
  const rects: string[] = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (matrix[row * size + col]) {
        rects.push(`<rect x="${col + margin}" y="${row + margin}" width="1" height="1" />`);
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="#fff" />
<g fill="#111">${rects.join("")}</g>
</svg>`;
}

function getPublicAppBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

function downloadTextFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(href);
  }, 1000);
}

function AssetInput({
  label,
  id,
  name,
  defaultValue,
  required = false,
  placeholder,
  listId,
  suggestions,
  helperText,
  uppercase = false,
  inputMode,
  maxLength,
  type = "text",
}: {
  label: string;
  id?: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  listId?: string;
  suggestions?: string[];
  helperText?: string;
  uppercase?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className={[
          "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4",
          uppercase ? "uppercase" : "",
        ].join(" ")}
        defaultValue={defaultValue}
        inputMode={inputMode}
        id={id}
        list={listId}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {helperText ? <p className="mt-2 text-xs text-muted">{helperText}</p> : null}
      {listId && suggestions ? (
        <datalist id={listId}>
          {Array.from(new Set(suggestions.filter(Boolean))).map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ) : null}
    </label>
  );
}

function AssetSelect({
  label,
  name,
  defaultValue,
  options,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
        defaultValue={defaultValue}
        name={name}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ActivoFichaContent({
  asset,
  backHref,
  catalogOptions,
  documentCategories,
  documentTypes,
  documents,
  initialTab = "informacion",
}: ActivoFichaContentProps) {
  const [activeTab, setActiveTab] = useState<AssetTabKey>(initialTab);
  const [assetModalState, setAssetModalState] = useState<AssetModalState>(null);
  const [documentModalState, setDocumentModalState] = useState<DocumentModalState>(null);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [documentExpiryFilter, setDocumentExpiryFilter] =
    useState<AssetDocumentFilter>("all");
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const documentDialogRef = useRef<HTMLDialogElement | null>(null);
  const yearSuggestions = useMemo(
    () => buildAssetYearSuggestions(catalogOptions.anio),
    [catalogOptions.anio],
  );
  const documentTypeSuggestions = useMemo(
    () => documentTypes.map((documentType) => documentType.name),
    [documentTypes],
  );
  const filteredDocuments = useMemo(() => {
    const now = new Date();

    return documents.filter((document) => {
      const matchesType =
        documentTypeFilter === "all" || document.document_type?.name === documentTypeFilter;

      const matchesExpiry =
        documentExpiryFilter === "all"
          ? true
          : documentExpiryFilter === "with-expiration"
            ? Boolean(document.expiration_date)
            : documentExpiryFilter === "without-expiration"
              ? !document.expiration_date
              : document.expiration_date
                ? new Date(`${document.expiration_date}T00:00:00`) < now
                : false;

      return matchesType && matchesExpiry;
    });
  }, [documentExpiryFilter, documentTypeFilter, documents]);
  const groupedDocuments = useMemo(() => {
    return filteredDocuments.reduce<Record<string, AssetDocument[]>>((groups, document) => {
      const key = document.category.trim() || "Sin categoria";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(document);
      return groups;
    }, {});
  }, [filteredDocuments]);
  const documentStats = useMemo(() => {
    const expired = documents.filter((document) => {
      if (!document.expiration_date) {
        return false;
      }
      const days = getDaysUntil(document.expiration_date);
      return days !== null && days < 0;
    }).length;
    const expiringSoon = documents.filter((document) => {
      if (!document.expiration_date) {
        return false;
      }
      const days = getDaysUntil(document.expiration_date);
      return days !== null && days >= 0 && days <= document.notice_days;
    }).length;
    const withoutExpiration = documents.filter((document) => !document.expiration_date).length;

    return { expired, expiringSoon, withoutExpiration };
  }, [documents]);
  const activeDocument =
    documentModalState && documentModalState.mode === "edit" ? documentModalState.document : null;
  const documentFormAction =
    documentModalState && documentModalState.mode === "edit"
      ? updateAssetDocumentAction
      : createAssetDocumentAction;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (assetModalState && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!assetModalState && dialog.open) {
      dialog.close();
    }
  }, [assetModalState]);

  useEffect(() => {
    const dialog = documentDialogRef.current;

    if (!dialog) {
      return;
    }

    if (documentModalState && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!documentModalState && dialog.open) {
      dialog.close();
    }
  }, [documentModalState]);

  function openAssetModal() {
    setAssetModalState({ mode: "edit" });
  }

  function closeAssetModal() {
    setAssetModalState(null);
  }

  function openDocumentModal() {
    setDocumentModalState({ mode: "create" });
  }

  function openEditDocumentModal(document: AssetDocument) {
    setDocumentModalState({ mode: "edit", document });
  }

  function closeDocumentModal() {
    setDocumentModalState(null);
  }

  function downloadAssetQr() {
    if (!asset) {
      return;
    }

    const targetUrl = `${getPublicAppBaseUrl()}/qr/activos/${asset.id}`;
    const svg = buildQrSvg(targetUrl);
    downloadTextFile(svg, `qr-activo-${asset.af}.svg`, "image/svg+xml");
  }

  if (!asset) {
    return (
      <section className="rounded-[2rem] border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Ficha de activo
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              No hay un activo seleccionado
            </h2>
            <p className="mt-2 text-sm text-muted">
              Selecciona una fila del listado para ver el detalle del activo.
            </p>
          </div>

          <Link
            href={backHref}
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
          >
            Volver al listado
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Ficha de activo
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {asset.af} - {asset.tipo} {asset.marca} - {asset.patente}
          </h2>
          <p className="mt-2 text-sm text-muted">{asset.modelo}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={backHref}
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
          >
            Volver al listado
          </Link>

          <button
            aria-label="Editar activo"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-strong"
            onClick={openAssetModal}
            title="Editar activo"
            type="button"
          >
            <EditIcon />
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-line bg-white p-4">
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "informacion"}
            onClick={() => setActiveTab("informacion")}
          >
            INFORMACIÓN
          </TabButton>
          <TabButton
            active={activeTab === "documentacion"}
            onClick={() => setActiveTab("documentacion")}
          >
            DOCUMENTACIÓN
          </TabButton>
        </div>
      </div>

      {activeTab === "informacion" ? (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[2rem] border border-line bg-white p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="AF" value={asset.af} />
                <InfoCard label="Patente" value={asset.patente} />
                <InfoCard label="Tipo" value={asset.tipo} />
                <InfoCard label="Marca" value={asset.marca} />
                <InfoCard label="Modelo" value={asset.modelo} />
                <InfoCard label="AÑO" value={asset.anio} />
                <InfoCard label="Centro de Costos" value={asset.centro_costos} />
                <InfoCard label="ID GPS" value={asset.id_gps ?? "-"} />
                <InfoCard label="Horometro" value={formatAssetNumericValue(asset.horometro)} />
                <InfoCard
                  label="Kilometraje"
                  value={formatAssetNumericValue(asset.kilometraje)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <section className="rounded-[2rem] border border-line bg-white p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                    Imagen
                  </p>
                </div>

                <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-line bg-panel/20">
                  {asset.image_url ? (
                    <Image
                      alt={asset.af}
                      className="h-auto w-full object-contain"
                      height={1200}
                      src={asset.image_url}
                      unoptimized
                      width={1600}
                    />
                  ) : (
                    <div className="flex min-h-[20rem] items-center justify-center px-6 py-10 text-center text-sm text-muted">
                      Este activo no tiene imagen cargada.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <section className="rounded-[2rem] border border-line bg-white p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Ubicación
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Mapa del activo</h3>
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-line bg-panel/20">
              <div className="flex min-h-[20rem] items-center justify-center px-6 py-10 text-center text-sm text-muted">
                No hay coordenadas de ubicación para mostrar un mapa del activo.
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="rounded-[2rem] border border-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Documentación
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Archivos y respaldo del activo
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
                onClick={openDocumentModal}
                type="button"
              >
                <UploadIcon />
                Subir documento
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
                onClick={downloadAssetQr}
                type="button"
              >
                <QrIcon />
                Descargar QR
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Expirados</p>
              <p className="mt-2 text-2xl font-semibold">{documentStats.expired}</p>
            </div>
            <div className="rounded-2xl border border-line bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Por vencer</p>
              <p className="mt-2 text-2xl font-semibold">{documentStats.expiringSoon}</p>
            </div>
            <div className="rounded-2xl border border-line bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Sin vencimiento</p>
              <p className="mt-2 text-2xl font-semibold">{documentStats.withoutExpiration}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Filtrar por tipo</span>
              <select
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                value={documentTypeFilter}
                onChange={(event) => setDocumentTypeFilter(event.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {documentTypes.map((documentType) => (
                  <option key={documentType.id} value={documentType.name}>
                    {documentType.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Filtrar por vencimiento</span>
              <select
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                value={documentExpiryFilter}
                onChange={(event) =>
                  setDocumentExpiryFilter(event.target.value as AssetDocumentFilter)
                }
              >
                <option value="all">Todos</option>
                <option value="with-expiration">Con vencimiento</option>
                <option value="expired">Vencidos</option>
                <option value="without-expiration">Sin vencimiento</option>
              </select>
            </label>
          </div>

          {filteredDocuments.length > 0 ? (
            <div className="mt-4 space-y-5">
              {Object.entries(groupedDocuments).map(([category, categoryDocuments]) => (
                <section key={category} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-lg font-semibold tracking-tight">{category}</h4>
                    <span className="rounded-full bg-panel px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {categoryDocuments.length} archivos
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {categoryDocuments.map((document) => {
                      const daysUntilExpiration = getDaysUntil(document.expiration_date);
                      const isExpiringSoon =
                        daysUntilExpiration !== null &&
                        daysUntilExpiration >= 0 &&
                        daysUntilExpiration <= document.notice_days;

                      return (
                        <article
                          key={document.id}
                          className="overflow-hidden rounded-[1.5rem] border border-line bg-panel/20"
                        >
                          <div className="p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {document.document_type?.name ?? "Documento"}
                                </p>
                                <p className="mt-1 text-sm text-muted">{document.category}</p>
                              </div>

                              <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                                <span
                                  className={[
                                    "rounded-full px-3 py-1",
                                    document.visible_qr
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-neutral-200 text-neutral-700",
                                  ].join(" ")}
                                >
                                  {document.visible_qr ? "Visible QR" : "No visible QR"}
                                </span>
                                {document.expiration_date ? (
                                  <span
                                    className={[
                                      "rounded-full px-3 py-1",
                                      daysUntilExpiration !== null && daysUntilExpiration < 0
                                        ? "bg-red-100 text-red-700"
                                        : isExpiringSoon
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-blue-100 text-blue-700",
                                    ].join(" ")}
                                  >
                                    {daysUntilExpiration !== null && daysUntilExpiration < 0
                                      ? `Vencido hace ${Math.abs(daysUntilExpiration)} dias`
                                      : daysUntilExpiration === 0
                                        ? "Vence hoy"
                                        : daysUntilExpiration === 1
                                          ? "Vence manana"
                                          : `Vence ${document.expiration_date}`}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-panel px-3 py-1 text-muted">
                                    Sin vencimiento
                                  </span>
                                )}
                                <span className="rounded-full bg-panel px-3 py-1 text-muted">
                                  Aviso {document.notice_days} dias
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                              <div className="text-muted">
                                Archivo:{" "}
                                <span className="font-medium text-foreground">{document.file_name}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="rounded-full border border-line bg-white px-4 py-2 font-semibold text-foreground transition hover:bg-panel"
                                  onClick={() => openEditDocumentModal(document)}
                                  type="button"
                                >
                                  Editar
                                </button>
                                <a
                                  className="rounded-full border border-line bg-white px-4 py-2 font-semibold text-foreground transition hover:bg-panel"
                                  href={document.file_url}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  Ver
                                </a>
                                <a
                                  className="rounded-full border border-line bg-white px-4 py-2 font-semibold text-foreground transition hover:bg-panel"
                                  download={document.file_name}
                                  href={document.file_url}
                                >
                                  Descargar
                                </a>
                                <form
                                  action={deleteAssetDocumentAction}
                                  onSubmit={(event) => {
                                    if (
                                      !window.confirm(
                                        `Eliminar el documento "${document.document_type?.name ?? document.file_name}"?`,
                                      )
                                    ) {
                                      event.preventDefault();
                                    }
                                  }}
                                >
                                  <input name="asset_id" type="hidden" value={asset.id} />
                                  <input name="document_id" type="hidden" value={document.id} />
                                  <button
                                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100"
                                    type="submit"
                                  >
                                    Eliminar
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[1.5rem] border border-dashed border-line/80 bg-panel/20 p-6 text-sm text-muted">
              No hay documentos que coincidan con los filtros actuales.
            </div>
          )}
        </section>
      )}
      <dialog
        ref={documentDialogRef}
        className="company-popup-surface fixed left-1/2 top-1/2 z-50 m-0 max-h-[calc(100vh-2rem)] w-[min(56rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-line p-0 shadow-2xl shadow-black/25 backdrop:bg-black/50"
        onCancel={closeDocumentModal}
        onClose={closeDocumentModal}
      >
        <form
          action={documentFormAction}
          encType="multipart/form-data"
          key={`${asset.id}-document-${activeDocument?.id ?? "new"}`}
          className="p-6 md:p-8"
        >
          <input name="asset_id" type="hidden" value={asset.id} />
          {activeDocument ? <input name="document_id" type="hidden" value={activeDocument.id} /> : null}

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Ficha de activo
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                {activeDocument ? "Editar documento" : "Subir documento"}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {activeDocument
                  ? "Actualiza los metadatos o reemplaza el archivo del documento."
                  : "Registra respaldo y deja disponible el tipo para futuros documentos."}
              </p>
            </div>
            <button
              aria-label="Cerrar formulario"
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-panel"
              onClick={closeDocumentModal}
              type="button"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <AssetInput
              helperText="Selecciona un tipo existente o escribe uno nuevo."
              label="Tipo de Documento"
              listId="asset-document-type-options"
              name="document_type"
              required
              defaultValue={activeDocument?.document_type?.name ?? ""}
              suggestions={documentTypeSuggestions}
            />
            <label className="block">
              <span className="text-sm font-medium">Categoría</span>
              <select
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                defaultValue={activeDocument?.category ?? ""}
                name="category"
                required
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {documentCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted">
                Solo puedes usar categorías creadas en Ajustes &gt; Documentación.
              </p>
            </label>
            <AssetSelect
              defaultValue={activeDocument?.visible_qr ? "true" : "false"}
              label="Visible QR"
              name="visible_qr"
              options={[
                { label: "No", value: "false" },
                { label: "Sí", value: "true" },
              ]}
              required
            />
            <AssetInput
              label="Fecha de Vencimiento (Opcional)"
              name="expiration_date"
              type="date"
              defaultValue={activeDocument?.expiration_date ?? ""}
            />
            <AssetInput
              inputMode="numeric"
              label="Aviso Previo (Días)"
              name="notice_days"
              defaultValue={activeDocument?.notice_days.toString() ?? "0"}
              placeholder="0"
              required
              type="number"
            />
            <label className="block md:col-span-2">
              <span className="text-sm font-medium">Archivo</span>
              {activeDocument ? (
                <p className="mt-2 text-xs text-muted">
                  Si dejas este campo vacío, se mantiene el archivo actual.
                </p>
              ) : null}
              <input
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,application/pdf,image/*"
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-4"
                name="document_file"
                type="file"
                required={!activeDocument}
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel"
              onClick={closeDocumentModal}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
              type="submit"
            >
              Guardar documento
            </button>
          </div>
        </form>
      </dialog>

      <dialog
        ref={dialogRef}
        className="company-popup-surface fixed left-1/2 top-1/2 z-50 m-0 max-h-[calc(100vh-2rem)] w-[min(56rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-line p-0 shadow-2xl shadow-black/25 backdrop:bg-black/50"
        onCancel={closeAssetModal}
        onClose={closeAssetModal}
      >
        <form
          action={updateAssetAction}
          encType="multipart/form-data"
          key={asset.id}
          className="p-6 md:p-8"
        >
          <input name="asset_id" type="hidden" value={asset.id} />
          <input name="current_image_url" type="hidden" value={asset.image_url ?? ""} />
          <input
            name="current_image_storage_path"
            type="hidden"
            value={asset.image_storage_path ?? ""}
          />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Ficha de activo
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Editar activo
              </h3>
              <p className="mt-2 text-sm text-muted">
                Actualiza los datos del activo desde esta misma ficha.
              </p>
            </div>
            <button
              aria-label="Cerrar formulario"
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-panel"
              onClick={closeAssetModal}
              type="button"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <AssetInput label="AF" name="af" defaultValue={asset.af} required uppercase />
            <AssetInput
              label="Patente"
              name="patente"
              defaultValue={asset.patente}
              required
              uppercase
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva."
              label="Tipo"
              listId="asset-edit-tipo-options"
              name="tipo"
              defaultValue={asset.tipo}
              required
              suggestions={catalogOptions.tipo}
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva."
              label="Marca"
              listId="asset-edit-marca-options"
              name="marca"
              defaultValue={asset.marca}
              required
              suggestions={catalogOptions.marca}
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva."
              label="Modelo"
              listId="asset-edit-modelo-options"
              name="modelo"
              defaultValue={asset.modelo}
              required
              suggestions={catalogOptions.modelo}
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva."
              label="Año"
              listId="asset-edit-anio-options"
              name="anio"
              defaultValue={asset.anio}
              required
              suggestions={yearSuggestions}
              inputMode="numeric"
              maxLength={4}
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva."
              label="Centro de Costos"
              listId="asset-edit-centro-costos-options"
              name="centro_costos"
              defaultValue={asset.centro_costos}
              required
              suggestions={catalogOptions.centro_costos}
            />
            <AssetInput label="ID GPS" name="id_gps" defaultValue={asset.id_gps ?? ""} />
            <AssetInput
              label="Horometro"
              name="horometro"
              defaultValue={asset.horometro?.toString() ?? ""}
              inputMode="decimal"
              placeholder="0"
              type="number"
            />
            <AssetInput
              label="Kilometraje"
              name="kilometraje"
              defaultValue={asset.kilometraje?.toString() ?? ""}
              inputMode="decimal"
              placeholder="0"
              type="number"
            />
            <label className="block md:col-span-2">
              <span className="text-sm font-medium">Imagen</span>
              <input
                accept="image/*"
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white focus:ring-4"
                name="image_file"
                type="file"
              />
            </label>
          </div>

          {asset.image_url ? (
            <div className="mt-4 rounded-2xl border border-line bg-panel p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Imagen actual
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Image
                  alt={asset.af}
                  className="h-16 w-16 rounded-xl border border-line object-cover"
                  height={64}
                  src={asset.image_url}
                  unoptimized
                  width={64}
                />
                <div className="text-sm text-muted">
                  Si subes una nueva imagen, reemplazara la actual.
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel"
              onClick={closeAssetModal}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
              type="submit"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}





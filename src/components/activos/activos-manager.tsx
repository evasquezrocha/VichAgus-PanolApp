"use client";

import { createAssetAction } from "@/actions/activos.actions";
import { PendingButton } from "@/components/ui/pending-button";
import { buildAssetYearSuggestions, formatAssetNumericValue } from "@/lib/activos";
import type { Asset, AssetCatalogFieldKey } from "@/types/activos";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { InputHTMLAttributes } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type AssetCatalogOptions = Record<AssetCatalogFieldKey, string[]>;

type ActivosManagerProps = {
  assets: Asset[];
  catalogOptions: AssetCatalogOptions;
};

type AssetModalState = { mode: "create" } | null;

type SortKey =
  | "af"
  | "patente"
  | "tipo"
  | "marca"
  | "modelo"
  | "anio"
  | "centro_costos"
  | "id_gps"
  | "horometro"
  | "kilometraje"
  | "image";

type SortDirection = "asc" | "desc";

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <span className="ml-1 inline-flex flex-col leading-none text-[9px] opacity-70">
      <span className={direction === "asc" ? "text-foreground" : ""}>^</span>
      <span className={direction === "desc" ? "text-foreground" : ""}>v</span>
    </span>
  );
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function AssetInput({
  label,
  name,
  required = false,
  placeholder,
  listId,
  suggestions,
  helperText,
  uppercase = false,
  inputMode,
  maxLength,
  pattern,
  step,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  listId?: string;
  suggestions?: string[];
  helperText?: string;
  uppercase?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  pattern?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className={[
          "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4",
          uppercase ? "uppercase" : "",
        ].join(" ")}
        inputMode={inputMode}
        list={listId}
        name={name}
        maxLength={maxLength}
        pattern={pattern}
        placeholder={placeholder}
        required={required}
        step={step}
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

export function ActivosManager({ assets, catalogOptions }: ActivosManagerProps) {
  const router = useRouter();
  const [assetModalState, setAssetModalState] = useState<AssetModalState>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("af");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const dialogRef = useRef<HTMLDialogElement | null>(null);

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

  const normalizedSearch = stripAccents(search.trim().toLowerCase());

  const filteredAssets = useMemo(() => {
    if (!normalizedSearch) {
      return assets;
    }

    return assets.filter((asset) => {
      const haystack = stripAccents(
        [
          asset.af,
          asset.patente,
          asset.tipo,
          asset.marca,
          asset.modelo,
          asset.anio,
          asset.centro_costos,
          asset.id_gps ?? "",
          asset.horometro?.toString() ?? "",
          asset.kilometraje?.toString() ?? "",
          asset.image_url ? "con imagen" : "sin imagen",
        ]
          .join(" ")
          .toLowerCase(),
      );

      return haystack.includes(normalizedSearch);
    });
  }, [assets, normalizedSearch]);

  const sortedAssets = useMemo(() => {
    const getComparableValue = (asset: Asset) => {
      switch (sortKey) {
        case "af":
          return asset.af;
        case "patente":
          return asset.patente;
        case "tipo":
          return asset.tipo;
        case "marca":
          return asset.marca;
        case "modelo":
          return asset.modelo;
        case "anio":
          return Number.parseInt(asset.anio, 10);
        case "centro_costos":
          return asset.centro_costos;
        case "id_gps":
          return asset.id_gps ?? "";
        case "horometro":
          return asset.horometro ?? Number.POSITIVE_INFINITY;
        case "kilometraje":
          return asset.kilometraje ?? Number.POSITIVE_INFINITY;
        case "image":
          return asset.image_url ? 1 : 0;
      }
    };

    const sorted = [...filteredAssets].sort((left, right) => {
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
  }, [filteredAssets, sortDirection, sortKey]);

  const yearSuggestions = useMemo(
    () => buildAssetYearSuggestions(catalogOptions.anio),
    [catalogOptions.anio],
  );

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

  function openCreateAssetModal() {
    setAssetModalState({ mode: "create" });
  }

  function closeAssetModal() {
    setAssetModalState(null);
  }

  const tableMinWidth = 1240;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Activos
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Listado de activos</h1>
          <p className="mt-2 text-sm text-muted">
            {filteredAssets.length} activo{filteredAssets.length === 1 ? "" : "s"} visible
            {filteredAssets.length === 1 ? "" : "s"} de {assets.length}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="block">
            <span className="sr-only">Buscar activo</span>
            <input
              className="w-full rounded-full border border-line bg-white px-4 py-3 text-sm outline-none ring-accent/25 transition focus:ring-4 sm:w-[20rem]"
              placeholder="Buscar por AF, patente, tipo, marca, modelo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <button
            className="rounded-full bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong"
            onClick={openCreateAssetModal}
            type="button"
          >
            Nuevo Activo
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-[1.75rem] border border-line bg-white/55 p-4 md:p-5">
        <table
          className="w-full border-collapse text-[12px]"
          style={{ minWidth: `${tableMinWidth}px` }}
        >
          <colgroup>
            <col className="w-28" />
            <col className="w-32" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-40" />
            <col className="w-24" />
            <col className="w-44" />
            <col className="w-32" />
          </colgroup>
          <thead>
            <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.2em] text-muted">
              <th className="pb-2 pr-2 font-semibold">
                <button
                  className="inline-flex items-center font-semibold"
                  onClick={() => toggleSort("af")}
                  type="button"
                >
                  AF
                  <SortIcon direction={getSortDirectionForKey("af")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button
                  className="inline-flex items-center font-semibold"
                  onClick={() => toggleSort("patente")}
                  type="button"
                >
                  Patente
                  <SortIcon direction={getSortDirectionForKey("patente")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button
                  className="inline-flex items-center font-semibold"
                  onClick={() => toggleSort("tipo")}
                  type="button"
                >
                  Tipo
                  <SortIcon direction={getSortDirectionForKey("tipo")} />
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
              <th className="pb-2 pr-2 font-semibold">
                <button
                  className="inline-flex items-center font-semibold"
                  onClick={() => toggleSort("anio")}
                  type="button"
                >
                  Año
                  <SortIcon direction={getSortDirectionForKey("anio")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button
                  className="inline-flex items-center font-semibold"
                  onClick={() => toggleSort("centro_costos")}
                  type="button"
                >
                  Centro de Costos
                  <SortIcon direction={getSortDirectionForKey("centro_costos")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button
                  className="inline-flex items-center font-semibold"
                  onClick={() => toggleSort("image")}
                  type="button"
                >
                  Imagen
                  <SortIcon direction={getSortDirectionForKey("image")} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((asset) => (
              <tr
                key={asset.id}
                className="cursor-pointer border-b border-line/60 align-top transition hover:bg-panel/40"
                onClick={() => router.push(`/company/activos/${asset.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/company/activos/${asset.id}`);
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <td className="py-3 pr-2 align-middle font-semibold text-foreground">
                  {asset.af}
                </td>
                <td className="py-3 pr-2 align-middle text-muted">{asset.patente}</td>
                <td className="py-3 pr-2 align-middle text-muted">{asset.tipo}</td>
                <td className="py-3 pr-2 align-middle text-muted">{asset.marca}</td>
                <td className="py-3 pr-2 align-middle text-muted">{asset.modelo}</td>
                <td className="py-3 pr-2 align-middle text-muted">{asset.anio}</td>
                <td className="py-3 pr-2 align-middle text-muted">{asset.centro_costos}</td>
                <td className="py-3 pr-2 align-middle text-muted">
                  {asset.image_url ? (
                    <div className="flex items-center gap-2">
                      <Image
                        alt={asset.af}
                        className="h-10 w-10 rounded-lg border border-line object-cover"
                        height={40}
                        src={asset.image_url}
                        unoptimized
                        width={40}
                      />
                      <span className="text-[11px] font-medium text-foreground">Disponible</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}

            {sortedAssets.length === 0 ? (
              <tr>
                <td className="py-10 text-center text-muted" colSpan={8}>
                  No hay activos que coincidan con la busqueda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dialogRef}
        className="company-popup-surface fixed left-1/2 top-1/2 z-50 m-0 max-h-[calc(100vh-2rem)] w-[min(56rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-line p-0 shadow-2xl shadow-black/25 backdrop:bg-black/50"
        onCancel={closeAssetModal}
        onClose={closeAssetModal}
      >
        <form action={createAssetAction} encType="multipart/form-data" className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Activos
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Nuevo activo</h2>
              <p className="mt-2 text-sm text-muted">
                Los campos con sugerencias aceptan valores nuevos y los guardan para futuros activos.
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
            <AssetInput
              label="AF"
              name="af"
              placeholder="AF-0001"
              required
              uppercase
            />
            <AssetInput
              label="Patente"
              name="patente"
              placeholder="ABCD12"
              required
              uppercase
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva. Se guardará para futuros activos."
              label="Tipo"
              listId="asset-tipo-options"
              name="tipo"
              placeholder="Camioneta"
              required
              suggestions={catalogOptions.tipo}
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva. Se guardará para futuros activos."
              label="Marca"
              listId="asset-marca-options"
              name="marca"
              placeholder="Toyota"
              required
              suggestions={catalogOptions.marca}
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva. Se guardará para futuros activos."
              label="Modelo"
              listId="asset-modelo-options"
              name="modelo"
              placeholder="Hilux"
              required
              suggestions={catalogOptions.modelo}
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva. Se guardará para futuros activos."
              label="Año"
              listId="asset-anio-options"
              name="anio"
              placeholder="2026"
              required
              suggestions={yearSuggestions}
              inputMode="numeric"
              maxLength={4}
            />
            <AssetInput
              helperText="Selecciona una opción existente o escribe una nueva. Se guardará para futuros activos."
              label="Centro de Costos"
              listId="asset-centro-costos-options"
              name="centro_costos"
              placeholder="Operaciones"
              required
              suggestions={catalogOptions.centro_costos}
            />
            <AssetInput label="ID GPS" name="id_gps" placeholder="GPS-001" />
            <label className="block">
              <span className="text-sm font-medium">Horometro</span>
              <input
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                inputMode="decimal"
                min={0}
                name="horometro"
                placeholder="0"
                step="0.01"
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Kilometraje</span>
              <input
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
                inputMode="decimal"
                min={0}
                name="kilometraje"
                placeholder="0"
                step="0.01"
                type="number"
              />
            </label>
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

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel"
              onClick={closeAssetModal}
              type="button"
            >
              Cancelar
            </button>
            <PendingButton
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
              pendingLabel="Guardando..."
              type="submit"
            >
              Guardar activo
            </PendingButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}

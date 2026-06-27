"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatAssetNumericValue } from "@/lib/activos";
import type { Asset } from "@/types/activos";

type ActivoFichaContentProps = {
  asset: Asset | null;
  backHref: string;
};

type AssetTabKey = "informacion" | "documentacion";

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

export function ActivoFichaContent({ asset, backHref }: ActivoFichaContentProps) {
  const [activeTab, setActiveTab] = useState<AssetTabKey>("informacion");

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

        <Link
          href={backHref}
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
        >
          Volver al listado
        </Link>
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
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-dashed border-line/80 bg-panel/20 p-6 text-sm text-muted">
            Sin documentación cargada por el momento.
          </div>
        </section>
      )}
    </section>
  );
}

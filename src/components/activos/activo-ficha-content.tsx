import Image from "next/image";
import Link from "next/link";

import type { Asset } from "@/types/activos";
import { formatAssetNumericValue } from "@/lib/activos";

type ActivoFichaContentProps = {
  asset: Asset | null;
  backHref: string;
};

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

export function ActivoFichaContent({ asset, backHref }: ActivoFichaContentProps) {
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
            {asset.af} - {asset.patente}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {asset.tipo} · {asset.marca} · {asset.modelo}
          </p>
        </div>

        <Link
          href={backHref}
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
        >
          Volver al listado
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-line bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="AF" value={asset.af} />
            <InfoCard label="Patente" value={asset.patente} />
            <InfoCard label="Tipo" value={asset.tipo} />
            <InfoCard label="Marca" value={asset.marca} />
            <InfoCard label="Modelo" value={asset.modelo} />
            <InfoCard label="Año" value={asset.anio} />
            <InfoCard label="Centro de Costos" value={asset.centro_costos} />
            <InfoCard label="ID GPS" value={asset.id_gps ?? "-"} />
            <InfoCard label="Horometro" value={formatAssetNumericValue(asset.horometro)} />
            <InfoCard
              label="Kilometraje"
              value={formatAssetNumericValue(asset.kilometraje)}
            />
            <InfoCard label="Tiene imagen" value={asset.image_url ? "Sí" : "No"} />
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-[2rem] border border-line bg-white p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Imagen
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Vista previa</h3>
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

          <section className="rounded-[2rem] border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Archivo
            </p>
            <div className="mt-3 grid gap-4">
              <InfoCard label="Dropbox" value={asset.image_dropbox_path ?? "-"} />
              <InfoCard label="Creado" value={asset.created_at.slice(0, 19).replace("T", " ")} />
              <InfoCard
                label="Actualizado"
                value={asset.updated_at.slice(0, 19).replace("T", " ")}
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

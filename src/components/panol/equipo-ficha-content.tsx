"use client";

import Image from "next/image";
import Link from "next/link";

import type { EquipmentDetail } from "@/types/equipos";

type EquipoFichaContentProps = {
  detail: EquipmentDetail | null;
  backHref: string;
};

export function EquipoFichaContent({ detail, backHref }: EquipoFichaContentProps) {
  if (!detail) {
    return (
      <section className="rounded-[2rem] border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Ficha de Equipo
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              No hay un equipo seleccionado
            </h2>
            <p className="mt-2 text-sm text-muted">
              Selecciona una fila del listado para ver el detalle del equipo.
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
            Ficha de Equipo
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {detail.equipment.descripcion}
          </h2>
          <p className="mt-2 text-sm text-muted">{detail.equipment.codigo}</p>
        </div>

        <Link
          href={backHref}
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-panel"
        >
          Volver al listado
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-line bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Grupo</p>
              <p className="mt-2 font-semibold text-foreground">
                {detail.group
                  ? `${detail.group.codigo} - ${detail.group.descripcion}`
                  : "Sin grupo"}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Nro. serie</p>
              <p className="mt-2 font-semibold text-foreground">
                {detail.equipment.nro_serie ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Cantidad</p>
              <p className="mt-2 font-semibold text-foreground">
                {detail.equipment.cantidad}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Estado</p>
              <p className="mt-2 font-semibold text-foreground">
                {detail.equipment.estado ?? "Sin estado"}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Marca</p>
              <p className="mt-2 font-semibold text-foreground">
                {detail.equipment.marca ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Modelo</p>
              <p className="mt-2 font-semibold text-foreground">
                {detail.equipment.modelo ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Tiene</p>
              <p className="mt-2 font-semibold text-foreground">{detail.current_holder_label}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Imagen
          </p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-panel/10">
            {detail.equipment.image_url ? (
              <Image
                alt={detail.equipment.descripcion}
                className="h-auto w-full object-cover"
                height={640}
                src={detail.equipment.image_url}
                unoptimized
                width={960}
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center px-6 py-10 text-sm text-muted">
                No hay imagen registrada.
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-[2rem] border border-line bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Historial de uso
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              Quién ha utilizado el equipo
            </h3>
          </div>
          <p className="text-sm text-muted">
            {detail.history.length} movimiento{detail.history.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-muted">
                <th className="border-b border-line/70 pb-3 pr-4 font-semibold">Fecha</th>
                <th className="border-b border-line/70 pb-3 pr-4 font-semibold">Origen</th>
                <th className="border-b border-line/70 pb-3 pr-4 font-semibold">Destino</th>
                <th className="border-b border-line/70 pb-3 font-semibold">Uso</th>
              </tr>
            </thead>
            <tbody>
              {detail.history.length > 0 ? (
                detail.history.map((entry) => (
                  <tr key={entry.transfer_id} className="border-b border-line/60">
                    <td className="py-3 pr-4 text-sm font-semibold text-foreground">
                      {entry.transfer_date} {entry.transfer_time}
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted">{entry.origin_label}</td>
                    <td className="py-3 pr-4 text-sm text-muted">{entry.destination_label}</td>
                    <td className="py-3 text-sm text-foreground">{entry.movement_label}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-8 text-sm text-muted" colSpan={4}>
                    No hay movimientos registrados para este equipo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

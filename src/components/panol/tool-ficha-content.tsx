"use client";

import Link from "next/link";
import Image from "next/image";

import type { ToolDetail } from "@/types/panol";

type ToolFichaContentProps = {
  detail: ToolDetail | null;
  backHref: string;
};

function getLocationLabel(detail: ToolDetail) {
  if (!detail.location) {
    return "PAÃ‘OL";
  }

  return detail.location.is_default ? "PAÃ‘OL" : detail.location.nombre;
}

function getEmployeeLabel(employeeName: string | null) {
  return employeeName?.trim() || "Sin asignar";
}

export function ToolFichaContent({ detail, backHref }: ToolFichaContentProps) {
  if (!detail) {
    return (
      <section className="rounded-[2rem] border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Ficha Herramienta
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              No hay una herramienta seleccionada
            </h2>
            <p className="mt-2 text-sm text-muted">
              Selecciona una fila del listado para ver el detalle de la herramienta.
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

  const assignedPercentage =
    detail.tool.cantidad > 0
      ? Math.min(Math.round((detail.assigned_quantity / detail.tool.cantidad) * 100), 100)
      : 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Ficha Herramienta
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{detail.tool.descripcion}</h2>
          <p className="mt-2 text-sm text-muted">{detail.tool.codigo}</p>
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
                {detail.group ? `${detail.group.codigo} - ${detail.group.descripcion}` : "Sin grupo"}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Ubicación</p>
              <p className="mt-2 font-semibold text-foreground">{getLocationLabel(detail)}</p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Cantidad total</p>
              <p className="mt-2 font-semibold text-foreground">
                {detail.tool.cantidad} {detail.tool.unidad}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Estado</p>
              <p className="mt-2 font-semibold text-foreground">
                {detail.tool.estado ?? "Sin estado"}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Marca</p>
              <p className="mt-2 font-semibold text-foreground">{detail.tool.marca ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Modelo</p>
              <p className="mt-2 font-semibold text-foreground">{detail.tool.modelo ?? "-"}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-line/70 bg-panel/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Asignación de unidades
              </p>
              <p className="text-sm text-muted">
                {detail.assigned_quantity} asignada{detail.assigned_quantity === 1 ? "" : "s"} de{" "}
                {detail.tool.cantidad}
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line/50">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${assignedPercentage}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
              <span className="rounded-full border border-line bg-white px-3 py-1">
                Disponibles: {detail.unassigned_quantity}
              </span>
              <span className="rounded-full border border-line bg-white px-3 py-1">
                Asignadas: {detail.assigned_quantity}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Imagen
          </p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-panel/10">
            {detail.tool.image_url ? (
              <Image
                alt={detail.tool.descripcion}
                className="h-auto w-full object-cover"
                height={640}
                src={detail.tool.image_url}
                unoptimized
                width={960}
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center px-6 py-10 text-sm text-muted">
                No hay imagen registrada.
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {detail.custom_field_values.length > 0 ? (
              detail.custom_field_values.map((field) => (
                <div
                  key={field.id}
                  className="rounded-2xl border border-line/70 bg-panel/20 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    {field.codigo}
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{field.nombre}</p>
                  <p className="mt-1 text-sm text-muted">{field.value_text ?? "-"}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-line/70 bg-panel/20 p-4 text-sm text-muted sm:col-span-2">
                No hay campos personalizados cargados para esta herramienta.
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-[2rem] border border-line bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Detalle por unidad
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              Quién tiene cada unidad
            </h3>
          </div>
          <p className="text-sm text-muted">
            {detail.units.length} unidad{detail.units.length === 1 ? "" : "es"} listada{detail.units.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-muted">
                <th className="border-b border-line/70 pb-3 pr-4 font-semibold">Unidad</th>
                <th className="border-b border-line/70 pb-3 pr-4 font-semibold">Asignada a</th>
                <th className="border-b border-line/70 pb-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {detail.units.map((unit) => {
                const isAssigned = unit.employee_id !== null;

                return (
                  <tr key={`${unit.allocation_id ?? "free"}-${unit.unit_number}`} className="border-b border-line/60">
                    <td className="py-3 pr-4 font-semibold text-foreground">
                      Unidad {unit.unit_number}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {getEmployeeLabel(unit.employee_name)}
                    </td>
                    <td className="py-3">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          isAssigned
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-amber-200 bg-amber-50 text-amber-700",
                        ].join(" ")}
                      >
                        {isAssigned ? "Asignada" : "Disponible"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

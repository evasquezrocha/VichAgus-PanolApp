"use client";

import Link from "next/link";

import type { EmployeeDetail } from "@/types/empleados";

type EmployeeFichaContentProps = {
  detail: EmployeeDetail | null;
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

export function EmployeeFichaContent({ detail, backHref }: EmployeeFichaContentProps) {
  if (!detail) {
    return (
      <section className="rounded-[2rem] border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Ficha de empleado
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              No hay un empleado seleccionado
            </h2>
            <p className="mt-2 text-sm text-muted">
              Selecciona una fila del listado para ver el detalle del empleado.
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
            Ficha de empleado
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {`${detail.employee.nombres} ${detail.employee.apellidos}`.trim()}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {detail.employee.rut} · {detail.employee_company_name}
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
            <InfoCard label="RUT" value={detail.employee.rut} />
            <InfoCard label="Empresa" value={detail.employee_company_name} />
            <InfoCard
              label="Nombres"
              value={detail.employee.nombres}
            />
            <InfoCard
              label="Apellidos"
              value={detail.employee.apellidos}
            />
            <InfoCard label="Email" value={detail.employee.email ?? "-"} />
            <InfoCard label="Teléfono" value={detail.employee.telefono ?? "-"} />
            <InfoCard label="Estado" value={detail.employee.is_active ? "Activo" : "Inactivo"} />
            <InfoCard label="Total equipos" value={detail.equipment_count} />
            <div className="rounded-2xl border border-line/70 bg-panel/20 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Resumen</p>
              <p className="mt-2 text-sm text-foreground">
                Este empleado tiene {detail.equipment_count} equipo
                {detail.equipment_count === 1 ? "" : "s"} y {detail.tool_quantity} herramienta
                {detail.tool_quantity === 1 ? "" : "s"} asignada
                {detail.tool_quantity === 1 ? "" : "s"} actualmente.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-[2rem] border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                  Equipos actuales
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">Asignados</h3>
              </div>
              <p className="text-sm text-muted">
                {detail.equipment_count} item{detail.equipment_count === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {detail.equipments.length > 0 ? (
                detail.equipments.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line/70 bg-panel/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.codigo} - {item.descripcion}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {item.group_codigo ? `${item.group_codigo} - ` : ""}
                          {item.group_descripcion ?? "Sin grupo"}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          Serie: {item.nro_serie ?? "-"} · Estado: {item.estado ?? "Sin estado"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#2b3a44]/10 px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                        {item.assigned_at.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
                  No tiene equipos asignados actualmente.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                  Herramientas actuales
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">Asignadas</h3>
              </div>
              <p className="text-sm text-muted">{detail.tool_quantity} unidad{detail.tool_quantity === 1 ? "" : "es"}</p>
            </div>

            <div className="mt-4 space-y-3">
              {detail.tools.length > 0 ? (
                detail.tools.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line/70 bg-panel/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.codigo} - {item.descripcion}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {item.cantidad} {item.unidad}
                          {item.marca ? ` · ${item.marca}` : ""}
                          {item.modelo ? ` · ${item.modelo}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-muted">Estado: {item.estado ?? "Sin estado"}</p>
                      </div>
                      <span className="rounded-full bg-[#2b3a44]/10 px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                        {item.assigned_at.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
                  No tiene herramientas asignadas actualmente.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                  Historial de traspasos
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">Movimientos</h3>
              </div>
              <p className="text-sm text-muted">
                {detail.history.length} movimiento{detail.history.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {detail.history.length > 0 ? (
                detail.history.map((entry) => (
                  <Link
                    key={entry.transfer_id}
                    href={`/company/panol/traspasos/${entry.transfer_id}`}
                    className="block rounded-2xl border border-line/70 bg-panel/20 p-4 transition hover:border-accent/40 hover:bg-panel"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          Traspaso #{String(entry.transfer_number).padStart(6, "0")} ·{" "}
                          {entry.direction === "outgoing" ? "Salida" : "Ingreso"}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {entry.transfer_date} {entry.transfer_time}
                        </p>
                        <p className="mt-1 text-sm text-muted">{entry.counterpart_label}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                          {entry.item_count} item{entry.item_count === 1 ? "" : "s"}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                          {entry.equipment_count} equipo{entry.equipment_count === 1 ? "" : "s"}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2b3a44]">
                          {entry.tool_quantity} herramienta{entry.tool_quantity === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
                  No hay traspasos registrados para este empleado.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

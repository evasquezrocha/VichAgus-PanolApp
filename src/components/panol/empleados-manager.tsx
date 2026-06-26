"use client";

import {
  createEmployeeAction,
  deleteEmployeeAction,
  updateEmployeeAction,
} from "@/actions/empleados.actions";
import { EmployeeFichaContent } from "@/components/panol/empleado-ficha-content";
import { PendingButton } from "@/components/ui/pending-button";
import type { Employee, EmployeeCompany, EmployeeDetail } from "@/types/empleados";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type EmployeesManagerProps = {
  activeTab: "empleados" | "ficha-empleado";
  employeeCompanies: EmployeeCompany[];
  employees: Employee[];
  selectedEmployeeDetail: EmployeeDetail | null;
  selectedEmployeeId: string | null;
};

type EmployeeModalState =
  | { mode: "create" }
  | { mode: "edit"; employee: Employee };

type SortKey = "rut" | "nombres" | "apellidos" | "empresa" | "email" | "telefono" | "activo";
type SortDirection = "asc" | "desc";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </svg>
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

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <span className="ml-1 inline-flex flex-col leading-none text-[9px] opacity-70">
      <span className={direction === "asc" ? "text-foreground" : ""}>▲</span>
      <span className={direction === "desc" ? "text-foreground" : ""}>▼</span>
    </span>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "company-tab-link rounded-full border border-line px-5 py-3 text-sm font-semibold transition",
      ].join(" ")}
      data-active={active ? "true" : "false"}
    >
      {children}
    </Link>
  );
}

function EmployeeFormFields({
  employee,
  employeeCompanies,
}: {
  employee?: Employee | null;
  employeeCompanies: EmployeeCompany[];
}) {
  const companyName = employee
    ? employeeCompanies.find((item) => item.id === employee.employee_company_id)?.nombre ?? ""
    : "";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className="text-sm font-medium">RUT</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 uppercase outline-none ring-accent/25 transition focus:ring-4"
          defaultValue={employee?.rut ?? ""}
          name="rut"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">EMPRESA</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          defaultValue={companyName}
          list="employee-company-options"
          name="empresa"
          placeholder="Escribe o selecciona una empresa"
          required
        />
        <datalist id="employee-company-options">
          {employeeCompanies.map((company) => (
            <option key={company.id} value={company.nombre} />
          ))}
        </datalist>
      </label>
      <label className="block">
        <span className="text-sm font-medium">NOMBRES</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          defaultValue={employee?.nombres ?? ""}
          name="nombres"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">APELLIDOS</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          defaultValue={employee?.apellidos ?? ""}
          name="apellidos"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">EMAIL</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          defaultValue={employee?.email ?? ""}
          name="email"
          type="email"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">TELEFONO</span>
        <input
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none ring-accent/25 transition focus:ring-4"
          defaultValue={employee?.telefono ?? ""}
          name="telefono"
        />
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 md:col-span-2">
        <input name="is_active" type="hidden" value="false" />
        <input
          className="h-4 w-4 accent-[#2b3a44]"
          defaultChecked={employee?.is_active ?? true}
          name="is_active"
          type="checkbox"
          value="true"
        />
        <span className="text-sm font-medium">Activo</span>
      </label>
    </div>
  );
}

export function EmployeesManager({
  activeTab,
  employeeCompanies,
  employees,
  selectedEmployeeDetail,
  selectedEmployeeId,
}: EmployeesManagerProps) {
  const [modalState, setModalState] = useState<EmployeeModalState | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("apellidos");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (modalState && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!modalState && dialog.open) {
      dialog.close();
    }
  }, [modalState]);

  const companyById = useMemo(
    () => new Map(employeeCompanies.map((item) => [item.id, item])),
    [employeeCompanies],
  );

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return employees;
    }

    return employees.filter((employee) => {
      const company = companyById.get(employee.employee_company_id);
      const haystack = [
        employee.rut,
        employee.nombres,
        employee.apellidos,
        employee.email ?? "",
        employee.telefono ?? "",
        company?.nombre ?? "",
        employee.is_active ? "activo" : "inactivo",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [companyById, employees, search]);

  const sortedEmployees = useMemo(() => {
    const getComparableValue = (employee: Employee) => {
      const company = companyById.get(employee.employee_company_id);

      switch (sortKey) {
        case "rut":
          return employee.rut;
        case "nombres":
          return employee.nombres;
        case "apellidos":
          return employee.apellidos;
        case "empresa":
          return company?.nombre ?? "";
        case "email":
          return employee.email ?? "";
        case "telefono":
          return employee.telefono ?? "";
        case "activo":
          return employee.is_active ? "Activo" : "Inactivo";
      }
    };

    const sorted = [...filteredEmployees].sort((left, right) => {
      const a = getComparableValue(left);
      const b = getComparableValue(right);

      return String(a).localeCompare(String(b), "es", {
        sensitivity: "base",
        numeric: true,
      });
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [companyById, filteredEmployees, sortDirection, sortKey]);

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

  const modalEmployee = modalState?.mode === "edit" ? modalState.employee : null;
  const isEditing = modalState?.mode === "edit";

  function openCreateModal() {
    setModalState({ mode: "create" });
  }

  function openEditModal(employee: Employee) {
    setModalState({ mode: "edit", employee });
  }

  function closeModal() {
    setModalState(null);
  }

  function openEmployeeDetail(employeeId: string) {
    router.push(
      `/company/panol/empleados?tab=ficha-empleado&employeeId=${encodeURIComponent(employeeId)}`,
    );
  }

  return (
    <section className="space-y-6 rounded-[1.75rem] border border-line bg-white/60 p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <TabLink href="/company/panol/empleados?tab=empleados" active={activeTab === "empleados"}>
          Listado de empleados
        </TabLink>
        <TabLink
          href={
            selectedEmployeeId
              ? `/company/panol/empleados?tab=ficha-empleado&employeeId=${encodeURIComponent(selectedEmployeeId)}`
              : "/company/panol/empleados?tab=ficha-empleado"
          }
          active={activeTab === "ficha-empleado"}
        >
          Ficha de empleado
        </TabLink>
      </div>

      {activeTab === "empleados" ? (
        <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Empleados
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Gestión de empleados
          </h1>
          <p className="mt-2 text-sm text-muted">
            {sortedEmployees.length} empleado{sortedEmployees.length === 1 ? "" : "s"} visible
            {sortedEmployees.length === 1 ? "" : "s"} de {employees.length}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="block">
            <span className="sr-only">Buscar empleado</span>
            <input
              className="w-full rounded-full border border-line bg-white px-4 py-3 text-sm outline-none ring-accent/25 transition focus:ring-4 sm:w-[20rem]"
              placeholder="Buscar por RUT, nombre, empresa, email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button
            className="rounded-full bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong"
            onClick={openCreateModal}
            type="button"
          >
            Agregar empleado
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <colgroup>
            <col className="w-28" />
            <col className="w-40" />
            <col className="w-44" />
            <col className="w-44" />
            <col className="w-24" />
            <col className="w-40" />
            <col className="w-32" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.2em] text-muted">
              <th className="pb-2 pr-2 font-semibold">
                <button className="inline-flex items-center font-semibold" onClick={() => toggleSort("rut")} type="button">
                  RUT
                  <SortIcon direction={getSortDirectionForKey("rut")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button className="inline-flex items-center font-semibold" onClick={() => toggleSort("nombres")} type="button">
                  Nombres
                  <SortIcon direction={getSortDirectionForKey("nombres")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button className="inline-flex items-center font-semibold" onClick={() => toggleSort("apellidos")} type="button">
                  Apellidos
                  <SortIcon direction={getSortDirectionForKey("apellidos")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button className="inline-flex items-center font-semibold" onClick={() => toggleSort("empresa")} type="button">
                  Empresa
                  <SortIcon direction={getSortDirectionForKey("empresa")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button className="inline-flex items-center font-semibold" onClick={() => toggleSort("activo")} type="button">
                  Activo
                  <SortIcon direction={getSortDirectionForKey("activo")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button className="inline-flex items-center font-semibold" onClick={() => toggleSort("email")} type="button">
                  Email
                  <SortIcon direction={getSortDirectionForKey("email")} />
                </button>
              </th>
              <th className="pb-2 pr-2 font-semibold">
                <button className="inline-flex items-center font-semibold" onClick={() => toggleSort("telefono")} type="button">
                  Teléfono
                  <SortIcon direction={getSortDirectionForKey("telefono")} />
                </button>
              </th>
              <th className="pb-2 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((employee) => {
              const company = companyById.get(employee.employee_company_id);

              return (
                <tr
                  key={employee.id}
                  className={[
                    "border-b border-line/60 align-top transition",
                    "cursor-pointer hover:bg-panel/40",
                    selectedEmployeeId === employee.id ? "bg-accent/5" : "",
                  ].join(" ")}
                  onClick={() => openEmployeeDetail(employee.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openEmployeeDetail(employee.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <td className="py-2 pr-2 align-middle font-semibold text-foreground">{employee.rut}</td>
                  <td className="py-2 pr-2 align-middle text-muted">{employee.nombres}</td>
                  <td className="py-2 pr-2 align-middle text-muted">{employee.apellidos}</td>
                  <td className="py-2 pr-2 align-middle text-muted">{company?.nombre ?? "-"}</td>
                  <td className="py-2 pr-2 align-middle text-muted">
                    <span
                      className={[
                        "rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                        employee.is_active ? "bg-[#52D6A4]/18 text-[#20513f]" : "bg-stone-200 text-stone-700",
                      ].join(" ")}
                    >
                      {employee.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-2 pr-2 align-middle text-muted">{employee.email ?? "-"}</td>
                  <td className="py-2 pr-2 align-middle text-muted">{employee.telefono ?? "-"}</td>
                  <td className="py-2 align-middle">
                    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-foreground transition hover:bg-panel"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditModal(employee);
                        }}
                        title="Editar"
                        type="button"
                      >
                        <EditIcon />
                      </button>
                      <form
                        action={deleteEmployeeAction}
                        onClick={(event) => event.stopPropagation()}
                        onSubmit={(event) => {
                          if (!window.confirm("¿Eliminar este empleado?")) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input name="employee_id" type="hidden" value={employee.id} />
                        <PendingButton
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                          title="Eliminar"
                          pendingLabel=""
                          type="submit"
                        >
                          <TrashIcon />
                        </PendingButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}

            {sortedEmployees.length === 0 ? (
              <tr>
                <td className="py-10 text-center text-muted" colSpan={8}>
                  No hay empleados que coincidan con la búsqueda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

        </>
      ) : null}

      {activeTab === "ficha-empleado" ? (
        <EmployeeFichaContent
          backHref="/company/panol/empleados?tab=empleados"
          detail={selectedEmployeeDetail}
        />
      ) : null}

      <dialog
        ref={dialogRef}
        className="company-popup-surface fixed left-1/2 top-1/2 z-50 m-0 max-h-[calc(100vh-2rem)] w-[min(52rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-line p-0 shadow-2xl shadow-black/25 backdrop:bg-black/50"
        onCancel={closeModal}
        onClose={closeModal}
      >
        <form
          action={isEditing ? updateEmployeeAction : createEmployeeAction}
          key={modalEmployee?.id ?? "create"}
          className="p-6 md:p-8"
        >
          <input name="employee_id" type="hidden" value={modalEmployee?.id ?? ""} />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Formulario
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {isEditing ? "Editar empleado" : "Agregar empleado"}
              </h2>
            </div>
            <button
              aria-label="Cerrar formulario"
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-panel"
              onClick={closeModal}
              type="button"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-6">
            <EmployeeFormFields employee={modalEmployee} employeeCompanies={employeeCompanies} />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              className="rounded-full border border-line bg-white px-5 py-3 font-semibold text-foreground transition hover:bg-panel"
              onClick={closeModal}
              type="button"
            >
              Cancelar
            </button>
            <PendingButton
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-strong"
              pendingLabel={isEditing ? "Guardando..." : "Guardando..."}
              type="submit"
            >
              {isEditing ? "Guardar cambios" : "Guardar empleado"}
            </PendingButton>
          </div>
        </form>
      </dialog>
    </section>
  );
}
